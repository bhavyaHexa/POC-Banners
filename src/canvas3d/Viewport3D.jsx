import { useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { CameraControls, Environment } from '@react-three/drei';
import BannerMesh from './scene/BannerMesh';
import { observer } from 'mobx-react-lite';
import rootStore from '../stores/RootStore';

const CameraHandler = observer(() => {
  const controlsRef = useRef();
  const { uiManager } = rootStore.designManager;

  useEffect(() => {
    if (controlsRef.current) {
      if (uiManager.activeSide === 'front') {
        controlsRef.current.setLookAt(0, 0, 10, 0, 0, 0, true);
      } else {
        controlsRef.current.setLookAt(0, 0, -10, 0, 0, 0, true);
      }
    }
  }, [uiManager.activeSide]);

  return <CameraControls ref={controlsRef} makeDefault enabled={!uiManager.isDragging} />;
});

export default observer(function Viewport3D() {
  const { uiManager } = rootStore.designManager;

  return (
    <div className="w-full h-full bg-[#f8f9fa] cursor-grab active:cursor-grabbing relative">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 45 }}
        shadows
        onPointerMissed={() => uiManager.clearSelectedObject()}
      >
        <ambientLight intensity={0.1} />
        <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
        <directionalLight position={[-10, 5, -10]} intensity={0.5} />
        <Environment preset="studio" />
        <BannerMesh />
        <CameraHandler />
      </Canvas>
    </div>
  );
});

