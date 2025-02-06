import React, { useState } from 'react';
import { Select, Button, Card } from 'antd';

const { Option } = Select;

const FeatureSelectionMenu = ({ features, onFeatureSelect }) => {
  const [selectedFeature, setSelectedFeature] = useState(null);

  const handleSelect = (value) => {
    setSelectedFeature(value);
  };

  const handleApply = () => {
    if (selectedFeature) {
      onFeatureSelect(selectedFeature);
    }
  };

  return (
    <Card title="Feature Selection">
      <Select
        placeholder="Select a feature"
        style={{ width: '100%', marginBottom: '10px' }}
        onChange={handleSelect}
      >
        {features.map((feature) => (
          <Option key={feature} value={feature}>{feature}</Option>
        ))}
      </Select>
      <Button type="primary" onClick={handleApply} disabled={!selectedFeature}>
        Apply
      </Button>
    </Card>
  );
};

export default FeatureSelectionMenu;
