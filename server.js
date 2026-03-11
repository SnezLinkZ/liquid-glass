const express = require("express");
const app = express();

app.use(express.json());

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile("public/index.html");
})

app.listen(3000, () => {
  console.log("Server is running on port 3000");
})