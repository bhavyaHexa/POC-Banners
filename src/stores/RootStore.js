import { makeAutoObservable } from "mobx";
import DesignManager from "./designManager/DesignManager";
import Design3DManager from "./design3DManager/Design3DManager";

class RootStore {
  constructor() {
    this.designManager = new DesignManager(this);
    this.design3DManager = new Design3DManager(this);
    
    makeAutoObservable(this);
  }
}

const rootStore = new RootStore();
export default rootStore;
