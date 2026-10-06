import { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import * as THREE from 'three';
import TransformNode from './TransformNode';
import { useImageTexture } from '../../utils/useImageTexture';
import { fitObjectToCanvas } from '../../utils/objectSizing';

const GraphicContent = ({ url, opacity = 1, setAspect, clippingPlanes }) => {
  const texture = useImageTexture(url);
  
  useEffect(() => {
    if (texture && texture.image) {
      const imgW = texture.image.width;
      const imgH = texture.image.height;
      if (imgW && imgH) {
        setAspect(imgW / imgH);
      } else {
        setAspect(1);
      }
    }
  }, [texture, setAspect]);

  if (!texture) return <meshBasicMaterial transparent opacity={0} depthTest={false} depthWrite={false} />;

  return (
    <meshBasicMaterial 
      map={texture} 
      transparent 
      opacity={opacity} 
      depthTest={false} 
      depthWrite={false} 
      alphaTest={0.01}
      clippingPlanes={clippingPlanes}
      clipIntersection={false}
    />
  );
};

export const DraggableGraphic = observer(({ layer, depth, dragLimits, canvasWidth, canvasHeight, bleedMargin = 0, clippingPlanes, zOffset = 0.005, renderOrder = 10 }) => {
  const [aspect, setAspect] = useState(1);
  
  let w, h;
  if (layer.isBackground) {
    w = canvasWidth + (bleedMargin * 2);
    h = canvasHeight + (bleedMargin * 2);
  } else {
    const size = fitObjectToCanvas(canvasWidth, canvasHeight, aspect);
    w = size.width;
    h = size.height;
  }

  return (
    <TransformNode 
      width={w} 
      height={h} 
      position={[layer.position?.[0] || 0, layer.position?.[1] || 0, depth / 2 + zOffset]} 
      dragLimits={dragLimits} 
      objectType="graphic" 
      objectId={layer.id}
      layerProps={layer}
    >
      <mesh renderOrder={renderOrder}>
        <planeGeometry args={[w, h]} />
        <GraphicContent url={layer.url} opacity={layer.opacity} setAspect={setAspect} clippingPlanes={clippingPlanes} />
      </mesh>
    </TransformNode>
  );
});
