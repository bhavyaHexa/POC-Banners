import { useState, useRef, useMemo, useEffect } from 'react';
import { DragControls, Line } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { observer } from 'mobx-react-lite';
import rootStore from '../../stores/RootStore';

const TransformNode = observer(({ width, height, position, dragLimits, objectType, objectId, layerProps = {}, children }) => {
  const { uiManager } = rootStore.designManager;
  const meshRef = useRef();
  const controls = useThree((state) => state.controls);
  const camera = useThree((state) => state.camera);
  const gl = useThree((state) => state.gl);

  const getScreenCenter = () => {
    if (!meshRef.current) return { x: 0, y: 0 };
    const pos = new THREE.Vector3();
    meshRef.current.getWorldPosition(pos);
    pos.project(camera);
    const x = (pos.x * 0.5 + 0.5) * gl.domElement.clientWidth;
    const y = (pos.y * -0.5 + 0.5) * gl.domElement.clientHeight;
    return { x, y };
  };

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
    if (controls) controls.enabled = false;
    uiManager.setIsDragging(true);
    uiManager.setSelectedObject({ type: objectType, id: objectId });
    const center = getScreenCenter();
    const startAngle = Math.atan2(e.clientY - center.y, e.clientX - center.x);
    
    startRef.current = {
      x: e.clientX,
      y: e.clientY,
      s: scale,
      r: localRotation,
      mode: handleMode,
      center,
      startAngle
    };
    setMode(handleMode);
  };

  const handlePointerMove = (e) => {
    if (mode === 'none') return;
    e.stopPropagation();
    
    const dx = e.clientX - startRef.current.x;
    const dy = e.clientY - startRef.current.y;

    if (mode === 'rotate') {
      const currentAngle = Math.atan2(e.clientY - startRef.current.center.y, e.clientX - startRef.current.center.x);
      let angleDiff = currentAngle - startRef.current.startAngle;
      
      // Normalize angle difference to avoid jumps when crossing the -PI/PI boundary
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
      
      setLocalRotation(startRef.current.r - angleDiff);
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
      if (controls) controls.enabled = true;
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

  const [savedPos, setSavedPos] = useState([position?.[0] || 0, position?.[1] || 0, position?.[2] || 0]);
  const livePosRef = useRef([position?.[0] || 0, position?.[1] || 0, position?.[2] || 0]);
  const innerWrapRef = useRef();

  // Sync external Z-position changes (like stacking order) without destroying user's dragged X/Y!
  useEffect(() => {
    if (position) {
      setSavedPos(prev => [prev[0], prev[1], position[2]]);
      livePosRef.current = [livePosRef.current[0], livePosRef.current[1], position[2]];
    }
  }, [position?.[2]]);

  // Position tracking moved to onDrag

  // When transitioning to deselected state, bake the accumulated live position into savedPos.
  // We cannot do this during onDragEnd because DragControls would double-apply its internal offset!
  useEffect(() => {
    if (!isSelected) {
      setSavedPos([...livePosRef.current]);
    }
  }, [isSelected]);

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

  const innerNode = (
    <group 
      ref={meshRef} 
      position={[0, 0, 0]} // Position handled by wrapper now
      scale={[scale * flipH, scale * flipV, 1]} 
      rotation={[0, 0, totalRotation]}
      userData={{ id: objectId }} // Tag the group for raycast identification
      onClick={(event) => {
        if (event.intersections && event.intersections.length > 0) {
          const closestMesh = event.intersections[0].object;
          let hitId = null;
          let current = closestMesh;
          while (current && !hitId) {
            if (current.userData && current.userData.id) hitId = current.userData.id;
            current = current.parent;
          }
          if (hitId === objectId) {
            uiManager.setSelectedObject({ type: objectType, id: objectId });
          }
        }
      }}
      onPointerDown={(event) => {
        if (event.intersections && event.intersections.length > 0) {
          const closestMesh = event.intersections[0].object;
          let hitId = null;
          let current = closestMesh;
          while (current && !hitId) {
            if (current.userData && current.userData.id) hitId = current.userData.id;
            current = current.parent;
          }
          if (hitId === objectId) {
            uiManager.setSelectedObject({ type: objectType, id: objectId });
          }
        }
      }}
    >
      {/* Invisible solid hitbox for reliable raycasting across the entire bounding box */}
      <mesh renderOrder={998}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial transparent opacity={0} depthTest={false} depthWrite={false} />
      </mesh>

      {/* Render wrapped content */}
      <group 
        style={{ opacity }}
        onPointerOver={(e) => { 
          e.stopPropagation(); 
          document.body.style.setProperty('cursor', isSelected ? 'move' : 'pointer', 'important'); 
        }}
        onPointerOut={(e) => { 
          e.stopPropagation(); 
          document.body.style.removeProperty('cursor');
          document.body.style.cursor = 'auto';
        }}
      >
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
            renderOrder={999}
            depthTest={false}
          />
          
          {/* Stem line to top rotation ball */}
          <Line points={[[0, halfH, 0], [0, halfH + 0.35, 0]]} color={purple} lineWidth={1.8} renderOrder={999} depthTest={false} />
          
          {/* Rotation Ball Handle at top center stem */}
          <mesh 
            position={[0, halfH + 0.35, 0]}
            renderOrder={999}
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
                renderOrder={999}
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
  );

  return (
    <group onPointerDown={(e) => e.stopPropagation()}>
      {isSelected ? (
        <DragControls 
          axisLock="z" 
          dragLimits={dynamicLimits ? [
            [dynamicLimits[0][0] - savedPos[0], dynamicLimits[0][1] - savedPos[0]],
            [dynamicLimits[1][0] - savedPos[1], dynamicLimits[1][1] - savedPos[1]],
            [0, 0]
          ] : undefined}
          onDragStart={() => {
            if (controls) controls.enabled = false;
            uiManager.setIsDragging(true);
            document.body.style.setProperty('cursor', 'move', 'important');
          }}
          onDrag={(matrix) => {
            if (matrix && matrix.isMatrix4) {
               const p = new THREE.Vector3();
               p.setFromMatrixPosition(matrix);
               livePosRef.current = [p.x + savedPos[0], p.y + savedPos[1], position ? position[2] : 0];
            }
          }}
          onDragEnd={() => {
            if (controls) controls.enabled = true;
            uiManager.setIsDragging(false);
            document.body.style.removeProperty('cursor');
            
            // Save the true final absolute position to the global layer manager!
            const newPos = [...livePosRef.current];
            const globalManager = rootStore.designManager.layerManager;
            globalManager.updateLayer(objectId, { position: [newPos[0], newPos[1]] });
          }}
        >
          <group ref={innerWrapRef} position={savedPos}>
            {innerNode}
          </group>
        </DragControls>
      ) : (
        <group position={savedPos}>
          {innerNode}
        </group>
      )}
    </group>
  );
});

export default TransformNode;

