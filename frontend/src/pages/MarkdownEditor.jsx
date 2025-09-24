import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MDEditor from "@uiw/react-md-editor";
import { fetchDocumentById, createDocument, updateDocument, fetchFolders } from "../services/api";
import { Card, Button, Input, Form, Select } from "antd";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

export default function MarkdownEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [value, setValue] = useState("");
  const [author, setAuthor] = useState("");
  const [folderId, setFolderId] = useState(1); // 默认文件夹ID
  const [folders, setFolders] = useState([]);

  // 获取文件夹列表
  useEffect(() => {
    fetchFolders()
      .then(foldersData => {
        setFolders(foldersData);
        // 如果有文件夹数据且当前没有设置文件夹ID，则设置为第一个文件夹
        if (foldersData.length > 0 && folderId === 1) {
          setFolderId(foldersData[0].id);
        }
      })
      .catch(() => {
        // 获取文件夹失败时使用默认文件夹
        setFolders([{ id: 1, name: "默认文件夹" }]);
      });
  }, []);

  useEffect(() => {
    if (id) {
      fetchDocumentById(id)
        .then((doc) => {
          setValue(doc.content || doc.raw || "");
          setAuthor(doc.author || "");
          // 设置文档的文件夹ID
          if (doc.folder || doc.folder_id) {
            const docFolderId = parseInt(doc.folder || doc.folder_id, 10);
            if (!isNaN(docFolderId)) {
              setFolderId(docFolderId);
            }
          }
        })
        .catch(() => {
          setValue("");
          setAuthor("");
        });
    }
  }, [id]);

  const handleSave = async () => {
    // Extract title from first non-empty line (remove leading # and spaces)
    const firstLine = (value || '').split('\n').find(line => line.trim() !== '') || '';
    const title = firstLine.replace(/^#+\s*/, '').trim();
    try {
      if (id) {
        await updateDocument(id, { title, content: value, author, folder: folderId });
        navigate(`/documents/${id}`);
      } else {
        const doc = await createDocument({ title, content: value, author, folder: folderId });
        navigate(`/documents/${doc.id || doc._id}`);
      }
    } catch (e) {
      alert("保存失败");
    }
  };

  return (
    <Card style={{ maxWidth: 800, margin: "0 auto" }}>
      <Form layout="vertical">
        <Form.Item label="作者">
          <Input value={author} onChange={e => setAuthor(e.target.value)} placeholder="请输入作者" />
        </Form.Item>
        <Form.Item label="文件夹">
          <Select
            value={folderId}
            onChange={setFolderId}
            options={folders.map(folder => ({
              label: folder.name,
              value: folder.id
            }))}
          />
        </Form.Item>
        <Form.Item label="文档内容">
          <MDEditor value={value} onChange={setValue} height={500} />
        </Form.Item>
        <Button type="primary" style={{ marginTop: 20 }} onClick={handleSave}>
          保存
        </Button>
      </Form>
    </Card>
  );
}
