import express from "express";
import pool from "../db.js";

const router = express.Router();

// GET /folders - 获取所有文件夹
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, description, parent_id, created_at, updated_at
      FROM folders 
      ORDER BY name
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "获取文件夹列表失败" });
  }
});

// POST /folders - 创建新文件夹
router.post("/", async (req, res) => {
  const { name, description, parent_id } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: "文件夹名称不能为空" });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 检查文件夹名是否已存在
    const exists = await client.query(
      "SELECT id FROM folders WHERE name = $1",
      [name]
    );
    if (exists.rows.length > 0) {
      throw new Error("文件夹名称已存在");
    }

    // 如果指定了父文件夹，检查父文件夹是否存在
    if (parent_id) {
      const parentExists = await client.query(
        "SELECT id FROM folders WHERE id = $1",
        [parent_id]
      );
      if (parentExists.rows.length === 0) {
        throw new Error("父文件夹不存在");
      }
    }

    // 创建新文件夹
    const result = await client.query(
      `INSERT INTO folders (name, description, parent_id) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [name, description, parent_id]
    );

    await client.query('COMMIT');
    res.status(201).json(result.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: err.message || "创建文件夹失败" });
  } finally {
    client.release();
  }
});

// PUT /folders/:id - 更新文件夹信息
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, description, parent_id } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: "文件夹名称不能为空" });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 检查文件夹是否存在
    const folder = await client.query(
      "SELECT id FROM folders WHERE id = $1",
      [id]
    );
    if (folder.rows.length === 0) {
      throw new Error("文件夹不存在");
    }

    // 检查新名称是否与其他文件夹冲突
    const exists = await client.query(
      "SELECT id FROM folders WHERE name = $1 AND id != $2",
      [name, id]
    );
    if (exists.rows.length > 0) {
      throw new Error("文件夹名称已存在");
    }

    // 如果指定了父文件夹，检查父文件夹是否存在且不是自己
    if (parent_id) {
      if (parent_id === id) {
        throw new Error("不能将文件夹设为自己的子文件夹");
      }
      const parentExists = await client.query(
        "SELECT id FROM folders WHERE id = $1",
        [parent_id]
      );
      if (parentExists.rows.length === 0) {
        throw new Error("父文件夹不存在");
      }
    }

    // 更新文件夹信息
    const result = await client.query(
      `UPDATE folders 
       SET name = $1, description = $2, parent_id = $3
       WHERE id = $4 
       RETURNING *`,
      [name, description, parent_id, id]
    );

    await client.query('COMMIT');
    res.json(result.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: err.message || "更新文件夹失败" });
  } finally {
    client.release();
  }
});

// DELETE /folders/:id - 删除文件夹
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 检查文件夹是否存在
    const folder = await client.query(
      "SELECT id FROM folders WHERE id = $1",
      [id]
    );
    if (folder.rows.length === 0) {
      throw new Error("文件夹不存在");
    }

    // 检查是否有子文件夹
    const subfolders = await client.query(
      "SELECT id FROM folders WHERE parent_id = $1",
      [id]
    );
    if (subfolders.rows.length > 0) {
      throw new Error("请先删除子文件夹");
    }

    // 检查文件夹是否为空
    const docs = await client.query(
      "SELECT id FROM documents WHERE folder = $1 LIMIT 1",
      [id]
    );
    if (docs.rows.length > 0) {
      throw new Error("请先移除文件夹中的文档");
    }

    // 删除文件夹
    await client.query("DELETE FROM folders WHERE id = $1", [id]);

    await client.query('COMMIT');
    res.json({ message: "文件夹删除成功" });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: err.message || "删除文件夹失败" });
  } finally {
    client.release();
  }
});

export default router;