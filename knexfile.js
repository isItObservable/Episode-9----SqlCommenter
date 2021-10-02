const POSTGRES_USER = process.env.POSTGRES_USER;
const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD;
const POSTGRES_HOST=process.env.POSTGRES_HOST;
const POSTGRES_PORT=process.env.POSTGRES_PORT
const DATABASE_URL = `postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/todos`


module.exports = {
  development: {
    client: 'pg',
    connection: DATABASE_URL,
    migrations: {
      directory: `${__dirname}/src/db/migrations`,
    },
    seeds: {
      directory: `${__dirname}/src/db/seeds`,
    },
  },
  production: {
    client: 'DATABASE_URL',
    connection: DATABASE_URL,
    migrations: {
      directory: `${__dirname}/src/db/migrations`,
    },
    seeds: {
      directory: `${__dirname}/src/db/seeds`,
    },
  },
};
