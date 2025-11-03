# Digital Yagoda POS Platform

Мульти-ресторанная SaaS POS-платформа. Репозиторий организован как монорепо с приложениями API и Web, а также общими пакетами UI/Core/SDK.

## Структура

```
apps/
  api/      # Express + TypeScript API (JWT, Auth, компании, точки)
  web/      # Next.js PWA (POS, админка, KDS)
packages/
  core/     # Общие типы и контрактные интерфейсы
  ui/       # Минимальный UI-kit (кнопки, темы)
  sdk/      # JS SDK для взаимодействия с API
infra/
  nginx/    # Пример конфигурации Nginx
  pm2/      # Ecosystem файл для PM2
```

## Быстрый старт

```bash
pnpm install
pnpm -r run build
pnpm --filter @digital-yagoda/api dev
pnpm --filter @digital-yagoda/web dev
```

Переменные окружения описаны в файле `.env.example`. Для локального запуска создайте `.env` и укажите строку подключения MongoDB и секреты JWT.

## CI/CD

GitHub Actions выполняет линт, тесты и сборку на каждом коммите в ветки `develop` и `main`. При успешной сборке артефакты доставляются на сервер, где PM2 перезапускает процессы `pos-api` и `pos-web`.

## PWA

В `apps/web/public/manifest.json` и `public/service-worker.js` настроены базовые параметры PWA: standalone режим, app shortcuts и иконки. Для iOS добавлены meta-теги в `_app.tsx`.

## Лицензия

Proprietary — все права защищены.
