var createError = require('http-errors');
var express = require('express');
var session = require('express-session');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var http = require('http');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var jsonRouter = require('./routes/json');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').__express);
app.set('view engine', 'html');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'gas_leak_2018!@*',
  resave: false,
  saveUninitialized: false
}));

app.use('/', indexRouter);
app.use('/user', usersRouter);
app.use('/json', jsonRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// set leak calculate by secondes interval

var sqlite = require('sqlite3');
var path = require('path');
var nodeData = new sqlite.Database(path.join(__dirname, 'data', 'data.sqlite'));
SECOND_OF_TIMER = 10;
WIN_FORM_ADDR = '127.0.0.1';
WIN_FROM_PORT = 8880;
var counter = 0

function calLeak(rows) {
  var index = counter++ % rows.length;
  var tableName = 'gas' + rows[index].name.substring(2);
  var data = 'table:' + tableName + ':' + rows[index].length + ':' + rows[index].radius + ":" + rows[index].thickness;
  var post_options = {
    host: WIN_FORM_ADDR,
    port: WIN_FROM_PORT,
    path: '/compile',
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(data)
    }
  };
  var post_req = http.request(post_options, function(res) {
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
        console.log('data:' + data + '\nResponse: ' + chunk);
    });
  });
  post_req.write(data);
  post_req.end();
}

var nodeSqlStr = "SELECT * FROM 'node'";
nodeData.all(nodeSqlStr, function (err, rows){
    if (err != null){
      console.log("read node data failed");
      return;
    }
    setInterval(calLeak, 1000*SECOND_OF_TIMER, rows);
});

module.exports = app;
