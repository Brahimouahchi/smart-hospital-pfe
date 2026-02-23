import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title } = Typography;

const Login = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('username', values.username);
      formData.append('password', values.password);

      const response = await axios.post('http://localhost:8000/token', formData);
      
      // Save all data
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('username', values.username);
      localStorage.setItem('role', response.data.role); // CRITICAL

      message.success('Login successful!');
      onLogin();
    } catch (error) {
      message.error('Invalid credentials or server error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5' }}>
      <Card style={{ width: 350 }}>
        <Title level={3} style={{ textAlign: 'center' }}>Hospital Login</Title>
        <Form onFinish={onFinish} layout="vertical">
          <Form.Item name="username" rules={[{ required: true }]}>
            <Input prefix={<UserOutlined />} placeholder="Username" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Password" />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>Sign In</Button>
        </Form>
      </Card>
    </div>
  );
};

export default Login;