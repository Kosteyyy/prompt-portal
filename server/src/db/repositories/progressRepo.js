import path from "node:path";
import { v4 as uuid } from "uuid";
import { JsonStore } from "../jsonStore.js";
import { config } from "../../config/index.js";

export class ProgressRepo {
    constructor(store) {
        this.store = store;
    }
    static async create() {
        const store = new JsonStore(path.join(config.dataDir, "progress.json"));
        await store.init();
        return new ProgressRepo(store);
    }
    findByUser(userId) {
        return this.store.filter((p) => p.userId === userId);
    }

    async markArticle(userId, articleSlug) {
        const existing = await this.store.find((p) => p.userId === userId && p.articleSlug === articleSlug);
        if (existing) return existing;
        return this.store.insert({
            id: uuid(),
            userId,
            articleSlug,
            completedAt: new Date().toISOString(),
        });
    }
}
