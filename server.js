var express = require('express');
var path = require('path');

var app = express();
var adminRouter = express.Router()

app.get('/', function(req, res){
  res.sendFile(path.join(__dirname + '/index.html'));
});

adminRouter.use(function(req, res, next){
  console.log(req.method, req.url);
  next();
});

adminRouter.get('/', function(req, res){
  res.send("This is the Dashboard!");
});

adminRouter.get('/users', function(req, res){
  res.send("This shows all the users!");
});

adminRouter.param('name', function(req, res, next, name){
  console.log("validating name: " + name + "....");
  req.name = name;
  next();
});

adminRouter.get('/users/:name', function(req, res){
  res.send("Hello " + req.params.name + "!")
});

adminRouter.get('/posts', function(req, res){
  res.send("Show all posts")
});

app.use('/admin', adminRouter);

app.listen(1337);
console.log("running on port 1337")
