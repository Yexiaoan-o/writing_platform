import { Layout, Tree, Card, Spin, message, Descriptions, Empty, Dropdown, Modal } from "antd";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { 
  fetchDocuments, 
  fetchDocumentById, 
  deleteDocument,
  createFolder,
  updateFolder,
  deleteFolder,
  fetchFolders,
  updateDocument
} from "../services/api";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const { Sider, Content } = Layout;

export default function Documents() {
  const location = useLocation();
  const [treeData, setTreeData] = useState([]);
  const [selectedDocId, setSelectedDocId] = useState(null);
  const [docContent, setDocContent] = useState("");
  const [docInfo, setDocInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [folders, setFolders] = useState([]);

  // 创建文件夹的通用函数
  const createFolderHandler = (parentId = null) => {
    Modal.confirm({
      title: parentId ? "新建子文件夹" : "新建文件夹",
      content: (
        <input
          type="text"
          placeholder="请输入文件夹名称"
          style={{ width: '100%', marginTop: 16 }}
          id="newFolderName"
        />
      ),
      onOk: async () => {
        const folderName = document.getElementById('newFolderName').value;
        if (!folderName) {
          message.error('文件夹名称不能为空');
          return;
        }
        try {
          const folderData = {
            name: folderName,
            description: ''
          };
          if (parentId) {
            folderData.parent_id = parentId;
          }
          await createFolder(folderData);
          message.success('创建成功');
          const foldersData = await refreshFolders();
          await refreshTree(foldersData);
        } catch (err) {
          message.error(err.message || '创建失败');
        }
      },
    });
  };

  const addFolderButton = (
    <Dropdown
      menu={{
        items: [
          {
            key: 'add',
            label: '新建文件夹',
            onClick: () => createFolderHandler()
          }
        ]
      }}
    >
      <span style={{ cursor: 'pointer', padding: '4px 8px' }}>+ 新建文件夹</span>
    </Dropdown>
  );

  // 刷新文件夹列表
  const refreshFolders = async () => {
    try {
      const foldersData = await fetchFolders();
      setFolders(foldersData);
      return foldersData;
    } catch (err) {
      message.error('获取文件夹列表失败');
      return [];
    }
  };

  // 刷新文档树
  const refreshTree = async (currentFolders = null) => {
    try {
      const docs = await fetchDocuments();
      const treeData = renderTreeData(docs, currentFolders);
      setTreeData(treeData);
    } catch (err) {
      console.error(err);
      message.error("获取文档列表失败");
    }
  };

  // 加载文档内容
  const loadDocument = async (id) => {
    try {
      setLoading(true);
      const doc = await fetchDocumentById(id);
      setDocContent(doc.content);
      setDocInfo(doc);
    } catch (err) {
      console.error(err);
      message.error("获取文档内容失败");
      setDocContent("");
      setDocInfo(null);
    } finally {
      setLoading(false);
    }
  };

  // 初始化加载
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const foldersData = await refreshFolders();
        await refreshTree(foldersData);
      } catch (err) {
        console.error(err);
        message.error('初始化失败');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // 渲染文档树节点（含操作按钮）
  const renderTreeData = (docs, currentFolders = null) => {
    const folderMap = {};
    
    // 首先初始化所有文件夹
    const foldersToUse = currentFolders || folders;
    foldersToUse.forEach(folder => {
      folderMap[folder.id] = {
        key: `folder-${folder.id}`,
        folderId: folder.id,
        title: (
          <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span>{folder.name}</span>
            <Dropdown
              trigger={['click']}
              menu={{
                items: [
                  {
                    key: 'add-subfolder',
                    label: '新建子文件夹',
                    onClick: () => createFolderHandler(folder.id)
                  },
                  {
                    key: 'rename',
                    label: '重命名',
                    onClick: () => {
                      Modal.confirm({
                        title: "重命名文件夹",
                        content: (
                          <input
                            type="text"
                            defaultValue={folder.name}
                            style={{ width: '100%', marginTop: 16 }}
                            id="newFolderName"
                          />
                        ),
                        onOk: async () => {
                          const newName = document.getElementById('newFolderName').value;
                          if (!newName) {
                            message.error('文件夹名称不能为空');
                            return;
                          }
                          try {
                            await updateFolder(folder.id, { ...folder, name: newName });
                            message.success('重命名成功');
                            const foldersData = await refreshFolders();
                            refreshTree(foldersData);
                          } catch (err) {
                            message.error(err.message || '重命名失败');
                          }
                        },
                      });
                    }
                  },
                  folder.id !== 1 && {  // 不允许删除默认文件夹（ID=1）
                    key: 'delete',
                    label: '删除文件夹',
                    danger: true,
                    onClick: () => {
                      Modal.confirm({
                        title: "确认删除该文件夹？",
                        content: "删除后文件夹中的文档将被移至默认文件夹，确定要删除吗？",
                        okText: "删除",
                        okType: "danger",
                        cancelText: "取消",
                        onOk: async () => {
                          try {
                            await deleteFolder(folder.id);
                            message.success("删除成功");
                            const foldersData = await refreshFolders();
                            refreshTree(foldersData);
                          } catch (err) {
                            message.error(err.message || "删除失败");
                          }
                        },
                      });
                    }
                  }
                ].filter(Boolean)
              }}
            >
              <span onClick={e => e.stopPropagation()} style={{ marginLeft: 8, cursor: 'pointer' }}>...</span>
            </Dropdown>
          </span>
        ),
        children: [],
        parentId: folder.parent_id
      };
    });
    
    // 如果没有文件夹，创建一个默认文件夹
    if (Object.keys(folderMap).length === 0) {
      folderMap[1] = {
        key: `folder-1`,
        folderId: 1,
        title: "默认文件夹",
        children: [],
        parentId: null
      };
    }
    
    // 构建文件夹的层级结构
    const rootFolders = [];
    Object.values(folderMap).forEach(folder => {
      if (folder.parentId && folderMap[folder.parentId]) {
        // 如果有父文件夹且父文件夹存在，则添加为子文件夹
        folderMap[folder.parentId].children.push(folder);
      } else {
        // 否则作为根文件夹
        rootFolders.push(folder);
      }
    });

    // 然后将文档添加到对应的文件夹中
    docs.forEach((doc) => {
      // 确保folderId是数字类型，并处理默认情况
      let folderId = 1; // 默认文件夹ID
      if (doc.folder || doc.folder_id) {
        // 处理folder或folder_id字段，确保是有效数字
        const folderValue = doc.folder || doc.folder_id;
        const parsedFolderId = parseInt(folderValue, 10);
        if (!isNaN(parsedFolderId) && parsedFolderId > 0) {
          folderId = parsedFolderId;
        }
      }
      
      // 如果指定的文件夹不存在，使用默认文件夹
      const targetFolderId = folderMap[folderId] ? folderId : 1;
      
      // 确保目标文件夹存在
      if (!folderMap[targetFolderId]) {
        const defaultFolder = folders.find(f => f.id === 1) || { id: 1, name: "默认文件夹" };
        folderMap[targetFolderId] = {
          key: `folder-${targetFolderId}`,
          title: defaultFolder.name,
          children: []
        };
      }
      
      folderMap[targetFolderId].children.push({
        title: (
          <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span>{doc.title}</span>
            <Dropdown
              menu={{
                items: [
                  {
                    key: 'edit',
                    label: '修改标题',
                    onClick: (e) => {
                      Modal.confirm({
                        title: "修改文档标题",
                        content: (
                          <input 
                            type="text"
                            defaultValue={doc.title}
                            style={{ width: '100%', marginTop: 16 }}
                            id="newTitle"
                          />
                        ),
                        onOk: async () => {
                          const newTitle = document.getElementById('newTitle').value;
                          if (!newTitle) {
                            message.error('标题不能为空');
                            return;
                          }
                          try {
                            await updateDocument(doc.id, {
                              ...doc,
                              title: newTitle,
                            });
                            message.success('标题修改成功');
                            refreshTree();
                          } catch (err) {
                            message.error('修改失败');
                          }
                        },
                      });
                    }
                  },
                  {
                    key: 'delete',
                    label: '删除文档',
                    danger: true,
                    onClick: (e) => {
                      Modal.confirm({
                        title: "确认删除该文档？",
                        content: "删除后无法恢复，确定要删除吗？",
                        okText: "删除",
                        okType: "danger",
                        cancelText: "取消",
                        onOk: async () => {
                          try {
                            await deleteDocument(doc.id);
                            message.success("删除成功");
                            if (selectedDocId === `doc-${doc.id}`) {
                              setSelectedDocId(null);
                            }
                            refreshTree();
                          } catch (err) {
                            message.error("删除失败");
                          }
                        },
                      });
                    }
                  }
                ]
              }}
              trigger={["click"]}
            >
              <span
                style={{ marginLeft: 8, cursor: "pointer", color: "#888" }}
                onClick={e => e.stopPropagation()}
              >
                ...
              </span>
            </Dropdown>
          </span>
        ),
        key: `doc-${doc.id}`,
      });
    });

    // 对每个文件夹的子节点进行排序
    Object.values(folderMap).forEach(folder => {
      folder.children.sort((a, b) => {
        // 安全地获取节点标题进行排序
        let titleA = '';
        let titleB = '';
        
        // 处理文件夹节点
        if (a.title.props && a.title.props.children && a.title.props.children[0]) {
          titleA = a.title.props.children[0].props ? a.title.props.children[0].props.children : a.title.props.children[0];
        } 
        // 处理文档节点
        else if (a.title.props && a.title.props.children) {
          titleA = a.title.props.children;
        }
        
        // 处理文件夹节点
        if (b.title.props && b.title.props.children && b.title.props.children[0]) {
          titleB = b.title.props.children[0].props ? b.title.props.children[0].props.children : b.title.props.children[0];
        } 
        // 处理文档节点
        else if (b.title.props && b.title.props.children) {
          titleB = b.title.props.children;
        }
        
        return String(titleA).localeCompare(String(titleB));
      });
    });
    
    // 返回根文件夹作为树的顶层节点
    return rootFolders;
  };

  return (
    <Spin spinning={loading}>
      <Layout style={{ padding: "24px" }}>
        <Sider width={300} style={{ background: "#fff", padding: "16px" }}>
          <div style={{ marginBottom: 16 }}>
            {addFolderButton}
          </div>
          <Tree
            treeData={treeData}
            selectedKeys={selectedDocId ? [selectedDocId] : []}
            onSelect={(selectedKeys) => {
              const key = selectedKeys[0];
              if (key && key.startsWith("doc-")) {
                setSelectedDocId(key);
                loadDocument(key.split("-")[1]);
              }
            }}
          />
        </Sider>
        <Content style={{ padding: "0 24px", minHeight: 280 }}>
          {docInfo ? (
            <Card>
              <Descriptions title={docInfo.title}>
                <Descriptions.Item label="创建时间">
                  {new Date(docInfo.created_at).toLocaleString()}
                </Descriptions.Item>
                {docInfo.updated_at && (
                  <Descriptions.Item label="更新时间">
                    {new Date(docInfo.updated_at).toLocaleString()}
                  </Descriptions.Item>
                )}
              </Descriptions>
              <ReactMarkdown children={docContent} remarkPlugins={[remarkGfm]} />
            </Card>
          ) : (
            <Empty description="请选择要查看的文档" />
          )}
        </Content>
      </Layout>
    </Spin>
  );
}