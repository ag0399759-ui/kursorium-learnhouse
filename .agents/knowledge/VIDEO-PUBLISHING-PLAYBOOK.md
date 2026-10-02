# 📹 Як публікувати відео на курсоріум.com через API

> **Метод Андрія Карпачова** — зафіксована інструкція по роботі з LearnHouse API.  
> Створено: 2026-10-02 | Версія: 1.0

---

## Контекст

LearnHouse підтримує два способи додавання відео до уроку:

| Спосіб | Де відео | Endpoint | Потребує JWT? |
|--------|---------|----------|--------------|
| Зовнішнє (YouTube/Vimeo) | На ютубі | POST /api/v1/activities/external_video | API токен |
| Hosted (локальний файл) | На нашому сервері | POST /api/v1/activities/video | API токен |
| Block у Dynamic Page (відео + текст на одній сторінці) | На нашому сервері | POST /api/v1/blocks/video | JWT токен |

ВАЖЛИВО: blockVideo у TipTap сторінці дозволяє мати відео + текст на одній сторінці.

---

## Частина 1: Отримати API Токен (lh_...)

1. Зайти на kursorium.com/dash/developers/api
2. Натиснути "Create Token"
3. Зберегти значення — показується ОДИН раз
4. Додати в .env:
   LEARNHOUSE_API_TOKEN=lh_xxxx

УВАГА: API токен (lh_...) НЕ може завантажувати блоки (blocks/video). Тільки JWT.

---

## Частина 2: Отримати JWT токен

JWT живе 8 годин. Є два способи:

### Спосіб A: Через LH_refresh cookie (рекомендований)

1. Відкрий kursorium.com у браузері (потрібно бути залогіненим)
2. Відкрий DevTools (F12) → вкладка Application
3. Зліва: Cookies → https://kursorium.com
4. Знайди cookie LH_refresh — скопіюй значення (починається з eyJ...)
5. Виконай PowerShell скрипт:

$refreshToken = "eyJ... (твій LH_refresh)"
$handler = [System.Net.Http.HttpClientHandler]::new()
$handler.CookieContainer = [System.Net.CookieContainer]::new()
$handler.UseCookies = $true
$handler.CookieContainer.Add(
    [System.Uri]::new("https://kursorium.com"), 
    [System.Net.Cookie]::new("LH_refresh", $refreshToken)
)
$client = [System.Net.Http.HttpClient]::new($handler)
$r = $client.GetAsync("https://kursorium.com/api/v1/auth/refresh").Result
$jwt = ($r.Content.ReadAsStringAsync().Result | ConvertFrom-Json).access_token

---

## Частина 3: Повний процес публікації уроку (відео + текст)

### Крок 1: Створити курс
POST https://kursorium.com/api/v1/courses/?org_id=1
Authorization: Bearer lh_...
Content-Type: multipart/form-data
Fields: name, description, about, public=true

### Крок 2: Створити главу
POST https://kursorium.com/api/v1/chapters/
Authorization: Bearer lh_...
Content-Type: application/json
Body: {"name":"...","course_id":14,"org_id":1,"lock_type":"public"}

### Крок 3: Створити Dynamic Page activity (порожня)
POST https://kursorium.com/api/v1/activities/
Authorization: Bearer lh_...
Content-Type: application/json
Body: {"name":"...","chapter_id":29,"activity_type":"TYPE_DYNAMIC","activity_sub_type":"SUBTYPE_DYNAMIC_PAGE","content":{},"published":true}

### Крок 4: Завантажити відео як BLOCK (потрібен JWT!)
POST https://kursorium.com/api/v1/blocks/video
Authorization: Bearer eyJ... (JWT)
Content-Type: multipart/form-data
Fields: activity_uuid=activity_xxx, file_object=@відео.mp4 (video/mp4)

### Крок 5: Оновити сторінку з blockVideo + текст
PUT https://kursorium.com/api/v1/activities/{activity_uuid}
Authorization: Bearer eyJ... (JWT)
Content-Type: application/json
Body: {
  "content": {
    "type": "doc",
    "content": [
      {"type": "blockVideo", "attrs": {"blockObject": <ПОВНИЙ BlockRead об'єкт з кроку 4>}},
      {"type": "heading", "attrs": {"level": 2}, "content": [{"type": "text", "text": "Заголовок"}]},
      {"type": "paragraph", "content": [{"type": "text", "text": "Текст..."}]}
    ]
  },
  "published": true
}

---

## Важливі константи

org_id = 1 (завжди)
org_slug = default
API URL = https://kursorium.com/api/v1
Ania user_id = 2
LH_refresh живе = 30 днів
JWT живе = 8 годин

## Обмеження API токену (lh_...)

НЕ може: завантажувати blocks (/api/v1/blocks/*)
НЕ може: отримувати профіль користувача
НЕ може: видавати токени для адмінів
МОЖЕ: створювати курси, глави, activities
МОЖЕ: публікувати/оновлювати/видаляти activities

---
Документ створено: 2026-10-02 | Метод Андрія Карпачова
