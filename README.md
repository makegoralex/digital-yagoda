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

Ниже — детальная инструкция «что вводить в терминал», если сервер уже выдаёт заглушку «сервер запущен» и вы хотите поднять эту платформу. Все команды предполагаются под пользователем с правами `sudo`.

1. **Обновите пакеты и установите зависимости**
   ```bash
   sudo apt update
   sudo apt install -y curl git build-essential
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt install -y nodejs
   curl -fsSL https://get.pnpm.io/install.sh | sh -
   source ~/.bashrc   # чтобы pnpm попал в PATH текущей сессии
   pnpm --version     # проверка, что pnpm доступен
   node --version     # проверка Node.js
   ```

2. **Подготовьте директорию проекта**
   ```bash
   sudo mkdir -p /home/project
   sudo chown $USER:$USER /home/project
   cd /home/project
   ```

3. **Склонируйте репозиторий и установите зависимости**
   ```bash
   git clone https://github.com/<your-org>/digital-yagoda.git .
   pnpm install --frozen-lockfile
   pnpm -r run build
   ```
   После сборки создайте файл окружения:
   ```bash
   mkdir -p shared
   cp .env.example shared/.env
   nano shared/.env
   ```
   В открывшемся редакторе пропишите реальные значения (MongoDB URI, JWT_SECRET и т.д.), сохраните (`Ctrl+O`, `Enter`) и выйдите (`Ctrl+X`).

4. **Запустите API и Web через PM2**
   ```bash
   pnpm dlx pm2 install pm2-logrotate
   pnpm dlx pm2 start infra/pm2/ecosystem.config.js
   pnpm dlx pm2 save
   pnpm dlx pm2 status
   ```
   В статусе должны появиться процессы `pos-api` (порт 3000) и `pos-web` (порт 3001). Чтобы перезапускать приложение при обновлении кода, используйте:
   ```bash
   cd /home/project
   git pull
   pnpm install --frozen-lockfile
   pnpm -r run build
   pnpm dlx pm2 reload all
   ```

5. **Настройте Nginx как обратный прокси**
   ```bash
   sudo nano /etc/nginx/sites-available/pos.conf
   ```
   Вставьте конфигурацию:
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
   Сохраните файл, затем выполните:
   ```bash
   sudo ln -s /etc/nginx/sites-available/pos.conf /etc/nginx/sites-enabled/pos.conf
   sudo nginx -t
   sudo systemctl reload nginx
   ```
   После этого открытие `http://95.163.232.252/` должно отдавать фронтенд, а `http://95.163.232.252/api/healthz` — ответ API. Для HTTPS установите сертификаты через `sudo snap install --classic certbot` и `sudo certbot --nginx -d 95.163.232.252` (или домен, если есть).

6. **Проверка логов и остановка процессов**
   ```bash
   pnpm dlx pm2 logs        # просмотр логов в реальном времени
   pnpm dlx pm2 stop all    # остановка обоих процессов при необходимости
   pnpm dlx pm2 start all   # запуск снова
   ```

Следуя шагам последовательно, вы получите работающий бекенд и фронтенд на вашем сервере. При изменениях кода достаточно выполнить блок обновления из шага 4.

## CI/CD

GitHub Actions выполняет линт, тесты и сборку на каждом коммите в ветки `develop` и `main`. При успешной сборке артефакты доставляются на сервер, где PM2 перезапускает процессы `pos-api` и `pos-web`.

## PWA

В `apps/web/public/manifest.json` и `public/service-worker.js` настроены базовые параметры PWA: standalone режим, app shortcuts и иконки. Для iOS добавлены meta-теги в `_app.tsx`.

## Лицензия

Proprietary — все права защищены.
