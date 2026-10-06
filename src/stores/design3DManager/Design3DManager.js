import { makeAutoObservable } from "mobx";
import CameraManager from "./CameraManager";
import EnvManager from "./EnvManager";
import ModelManager from "./ModelManager";
import LightingManager from "./LightingManager";
import Helper3DManager from "./Helper3DManager";

export default class Design3DManager {
  constructor(rootStore) {
    this.rootStore = rootStore;
    
    this.cameraManager = new CameraManager(this);
    this.envManager = new EnvManager(this);
    this.modelManager = new ModelManager(this);
    this.lightingManager = new LightingManager(this);
    this.helper3DManager = new Helper3DManager(this);
    
    makeAutoObservable(this);
  }
}
