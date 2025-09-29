const mysql2 = require('mysql2');
const os = require('os');
require('dotenv').config();

function getlocalIP(){
    const interfaces = os.networkInterfaces();
    for(const name of Object.keys(interfaces)){
        for(const iface of interfaces[name]){
            if(iface.family === 'IPv4' && !iface.internal && iface.address.startsWith('10.186')){
                return iface.address;
            }
        }
    }
    return process.env.DB_HOST || 'localhost';
}
const localIP = getlocalIP();

const db = mysql2.createConnection({
    host: localIP,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    charset: 'utf8mb4',
});

db.connect((err) => {
    if(err){
        console.log('Error connecting to database:', err);
    } else {
        console.log('Connected to database at', localIP);
    }
});

module.exports = db;