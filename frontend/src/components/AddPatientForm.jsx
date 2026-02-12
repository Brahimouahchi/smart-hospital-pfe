import React, { useState } from 'react';
import { Form, Input, InputNumber, Button, Card, message } from 'antd';
import axios from 'axios';

const AddPatientForm = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  // This function runs when the Receptionist clicks "Submit"
  const onFinish = async (values) => {
    setLoading(true);
    try {
      // 1. Send data to Python Backend
      await axios.post('http://localhost:8000/patients/', values);
      
      // 2. Show success message
      message.success('Patient created successfully!');
      
      // 3. Clear the form
      form.resetFields();
    } catch (error) {
      message.error('Failed to create patient. Is the backend running?');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="🏥 New Patient Registration" style={{ maxWidth: 600, margin: '20px auto' }}>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        autoComplete="off"
      >
        {/* Field 1: Name */}
        <Form.Item
          label="Full Name"
          name="full_name"
          rules={[{ required: true, message: 'Please input the patient name!' }]}
        >
          <Input placeholder="e.g. Karim Benzema" />
        </Form.Item>

        {/* Field 2: Age */}
        <Form.Item
          label="Age"
          name="age"
          rules={[{ required: true, message: 'Please input the age!' }]}
        >
          <InputNumber min={0} max={120} style={{ width: '100%' }} />
        </Form.Item>

        {/* Field 3: History */}
        <Form.Item
          label="Medical History (Conditions)"
          name="medical_history"
        >
          <Input.TextArea rows={4} placeholder="e.g. Diabetes, Allergy to Penicillin" />
        </Form.Item>

        {/* Submit Button */}
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Register Patient
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default AddPatientForm;