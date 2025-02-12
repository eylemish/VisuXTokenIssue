import React, { useState } from "react";
import { Modal, Form, Button, Select } from "antd";
import GraphManager from "../graph/GraphManager";

const { Option } = Select;

const EditGraphModal = ({ visible, onCancel, onSave, graphId, graphDetails }) => {
  const [form] = Form.useForm();
  const [graphType, setGraphType] = useState(graphDetails.graphType || "scatter");
  const [color, setColor] = useState(graphDetails.style?.colorScheme || "blue");

  const handleSave = () => {
    form.validateFields().then((values) => {
      // Grafiğin rengini güncelle
      GraphManager.changeGraphColor(graphId, values.color);

      // Üst bileşene bildir
      onSave({ ...graphDetails, type: values.graphType });
      onCancel(); // Modalı kapat
    });
  };

  return (
    <Modal
      visible={visible}
      title="Edit Graph"
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button key="save" type="primary" onClick={handleSave}>
          Save
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical" initialValues={{ graphType, color }}>
        <Form.Item name="graphType" label="Graph Type">
          <Select value={graphType} onChange={setGraphType}>
            <Option value="scatter">Scatter</Option>
            <Option value="pie">Pie</Option>
            <Option value="scatter3d">3D Scatter</Option>
          </Select>
        </Form.Item>

        <Form.Item name="color" label="Graph Color">
          <Select value={color} onChange={setColor}>
            <Option value="blue">Blue</Option>
            <Option value="red">Red</Option>
            <Option value="green">Green</Option>
            <Option value="orange">Orange</Option>
            <Option value="purple">Purple</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditGraphModal;
