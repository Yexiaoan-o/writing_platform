import express from "express";
import pool from "../db.js";

const router = express.Router();

// GET /documents
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM documents ORDER BY id");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch documents" });
  }
});

// GET /documents/:id
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM documents WHERE id=$1", [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Document not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch document" });
  }
});

// POST /documents

// POST /documents (with author, folder, created_at, updated_at)
router.post("/", async (req, res) => {
  const { title, content, author, folder } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO documents (title, content, author, folder, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING *`,
      [title, content, author, folder]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create document" });
  }
});

// PUT /documents/:id

// PUT /documents/:id (with author, folder, updated_at)
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { title, content, author, folder } = req.body;
  try {
    const result = await pool.query(
      `UPDATE documents SET title=$1, content=$2, author=$3, folder=$4, updated_at=NOW() WHERE id=$5 RETURNING *`,
      [title, content, author, folder, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Document not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update document" });
  }
});

// DELETE /documents/:id
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM documents WHERE id=$1", [id]);
    res.json({ message: "Document deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete document" });
  }
});

export default router;
