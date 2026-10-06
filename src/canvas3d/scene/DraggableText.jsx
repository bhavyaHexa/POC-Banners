import { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import * as THREE from 'three';
import { TextTextureGenerator } from '../../utils/textureGenerator';
import { fitObjectToCanvas } from '../../utils/objectSizing';
import TransformNode from './TransformNode';
import rootStore from '../../stores/RootStore';

const DraggableText = observer(({ text, layerProps, depth, dragLimits, canvasWidth, canvasHeight, side, clippingPlanes, zOffset = 0.005 }) => {
  const [textures, setTextures] = useState(null);
  const [aspect, setAspect] = useState(1);

  useEffect(() => {
    if (!text || text.trim() === '') {
      setTextures(null);
      return;
    }

    const generator = new TextTextureGenerator(text);
    const diff = generator.getDiffuse();
    const norm = generator.getNormal();
    const ao = generator.getAO();
    
    setTextures({ diffuse: diff, normal: norm, ao: ao });
    setAspect(generator.aspect);

    return () => {
      diff.dispose();
      norm.dispose();
      ao.dispose();
    }
  }, [text]);

  if (!textures) return null;

  const { width: w, height: h } = fitObjectToCanvas(canvasWidth, canvasHeight, aspect);
  const opacity = layerProps.opacity !== undefined ? layerProps.opacity : 1;

  return (
    <TransformNode 
      width={w} 
      height={h} 
      position={[layerProps.position?.[0] || 0, layerProps.position?.[1] || 0, depth / 2 + zOffset]} 
      dragLimits={dragLimits} 
      objectType="text"
      objectId={side === 'back' ? 'text-back' : 'text'}
      layerProps={layerProps}
    >
      <mesh renderOrder={100}>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial 
          map={textures.diffuse}
          normalMap={textures.normal}
          aoMap={textures.ao}
          transparent={true}
          opacity={opacity}
          depthTest={false}
          depthWrite={false}
          alphaTest={0.01}
          roughness={1.0}
          metalness={0.0}
          clippingPlanes={clippingPlanes}
          clipIntersection={false}
        />
      </mesh>
    </TransformNode>
  );
});

export default DraggableText;

