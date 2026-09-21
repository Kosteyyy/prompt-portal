# REPO_MAP — инвентаризация репозитория (шаг 1)

> Только факты из кода. Архитектура, API и модели данных — в следующих шагах.

## 1. Общая структура

npm workspaces-монорепозиторий из двух пакетов: `server` и `frontend`
(`package.json:24`).

```
.
├── package.json                 # корневой workspace, husky/commitlint
├── commitlint.config.js         # правила conventional commits
├── .husky/                      # pre-commit, commit-msg
├── server/                      # Express API (ESM)
│   ├── .env.example
│   ├── package.json
│   └── src/
│       ├── index.js             # точка входа
│       ├── app.js               # сборка express-приложения
│       ├── config/index.js      # env-конфиг
│       ├── db/                  # jsonStore.js + repositories/ (6 репозиториев)
│       ├── middleware/          # auth.js, error.js
│       ├── routes/              # auth, articles, courses, tests, progress
│       └── data/                # *.json + images/
└── frontend/                    # Angular standalone
    ├── angular.json
    ├── proxy.conf.json          # /api и /images → localhost:3000
    └── src/
        ├── main.ts              # точка входа
        ├── environments/        # environment.ts, environment.prod.ts
        └── app/
            ├── core/            # models, services, guards, interceptors, initializers
            ├── shared/components/   # header, progress-bar
            ├── exercises/       # base, host, feedback-panel + 6 типов упражнений
            └── features/        # landing, auth, catalog, course, article, test,
                                 # test-result, profile
```

## 2. Технологии

### Backend (`server/package.json:9-16`)

| Зависимость | Версия | Назначение |
|---|---|---|
| express | ^4.19.2 | HTTP-фреймворк (`server/src/app.js:1`) |
| cors | ^2.8.5 | CORS (`server/src/app.js:2,21`) |
| bcryptjs | ^2.4.3 | хэширование паролей |
| jsonwebtoken | ^9.0.2 | JWT |
| dotenv | ^16.4.5 | env-конфиг (`server/src/config/index.js:1-2`) |
| uuid | ^10.0.0 | генерация id |

- Формат модулей: ESM (`"type": "module"`, `server/package.json:4`).
- Скрипты: `dev` = `node --watch src/index.js`, `start` = `node src/index.js`
  (`server/package.json:6-7`).
- Хранилище: JSON-файлы в `server/src/data/` (`server/src/config/index.js:8`,
  `server/.env.example:4`). БД, ORM, миграции — отсутствуют в коде.

### Frontend (`frontend/package.json:24-47`)

| Зависимость | Версия |
|---|---|
| @angular/core, common, compiler, forms, platform-browser, router | ^20.3.0 |
| rxjs | ~7.8.0 |
| tslib | ^2.3.0 |
| zone.js | ~0.15.0 |

DevDependencies: `@angular/cli`, `@angular/build`, `@angular/compiler-cli`
^20.3.x, `typescript` ~5.9.2, Karma + Jasmine (karma-chrome-launcher,
karma-coverage, karma-jasmine, karma-jasmine-html-reporter, @types/jasmine)
(`frontend/package.json:35-47`).

- Стили: SCSS (`frontend/angular.json:9-11`), prettier-конфиг в
  `frontend/package.json:11-22`.
- ⚠️ inferred: README описывает Angular 17+ и standalone-компоненты
  (`README.md:12`), фактическая версия в package.json — Angular 20.

### Root (`package.json:18-23`)

devDependencies: `@commitlint/cli` ^21.2.2, `@commitlint/config-conventional`
^21.2.2, `concurrently` ^10.0.5, `husky` ^9.1.7.

Скрипты: `dev` (concurrently сервер+фронт), `dev:server`, `dev:frontend`,
`build:all`, `lint:commits`, `test` (заглушка «No tests yet»)
(`package.json:6-13`).

## 3. Входные точки

| Точка | Файл | Что делает |
|---|---|---|
| Сервер | `server/src/index.js:4-5` | `createApp()` + `app.listen(config.port)` |
| Сборка приложения | `server/src/app.js:17-43` | express, cors, static `/images`, роуты `/api/*` |
| Фронтенд | `frontend/src/main.ts:5` | `bootstrapApplication(AppComponent, appConfig)` |
| Конфиг сборки | `frontend/angular.json:20` | browser entry = `src/main.ts` |
| Dev-прокси | `frontend/proxy.conf.json:1-11` | `/api`, `/images` → `http://localhost:3000` |

Монтирование роутов (`server/src/app.js:34-38`): `/api/auth`, `/api/articles`,
`/api/courses`, `/api/tests`, `/api/progress`.

## 4. Переменные окружения

`server/.env.example:1-4` и `server/src/config/index.js:5-8`:

| Переменная | По умолчанию | Использование |
|---|---|---|
| PORT | 3000 | `server/src/config/index.js:5` |
| JWT_SECRET | `dev-secret` (fallback) | `server/src/config/index.js:6` |
| DB_BACKEND | json | `server/src/config/index.js:7` |
| DATA_DIR | `./src/data` | `server/src/config/index.js:8` |

Frontend env: dev — `apiBase: 'http://localhost:3000/api'`
(`frontend/src/environments/environment.ts:3`), prod — `apiBase: '/api'`
(`frontend/src/environments/environment.prod.ts:3`); подмена через
fileReplacements (`frontend/angular.json:51-55`).

## 5. Артефакты в репозитории

| Артефакт | Статус | Источник |
|---|---|---|
| Миграции БД (migrations/, prisma, TypeORM) | ❌ отсутствуют | нет в `git ls-files` |
| OpenAPI/Swagger | ❌ отсутствует | нет в `git ls-files` |
| Тесты | ❌ отсутствуют | корневой `test` — заглушка (`package.json:9`); `*.spec.ts` нет; karma/jasmine подключены, но спеков нет |
| CI-конфиги (.github/workflows и т.п.) | ❌ отсутствуют | нет в `git ls-files` |
| Dockerfile / docker-compose | ❌ отсутствуют | нет в `git ls-files` |
| `.env.example` | ✅ есть | `server/.env.example` |
| Git hooks | ✅ есть | `.husky/pre-commit` (запускает `npm test`), `.husky/commit-msg` (commitlint) |
| Commitlint | ✅ есть | `commitlint.config.js:4` — scope-enum: frontend, server, shared, deps, ci |
| Данные-фикстуры | ✅ есть | `server/src/data/`: articles.json, courses.json, tests.json, progress.json, attempts.json, users.example.json, images/ (3 jpg) |
| Lint (eslint) | ❌ отсутствует | нет в package.json; только prettier-конфиг (`frontend/package.json:11-22`) |
| Документация | ✅ README.md | описание запуска, структуры, деплоя |
| Генераторы скелета | ✅ setup_server.js, setup_frontend.js | создают пустые файлы структуры; прод-кодом не являются |

`users.json` в gitignore (`.gitignore:24`), в репо только `users.example.json`.

⚠️ inferred: README описывает прод-деплой (pm2, nginx, Let's Encrypt,
`README.md:269-279`), но конфигов pm2/nginx в репозитории нет — только текст в
README.

## 6. Состав каталогов (для следующих шагов)

- **server/src/routes/**: `auth.js`, `articles.js`, `courses.js`, `tests.js`,
  `progress.js` — эндпоинты не документированы здесь (шаг 2).
- **server/src/db/**: `jsonStore.js`, `repositories/`: `userRepo.js`,
  `articleRepo.js`, `attemptRepo.js`, `courseRepo.js`, `progressRepo.js`,
  `testRepo.js` — схемы данных не документированы здесь (шаг 3).
- **frontend/src/app/core/**: `models/index.ts`, 5 сервисов
  (api, auth, article, course, progress, test-session), guards (auth, guest),
  interceptor, initializer.
- **frontend/src/app/exercises/**: `base-exercise.component.ts`,
  `exercise-host`, `feedback-panel`, 6 типов: multiple-choice, match-pairs,
  fill-the-blank, true-false, order-steps, prompt-builder.
- **frontend/src/app/features/**: landing, auth (login, register), catalog,
  course, article, test, test-result, profile.

## Открытые вопросы

1. **Версия Angular**: README говорит «Angular 17+» (`README.md:12`),
   package.json — ^20.3.0. Актуальна ли документация README?
2. **Тесты**: karma/jasmine установлены (`frontend/package.json:39-45`), но
   спеков нет. Планируются ли тесты, или devDependencies можно считать
   избыточными?
3. **Деплой**: pm2/nginx/HTTPS описаны только в README (`README.md:269-279`),
   конфигов в репо нет. Нужен ли доступ к серверным конфигам для полноты
   документации?
4. **`users.json`**: реальный файл с пользователями в gitignore
   (`.gitignore:24`). Есть ли в `users.example.json` эталонная схема пользователя
   (проверить на шаге моделей данных)?
5. **`DB_BACKEND`**: поддерживается ли что-то кроме `json`? (проверить
   `server/src/db/index.js` на шаге архитектуры).
6. **ESLint / Prettier**: prettier-конфиг есть только во frontend, линтера нет.
   Это осознанно?

