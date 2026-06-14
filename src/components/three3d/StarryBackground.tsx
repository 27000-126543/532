import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, ShaderMaterial, BufferAttribute } from 'three';

const vertexShader = `
  attribute float size;
  attribute float opacity;
  varying float vOpacity;
  uniform float uTime;
  
  void main() {
    vOpacity = opacity;
    vec3 pos = position;
    pos.y += sin(uTime * 0.5 + position.x * 0.1) * 0.2;
    pos.x += cos(uTime * 0.3 + position.z * 0.1) * 0.1;
    
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = size * (300.0 / -mvPosition.z);
  }
`;

const fragmentShader = `
  varying float vOpacity;
  uniform float uTime;
  
  void main() {
    vec2 center = gl_PointCoord - vec2(0.5);
    float dist = length(center);
    if (dist > 0.5) discard;
    
    float twinkle = sin(uTime * 2.0 + vOpacity * 10.0) * 0.3 + 0.7;
    float alpha = (1.0 - dist * 2.0) * vOpacity * twinkle;
    
    vec3 color = vec3(1.0, 1.0, 1.0);
    gl_FragColor = vec4(color, alpha);
  }
`;

export function StarryBackground() {
  const pointsRef = useRef<Points>(null);
  const materialRef = useRef<ShaderMaterial>(null);

  const { positions, sizes, opacities, count } = useMemo(() => {
    const count = 2000;
    const positions: number[] = [];
    const sizes: number[] = [];
    const opacities: number[] = [];

    for (let i = 0; i < count; i++) {
      const radius = 50 + Math.random() * 150;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions.push(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(phi)
      );

      sizes.push(0.5 + Math.random() * 2);
      opacities.push(0.3 + Math.random() * 0.7);
    }

    return { positions, sizes, opacities, count };
  }, []);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
    }
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.01;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={new Float32Array(positions)}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={count}
          array={new Float32Array(sizes)}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-opacity"
          count={count}
          array={new Float32Array(opacities)}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          uTime: { value: 0 },
        }}
        transparent
        depthWrite={false}
        blending={2}
      />
    </points>
  );
}
