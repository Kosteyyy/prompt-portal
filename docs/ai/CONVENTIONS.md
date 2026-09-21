# CONVENTIONS — Backend + Frontend (шаги 2–3)

## F. Frontend (шаг 3)

### F1. Архитектура компонентов

- Standalone-компоненты, без NgModule: все `@Component` имеют `standalone: true`
  (например `frontend/src/app/app.component.ts:7`,
  `exercises/multiple-choice/multiple-choice.component.ts:8`); bootstrap —
  `bootstrapApplication` (`frontend/src/main.ts:5`).
- Lazy-loading страниц через `loadComponent` для всех маршрутов
  (`frontend/src/app/app.routes.ts:8-53`).
- DI через функцию `inject()` вместо конструктора (`core/services/api.service.ts:7`,
  `features/course/course.component.ts:30-32`).
- Сервисы — `@Injectable({ providedIn: 'root' })`
  (`core/services/api.service.ts:5` и др.).
- Один HTTP-обёртка `ApiService`, все сервисы ходят только через него
  (`core/services/article.service.ts:2,7-12`); прямых вызовов HttpClient в
  сервисах/компонентах, кроме ApiService, нет.
- Единственный типизированный источник доменных моделей —
  `core/models/index.ts` (ExerciseConfig, Article, Course, Test, User,
  ExerciseResult, :31-101); компоненты импортируют модели оттуда
  (`features/course/course.component.ts:5`).

### F2. Реактивность

- Angular Signals для состояния: `signal`/`computed` в сервисах и компонентах
  (`core/services/auth.service.ts:11`, `core/services/test-session.service.ts:6-17`,
  `features/course/course.component.ts:34-35`).
- RxJS только для HTTP-потоков (`subscribe` на Observable сервисов,
  `features/course/course.component.ts:40-41`).
- Геттеры-вычисления — `computed` (`features/article/article.component.ts:82-83`).

### F3. Шаблоны

- Inline-шаблоны в декораторе `template:` у большинства компонентов
  (`features/landing/landing.component.ts:9-21`,
  `exercises/exercise-host/exercise-host.component.ts:19-31`); внешние .html
  файлы отсутствуют (нет в `git ls-files`).
- Управление потоком — структурные директивы `*ngIf`/`*ngFor`/`[ngSwitch]` из
  `@angular/common` (`features/article/article.component.ts:3,28-41`); новый
  control flow (@if/@for) не используется.
- Forms — template-driven `FormsModule`/`ngModel`
  (`features/auth/login.component.ts:2,13-15`).
- Интерполяция текстов UI — на русском языке (заголовки, кнопки: например
  `features/article/article.component.ts:63-65`).

### F4. Контракт упражнений

- Все компоненты упражнений наследуются от абстрактного
  `BaseExerciseComponent` (`@Directive()`, `exercises/base-exercise.component.ts:4-5`)
  с общим контрактом: `@Input config` (required), `@Input mode`, `@Output
  answered` (:6-8), `emitResult(score, partial)` (:15-24).
- Диспетчеризация типов — `ExerciseHostComponent` через `ngSwitch` по
  `config.type` (`exercises/exercise-host/exercise-host.component.ts:22-29`);
  новый тип = новый case + значение в `ExerciseType`
  (`core/models/index.ts:1-7`).
- Retry-кнопка только в режиме `mode === 'inline'`
  (`exercises/multiple-choice/multiple-choice.component.ts:26`).
- Частичный балл: `(correct/total) * max` в match-pairs
  (`match-pairs.component.ts:81`), order-steps (`order-steps.component.ts:149`),
  prompt-builder (`prompt-builder.component.ts:53`); точная проверка без
  частичного — multiple-choice (`multiple-choice.component.ts:45-52`),
  true-false (`true-false.component.ts:30`), fill-the-blank
  (`fill-the-blank.component.ts:37-41`).

### F5. Безопасность/сессия

- JWT в `localStorage` под ключом `pp_token`
  (`core/services/auth.service.ts:6,46`); тот же ключ захардкожен в guard и
  interceptor (`core/guards/auth.guard.ts:5`,
  `core/interceptors/auth.interceptor.ts:4`).
- Guards — функциональные `CanActivateFn`
  (`core/guards/auth.guard.ts:4`, `core/guards/guest.guard.ts:5`).
- Interceptor — функциональный `HttpInterceptorFn`
  (`core/interceptors/auth.interceptor.ts:3`).

### F6. Стиль кода (наблюдаемый)

- Отступ — 2 пробела во frontend (`frontend/src/app/app.config.ts` и др.).
- Одинарные кавычки в TS (`app.config.ts:4-7`); prettier-конфиг:
  printWidth 100, singleQuote true (`frontend/package.json:11-22`).
- SCSS глобально (`frontend/angular.json:9-11`), inline-styles — редко
  (`exercises/order-steps/order-steps.component.ts:51-66`).
- Именование: компоненты `*.component.ts`, сервисы `*.service.ts`, guards
  `*.guard.ts`, interceptor `*.interceptor.ts`, initializer `*.initializer.ts`;
  селекторы с префиксом `app-` (`frontend/angular.json:15`).

## B. Backend (шаг 2)

## 1. Язык и модули

- Node.js ESM: `"type": "module"` (`server/package.json:4`); импорты/экспорты
  ES-синтаксис (`server/src/app.js:1-12`).
- Импорты локальных модулей — с расширением `.js` (`server/src/app.js:6-12`).
- Node built-ins — с префиксом `node:` (`server/src/db/jsonStore.js:1-2`).

## 2. Структура и слои

- Слой «роут-обработчик»: логика endpoint'ов живёт в файлах роутов, без
  отдельных контроллеров/сервисов (`server/src/routes/*.js`).
- Фабричный паттерн: каждый роутер — функция-фабрика, принимающая `db` через
  DI и возвращающая `Router()` (`server/src/app.js:34-38`,
  `routes/auth.js:20-21`).
- Доступ к данным — только через классы-репозитории
  (`server/src/db/repositories/*.js`); роуты не обращаются к `JsonStore`
  напрямую.
- Фабрика БД — `createDb()` в `server/src/db/index.js:8-18`, возвращает
  коллекции `{ users, articles, courses, tests, progress, attempts }`.
- id сущностей — `uuid v4` (`userRepo.js:2,26`; `progressRepo.js:2,21`;
  `attemptRepo.js:2,19`).

## 3. Стиль кода (наблюдаемый)

- Отступ — 4 пробела в server (`server/src/app.js`, `routes/auth.js`).
- Двойные кавычки в server (`routes/auth.js:1-5`); одинарные в конфиге
  (`server/src/config/index.js:1`) — непоследовательно.
- Линтер (ESLint) для server отсутствует (нет в `server/package.json`).
- Асинхронные обработчики: try/catch + `next(e)` в auth-роутах
  (`routes/auth.js:38-40,51-53`); в остальных роутах (articles, courses, tests,
  progress) try/catch отсутствует — необработанное исключение уходит в
  глобальный `errorHandler` (`app.js:40`, `middleware/error.js:1-4`).

## 4. Конвенции API

- Префикс `/api` (`app.js:34-38`).
- Идентификация ресурсов: courses/articles — `:slug`, tests/attempts — `:id`
  (`routes/courses.js:10`, `routes/articles.js:11`, `routes/tests.js:5`,
  `routes/progress.js:16,21`).
- Ошибки: JSON `{ error: string }`; тексты на английском («Not found»,
  «Invalid credentials», «Email taken») и на русском («Заполните все поля»,
  «Имя слишком короткое», «Пользователь не найден») вперемешку
  (`routes/auth.js:27,30,33,47`, `routes/articles.js:13`,
  `routes/auth.js:58`).
- Коды статусов: 400 — валидация, 401 — auth, 404 — не найдено, 409 — конфликт
  (`routes/auth.js:27,33,47`, `middleware/auth.js:11,16`).
- Защита роутов: `authRequired` на уровне router-а (`router.use(authRequired)`,
  `routes/progress.js:6`) или на конкретном маршруте (`routes/auth.js:56`).

## 5. Данные и конфигурация

- Вся конфигурация через env, читается один раз в `server/src/config/index.js:4-9`
  (PORT, JWT_SECRET, DB_BACKEND, DATA_DIR); fallback-значения в коде (:5-8).
- Секреты не в репо: `.env` в gitignore (`.gitignore:5`), образец —
  `server/.env.example`.
- Контент курса хранится как данные (`server/data/*.json`), а не в БД;
  правка контента — правка JSON-файлов.
- Рантайм-данные не коммитятся: `users.json`, `progress.json`,
  `attempts.json` (`.gitignore:26-28`); создаются при старте с `[]`
  (`server/src/db/jsonStore.js:11-21`); в репо — `users.example.json`.
- Секрет от JWT имеет dev-fallback `'dev-secret'` (`config/index.js:6`) —
  ⚠️ inferred: это риск для прод-деплоя (README упоминает прод,
  `README.md:269`).

## 6. Хуки и коммиты

- Conventional Commits; scope-enum: frontend, server, shared, deps, ci
  (`commitlint.config.js:4`); проверка в `.husky/commit-msg:2`.
- pre-commit запускает `npm test` (`.husky/pre-commit:1`), который в корне —
  заглушка (`package.json:9`).

## Открытые вопросы (backend)

1. Единый язык сообщений об ошибках (ru/en вперемешку) — какой выбрать?
2. Отступы/кавычки в server не зафиксированы конфигом (нет .editorconfig/prettier
   для server) — стоит ли добавить?
3. `router.use(authRequired)` в progress vs `authRequired` на маршруте в auth —
   целевой паттерн для будущих роутов?
4. Нужен ли ESLint/prettier для server в рамках стандартов проекта?

## Открытые вопросы (frontend)

1. `ProgressService`/`ProfileComponent` используют `any`
   (`core/services/progress.service.ts:7,9`, `features/profile/profile.component.ts:36-37`)
   — противоречит конвенции единого источника моделей (F1) — типизировать?
2. Ключ `pp_token` дублируется в трёх файлах (`auth.service.ts:6`,
   `auth.guard.ts:5`, `auth.interceptor.ts:4`) — вынести в константу?
3. Новый control flow (@if/@for) не используется при Angular 20 — миграция
   планируется?
4. Inline-шаблоны vs внешние .html — зафиксировать ли конвенцию?