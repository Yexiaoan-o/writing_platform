import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism"; // 你可以换别的主题
import { useParams, useNavigate } from 'react-router-dom'
import { mockDocs } from '../mockDocs'
import { Button } from 'antd';
import { Card, Typography } from "antd";
const { Title, Paragraph } = Typography;



function DocumentsDetail() {
  const params = useParams()
  const navigate = useNavigate();
  const content = mockDocs[params.id];
    if (!content) {
    return <div className="p-6">文档不存在</div>;
  }

  return (
  <div>
    <Card style={{ marginTop: 20 }}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || "");
            return !inline && match ? (
              <SyntaxHighlighter
                style={oneDark}
                language={match[1]}
                PreTag="div"
                {...props}
              >
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          }
        }}
      >
        {content}
      
      </ReactMarkdown>
      <Button type="primary"
        onClick={() => navigate(`/documents/${params.id}/edit`)}
      >
        编辑
      </Button>

    </Card>
  </div>
  )
}

export default DocumentsDetail