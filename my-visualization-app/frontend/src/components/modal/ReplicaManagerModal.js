import React, { useState, useEffect } from "react";
import { Modal, Select, Button, Input, message } from "antd";

const { Option } = Select;

/**
 * Replica management Modal links can be modified
 * Creates multiple replicas based on parsed data, which can be used for different data processing, such as dimensionality reduction, cleansing, merging, and so on.
 * Each replica can have its own copy, forming replicas of replicas to support complex data processing processes.
 * Each replica has its own log of all the data processing operations it undergoes in order to trace data changes.
 */
const ReplicaManagerModal = ({ visible, onClose, uiController, datasetId }) => {
  const [options, setOptions] = useState([]); // Stores optional parsed data & copies
  const [selectedOption, setSelectedOption] = useState(null); // Selected data (original or copy)
  const [isCreating, setIsCreating] = useState(false); // Control the display of the ‘Create a copy’ popup.

  // Getting parsed data and copy list
  useEffect(() => {
    if (visible && datasetId) {
      fetchOptions();
    }
  }, [visible, datasetId]);


  const fetchOptions = async () => {
    try {
      console.log("Fetching parsed data and replicas for dataset:", datasetId);

      // Getting the original parsed data
      const parsedDataResponse = await uiController.fetchData(`http://127.0.0.1:8000/data/${datasetId}/parsed/`);
      console.log("Parsed Data:", parsedDataResponse);

      // Get all copies
      const replicasResponse = await uiController.fetchData(`http://127.0.0.1:8000/data/${datasetId}/replicas/`);
      console.log("Replicas:", replicasResponse);

      // Combined data (contains original parsed data and copies)
      const formattedOptions = [];

      // Adding raw parsed data
      if (parsedDataResponse) {
        formattedOptions.push({
          id: datasetId, // Raw Data ID
          name: "Original Parsed Data", // name (of a thing)
          type: "parsed_data",
        });
      }

      // Add all copies
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
      console.error("Failed to load data:", error);
      message.error("Failed to load options.");
    }
  };

  // Delete Copy
  const handleDeleteReplica = async () => {
    if (!selectedOption) {
      message.warning("Please select a replica to delete.");
      return;
    }

    // Original parsed data cannot be deleted
    const selectedItem = options.find(opt => opt.id === selectedOption);
    if (selectedItem.type === "parsed_data") {
      message.warning("Original parsed data cannot be deleted.");
      return;
    }

    try {
      console.log(`Deleting replica: ${selectedOption}`);
      await uiController.modifyData(`http://127.0.0.1:8000/data/replica/${selectedOption}/delete/`, "DELETE");
      message.success("Replica deleted successfully.");
      fetchOptions(); // Retrieve copy list
    } catch (error) {
      console.error("Failed to delete replica:", error);
      message.error("Failed to delete replica.");
    }
  };

  return (
    <>
      {/* Copy Management Modal */}
      <Modal
        title="Replication Manager"
        visible={visible}
        onCancel={onClose}
        footer={null}
        width={400}
      >
        {/* Selection of original parsed data or copy */}
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

        {/* button */}
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Button danger onClick={handleDeleteReplica} disabled={!selectedOption}>
            Delete
          </Button>
          <Button type="primary" onClick={() => setIsCreating(true)}>
            Create Replica
          </Button>
        </div>
      </Modal>

      {/* Create Copy Modal */}
      {isCreating && (
        <CreateReplicaModal
          visible={isCreating}
          onClose={() => setIsCreating(false)}
          onConfirm={() => {
            setIsCreating(false);
            fetchOptions(); // Retrieve the list of copies
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
 * Creating a copy Modal
 */
const CreateReplicaModal = ({ visible, onClose, onConfirm, datasetId, selectedOption, uiController }) => {
  const [replicaName, setReplicaName] = useState("");

  // Handling Copy Creation
  const handleCreateReplica = async () => {
    if (!replicaName.trim()) {
      message.warning("Please enter a valid replica name.");
      return;
    }

    try {
      console.log("Creating replica:", {
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
        console.log("Replica created:", data);
        message.success(`Replica "${replicaName}" created.`);
        onConfirm();
      }
    } catch (error) {
      console.error("Failed to create replica:", error);
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
