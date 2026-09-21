# DATA_MODEL — Backend (шаг 2)

Хранилище: JSON-файлы в `config.dataDir` (fallback кода `./src/data`,
`server/src/config/index.js:8`; фактически — `server/data/`, ⚠️ inferred по
созданию рантайм-файлов там). Схем/валидации в коде нет — формы ниже выведены
из кода репозиториев и фактических данных в `server/data/`.

## 1. Хранилища (файлы)

| Коллекция | Файл (в `DATA_DIR`) | В репо? | Репозиторий |
|---|---|---|---|
| users | `users.json` | ❌ `.gitignore:26`, создаётся `init()` (`jsonStore.js:11-21`) | UserRepo |
| articles | `articles.json` | ✅ `server/data/` | ArticleRepo |
| courses | `courses.json` | ✅ `server/data/` | CourseRepo |
| tests | `tests.json` | ✅ `server/data/` | TestRepo |
| progress | `progress.json` | ❌ `.gitignore:27`, создаётся `init()` | ProgressRepo |
| attempts | `attempts.json` | ❌ `.gitignore:28`, создаётся `init()` | AttemptRepo |

## 2. Сущности

### User — создаётся кодом (`userRepo.js:24-34`)

| Поле | Тип | Источник |
|---|---|---|
| id | string (uuid v4) | `userRepo.js:26` |
| email | string (lowercase) | `userRepo.js:27` |
| passwordHash | string (bcrypt) | `userRepo.js:28`; хэш в `routes/auth.js:35` |
| role | string, всегда `"student"` | `userRepo.js:29` |
| createdAt | string (ISO 8601) | `userRepo.js:30` |

- ⚠️ inferred: `name` передаётся в `create()` (`routes/auth.js:36`), но не
  сохраняется — поле `name` в User отсутствует (деструктуризация
  `userRepo.js:24`).
- Пример записи: `server/data/users.example.json:2-8`.

### Course — из данных (`server/data/courses.json:2-12`)

| Поле | Тип | Источник |
|---|---|---|
| slug | string | `courses.json:2`; поиск по slug `courseRepo.js:15-16` |
| title | string | `courses.json:3` |
| description | string | `courses.json:4` |
| articles | string[] (slug'и статей) | `courses.json:5-11` |
| testId | string (id теста) | `courses.json:12` |

### Article — из данных (`server/data/articles.json:2-75`)

| Поле | Тип | Источник |
|---|---|---|
| slug | string | `articles.json:3`; поиск `articleRepo.js:18-19` |
| courseSlug | string | `articles.json:4`; фильтр `articleRepo.js:15-16` |
| title | string | `articles.json:5` |
| summary | string | `articles.json:6` |
| testId | string | `articles.json:7` |
| blocks | Block[] | `articles.json:8` |

**Block** — union по полю `type` (все встреченные значения,
`server/data/articles.json`):

| type | Поля | Пример |
|---|---|---|
| `text` | `md: string` | `articles.json:10-12` |
| `image` | `url: string` (путь `/images/...`), `alt: string` | `articles.json:14-17` |
| `exercise` | `config: ExerciseConfig` | `articles.json:23-33` |

### Test — из данных (`server/data/tests.json:2-136`)

| Поле | Тип | Источник |
|---|---|---|
| id | string | `tests.json:3`; поиск `testRepo.js:12-13` |
| title | string | `tests.json:4` |
| courseSlug | string | `tests.json:5` |
| exercises | ExerciseConfig[] | `tests.json:6` |

### ExerciseConfig — union по полю `type` (из `articles.json` и `tests.json`)

Общие поля: `id: string`, `type: string`, `weight: number`, `question: string`,
`explanation: string` (например `articles.json:25-32`).

| type | Спец-поля | Пример |
|---|---|---|
| `true-false` | `statement: string`, `correctBool: boolean` | `articles.json:28-30` |
| `multiple-choice` | `options: {id, text}[]`, `correctOptions: string[]`, `multiple?: boolean` | `articles.json:45-50`; `multiple: true` — `tests.json:101` |
| `fill-the-blank` | `sentence: string` (плейсхолдер `{{blank}}`), `acceptedAnswers: string[]` | `articles.json:65-66` |
| `match-pairs` | `pairs: {id, left, right}[]` | `articles.json:103-108` |
| `order-steps` | `items: {id, text}[]`, `correctOrder: string[]` | `tests.json:69-75` |
| `prompt-builder` | `slots: {id, label}[]`, `suggestions: {id, text}[]`, `correctAssignments: Record<suggestionId, slotId>` | `tests.json:115-132` |

⚠️ inferred: типы полей выведены из значений JSON-данных; TypeScript-моделей
на сервере нет (сервер на JS, валидация отсутствует). Канонические типы на
frontend — `frontend/src/app/core/models/index.ts` (не анализировался в этом
шаге).

### ProgressRecord — создаётся кодом (`progressRepo.js:20-25`)

| Поле | Тип | Источник |
|---|---|---|
| id | string (uuid v4) | `progressRepo.js:21` |
| userId | string | `progressRepo.js:22` |
| articleSlug | string | `progressRepo.js:23` |
| completedAt | string (ISO 8601) | `progressRepo.js:24` |

Пример (локальный рантайм-файл, вне репо): `server/data/progress.json:2-7`.
Уникальность пары
`(userId, articleSlug)` обеспечивается проверкой в `markArticle`
(`progressRepo.js:18-19`).

### Attempt — создаётся кодом (`attemptRepo.js:18-26`)

| Поле | Тип | Источник |
|---|---|---|
| id | string (uuid v4) | `attemptRepo.js:19` |
| userId | string | `attemptRepo.js:20` |
| testId | string | `attemptRepo.js:21` |
| answers | Answer[] | `attemptRepo.js:22`; форма — `attempts.json:6-42` |
| score | number (может быть дробным: 6.5) | `attemptRepo.js:23`; `attempts.json:123` |
| maxScore | number | `attemptRepo.js:24` |
| createdAt | string (ISO 8601) | `attemptRepo.js:25` |

**Answer** (⚠️ inferred: форма из данных, сервер не валидирует):

| Поле | Тип | Источник |
|---|---|---|
| exerciseId | string | `attempts.json:8` |
| score | number | `attempts.json:9` |
| maxScore | number | `attempts.json:10` |
| isCorrect | boolean | `attempts.json:11` |
| partial | boolean | `attempts.json:12` |

## 3. Связи (по фактическим полям)

- Course.articles[] → Article.slug (`courses.json:5-11` ↔ `articles.json:3`).
- Course.testId → Test.id (`courses.json:12` ↔ `tests.json:3`).
- Article.courseSlug → Course.slug (`articles.json:4`).
- Article.testId → Test.id (`articles.json:7`).
- Test.courseSlug → Course.slug (`tests.json:5`).
- ProgressRecord.userId → User.id; ProgressRecord.articleSlug → Article.slug.
- Attempt.userId → User.id; Attempt.testId → Test.id.
- FK на уровне хранилища не enforced (JSON, `jsonStore.js:43-67`).

## Открытые вопросы

1. Ссылочная целостность (например, `testId` в Course/Article) не проверяется
   кодом — нужно ли валидировать при правке JSON-контента?
2. `attempts.json:5,50` содержит `testId: "prompt-basics-test"`, отсутствующий
   в `tests.json` — устаревшие данные?
3. Полная схема блоков статей: в `articles.json` встречены только `text`,
   `image`, `exercise` — планировались ли другие типы блоков?
4. `weight` в ExerciseConfig: в данных встречаются 1–3 (`tests.json:10,113`) —
   как связаны `weight` и `maxScore` в Answer (совпадают в примерах,
   `attempts.json:9-10`)?
