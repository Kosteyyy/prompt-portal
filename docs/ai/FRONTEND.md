# FRONTEND (шаг 3)

> Факты из кода `frontend/src`. Angular 20 standalone, без NgModules
> (`frontend/src/app/app.component.ts:7`, `app.config.ts:9-19`).

## 1. Точка входа и конфигурация

| Что | Файл | Источник |
|---|---|---|
| bootstrap | `bootstrapApplication(AppComponent, appConfig)` | `frontend/src/main.ts:5` |
| Корневой компонент | `<app-header/>` + `<router-outlet/>` | `frontend/src/app/app.component.ts:9-12` |
| Провайдеры | `provideRouter(routes)`, `provideHttpClient(withInterceptors([authInterceptor]))`, `APP_INITIALIZER → initAuth(AuthService)` | `frontend/src/app/app.config.ts:11-18` |
| Dev API base | `apiBase: 'http://localhost:3000/api'` | `frontend/src/environments/environment.ts:3` |
| Prod API base | `apiBase: '/api'` | `frontend/src/environments/environment.prod.ts:3` |
| Dev-прокси | `/api`, `/images` → `localhost:3000` | `frontend/proxy.conf.json:1-11` |

APP_INITIALIZER (`app.config.ts:14-18`) вызывает `initAuth` →
`firstValueFrom(auth.loadMe())` (`core/initializers/auth.initializer.ts:4-6`) —
восстановление сессии при старте.

## 2. Роутинг (все lazy, `loadComponent`)

`frontend/src/app/app.routes.ts:5-56`:

| Путь | Компонент | Guard |
|---|---|---|
| `/` | LandingComponent (:8-9) | — |
| `/auth/login` | LoginComponent (:12-14) | guestGuard (:13) |
| `/auth/register` | RegisterComponent (:18-21) | guestGuard (:19) |
| `/courses` | CatalogComponent (:24-26) | — |
| `/courses/:slug` | CourseComponent (:29-31) | — |
| `/articles/:slug` | ArticleComponent (:34-36) | — |
| `/tests/:id` | TestComponent (:39-41) | authGuard (:40) |
| `/tests/:id/result` | TestResultComponent (:44-47) | authGuard (:45) |
| `/profile` | ProfileComponent (:50-53) | authGuard (:51) |
| `**` | redirectTo `/` (:55) | — |

## 3. Core

### 3.1 Models (`frontend/src/app/core/models/index.ts`)

`ExerciseType` (6 значений, :1-7), `ExerciseConfig` (общие поля + опциональные
поля всех 6 типов, :31-56), `Block` union: `text | code | image | exercise`
(:58-62), `Article` (:64-71), `Course` (:73-79), `Test` (:81-86), `User`
(:88-93), `ExerciseResult` (:95-101), `ExerciseMode` (:103).

⚠️ inferred: модель `Block` содержит `code` (:60), но в данных backend
`articles.json` тип `code` не встречается (см. DATA_MODEL.md §2) — тип шире
фактических данных; ArticleComponent рендерит `code` (`features/article/article.component.ts:33`).

### 3.2 Services и их эндпоинты (база: `environment.apiBase`, `api.service.ts:8,11,14`)

| Сервис | Метод | HTTP | Путь (→ API.md) | Источник |
|---|---|---|---|---|
| ApiService | `get<T>(path, params?)`, `post<T>(path, body)` | — | обёртка над HttpClient | `core/services/api.service.ts:10-15` |
| AuthService | `login` | POST | `/auth/login` | `core/services/auth.service.ts:20-24` |
| AuthService | `register` | POST | `/auth/register` | `auth.service.ts:25-29` |
| AuthService | `loadMe` | GET | `/auth/me` | `auth.service.ts:35-43` |
| AuthService | `logout` | — | без запроса | `auth.service.ts:30-33` |
| ArticleService | `list(course?)` | GET | `/articles?course=` | `core/services/article.service.ts:8-10` |
| ArticleService | `get(slug)` | GET | `/articles/:slug` | `article.service.ts:11` |
| ArticleService | `getTest(id)` | GET | `/tests/:id` | `article.service.ts:12` |
| CourseService | `list()` | GET | `/courses` | `core/services/course.service.ts:9-11` |
| CourseService | `get(slug)` | GET | `/courses/:slug` | `course.service.ts:13-15` |
| ProgressService | `getOverview()` | GET | `/progress` | `core/services/progress.service.ts:7` |
| ProgressService | `markArticle(slug)` | POST | `/progress/article/:slug` | `progress.service.ts:8` |
| ProgressService | `saveAttempt(testId, payload)` | POST | `/progress/test/:id` | `progress.service.ts:9` |
| TestSessionService | — | — | без HTTP, только состояние | `core/services/test-session.service.ts:5-25` |

Замечания:
- Все сервисы `providedIn: 'root'`.
- AuthService хранит JWT в `localStorage` под ключом `pp_token`
  (`auth.service.ts:6,14,31,46`), пользователь — в signal `user` (:11).
- TestSessionService: signals `exercises/index/results` + computed
  `total/current/score/maxScore/finished/answeredCurrent`
  (`test-session.service.ts:6-17`); `maxScore` считается как сумма `weight ?? 1`
  (:13-14).
- ⚠️ inferred: `ProgressService` типизирует ответы как `any`/`{articles: any[]}`
  (`progress.service.ts:7-9`) — контракт с API.md неформализован.
- `CourseService.list()` объявлен (`course.service.ts:9-11`), но в компонентах
  не вызывается — единственный вызов `list()` для статей:
  `ArticleService.list` (`course.component.ts:41`, `article.component.ts:117`).

### 3.3 Guards / Interceptor / Initializer

| Артефакт | Поведение | Источник |
|---|---|---|
| `authGuard` | проверяет `localStorage['pp_token']` напрямую (не через AuthService), редирект `/auth/login` | `core/guards/auth.guard.ts:4-8` |
| `guestGuard` | если `auth.isAuthed` → `UrlTree` на `/courses` | `core/guards/guest.guard.ts:5-9` |
| `authInterceptor` | добавляет `Authorization: Bearer` ко всем запросам с токеном, **кроме** `/auth/login` и `/auth/register` | `core/interceptors/auth.interceptor.ts:3-12` |
| `initAuth` | APP_INITIALIZER, восстановление user | `core/initializers/auth.initializer.ts:4-6` |

⚠️ inferred: `authGuard` дублирует ключ токена `'pp_token'` строкой
(`auth.guard.ts:5`), а не использует `AuthService` — рассинхронизация при
смене ключа возможна.

## 4. Компоненты

### 4.1 Shared

| Компонент | Selector | Назначение | Источник |
|---|---|---|---|
| HeaderComponent | `app-header` | навигация; имя/email из `auth.user()`; logout → `navigate('/')` | `shared/components/header/header.component.ts:6-36` |
| ProgressBarComponent | `app-progress-bar` | `@Input value/max`, ширина в % | `shared/components/progress-bar/progress-bar.component.ts:3-14` |

### 4.2 Features (8 страниц)

| Компонент | Источник | Данные | API-вызовы |
|---|---|---|---|
| LandingComponent | `features/landing/landing.component.ts:23-25` | только `AuthService.isAuthed` | нет |
| LoginComponent | `features/auth/login.component.ts:27-33` | форма ngModel | `auth.login` → POST `/auth/login`; редирект `/courses` |
| RegisterComponent | `features/auth/register.component.ts:60-70`; валидация: name 2–50, password min 6 (:24-30,40) | форма ngModel | `auth.register` → POST `/auth/register`; редирект `/courses` |
| CatalogComponent | `features/catalog/catalog.component.ts:19-22` | карточка курса захардкожена в шаблоне (:12-16); `ngOnInit` пустой (:21) | **нет** |
| CourseComponent | `features/course/course.component.ts:37-42` | signals course/articles | GET `/courses/:slug`, GET `/articles?course=` |
| ArticleComponent | `features/article/article.component.ts:101-129` | signals article/course/articles; сортировка статей по порядку `course.articles` (:118-124); prev/next computed (:82-92) | GET `/articles/:slug`, GET `/courses/:slug`, GET `/articles?course=`; `complete()` → POST `/progress/article/:slug` (:135-138) |
| TestComponent | `features/test/test.component.ts:55-69` | состояние в TestSessionService | GET `/tests/:id`; `save()` → POST `/progress/test/:id` (:63-68), редирект `/tests/:id/result` |
| TestResultComponent | `features/test-result/test-result.component.ts:32-38` | читает TestSessionService (percent из score/maxScore) | нет |
| ProfileComponent | `features/profile/profile.component.ts:39-44` | signals `articles/attempts` типа `any` (:36-37) | GET `/progress` |

### 4.3 Exercises

| Компонент | Selector | Оценка (частичный балл?) | Источник |
|---|---|---|---|
| BaseExerciseComponent | `@Directive()` абстрактный базовый класс | `emitResult(score, partial)` округляет до 0.01, эмитит `ExerciseResult` с `isCorrect: s === max` | `exercises/base-exercise.component.ts:4-27` |
| ExerciseHostComponent | `app-exercise-host` | ngSwitch по `config.type`, 6 кейсов; пробрасывает `[config]/[mode]/(answered)`; словарь русских label'ов (:38-47) | `exercises/exercise-host/exercise-host.component.ts:11-48` |
| FeedbackPanelComponent | `app-feedback-panel` | 3 состояния: ✓ / ◐ / ✗ + explanation | `exercises/feedback-panel/feedback-panel.component.ts:4-27` |
| MultipleChoiceComponent | `app-multiple-choice` | точное совпадение множеств (exact), **без частичного** | `exercises/multiple-choice/multiple-choice.component.ts:45-52` |
| TrueFalseComponent | `app-true-false` | `choice === correctBool`, без частичного | `exercises/true-false/true-false.component.ts:30` |
| FillTheBlankComponent | `app-fill-the-blank` | нормализация trim/lowercase/пробелы (`fill-the-blank.component.ts:38`), без частичного | `fill-the-blank.component.ts:34-41` |
| MatchPairsComponent | `app-match-pairs` | частичный: `(correct/total)*max` (:81); правая колонка перемешивается (:48-51) | `exercises/match-pairs/match-pairs.component.ts:43-91` |
| OrderStepsComponent | `app-order-steps` | частичный по позициям (:141-150); drag-n-drop (:93-137) + кнопки ↑/↓ (:82-89); перемешивание при старте (:76-78) | `exercises/order-steps/order-steps.component.ts:68-161` |
| PromptBuilderComponent | `app-prompt-builder` | частичный по назначениям слотов (:47-54); select-списки | `exercises/prompt-builder/prompt-builder.component.ts:36-57` |

Общий контракт: `@Input config` (required), `@Input mode` ('inline'|'test'),
`@Output answered: ExerciseResult`; retry-кнопка только при `mode === 'inline'`
(например `multiple-choice.component.ts:26`).

## 5. Поток данных Angular → API

```
Компонент
  → Service (ArticleService/CourseService/ProgressService/AuthService)
    → ApiService.get/post (api.service.ts:10-15)  [base = environment.apiBase]
      → authInterceptor (Bearer из localStorage['pp_token'], кроме login/register)
        → proxy /api → localhost:3000 (dev, proxy.conf.json) → Express роуты (API.md)
```

Пример теста: `TestComponent.ngOnInit` → GET `/tests/:id` →
`TestSessionService.start(exercises)` (`test.component.ts:55-59`) → ответы
компонентов через `ExerciseHostComponent.answered` → `session.submit` (:61) →
`save()` → POST `/progress/test/:id` c `{answers, score, maxScore}`
(:63-68) → редирект `/tests/:id/result`.

## 6. Состояние

- Сессия авторизации: `AuthService.user` (signal) + token в localStorage
  (`auth.service.ts:11-14`).
- Сессия теста: `TestSessionService` (signals + computed,
  `test-session.service.ts:6-24`), `providedIn: 'root'` — не переживает
  перезагрузку страницы; TestResultComponent читает те же signals
  (`test-result.component.ts:33`) — ⚠️ inferred: после F5 на
  `/tests/:id/result` будет «Нет данных» (:29).
- Данные страниц — локальные signals компонентов, без NgRx/сторе.

## Открытые вопросы

1. `CatalogComponent` не использует API и захардкожен
   (`catalog.component.ts:12-21`) — заменить на `CourseService.list()`?
2. `authGuard` читает `'pp_token'` напрямую, минуя `AuthService`
   (`auth.guard.ts:5`) — осознанно?
3. Результат теста хранится только в памяти (`test-result.component.ts:33`) —
   нужна ли загрузка результата с сервера после F5?
4. `ProgressService`/`ProfileComponent` используют `any`
   (`progress.service.ts:7,9`, `profile.component.ts:36-37`) — планируется ли
   типизация ProgressRecord/Attempt (см. DATA_MODEL.md)?
5. Тип `Block.code` объявлен в моделях (`core/models/index.ts:60`), но данных
   с таким типом нет в `articles.json` — используется ли где-то ещё?