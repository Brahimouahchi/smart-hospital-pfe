import React, { useState } from 'react';
import { Layout, Menu, Button, theme, Avatar, Tag } from 'antd';
import { 
  UserOutlined, 
  MenuFoldOutlined, 
  MenuUnfoldOutlined,
  MedicineBoxOutlined,
  TeamOutlined,
  DashboardOutlined,
  LogoutOutlined,
  CalendarOutlined,
  AppstoreAddOutlined, 
  ClockCircleOutlined,
  SafetyCertificateOutlined 
} from '@ant-design/icons';
const { Header, Sider, Content } = Layout;

const MainLayout = ({ children, setView, onLogout }) => {
  const [collapsed, setCollapsed] = useState(false);
  
  // Get the role from localStorage (we'll set this during login)
  // Default to 'staff' if not found for safety
  const userRole = localStorage.getItem('role') || 'staff'; 
  const username = localStorage.getItem('username') || 'User';

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // --- RBAC MENU LOGIC ---
  // We filter the items based on the user's role
  const menuItems = [
    { key: 'dashboard', icon: <DashboardOutlined />, label: 'Hospital Overview' },
    
    // STAFF ONLY: Registration, Booking, and Inventory
    userRole === 'staff' && { key: 'register', icon: <MedicineBoxOutlined />, label: 'Register Patient' },
    userRole === 'staff' && { key: 'appointments', icon: <CalendarOutlined />, label: 'Book Appointments' },
    userRole === 'staff' && { key: 'inventory', icon: <AppstoreAddOutlined />, label: 'Hospital Inventory' },
    userRole === 'staff' && { key: 'users', icon: <SafetyCertificateOutlined />, label: 'User Management' },

    // DOCTOR ONLY: Patient medical files and their specific Consultation list
    userRole === 'doctor' && { key: 'patients', icon: <TeamOutlined />, label: 'Medical Records' },
    userRole === 'doctor' && { key: 'dr_consultations', icon: <ClockCircleOutlined />, label: 'My Consultations' },
    

    { type: 'divider' },
    { key: 'logout', icon: <LogoutOutlined style={{ color: 'red' }} />, label: 'Logout' },
  ].filter(Boolean); // This removes the 'false' entries for the other role

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed} width={250} style={{ background: '#001529' }}>
        
        <div style={{ height: '64px', margin: '16px', background: 'rgba(255, 255, 255, 0.2)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
           <h2 style={{ color: 'white', fontSize: collapsed ? '10px' : '18px', margin: 0 }}>
             {collapsed ? 'SH' : '🏥 Smart Hospital'}
           </h2>
        </div>

        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['dashboard']}
          onClick={({ key }) => {
            if (key === 'logout') {
              onLogout();
            } else {
              setView(key);
            }
          }}
          items={menuItems}
        />
      </Sider>

      <Layout>
        <Header style={{ padding: '0 24px', background: colorBgContainer, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '16px', width: 64, height: 64 }}
          />
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {/* Display the Role Badge */}
            <Tag color={userRole === 'doctor' ? 'magenta' : 'blue'}>
              {userRole.toUpperCase()} ACCOUNT
            </Tag>
            
            <span style={{ fontWeight: 'bold' }}>{username}</span>
            <Avatar style={{ backgroundColor: userRole === 'doctor' ? '#722ed1' : '#1890ff' }} icon={<UserOutlined />} />
          </div>
        </Header>

        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            overflow: 'initial'
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;