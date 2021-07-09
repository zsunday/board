var express = require('express');
var app = express();
var port=3000;
require('dotenv').config();

var path=require("path");
var session = require("express-session");

app.set("views" , path.join( __dirname+"/views"));
app.set('view engine' , 'ejs');

app.use(express.static('public'));
app.use(
    session({
        secret : process.env.session_secret,
        resave : false,
        saveUninitialized : true,
        maxAge : 3600000
    })
);

// .body.id를 사용할 수 있도록 해주는 세팅
app.use(express.json());
app.use(express.urlencoded({
    extended:false
}));
app.use(express.static(path.join(__dirname,"public")));

var login=require("./routes/login");
app.use("/",login);

var main=require("./routes/main");
const { rawListeners } = require('process');
app.use("/board",main);

app.listen(port, function(){
    console.log("web server start");
});
