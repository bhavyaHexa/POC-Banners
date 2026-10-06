import { useState, useEffect } from 'react';
import * as THREE from 'three';

export function useImageTexture(url) {
  const [texture, setTexture] = useState(null);

  useEffect(() => {
    if (!url) {
      setTexture(null);
      return undefined;
    }

    let cancelled = false;
    if (url.toLowerCase().endsWith('.svg') || url.startsWith('data:image/svg')) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        if (cancelled) return;
        const canvas = document.createElement('canvas');
        const w = img.width || 1024;
        const h = img.height || 1024;
        
        // Ensure high resolution for crisp SVG rendering
        const maxDim = Math.max(w, h);
        const scale = maxDim < 1024 ? 1024 / maxDim : 1;
        
        canvas.width = w * scale;
        canvas.height = h * scale;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        const tex = new THREE.CanvasTexture(canvas);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.anisotropy = 16;
        tex.generateMipmaps = false;
        tex.needsUpdate = true;
        
        setTexture(tex);
      };
      img.onerror = (e) => {
        if (!cancelled) console.error('[useImageTexture] SVG load failed:', url, e);
      }
      img.src = url;
      return;
    }

    const loader = new THREE.TextureLoader();

    loader.load(
      url,
      (loadedTexture) => {
        if (cancelled) {
          loadedTexture.dispose();
          return;
        }

        loadedTexture.colorSpace = THREE.SRGBColorSpace;
        loadedTexture.generateMipmaps = false;
        loadedTexture.minFilter = THREE.LinearFilter;
        loadedTexture.magFilter = THREE.LinearFilter;
        loadedTexture.anisotropy = 16;
        loadedTexture.needsUpdate = true;
        setTexture(loadedTexture);
      },
      undefined,
      (error) => {
        if (!cancelled) {
          console.error('[useImageTexture] Image load failed:', url, error);
        }
      }
    );

    return () => {
      cancelled = true;
    };
  }, [url]);

  return texture;
}
