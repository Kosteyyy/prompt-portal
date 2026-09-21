# TASKS — бэклог работ (шаг 4)

> Шаблон. Ведение:
> - одна задача = один пункт таблицы или один чекбокс;
> - статус: `todo` / `in progress` / `done` / `blocked`;
> - у каждой задачи: источник (файл:строка или документ из `docs/ai/`),
>   приоритет (P0–P3), исполнитель, ссылка на PR;
> - после завершения — краткий результат одной строкой;
> - новые задачи из «Открытых вопросов» других документов переносить сюда
>   с пометкой источника.

## Активные задачи

| ID | Статус | Приоритет | Задача | Источник | Исполнитель | PR |
|---|---|---|---|---|---|---|
| — | — | — | (пусто) | — | — | — |

## Бэклог (кандидаты из «Открытых вопросов» документации)

> ⚠️ Ни одна из задач ниже не подтверждена владельцем — сначала закрыть
> соответствующие «Открытые вопросы» в исходных документах.

- [ ] Потеря `name` при регистрации (`server/src/db/repositories/userRepo.js:24`)
      — DECISIONS/ARCHITECTURE OQ; уточнить: баг или осознанно. (P?)
- [ ] Захардкоженный CatalogComponent (`frontend/src/app/features/catalog/catalog.component.ts:12-21`)
      — FRONTEND.md OQ1. (P?)
- [ ] `any` в ProgressService/ProfileComponent (`core/services/progress.service.ts:7,9`)
      — FRONTEND.md OQ4. (P?)
- [ ] Дублирование ключа `pp_token` в трёх файлах (`auth.service.ts:6`,
      `auth.guard.ts:5`, `auth.interceptor.ts:4`) — FRONTEND.md OQ2. (P?)
- [ ] Тесты отсутствуют при настроенном karma/jasmine (`package.json:9`)
      — DECISIONS.md OQ5. (P?)
- [ ] `JWT_SECRET` dev-fallback `'dev-secret'` (`server/src/config/index.js:6`)
      — риск для прод. (P?)
- [ ] Исторические попытки с несуществующим `testId: "prompt-basics-test"`
      (`server/src/data/attempts.json:5,50`) — DATA_MODEL.md OQ2. (P?)
- [ ] `authOptional` не используется (`server/src/middleware/auth.js:20`)
      — ARCHITECTURE.md OQ1. (P?)
- [ ] Результат теста не переживает F5 (`frontend/src/app/features/test-result/test-result.component.ts:33`)
      — FRONTEND.md OQ3. (P?)
- [ ] Сервер доверяет score клиента (`server/src/routes/progress.js:21-31`)
      — API.md OQ2, DECISIONS.md OQ4. (P?)

## Выполнено

| ID | Задача | Результат | Дата | PR |
|---|---|---|---|---|
| — | — | — | — | — |
