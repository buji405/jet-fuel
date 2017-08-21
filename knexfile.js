module.exports = {

  development: {
    client: 'pg',
    connection: 'postgres://localhost/jetfuel',
    migrations: {
      directory: './backend/db/migrations'
    },
    seeds: {
      directory: './backend/db/seeds/dev'
    },
    useNullAsDefault: true
  },

  staging: {
    client: 'postgresql',
    connection: {
      database: 'my_db',
      user:     'username',
      password: 'password'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },

  production: {
  client: 'pg',
  connection: process.env.DATABASE_URL + `?ssl=true`,
  migrations: {
    directory: './backend/db/migrations'
  },
  useNullAsDefault: true
},

test: {
   client: 'pg',
   connection: process.env.DATABASE_URL || 'postgres://localhost/jetfueltest',
   useNullAsDefault: true,
   migrations: {
     directory: './backend/db/migrations'
   },
   seeds: {
     directory: './backend/db/test/seeds'
   }
 }
};
