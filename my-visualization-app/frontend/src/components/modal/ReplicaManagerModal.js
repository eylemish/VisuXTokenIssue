import React, { useState, useEffect } from "react";
import { Modal, Select, Button, Input, message } from "antd";

const { Option } = Select;

/**
 * 副本管理 Modal 链接可修改
 * 基于解析数据创建多个副本，这些副本可用于不同的数据处理，比如降维、清理、合并等。
 * 每个副本可以有自己的副本，形成 副本的副本，支持复杂的数据处理流程。
 * 每个副本有自己的日志，记录它经历的所有数据处理操作，以便追溯数据变化。
 */
const ReplicaManagerModal = ({ visible, onClose, uiController, datasetId }) => {
  const [options, setOptions] = useState([]); // 存储可选择的解析数据 & 副本
  const [selectedOption, setSelectedOption] = useState(null); // 选中的数据（原数据或副本）
  const [isCreating, setIsCreating] = useState(false); // 控制 "创建副本" 弹窗显示

  // ✅ 获取解析数据和副本列表
  useEffect(() => {
    if (visible && datasetId) {
      fetchOptions();
    }
  }, [visible, datasetId]);


  const fetchOptions = async () => {
    try {
      console.log("📌 Fetching parsed data and replicas for dataset:", datasetId);

      // 获取原解析数据
      const parsedDataResponse = await uiController.fetchData(`http://127.0.0.1:8000/data/${datasetId}/parsed/`);
      console.log("✅ Parsed Data:", parsedDataResponse);

      // 获取所有副本
      const replicasResponse = await uiController.fetchData(`http://127.0.0.1:8000/data/${datasetId}/replicas/`);
      console.log("✅ Replicas:", replicasResponse);

      // 组合数据（包含原始解析数据和副本）
      const formattedOptions = [];

      // 添加原解析数据
      if (parsedDataResponse) {
        formattedOptions.push({
          id: datasetId, // 原始数据 ID
          name: "Original Parsed Data", // 名称
          type: "parsed_data",
        });
      }

      // 添加所有副本
      if (replicasResponse.replicas) {
        replicasResponse.replicas.forEach(replica => {
          formattedOptions.push({
            id: replica.id,
            name: replica.name,
            type: "replica",
          });
        });
      }

      setOptions(formattedOptions);
      setSelectedOption(formattedOptions.length > 0 ? formattedOptions[0].id : null);
    } catch (error) {
      console.error("❌ Failed to load data:", error);
      message.error("Failed to load options.");
    }
  };

  // ✅ 删除副本
  const handleDeleteReplica = async () => {
    if (!selectedOption) {
      message.warning("Please select a replica to delete.");
      return;
    }

    // 不能删除原解析数据
    const selectedItem = options.find(opt => opt.id === selectedOption);
    if (selectedItem.type === "parsed_data") {
      message.warning("Original parsed data cannot be deleted.");
      return;
    }

    try {
      console.log(`📌 Deleting replica: ${selectedOption}`);
      await uiController.modifyData(`http://127.0.0.1:8000/data/replica/${selectedOption}/delete/`, "DELETE");
      message.success("Replica deleted successfully.");
      fetchOptions(); // 重新获取副本列表
    } catch (error) {
      console.error("❌ Failed to delete replica:", error);
      message.error("Failed to delete replica.");
    }
  };

  return (
    <>
      {/* 副本管理 Modal */}
      <Modal
        title="Replica Manager"
        visible={visible}
        onCancel={onClose}
        footer={null}
        width={400}
      >
        {/* 选择原解析数据或副本 */}
        <Select
          value={selectedOption}
          onChange={setSelectedOption}
          style={{ width: "100%", marginBottom: "20px" }}
        >
          {options.length > 0 ? (
            options.map((item) => (
              <Option key={item.id} value={item.id}>
                {item.name}
              </Option>
            ))
          ) : (
            <Option value={null} disabled>
              No options available
            </Option>
          )}
        </Select>

        {/* 按钮 */}
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Button danger onClick={handleDeleteReplica} disabled={!selectedOption}>
            Delete
          </Button>
          <Button type="primary" onClick={() => setIsCreating(true)}>
            Create Replica
          </Button>
        </div>
      </Modal>

      {/* 创建副本 Modal */}
      {isCreating && (
        <CreateReplicaModal
          visible={isCreating}
          onClose={() => setIsCreating(false)}
          onConfirm={() => {
            setIsCreating(false);
            fetchOptions(); // 重新获取副本列表
          }}
          datasetId={datasetId}
          selectedOption={selectedOption}
          uiController={uiController}
        />
      )}
    </>
  );
};

/**
 * 创建副本 Modal
 */
const CreateReplicaModal = ({ visible, onClose, onConfirm, datasetId, selectedOption, uiController }) => {
  const [replicaName, setReplicaName] = useState("");

  // ✅ 处理副本创建
  const handleCreateReplica = async () => {
    if (!replicaName.trim()) {
      message.warning("Please enter a valid replica name.");
      return;
    }

    try {
      console.log("📌 Creating replica:", {
        datasetId,
        baseData: selectedOption,
        name: replicaName,
      });

      const requestBody = {
        dataset_id: datasetId,
        new_name: replicaName,
        base_data: selectedOption, // 可以是 `parsed_data` 或 `replica`
      };

      const data = await uiController.modifyData(
        `http://127.0.0.1:8000/data/${datasetId}/replica/create/`,
        "POST",
        requestBody
      );

      if (data) {
        console.log("✅ Replica created:", data);
        message.success(`Replica "${replicaName}" created.`);
        onConfirm();
      }
    } catch (error) {
      console.error("❌ Failed to create replica:", error);
      message.error("Failed to create replica.");
    }
  };

  return (
    <Modal
      title="Create New Replica"
      visible={visible}
      onCancel={onClose}
      footer={null}
      width={400}
    >
      <Input
        placeholder="Enter new replica name"
        value={replicaName}
        onChange={(e) => setReplicaName(e.target.value)}
        style={{ marginBottom: "20px" }}
      />
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button type="primary" onClick={handleCreateReplica}>
          Confirm
        </Button>
      </div>
    </Modal>
  );
};

export default ReplicaManagerModal;
