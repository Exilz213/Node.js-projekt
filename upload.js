const express = require('express');
const multer = require('multer');
const path = require('path');

const app = express();
app.use(express.static('public'));


const storage = multer.diskStorage({
   destination: function(req, file, cb){
       cb(null, 'public/uploads');
   },
   filename: function(req, file, cb){
       console.log(file);
       cb(null, Date.now() + path.extname(file.originalname));
   }
});

const upload = multer({
   storage: storage,
   limits: {fileSize: 50*1024*1024},
   fileFilter: function(req, file, cb){
       checkFileType(file, cb);
   }
});

function checkFileType(file, cb){
   const filetypes = /jpeg|jpg|png|gif|mp3|mpeg|wav/;
   const extname = filetypes.test(path.extname(file.originalname).toLocaleLowerCase());
   const mimetype = filetypes.test(file.mimetype);

   if(mimetype && extname) {
       return cb(null, true);
   } else {
        console.log(file);
        console.log(extname);
       cb('Error: Images and Audio files only!');
   }
}

app.post('/upload-file', upload.single('file'), (req, res) => {
    // req.file contains the uploaded file
    // Do something with the file, such as save it to a database or storage service
    res.send('File successfully uploaded!')
});

module.exports = upload;