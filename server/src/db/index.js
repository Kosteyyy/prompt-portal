import { UserRepo } from "./repositories/userRepo.js";
import { ArticleRepo } from "./repositories/articleRepo.js";
import { TestRepo } from "./repositories/testRepo.js";
import { ProgressRepo } from "./repositories/progressRepo.js";
import { AttemptRepo } from "./repositories/attemptRepo.js";
import { CourseRepo } from "./repositories/courseRepo.js";

export async function createDb() {
    // Сменить backend можно здесь: обернуть в switch по config.dbBackend
    const [users, articles, courses, tests, progress, attempts] = await Promise.all([
        UserRepo.create(),
        ArticleRepo.create(),
        CourseRepo.create(),
        TestRepo.create(),
        ProgressRepo.create(),
        AttemptRepo.create(),
    ]);
    return { users, articles, courses, tests, progress, attempts };
}
