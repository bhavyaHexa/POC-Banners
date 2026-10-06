import * as THREE from 'three';
import { observer } from 'mobx-react-lite';
import rootStore from '../../stores/RootStore';
import SafetyBleedLines from './SafetyBleedLines';
import DraggableText from './DraggableText';
import { DraggableGraphic } from './DraggableGraphic';
import { Suspense, useMemo } from 'react';
import { useImageTexture } from '../../utils/useImageTexture';

// BackgroundMaterial removed as backgrounds are now graphic layers

function BannerMesh() {
  const { sizeManager, layerManager, uiManager } = rootStore.designManager;
  
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

  const clippingPlanes = useMemo(() => {
    return [
      new THREE.Plane(new THREE.Vector3(1, 0, 0), bleedW / 2),
      new THREE.Plane(new THREE.Vector3(-1, 0, 0), bleedW / 2),
      new THREE.Plane(new THREE.Vector3(0, 1, 0), bleedH / 2),
      new THREE.Plane(new THREE.Vector3(0, -1, 0), bleedH / 2),
    ];
  }, [bleedW, bleedH]);

  return (
    <group>
      {/* The physical canvas as a Box to give it thickness */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[bleedW, bleedH, depth]} />
        <meshStandardMaterial 
          color={layerManager.backgroundColor} 
          roughness={0.8} 
        />
      </mesh>

      {/* The Draggable Text Layer (FRONT) */}
      <DraggableText
        text={layerManager.bannerTextFront}
        layerProps={layerManager.textPropsFront}
        depth={depth}
        zOffset={0.02}
        dragLimits={dragLimits}
        canvasWidth={widthIn3D}
        canvasHeight={heightIn3D}
        side="front"
        clippingPlanes={clippingPlanes}
      />

      {/* The Draggable Graphic Layers (FRONT) */}
      {layerManager.layers.filter(l => l.side === 'front' || !l.side).map((layer, index) => {
        const isBg = layer.isBackground;
        const baseZ = isBg ? 0.001 : 0.005;
        const rOrder = isBg ? 1 : 10 + index;
        return (
          <DraggableGraphic
            key={layer.id}
            layer={layer}
            depth={depth}
            zOffset={baseZ + (index * 0.0001)}
            renderOrder={rOrder}
            dragLimits={dragLimits}
            canvasWidth={widthIn3D}
            canvasHeight={heightIn3D}
            bleedMargin={bleedMargin}
            clippingPlanes={clippingPlanes}
          />
        );
      })}

      <group rotation={[0, Math.PI, 0]}>
        {/* The Draggable Text Layer (BACK) */}
        <DraggableText
          text={layerManager.bannerTextBack}
          layerProps={layerManager.textPropsBack}
          depth={depth}
          zOffset={0.02}
          dragLimits={dragLimits}
          canvasWidth={widthIn3D}
          canvasHeight={heightIn3D}
          side="back"
          clippingPlanes={clippingPlanes}
        />

        {/* The Draggable Graphic Layers (BACK) */}
        {layerManager.layers.filter(l => l.side === 'back').map((layer, index) => {
          const isBg = layer.isBackground;
          const baseZ = isBg ? 0.001 : 0.005;
          const rOrder = isBg ? 1 : 10 + index;
          return (
            <DraggableGraphic
              key={layer.id}
              layer={layer}
              depth={depth}
              zOffset={baseZ + (index * 0.0001)}
              renderOrder={rOrder}
              dragLimits={dragLimits}
              canvasWidth={widthIn3D}
              canvasHeight={heightIn3D}
              bleedMargin={bleedMargin}
              clippingPlanes={clippingPlanes}
            />
          );
        })}
      </group>

      {/* Guide Lines rest just on top of the front face */}
      {uiManager.activeSide === 'front' && (
        <SafetyBleedLines 
          width={widthIn3D} 
          height={heightIn3D} 
          bleedMargin={bleedMargin}
          zOffset={(depth / 2) + 0.002} 
        />
      )}

      {/* Guide Lines rest just on top of the back face */}
      {uiManager.activeSide === 'back' && (
        <group rotation={[0, Math.PI, 0]}>
          <SafetyBleedLines 
            width={widthIn3D} 
            height={heightIn3D} 
            bleedMargin={bleedMargin}
            zOffset={(depth / 2) + 0.002} 
          />
        </group>
      )}
    </group>
  );
}

export default observer(BannerMesh);
