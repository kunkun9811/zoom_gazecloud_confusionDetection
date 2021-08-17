const express = require("express");
const path = require("path");

const port = process.env.PORT || 5000;
const app = express();

app.use(express.static("public"));

app.listen(port);
console.log("Server started at http://localhost:" + port);
