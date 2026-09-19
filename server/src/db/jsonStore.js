import fs from "node:fs/promises";
import path from "node:path";

export class JsonStore {
    constructor(filePath) {
        this.filePath = filePath;
        this.cache = null;
        this.writeQueue = Promise.resolve();
    }

        async init() {
        await fs.mkdir(path.dirname(this.filePath), { recursive: true });
        try {
            await fs.access(this.filePath);
        } catch (err) {
            if (err.code !== "ENOENT") throw err;
            await fs.writeFile(this.filePath, "[]\n");
        }
        await this._load();
        return this;
    }

    async _load() {
        if (this.cache) return this.cache;
        try {
            const raw = await fs.readFile(this.filePath, "utf8");
            this.cache = JSON.parse(raw);
        } catch (err) {
            if (err.code === "ENOENT") this.cache = [];
            else throw err;
        }
        return this.cache;
    }

    _persist() {
        this.writeQueue = this.writeQueue.then(async () => {
            await fs.mkdir(path.dirname(this.filePath), { recursive: true });
            await fs.writeFile(this.filePath, JSON.stringify(this.cache, null, 2));
        });
        return this.writeQueue;
    }

    async all() {
        return [...(await this._load())];
    }
    async find(pred) {
        return (await this._load()).find(pred) ?? null;
    }
    async filter(pred) {
        return (await this._load()).filter(pred);
    }

    async insert(doc) {
        const list = await this._load();
        list.push(doc);
        await this._persist();
        return doc;
    }

    async update(pred, patch) {
        const list = await this._load();
        const idx = list.findIndex(pred);
        if (idx === -1) return null;
        list[idx] = { ...list[idx], ...patch };
        await this._persist();
        return list[idx];
    }
}
