import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MDEditor from "@uiw/react-md-editor";
import { fetchDocumentById, createDocument, updateDocument } from "../services/api";
import { Card, Button, Input, Form } from "antd";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

export default function MarkdownEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [value, setValue] = useState("");
  const [author, setAuthor] = useState("");

  useEffect(() => {
    if (id) {
      fetchDocumentById(id)
        .then((doc) => {
          setValue(doc.content || doc.raw || "");
          setAuthor(doc.author || "");
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
        await updateDocument(id, { title, content: value, author });
        navigate(`/documents/${id}`);
      } else {
        const doc = await createDocument({ title, content: value, author });
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
