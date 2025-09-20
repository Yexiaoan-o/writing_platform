import express from "express";
import cors from "cors";
import documentsRouter from "./routes/documents.js";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("Backend running! 🎉"));

// 挂载 documents 路由
app.use("/documents", documentsRouter);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
