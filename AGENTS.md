# AGENTS — правила для ИИ-агентов, работающих в этом репозитории

> Прочитай этот файл целиком перед любыми изменениями. Документация проекта —
> в `docs/ai/` (см. §7). Правила основаны на фактах из кода; не выдумывай
> структуры, которых нет.

## 1. Стек (факты, `docs/ai/REPO_MAP.md`)

- **Backend**: Node.js ESM + Express 4 (`server/package.json:4,13`),
  JSON-хранилище через репозитории (`server/src/db/`), JWT + bcryptjs.
- **Frontend**: Angular 20 standalone + Signals (`frontend/package.json:25`),
  SCSS, без UI-библиотек.
- **Монорепо**: npm workspaces `server`, `frontend` (`package.json:24`).
- БД, ORM, миграции, Docker, CI — **отсутствуют**. Не упоминай их как
  существующие.

## 2. Команды

| Действие | Команда | Источник |
|---|---|---|
| Dev (сервер + UI) | `npm run dev` (в корне) | `package.json:12` |
| Dev сервер | `npm run dev:server` | `package.json:11` |
| Dev фронт | `npm run dev:frontend` | `package.json:10` |
| Build всё | `npm run build:all` | `package.json:13` |
| Тесты | `npm test` — **заглушка** «No tests yet» | `package.json:9` |
| Lint коммитов | `npm run lint:commits` | `package.json:8` |
| Frontend test | `npm run test -w frontend` (karma, спеков нет) | `frontend/package.json:9` |

- ESLint/Prettier для кода не настроены (только prettier-секция в
  `frontend/package.json:11-22`). Не предлагай «запустить линтер» как
  проверку.
- Сервер: `http://localhost:3000`, UI: `http://localhost:4200`,
  прокси `/api` и `/images` (`frontend/proxy.conf.json`).
- Перед запуском сервера: `cp server/.env.example .env`
  (`server/.env.example`).

## 3. Архитектурные границы (не нарушать)

- **Backend**: роуты (`server/src/routes/`) НЕ обращаются к файлам/JsonStore
  напрямую — только через репозитории (`server/src/db/repositories/`).
  Подмена хранилища — только в фабрике `server/src/db/index.js:8-18`.
- **Frontend**: компоненты НЕ вызывают HttpClient напрямую — только через
  сервисы → `ApiService` (`frontend/src/app/core/services/api.service.ts:10-15`).
- **Доменные модели** — единственный источник `frontend/src/app/core/models/index.ts`;
  не объявляй дублирующие интерфейсы в компонентах.
- **Упражнения**: новые типы — наследование от `BaseExerciseComponent` +
  case в `ExerciseHostComponent` + значение в `ExerciseType`
  (`docs/ai/FRONTEND.md` §4.3). Не пиши упражнение с нуля.
- **Контент** (курсы/статьи/тесты) правится в `server/src/data/*.json` —
  CRUD-эндпоинтов для контента НЕТ и не создавай их без явного запроса.
- **Auth**: защищённые роуты — `authRequired`; JWT кладётся в `req.user`
  (`server/src/middleware/auth.js:9-18`).
- Конвенции — `docs/ai/CONVENTIONS.md` (отступы: server 4 пробела,
  frontend 2; ESM с `.js`-расширениями в импортах; 2 пробела — frontend).

## 4. Правило «не выдумывать»

- Не ссылайся на несуществующие файлы, эндпоинты, поля, компоненты,
  зависимости, скрипты. Перед утверждением «X существует» — проверь кодом
  (grep/read). Полный список эндпоинтов — `docs/ai/API.md` +
  `docs/ai/openapi.yaml`; моделей данных — `docs/ai/DATA_MODEL.md`.
- Если чего-то нет в коде — так и скажи; предлагай как «новое», а не как
  «существующее».
- Известные ловушки:
  - `name` не сохраняется в `UserRepo.create` (`userRepo.js:24`);
  - `authOptional` не используется (`server/src/middleware/auth.js:20`);
  - CatalogComponent захардкожен (`catalog.component.ts:12-21`);
  - `DB_BACKEND` читается, но switch не реализован (`server/src/db/index.js:9`).

## 5. Обязательный план перед кодом

1. Прочитай релевантные документы из `docs/ai/` (см. §7).
2. Прочитай затрагиваемые файлы целиком.
3. Опиши план изменений (файлы, поведение, риски) и получи подтверждение
   владельца.
4. Только после подтверждения — правь код. Минимальный диф, без
   самовольного рефакторинга и смены стиля.

## 6. Обязательные проверки после изменений

- Тестов в проекте нет (`package.json:9`) — поэтому:
  - Backend: запусти `npm run dev:server` и проверь затронутые эндпоинты
    curl'ом (список — `docs/ai/API.md`); для auth-эндпоинтов проверь
    401/400/409-ветки.
  - Frontend: `npm run build:all` (или `npm run dev:frontend`) — сборка без
    ошибок; проверь затронутые маршруты вручную (`docs/ai/FRONTEND.md` §2).
- Коммит: Conventional Commits, scope из `frontend|server|shared|deps|ci`
  (`commitlint.config.js:4`); хук проверит формат (`.husky/commit-msg`).
- Если изменение затрагивает API/модели/структуру — обнови соответствующий
  документ в `docs/ai/` (API.md, DATA_MODEL.md, FRONTEND.md, …) в том же PR.

## 7. Карта документации (`docs/ai/`)

| Документ | Содержимое |
|---|---|
| `REPO_MAP.md` | структура репо, технологии, входные точки, артефакты |
| `ARCHITECTURE.md` | слои backend + frontend, поток данных Angular → API |
| `API.md` | все эндпоинты с источниками `файл:строка` |
| `openapi.yaml` | OpenAPI 3.0 спецификация API |
| `DATA_MODEL.md` | сущности, поля, связи JSON-хранилищ |
| `FRONTEND.md` | маршруты, сервисы, компоненты, guards/interceptors |
| `CONVENTIONS.md` | конвенции кода backend + frontend |
| `DECISIONS.md` | инженерные решения (⚠️ inferred) |
| `TASKS.md` | бэклог задач и порядок ведения |
| `AGENTS.md` | этот файл — правила для агентов |

## 8. Чего не делать

- Не менять код без плана и подтверждения (§5).
- Не добавлять БД/ORM/Docker/CI без явного запроса владельца.
- Не трогать `server/src/data/users.json` (в gitignore, `.gitignore:24`) и
  не коммитить секреты; `.env` не коммитить.
- Не «чинить» ловушки из §4 без записи задачи в `TASKS.md` и подтверждения.
- Не коммитить (`git commit/push/...`) без явного разрешения владельца.
