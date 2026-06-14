import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { DirectionalLight } from 'three';
import { Building } from './Building';
import { StarryBackground } from './StarryBackground';
import Effects from './Effects';
import useHouseStore from '@/store/useHouseStore';
import useSceneStore from '@/store/useSceneStore';
import energyStats from '@/data/energyStats';

function LightRig() {
  const directionalRef = useRef<DirectionalLight>(null);

  useFrame((state) => {
    if (directionalRef.current) {
      directionalRef.current.position.x = Math.sin(state.clock.elapsedTime * 0.1) * 10;
      directionalRef.current.position.z = Math.cos(state.clock.elapsedTime * 0.1) * 10;
    }
  });

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight
        ref={directionalRef}
        position={[10, 20, 10]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={100}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
      />
      <pointLight position={[-20, 10, -20]} intensity={0.3} color="#88ccff" />
      <pointLight position={[20, 10, 20]} intensity={0.3} color="#ffcc88" />
    </>
  );
}

function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[200, 200]} />
      <meshStandardMaterial color="#1e293b" />
    </mesh>
  );
}

function GridHelper() {
  return (
    <gridHelper
      args={[200, 50, '#334155', '#1e293b']}
      position={[0, 0.01, 0]}
    />
  );
}

function SceneContent() {
  const buildings = useHouseStore((state) => state.buildings);
  const { selectBuilding, selectedBuildingId } = useSceneStore();

  const overBudgetMap = useMemo(() => {
    const map = new Map<string, boolean>();
    energyStats.forEach((stat: any) => {
      map.set(stat.buildingId, stat.isOverBudget);
    });
    return map;
  }, []);

  return (
    <>
      <LightRig />
      <Ground />
      <GridHelper />
      <StarryBackground />
      {buildings.map((building) => (
        <Building
          key={building.id}
          building={building}
          position={[building.position.x, building.position.y, building.position.z]}
          isSelected={selectedBuildingId === building.id}
          isOverBudget={overBudgetMap.get(building.id) || false}
          onClick={(b) => selectBuilding(b.id)}
        />
      ))}
      <Effects />
    </>
  );
}

function CommunityScene() {
  const cameraPosition = useSceneStore((state) => state.cameraPosition);

  return (
    <Canvas
      shadows
      camera={{
        position: [cameraPosition.x, cameraPosition.y, cameraPosition.z],
        fov: 45,
        near: 0.1,
        far: 500
      }}
      gl={{ antialias: true, alpha: false }}
      style={{ background: '#0a0a1a' }}
    >
      <SceneContent />
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        minDistance={20}
        maxDistance={100}
        maxPolarAngle={Math.PI / 2.1}
        minPolarAngle={Math.PI / 6}
      />
    </Canvas>
  );
}

export default CommunityScene;
