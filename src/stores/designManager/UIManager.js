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
    if (this.selectedObject.type === 'graphic') {
      const layer = layerManager.layers.find(l => l.id === this.selectedObject.id);
      if (layer) {
        this.clipboard = { type: 'graphic', data: { ...layer } };
        layerManager.removeLayer(this.selectedObject.id);
      }
    } else if (this.selectedObject.type === 'text') {
      this.clipboard = { type: 'text', text: layerManager.bannerText, props: { ...layerManager.textProps } };
      layerManager.setBannerText('');
    }
    this.clearSelectedObject();
  }

  copySelected() {
    if (!this.selectedObject) return;
    const { layerManager } = this.designManager;
    if (this.selectedObject.type === 'graphic') {
      const layer = layerManager.layers.find(l => l.id === this.selectedObject.id);
      if (layer) {
        this.clipboard = { type: 'graphic', data: { ...layer } };
      }
    } else if (this.selectedObject.type === 'text') {
      this.clipboard = { type: 'text', text: layerManager.bannerText, props: { ...layerManager.textProps } };
    }
  }

  pasteClipboard() {
    if (!this.clipboard) return;
    const { layerManager } = this.designManager;
    if (this.clipboard.type === 'graphic') {
      const newLayer = {
        ...this.clipboard.data,
        id: Date.now() + Math.random(),
        side: this.activeSide
      };
      layerManager.layers.push(newLayer);
      this.setSelectedObject({ type: 'graphic', id: newLayer.id });
    } else if (this.clipboard.type === 'text') {
      layerManager.setBannerText(this.clipboard.text);
      layerManager.updateTextProps({ ...this.clipboard.props });
    }
  }

  deleteSelected() {
    if (!this.selectedObject) return;
    const { layerManager } = this.designManager;
    if (this.selectedObject.type === 'graphic') {
      layerManager.removeLayer(this.selectedObject.id);
    } else if (this.selectedObject.type === 'text') {
      layerManager.setBannerText('');
    }
    this.clearSelectedObject();
  }

  positionSelected(direction = 'forward') {
    if (!this.selectedObject) return;
    const { layerManager } = this.designManager;
    if (this.selectedObject.type === 'graphic') {
      if (direction === 'forward') {
        layerManager.moveLayerForward(this.selectedObject.id);
      } else {
        layerManager.moveLayerBackward(this.selectedObject.id);
      }
    }
  }

  opacitySelected() {
    if (!this.selectedObject) return;
    const { layerManager } = this.designManager;
    if (this.selectedObject.type === 'graphic') {
      const layer = layerManager.layers.find(l => l.id === this.selectedObject.id);
      if (layer) {
        const current = layer.opacity !== undefined ? layer.opacity : 1;
        const next = current <= 0.25 ? 1 : current - 0.25;
        layerManager.updateLayer(this.selectedObject.id, { opacity: next });
      }
    } else if (this.selectedObject.type === 'text') {
      const current = layerManager.textProps.opacity !== undefined ? layerManager.textProps.opacity : 1;
      const next = current <= 0.25 ? 1 : current - 0.25;
      layerManager.updateTextProps({ opacity: next });
    }
  }

  rotateSelected() {
    if (!this.selectedObject) return;
    const { layerManager } = this.designManager;
    const step = Math.PI / 4; // 45 degrees
    if (this.selectedObject.type === 'graphic') {
      const layer = layerManager.layers.find(l => l.id === this.selectedObject.id);
      if (layer) {
        layerManager.updateLayer(this.selectedObject.id, { rotation: (layer.rotation || 0) + step });
      }
    } else if (this.selectedObject.type === 'text') {
      layerManager.updateTextProps({ rotation: (layerManager.textProps.rotation || 0) + step });
    }
  }

  flipHSelected() {
    if (!this.selectedObject) return;
    const { layerManager } = this.designManager;
    if (this.selectedObject.type === 'graphic') {
      const layer = layerManager.layers.find(l => l.id === this.selectedObject.id);
      if (layer) {
        layerManager.updateLayer(this.selectedObject.id, { flipH: !layer.flipH });
      }
    } else if (this.selectedObject.type === 'text') {
      layerManager.updateTextProps({ flipH: !layerManager.textProps.flipH });
    }
  }

  flipVSelected() {
    if (!this.selectedObject) return;
    const { layerManager } = this.designManager;
    if (this.selectedObject.type === 'graphic') {
      const layer = layerManager.layers.find(l => l.id === this.selectedObject.id);
      if (layer) {
        layerManager.updateLayer(this.selectedObject.id, { flipV: !layer.flipV });
      }
    } else if (this.selectedObject.type === 'text') {
      layerManager.updateTextProps({ flipV: !layerManager.textProps.flipV });
    }
  }
}
