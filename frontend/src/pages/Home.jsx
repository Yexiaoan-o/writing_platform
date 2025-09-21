import { Typography, Card, Button, Space, Avatar, Tooltip } from "antd";
import { 
  EditOutlined, 
  FileTextOutlined, 
  BookOutlined,
  GithubOutlined,
  TwitterOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "./Home.css";

const { Title, Paragraph } = Typography;

export default function Home() {
  const navigate = useNavigate();

  const features = [
    {
      title: "创建文档",
      icon: <EditOutlined style={{ fontSize: "24px" }} />,
      description: "使用 Markdown 语法创建格式丰富的文档",
      action: () => navigate("/editor"),
    },
    {
      title: "浏览文档",
      icon: <FileTextOutlined style={{ fontSize: "24px" }} />,
      description: "查看和管理您的所有文档",
      action: () => navigate("/documents"),
    },
    {
      title: "实时预览",
      icon: <BookOutlined style={{ fontSize: "24px" }} />,
      description: "边写边看，所见即所得",
      action: () => navigate("/editor"),
    },
  ];

  const socialLinks = [
    {
      icon: <GithubOutlined />,
      link: "https://github.com/Yexiaoan-o",
      tooltip: "GitHub"
    },
    {
      icon: <TwitterOutlined />,
      link: "https://x.com/oliverye6",
      tooltip: "Twitter"
    },
  ];

  return (
    <div className="home-container">
      <div className="profile-section title-animation">
        <Avatar 
          size={100} 
          src="https://github.com/Yexiaoan-o/Blog-images/blob/main/images/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20250920183003_65_7.jpg?raw=true"
          style={{ marginBottom: "16px" }}
        />
        <Title>Sean 的文档平台</Title>
        <Paragraph style={{ fontSize: "18px", color: "#666", marginBottom: "24px" }}>
          简单、高效的 Markdown 文档管理平台
        </Paragraph>
        <Space size="large" className="social-links">
          {socialLinks.map((social, index) => (
            <Tooltip title={social.tooltip} key={index}>
              <a 
                href={social.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="social-icon"
              >
                {social.icon}
              </a>
            </Tooltip>
          ))}
        </Space>
      </div>

      <div className="features-container">
        {features.map((feature, index) => (
          <Card
            key={index}
            className="feature-card feature-animation"
            hoverable
          >
            <div style={{ marginBottom: "16px", color: "#1890ff" }}>
              {feature.icon}
            </div>
            <Title level={4}>{feature.title}</Title>
            <Paragraph style={{ minHeight: "48px" }}>
              {feature.description}
            </Paragraph>
            <Button type="primary" onClick={feature.action} className="action-button">
              立即使用
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
