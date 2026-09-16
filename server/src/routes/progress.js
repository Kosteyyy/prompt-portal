import { Router } from "express";
import { authRequired } from "../middleware/auth.js";

export function progressRoutes(db) {
    const router = Router();
    router.use(authRequired);

    router.get("/", async (req, res) => {
        const [articles, attempts] = await Promise.all([
            db.progress.findByUser(req.user.id),
            db.attempts.listByUser(req.user.id),
        ]);
        res.json({ articles, attempts });
    });

    router.post("/article/:slug", async (req, res) => {
        const record = await db.progress.markArticle(req.user.id, req.params.slug);
        res.json(record);
    });

    router.post("/test/:id", async (req, res) => {
        const { answers, score, maxScore } = req.body ?? {};
        const attempt = await db.attempts.create({
            userId: req.user.id,
            testId: req.params.id,
            answers,
            score,
            maxScore,
        });
        res.json(attempt);
    });

    return router;
}
