const express = require('express');
const mysql = require('mysql');
const app = express();
app.use(express.json());
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
const jsonParser = bodyParser.json();
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

app.get('/jobById',(req,res)=>{
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

app.post('/jobs',jsonParser,(req,res)=>{
    let select = "select * from Jobs where jobName = '" +req.body.jobName+ "' and partId = " + req.body.partId;
    let sql= 'insert into Jobs SET ?';
    let insertData = {jobName:req.body.jobName,partId:req.body.partId,qty:req.body.qty};
    let selQuery = db.query(select,(error,result)=>{
        if(result.length==0){
            let insertQuery = db.query(sql,insertData,(err,insertResult)=>{
                if(err){
                    throw err;
                }
                res.send('Record {' + insertData.jobName + ',' + insertData.partId + ',' + insertData.qty + '} is inserted in Jobs table');
            });
        }else{
            res.status(404).send('Jobs table with jobName ' +insertData.jobName +'and partId ' +insertData.partId +' already exists');
        }
    });
});

app.put('/jobs',jsonParser,(req,res)=>{
    let select = "select * from Jobs where jobName = '" +req.body.jobName+ "' and partId =" + req.body.partId;
    let sql ="Update Jobs SET ? where jobName = '" + req.body.jobName+ "'";
    let updateData = {qty:req.body.qty};
    let selQuery = db.query(select,(err,result)=>{
        if(result.length!=0){
            let updateQuery = db.query(sql,updateData,(err,result)=>{
                if(err){
                    throw err;
                }
                res.send('Record with JobName ' + req.body.jobName + ' and partId '+ req.body.partId +' is updated');    
            });
        }else{
            res.status(404).send('JobName '+req.body.jobName+' and partId '+ req.body.partId +' does not exist');  
        }
    });
});

app.delete('/jobs',(req,res)=>{
    if(!req.query.jobName || !req.query.partId){
        res.status(400).send('Check the query parameters');
    }
    else{
        let sql = "Delete from Jobs where jobName =" +req.query.jobName+" and partId="+ req.query.partId;
        let query=db.query(sql,(err,result)=>{
        if(err){
            throw err;
        }
        if(result.length==0) {
            res.status(404).send('Job with jobName '+req.query.jobName+ ' and partId ' +req.query.partId +' was not found');
        }else
        res.send('Jobs table with jobName ' +req.query.jobName +'and partId ' +req.query.partId +' is deleted');
        });
    }
});
module.exports = app;