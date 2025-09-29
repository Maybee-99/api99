const mysql2=require('mysql2');
const os=require('os');

function getlocalIP(){
    const interfaces=os.networkInterfaces();
    for(const name of Object.keys(interfaces)){
        for(const iface of interfaces[name]){
            if(iface.family==='IPv4'&&!iface.internal && iface.address.startsWith('10.186')){
                return iface.address;
            }
        }
    }
    return 'localhost';
}
const localIP = getlocalIP();

const db=mysql2.createConnection({
    host:localIP,
    user:'mbdev',
    password:'96734053',
    database:'dbkasikam',
    charset: 'utf8mb4',
})
db.connect((err)=>{
    if(err){
        console.log('Error connecting to database:', err);
    }else{
        console.log('Connected to database  at',localIP);
    }
})

module.exports=db;