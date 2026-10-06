import * as THREE from 'three';
import { observer } from 'mobx-react-lite';
import rootStore from '../../stores/RootStore';
import SafetyBleedLines from './SafetyBleedLines';
import DraggableText from './DraggableText';
import { DraggableGraphic } from './DraggableGraphic';
import { Suspense } from 'react';
import { useImageTexture } from '../../utils/useImageTexture';

const BackgroundMaterial = observer(({ color, image }) => {
  const texture = useImageTexture(image);

  // Always show color. If texture loaded, overlay it.
  if (image && texture) {
    return (
      <meshStandardMaterial 
        key={texture.uuid} 
        map={texture} 
        color={color} 
        roughness={0.8} 
      />
    );
  }
  
  return (
    <meshStandardMaterial 
      key="color-only"
      color={color} 
      roughness={0.8} 
    />
  );
});

function BannerMesh() {
  const { sizeManager, layerManager } = rootStore.designManager;
  
  const inch = 1 / 12;
  const widthIn3D = sizeManager.unit === 'Feet' ? sizeManager.width : sizeManager.width / 12;
  const heightIn3D = sizeManager.unit === 'Feet' ? sizeManager.height : sizeManager.height / 12;

  const bleedMargin = 3 * inch;
  const bleedW = widthIn3D + (bleedMargin * 2);
  const bleedH = heightIn3D + (bleedMargin * 2);

  const depth = 0.05;

  // Strict drag limits aligned precisely with the Black Line (safe area dimensions)
  const dragLimits = [
    [-widthIn3D / 2, widthIn3D / 2],
    [-heightIn3D / 2, heightIn3D / 2],
    [-10, 10]
  ];

  return (
    <group>
      {/* The physical canvas as a Box to give it thickness */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[bleedW, bleedH, depth]} />
        <BackgroundMaterial color={layerManager.backgroundColor} image={layerManager.backgroundImage} />
      </mesh>

      {/* The Draggable Text Layer (FRONT) */}
      <DraggableText
        text={layerManager.bannerTextFront}
        layerProps={layerManager.textPropsFront}
        depth={depth}
        dragLimits={dragLimits}
        canvasWidth={widthIn3D}
        canvasHeight={heightIn3D}
        side="front"
      />

      {/* The Draggable Graphic Layers (FRONT) */}
      {layerManager.layers.filter(l => l.side === 'front' || !l.side).map(layer => (
        <DraggableGraphic
          key={layer.id}
          layer={layer}
          depth={depth}
          dragLimits={dragLimits}
          canvasWidth={widthIn3D}
          canvasHeight={heightIn3D}
        />
      ))}

      <group rotation={[0, Math.PI, 0]}>
        {/* The Draggable Text Layer (BACK) */}
        <DraggableText
          text={layerManager.bannerTextBack}
          layerProps={layerManager.textPropsBack}
          depth={depth}
          dragLimits={dragLimits}
          canvasWidth={widthIn3D}
          canvasHeight={heightIn3D}
          side="back"
        />

        {/* The Draggable Graphic Layers (BACK) */}
        {layerManager.layers.filter(l => l.side === 'back').map(layer => (
          <DraggableGraphic
            key={layer.id}
            layer={layer}
            depth={depth}
            dragLimits={dragLimits}
            canvasWidth={widthIn3D}
            canvasHeight={heightIn3D}
          />
        ))}
      </group>

      {/* Guide Lines rest just on top of the front face */}
      <SafetyBleedLines 
        width={widthIn3D} 
        height={heightIn3D} 
        bleedMargin={bleedMargin}
        zOffset={(depth / 2) + 0.002} 
      />

      {/* Guide Lines rest just on top of the back face */}
      <group rotation={[0, Math.PI, 0]}>
        <SafetyBleedLines 
          width={widthIn3D} 
          height={heightIn3D} 
          bleedMargin={bleedMargin}
          zOffset={(depth / 2) + 0.002} 
        />
      </group>
    </group>
  );
}

export default observer(BannerMesh);
