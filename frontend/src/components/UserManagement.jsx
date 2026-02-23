import React, { useState, useEffect } from 'react';
import { Table, Card, Input, Select, Space, Tag, Typography, message } from 'antd';
import { SearchOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title } = Typography;
const { Option } = Select;

const UserManagement = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedAction, setSelectedAction] = useState('All');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:8000/audit-logs/');
      setLogs(res.data);
      setFilteredLogs(res.data); // Default to showing all logs
    } catch (error) {
      message.error("Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, []);

  // --- THE UNIFIED FILTER LOGIC ---
  const applyFilters = (text, action) => {
    let result = logs;

    // 1. Filter by Action Type
    if (action && action !== 'All') {
      result = result.filter(log => log.action && log.action.includes(action));
    }

    // 2. Filter by Search Text (Username or Resource)
    if (text) {
      const lowerText = text.toLowerCase();
      result = result.filter(log => 
        (log.username && log.username.toLowerCase().includes(lowerText)) || 
        (log.resource && log.resource.toLowerCase().includes(lowerText))
      );
    }

    setFilteredLogs(result);
  };

  const handleSearch = (e) => {
    const text = e.target.value;
    setSearchText(text);
    applyFilters(text, selectedAction);
  };

  const handleActionFilter = (value) => {
    setSelectedAction(value);
    applyFilters(searchText, value);
  };

  // --- TABLE COLUMNS ---
  const columns = [
    { title: 'Date & Time', dataIndex: 'timestamp', render: (val) => new Date(val).toLocaleString(), width: '20%' },
    { title: 'User', dataIndex: 'username', width: '15%' },
    { 
      title: 'Action', 
      dataIndex: 'action',
      render: (action) => {
        // Dynamic colors based on the action type
        let color = 'blue';
        if (action.includes('REGISTERED')) color = 'green';
        if (action.includes('BOOKED')) color = 'cyan';
        if (action.includes('SIGNED') || action.includes('UPDATED')) color = 'purple';
        return <Tag color={color}>{action}</Tag>;
      },
      width: '25%'
    },
    { title: 'Resource Details', dataIndex: 'resource' },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <Card 
        title={<Title level={3}><SafetyCertificateOutlined /> System Audit Logs</Title>}
        extra={
          <Space>
            {/* The Search Bar */}
            <Input 
              placeholder="Search user or resource..." 
              prefix={<SearchOutlined />} 
              value={searchText}
              onChange={handleSearch}
              style={{ width: 250 }}
              allowClear
            />
            {/* The Action Filter Dropdown */}
            <Select 
              defaultValue="All" 
              style={{ width: 200 }} 
              onChange={handleActionFilter}
            >
              <Option value="All">All Actions</Option>
              <Option value="REGISTERED PATIENT">Registered Patient</Option>
              <Option value="BOOKED APPOINTMENT">Booked Appointment</Option>
              <Option value="UPDATED PRESCRIPTION">Updated Prescription</Option>
            </Select>
          </Space>
        }
      >
        <Table 
          dataSource={filteredLogs} 
          columns={columns} 
          rowKey="id" 
          loading={loading}
          pagination={{ pageSize: 10 }} // Keeps the table neat with 10 rows per page
        />
      </Card>
    </div>
  );
};

export default UserManagement;