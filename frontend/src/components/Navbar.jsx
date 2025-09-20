import { Layout, Menu } from "antd";
import { Link, useLocation } from "react-router-dom";

const { Header, Content } = Layout;

export default function Navbar({ children }) {
  const location = useLocation();
  const selectedKey = location.pathname.startsWith("/documents")
    ? "documents"
    : location.pathname === "/editor"
    ? "editor"
    : "home";

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header style={{ display: "flex", justifyContent: "space-between" }}>
        <div style={{ color: "#fff", fontSize: 20, fontWeight: "bold" }}>文档平台</div>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[selectedKey]}
          items={[
            { key: "home", label: <Link to="/">首页</Link> },
            { key: "documents", label: <Link to="/documents">文档列表</Link> },
            { key: "editor", label: <Link to="/editor">新建文档</Link> },
          ]}
        />
      </Header>
      <Content style={{ padding: "20px 50px" }}>{children}</Content>
    </Layout>
  );
}
