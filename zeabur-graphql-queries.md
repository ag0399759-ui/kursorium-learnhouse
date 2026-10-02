# Zeabur GraphQL API - Робочі запити

## Автентифікація

```bash
Authorization: Bearer zat_6aa292ee7ea353cee78e0701_igrcvxjzo32rtop7b534yxkwrrod3eox
```

API URL: `https://api.zeabur.com/graphql`

---

## 1. Поточний користувач

```graphql
query {
  me {
    _id
    username
    email
  }
}
```

**Приклад відповіді:**
```json
{
  "data": {
    "me": {
      "_id": "6aa292ee7ea353cee78e0701",
      "username": "ag0399759",
      "email": "ag0399759@gmail.com"
    }
  }
}
```

---

## 2. Список всіх проектів

```graphql
query {
  projects {
    edges {
      node {
        _id
        name
        owner {
          username
        }
        region {
          id
          name
        }
      }
    }
  }
}
```

**Приклад відповіді:**
```json
{
  "data": {
    "projects": {
      "edges": [
        {
          "node": {
            "_id": "6aa3aa9da667f4614aa31e80",
            "name": "untitled-1",
            "owner": {
              "username": "ag0399759"
            },
            "region": {
              "id": "server-6aa297b04dc24ca0d27dee37",
              "name": "Aliyun Frankfurt 2C 4GB"
            }
          }
        }
      ]
    }
  }
}
```

---

## 3. Інформація про конкретний проект

```graphql
query {
  project(_id: "6aa3aa9da667f4614aa31e80") {
    _id
    name
    owner {
      username
    }
    services {
      _id
      name
      status
      template
    }
  }
}
```

---

## 4. Інформація про сервіс

```graphql
query {
  service(_id: "6aa3aac26c9b434a99e09946") {
    _id
    name
    status
    template
    podStatuses {
      name
      status
    }
  }
}
```

**Приклад відповіді:**
```json
{
  "data": {
    "service": {
      "_id": "6aa3aac26c9b434a99e09946",
      "name": "Learnhouse",
      "status": "RUNNING",
      "podStatuses": [
        {
          "name": "service-6aa3aac26c9b434a99e09946-777fc7bbc4-dqfxv",
          "status": "READY"
        }
      ]
    }
  }
}
```

---

## 5. Runtime логи сервісу

```graphql
query {
  runtimeLogs(serviceID: "6aa3aac26c9b434a99e09946") {
    message
    timestamp
    stream
    region
  }
}
```

**Приклад відповіді:**
```json
{
  "data": {
    "runtimeLogs": [
      {
        "message": "INFO:     10.42.0.1:0 - \"GET /api/v1/users/session HTTP/1.1\" 200 OK",
        "timestamp": "2026-09-11T11:48:01.154242503Z",
        "stream": "",
        "region": ""
      },
      {
        "message": "INFO:     10.42.0.1:0 - \"GET /api/v1/users/session HTTP/1.1\" 200 OK",
        "timestamp": "2026-09-11T11:46:57.791496093Z",
        "stream": "",
        "region": ""
      }
    ]
  }
}
```

---

## 6. Build логи деплоймента

```graphql
query {
  buildLogs(deploymentID: "DEPLOYMENT_ID") {
    message
    timestamp
  }
}
```

**Примітка:** `projectID` deprecated, достатньо лише `deploymentID`.

---

## cURL приклади

### Поточний користувач
```bash
curl -X POST https://api.zeabur.com/graphql \
  -H "Authorization: Bearer zat_6aa292ee7ea353cee78e0701_igrcvxjzo32rtop7b534yxkwrrod3eox" \
  -H "Content-Type: application/json" \
  -d '{"query":"query { me { _id username email } }"}'
```

### Список проектів
```bash
curl -X POST https://api.zeabur.com/graphql \
  -H "Authorization: Bearer zat_6aa292ee7ea353cee78e0701_igrcvxjzo32rtop7b534yxkwrrod3eox" \
  -H "Content-Type: application/json" \
  -d '{"query":"query { projects { edges { node { _id name owner { username } region { id name } } } } }"}'
```

### Runtime логи
```bash
curl -X POST https://api.zeabur.com/graphql \
  -H "Authorization: Bearer zat_6aa292ee7ea353cee78e0701_igrcvxjzo32rtop7b534yxkwrrod3eox" \
  -H "Content-Type: application/json" \
  -d '{"query":"query { runtimeLogs(serviceID: \"6aa3aac26c9b434a99e09946\") { message timestamp stream region } }"}'
```

---

## Корисні типи

### RuntimeLog
- `message: String!` - текст лог-повідомлення
- `timestamp: Time!` - час події
- `stream: String!` - stdout/stderr
- `region: String!` - регіон
- `zeaburUID: String!` - унікальний ідентифікатор

### PodStatusInfo
- `name: String!` - назва поду
- `status: PodStatus!` - статус (READY, PENDING, тощо)

### Service
- `_id: ObjectID!`
- `name: String!`
- `status: ServiceStatus!` - RUNNING, STOPPED, тощо
- `template: String` - шаблон сервісу
- `podStatuses: [PodStatusInfo!]!`

---

## Додаткові queries

- `searchRuntimeLogs` - пошук логів з фільтрацією (тільки для dedicated кластерів)
- `aihubSpendLogs` - витрати AI Hub
- `serverSSHLoginStats` - статистика SSH логінів

**Примітка:** Zeabur GraphQL API не підтримує параметр `limit` для `runtimeLogs` - повертає фіксовану кількість останніх логів.
