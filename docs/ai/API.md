# API — Backend (шаг 2)

База: `http://localhost:3000` (PORT по умолчанию, `server/src/config/index.js:5`).
Все роуты монтируются с префиксом `/api` (`server/src/app.js:34-38`).
Формат ошибок: `{ "error": string }` (`server/src/middleware/error.js:3`).

## Аутентификация

Защищённые эндпоинты требуют заголовок `Authorization: Bearer <JWT>`
(`server/src/middleware/auth.js:4-7`). Payload JWT: `{ id, email, name, role }`
(`server/src/routes/auth.js:8`), срок 7 дней (:9).

## Эндпоинты

### Auth (`/api/auth`, `server/src/routes/auth.js`)

| Метод | Путь | Auth | Источник |
|---|---|---|---|
| POST | `/api/auth/register` | — | `server/src/routes/auth.js:23` |
| POST | `/api/auth/login` | — | `server/src/routes/auth.js:43` |
| GET | `/api/auth/me` | Bearer | `server/src/routes/auth.js:56` |

**POST /register** (`:23-41`)
- Body: `{ email: string, password: string, name: string }` (:25).
- Валидация: все поля обязательны, иначе 400 «Заполните все поля» (:26-28);
  `name.trim().length < 2` → 400 «Имя слишком короткое» (:29-31);
  email занят → 409 «Email taken» (:32-34).
- 200: `{ token: string, user: { id, email, name, role, createdAt } }`
  (token — `sign(user)` :37; user — `pub(user)` :12-18, без `passwordHash`).
- ⚠️ inferred: поле `name` в ответе приходит из фолбэка `email.split('@')[0]`,
  т.к. `UserRepo.create` не сохраняет `name` (`server/src/db/repositories/userRepo.js:24-31`).

**POST /login** (`:43-54`)
- Body: `{ email, password }` (:45).
- Неверный email или пароль → 401 «Invalid credentials» (:47,49).
- 200: `{ token, user }` — как в register (:50).

**GET /me** (`:56-60`)
- 200: публичный объект пользователя (`pub`); 404 «Пользователь не найден»
  если id из JWT не найден (:57-58).

### Articles (`/api/articles`, `server/src/routes/articles.js`)

| Метод | Путь | Auth | Источник |
|---|---|---|---|
| GET | `/api/articles` | — | `server/src/routes/articles.js:6` |
| GET | `/api/articles/:slug` | — | `server/src/routes/articles.js:11` |

- `GET /` — query `?course=<slug>`: фильтр по `courseSlug`, иначе все статьи
  (:7-8). Типы ответов: массив объектов Article (см. DATA_MODEL.md).
- `GET /:slug` — статья по slug; 404 «Not found» (:13).

### Courses (`/api/courses`, `server/src/routes/courses.js`)

| Метод | Путь | Auth | Источник |
|---|---|---|---|
| GET | `/api/courses` | — | `server/src/routes/courses.js:6` |
| GET | `/api/courses/:slug` | — | `server/src/routes/courses.js:10` |

- `GET /` — все курсы (:7). `GET /:slug` — курс по slug; 404 «Not found» (:12).

### Tests (`/api/tests`, `server/src/routes/tests.js`)

| Метод | Путь | Auth | Источник |
|---|---|---|---|
| GET | `/api/tests/:id` | — | `server/src/routes/tests.js:5` |

- 404 «Not found» если id не найден (:7).

### Progress (`/api/progress`, `server/src/routes/progress.js`)

Весь роутер защищён: `router.use(authRequired)` (`server/src/routes/progress.js:6`).

| Метод | Путь | Auth | Источник |
|---|---|---|---|
| GET | `/api/progress` | Bearer | `server/src/routes/progress.js:8` |
| POST | `/api/progress/article/:slug` | Bearer | `server/src/routes/progress.js:16` |
| POST | `/api/progress/test/:id` | Bearer | `server/src/routes/progress.js:21` |

- `GET /` — 200: `{ articles: ProgressRecord[], attempts: Attempt[] }` (:9-13).
- `POST /article/:slug` — отметить статью прочитанной; идемпотентно
  (`ProgressRepo.markArticle`, `server/src/db/repositories/progressRepo.js:17-26`);
  200: запись прогресса.
- `POST /test/:id` — сохранить попытку теста. Body: `{ answers, score,
  maxScore }` (`server/src/routes/progress.js:22`); ⚠️ inferred: типы полей не
  валидируются на сервере, фактическая форма — из `server/src/data/attempts.json:6-45`.
  200: созданная попытка.

### Статика

- `GET /images/*` — файлы из `server/src/data/images`, кэш 7 дней
  (`server/src/app.js:25-30`).

## Отсутствующие методы

- PUT/PATCH/DELETE — отсутствуют во всех роутах (routes/*.js).
- POST для articles/courses/tests — отсутствуют (контент правится в JSON-файлах).

## Открытые вопросы

1. Валидация email-формата отсутствует в register (`routes/auth.js:25-34`) —
   подтверждено примером `users.example.json:4` (`"email": "kosteyyy"`). Это
   допустимое поведение?
2. `POST /api/progress/test/:id` не проверяет существование теста и не
   пересчитывает score на сервере (`routes/progress.js:21-31`) — доверие
   клиенту осознанно?
3. Нужны ли в будущем DELETE-эндпоинты (JsonStore их не поддерживает,
   `server/src/db/jsonStore.js:43-67`)?
