import path from "node:path";
import { JsonStore } from "../jsonStore.js";
import { config } from "../../config/index.js";

export class TestRepo {
    constructor(store) {
        this.store = store;
    }
    static async create() {
        return new TestRepo(new JsonStore(path.join(config.dataDir, "tests.json")));
    }
    findById(id) {
        return this.store.find((t) => t.id === id);
    }
    findByCourse(courseSlug) {
        return this.store.find((t) => t.courseSlug === courseSlug);
    }
}
