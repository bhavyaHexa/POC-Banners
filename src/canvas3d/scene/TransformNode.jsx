import { useState, useRef } from 'react';
import { DragControls, Line } from '@react-three/drei';
import { observer } from 'mobx-react-lite';
import rootStore from '../../stores/RootStore';

const TransformNode = observer(({ width, height, position, children }) => {
  const { uiManager } = rootStore.designManager;
  const meshRef = useRef();

  // Transform states
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [mode, setMode] = useState('none');
  const startRef = useRef({ x: 0, y: 0, s: 1, r: 0 });

  const halfW = width / 2;
  const halfH = height / 2;
  const purple = "#8b5cf6"; 
  const dotSize = 0.08 / Math.max(0.5, scale); // keep handle sizes reasonable

  const handlePointerDown = (e, type) => {
    e.stopPropagation();
    e.target.setPointerCapture(e.pointerId);
    uiManager.setIsDragging(true);
    startRef.current = { x: e.clientX, y: e.clientY, s: scale, r: rotation };
    setMode(type);
  };

  const handlePointerMove = (e) => {
    if (mode === 'none') return;
    e.stopPropagation();
    
    const dx = e.clientX - startRef.current.x;
    const dy = e.clientY - startRef.current.y;
    
    if (mode === 'scale') {
      const delta = (dx - dy) * 0.003; 
      setScale(Math.max(0.1, startRef.current.s + delta));
    } else if (mode === 'rotate') {
      const delta = dx * 0.01;
      setRotation(startRef.current.r - delta);
    }
  };

  const handlePointerUp = (e) => {
    if (mode !== 'none') {
      e.stopPropagation();
      e.target.releasePointerCapture(e.pointerId);
      uiManager.setIsDragging(false);
      setMode('none');
    }
  };

  return (
    <DragControls 
      axisLock="z" 
      onDragStart={() => uiManager.setIsDragging(true)}
      onDragEnd={() => uiManager.setIsDragging(false)}
    >
      <group 
        ref={meshRef} 
        position={position || [0, 0, 0]} 
        scale={[scale, scale, 1]} 
        rotation={[0, 0, rotation]}
      >
        {/* Render the wrapped content (Text, QR Code, Image, etc) */}
        {children}
        
        {/* Purple Bounding Box Helper */}
        <group position={[0, 0, 0.01]}>
          <Line 
            points={[
              [-halfW, halfH, 0], 
              [halfW, halfH, 0], 
              [halfW, -halfH, 0], 
              [-halfW, -halfH, 0], 
              [-halfW, halfH, 0]
            ]} 
            color={purple} 
            lineWidth={1.5}
          />
          <Line points={[[0, halfH, 0], [0, halfH + 0.3, 0]]} color={purple} lineWidth={1.5} />
          
          <mesh 
            position={[0, halfH + 0.3, 0]}
            onPointerDown={(e) => handlePointerDown(e, 'rotate')}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            <circleGeometry args={[dotSize, 16]} />
            <meshBasicMaterial color={purple} depthTest={false} />
          </mesh>
          
          {[
            [-halfW, halfH, 0],
            [halfW, halfH, 0],
            [halfW, -halfH, 0],
            [-halfW, -halfH, 0]
          ].map((pos, i) => (
            <mesh 
              key={i} 
              position={pos}
              onPointerDown={(e) => handlePointerDown(e, 'scale')}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
            >
              <circleGeometry args={[dotSize, 16]} />
              <meshBasicMaterial color={purple} depthTest={false} />
            </mesh>
          ))}
        </group>
      </group>
    </DragControls>
  );
});

export default TransformNode;
