import { makeAutoObservable } from "mobx";

export default class Helper3DManager {
  constructor(design3DManager) {
    this.design3DManager = design3DManager;
    makeAutoObservable(this);
  }
}
