import { Request, Response } from 'express';
import { query } from './db';

/**
 * Get all clients
 */
export async function getClients(req: Request, res: Response) {
  try {
    // Get clients with their associated data
    const result = await query(`
      SELECT 
        t.id as tenant_id,
        t.name as client_name,
        t.active,
        t.created_at,
        json_agg(
          json_build_object(
            'site_id', s.id,
            'domain', s.domain,
            'button_text', s.settings->>'buttonText',
            'button_color', s.settings->>'buttonColor',
            'white_label', (s.settings->>'whiteLabel')::boolean,
            'locations', (
              SELECT json_agg(
                json_build_object(
                  'location_id', l.id,
                  'name', l.name,
                  'place_id', l.place_id
                )
              )
              FROM locations l
              WHERE l.tenant_id = t.id
            )
          )
        ) as sites
      FROM tenants t
      LEFT JOIN sites s ON s.tenant_id = t.id
      WHERE t.active = TRUE
      GROUP BY t.id, t.name, t.active, t.created_at
      ORDER BY t.created_at DESC
    `);

    res.json({
      success: true,
      clients: result.rows
    });
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch clients'
    });
  }
}

/**
 * Create a new client
 */
export async function createClient(req: Request, res: Response) {
  try {
    const { name, domain, buttonText, buttonColor, whiteLabel, locations } = req.body;

    if (!name || !domain) {
      return res.status(400).json({
        success: false,
        error: 'Client name and domain are required'
      });
    }

    // Generate IDs
    const tenantId = 'tenant_' + name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const siteId = 'site_' + tenantId + '_main';

    // Create tenant
    await query(
      'INSERT INTO tenants (id, name, active) VALUES ($1, $2, TRUE)',
      [tenantId, name]
    );

    // Create site
    await query(
      `INSERT INTO sites (id, tenant_id, domain, settings) 
       VALUES ($1, $2, $3, $4)`,
      [
        siteId,
        tenantId,
        domain,
        JSON.stringify({ buttonText, buttonColor, whiteLabel })
      ]
    );

    // Create locations
    if (locations && Array.isArray(locations)) {
      for (let i = 0; i < locations.length; i++) {
        const loc = locations[i];
        if (loc.name && loc.placeId) {
          const locationId = `loc_${tenantId}_${i}`;
          await query(
            'INSERT INTO locations (id, tenant_id, place_id, name, active) VALUES ($1, $2, $3, $4, TRUE)',
            [locationId, tenantId, loc.placeId, loc.name]
          );
          // Link location to site
          await query(
            'INSERT INTO site_locations (site_id, location_id) VALUES ($1, $2)',
            [siteId, locationId]
          );
        }
      }
    }

    res.status(201).json({
      success: true,
      tenantId,
      siteId
    });
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create client'
    });
  }
}

/**
 * Update a client
 */
export async function updateClient(req: Request, res: Response) {
  try {
    const { tenantId } = req.params;
    const { name, domain, buttonText, buttonColor, whiteLabel, locations } = req.body;

    // Update tenant
    await query(
      'UPDATE tenants SET name = $1 WHERE id = $2',
      [name, tenantId]
    );

    // Update site
    const siteResult = await query(
      'SELECT id FROM sites WHERE tenant_id = $1 LIMIT 1',
      [tenantId]
    );

    if (siteResult.rows.length > 0) {
      const siteId = siteResult.rows[0].id;
      await query(
        `UPDATE sites SET domain = $1, settings = $2 WHERE id = $3`,
        [domain, JSON.stringify({ buttonText, buttonColor, whiteLabel }), siteId]
      );
    }

    // Update locations (delete old, insert new)
    await query('DELETE FROM locations WHERE tenant_id = $1', [tenantId]);
    
    if (locations && Array.isArray(locations)) {
      for (let i = 0; i < locations.length; i++) {
        const loc = locations[i];
        if (loc.name && loc.placeId) {
          const locationId = `loc_${tenantId}_${i}`;
          await query(
            'INSERT INTO locations (id, tenant_id, place_id, name, active) VALUES ($1, $2, $3, $4, TRUE)',
            [locationId, tenantId, loc.placeId, loc.name]
          );
          // Link location to site
          const siteResult = await query(
            'SELECT id FROM sites WHERE tenant_id = $1 LIMIT 1',
            [tenantId]
          );
          if (siteResult.rows.length > 0) {
            await query(
              'INSERT INTO site_locations (site_id, location_id) VALUES ($1, $2)',
              [siteResult.rows[0].id, locationId]
            );
          }
        }
      }
    }

    res.json({
      success: true,
      message: 'Client updated successfully'
    });
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update client'
    });
  }
}

/**
 * Delete a client
 */
export async function deleteClient(req: Request, res: Response) {
  try {
    const { tenantId } = req.params;

    // Cascade delete will handle sites, locations, feedback, events
    await query('DELETE FROM tenants WHERE id = $1', [tenantId]);

    res.json({
      success: true,
      message: 'Client deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete client'
    });
  }
}
