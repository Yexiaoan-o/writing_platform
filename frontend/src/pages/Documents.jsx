
import { List, Card } from "antd";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { mockDocs } from "../mockDocs";

export default function Documents() {
  const data = Object.keys(mockDocs).map((id) => ({
    id,
    raw: mockDocs[id],
    titleMarkdown: mockDocs[id].split("\n")[0] // 取第一行作为标题（通常是 # 标题）
  }));

  return (
    <List
      grid={{ gutter: 16, column: 1 }}
      dataSource={data}
      renderItem={(item) => (
        <List.Item key={item.id}>
          <Card>
            {/* 用 react-markdown 渲染标题（支持 #、** 等） */}
            <div style={{ marginBottom: 8 }}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {item.titleMarkdown}
              </ReactMarkdown>
            </div>
            <div>
              {/* 可渲染简短摘要（也可以用 ReactMarkdown） */}
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {item.raw.split("\n").slice(1, 4).join("\n")}
              </ReactMarkdown>
            </div>
            <Link to={`/documents/${item.id}`}>查看详情</Link>
          </Card>
        </List.Item>
      )}
    />
  );
}
