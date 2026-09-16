import express from "express";
import cors from "cors";
import { createDb } from "./db/index.js";
import { authRoutes } from "./routes/auth.js";
import { articleRoutes } from "./routes/articles.js";
import { testRoutes } from "./routes/tests.js";
import { progressRoutes } from "./routes/progress.js";
import { errorHandler } from "./middleware/error.js";

export async function createApp() {
    const app = express();
    const db = await createDb();

    app.use(cors());
    app.use(express.json({ limit: "1mb" }));

    app.use("/api/auth", authRoutes(db));
    app.use("/api/articles", articleRoutes(db));
    app.use("/api/tests", testRoutes(db));
    app.use("/api/progress", progressRoutes(db));

    app.use(errorHandler);
    app.locals.db = db;
    return app;
}
