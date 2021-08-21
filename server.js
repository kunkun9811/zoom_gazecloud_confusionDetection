const express = require("express");
const path = require("path");

const port = process.env.PORT || 5000;
const app = express();

app.use(express.static("public"));

app.get("/*", function (req, res) {
	res.sendFile(path.join(__dirname, "/public", "index.html"));
});

app.listen(port);
console.log("Server started at http://localhost:" + port);
