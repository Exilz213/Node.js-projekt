const express = require('express');
const app = express();
const db = require('./connection');
const path = require('path');
const upload = require('./upload');
const bodyParser = require('body-parser')
const session = require('express-session');
const moment = require('moment');
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(path.resolve('./public')));
app.set('view engine', 'ejs');

app.use(session({
  secret: 'LwV84haSpHpTzTyQ',
  resave: false,
  saveUninitialized: false
}));


app.get('/post', function(req,res){
   res.render('post')
});

app.get('/posted', function(req,res){
  res.render('posted')
});

app.get('/sign_in', function(req,res){
    res.render('sign_in')
});



app.get('/logged_in', isLoggedIn, function(req, res) {
  let sql = 'SELECT id, title, text, image, audio, DATE_FORMAT(date, "%d-%m-%Y") as date FROM post ORDER BY date DESC';
  db.query(sql, function(err, results) {
    if (err) {
      console.log(err);
      res.status(500).send('Error retrieving posts');
    } else {
      res.render('logged_in', { data: results, username: res.locals.username }); // Pass username to view
    }
  });
});

function isLoggedIn(req, res, next) {
  if (req.session.user) {
    let sql = 'SELECT username FROM users WHERE id = ?';
    db.query(sql, [req.session.user], function(err, result) {
      if (err) {
        console.log(err);
        res.status(500).send('Error retrieving user');
      } else {
        res.locals.username = result[0].username; // Set username in res.locals
        res.redirect('/');
      }
    });
  } else if (req.session.isLoggedIn) {
    next();
  } else {
    res.redirect('/');
  }
}


app.get('/logged_in', (req, res) => {

  // Get the username from the database
  connection.query('SELECT username FROM users WHERE id = ?', [1], (error, results) => {
      if (error) throw error;

      // Render the logged in page and pass in the username as a variable
      res.render('logged_in', { username: results[0].username });
  });
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

app.post('/sign_in', (req, res) => {
    const { username, password } = req.body;
    
    const sql = `INSERT INTO users (username, password) VALUES (?, ?)`;
    db.query(sql, [username, password], (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send('Error signing in');
      } else {
        console.log(result);
        res.send('Sign-in successful');
      }
    });
  });

app.post('/sign_in', function(req, res) {
    const { username, password } = req.body;
    if (username === 'myusername' && password === 'mypassword') {
      req.session.isLoggedIn = true;
      res.redirect('/');
    } else {
      res.render('sign_in', { errorMessage: 'Invalid username or password' });
    }
});
  
app.post('/log_in', function(req, res) {
  const { username, password } = req.body;
  const sql = `SELECT * FROM users WHERE username = ? AND password = ?`;
  db.query(sql, [username, password], (err, results) => {
    if (err) {
      console.log(err);
      res.status(500).send('Error logging in');
    } else if (results.length === 0) {
      res.render('log_in', { errorMessage: 'Invalid username or password' });
    } else {
      req.session.isLoggedIn = true;
      req.session.username = results[0].username;
      res.redirect('http://localhost:3000/logged_in');
    }
  });
});


app.get('/log_in', function(req, res) {
  res.render('log_in');
});

app.get('/post', function(req, res) {
  if (req.session.isLoggedIn) {
    res.render('post');
  } else {
    res.redirect('/log_in');
  }
});


app.get('/posts', (req, res) => {
  const sql = `SELECT * FROM posts`;
  db.query(sql, (err, results) => {
    if (err) {
      console.log(err);
      res.status(500).send('Error retrieving posts');
    } else {
      res.render('posts', { data: results });
    }
  });
});

app.post('/post', upload.single('image'), function(req, res) {
  let { title, text } = req.body;
  let image = '';
  if (req.file) {
    image = req.file.filename;
  }
  let sql = 'INSERT INTO post (title, text, image) VALUES (?, ?, ?)';
  db.query(sql, [title, text, image], function(err, result) {
    if (err) {
      console.log(err);
      res.status(500).send('Error posting');
    } else {
      res.redirect('/logged_in');
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
            res.render('posted')
        }
    });
    });
 


app.listen(process.env.PORT || 3000, function(){
    console.log('server, port 3000');
 }); 