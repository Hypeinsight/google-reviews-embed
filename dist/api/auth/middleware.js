"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = authenticateToken;
exports.generateToken = generateToken;
exports.requireOwner = requireOwner;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
/**
 * Verify JWT token from cookie or Authorization header
 */
function authenticateToken(req, res, next) {
    try {
        // Try to get token from cookie first, then Authorization header
        let token = req.cookies?.auth_token;
        if (!token) {
            const authHeader = req.headers['authorization'];
            token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
        }
        if (!token) {
            res.status(401).json({
                success: false,
                error: 'Authentication required',
            });
            return;
        }
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            console.error('JWT_SECRET not configured');
            res.status(500).json({
                success: false,
                error: 'Server configuration error',
            });
            return;
        }
        // Verify token
        const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
        // Attach user info to request
        req.user = decoded;
        next();
    }
    catch (error) {
        console.error('Token verification failed:', error);
        res.status(403).json({
            success: false,
            error: 'Invalid or expired token',
        });
    }
}
/**
 * Generate JWT token
 */
function generateToken(payload) {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        throw new Error('JWT_SECRET not configured');
    }
    return jsonwebtoken_1.default.sign(payload, jwtSecret, {
        expiresIn: (process.env.JWT_EXPIRES_IN || '7d'),
    });
}
/**
 * Optional: Middleware to check if user is tenant owner
 */
function requireOwner(req, res, next) {
    if (!req.user) {
        res.status(401).json({
            success: false,
            error: 'Authentication required',
        });
        return;
    }
    if (req.user.role !== 'owner') {
        res.status(403).json({
            success: false,
            error: 'Owner privileges required',
        });
        return;
    }
    next();
}
