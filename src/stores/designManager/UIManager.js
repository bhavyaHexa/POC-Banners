import { makeAutoObservable } from "mobx";

export default class UIManager {
  showGrid = true;
  zoomLevel = 100;
  activeSide = 'front'; // 'front' | 'back'
  isDragging = false; // Used to lock camera during drag interactions
  
  constructor(designManager) {
    this.designManager = designManager;
    makeAutoObservable(this);
  }

  setActiveSide(side) {
    this.activeSide = side;
  }

  setIsDragging(val) {
    this.isDragging = val;
  }
}
