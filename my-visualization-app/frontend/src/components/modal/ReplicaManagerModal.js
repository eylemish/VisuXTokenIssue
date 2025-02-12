import React, { useState, useEffect } from "react";
import { Modal, Select, Button, Input, message } from "antd";

const { Option } = Select;


// Get CSRF Token（fit Django）
function getCSRFToken() {
  let cookieValue = null;
  if (document.cookie) {
    document.cookie.split(";").forEach((cookie) => {
      const [name, value] = cookie.trim().split("=");
      if (name === "csrftoken") {
        cookieValue = decodeURIComponent(value);
      }
    });
  }
  return cookieValue;
}

/**
 * Replica management Modal links can be modified
 * Creates multiple replicas based on parsed data, which can be used for different data processing, such as dimensionality reduction, cleansing, merging, and so on.
 * Each replica can have its own copy, forming replicas of replicas to support complex data processing processes.
 * Each replica has its own log of all the data processing operations it undergoes in order to trace data changes.
 */
const ReplicaManagerModal = ({ visible, onClose, uiController}) => {
  const [options, setOptions] = useState([]); // Stores optional parsed data & copies
  //const [selectedOption, setSelectedOption] = useState(null); // Selected data (original or copy)
  const [isCreating, setIsCreating] = useState(false); // Control the display of the ‘Create a copy’ popup.
  const [datasetId, setDatasetId] = useState(null);

  const datasetManager = uiController.getDatasetManager();
  const availableDatasets = datasetManager.getAllDatasetsId();


  useEffect(() => {
    if (visible) {
      setOptions(availableDatasets);
      setDatasetId(availableDatasets.length > 0 ? availableDatasets[0] : null);
    }
  }, [visible, availableDatasets]);



  // Delete Copy (add later)



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
              value={datasetId}
              onChange={setDatasetId}
              style={{width: "100%", marginBottom: "20px"}}
          >
            {options.length > 0 ? (
                options.map((id) => (
                    <Option key={id} value={id}>
                      Dataset {id}
                    </Option>
                ))
            ) : (
                <Option value={null} disabled>
                  No options available
                </Option>
            )}
          </Select>

          {/* button */}
          <div style={{display: "flex", justifyContent: "space-between"}}>
            <Button type="primary" onClick={() => setIsCreating(true)} disabled={!datasetId}>
              Create Replica
            </Button>
          </div>
        </Modal>

        {/* Create Copy Modal */}
      {isCreating && (
        <CreateReplicaModal
          visible={isCreating}
          onClose={() => setIsCreating(false)}
          onConfirm={(newReplicaId) => {
            setIsCreating(false);
            message.success("Replica created successfully!");
            setOptions((prevOptions) => [...prevOptions, newReplicaId]); // update dataset list
          }}
          datasetId={datasetId}
          uiController={uiController}
            />
        )}
      </>
  );
};

/**
 * Creating a copy Modal
 */
const CreateReplicaModal = ({visible, onClose, onConfirm, datasetId, uiController}) => {
  const [replicaName, setReplicaName] = useState("");

  // Handling Copy Creation
  const handleCreateReplica = async () => {
    if (!replicaName.trim()) {
      message.warning("Please enter a valid replica name.");
      return;
    }

    try {
      console.log("Creating replica:", {
        dataset_id: datasetId,
        new_name: replicaName,
      });

      const requestBody = {
        dataset_id: datasetId,
        new_name: replicaName,
      };


      const response = await fetch(`http://127.0.0.1:8000/api/replica/create/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCSRFToken(),
        },
        credentials: "include",
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create replica");
      }

      console.log("Replica created:", data);
      onConfirm(data.new_id); // new id
      onClose();
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
