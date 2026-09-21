import path from "node:path";
import { v4 as uuid } from "uuid";
import { JsonStore } from "../jsonStore.js";
import { config } from "../../config/index.js";

export class AttemptRepo {
    constructor(store) {
        this.store = store;
    }
    static async create() {
        const store = new JsonStore(path.join(config.dataDir, "attempts.json"));
        await store.init();
        return new AttemptRepo(store);
    }
    listByUser(userId) {
        return this.store.filter((a) => a.userId === userId);
    }

    async create({ userId, testId, answers, score, maxScore }) {
        return this.store.insert({
            id: uuid(),
            userId,
            testId,
            answers,
            score,
            maxScore,
            createdAt: new Date().toISOString(),
        });
    }
}
