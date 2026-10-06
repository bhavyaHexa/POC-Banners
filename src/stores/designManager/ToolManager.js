import { makeAutoObservable } from "mobx";

export default class ToolManager {
  activeTool = "text"; // 'text', 'graphics', 'uploads', 'qrcode', etc.
  
  constructor(designManager) {
    this.designManager = designManager;
    makeAutoObservable(this);
  }

  setActiveTool(tool) {
    this.activeTool = tool;
  }
}
