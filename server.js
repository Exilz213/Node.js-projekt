const express = require('express');
const app = express();
const db = require('./connection');
const path = require('path');
const upload = require('./upload');
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(path.resolve('./public')));
app.set('view engine', 'ejs');


app.get('/post', function(req,res){
   res.render('post')

});

var obj = {};

app.get('/', function(req,res){
    let sql = 'SELECT * FROM post ORDER BY date DESC';
    db.query(sql, function(err, results){
        if(err) {
            throw err;
        } else {
            obj = {data: results};
            console.log(obj);
            res.render('index', obj)
        }
    });
 });
 
app.post('/posted', upload.single('img'), function(req,res){
   const title = req.body.title;
   const text = req.body.text;
   console.log(req);
   //const img = "/uploads/" + req.body.img;
   const img = "/uploads/" + req.file.filename;
   const sqlInstert = "INSERT INTO post (title, text, image) VALUES (?, ?, ?);"
   db.query(sqlInstert, [title, text, img], (err, result)=> {
       if(err) {
           throw err;
       } else {
           //res.render ('posted');
           res.render('index')
       }
   });
});

app.listen(process.env.PORT || 3000, function(){
    console.log('server, port 3000');
 });
 
 