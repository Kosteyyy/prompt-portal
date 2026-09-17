import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../config/index.js";
import { authRequired } from "../middleware/auth.js";

function sign(user) {
    return jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, config.jwtSecret, {
        expiresIn: "7d",
    });
}
function pub(user) {
    const { passwordHash, password, ...rest } = user;
    return {
        ...rest,
        name: rest.name || rest.email.split("@")[0],
    };
}

export function authRoutes(db) {
    const router = Router();

    router.post("/register", async (req, res, next) => {
        try {
            const { email, password, name } = req.body ?? {};
            if (!email || !password || !name) {
                return res.status(400).json({ error: "Заполните все поля" });
            }
            if (name.trim().length < 2) {
                return res.status(400).json({ error: "Имя слишком короткое" });
            }
            if (await db.users.findByEmail(email)) {
                return res.status(409).json({ error: "Email taken" });
            }
            const passwordHash = await bcrypt.hash(password, 10);
            const user = await db.users.create({ email, passwordHash, name: name.trim() });
            res.json({ token: sign(user), user: pub(user) });
        } catch (e) {
            next(e);
        }
    });

    router.post("/login", async (req, res, next) => {
        try {
            const { email, password } = req.body ?? {};
            const user = await db.users.findByEmail(email);
            if (!user) return res.status(401).json({ error: "Invalid credentials" });
            const ok = await bcrypt.compare(password, user.passwordHash);
            if (!ok) return res.status(401).json({ error: "Invalid credentials" });
            res.json({ token: sign(user), user: pub(user) });
        } catch (e) {
            next(e);
        }
    });

    router.get("/me", authRequired, async (req, res) => {
        const user = await db.users.findById(req.user.id);
        if (!user) return res.status(404).json({ error: "Пользователь не найден" });
        res.json(pub(user));
    });

    return router;
}
