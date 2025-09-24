import express from "express";
import cors from "cors";
import documentsRouter from "./routes/documents.js";
import foldersRouter from "./routes/folders.js";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("Backend running! 🎉"));

// 挂载路由
app.use("/documents", documentsRouter);
app.use("/folders", foldersRouter);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
