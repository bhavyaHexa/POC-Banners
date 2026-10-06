import { makeAutoObservable } from "mobx";

export default class EnvManager {
  constructor(design3DManager) {
    this.design3DManager = design3DManager;
    makeAutoObservable(this);
  }
}
