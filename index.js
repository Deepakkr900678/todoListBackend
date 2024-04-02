const express = require("express");
const databases = require("./db");
const app = express();
const cors = require("cors");
require("dotenv").config();

app.use(cors());
const bodyParser = require("body-parser");
databases.connect();

app.use(bodyParser.json());

app.use("/api/auth", require("./routes/auth"));
app.use("/api/notes", require("./routes/notes"));

app.get("/", (req, res) => {
  res.send("Hello World");
});
app.listen(3500, (err) => {
  if (err) {
    console.log("error occured");
  } else {
    console.log(`server is running on port ${3500}`);
  }
});
