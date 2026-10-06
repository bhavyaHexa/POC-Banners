import { makeAutoObservable } from "mobx";

export default class ToolManager {
  activeTool = "size"; // 'size', 'text', 'background', 'graphics', 'uploads', 'qrcode'
  
  constructor(designManager) {
    this.designManager = designManager;
    makeAutoObservable(this);
  }

  setActiveTool(tool) {
    this.activeTool = tool;
  }
}
