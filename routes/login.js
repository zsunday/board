var express=require('express');
var router=express.Router();
var mysql=require("mysql2");
var moment=require("moment");
var Crypto=require("crypto");
require('dotenv').config();
var secretKey=process.env.secretKey;

var connection=mysql.createConnection({
    host : process.env.host,
    port : process.env.port,
    user : process.env.user,
    password : process.env.password,
    database : process.env.database
});

router.get("/", function(req, res, next){
    if(!req.session.logged){
        res.render("login",{name:"none"});
    }else{
        res.render("login",{name:req.session.logged.name});
    }
});


router.post("/login", function(req,res,next){
    var post_id=req.body.post_id;
    var password=req.body.password;
    var crypto=Crypto.createHmac('sha256', secretKey).update(password).digest('hex');
    console.log(post_id, password);
    connection.query(
        `select * from user_list where post_id=? and password=?`,
        [post_id, crypto],
        function(err,result){
            if(err){
                console.log(err);
                res.sendStatus("SQL login Error");
            }else{
                if(result.length>0){
                    req.session.logged=result[0];
                    console.log(req.session.logged);
                    res.redirect("/board");
                }else{
                    res.render("error2",{
                        message : "아이디나 비밀번호가 맞지 않습니다."
                    });
                }
            }
        }
    );
});


router.get("/signup", function(req,res,next){
    res.render("signup");
});

//signup.ejs에서 보낸 값 db에 집어넣기
router.post("/signup_2", function(req,res,next){
    var post_id=req.body.post_id;
    var password=req.body.password;
    var name=req.body.name;
    var division=req.body.division;
    var linkcode=req.body.linkcode;
    var crypto=Crypto.createHmac('sha256', secretKey).update(password).digest('hex');
    console.log(crypto);
    console.log(post_id,password,name,division,linkcode);
    connection.query(
        `select * from user_list where post_id=?`,
        [post_id],
        function(err,result){
            if(err){
                console.log(err);
                res.send("SQL Error");
            }else{
                if(result.length > 0){
                    res.send("<script>alert('존재하는 아이디 입니다.');location.href='/signup';</script>");
                }else{
                    connection.query(
                        `insert into user_list (post_id, password, name, division, linkcode) values (?, ?, ?, ?, ?)`,
                        [post_id, crypto, name, division, linkcode],
                        function(err2,result2){
                            if(err2){
                                console.log(err2);
                                res.send("SQL insert Error");
                            }else{
                                res.redirect("/");
                            }
                        }
                    );
                    
                }
            }
        }
    );
});

router.get("/logout",function(req,res,next){
    req.session.destroy(function(err){
        if(err){
            console.log(err);
            res.send("Session destroy Error");
        }
        else{
            res.redirect("/");
        }
    });
});

module.exports=router;