const express = require("express");
const cors = require("cors");
const analyzeRoute = require("./routes/analyze");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/api", analyzeRoute);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
