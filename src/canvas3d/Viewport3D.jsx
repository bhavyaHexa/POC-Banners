import { useCallback, useEffect, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { CameraControls, Environment } from '@react-three/drei';
import * as THREE from 'three';
import BannerMesh from './scene/BannerMesh';
import { observer } from 'mobx-react-lite';
import rootStore from '../stores/RootStore';

const CameraHandler = observer(({ controlsRef }) => {
  const { uiManager } = rootStore.designManager;

  useEffect(() => {
    if (controlsRef.current) {
      const sideDirection = uiManager.activeSide === 'front' ? 1 : -1;
      const distance = 10 * (100 / uiManager.zoomLevel);
      controlsRef.current.setLookAt(0, 0, sideDirection * distance, 0, 0, 0, true);
    }
  }, [uiManager.activeSide, uiManager.zoomLevel]);

  return <CameraControls ref={controlsRef} makeDefault enabled={!uiManager.isDragging} />;
});

const ScreenshotCapture = observer(({ controlsRef, onCaptureReady }) => {
  const { gl, scene, camera } = useThree();
  const { sizeManager, uiManager } = rootStore.designManager;

  const captureBothSides = useCallback(async () => {
    if (!controlsRef.current) {
      throw new Error('The banner camera is not ready yet.');
    }

    const canvasWidth = sizeManager.unit === 'Feet' ? sizeManager.width : sizeManager.width / 12;
    const canvasHeight = sizeManager.unit === 'Feet' ? sizeManager.height : sizeManager.height / 12;
    const bleedWidth = canvasWidth + 0.5;
    const bleedHeight = canvasHeight + 0.5;
    const selectedObject = uiManager.selectedObject;
    const waitForFrame = () => new Promise(resolve => requestAnimationFrame(resolve));
    const captureSide = async (side) => {
      const zoomDistance = 10 * (100 / uiManager.zoomLevel);
      const z = side === 'front' ? zoomDistance : -zoomDistance;
      await controlsRef.current.setLookAt(0, 0, z, 0, 0, 0, false);
      await waitForFrame();
      gl.render(scene, camera);

      const source = gl.domElement;
      const projectedCorners = [
        [-bleedWidth / 2, -bleedHeight / 2],
        [-bleedWidth / 2, bleedHeight / 2],
        [bleedWidth / 2, -bleedHeight / 2],
        [bleedWidth / 2, bleedHeight / 2],
      ].map(([x, y]) => new THREE.Vector3(x, y, 0).project(camera));
      const xCoordinates = projectedCorners.map(point => (point.x * 0.5 + 0.5) * source.width);
      const yCoordinates = projectedCorners.map(point => (-point.y * 0.5 + 0.5) * source.height);
      const left = Math.max(0, Math.floor(Math.min(...xCoordinates)));
      const top = Math.max(0, Math.floor(Math.min(...yCoordinates)));
      const right = Math.min(source.width, Math.ceil(Math.max(...xCoordinates)));
      const bottom = Math.min(source.height, Math.ceil(Math.max(...yCoordinates)));
      const cropped = document.createElement('canvas');
      cropped.width = right - left;
      cropped.height = bottom - top;

      if (!cropped.width || !cropped.height) {
        throw new Error(`Could not capture the ${side} banner preview.`);
      }

      const context = cropped.getContext('2d');
      if (!context) {
        throw new Error('Could not prepare the banner screenshot.');
      }

      context.drawImage(source, left, top, cropped.width, cropped.height, 0, 0, cropped.width, cropped.height);
      return cropped.toDataURL('image/png');
    };

    uiManager.clearSelectedObject();
    try {
      const front = await captureSide('front');
      const back = await captureSide('back');
      return { front, back };
    } finally {
      try {
        const zoomDistance = 10 * (100 / uiManager.zoomLevel);
        const sideZ = uiManager.activeSide === 'front' ? zoomDistance : -zoomDistance;
        await controlsRef.current.setLookAt(0, 0, sideZ, 0, 0, 0, false);
      } finally {
        uiManager.setSelectedObject(selectedObject);
      }
    }
  }, [camera, controlsRef, gl, scene, sizeManager, uiManager]);

  useEffect(() => {
    onCaptureReady(captureBothSides);
    return () => onCaptureReady(null);
  }, [captureBothSides, onCaptureReady]);

  return null;
});

export default observer(function Viewport3D({ onCaptureReady }) {
  const { uiManager } = rootStore.designManager;
  const controlsRef = useRef();

  return (
    <div className="w-full h-full bg-[#f8f9fa] relative">
      <Canvas
        key="canvas-with-clipping"
        gl={{ localClippingEnabled: true, preserveDrawingBuffer: true }}
        camera={{ position: [0, 0, 10], fov: 45 }}
        shadows
        onPointerMissed={() => uiManager.clearSelectedObject()}
      >
        <ambientLight intensity={0.1} />
        <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
        <directionalLight position={[-10, 5, -10]} intensity={0.5} />
        <Environment preset="studio" />
        <BannerMesh />
        <CameraHandler controlsRef={controlsRef} />
        <ScreenshotCapture controlsRef={controlsRef} onCaptureReady={onCaptureReady} />
      </Canvas>
    </div>
  );
});
