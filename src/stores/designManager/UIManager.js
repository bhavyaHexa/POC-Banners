import { makeAutoObservable } from "mobx";

export default class UIManager {
  showGrid = true;
  zoomLevel = 100;
  activeSide = 'front'; // 'front' | 'back'
  isDragging = false; // Used to lock camera during drag interactions
  selectedObject = null; // { type: 'graphic' | 'text', id }
  clipboard = null;
  backEnabled = false;
  
  constructor(designManager) {
    this.designManager = designManager;
    makeAutoObservable(this);
  }

  setActiveSide(side) {
    if (side === 'back' && !this.backEnabled) return;
    this.activeSide = side;
  }

  enableBackSide() {
    this.backEnabled = true;
    this.activeSide = 'back';
  }

  setZoomLevel(level) {
    this.zoomLevel = Math.min(150, Math.max(50, Number(level)));
  }

  setIsDragging(val) {
    this.isDragging = val;
  }

  setSelectedObject(object) {
    this.selectedObject = object;
  }

  clearSelectedObject() {
    this.selectedObject = null;
  }

  cutSelected() {
    if (!this.selectedObject) return;
    const { layerManager } = this.designManager;
    const layer = layerManager.layers.find(l => l.id === this.selectedObject.id);
    if (layer) {
      this.clipboard = { type: layer.type, data: { ...layer } };
      layerManager.removeLayer(this.selectedObject.id);
    }
    this.clearSelectedObject();
  }

  copySelected() {
    if (!this.selectedObject) return;
    const { layerManager } = this.designManager;
    const layer = layerManager.layers.find(l => l.id === this.selectedObject.id);
    if (layer) {
      this.clipboard = { type: layer.type, data: { ...layer } };
    }
  }

  pasteClipboard() {
    if (!this.clipboard) return;
    const { layerManager } = this.designManager;
    const newLayer = {
      ...this.clipboard.data,
      id: Date.now() + Math.random(),
      side: this.activeSide
    };
    layerManager.layers.push(newLayer);
    this.setSelectedObject({ type: newLayer.type, id: newLayer.id });
  }

  deleteSelected() {
    if (!this.selectedObject) return;
    this.designManager.layerManager.removeLayer(this.selectedObject.id);
    this.clearSelectedObject();
  }

  positionSelected(direction = 'forward') {
    if (!this.selectedObject) return;
    const { layerManager } = this.designManager;
    if (direction === 'forward') {
      layerManager.moveLayerForward(this.selectedObject.id);
    } else {
      layerManager.moveLayerBackward(this.selectedObject.id);
    }
  }

  opacitySelected() {
    if (!this.selectedObject) return;
    const { layerManager } = this.designManager;
    const layer = layerManager.layers.find(l => l.id === this.selectedObject.id);
    if (layer) {
      const current = layer.opacity !== undefined ? layer.opacity : 1;
      const next = current <= 0.25 ? 1 : current - 0.25;
      layerManager.updateLayer(this.selectedObject.id, { opacity: next });
    }
  }

  rotateSelected() {
    if (!this.selectedObject) return;
    const { layerManager } = this.designManager;
    const step = Math.PI / 4; // 45 degrees
    const layer = layerManager.layers.find(l => l.id === this.selectedObject.id);
    if (layer) {
      layerManager.updateLayer(this.selectedObject.id, { rotation: (layer.rotation || 0) + step });
    }
  }

  flipHSelected() {
    if (!this.selectedObject) return;
    const { layerManager } = this.designManager;
    const layer = layerManager.layers.find(l => l.id === this.selectedObject.id);
    if (layer) {
      layerManager.updateLayer(this.selectedObject.id, { flipH: !layer.flipH });
    }
  }

  flipVSelected() {
    if (!this.selectedObject) return;
    const { layerManager } = this.designManager;
    const layer = layerManager.layers.find(l => l.id === this.selectedObject.id);
    if (layer) {
      layerManager.updateLayer(this.selectedObject.id, { flipV: !layer.flipV });
    }
  }
}
