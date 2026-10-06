import { makeAutoObservable } from "mobx";

export default class LayerManager {
  layers = []; // { id, type, url, opacity, flipH, flipV, rotation, scale, side }
  uploads = [];
  bannerTextFront = "";
  bannerTextBack = "";
  textPropsFront = { opacity: 1, flipH: false, flipV: false, rotation: 0, scale: 1 };
  textPropsBack = { opacity: 1, flipH: false, flipV: false, rotation: 0, scale: 1 };
  backgroundColor = "#ffffff";
  
  constructor(designManager) {
    this.designManager = designManager;
    makeAutoObservable(this);
  }

  get bannerText() {
    return this.designManager.uiManager.activeSide === 'back' ? this.bannerTextBack : this.bannerTextFront;
  }
  
  set bannerText(text) {
    if (this.designManager.uiManager.activeSide === 'back') {
      this.bannerTextBack = text;
    } else {
      this.bannerTextFront = text;
    }
  }

  get textProps() {
    return this.designManager.uiManager.activeSide === 'back' ? this.textPropsBack : this.textPropsFront;
  }

  setBannerText(text) {
    this.bannerText = text;
    if (text && text.trim() !== "") {
      const id = this.designManager.uiManager.activeSide === 'back' ? 'text-back' : 'text';
      this.designManager.uiManager.setSelectedObject({ type: 'text', id });
    }
  }

  setBackgroundColor(color) {
    this.backgroundColor = color;
    const bgLayerIndex = this.layers.findIndex(l => l.isBackground && l.side === this.designManager.uiManager.activeSide);
    if (bgLayerIndex !== -1) {
      this.layers.splice(bgLayerIndex, 1);
    }
  }

  setBackgroundImage(url) {
    const side = this.designManager.uiManager.activeSide || 'front';
    let bgLayer = this.layers.find(l => l.isBackground && l.side === side);
    if (!bgLayer) {
       bgLayer = {
         id: Date.now() + Math.random(),
         type: 'graphic',
         isBackground: true,
         url,
         opacity: 1, flipH: false, flipV: false, rotation: 0, scale: 1,
         side
       };
       this.layers.unshift(bgLayer);
    } else {
       bgLayer.url = url;
    }
    this.backgroundColor = '#ffffff';
    this.designManager.uiManager.setSelectedObject({ type: 'graphic', id: bgLayer.id });
  }

  addGraphic(url) {
    const layer = {
      id: Date.now() + Math.random(),
      type: 'graphic',
      url,
      opacity: 1,
      flipH: false,
      flipV: false,
      rotation: 0,
      scale: 1,
      side: this.designManager.uiManager.activeSide || 'front'
    };
    this.layers.push(layer);
    this.designManager.uiManager.setSelectedObject({ type: layer.type, id: layer.id });
  }

  addUpload(name, url) {
    this.uploads.unshift({
      id: Date.now() + Math.random(),
      name,
      url,
    });
  }

  removeLayer(id) {
    this.layers = this.layers.filter(l => l.id !== id);
  }

  duplicateLayer(id) {
    const orig = this.layers.find(l => l.id === id);
    if (!orig) return;
    const newLayer = {
      ...orig,
      id: Date.now() + Math.random()
    };
    this.layers.push(newLayer);
    this.designManager.uiManager.setSelectedObject({ type: newLayer.type, id: newLayer.id });
  }

  moveLayerForward(id) {
    const idx = this.layers.findIndex(l => l.id === id);
    if (idx !== -1 && idx < this.layers.length - 1) {
      const temp = this.layers[idx];
      this.layers[idx] = this.layers[idx + 1];
      this.layers[idx + 1] = temp;
    }
  }

  moveLayerBackward(id) {
    const idx = this.layers.findIndex(l => l.id === id);
    if (idx !== -1 && idx > 0) {
      const temp = this.layers[idx];
      this.layers[idx] = this.layers[idx - 1];
      this.layers[idx - 1] = temp;
    }
  }

  updateLayer(id, updates) {
    const layer = this.layers.find(l => l.id === id);
    if (layer) {
      Object.assign(layer, updates);
    }
  }

  updateTextProps(updates) {
    const props = this.designManager.uiManager.activeSide === 'back' ? this.textPropsBack : this.textPropsFront;
    Object.assign(props, updates);
  }
}
