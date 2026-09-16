import { Router } from "express";

export function testRoutes(db) {
    const router = Router();
    router.get("/:id", async (req, res) => {
        const test = await db.tests.findById(req.params.id);
        if (!test) return res.status(404).json({ error: "Not found" });
        res.json(test);
    });
    return router;
}
