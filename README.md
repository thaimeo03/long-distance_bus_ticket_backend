# Backend bus ticket

## 1. Installation

- Clone this project
  `git clone https://github.com/thaimeo03/long-distance_bus_ticket_backend.git`
- Install dependencies
  `npm install`

## 2. Configuration and connect database

- Let's create a environment file `.env.local` or `.env` and add the following content:

```
DB_HOST=localhost or ...
DB_PORT=5432 or ...
DB_USERNAME=postgres or ...
DB_PASSWORD=mysecretpassword or ...
DB_NAME=long-distance_bus_ticket_management_dev or ...
```

- In `database/data-source.ts` file change `synchronize` field from `true` to `false`
- Run project in development mode: `npm run start:dev`
- Check if your DB has enough 10 tables yet? If ok, change `synchronize` field to `false` and done. Otherwise, report this issue to our team or Thai :>.
