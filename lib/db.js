// my_site/lib/db.js
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'ladomus',
  password: 'ladomus12!@',
  database: 'ladomus',
  port: 3306,
});

export function getDBPool() {
  return pool;
}
