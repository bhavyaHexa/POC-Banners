import { makeAutoObservable } from "mobx";

export default class LightingManager {
  constructor(design3DManager) {
    this.design3DManager = design3DManager;
    makeAutoObservable(this);
  }
}
