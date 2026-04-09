import mysql from 'mysql2/promise'

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'tkdxo80!',
  database: 'auction_db',
})

export default pool