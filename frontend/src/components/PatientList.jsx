import React, { useEffect, useState } from 'react';
import { Table, Tag, Card, message, Button, Modal, Progress, Divider } from 'antd';
import { RobotOutlined } from '@ant-design/icons';
import axios from 'axios';

const PatientList = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State (The popup window)
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await axios.get('http://localhost:8000/patients/');
      setPatients(response.data);
      setLoading(false);
    } catch (error) {
      message.error('Could not fetch patients');
      setLoading(false);
    }
  };

  // --- THE AI FUNCTION ---
  const checkRisk = async (patient) => {
    setAnalyzing(true);
    setIsModalVisible(true);
    setPrediction(null); // Clear old result

    try {
      // 1. Call the AI Engine (Port 8001)
      const response = await axios.post('http://localhost:8001/predict_heart_risk', {
        age: patient.age,
        medical_history: patient.medical_history
      });

      // 2. Wait 1 second (to look cool, like it's thinking)
      setTimeout(() => {
        setPrediction(response.data);
        setAnalyzing(false);
      }, 1000);

    } catch (error) {
      message.error("AI Engine is offline!");
      setAnalyzing(false);
    }
  };

  const columns = [
    { title: 'Full Name', dataIndex: 'full_name', key: 'full_name', render: text => <b>{text}</b> },
    { title: 'Age', dataIndex: 'age', key: 'age' },
    { title: 'History', dataIndex: 'medical_history', key: 'medical_history' },
    {
      title: 'AI Analysis',
      key: 'action',
      render: (_, record) => (
        <Button 
          type="dashed" 
          icon={<RobotOutlined />} 
          onClick={() => checkRisk(record)}
          style={{ color: '#1890ff', borderColor: '#1890ff' }}
        >
          Check Risk
        </Button>
      ),
    },
  ];

  return (
    <Card title="👨‍⚕️ Patient Database" style={{ margin: 20 }}>
      <Table dataSource={patients} columns={columns} rowKey="id" loading={loading} />

      {/* --- AI RESULT POPUP --- */}
      <Modal 
        title="🤖 AI Health Analysis" 
        open={isModalVisible} 
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        {analyzing ? (
          <div style={{ textAlign: 'center', padding: 20 }}>
            <p>Analyzing medical records...</p>
            <Progress percent={99} status="active" showInfo={false} />
          </div>
        ) : prediction ? (
          <div style={{ textAlign: 'center' }}>
            {/* 1. The Score */}
            <Progress 
              type="circle" 
              percent={prediction.risk_score} 
              format={percent => `${percent}% Risk`} 
              status={prediction.risk_score > 50 ? "exception" : "normal"}
              width={120}
            />
            
            {/* 2. The Status */}
            <h2 style={{ marginTop: 20, color: prediction.risk_score > 50 ? 'red' : 'green' }}>
              {prediction.status}
            </h2>

            <Divider />
            
            {/* 3. The Reasons */}
            <div style={{ textAlign: 'left' }}>
              <b>Identified Risk Factors:</b>
              <ul>
                {prediction.analysis.length > 0 ? (
                   prediction.analysis.map((reason, index) => <li key={index}>{reason}</li>)
                ) : (
                   <li>No immediate risks found.</li>
                )}
              </ul>
            </div>
          </div>
        ) : null}
      </Modal>
    </Card>
  );
};

export default PatientList;