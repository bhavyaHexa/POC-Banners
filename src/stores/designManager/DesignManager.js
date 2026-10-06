import { makeAutoObservable } from "mobx";
import SizeManager from "./SizeManager";
import ToolManager from "./ToolManager";
import LayerManager from "./LayerManager";
import UIManager from "./UIManager";

export default class DesignManager {
  constructor(rootStore) {
    this.rootStore = rootStore;
    
    this.sizeManager = new SizeManager(this);
    this.toolManager = new ToolManager(this);
    this.layerManager = new LayerManager(this);
    this.uiManager = new UIManager(this);
    
    makeAutoObservable(this);
  }
}
