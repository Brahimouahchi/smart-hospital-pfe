import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Modal, Form, Input, InputNumber, message, Typography, Space } from 'antd';
import { PlusOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title } = Typography;

const PatientList = () => {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();

  // Find out if logged in user is Staff or Doctor
  const userRole = localStorage.getItem('role') || 'guest';

  // 1. Fetch Patients from Database
  const fetchPatients = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:8000/patients/');
      setPatients(res.data);
      setFilteredPatients(res.data);
    } catch (error) {
      message.error("Error loading patient database");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPatients(); }, []);

  // 2. Register New Patient
  const handleAddPatient = async (values) => {
    try {
      await axios.post('http://localhost:8000/patients/', values);
      message.success("Patient successfully registered!");
      setIsModalVisible(false);
      form.resetFields();
      fetchPatients(); // Reload table automatically
    } catch (error) {
      message.error("Failed to add patient.");
    }
  };

  // 3. Search Filter
  const handleSearch = (value) => {
    setSearchText(value);
    const filtered = patients.filter(patient => 
      patient.full_name.toLowerCase().includes(value.toLowerCase()) || 
      patient.id.toString().includes(value)
    );
    setFilteredPatients(filtered);
  };

  const columns = [
    { title: 'Patient ID', dataIndex: 'id', key: 'id', width: '10%' },
    { title: 'Full Name', dataIndex: 'full_name', key: 'full_name' },
    { title: 'Age', dataIndex: 'age', key: 'age', width: '10%' },
    { title: 'Medical History', dataIndex: 'medical_history', key: 'medical_history' },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <Card 
        title={<Title level={3}><UserOutlined /> Patient Database</Title>}
        extra={
          <Space>
            <Input 
              placeholder="Search by name or ID..." 
              prefix={<SearchOutlined />} 
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              style={{ width: 250 }}
              allowClear
            />
            {/* ONLY STAFF CAN SEE THIS BUTTON */}
            {userRole === 'staff' && (
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
                Register Patient
              </Button>
            )}
          </Space>
        }
      >
        <Table 
          dataSource={filteredPatients} 
          columns={columns} 
          rowKey="id" 
          loading={loading}
          locale={{ emptyText: 'No patients found. Please register a new patient.' }}
        />
      </Card>

      {/* Registration Form Modal */}
      <Modal 
        title="Register New Patient" 
        open={isModalVisible} 
        onCancel={() => setIsModalVisible(false)} 
        onOk={() => form.submit()}
        okText="Save to Database"
      >
        <Form form={form} layout="vertical" onFinish={handleAddPatient}>
          <Form.Item name="full_name" label="Full Name" rules={[{ required: true, message: 'Please enter patient name' }]}>
            <Input placeholder="e.g., Ali Benmoussa" />
          </Form.Item>
          <Form.Item name="age" label="Age" rules={[{ required: true, message: 'Please enter age' }]}>
            <InputNumber min={1} max={120} style={{ width: '100%' }} placeholder="e.g., 45" />
          </Form.Item>
          <Form.Item name="medical_history" label="Medical History (Optional)">
            <Input.TextArea rows={4} placeholder="e.g., Asthma, No known allergies..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PatientList;