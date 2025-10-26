"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTeamUsers = getTeamUsers;
exports.createTeamUser = createTeamUser;
exports.updateTeamUser = updateTeamUser;
exports.deleteTeamUser = deleteTeamUser;
exports.resetPassword = resetPassword;
const db_1 = require("./db");
// Note: Password hashing placeholder - in production use bcrypt
function hashPassword(password) {
    // TODO: Implement bcrypt hashing
    // For now, just return a placeholder hash
    return `$2b$10$${Buffer.from(password).toString('base64')}`;
}
/**
 * Get all team users
 */
async function getTeamUsers(req, res) {
    try {
        const result = await (0, db_1.query)('SELECT id, email, name, role, created_at, last_login, active FROM team_users ORDER BY created_at DESC');
        res.json({
            success: true,
            users: result.rows
        });
    }
    catch (error) {
        console.error('Error fetching team users:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch team users'
        });
    }
}
/**
 * Create a new team user
 */
async function createTeamUser(req, res) {
    try {
        const { email, password, name, role } = req.body;
        if (!email || !password || !name) {
            return res.status(400).json({
                success: false,
                error: 'Email, password, and name are required'
            });
        }
        // Check if user already exists
        const existing = await (0, db_1.query)('SELECT id FROM team_users WHERE email = $1', [email]);
        if (existing.rows.length > 0) {
            return res.status(409).json({
                success: false,
                error: 'User with this email already exists'
            });
        }
        const passwordHash = hashPassword(password);
        const result = await (0, db_1.query)('INSERT INTO team_users (email, password_hash, name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, name, role, created_at', [email, passwordHash, name, role || 'team_member']);
        res.status(201).json({
            success: true,
            user: result.rows[0]
        });
    }
    catch (error) {
        console.error('Error creating team user:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create team user'
        });
    }
}
/**
 * Update a team user
 */
async function updateTeamUser(req, res) {
    try {
        const { id } = req.params;
        const { email, name, role, active } = req.body;
        if (!email || !name) {
            return res.status(400).json({
                success: false,
                error: 'Email and name are required'
            });
        }
        const result = await (0, db_1.query)('UPDATE team_users SET email = $1, name = $2, role = $3, active = $4 WHERE id = $5 RETURNING id, email, name, role, active', [email, name, role || 'team_member', active !== undefined ? active : true, id]);
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        res.json({
            success: true,
            user: result.rows[0]
        });
    }
    catch (error) {
        console.error('Error updating team user:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update team user'
        });
    }
}
/**
 * Delete a team user
 */
async function deleteTeamUser(req, res) {
    try {
        const { id } = req.params;
        const result = await (0, db_1.query)('DELETE FROM team_users WHERE id = $1 RETURNING id', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    }
    catch (error) {
        console.error('Error deleting team user:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete team user'
        });
    }
}
/**
 * Reset user password
 */
async function resetPassword(req, res) {
    try {
        const { id } = req.params;
        const { password } = req.body;
        if (!password) {
            return res.status(400).json({
                success: false,
                error: 'Password is required'
            });
        }
        const passwordHash = hashPassword(password);
        const result = await (0, db_1.query)('UPDATE team_users SET password_hash = $1 WHERE id = $2 RETURNING id', [passwordHash, id]);
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        res.json({
            success: true,
            message: 'Password reset successfully'
        });
    }
    catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to reset password'
        });
    }
}
