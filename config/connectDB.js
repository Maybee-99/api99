const mysql2=require('mysql2');
const os=require('os');

function getlocalIP(){
    const interfaces=os.networkInterfaces();
    for(const name of Object.keys(interfaces)){
        for(const iface of interfaces[name]){
            if(iface.family==='IPv4'&&!iface.internal && iface.address.startsWith('192.168')){
                return iface.address;
            }
        }
    }
    return 'localhost';
}

const localIP=getlocalIP();

const Connecttion=mysql2.createConnection({
    host:localIP,
    user:'mbdev',
    password:'96734053',
    database:'dbfood',
    charset: 'utf8mb4',
})
Connecttion.connect((err)=>{
    if(err){
        console.log('Error connecting to database:', err);
    }else{
        console.log('Connected to database  at',localIP);
    }
})

module.exports=Connecttion;