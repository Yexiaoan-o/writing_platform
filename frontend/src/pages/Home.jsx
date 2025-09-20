import { Typography } from "antd";
const { Title, Paragraph } = Typography;

export default function Home() {
  return (
    <div style={{ textAlign: "center", marginTop: 50 }}>
      <Title>欢迎来到文档平台</Title>
      <Paragraph>你可以创建、编辑、查看 Markdown 文档</Paragraph>
    </div>
  );
}
