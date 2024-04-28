const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'notesdb',
    password: 'test',
    port: 5432, 
});

module.exports = pool;
