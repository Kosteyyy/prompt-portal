# ARCHITECTURE — Backend + Frontend (шаги 2–3)

> Факты из кода. Frontend не рассматривается (см. REPO_MAP.md).

## 1. Слои и поток запроса

```
server/src/index.js          # старт: createApp() → app.listen(config.port)  (:4-5)
  └─ server/src/app.js       # сборка Express-приложения (createApp, :17-43)
       ├─ cors()                                              (:21)
       ├─ express.static('/images', data/images, maxAge 7d)   (:25-30)
       ├─ express.json({ limit: '1mb' })                      (:32)
       ├─ роуты (фабрики, получают db через DI):              (:34-38)
       │    /api/auth → authRoutes(db)
       │    /api/articles → articleRoutes(db)
       │    /api/courses → courseRoutes(db)
       │    /api/tests → testRoutes(db)
       │    /api/progress → progressRoutes(db)
       ├─ errorHandler                                        (:40)
       └─ app.locals.db = db                                  (:41)
```

Слоёв «controller/service» как отдельных файлов нет — логика обработчиков
находится прямо в файлах роутов (routes/*.js). Слой доступа к данным —
репозитории (`server/src/db/repositories/`).

## 2. Слой данных

### 2.1 Фабрика БД

`server/src/db/index.js:8-18` — `createDb()` параллельно создаёт 6
репозиториев и возвращает объект `{ users, articles, courses, tests, progress,
attempts }`. Комментарий на :9: «Сменить backend можно здесь: обернуть в switch
по config.dbBackend» — switch не реализован, всегда JSON-backend.

### 2.2 Низкоуровневое хранилище

`JsonStore` (`server/src/db/jsonStore.js:4-67`):
- файл-хранилище + кэш в памяти (`this.cache`, :7);
- `init()` создаёт файл с `[]` при отсутствии (:11-21);
- `_persist()` — сериализованная очередь записи через промис-цепочку
  `writeQueue` (:35-41);
- API: `all()`, `find(pred)`, `filter(pred)`, `insert(doc)`, `update(pred,
  patch)` (:43-67). `delete` отсутствует.

### 2.3 Репозитории

| Репозиторий | Файл | Методы |
|---|---|---|
| UserRepo | `server/src/db/repositories/userRepo.js` | `findById(id)` :17, `findByEmail(email)` :20, `create({email, passwordHash})` :24 |
| ArticleRepo | `.../articleRepo.js` | `list()` :12, `listByCourse(courseSlug)` :15, `findBySlug(slug)` :18 |
| CourseRepo | `.../courseRepo.js` | `list()` :12, `findBySlug(slug)` :15 |
| TestRepo | `.../testRepo.js` | `findById(id)` :12, `findByCourse(courseSlug)` :15 |
| ProgressRepo | `.../progressRepo.js` | `findByUser(userId)` :13, `markArticle(userId, articleSlug)` :17 (идемпотентно: существующая запись возвращается без дубля, :18-19) |
| AttemptRepo | `.../attemptRepo.js` | `listByUser(userId)` :13, `create({userId, testId, answers, score, maxScore})` :17 |

Все репозитории: static-фабрика `create()` открывает JsonStore на файле в
`config.dataDir`; id генерируются `uuid v4` (userRepo.js:2,26; progressRepo.js:2,21;
attemptRepo.js:2,19).

## 3. Middleware

| Middleware | Файл | Поведение |
|---|---|---|
| `authRequired` | `server/src/middleware/auth.js:9-18` | Bearer JWT из заголовка Authorization (:4-7); при отсутствии — 401 `{error:'No token'}` (:11); при невалидном — 401 `{error:'Invalid token'}` (:16); payload кладётся в `req.user` (:13) |
| `authOptional` | `server/src/middleware/auth.js:20-28` | валидирует токен при наличии, молча пропускает иначе. **Экспортирован, но нигде не импортируется** (в routes/auth.js:5 и routes/progress.js:2 импортирован только `authRequired`) |
| `errorHandler` | `server/src/middleware/error.js:1-4` | `console.error` + ответ `err.status || 500` c `{error: err.message || 'Internal error'}` |

## 4. Аутентификация

- JWT подписывается `HS256` (алгоритм по умолчанию jsonwebtoken) секретом
  `config.jwtSecret`, срок 7 дней (`server/src/routes/auth.js:8-10`).
- Payload: `{ id, email, name, role }` (`server/src/routes/auth.js:8`).
- Пароли: `bcrypt.hash(password, 10)` при регистрации
  (`server/src/routes/auth.js:35`), `bcrypt.compare` при логине (:48).
- Ответ клиенту: `pub(user)` удаляет `passwordHash`/`password` и подставляет
  `name` из локальной части email при отсутствии
  (`server/src/routes/auth.js:12-18`).

## 5. Особенности, подтверждённые кодом

- **`name` не сохраняется**: роут передаёт `name` в `db.users.create(...)`
  (`server/src/routes/auth.js:36`), но `UserRepo.create` деструктурирует только
  `{ email, passwordHash }` и в объект пользователя `name` не включает
  (`server/src/db/repositories/userRepo.js:24-31`). JWT `sign()` читает
  `user.name` — для новых пользователей он `undefined` (⚠️ inferred: `pub()`
  компенсирует это фолбэком `email.split('@')[0]`, routes/auth.js:16).
- **`role`**: всегда `"student"` при создании (`userRepo.js:29`); роли/правки
  пользователя (PUT/DELETE) на сервере отсутствуют.
- **Контент только для чтения**: роутов POST/PUT/DELETE для courses/articles/
  tests нет — контент редактируется напрямую в `server/src/data/*.json`
  (см. API.md).
- **Статика**: отдаётся только `data/images` (замечание о безопасности в
  комментарии `server/src/app.js:23-24`), `maxAge: '7d'` (:28).
- **В `attempts.json` есть `testId: "prompt-basics-test"`**
  (`server/src/data/attempts.json:5,50`), которого нет в `tests.json`
  (там единственный тест `prompt-engineering-test`, `tests.json:3`) — исторические
  данные.

## 6. Frontend (дополнение, шаг 3)

Подробности — `docs/ai/FRONTEND.md`. Angular 20 standalone, bootstrap через
`bootstrapApplication` (`frontend/src/main.ts:5`), провайдеры —
`provideRouter` + `provideHttpClient(withInterceptors([authInterceptor]))` +
`APP_INITIALIZER` (`frontend/src/app/app.config.ts:11-18`). NgModule
отсутствуют. Все маршруты lazy (`loadComponent`, `frontend/src/app/app.routes.ts:5-56`).

Слои: `features/*` (страницы) → `core/services/*` → `core/services/api.service.ts`
(обёртка HttpClient над `environment.apiBase`) → interceptor добавляет
`Authorization: Bearer` из `localStorage['pp_token']`
(`core/interceptors/auth.interceptor.ts:3-12`) → dev-прокси `/api`
(`frontend/proxy.conf.json:1-11`) → backend роуты из §1.

Состояние: авторизация — `AuthService` (signal `user` + token в localStorage,
`core/services/auth.service.ts:11-14`); прохождение теста —
`TestSessionService` (signals + computed, `core/services/test-session.service.ts:6-24`);
данные страниц — локальные signals компонентов. Стор-библиотек нет.

## 7. Поток данных Angular → API

```
Компонент (features/*, exercises/*)
  → Service: AuthService / ArticleService / CourseService / ProgressService
  → ApiService.get/post — base + path (core/services/api.service.ts:10-15)
  → authInterceptor: Bearer из localStorage (кроме /auth/login, /auth/register)
  → dev: proxy /api → http://localhost:3000 (proxy.conf.json:1-11)
  → Express: /api/auth|articles|courses|tests|progress (server/src/app.js:34-38)
  → JsonStore-репозитории (server/src/db/*)
```

Соответствие сервисов и эндпоинтов — таблица в `docs/ai/FRONTEND.md` §3.2;
описание эндпоинтов — `docs/ai/API.md`.

## Открытые вопросы

1. `authOptional` не используется (`server/src/middleware/auth.js:20`) —
   планировалась ли публичная выдача статей с персонализацией?
2. Потеря `name` в `UserRepo.create` (`userRepo.js:24`) — баг или осознанный
   отказ от хранения имени?
3. `DB_BACKEND` читается в конфиге (`server/src/config/index.js:7`), но switch
   в `createDb` не реализован (`server/src/db/index.js:9`) — планируется ли
   альтернативный backend?
4. `JsonStore` не поддерживает удаление (`jsonStore.js:43-67`) — нужен ли
   DELETE API в планах?
5. Данные `attempts.json` ссылаются на несуществующий тест `prompt-basics-test`
   — чистить ли исторические записи?
