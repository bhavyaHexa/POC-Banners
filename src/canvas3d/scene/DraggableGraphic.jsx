import { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import TransformNode from './TransformNode';
import { useImageTexture } from '../../utils/useImageTexture';
import { fitObjectToCanvas } from '../../utils/objectSizing';

const GraphicContent = ({ url, opacity = 1, setAspect }) => {
  const texture = useImageTexture(url);
  
  useEffect(() => {
    if (texture && texture.image) {
      setAspect(texture.image.width / texture.image.height);
    }
  }, [texture, setAspect]);

  if (!texture) return <meshBasicMaterial transparent opacity={0} depthTest={false} depthWrite={false} />;

  return (
    <meshBasicMaterial map={texture} transparent opacity={opacity} depthTest={false} depthWrite={false} />
  );
};

export const DraggableGraphic = observer(({ layer, depth, dragLimits, canvasWidth, canvasHeight }) => {
  const [aspect, setAspect] = useState(1);
  const { width: w, height: h } = fitObjectToCanvas(canvasWidth, canvasHeight, aspect);

  return (
    <TransformNode 
      width={w} 
      height={h} 
      position={[0, 0, depth / 2 + 0.005]} 
      dragLimits={dragLimits} 
      objectType="graphic" 
      objectId={layer.id}
      layerProps={layer}
    >
      <mesh renderOrder={10}>
        <planeGeometry args={[w, h]} />
        <GraphicContent url={layer.url} opacity={layer.opacity} setAspect={setAspect} />
      </mesh>
    </TransformNode>
  );
});
