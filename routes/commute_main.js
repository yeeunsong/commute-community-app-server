const express = require('express');
const router = express.Router();
var connection = require('../database');

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// arrived to work
router.post('/arrival', function (req, res) {
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



// leave from work
router.post('/off', function (req, res) {
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



module.exports = router;