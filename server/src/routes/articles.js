import { Router } from "express";

export function articleRoutes(db) {
    const router = Router();

    router.get("/", async (req, res) => {
        const { course } = req.query;
        res.json(course ? await db.articles.listByCourse(course) : await db.articles.list());
    });

    router.get("/:slug", async (req, res) => {
        const article = await db.articles.findBySlug(req.params.slug);
        if (!article) return res.status(404).json({ error: "Not found" });
        res.json(article);
    });

    return router;
}
