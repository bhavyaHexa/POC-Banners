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
        // Move camera to front, looking at origin
        controlsRef.current.setLookAt(0, 0, 10, 0, 0, 0, true);
      } else {
        // Move camera to back, looking at origin
        controlsRef.current.setLookAt(0, 0, -10, 0, 0, 0, true);
      }
    }
  }, [uiManager.activeSide]);

  return <CameraControls ref={controlsRef} makeDefault enabled={!uiManager.isDragging} />;
});

export default function Viewport3D() {
  return (
    <div className="w-full h-full bg-[#f8f9fa] cursor-grab active:cursor-grabbing">
      <Canvas camera={{ position: [0, 0, 10], fov: 45 }} shadows>
        <ambientLight intensity={0.7} />
        
        {/* Main front light */}
        <directionalLight position={[10, 10, 10]} intensity={1.5} castShadow />
        
        {/* Back fill light to ensure the back isn't dark */}
        <directionalLight position={[-10, 10, -10]} intensity={1} />
        
        {/* Soft studio lighting environment */}
        <Environment preset="studio" />
        
        {/* The dynamic 3D Banner */}
        <BannerMesh />
        
        {/* Animated Camera controls linked to the UI toggle */}
        <CameraHandler />
      </Canvas>
    </div>
  );
}
