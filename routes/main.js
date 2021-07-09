var express=require('express');
var router=express.Router();
var mysql=require("mysql2");
var moment=require("moment");
const { format } = require('mysql2');
const { now } = require('moment');
require('dotenv').config();

var connection=mysql.createConnection({
    host : process.env.host,
    port : process.env.port,
    user : process.env.user,
    password : process.env.password,
    database : process.env.database
});


router.get("/", function(req,res,next){
    if(!req.session.logged){
        res.redirect("/");
    }else{
        connection.query(
            `select * from board`,
            function(err,result){
                if(err){
                    console.log(err);
                    res.send("SQL board loading Error");
                }else{
                    console.log(result);
                    res.render("home",{ board_list : result, name : req.session.logged.name });
                }
            }
        );
    }
});

router.get("/adding", function(req,res,next){
    if(!req.session.logged){
        res.redirect("/");
    }else{
        res.render("adding",{name : req.session.logged.name});
    }
});

//post형식은 req.body
router.post("/adding_2", function(req,res,next){
    if(!req.session.logged){
        res.redirect("/");
    }else{
        var author=req.session.logged.name;
        var post_id=req.session.logged.post_id;
        var title=req.body.title;
        var content=req.body.content;
        var img=req.body.img;
        var date=moment().format("YYYY-MM-DD");
        var time=moment().format("hh:mm");
        console.log(title,content,img);
        connection.query(
            `insert into board(title, content, img, date, time, author, post_id) values(?,?,?,?,?,?,?)`,
            [title, content, img, date, time, author, post_id],
            function(err, result){
                if(err){
                    console.log(err);
                    res.send("SQL Insert Error");
                }else{
                    res.redirect("/board"); // /
                }
            }
        );
    }
});

//get형식은 req.query
router.get("/content",function(req,res,next){
    if(!req.session.logged){
        res.redirect("/");
    }else{
        var no=req.query.no;
        console.log(no);
        connection.query(
            `select * from board where no=?`,
            [no],
            function(err,result){
                if(err){
                    console.log(err);
                    res.send("SQL content Error");
                }else{
                    connection.query(
                        `select * from comment where parent_num=?`,
                        [no],
                        function(err2,result2){
                            if(err2){
                                console.log(err2);
                                res.render("error2",{
                                    message : "게시글의 댓글 출력 에러"
                                });
                            }else{
                                res.render("content",{
                                    content : result,
                                    opinion : result2,
                                    post_id : req.session.logged.post_id,
                                    name : req.session.logged.name
                                });
                            }
                        }
                    );                    
                }
            }
        );
    }
});

router.get("/update",function(req,res,next){
    if(!req.session.logged){
        res.redirect("/");
    }else{
        var no=req.query.no;
        console.log(no);
        connection.query(
            `select * from board where no=?`,
            [no],
            function(err,result){
                if(err){
                    console.log(err);
                    res.send("SQL update Error");
                }else{
                    res.render("update",{content : result, name : req.session.logged.name});
                }
            }
        );
    }
});


router.post("/update_2",function(req,res,next){
    var no=req.body.no;
    var title=req.body.title;
    var content=req.body.content;
    var img=req.body.img;
    var post_id=req.body.post_id;
    if(!req.session.logged){
        res.redirect("/");
    }else{
        if(req.session.logged.post_id==post_id){
            console.log(no, title, content, img);
            connection.query(
                `update board set title=?, content=?, img=? where no=?`,
                [title, content, img, no],
                function(err, result){
                    if(err){
                        console.log(err);
                        res.send("SQL update Error2");
                    }else{
                        res.redirect("/board"); // /
                    }
                }
            );
        }else{
            res.send("<script>alert('권한이 없습니다.');location.href='/board';</script>");
        }
    }
});

router.get("/del",function(req,res,next){
    if(!req.session.logged){
        res.redirect("/");
    }else{
        var no=req.query.no;
        console.log(no);
        connection.query(
            `delete from board where no=?`,
            [no],
            function(err,result){
                if(err){
                    console.log(err);
                    res.send("SQL delete Error");
                }else{
                    res.redirect("/board"); // /
                }
            }
        );
    }
});

router.post("/add_comment",function(req,res,next){
    if(!req.session.logged){
        res.redirect("/");
    }else{
        var opinion=req.body.comment;
        var post_id=req.session.logged.post_id;
        var name=req.session.logged.name;
        var date=moment().format('YYYYMMDD');
        var time=moment().format('HHmmss');
        var parent_num=req.body.no;
        connection.query(
            `insert into comment(opinion, post_id, name, date, time, parent_num) values(?,?,?,?,?,?)`,
            [opinion, post_id, name, date, time, parent_num],
            function(err,result){
                if(err){
                    console.log(err);
                    res.render("error2",{
                        message : "댓글 추가 실패"
                    });
                }else{
                    res.redirect("/board/content?no="+parent_num);
                }
            }
        );
    }
});

router.get("/del_cmt", function(req,res,next){
    var no=req.query.no;
    var parent_num=req.query.parent_num;
    connection.query(
        'delete from comment where no=?',
        [no],
        function(err,result){
            if(err){
                console.log(err);
                res.render("error2",{
                    message : "댓글 삭제 실패"
                });
            }else{
                res.redirect("/board/content?no="+parent_num);
            }
        }
    );
});

router.get("/up", function(req,res,next){
    var no=req.query.no;
    var parent_num=req.query.parent_num;
    var up=parseInt(req.query.up);
    console.log(no,parent_num,up);
    var up_2=up + 1;
    console.log(up_2);
    connection.query(
        'update comment set up=? where no=?',
        [up_2, no],
        function(err,result){
            if(err){
                console.log(err);
                res.render("error2",{
                    message : "좋아요 실패"
                });
            }else{
                res.redirect("/board/content?no="+parent_num);
            }
        }
    );
});


router.get("/down", function(req,res,next){
    var no=req.query.no;
    var parent_num=req.query.parent_num;
    var down=parseInt(req.query.down);
    console.log(no,parent_num,down);
    var down_2=down + 1;
    console.log(down_2);
    connection.query(
        'update comment set down=? where no=?',
        [down_2, no],
        function(err,result){
            if(err){
                console.log(err);
                res.render("error2",{
                    message : "싫어요 실패"
                });
            }else{
                res.redirect("/board/content?no="+parent_num);
            }
        }
    );
});


module.exports=router;

//render는 url로 이동할때 쓰며 '/'를 쓰지않고 데이터를 덮어 씌우는 역할, redirect는 '/'를 써야하고 단순 url이동.