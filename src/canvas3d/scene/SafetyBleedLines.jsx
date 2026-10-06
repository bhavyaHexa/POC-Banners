import * as THREE from 'three';
import { observer } from 'mobx-react-lite';
import { Line, Text } from '@react-three/drei';

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

  const safetyPoints = [
    [-width/2, height/2, z],
    [width/2, height/2, z],
    [width/2, -height/2, z],
    [-width/2, -height/2, z],
    [-width/2, height/2, z],
  ];

  // Rulers calculation
  const tickLines = [];
  const tickLabels = [];

  const topY = bleedH/2;
  const leftX = -bleedW/2;
  const numColor = "#4b5563";
  const tickColor = "#9ca3af";

  // --- Top Ruler (Ticks go UP) ---
  for (let i = 0; i <= Math.ceil(bleedW); i++) {
    const x = -bleedW/2 + i;
    if (x > bleedW/2 + 0.001) break;

    // Major tick
    tickLines.push({ points: [[x, topY, z], [x, topY + 0.15, z]], color: tickColor, width: 1.2 });
    tickLabels.push({ text: i.toString(), pos: [x + 0.05, topY + 0.08, z], rot: 0 });

    // Minor ticks (12ths for inches)
    if (i < Math.ceil(bleedW)) {
      for (let j = 1; j < 12; j++) {
        const minorX = x + j/12;
        if (minorX > bleedW/2 + 0.001) break;
        const tickLen = (j === 6) ? 0.08 : 0.04;
        tickLines.push({ points: [[minorX, topY, z], [minorX, topY + tickLen, z]], color: tickColor, width: 1 });
      }
    }
  }

  // --- Left Ruler (Ticks go LEFT) ---
  for (let i = 0; i <= Math.ceil(bleedH); i++) {
    const y = bleedH/2 - i; // 0 starts at TOP
    if (y < -bleedH/2 - 0.001) break;

    // Major tick
    tickLines.push({ points: [[leftX, y, z], [leftX - 0.15, y, z]], color: tickColor, width: 1.2 });
    tickLabels.push({ text: i.toString(), pos: [leftX - 0.08, y - 0.05, z], rot: Math.PI / 2 });

    // Minor ticks
    if (i < Math.ceil(bleedH)) {
      for (let j = 1; j < 12; j++) {
        const minorY = y - j/12;
        if (minorY < -bleedH/2 - 0.001) break;
        const tickLen = (j === 6) ? 0.08 : 0.04;
        tickLines.push({ points: [[leftX, minorY, z], [leftX - tickLen, minorY, z]], color: tickColor, width: 1 });
      }
    }
  }

  return (
    <group>
      {/* Outer edge (Bleed) - Solid Thin Gray */}
      <Line ref={(r) => { if (r) r.renderOrder = 900; }} points={bleedPoints} color="#9ca3af" lineWidth={1.5} depthTest={false} transparent={true} />

      {/* Inner Area (Safety/Canvas) - Dashed Red */}
      <Line 
        ref={(r) => { if (r) r.renderOrder = 900; }}
        points={safetyPoints} 
        color="#ef4444" 
        lineWidth={1.5} 
        dashed={true}
        dashSize={0.08}
        gapSize={0.08}
        depthTest={false}
        transparent={true}
      />

      {/* Ruler Ticks */}
      {tickLines.map((tick, idx) => (
        <Line key={`tick-${idx}`} ref={(r) => { if (r) r.renderOrder = 900; }} points={tick.points} color={tick.color} lineWidth={tick.width} depthTest={false} transparent={true} />
      ))}

      {/* Ruler Numbers */}
      {tickLabels.map((lbl, idx) => (
        <Text 
          key={`lbl-${idx}`}
          position={lbl.pos}
          rotation={[0, 0, lbl.rot]}
          fontSize={0.06}
          color={numColor}
          anchorX="left"
          anchorY="middle"
          depthTest={false}
          renderOrder={900}
        >
          {lbl.text}
        </Text>
      ))}

      {/* Top Annotations ("Bleed" and "Safety Area") */}
      <group position={[0, topY + 0.4, z]}>
        <Text fontSize={0.07} color="#6b7280" position={[0, 0, 0]} anchorX="center" anchorY="bottom" depthTest={false} renderOrder={900}>
          Bleed
        </Text>
        <Line ref={(r) => { if (r) r.renderOrder = 900; }} points={[[0, -0.02, 0], [0, -0.4, 0]]} color="#3b82f6" dashed dashSize={0.05} gapSize={0.05} lineWidth={1} depthTest={false} transparent={true} />
        
        <Text fontSize={0.07} color="#6b7280" position={[-0.8, -0.2, 0]} anchorX="center" anchorY="bottom" depthTest={false} renderOrder={900}>
          Safety Area
        </Text>
        <Line ref={(r) => { if (r) r.renderOrder = 900; }} points={[[-0.8, -0.22, 0], [-0.8, -0.4 - bleedMargin, 0]]} color="#3b82f6" dashed dashSize={0.05} gapSize={0.05} lineWidth={1} depthTest={false} transparent={true} />
      </group>

      {/* Bottom Right Size Indicator */}
      <Text 
        position={[width/2, -height/2 - 0.2, z]}
        fontSize={0.12}
        color="#374151"
        anchorX="right"
        anchorY="top"
        depthTest={false}
        renderOrder={900}
      >
        {`${width} x ${height} (ft)`}
      </Text>
      
      {/* Corner Grommets (Brass Rings) - Positioned halfway between safety and bleed lines */}
      {[
        [-(width/2 + bleedMargin/2), (height/2 + bleedMargin/2), z],
        [(width/2 + bleedMargin/2), (height/2 + bleedMargin/2), z],
        [(width/2 + bleedMargin/2), -(height/2 + bleedMargin/2), z],
        [-(width/2 + bleedMargin/2), -(height/2 + bleedMargin/2), z]
      ].map((pos, i) => (
        <group key={`grommet-group-${i}`} position={pos}>
          {/* Brass Ring */}
          <mesh renderOrder={900}>
            <ringGeometry args={[0.05, 0.08, 32]} />
            <meshBasicMaterial color="#c5a059" depthTest={false} transparent={true} side={THREE.DoubleSide} />
          </mesh>
          {/* Punched Hole Illusion - pure white to match scene background */}
          <mesh renderOrder={899}>
            <circleGeometry args={[0.05, 32]} />
            <meshBasicMaterial color="#ffffff" depthTest={false} transparent={true} side={THREE.DoubleSide} opacity={1} />
          </mesh>
        </group>
      ))}
      
    </group>
  );
}

export default observer(SafetyBleedLines);
