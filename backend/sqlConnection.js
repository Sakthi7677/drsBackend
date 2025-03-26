require("dotenv").config();
const mysql = require("mysql2/promise");

const config = {
  db: {
    host: process.env.DB_HOST ,
    port: process.env.DB_PORT, 
    user: process.env.MYSQL_ROOT_USER,
    password: process.env.MYSQL_ROOT_PASSWORD , 
    database: process.env.MYSQL_DATABASE ,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  },
};

const pool = mysql.createPool(config.db);

// Utility function to query the database
async function query(sql, params) {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error("❌ Database query error:", error);
    throw error;
  }
}


module.exports = { query };
