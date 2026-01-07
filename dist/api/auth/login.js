"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
exports.logout = logout;
exports.getCurrentUser = getCurrentUser;
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_1 = require("../db");
const middleware_1 = require("./middleware");
/**
 * POST /api/auth/login
 * Authenticate client user and return JWT token
 */
async function login(req, res) {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({
                success: false,
                error: 'Email and password are required',
            });
            return;
        }
        // Find user by email
        const result = await (0, db_1.query)(`SELECT 
        cu.id,
        cu.tenant_id,
        cu.email,
        cu.password_hash,
        cu.role,
        cu.active,
        t.name as tenant_name,
        t.subscription_status
      FROM client_users cu
      JOIN tenants t ON t.id = cu.tenant_id
      WHERE cu.email = $1`, [email]);
        if (result.rows.length === 0) {
            res.status(401).json({
                success: false,
                error: 'Invalid email or password',
            });
            return;
        }
        const user = result.rows[0];
        // Check if user is active
        if (!user.active) {
            res.status(403).json({
                success: false,
                error: 'Account is disabled',
            });
            return;
        }
        // Verify password
        const validPassword = await bcrypt_1.default.compare(password, user.password_hash);
        if (!validPassword) {
            res.status(401).json({
                success: false,
                error: 'Invalid email or password',
            });
            return;
        }
        // Update last login
        await (0, db_1.query)('UPDATE client_users SET last_login = NOW() WHERE id = $1', [user.id]);
        // Generate JWT token
        const token = (0, middleware_1.generateToken)({
            userId: user.id,
            tenantId: user.tenant_id,
            email: user.email,
            role: user.role,
        });
        // Set token as httpOnly cookie (more secure than localStorage)
        res.cookie('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // HTTPS only in production
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
        res.json({
            success: true,
            token, // Also send in response for mobile/non-browser clients
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                tenantId: user.tenant_id,
                tenantName: user.tenant_name,
                subscriptionStatus: user.subscription_status,
            },
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
}
/**
 * POST /api/auth/logout
 * Clear authentication cookie
 */
async function logout(req, res) {
    res.clearCookie('auth_token');
    res.json({
        success: true,
        message: 'Logged out successfully',
    });
}
/**
 * GET /api/auth/me
 * Get current authenticated user info
 */
async function getCurrentUser(req, res) {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({
                success: false,
                error: 'Not authenticated',
            });
            return;
        }
        // Fetch fresh user data
        const result = await (0, db_1.query)(`SELECT 
        cu.id,
        cu.email,
        cu.name,
        cu.role,
        cu.tenant_id,
        t.name as tenant_name,
        t.subscription_status
      FROM client_users cu
      JOIN tenants t ON t.id = cu.tenant_id
      WHERE cu.id = $1 AND cu.active = TRUE`, [user.userId]);
        if (result.rows.length === 0) {
            res.status(404).json({
                success: false,
                error: 'User not found',
            });
            return;
        }
        const userData = result.rows[0];
        res.json({
            success: true,
            user: {
                id: userData.id,
                email: userData.email,
                name: userData.name,
                role: userData.role,
                tenantId: userData.tenant_id,
                tenantName: userData.tenant_name,
                subscriptionStatus: userData.subscription_status,
            },
        });
    }
    catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
        });
    }
}
