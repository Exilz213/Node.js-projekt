const express = require('express');
const app = express();
const db = require('./connection');
const path = require('path');
const upload = require('./upload');
const bodyParser = require('body-parser')
const moment = require('moment');
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(path.resolve('./public')));
app.set('view engine', 'ejs');


app.get('/post', function(req,res){
   res.render('post')

});

var obj = {};

app.get('/', function(req,res){
    let sql = 'SELECT id, title, text, image, audio, DATE_FORMAT(date, "%d-%m-%Y") as date FROM post ORDER BY date DESC';
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

 
app.post('/posted', upload.fields([{ name: 'img', maxCount: 1 }, { name: 'mp3', maxCount: 1 }]), function(req,res){
    console.log(req.files['img'][0].filename);
    const title = req.body.title;
    const text = req.body.text;
    const img = req.files['img'] ? "/uploads/" + req.files['img'][0].filename : null;
    const audio = req.files['mp3'] ? "/uploads/" + req.files['mp3'][0].filename : null;
    const date = moment().utcOffset(0).format('DD-MM-YYYY');
    const sqlInstert = "INSERT INTO post (title, text, image, audio) VALUES (?, ?, ?, ?);"
    db.query(sqlInstert, [title, text, img, audio], (err, result)=> {
        if(err) {
            throw err;
        } else {
            res.render('index')
        }
    });
    });
 


app.listen(process.env.PORT || 3000, function(){
    console.log('server, port 3000');
 });