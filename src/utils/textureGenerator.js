import * as THREE from 'three';

export class TextTextureGenerator {
  constructor(text) {
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    const fontSize = 300; 
    tempCtx.font = `900 ${fontSize}px system-ui, -apple-system, sans-serif`;
    
    const lines = text.split('\n');
    let maxWidth = 0;
    
    lines.forEach(line => {
      const metrics = tempCtx.measureText(line);
      if (metrics.width > maxWidth) maxWidth = metrics.width;
    });

    const lineHeight = fontSize * 1.1;
    const totalHeight = lines.length * lineHeight;

    const padding = fontSize * 0.4; // 20% padding around
    this.resX = Math.ceil(maxWidth + padding * 2);
    this.resY = Math.ceil(totalHeight + padding * 2);
    this.aspect = this.resX / this.resY;

    this.canvas = document.createElement('canvas');
    this.canvas.width = this.resX;
    this.canvas.height = this.resY;
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
    
    this.fontSize = fontSize;
    this.lines = lines;
  }

  _drawTextOnly(fillStyle, blur = 0, stroke = false) {
    if (blur > 0) {
      this.ctx.filter = `blur(${blur}px)`;
    } else {
      this.ctx.filter = 'none';
    }

    this.ctx.fillStyle = fillStyle;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.font = `900 ${this.fontSize}px system-ui, -apple-system, sans-serif`;

    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';

    const lineHeight = this.fontSize * 1.1;
    const startY = (this.resY / 2) - ((this.lines.length - 1) * lineHeight) / 2;

    this.lines.forEach((line, index) => {
      this.ctx.fillText(line, this.resX / 2, startY + (index * lineHeight));
      if (stroke) {
        this.ctx.lineWidth = this.fontSize * 0.02;
        this.ctx.strokeStyle = fillStyle;
        this.ctx.strokeText(line, this.resX / 2, startY + (index * lineHeight));
      }
    });
  }

  _createTexture() {
    const tex = new THREE.CanvasTexture(this.canvas);
    tex.anisotropy = 16;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    return tex;
  }

  getDiffuse() {
    this.ctx.clearRect(0, 0, this.resX, this.resY);
    this._drawTextOnly('#1f2937');
    const tex = this._createTexture();
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  getNormal() {
    this.ctx.filter = 'none';
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.resX, this.resY);
    
    this._drawTextOnly('#ffffff', 4, true); 
    this._drawTextOnly('#ffffff', 0, false); 

    const imageData = this.ctx.getImageData(0, 0, this.resX, this.resY);
    const data = imageData.data;
    const normalData = new Uint8ClampedArray(data.length);
    const w = this.resX;
    const h = this.resY;
    const strength = 8.0; 

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        
        const xL = Math.max(0, x - 1);
        const xR = Math.min(w - 1, x + 1);
        const yU = Math.max(0, y - 1);
        const yD = Math.min(h - 1, y + 1);

        const dX = (data[(y * w + xL) * 4] - data[(y * w + xR) * 4]) / 255.0;
        const dY = (data[(yU * w + x) * 4] - data[(yD * w + x) * 4]) / 255.0;

        const nX = (dX * strength) * 0.5 + 0.5;
        const nY = (dY * strength) * 0.5 + 0.5;
        const nZ = 1.0;

        const len = Math.sqrt(nX*nX + nY*nY + nZ*nZ);
        
        normalData[i] = (nX / len) * 255;
        normalData[i+1] = (nY / len) * 255;
        normalData[i+2] = (nZ / len) * 255;
        normalData[i+3] = 255;
      }
    }

    this.ctx.putImageData(new ImageData(normalData, w, h), 0, 0);
    return this._createTexture();
  }

  getAO() {
    this.ctx.filter = 'none';
    this.ctx.fillStyle = '#ffffff'; 
    this.ctx.fillRect(0, 0, this.resX, this.resY);
    this._drawTextOnly('#000000', 4);
    return this._createTexture();
  }
}
