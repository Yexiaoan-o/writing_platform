import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MDEditor from "@uiw/react-md-editor";
import { mockDocs } from "../mockDocs";
import { Card, Button } from "antd";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

export default function MarkdownEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [value, setValue] = useState("");

  useEffect(() => {
    if (id && mockDocs[id]) setValue(mockDocs[id]);
  }, [id]);

  const handleSave = () => {
    if (id) mockDocs[id] = value;
    else {
      const newId = String(Object.keys(mockDocs).length + 1);
      mockDocs[newId] = value;
      navigate(`/documents/${newId}`);
      return;
    }
    navigate(`/documents/${id}`);
  };

  return (
    <Card style={{ maxWidth: 800, margin: "0 auto" }}>
      <MDEditor value={value} onChange={setValue} height={500} />
      <Button type="primary" style={{ marginTop: 20 }} onClick={handleSave}>
        保存
      </Button>
    </Card>
  );
}
