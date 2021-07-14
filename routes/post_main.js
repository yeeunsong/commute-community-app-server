const express = require('express');
const router = express.Router();
var connection = require('../database');

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.post('/showboard/', function (req, res) {
    //var postname = req.body.postname;
    var number = req.body.number;
    var nbname = req.body.nbname;
    console.log(nbname);

    var sql = 'select postid,userid,title,datetime from community where nbname = ? limit ?, 10';

    if (!number) number = 0;

    connection.query(sql, [nbname, number], function (err, result) {
        var resultCode = 404;
        var message = '에러가 발생했습니다';

        if (err) {
            console.log(err);
        }else if(result.length === 0){
            console.log("게시판 데이터가 읎는데오")
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

router.post('/showpost/', function (req, res) {
    //var postname = req.body.postname;
    var postid = req.body.postid;
    //postid, userid, companyid ,title,

    var sql = "select * from community where postid = ?"
    connection.query(sql, postid, function (err, result) {
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

router.post('/writepost/', function (req, res) {
    //var postname = req.body.postname;
    var username = req.body.username;
    var title = req.body.title;
    var content = req.body.content;
    var anonymous = req.body.anonymous;
    var nbname = req.body.nbname;

    var companyname;
    var findsql = 'select companyname from userinfo where username = ?';
    var sql = 'insert into community(userid,companyid,title,views,content,anonymous,datetime,nbname) values (?, ?, ?, "0", ?, ?, ?,?)';
    var getsql = 'select postid from community where userid = ? limit 1'
    var day = new Date();

    connection.query(findsql, username, function (err, result) {
        if (err) {
            console.log(err);
        }
        else if (result.length === 0) {
            console.log("데이터가 읎어요")
        }
        else {
            console.log("아이디 기반으로 데이터를 가져옴.");
            companyname = result[0].companyname;
            console.log(title);
            console.log(content);
            connection.query(sql, [username, companyname, title, content, anonymous, day, nbname], function (err, result) {
                var resultCode = 404;
                if (err) {
                    console.log(err);
                }
                else if (result.length === 0) {
                    console.log("데이터가 읎어요")
                    resultCode = 204;
                    res.json({
                        'code':resultCode,
                        'postid': result[0].postid
                    });
                }
                else {
                    console.log("쓴 글의 데이터를 가져옴.");

                    resultCode = 200;
                    connection.query(getsql, username, function (err, result) {
                        if (err) {
                            console.log(err);
                        }
                        else if (result.length === 0) {
                            console.log("데이터가 읎어요")
                        } else {
                            console.log(result);
                            res.json({
                                'code':resultCode,
                                'postid': result[0].postid
                            });
                        }

                    });
                }

            })
        }
    });
});

router.post("/deletepost/", function (req, res) {
    var postid = req.body.postid;
    var commsql = "delete from comment where postid = ?";
    var sql = 'delete from community where postid = ?';
    var resultCode = 404;


    connection.query(commsql, postid, function (err, result) {
        if (err) {
            console.log(err);
        }
        else if (result.length === 0) {
            console.log("댓글 데이터가 읎어요")
        }
        else {
            console.log(postid + "에 있는 댓글 데이터 삭제됨");
            resultCode = 200;
        }
    });

    connection.query(sql, postid, function (err, result) {
        if (err) {
            console.log(err);
        }
        else if (result.length === 0) {
            console.log("데이터가 읎어요")
        }
        else {
            console.log(postid + "에 있는 데이터 삭제됨");
            resultCode = 200;
            res.json({
                'code': resultCode
            });
        }
    });


});


router.post("/getcomment/", function (req, res) {
    var postid = req.body.postid;
    var sql = "select * from comment where postid = ?"
    var resultCode = 404;

    connection.query(sql, postid, function (err, result) {
        if (err) {
            console.log(err);
        }
        else if (result.length === 0) {
            console.log("데이터가 읎어요")
        }
        else {
            console.log(postid + "에 있는 댓글 가져옴");
            console.log(result)
            resultCode = 200;
            res.json({
                'code': resultCode,
                'result': result
            });
        }
    });

});


router.post("/writecomment/", function (req, res) {
    var postid = req.body.postid;
    var anonymous = req.body.anonymous;
    var content = req.body.content;
    var commentdate = new Date();
    var writer = req.body.name;
    var sql = "insert into comment(writer,anonymous,content,commentdate,postid) values (?,?,?,?,?)"
    var resultCode = 404;

    connection.query(sql, [writer, anonymous, content, commentdate, postid], function (err, result) {
        if (err) {
            console.log(err);
        }
        //else if( result.length === 0){
        //console.log("데이터가 읎어요")
        //}
        else {
            console.log(postid + "에 댓글 씀.");
            resultCode = 200;
            res.json({
                'code': resultCode,
            });
        }
    });

});


module.exports = router;