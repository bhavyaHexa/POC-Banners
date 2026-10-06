import * as THREE from 'three';
import { observer } from 'mobx-react-lite';
import { Line } from '@react-three/drei';

function SafetyBleedLines({ width, height, bleedMargin, zOffset }) {
  // Bleed is outer boundary
  const bleedW = width + (bleedMargin * 2);
  const bleedH = height + (bleedMargin * 2);

  const z = zOffset; 

  const bleedPoints = [
    [-bleedW/2, bleedH/2, z],
    [bleedW/2, bleedH/2, z],
    [bleedW/2, -bleedH/2, z],
    [-bleedW/2, -bleedH/2, z],
    [-bleedW/2, bleedH/2, z],
  ];

  // The red dashed line (Safety/Canvas bounds)
  const safetyPoints = [
    [-width/2, height/2, z],
    [width/2, height/2, z],
    [width/2, -height/2, z],
    [-width/2, -height/2, z],
    [-width/2, height/2, z],
  ];

  return (
    <group>
      {/* Outer edge (Bleed) - Solid Thin Gray/Black */}
      <Line points={bleedPoints} color="#9ca3af" lineWidth={1.5} />

      {/* Inner Area (Safety/Canvas) - Dashed Red */}
      <Line 
        points={safetyPoints} 
        color="#ef4444" 
        lineWidth={1.5} 
        dashed={true}
        dashSize={0.08}
        gapSize={0.08}
      />
      
    </group>
  );
}

export default observer(SafetyBleedLines);
