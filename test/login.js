var mysql = require('mysql');
var express = require('express');
var app = express();
var session = require('express-session');
const FileStore = require('session-file-store')(session);
var port = 4431;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: 'asdjha!@#@#$dd',
    resave: false,
    saveUninitialized: true
}));


var server = app.listen(port, function () {
    console.log("Express server has started on port " + port)
});


var connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "comcom",
    password: "jakcal",
    port: 3306
});


//sign up
app.post('/user/join', function (req, res) {
    console.log(req.body);
    var userEmail = req.body.userEmail;
    var userPwd = req.body.userPwd;
    var userName = req.body.userName;
    var companyName = req.body.userCompany;

    // 삽입을 수행하는 sql문.
    var sql = 'INSERT INTO userinfo (username, companyname, password, email) VALUES (?, ?, ?, ?)';
    var params = [userName, companyName, userPwd, userEmail];

    // sql 문의 ?는 두번째 매개변수로 넘겨진 params의 값으로 치환된다.
    connection.query(sql, params, function (err, result) {
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
    var sql = `select * from userinfo where email = ?
                limit 1`;

    connection.query(sql, userEmail, function (err, result) {
        var resultCode = 404;
        var resultId, resultEmail, resultCompany = null;
        var message = '에러가 발생했습니다';
        result = result[0];

        if (err) {
            console.log(err);
        } else if (req.session.user) {
            console.log('이미 로그인함');
        }
        else {
            if (result.length === 0) {
                resultCode = 204;
                message = '존재하지 않는 계정입니다!';
            } else if (userPwd !== result.password) {
                resultCode = 204;
                message = '비밀번호가 틀렸습니다!';
            } else {
                // retrieve database info

                resultCode = 200;
                resultId = result.username;
                resultEmail = result.email;
                resultCompany = result.companyname;

                req.session.user = {
                    id: userEmail,
                    name: result.username,
                    authorized: true
                };
                req.session.save();
                message = '로그인 성공! ' + result.username + '님 환영합니다!';
            }
        }
        res.json({
            'code': resultCode,
            'message': message,
            'session': req.session,
            'userId': resultId,
            'userCompany': resultCompany,
            'userEmail': resultEmail
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












app.post('/arrival', function (req, res) {
    var post = req.body;
    console.log("POST ARRIVAL request received");
    res.send(req.body);

    // insert to commute
    let sql = `INSERT INTO commute 
                (username, arrival, arrival_time, commute_date) 
                VALUES (?,?,?,?)`;
    var values = [post.username, post.arrival, post.arrival_time, post.commute_date];

    connection.query(sql, values, function (err) {
        if (err) throw err;
        console.log("Arrival data inserted");
    });
});




app.post('/off', function (req, res) {
    var post = req.body;
    console.log("POST OFF request received");
    res.send(req.body);

    // change the database row contents
    let sql = `UPDATE commute 
                SET 
                    off = ?,
                    off_time = ?,
                    total_time = ?
                WHERE username = ?`;
    var values = [post.off, post.off_time, post.total_time, post.username];

    connection.query(sql, values, function (err) {
        if (err) throw err;
        console.log("Off data updated");
    });
});
