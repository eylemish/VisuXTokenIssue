import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/";

class Action {
  constructor(
    name,
    type,
    data,
    userId,
    executeFunction = null,
    undoFunction = null
  ) {
    this.name = name; // 例如 "UPLOAD_FILE"
    this.type = type; // "user" or "system"
    this.data = data; // { fileName, file }
    this.userId = userId; // 记录是谁执行的
    this.timestamp = new Date();
    this.status = "pending"; // "pending", "success", "failed"
    this.executeFunction = executeFunction; // UI 操作
    this.undoFunction = undoFunction; // UI 操作撤销
  }

  // 执行动作（本地操作）
  execute() {
    if (this.executeFunction) {
        try {
            this.executeFunction(this.data);
            this.status = "success";
        } catch (error) {
            this.status = "failed";
            console.error(`Action Failed: ${this.name}`, error);
        }
    } else {
        console.warn(`No execute function for action: ${this.name}`);
    }
}


  // 撤销动作
  undo() {
    if (this.undoFunction) {
      try {
        this.undoFunction(this.data);
        console.log(`Undo action: ${this.name}`);
      } catch (error) {
        console.error(`Undo Failed: ${this.name}`, error);
      }
    } else {
      console.warn(`No undo function for action: ${this.name}`);
    }
  }

  // 是否是用户触发的
  isUserAction() {
    return this.type === "user";
  }

  // 更新状态
  updateStatus(newStatus) {
    this.status = newStatus;
  }

  // 转换为 JSON
  toJSON() {
    return JSON.stringify({
      name: this.name,
      type: this.type,
      data: this.data,
      userId: this.userId,
      timestamp: this.timestamp,
      status: this.status,
    });
  }

  // 获取操作详情（日志用）
  getActionDetails() {
    return `Action: ${this.name}, Type: ${this.type}, User: ${this.userId}, Time: ${this.timestamp}, Status: ${this.status}`;
  }

  // 异步执行（与后端交互）
  async handleUserAction(actionType, parameters = {}) {
    try {
      const response = await axios.post(`${API_URL}handle_user_action/`, {
        action: actionType,
        parameters: parameters,
      });

      // 将状态设置为成功
      this.status = "success";
      console.log(`Action succeeded: ${this.name}`);
      return response.data;
    } catch (error) {
      this.status = "failed";
      console.error(`Action failed: ${this.name}`, error.response || error);
      throw error.response?.data || { error: "An unknown error occurred" };
    }
  }
}

export default Action;
