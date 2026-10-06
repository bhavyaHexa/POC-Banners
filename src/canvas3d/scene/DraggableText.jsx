import { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { TextTextureGenerator } from '../../utils/textureGenerator';
import TransformNode from './TransformNode';

const DraggableText = observer(({ text, depth }) => {
  const [textures, setTextures] = useState(null);
  const [aspect, setAspect] = useState(1);

  useEffect(() => {
    if (!text || text.trim() === '') {
      setTextures(null);
      return;
    }

    const generator = new TextTextureGenerator(text);
    const diff = generator.getDiffuse();
    const norm = generator.getNormal();
    const ao = generator.getAO();
    
    setTextures({ diffuse: diff, normal: norm, ao: ao });
    setAspect(generator.aspect);

    return () => {
      diff.dispose();
      norm.dispose();
      ao.dispose();
    }
  }, [text]);

  if (!textures) return null;

  const h = 1.5;
  const w = h * aspect;

  return (
    <TransformNode width={w} height={h} position={[0, 0, depth / 2 + 0.005]}>
      <mesh>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial 
          map={textures.diffuse}
          normalMap={textures.normal}
          aoMap={textures.ao}
          transparent={true}
          depthWrite={false}
          roughness={0.4}
          metalness={0.1}
        />
      </mesh>
    </TransformNode>
  );
});

export default DraggableText;
