import path from "node:path";
import { v4 as uuid } from "uuid";
import { JsonStore } from "../jsonStore.js";
import { config } from "../../config/index.js";

export class UserRepo {
    constructor(store) {
        this.store = store;
    }

    static async create() {
        return new UserRepo(new JsonStore(path.join(config.dataDir, "users.json")));
    }

    findById(id) {
        return this.store.find((u) => u.id === id);
    }
    findByEmail(email) {
        return this.store.find((u) => u.email === email.toLowerCase());
    }

    async create({ email, passwordHash }) {
        const user = {
            id: uuid(),
            email: email.toLowerCase(),
            passwordHash,
            role: "student",
            createdAt: new Date().toISOString(),
        };
        await this.store.insert(user);
        return user;
    }
}
