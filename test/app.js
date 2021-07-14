var mysql = require('mysql');
const path = require('path');
var express = require('express');
var app = express();
var session = require('express-session');
const FileStore = require('session-file-store')(session);
var port = 80;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: 'asdjha!@#@#$dd',
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 24000 * 60 * 60 // 쿠키 유효기간 24시간
    }
}));


var server = app.listen(port, function () {
    console.log("Express server has started on port " + port)
});

var communitydb = mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "comcom",
    password: "jakcal",
    port: 3306
});


//test
app.get('/', function (req, res) {
    res.send('Hello World');
});

//sign up
app.post('/user/join', function (req, res) {
    console.log(req.body);
    var userEmail = req.body.userEmail;
    var userPwd = req.body.userPwd;
    var userName = req.body.userName;

    // 삽입을 수행하는 sql문.
    var sql = 'INSERT INTO userinfo (username, password, email) VALUES (?, ?, ?)';
    var params = [userName, userPwd, userEmail];

    // sql 문의 ?는 두번째 매개변수로 넘겨진 params의 값으로 치환된다.
    communitydb.query(sql, params, function (err, result) {
        var resultCode = 404;
        var message = '에러가 발생했습니다';

        if (err) {
            console.log(err);
        } else {
            resultCode = 200;
            message = '회원가입에 성공했습니다.';
        }

        res.json({
            'code': resultCode,
            'message': message
        });
    });
});

//login
app.post('/user/login', function (req, res) {
    var userEmail = req.body.userEmail;
    var userPwd = req.body.userPwd;
    var sql = 'select * from userinfo where email = ?';

    communitydb.query(sql, userEmail, function (err, result) {
        var resultCode = 404;
        var message = '에러가 발생했습니다';

        if (err) {
            console.log(err);
        } else if (req.session.user) {
            console.log('이미 로그인함');
        }
        else {
            if (result.length === 0) {
                resultCode = 204;
                message = '존재하지 않는 계정입니다!';
            } else if (userPwd !== result[0].password) {
                resultCode = 204;
                message = '비밀번호가 틀렸습니다!';
            } else {
                resultCode = 200;
                req.session.user = {
                    id: userEmail,
                    name: result[0].username,
                    authorized: true
                };
                req.session.save();
                console.log(req.session);
                message = '로그인 성공! ' + result[0].username + '님 환영합니다!';
            }
        }
        res.json({
            'code': resultCode,
            'message': message,
            'session': req.session
        });

    })
});
//logout?
app.get('/user/logout', function (req, res) {
    console.log(req.session);
    if (req.session.user) {
        console.log('로그아웃');
        req.session.destroy(function (err) {
            if (err) throw err;
            console.log('세션 삭제하고 로그아웃됨');
        });
    }
    else {
        console.log('로그인 상태 아님');
    }

});


app.post('/showboard/', function (req, res) {
    //var postname = req.body.postname;
    var number = req.body.number;
    var nbname = req.body.nbname;

    var sql = 'select postid,userid,title,datetime from community limit ?, 10';

    if (!number) number = 0;

    communitydb.query(sql, number, function (err, result) {
        var resultCode = 404;
        var message = '에러가 발생했습니다';

        if (err) {
            console.log(err);
        } else {
            console.log("게시판 데이터를 가져옴.");
            //console.log(result);
            resultCode = 200;
        }
        //console.log(typeof(result));
        var hello = res.json({
            'code': resultCode,
            'result': result
        });
        //console.log(result);
    })
});

app.post('/showpost/', function (req, res) {
    //var postname = req.body.postname;
    var postid = req.body.postid;
    //postid, userid, companyid ,title,
    
    var sql = "select * from community where postid = ?"
    communitydb.query(sql, postid, function (err, result) {
        var resultCode = 404;
        var message = '에러가 발생했습니다';
        //console.log("test: " + postid);

        if (err) {
            console.log(err);
        } else if (result.length === 0) {
            resultCode = 403;
        }
        else {
            console.log("데이터를 가져옴.");
            //console.log(result);
            resultCode = 200;
        }
        //console.log(typeof(result));
        var hello = res.json({
            'code': resultCode,
            'result': result
        });
        console.log(result);
    })
});

app.post('/writepost/', function (req, res) {
    //var postname = req.body.postname;
    var username = req.body.username;
    var title = req.body.title;
    var content = req.body.content;
    var anonymous = req.body.anonymous;

   
    var companyname;
    var findsql =  'select companyname from userinfo where username = ?';
    var sql = 'insert into community(userid,companyid,title,views,content,anonymous,datetime) values (?, ?, ?, "0", ?, ?, ?)';
    var getsql = 'select postid from community where userid = ? limit 1'
    var day = new Date();

    
    communitydb.query(findsql,username,function (err, result){
        if (err) {
            console.log(err);
        }
        else if( result.length === 0){
            console.log("데이터가 읎어요")
        }
        else {
            console.log("아이디 기반으로 데이터를 가져옴.");
            companyname = result[0].companyname;
            console.log(title);
            console.log(content);
            communitydb.query(sql,[username,companyname,title,content,anonymous,day], function (err, result) {
                var resultCode = 404;
                if (err) {
                    console.log(err);
                }
                else if( result.length === 0){
                    console.log("데이터가 읎어요")
                }
                else {
                    console.log("쓴 글의 데이터를 가져옴.");
                    
                    resultCode = 200;
                    communitydb.query(getsql,username, function(err,result) {
                        if (err) {
                            console.log(err);
                        }
                        else if( result.length === 0){
                            console.log("데이터가 읎어요")
                        }else{
                            console.log(result);
                            res.json({
                                'postid':result[0].postid
                            });
                        }
                        
                    });
                }
                
            })
        }
    });
});

app.post("/deletepost/",function(req,res) {
    var postid = req.body.id;
    var sql = 'delete from community where postid = ?';
    var resultCode = 404;

    communitydb.query(sql,postid,function (err, result){
        if (err) {
            console.log(err);
        }
        else if( result.length === 0){
            console.log("데이터가 읎어요")
        }
        else {
            console.log(postid+"에 있는 데이터 삭제됨");
            resultCode = 200;
            res.json({
                'code':resultCode
            });
        }
    });


});

app.post("/getcomment/",function(req,res){
    var postid = req.body.postid;
    var sql = "select * from comment where postid = ?"
    var resultCode = 404;

    communitydb.query(sql,postid,function (err, result){
        if (err) {
            console.log(err);
        }
        else if( result.length === 0){
            console.log("데이터가 읎어요")
        }
        else {
            console.log(postid+"에 있는 댓글 가져옴");
            console.log(result)
            resultCode = 200;
            res.json({
                'code':resultCode,
                'result':result
            });
        }
    });

});


app.post("/writecomment/",function(req,res){
    var postid = req.body.postid;
    var anonymous = req.body.anonymous;
    var content = req.body.content;
    var commentdate = new Date();
    var writer = req.body.name;
    var sql = "insert into comment(writer,anonymous,content,commentdate,postid) values (?,?,?,?,?)"
    var resultCode = 404;

    communitydb.query(sql,[writer,anonymous,content,commentdate,postid],function (err, result){
        if (err) {
            console.log(err);
        }
        //else if( result.length === 0){
            //console.log("데이터가 읎어요")
        //}
        else {
            console.log(postid+"에 댓글 씀.");
            console.log("서버시간?"+commentdate);
            resultCode = 200;
            res.json({
                'code':resultCode,
            });
        }
    });

});
