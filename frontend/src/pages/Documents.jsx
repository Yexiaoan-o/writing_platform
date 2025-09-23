

import { Layout, Tree, Card, Spin, message, Descriptions, Empty } from "antd";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { fetchDocuments, fetchDocumentById } from "../services/api";
const { Sider, Content } = Layout;
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

  export default function Documents() {
    const location = useLocation();
    const [treeData, setTreeData] = useState([]); // Will be set from backend
    const [selectedDocId, setSelectedDocId] = useState(null);
    const [docContent, setDocContent] = useState("");
    const [docInfo, setDocInfo] = useState(null);
    const [loading, setLoading] = useState(false);

    // Fetch document list every time the page is visited
    useEffect(() => {
      fetchDocuments()
        .then((docs) => {
          // Group docs by folder for tree structure
          const folderMap = {};
          docs.forEach((doc) => {
            const folder = doc.folder || "未分类";
            if (!folderMap[folder]) folderMap[folder] = [];
            folderMap[folder].push({
              title: doc.title,
              key: `doc-${doc.id}`,
            });
          });
          const tree = Object.entries(folderMap).map(([folder, children], idx) => ({
            title: folder,
            key: `folder-${idx}`,
            children,
          }));
          setTreeData(tree);
        })
        .catch(() => setTreeData([]));
    }, [location]);

    // Fetch document content and info when selectedDocId changes
    useEffect(() => {
      if (selectedDocId && selectedDocId.startsWith("doc-")) {
        setLoading(true);
        // Remove 'doc-' prefix to get real id if needed
        const realId = selectedDocId.replace("doc-", "");
        fetchDocumentById(realId)
          .then((doc) => {
            setDocContent(doc.content || doc.raw || "");
            setDocInfo({
              author: doc.author || "未知",
              created: doc.created_at || doc.created || "-",
              updated: doc.updated_at || doc.updated || "-",
              ...doc,
            });
          })
          .catch(() => {
            setDocContent("");
            setDocInfo(null);
          })
          .finally(() => setLoading(false));
      } else {
        setDocContent("");
        setDocInfo(null);
      }
    }, [selectedDocId]);

    return (
      <Layout style={{ height: "calc(100vh - 64px)", background: "#fff" }}>
        <Sider width={240} style={{ background: "#f5f5f5", borderRight: "1px solid #eee", padding: 16 }}>
          <h3 style={{ margin: "0 0 16px 0" }}>目录</h3>
          <Tree
            treeData={treeData}
            defaultExpandAll
            onSelect={(keys) => setSelectedDocId(keys[0])}
            selectedKeys={selectedDocId ? [selectedDocId] : []}
          />
        </Sider>
        <Content style={{ padding: 24, minHeight: 280, flex: 1, overflow: "auto" }}>
          {loading ? (
            <Spin tip="加载中..." />
          ) : docContent ? (
            <Card title="文档内容" style={{ minHeight: 400 }}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{docContent}</ReactMarkdown>
            </Card>
          ) : (
            <Empty description="请选择左侧文档" />
          )}
        </Content>
        <Sider width={300} style={{ background: "#fafafa", borderLeft: "1px solid #eee", padding: 16 }}>
          <h3 style={{ margin: "0 0 16px 0" }}>文档信息</h3>
          {docInfo ? (
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="作者">{docInfo.author}</Descriptions.Item>
              <Descriptions.Item label="创建时间">{docInfo.created}</Descriptions.Item>
              <Descriptions.Item label="更新时间">{docInfo.updated}</Descriptions.Item>
              {/* 可扩展更多信息 */}
            </Descriptions>
          ) : (
            <Empty description="暂无信息" />
          )}
        </Sider>
      </Layout>
  );
}
