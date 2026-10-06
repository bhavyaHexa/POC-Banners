import { makeAutoObservable } from "mobx";

export default class LayerManager {
  layers = [];
  bannerText = "3D\nBANNER"; // Default text with a line break
  
  constructor(designManager) {
    this.designManager = designManager;
    makeAutoObservable(this);
  }

  setBannerText(text) {
    this.bannerText = text;
  }
}
