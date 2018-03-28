// server.js
const express        = require('express');
const MongoClient    = require('mongodb').MongoClient;
const bodyParser     = require('body-parser');
const db_url             = require('./config/db');
const app            = express();
const port = 8080;
var db;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
//app.set('view engine', 'ejs');
//res.render(view, locals);

app.get('/', function(req, res) {
  //res.sendFile(__dirname + '/index.html')
});

MongoClient.connect(db_url.url, (err, database) => {
  if (err) return console.log(err)
  db = database.db('aria')
  require('./app/routes')(app, db);

  app.listen(port, () => {
    console.log('listening on ' + port)
  })
})