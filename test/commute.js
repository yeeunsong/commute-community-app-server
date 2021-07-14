var mysql = require('mysql');
var express = require('express');
var app = express();
var port = 22;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

var server = app.listen(port, function () {
    console.log("Express server has started on port " + port)
});

let connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'jakcal',
    database: 'comcom',
    port: 3306
})



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
