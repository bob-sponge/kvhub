# kvhub

Key value system.

## First Step

### If no postgres database

- Create postgres docker

  ```bash
  docker pull postgres:9.0

  docker run --name pgsql -e POSTGRES_PASSWORD=${your password} -p 5432:5432 -d postgres:9.0

  docker ps -a
  ```

  > tips: using the latest version of postgres image will cause the lower version of Navicat to not display the table properly

- Create the database manually: i18n

### If no tables

```js
yarn migration
```

---

## Database

### Create a migration

```js
yarn typeorm migration:create -n Migration
```

### Generate a migration

```js
yarn typeorm migration:generate -n Migration
```

### Run migration

```js
yarn migration
```

---

## yarn workspace

use yarn workspace

add dependency for @kvhub/front

```
yarn workspace @kvhub/front add xxx
```

add dependency for @kvhub/server

```
yarn workspace @kvhub/server add xxx
```
