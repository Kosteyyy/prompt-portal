import path from "node:path";
import { JsonStore } from "../jsonStore.js";
import { config } from "../../config/index.js";

export class CourseRepo {
    constructor(store) {
        this.store = store;
    }
    static async create() {
        return new CourseRepo(new JsonStore(path.join(config.dataDir, "courses.json")));
    }
    list() {
        return this.store.all();
    }
    findBySlug(slug) {
        return this.store.find((c) => c.slug === slug);
    }
}