import jwt from "jsonwebtoken";
import { config } from "../config/index.js";

function extract(req) {
    const header = req.headers.authorization || "";
    return header.startsWith("Bearer ") ? header.slice(7) : null;
}

export function authRequired(req, res, next) {
    const token = extract(req);
    if (!token) return res.status(401).json({ error: "No token" });
    try {
        req.user = jwt.verify(token, config.jwtSecret);
        next();
    } catch {
        res.status(401).json({ error: "Invalid token" });
    }
}

export function authOptional(req, res, next) {
    const token = extract(req);
    if (token) {
        try {
            req.user = jwt.verify(token, config.jwtSecret);
        } catch {}
    }
    next();
}
