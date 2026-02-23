import React, { useEffect, useState } from 'react';
import { Table, Card, Button, Modal, Form, Input, InputNumber, Select, Tag, Row, Col, Statistic, message } from 'antd';
import { AppstoreAddOutlined, AlertOutlined, PlusOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:8000/inventory/');
      setItems(res.data);
    } catch (error) {
      message.error("Failed to load inventory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const onFinish = async (values) => {
    try {
      await axios.post('http://localhost:8000/inventory/', values);
      message.success('Item added to stock');
      setIsModalVisible(false);
      form.resetFields();
      fetchInventory();
    } catch (error) {
      message.error('Failed to add item');
    }
  };

  const columns = [
    {
      title: 'Item Name',
      dataIndex: 'item_name',
      key: 'item_name',
      render: text => <b>{text}</b>
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: cat => <Tag color="blue">{cat.toUpperCase()}</Tag>
    },
    {
      title: 'Quantity in Stock',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (qty) => (
        <span style={{ color: qty < 10 ? 'red' : 'inherit', fontWeight: qty < 10 ? 'bold' : 'normal' }}>
          {qty} {qty < 10 && <AlertOutlined style={{ marginLeft: 5 }} />}
        </span>
      )
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => (
        record.quantity < 10 
          ? <Tag color="error">LOW STOCK</Tag> 
          : <Tag color="success">AVAILABLE</Tag>
      )
    }
  ];

  // Calculate stats for the top cards
  const lowStockCount = items.filter(i => i.quantity < 10).length;

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card bordered={false}>
            <Statistic title="Total Items" value={items.length} prefix={<AppstoreAddOutlined />} />
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false}>
            <Statistic 
              title="Low Stock Alerts" 
              value={lowStockCount} 
              valueStyle={{ color: '#cf1322' }}
              prefix={<AlertOutlined />} 
            />
          </Card>
        </Col>
        <Col span={8} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Button 
            type="primary" 
            size="large" 
            icon={<PlusOutlined />} 
            onClick={() => setIsModalVisible(true)}
          >
            Add New Stock
          </Button>
        </Col>
      </Row>

      <Card title="📦 Hospital Resource Inventory">
        <Table 
          columns={columns} 
          dataSource={items} 
          rowKey="id" 
          loading={loading} 
        />
      </Card>

      <Modal
        title="Add New Resource"
        open={isModalVisible}
        onOk={() => form.submit()}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="item_name" label="Item Name" rules={[{ required: true }]}>
            <Input placeholder="e.g., Paracetamol 1g, Sterile Gauze" />
          </Form.Item>
          <Form.Item name="category" label="Category" rules={[{ required: true }]}>
            <Select placeholder="Select category">
              <Option value="Medication">Medication</Option>
              <Option value="Supplies">Medical Supplies</Option>
              <Option value="Equipment">Equipment</Option>
            </Select>
          </Form.Item>
          <Form.Item name="quantity" label="Initial Quantity" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Inventory;