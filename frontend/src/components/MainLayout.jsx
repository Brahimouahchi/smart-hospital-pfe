import React, { useState } from 'react';
import { Layout, Menu, Button, theme, Avatar } from 'antd';
import { 
  UserOutlined, 
  VideoCameraOutlined, 
  UploadOutlined, 
  MenuFoldOutlined, 
  MenuUnfoldOutlined,
  MedicineBoxOutlined,
  TeamOutlined,
  DashboardOutlined,
  LogoutOutlined
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;

const MainLayout = ({ children, setView }) => {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
  <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed} width={250} style={{ background: '#001529' }}>
        {/* ... Logo code ... */}

        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['dashboard']}
          // --- THE FIX IS HERE ---
          onClick={({ key }) => {
            if (key === 'logout') {
              onLogout(); // Call the logout function from App.jsx
            } else {
              setView(key); // Otherwise, switch pages
            }
          }}
          // -----------------------
          items={[
            { key: 'dashboard', icon: <DashboardOutlined />, label: 'Doctor Dashboard' },
            { key: 'patients', icon: <TeamOutlined />, label: 'Patient List' },
            { key: 'register', icon: <MedicineBoxOutlined />, label: 'Register New Patient' },
            { key: 'logout', icon: <LogoutOutlined style={{ color: 'red' }} />, label: 'Logout' },
          ]}
        />
      </Sider>

      {/* --- THE MAIN CONTENT AREA --- */}
      <Layout>
        
        {/* Top Header */}
        <Header style={{ padding: 0, background: colorBgContainer, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '16px', width: 64, height: 64 }}
          />
          
          {/* User Profile on the right */}
          <div style={{ marginRight: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>Dr. Brahim</span>
            <Avatar style={{ backgroundColor: '#87d068' }} icon={<UserOutlined />} />
          </div>
        </Header>

        {/* Dynamic Page Content */}
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          {children}
        </Content>

      </Layout>
    </Layout>
  );
};

export default MainLayout;