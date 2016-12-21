const express =require('express');
const bodyParser = require("body-parser");
const path = require('path');
const wechat = require('wechat-enterprise');
const config = require('./config.json');
const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use('/corp', wechat(config.wechat, function (req, res, next) {
  res.writeHead(200);
  res.end('hello node api');
}));

app.use('/admin', require('./routes/admin'));
app.use('/list', require('./routes/list'));
app.use('/system', require('./routes/system'));

app.get('/', function(req, res) {
  res.redirect('/admin/login');
});

app.listen(5000);
