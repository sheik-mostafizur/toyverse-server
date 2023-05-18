const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3001;

// middleware
app.use(cors());
app.use(express.json());

// route
app.get("/", (req, res) => {
  res.send("<h1>ToyVerse server side running!</h1>");
});

app.listen(PORT, () =>
  console.log(`Server is running port at on http://localhost:${PORT}`)
);
