import React, { useEffect, useState } from 'react';
import { Table, Card, Button, Modal, Form, Select, DatePicker, message, Typography, Tag } from 'antd';
import { CalendarOutlined, PlusOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;

const AppointmentScheduler = () => {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const fetchData = async () => {
    try {
      // Fetching all the real data from your backend
      const [apptsRes, patientsRes, docsRes] = await Promise.all([
        axios.get('http://localhost:8000/appointments/'),
        axios.get('http://localhost:8000/patients/'),
        axios.get('http://localhost:8000/doctors/') // The real doctors list!
      ]);
      setAppointments(apptsRes.data);
      setPatients(patientsRes.data);
      setDoctors(docsRes.data);
    } catch (error) {
      message.error("Failed to load data");
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleBook = async (values) => {
    try {
      const payload = {
        patient_id: values.patient_id,
        doctor_name: values.doctor_name,
        date_time: values.date_time.toISOString(),
      };
      await axios.post('http://localhost:8000/appointments/', payload);
      message.success("Appointment booked successfully!");
      setIsModalVisible(false);
      form.resetFields();
      fetchData(); // Refresh the table
    } catch (error) {
      message.error("Error booking appointment");
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Patient ID', dataIndex: 'patient_id', key: 'patient_id' },
    { 
      title: 'Assigned Doctor', 
      dataIndex: 'doctor_name', 
      render: (doc) => <Text strong>Dr. {doc.toUpperCase()}</Text> 
    },
    { title: 'Date & Time', dataIndex: 'date_time', render: (val) => new Date(val).toLocaleString() },
    { 
      title: 'Status', 
      dataIndex: 'status', 
      render: (status) => <Tag color={status === 'Completed' ? 'green' : 'blue'}>{status}</Tag> 
    }
  ];

  return (
    <div style={{ padding: '20px' }}>
      <Card 
        title={<Title level={3}><CalendarOutlined /> Appointment Scheduling</Title>}
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>Book Appointment</Button>}
      >
        <Table dataSource={appointments} columns={columns} rowKey="id" />
      </Card>

      <Modal title="Book New Appointment" open={isModalVisible} onCancel={() => setIsModalVisible(false)} footer={null}>
        <Form form={form} layout="vertical" onFinish={handleBook}>
          <Form.Item name="patient_id" label="Select Patient" rules={[{ required: true }]}>
            <Select placeholder="Choose a patient">
              {patients.map(p => <Select.Option key={p.id} value={p.id}>{p.full_name}</Select.Option>)}
            </Select>
          </Form.Item>
          
          <Form.Item name="doctor_name" label="Assign to Doctor" rules={[{ required: true }]}>
            <Select placeholder="Choose a doctor">
              {doctors.map(d => <Select.Option key={d.id} value={d.username}>Dr. {d.username.toUpperCase()}</Select.Option>)}
            </Select>
          </Form.Item>

          <Form.Item name="date_time" label="Date & Time" rules={[{ required: true }]}>
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>

          <Button type="primary" htmlType="submit" block>Confirm Booking</Button>
        </Form>
      </Modal>
    </div>
  );
};

export default AppointmentScheduler;