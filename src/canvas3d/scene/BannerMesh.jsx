import * as THREE from 'three';
import { observer } from 'mobx-react-lite';
import rootStore from '../../stores/RootStore';
import SafetyBleedLines from './SafetyBleedLines';
import DraggableText from './DraggableText';

function BannerMesh() {
  const { sizeManager, layerManager } = rootStore.designManager;
  
  const inch = 1 / 12;
  const widthIn3D = sizeManager.unit === 'Feet' ? sizeManager.width : sizeManager.width / 12;
  const heightIn3D = sizeManager.unit === 'Feet' ? sizeManager.height : sizeManager.height / 12;

  // Let's make the bleed area larger as requested (e.g. 3 inches on each side)
  const bleedMargin = 3 * inch;
  const bleedW = widthIn3D + (bleedMargin * 2);
  const bleedH = heightIn3D + (bleedMargin * 2);

  const depth = 0.05;

  return (
    <group>
      {/* The physical canvas as a Box to give it thickness */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[bleedW, bleedH, depth]} />
        <meshStandardMaterial 
          color="#ffffff" 
          roughness={0.8}
        />
      </mesh>

      {/* The Draggable Text Layer */}
      <DraggableText text={layerManager.bannerText} depth={depth} />

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

