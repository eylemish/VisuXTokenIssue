class ToolManager {
  constructor() {
    this.tools = new Map();
    this.activeTool = null;
    this.logs = [];
  }

  // 注册工具
  registerTool(name, toolInstance) {
    if (!this.tools.has(name)) {
      this.tools.set(name, toolInstance);
    }
  }

  // 获取所有工具（返回数组）
  getAllTools() {
    return Array.from(this.tools.values());
  }

  // 检查工具是否激活
  isToolActive(name) {
    return this.activeTool?.name === name;
  }

  // 激活工具
  activateTool(name) {
    if (this.tools.has(name)) {
      this.activeTool = this.tools.get(name);
      this.activeTool.activate();
      this.logAction(`Activated tool: ${name}`);
    } else {
      console.error(`Tool ${name} not found.`);
    }
  }

  // 停用工具
  deactivateTool() {
    if (this.activeTool) {
      this.activeTool.deactivate();
      this.logAction(`Deactivated tool: ${this.activeTool.name}`);
      this.activeTool = null;
    }
  }

  logAction(message) {
    const timestamp = new Date().toISOString();
    this.logs.push(`[${timestamp}] ${message}`);
  }

  getLogs() {
    return this.logs;
  }

  clearLogs() {
    this.logs = [];
  }
}

export default ToolManager;
