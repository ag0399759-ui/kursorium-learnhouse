# Тестування LearnHouse API на kursorium.com

**Дата:** 2026-09-11  
**API ключ:** `lh_EZalTxekceqeTtBwMD3h-WdMzkPUH4IjtLr1QwzXyK0`  
**Базовий URL:** `https://kursorium.com`

## Статус тестування

### ✅ Працюючі endpoints

#### `/api/health`
- **Метод:** GET
- **Статус:** 200 OK
- **Відповідь:**
```json
{
  "status": "healthy",
  "timestamp": "2026-09-11T11:27:56.671Z"
}
```
- **Примітка:** Endpoint для перевірки здоров'я сервісу, не потребує автентифікації

## ❌ Endpoints що не працюють

### Тестовані endpoints з різними помилками:

#### 1. `/api/general/config` - 404 Not Found
#### 2. `/api/orgs/kursorium` - 404 Not Found
#### 3. `/api/courses` - 404 Not Found
#### 4. `/api/users/me` - 404 Not Found
#### 5. `/api/general/info` - 404 Not Found

### З префіксом `/api/v1/`:

#### 6. `/api/v1/orgs/` - 405 Method Not Allowed (GET)
#### 7. `/api/v1/courses/` - 401 Could not validate credentials (POST)
- Можливо потребує іншого формату автентифікації
#### 8. `/api/v1/users/me/` - 405 Method Not Allowed (GET)
#### 9. `/api/v1/general/config/` - 404 Not Found
#### 10. `/api/v1/organizations/` - 404 Not Found
#### 11. `/api/v1/auth/me/` - 404 Not Found

## Висновки

1. **API endpoint structure:** Сервер очікує trailing slash (`/`) в URLs
2. **Префікс версії:** Endpoints знаходяться під `/api/v1/`, а не `/api/`
3. **Методи HTTP:** Деякі endpoints повертають 405 Method Not Allowed, що вказує на неправильний HTTP метод
4. **Автентифікація:** При POST на `/api/v1/courses/` повернуто 401 з повідомленням "Could not validate credentials"
5. **Redirects:** GET запити без trailing slash редиректять (307) на URL з trailing slash

## Проблеми

- **API ключ може бути недійсним** - POST до `/api/v1/courses/` повертає 401
- **Невідома структура API** - більшість endpoints повертають 404 або 405
- **Документація API відсутня** - неможливо визначити правильні endpoints без документації

## Рекомендації

1. Перевірити дійсність API ключа в панелі адміністратора LearnHouse
2. Знайти офіційну документацію LearnHouse API
3. Перевірити логи сервера для деталей про невдалі запити
4. Можливо API потребує іншого формату Bearer token або додаткових headers
