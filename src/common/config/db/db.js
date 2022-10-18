
import mysql from 'mysql';
let db;

try {
    db = mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        port: process.env.DB_PORT,
        password: process.env.DB_PASSWORD,
        database: process.env.DATABASE
    });
} catch (err) {
    console.error(err);
}




export default db;