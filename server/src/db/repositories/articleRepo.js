import path from "node:path";
import { JsonStore } from "../jsonStore.js";
import { config } from "../../config/index.js";

export class ArticleRepo {
    constructor(store) {
        this.store = store;
    }
    static async create() {
        return new ArticleRepo(new JsonStore(path.join(config.dataDir, "articles.json")));
    }
    list() {
        return this.store.all();
    }
    listByCourse(courseSlug) {
        return this.store.filter((a) => a.courseSlug === courseSlug);
    }
    findBySlug(slug) {
        return this.store.find((a) => a.slug === slug);
    }
}
