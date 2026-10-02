# 🚀 Kursorium — Налаштування на новому ПК

> Цей файл пояснює як повністю відновити проект на новому комп'ютері.

---

## 📋 Що це за проект?

**Kursorium** — платформа онлайн-курсів на базі LearnHouse (Open Source LMS).

| Компонент | Технологія | Де розміщено |
|-----------|-----------|--------------|
| Бекенд (API) | Python + FastAPI | Railway.app |
| Фронтенд (Web) | Next.js | Railway.app |
| База даних | PostgreSQL | Railway.app |
| Кеш | Redis | Railway.app |
| DNS / CDN | Cloudflare | cloudflare.com |
| Домен | kursorium.com | Cloudflare |
| Код | GitHub | github.com/ag0399759-ui/kursorium-learnhouse |

---

## 🖥️ Крок 1 — Встановити програми на новий ПК

### Обов'язкові:

```bash
# 1. Git
# macOS: встановлюється автоматично при першому git-команді
# Windows: https://git-scm.com/download/win

# 2. Node.js (LTS версія)
# https://nodejs.org/

# 3. Bun (менеджер пакетів)
curl -fsSL https://bun.sh/install | bash

# 4. Python 3.11+
# https://www.python.org/downloads/

# 5. Railway CLI (для керування деплоєм)
npm install -g @railway/cli
```

---

## 📥 Крок 2 — Скачати проект з GitHub

```bash
# Клонуй репозиторій
git clone https://github.com/ag0399759-ui/kursorium-learnhouse.git kursorium

# Перейди в папку
cd kursorium

# Перейди на потрібну гілку
git checkout dev
```

---

## 🔑 Крок 3 — Додати секретні ключі (вручну!)

> ⚠️ Ключі НЕ зберігаються на GitHub з міркувань безпеки.
> Тобі потрібно вручну створити файл .env в корені проекту.

Створи файл .env і встав свої ключі (дивись MY-SECRETS.md який зберігаєш особисто):

```bash
# Відкрий редактор і встав ключі
nano .env
```

Шаблон що вписувати — дивись у .env.example

---

## ▶️ Крок 4 — Запустити локально (якщо потрібно)

```bash
# Встанови залежності
bun install

# Запусти фронтенд (Next.js)
cd apps/web
bun dev

# В іншому терміналі — запусти бекенд (Python API)
cd apps/api
python app.py
```

---

## 🚂 Крок 5 — Підключитись до Railway (для деплою)

```bash
# Увійди в Railway
railway login

# Підключи до існуючого проекту
railway link

# Перевір статус
railway status
```

---

## 🌐 Де що знаходиться

| Сервіс | Адреса |
|--------|--------|
| 🌍 Сайт | https://kursorium.com |
| 🔧 Railway Dashboard | https://railway.app/project/d5b3c2ff-67ec-4746-bed1-8548578e5f67 |
| ☁️ Cloudflare | https://dash.cloudflare.com/ |
| 🐙 GitHub Repo | https://github.com/ag0399759-ui/kursorium-learnhouse |
| 📧 Admin email | ag0399759@gmail.com |

---

## 📁 Структура проекту

```
kursorium/
├── apps/
│   ├── api/            ← Бекенд (Python/FastAPI)
│   │   ├── app.py      ← Головний файл API
│   │   ├── src/        ← Основний код
│   │   └── migrations/ ← Міграції бази даних
│   └── web/            ← Фронтенд (Next.js)
│       ├── app/        ← Сторінки сайту
│       ├── components/ ← UI компоненти
│       └── services/   ← Підключення до API
├── docker/             ← Docker конфіги
├── .env                ← ⚠️ СЕКРЕТНІ КЛЮЧІ (НЕ на GitHub!)
├── .env.example        ← Шаблон ключів (на GitHub, без значень)
└── SETUP-NEW-PC.md     ← Цей файл
```

---

## ❓ Часті питання

**Q: Де взяти RAILWAY_TOKEN?**
A: railway.app → профіль → Account Settings → Tokens → New Token

**Q: Де взяти CLOUDFLARE_API_KEY?**
A: dash.cloudflare.com → My Profile → API Tokens → Create Token

**Q: Де взяти GITHUB_TOKEN?**
A: github.com → Settings → Developer settings → Personal access tokens → Generate new token

**Q: Щось не працює після клонування?**
A: Перевір що файл .env створено і всі ключі заповнені правильно.

---

*Останнє оновлення: жовтень 2026*
