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

## Развёртывание на сервер (пример: https://95.163.232.252)

1. **Подготовьте окружение**
   ```bash
   sudo apt update
   sudo apt install -y curl git build-essential
   curl -fsSL https://get.pnpm.io/install.sh | sh -
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt install -y nodejs
   ```
   После установки перезайдите в shell или выполните `source ~/.bashrc`, чтобы `pnpm` попал в `PATH`.

2. **Разверните код в `/home/project`**
   ```bash
   sudo mkdir -p /home/project
   sudo chown $USER:$USER /home/project
   cd /home/project
   git clone https://github.com/<your-org>/digital-yagoda.git .
   pnpm install --frozen-lockfile
   pnpm -r run build
   mkdir -p shared
   cp .env.example shared/.env
   # отредактируйте shared/.env и пропишите реальные значения (Mongo, JWT, SMTP и т.д.)
   ```

3. **Запустите процессы через PM2**
   ```bash
   pnpm dlx pm2 install pm2-logrotate
   pnpm dlx pm2 start infra/pm2/ecosystem.config.js
   pnpm dlx pm2 save
   ```
   При обновлениях выполняйте:
   ```bash
   git pull
   pnpm install --frozen-lockfile
   pnpm -r run build
   pnpm dlx pm2 reload all
   ```

4. **Настройте Nginx**
   ```nginx
   server {
     listen 80;
     server_name 95.163.232.252;

     location /api/ {
       proxy_pass http://127.0.0.1:3000/;
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
     }

     location / {
       proxy_pass http://127.0.0.1:3001/;
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
     }
   }
   ```
   Сохраните конфигурацию как `/etc/nginx/sites-available/pos.conf`, выполните `sudo ln -s /etc/nginx/sites-available/pos.conf /etc/nginx/sites-enabled/`, затем `sudo nginx -t` и `sudo systemctl reload nginx`. Для HTTPS подключите сертификат (например, через `certbot --nginx`) и добавьте 443-блок.

После применения шагов сайт по адресу `http://95.163.232.252/` будет отдавать Next.js приложение, а API станет доступен по `http://95.163.232.252/api/`. При настройке сертификата адрес можно переключить на `https://`.

## CI/CD

GitHub Actions выполняет линт, тесты и сборку на каждом коммите в ветки `develop` и `main`. При успешной сборке артефакты доставляются на сервер, где PM2 перезапускает процессы `pos-api` и `pos-web`.

## PWA

В `apps/web/public/manifest.json` и `public/service-worker.js` настроены базовые параметры PWA: standalone режим, app shortcuts и иконки. Для iOS добавлены meta-теги в `_app.tsx`.

## Лицензия

Proprietary — все права защищены.
