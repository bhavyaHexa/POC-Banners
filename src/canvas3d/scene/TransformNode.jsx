import { useState, useRef, useMemo } from 'react';
import { DragControls, Line } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { observer } from 'mobx-react-lite';
import rootStore from '../../stores/RootStore';

const TransformNode = observer(({ width, height, position, dragLimits, objectType, objectId, layerProps = {}, children }) => {
  const { uiManager } = rootStore.designManager;
  const meshRef = useRef();

  // Local transform states
  const [scale, setScale] = useState(1);
  const [localRotation, setLocalRotation] = useState(0);
  const [mode, setMode] = useState('none');
  const startRef = useRef({ x: 0, y: 0, s: 1, r: 0, mode: 'none' });

  // Sync external props from toolbar (rotation offset, flipH, flipV, opacity)
  const storeRotation = layerProps.rotation || 0;
  const totalRotation = localRotation + storeRotation;
  const opacity = layerProps.opacity !== undefined ? layerProps.opacity : 1;
  const flipH = layerProps.flipH ? -1 : 1;
  const flipV = layerProps.flipV ? -1 : 1;

  const isSelected = Boolean(
    uiManager.selectedObject &&
    uiManager.selectedObject.type === objectType &&
    uiManager.selectedObject.id === objectId
  );

  const halfW = width / 2;
  const halfH = height / 2;
  const purple = "#8b5cf6";
  const dotSize = 0.07 / Math.max(0.4, scale);

  const handlePointerDown = (e, handleMode) => {
    e.stopPropagation();
    e.target.setPointerCapture(e.pointerId);
    uiManager.setIsDragging(true);
    uiManager.setSelectedObject({ type: objectType, id: objectId });
    startRef.current = {
      x: e.clientX,
      y: e.clientY,
      s: scale,
      r: localRotation,
      mode: handleMode
    };
    setMode(handleMode);
  };

  const handlePointerMove = (e) => {
    if (mode === 'none') return;
    e.stopPropagation();
    
    const dx = e.clientX - startRef.current.x;
    const dy = e.clientY - startRef.current.y;

    if (mode === 'rotate') {
      const delta = (dx - dy) * 0.015;
      setLocalRotation(startRef.current.r - delta);
    } else if (mode.startsWith('scale')) {
      let delta = 0;
      switch (mode) {
        case 'scale-tr':
          delta = (dx - dy) * 0.003;
          break;
        case 'scale-tl':
          delta = (-dx - dy) * 0.003;
          break;
        case 'scale-br':
          delta = (dx + dy) * 0.003;
          break;
        case 'scale-bl':
          delta = (-dx + dy) * 0.003;
          break;
        case 'scale-tm':
          delta = -dy * 0.004;
          break;
        case 'scale-bm':
          delta = dy * 0.004;
          break;
        case 'scale-rm':
          delta = dx * 0.004;
          break;
        case 'scale-lm':
          delta = -dx * 0.004;
          break;
        default:
          delta = (dx - dy) * 0.003;
      }
      setScale(Math.max(0.1, startRef.current.s + delta));
    }
  };

  const handlePointerUp = (e) => {
    if (mode !== 'none') {
      e.stopPropagation();
      try {
        e.target.releasePointerCapture(e.pointerId);
      } catch (err) {
        // pointer release fallback
      }
      uiManager.setIsDragging(false);
      setMode('none');
    }
  };

  // Boundaries calculation
  const dynamicLimits = useMemo(() => {
    if (!dragLimits) return undefined;
    
    const absCos = Math.abs(Math.cos(totalRotation));
    const absSin = Math.abs(Math.sin(totalRotation));
    
    const scaledW = width * scale;
    const scaledH = height * scale;
    
    const rotatedW = scaledW * absCos + scaledH * absSin;
    const rotatedH = scaledW * absSin + scaledH * absCos;
    
    const contentHalfW = rotatedW / 2;
    const contentHalfH = rotatedH / 2;
    
    const [origX, origY, origZ] = dragLimits;
    
    const minX = origX[0] + contentHalfW;
    const maxX = origX[1] - contentHalfW;
    const minY = origY[0] + contentHalfH;
    const maxY = origY[1] - contentHalfH;
    
    const validMinX = Math.min(minX, maxX);
    const validMaxX = Math.max(minX, maxX);
    const validMinY = Math.min(minY, maxY);
    const validMaxY = Math.max(minY, maxY);

    return [
      [validMinX, validMaxX],
      [validMinY, validMaxY],
      origZ || [-10, 10]
    ];
  }, [dragLimits, width, height, scale, totalRotation]);

  useFrame(() => {
    if (meshRef.current && dynamicLimits) {
      meshRef.current.position.x = THREE.MathUtils.clamp(meshRef.current.position.x, dynamicLimits[0][0], dynamicLimits[0][1]);
      meshRef.current.position.y = THREE.MathUtils.clamp(meshRef.current.position.y, dynamicLimits[1][0], dynamicLimits[1][1]);
    }
  });

  // Handle positions
  const handles = [
    // 4 Corners
    { type: 'scale-tl', pos: [-halfW, halfH, 0] },
    { type: 'scale-tr', pos: [halfW, halfH, 0] },
    { type: 'scale-br', pos: [halfW, -halfH, 0] },
    { type: 'scale-bl', pos: [-halfW, -halfH, 0] },
    // 4 Sides
    { type: 'scale-tm', pos: [0, halfH, 0] },
    { type: 'scale-rm', pos: [halfW, 0, 0] },
    { type: 'scale-bm', pos: [0, -halfH, 0] },
    { type: 'scale-lm', pos: [-halfW, 0, 0] }
  ];

  return (
    <DragControls 
      axisLock="z" 
      dragLimits={dynamicLimits}
      onDragStart={() => {
        uiManager.setIsDragging(true);
        uiManager.setSelectedObject({ type: objectType, id: objectId });
      }}
      onDragEnd={() => uiManager.setIsDragging(false)}
    >
      <group 
        ref={meshRef} 
        position={position || [0, 0, 0]} 
        scale={[scale * flipH, scale * flipV, 1]} 
        rotation={[0, 0, totalRotation]}
        onClick={(event) => {
          event.stopPropagation();
          uiManager.setSelectedObject({ type: objectType, id: objectId });
        }}
      >
        {/* Render wrapped content */}
        <group style={{ opacity }}>
          {children}
        </group>
        
        {/* Bounding Box & Handles visible when selected */}
        {isSelected && (
          <group position={[0, 0, 0.01]}>
            {/* Outer Purple Frame */}
            <Line 
              points={[
                [-halfW, halfH, 0], 
                [halfW, halfH, 0], 
                [halfW, -halfH, 0], 
                [-halfW, -halfH, 0], 
                [-halfW, halfH, 0]
              ]} 
              color={purple} 
              lineWidth={2}
            />
            
            {/* Stem line to top rotation ball */}
            <Line points={[[0, halfH, 0], [0, halfH + 0.35, 0]]} color={purple} lineWidth={1.8} />
            
            {/* Rotation Ball Handle at top center stem */}
            <mesh 
              position={[0, halfH + 0.35, 0]}
              onPointerDown={(e) => handlePointerDown(e, 'rotate')}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'alias'; }}
              onPointerOut={(e) => { e.stopPropagation(); document.body.style.cursor = 'auto'; }}
            >
              <circleGeometry args={[dotSize * 1.3, 24]} />
              <meshBasicMaterial color={purple} depthTest={false} />
            </mesh>
            
            {/* 4 Corners + 4 Sides Resize Handles */}
            {handles.map((h, i) => {
              let cursor = 'pointer';
              if (h.type === 'scale-tl' || h.type === 'scale-br') cursor = 'nwse-resize';
              else if (h.type === 'scale-tr' || h.type === 'scale-bl') cursor = 'nesw-resize';
              else if (h.type === 'scale-tm' || h.type === 'scale-bm') cursor = 'ns-resize';
              else if (h.type === 'scale-lm' || h.type === 'scale-rm') cursor = 'ew-resize';

              return (
                <mesh 
                  key={i} 
                  position={h.pos}
                  onPointerDown={(e) => handlePointerDown(e, h.type)}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = cursor; }}
                  onPointerOut={(e) => { e.stopPropagation(); document.body.style.cursor = 'auto'; }}
                >
                  <circleGeometry args={[dotSize, 18]} />
                  <meshBasicMaterial color={purple} depthTest={false} />
                </mesh>
              );
            })}
          </group>
        )}
      </group>
    </DragControls>
  );
});

export default TransformNode;

