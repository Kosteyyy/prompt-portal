import { Router } from "express";

export function courseRoutes(db) {
    const router = Router();

    router.get("/", async (req, res) => {
        res.json(await db.courses.list());
    });

    router.get("/:slug", async (req, res) => {
        const course = await db.courses.findBySlug(req.params.slug);
        if (!course) return res.status(404).json({ error: "Not found" });
        res.json(course);
    });

    return router;
}