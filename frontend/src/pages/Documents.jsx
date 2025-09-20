

import { List, Card, Spin, message } from "antd";
import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { fetchDocuments } from "../services/api";

export default function Documents() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocuments()
      .then((data) => {
        // Expecting data to be an array of documents with id and content
        setDocs(
          data.map((doc) => ({
            id: doc.id || doc._id,
            raw: doc.content || doc.raw || "",
            titleMarkdown: (doc.content || doc.raw || "").split("\n")[0],
          }))
        );
      })
      .catch(() => message.error("获取文档列表失败"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Spin spinning={loading} tip="加载中...">
      <List
        grid={{ gutter: 16, column: 1 }}
        dataSource={docs}
        renderItem={(item) => (
          <List.Item key={item.id}>
            <Card>
              <div style={{ marginBottom: 8 }}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {item.titleMarkdown}
                </ReactMarkdown>
              </div>
              <div>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {item.raw.split("\n").slice(1, 4).join("\n")}
                </ReactMarkdown>
              </div>
              <Link to={`/documents/${item.id}`}>查看详情</Link>
            </Card>
          </List.Item>
        )}
      />
    </Spin>
  );
}
