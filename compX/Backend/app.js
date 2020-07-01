const express = require('express');
const mysql = require('mysql');
const app = express();
app.use(express.json());
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

const db =mysql.createConnection({
    host: 'localhost',
    user: 'root',
    port: '3306',
    password : 'password',
    database: 'csci5409'
});
db.connect((err)=>{
    if(err){
        throw err;
    }
    console.log('Connection successful');
});

app.get('/jobs',(req,res)=>{
    let sql = 'select * from Jobs';
    let query = db.query(sql,(err,result)=>{
        if(err){
            throw err;
        }
        if(result.length==0){
            res.send('Jobs table does not have any records'); 
        }else{
        console.log(result);
        res.send(result); 
        }   
    });    
});

module.exports = app;