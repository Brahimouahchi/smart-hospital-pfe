import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, message } from 'antd';
import { UserOutlined, MedicineBoxOutlined, CalendarOutlined } from '@ant-design/icons';
import axios from 'axios';
import PatientChart from './PatientChart';

const Dashboard = () => {
  const [stats, setStats] = useState({
    total_patients: 0,
    active_cases: 0,
    todays_appointments: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get('http://localhost:8000/stats/');
      setStats(response.data);
    } catch (error) {
      message.error('Failed to load stats');
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: '20px' }}>📊 Hospital Overview</h2>
      
      <Row gutter={16}>
        {/* Card 1: Total Patients */}
        <Col span={8}>
          <Card bordered={false} style={{ background: '#e6f7ff' }}>
            <Statistic
              title="Total Patients"
              value={stats.total_patients}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>

        {/* Card 2: Active Cases */}
        <Col span={8}>
          <Card bordered={false} style={{ background: '#fff1f0' }}>
            <Statistic
              title="Active Medical Cases"
              value={stats.active_cases}
              prefix={<MedicineBoxOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>

        {/* Card 3: Appointments */}
        <Col span={8}>
          <Card bordered={false} style={{ background: '#f6ffed' }}>
            <Statistic
              title="Today's Appointments"
              value={stats.todays_appointments}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Placeholder for a Graph */}
      <Card title="Patient Growth (Last 7 Days)" style={{ marginTop: '20px', height: '300px' }}>
        <PatientChart />
      </Card>
    </div>
  );
};

export default Dashboard;