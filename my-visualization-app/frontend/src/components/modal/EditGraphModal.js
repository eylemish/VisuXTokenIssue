import React, { useState } from "react";
import { Modal, Form, Input, Button, Select, Row, Col, Tag } from "antd";
import GraphManager from "../graph/GraphManager";

const { Option } = Select;

const EditGraphModal = ({ visible, onCancel, onSave, graphId, graphDetails }) => {
  const [form] = Form.useForm();
  const [selectedFeatures, setSelectedFeatures] = useState(graphDetails.selectedFeatures || []);
  const [graphType, setGraphType] = useState(graphDetails.graphType || "scatter");

  const handleSave = () => {
    form.validateFields().then((values) => {
      // You would save the updated graph details here
      const updatedGraph = {
        ...graphDetails,
        selectedFeatures: values.selectedFeatures,
        type: values.graphType,
      };

      GraphManager.updateGraph(graphId, updatedGraph); // Assuming GraphManager has a method to update a graph

      onSave(updatedGraph); // Notify parent of the saved graph details
      onCancel(); // Close the modal
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
      <Form form={form} layout="vertical" initialValues={graphDetails}>
        <Form.Item name="graphType" label="Graph Type">
          <Select value={graphType} onChange={setGraphType}>
            <Option value="scatter">Scatter</Option>
            <Option value="pie">Pie</Option>
            <Option value="scatter3d">3D Scatter</Option>
            {/* Add other types if necessary */}
          </Select>
        </Form.Item>

        <Form.Item name="selectedFeatures" label="Selected Features">
          <Select
            mode="multiple"
            value={selectedFeatures}
            onChange={(value) => setSelectedFeatures(value)}
            placeholder="Select features"
          >
            {/* Replace these with actual feature names from your dataset */}
            <Option value="feature1">Feature 1</Option>
            <Option value="feature2">Feature 2</Option>
            <Option value="feature3">Feature 3</Option>
          </Select>
        </Form.Item>

        <Row gutter={8}>
          <Col span={24}>
            <strong>Current Features:</strong>
            {selectedFeatures.length > 0 ? (
              selectedFeatures.map((feature, index) => (
                <Tag color="blue" key={index}>{feature}</Tag>
              ))
            ) : (
              <Tag color="red">No features selected</Tag>
            )}
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default EditGraphModal;
