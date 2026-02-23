import React, { useEffect, useState } from 'react';
import { Table, Card, Tag, Button, Typography, message, Modal, Input, Space } from 'antd';
import { MedicineBoxOutlined, FilePdfOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;
const { TextArea } = Input;

const DoctorConsultations = () => {
  const [appointments, setAppointments] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [prescription, setPrescription] = useState('');

  // Identify who is logged in!
const currentDoctor = localStorage.getItem('username') || '';

  const fetchAppointments = async () => {
    try {
      const res = await axios.get('http://localhost:8000/appointments/');
      
      console.log("ALL Appointments in DB:", res.data);
      console.log("I am logged in as:", currentDoctor);

      // Bulletproof Filter: Ignores uppercase/lowercase differences
      const myPatients = res.data.filter(appt => 
        String(appt.doctor_name).toLowerCase() === String(currentDoctor).toLowerCase()
      );
      
      console.log("My Filtered Patients:", myPatients);
      setAppointments(myPatients);
    } catch (error) {
      message.error("Failed to load your patient queue");
    }
  };

  useEffect(() => { fetchAppointments(); }, []);

  const openConsultation = (record) => {
    setSelectedAppt(record);
    setPrescription(record.prescription_notes || '');
    setIsModalVisible(true);
  };

  const handleSavePrescription = async () => {
    try {
      await axios.put(`http://localhost:8000/appointments/${selectedAppt.id}/status`, {
        status: 'Completed',
        prescription_notes: prescription
      });
      message.success("Consultation saved and finalized.");
      setIsModalVisible(false);
      fetchAppointments();
    } catch (error) {
      message.error("Error saving consultation");
    }
  };

  const handleDownloadPDF = async (id) => {
    try {
      const response = await axios.get(`http://localhost:8000/generate-prescription/${id}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Ordonnance_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      message.error("Could not generate PDF.");
    }
  };

  const columns = [
    { title: 'Appt ID', dataIndex: 'id', key: 'id' },
    { title: 'Patient ID', dataIndex: 'patient_id', key: 'patient_id' },
    { title: 'Date & Time', dataIndex: 'date_time', render: (val) => new Date(val).toLocaleString() },
    { 
      title: 'Status', 
      dataIndex: 'status', 
      render: (status) => <Tag color={status === 'Completed' ? 'green' : 'orange'}>{status}</Tag> 
    },
    {
      title: 'Action',
      render: (_, record) => (
        <Space>
          <Button type="primary" disabled={record.status === 'Completed'} onClick={() => openConsultation(record)}>
            Consult
          </Button>
          {record.status === 'Completed' && (
            <Button icon={<FilePdfOutlined />} onClick={() => handleDownloadPDF(record.id)}>
              PDF
            </Button>
          )}
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '20px' }}>
      <Card title={<Title level={3}><MedicineBoxOutlined /> Dr. {currentDoctor.toUpperCase()}'s Queue</Title>}>
        <Table dataSource={appointments} columns={columns} rowKey="id" />
      </Card>

      <Modal 
        title={`Consultation: Patient #${selectedAppt?.patient_id}`} 
        open={isModalVisible} 
        onCancel={() => setIsModalVisible(false)}
        onOk={handleSavePrescription}
        okText="Finalize & Sign Ordonnance"
      >
        <div style={{ marginBottom: 16 }}>
          <Text strong>Write Ordonnance / Medical Notes:</Text>
          <TextArea 
            rows={6} 
            value={prescription} 
            onChange={(e) => setPrescription(e.target.value)} 
            placeholder="e.g., Paracetamol 1g - 1 box..."
            style={{ marginTop: 8 }}
          />
        </div>
      </Modal>
    </div>
  );
};

export default DoctorConsultations;