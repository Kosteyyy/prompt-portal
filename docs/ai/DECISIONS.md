# DECISIONS — инженерные решения проекта (шаг 4)

> Все решения ниже — `⚠️ inferred`: выведены из кода, прямых ADR/комментариев
> о причинах в репо нет (единственное документированное обоснование — README.md).
> Источники фактов: REPO_MAP.md, ARCHITECTURE.md, API.md, DATA_MODEL.md,
> FRONTEND.md, CONVENTIONS.md.

## Backend

| # | Решение | Обоснование (inferred) | Источник |
|---|---|---|---|
| B1 | **JSON-файлы вместо БД** | Учебный проект, быстрый старт без развёртывания БД; README прямо называет это причиной («быстрый старт без развёртывания БД», `README.md:28`) | `server/src/db/jsonStore.js:4-67`, `server/.env.example:4` |
| B2 | **Слой репозиториев как изоляция хранилища** | Замена JSON на PostgreSQL/SQLite/MongoDB без изменения роутов; README описывает это как целевую архитектуру (`README.md:29-38`) | `server/src/db/index.js:8-18`, `server/src/db/repositories/*` |
| B3 | **Роуты-фабрики с DI (`db` через параметр)** | Тестируемость и лёгкая подмена хранилища; `db` также кладётся в `app.locals` | `server/src/app.js:34-41`, `server/src/routes/auth.js:20-21` |
| B4 | **JWT (HS256, 7 дней) + bcryptjs (10 раундов)** | Минимальная stateless-аутентификация без сессий/refresh-токенов для учебного проекта | `server/src/routes/auth.js:8-10,35,48` |
| B5 | **Контент как данные (JSON), а не CRUD API** | Контент редактируется файлами; POST/PUT/DELETE для courses/articles/tests отсутствуют | `server/src/routes/articles.js`, `server/src/data/*.json` |
| B6 | **Сериализованная запись через `writeQueue`** | Защита от гонок параллельных записей в один файл | `server/src/db/jsonStore.js:35-41` |
| B7 | **Статика только `data/images`** | Безопасность: не отдавать `users.json`/`progress.json` наружу — прямо прокомментировано в коде | `server/src/app.js:23-30` |
| B8 | **`users.json` в gitignore, в репо — `users.example.json`** | Секретность пользовательских данных (хэшей) | `.gitignore:24`, `server/src/data/users.example.json` |

## Frontend

| # | Решение | Обоснование (inferred) | Источник |
|---|---|---|---|
| F1 | **Standalone-компоненты без NgModule, bootstrap через `bootstrapApplication`** | Современный Angular-стиль (Angular 14+); README называет standalone причиной выбора Angular | `frontend/src/main.ts:5`, `frontend/src/app/app.component.ts:7` |
| F2 | **Signals вместо сторе (NgRx/Redux)** | README прямо: «без внешних стейт-менеджеров… избыточны для объёма проекта» (`README.md:15-17`) | `frontend/src/app/core/services/test-session.service.ts:6-24` |
| F3 | **Signals для состояния + RxJS только для HTTP** | Разделение: синхронное состояние — signals, асинхронные запросы — Observable | `core/services/auth.service.ts:11,20-43` |
| F4 | **Единый движок упражнений: Base + Host + ngSwitch** | Переиспользование одного компонента в двух режимах (inline в статье / test); README описывает как ключевую идею (`README.md:44-66`) | `exercises/base-exercise.component.ts:4-27`, `exercises/exercise-host/exercise-host.component.ts:22-29` |
| F5 | **Продвинутые типы как конфигурации, а не новые компоненты** | README: CaseStudy/SpotTheHallucination/PromptSimulator реализуются конфигурациями существующих движков (`README.md:85-95`) | подтверждается отсутствием таких компонентов в `git ls-files` |
| F6 | **Lazy-loading всех маршрутов** | README: «каждая страница подгружается отдельным чанком» (`README.md:18-19`) | `frontend/src/app/app.routes.ts:8-53` |
| F7 | **Один HTTP-обёртка `ApiService` + функциональный interceptor** | Единая точка подстановки JWT; README: «единая точка подстановки JWT» (`README.md:20`) | `core/services/api.service.ts:10-15`, `core/interceptors/auth.interceptor.ts:3-12` |
| F8 | **Inline-шаблоны вместо .html файлов** | Компактность «карточных» компонентов; внешних .html в репо нет | все `*.component.ts` |
| F9 | **Без UI-библиотек, SCSS вручную** | README: «без тяжёлых UI-библиотек, чтобы компоненты были лёгкими» (`README.md:21-22`) | `frontend/package.json:24-33` (нет angular/material и т.п.) |
| F10 | **Токен в `localStorage`** | Простейшее хранение для учебного проекта; refresh-токенов/cookie нет | `core/services/auth.service.ts:6,46` |

## Инфраструктура

| # | Решение | Обоснование (inferred) | Источник |
|---|---|---|---|
| I1 | **npm workspaces-монорепо** | Один репозиторий на два пакета; общие dev-инструменты в корне | `package.json:24` |
| I2 | **Conventional Commits + husky + commitlint** | README: стандартизация коммитов со скоупами (`README.md:283-288`) | `commitlint.config.js:4`, `.husky/*` |
| I3 | **Деплой: pm2 + nginx + Let's Encrypt, без Docker** | README описывает (`README.md:269-279`); Dockerfile/CI в репо отсутствуют | `git ls-files` |
| I4 | **Prod API base `/api` (относительный) + dev-прокси** | nginx проксирует `/api` в проде; в dev — proxy.conf.json | `frontend/src/environments/environment.prod.ts:3`, `frontend/proxy.conf.json:1-11` |

## Открытые вопросы (решения, которые нельзя вывести из кода)

1. Почему выбран Express, а не Fastify/Nest (README: «минимальный API», `README.md:25-26` — но это описание, не обоснование выбора)?
2. Почему JSON, а не SQLite сразу (SQLite не потребовал бы БД-сервера)?
3. Планируется ли refresh-токен/выход всех сессий (JWT живёт 7 дней,
   `server/src/routes/auth.js:9`)?
4. Сервер доверяет score от клиента (`server/src/routes/progress.js:21-31`) —
   принято ли это осознанно как учебное упрощение?
5. Почему нет тестов при настроенном karma/jasmine и husky pre-commit
   (`package.json:9`, `.husky/pre-commit:1`)?
6. Почему нет CI/CD при описанном прод-деплое (README:269)?
7. `weight` vs `maxScore`: maxScore в Answer всегда = weight упражнения
   (`exercises/base-exercise.component.ts:13,21`) — дублирование осознанно?
