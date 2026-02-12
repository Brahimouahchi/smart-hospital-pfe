import React, { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import axios from 'axios';

const Login = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Send data to Python (Must use FormData for OAuth2 standard)
      const formData = new FormData();
      formData.append('username', values.username);
      formData.append('password', values.password);

      const response = await axios.post('http://localhost:8000/token', formData);

      // If successful, save the token and tell App we are logged in
      localStorage.setItem('token', response.data.access_token);
      message.success('Login Successful!');
      onLogin(); // <--- This switches the view to Dashboard

    } catch (error) {
      message.error('Invalid Username or Password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5' }}>
      <Card style={{ width: 350, boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <h2 style={{ color: '#1890ff' }}>🏥 Smart Hospital</h2>
          <p>Secure Staff Login</p>
        </div>

        <Form name="login" onFinish={onFinish}>
          <Form.Item name="username" rules={[{ required: true, message: 'Please input your Username!' }]}>
            <Input prefix={<UserOutlined />} placeholder="Username" />
          </Form.Item>

          <Form.Item name="password" rules={[{ required: true, message: 'Please input your Password!' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Password" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Log in
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;