// backend/src/server.ts
import express from "express";
import cors from "cors";
import analyzeRouter from "./routes/analyze";

const app = express();
app.use(cors());
app.use("/api", analyzeRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
