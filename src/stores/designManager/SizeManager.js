import { makeAutoObservable } from "mobx";

export default class SizeManager {
  unit = "Feet"; // 'Feet' | 'Inches'
  width = 6;
  height = 3;
  
  // Example dimensions setup
  presets = [
    { label: "3x2 ft", width: 3, height: 2, unit: "Feet" },
    { label: "4x3 ft", width: 4, height: 3, unit: "Feet" },
    { label: "6x3 ft", width: 6, height: 3, unit: "Feet" },
    { label: "8x4 ft", width: 8, height: 4, unit: "Feet" }
  ];

  constructor(designManager) {
    this.designManager = designManager;
    makeAutoObservable(this);
  }

  setUnit(newUnit) {
    // If converting from Feet to Inches
    if (this.unit === "Feet" && newUnit === "Inches") {
      this.width *= 12;
      this.height *= 12;
    }
    // If converting from Inches to Feet
    else if (this.unit === "Inches" && newUnit === "Feet") {
      this.width /= 12;
      this.height /= 12;
    }
    this.unit = newUnit;
  }

  setDimensions(width, height) {
    this.width = width;
    this.height = height;
  }

  // Computed values
  get canvasWidth() {
    return this.unit === "Feet" ? this.width * 12 : this.width; // Returns value in inches internally
  }

  get canvasHeight() {
    return this.unit === "Feet" ? this.height * 12 : this.height; // Returns value in inches internally
  }
  
  get frameWidth() {
    // Canvas width + bleed margins (e.g. 2 inches on each side)
    return this.canvasWidth + 4;
  }

  get frameHeight() {
    // Canvas height + bleed margins (e.g. 2 inches on top/bottom)
    return this.canvasHeight + 4; 
  }
}
