const express = require("express");
const app = express();
const PORT = 443;

const commuteRoute = require("./routes/commute_main");
const loginRoute = require("./routes/login_main");
const postRoute = require("./routes/post_main");

app.use("", commuteRoute);
app.use("/user", loginRoute);
app.use("", postRoute);

var server = app.listen(PORT, function () {
    console.log("Express server has started on port " + PORT)
});



