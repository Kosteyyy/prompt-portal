import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import { createDb } from "./db/index.js";
import { authRoutes } from "./routes/auth.js";
import { articleRoutes } from "./routes/articles.js";
import { testRoutes } from "./routes/tests.js";
import { progressRoutes } from "./routes/progress.js";
import { errorHandler } from "./middleware/error.js";
import { courseRoutes } from "./routes/courses.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function createApp() {
    const app = express();
    const db = await createDb();

    app.use(cors());

    // Отдаём только изображения из data/images.
    // Важно: не отдавать всю папку data, иначе утекут users.json, progress.json и т.д.
    app.use(
        "/images",
        express.static(path.join(__dirname, "data", "images"), {
            maxAge: "7d",
        })
    );

    app.use(express.json({ limit: "1mb" }));

    app.use("/api/auth", authRoutes(db));
    app.use("/api/articles", articleRoutes(db));
    app.use("/api/courses", courseRoutes(db));
    app.use("/api/tests", testRoutes(db));
    app.use("/api/progress", progressRoutes(db));

    app.use(errorHandler);
    app.locals.db = db;
    return app;
}
