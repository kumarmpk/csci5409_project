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
        res.send(result); 
        }   
    });    
});

app.get('/jobById',(req,res,next)=>{
    if(!req.query.jobName || !req.query.partId){
        res.status(400).send('Check the query parameters');
    }
    else{
        let sql = "select * from Jobs where jobName = " +req.query.jobName+" and partId="+ req.query.partId;
        let query=db.query(sql,(err,result)=>{
        if(err){
            throw err;
        }
        if(result.length==0) {
            res.status(404).send('Job with jobName '+req.query.jobName+ ' and partId ' +req.query.partId +' was not found');
        }else
            res.send(result);   
    });
    }
});

app.get('/jobList',(req,res)=>{
    if(!req.query.jobName){
        res.status(400).send('Include the query parameter in the request');
    }
    else{
        let sql = "select * from Jobs where jobName = " +req.query.jobName;
        let query=db.query(sql,(err,result)=>{
        if(err){
            throw err;
        }
        if(result.length==0) {
            res.status(404).send('Job with jobName '+req.query.jobName+' was not found');
        }else
            res.send(result);   
    });
    }
});



module.exports = app;