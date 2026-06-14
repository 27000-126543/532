import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, PerspectiveCamera } from '@react-three/drei';
import { Group } from 'three';
import { HouseUnit } from './HouseUnit';
import Effects from './Effects';
import useHouseStore from '@/store/useHouseStore';
import useSceneStore from '@/store/useSceneStore';
import type { House } from '@/types';

interface BuildingSceneProps {
  buildingId: string;
}

function BuildingShell({ floors }: { floors: number }) {
  const groupRef = useRef<Group>(null);
  const buildingWidth = 10;
  const buildingDepth = 8;
  const floorHeight = 2;
  const buildingHeight = floors * floorHeight;

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh position={[0, buildingHeight / 2, 0]}>
        <boxGeometry args={[buildingWidth, buildingHeight, buildingDepth]} />
        <meshStandardMaterial
          color="#3b82f6"
          transparent
          opacity={0.15}
          side={2}
          wireframe={false}
        />
      </mesh>

      <mesh position={[0, buildingHeight / 2, 0]}>
        <boxGeometry args={[buildingWidth, buildingHeight, buildingDepth]} />
        <meshBasicMaterial
          color="#60a5fa"
          transparent
          opacity={0.1}
          wireframe
        />
      </mesh>

      {Array.from({ length: floors + 1 }).map((_, i) => (
        <mesh key={i} position={[0, i * floorHeight, 0]}>
          <boxGeometry args={[buildingWidth + 0.2, 0.05, buildingDepth + 0.2]} />
          <meshStandardMaterial
            color="#475569"
            transparent
            opacity={0.5}
          />
        </mesh>
      ))}

      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[buildingWidth + 1, 0.2, buildingDepth + 1]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
    </group>
  );
}

function FloorLevel({ floor, houses, buildingWidth, buildingDepth, floorHeight, onHouseClick }: {
  floor: number;
  houses: House[];
  buildingWidth: number;
  buildingDepth: number;
  floorHeight: number;
  onHouseClick: (house: House) => void;
}) {
  const groupRef = useRef<Group>(null);
  const unitsPerFloor = 4;
  const { selectedHouseId } = useSceneStore();

  useFrame((state) => {
    if (groupRef.current) {
      const delay = floor * 0.1;
      const targetY = floor * floorHeight + floorHeight / 2 + Math.sin(state.clock.elapsedTime * 0.5 + delay) * 0.1;
      groupRef.current.position.y = targetY;
      groupRef.current.position.z = Math.sin(state.clock.elapsedTime * 0.3 + delay) * 0.5;
    }
  });

  const houseWidth = (buildingWidth - 2) / unitsPerFloor;
  const houseHeight = floorHeight * 0.85;
  const houseDepth = buildingDepth * 0.8;

  return (
    <group ref={groupRef} position={[0, floor * floorHeight + floorHeight / 2, 0]}>
      <Html position={[-buildingWidth / 2 - 1, floorHeight / 2, 0]} center>
        <div className="bg-slate-800/90 px-2 py-1 rounded text-white text-xs font-bold">
          {floor}层
        </div>
      </Html>

      {houses.map((house, unitIndex) => {
        const xOffset = -buildingWidth / 2 + 1 + houseWidth / 2 + unitIndex * houseWidth;
        return (
          <HouseUnit
            key={house.id}
            house={house}
            position={[xOffset, 0, 0]}
            isSelected={selectedHouseId === house.id}
            onClick={onHouseClick}
            showLabel={false}
          />
        );
      })}
    </group>
  );
}

function SceneContent({ buildingId }: { buildingId: string }) {
  const building = useHouseStore((state) => state.getBuildingById(buildingId));
  const allHouses = useHouseStore((state) => state.getHousesByBuildingId(buildingId));
  const { selectHouse } = useSceneStore();

  const floors = building?.floors || 20;
  const unitsPerFloor = building?.unitsPerFloor || 4;
  const buildingWidth = 10;
  const buildingDepth = 8;
  const floorHeight = 2;

  const housesByFloor = useMemo(() => {
    const grouped: Record<number, House[]> = {};
    allHouses.forEach((house) => {
      if (!grouped[house.floor]) {
        grouped[house.floor] = [];
      }
      if (grouped[house.floor].length < unitsPerFloor) {
        grouped[house.floor].push(house);
      }
    });
    return grouped;
  }, [allHouses, unitsPerFloor]);

  if (!building) return null;

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[10, 20, 10]}
        intensity={1}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <pointLight position={[-10, 10, -10]} intensity={0.4} color="#88ccff" />
      <pointLight position={[10, 10, 10]} intensity={0.4} color="#ffcc88" />

      <BuildingShell floors={floors} />

      {Object.entries(housesByFloor).map(([floor, houses]) => (
        <FloorLevel
          key={floor}
          floor={parseInt(floor)}
          houses={houses}
          buildingWidth={buildingWidth}
          buildingDepth={buildingDepth}
          floorHeight={floorHeight}
          onHouseClick={(house) => selectHouse(house.id)}
        />
      ))}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>

      <gridHelper args={[60, 30, '#1e293b', '#0f172a']} position={[0, 0.01, 0]} />

      <Effects />
    </>
  );
}

function BuildingScene({ buildingId }: BuildingSceneProps) {
  const building = useHouseStore((state) => state.getBuildingById(buildingId));
  const { selectHouse } = useSceneStore();
  const floors = building?.floors || 20;

  return (
    <Canvas
      shadows
      camera={{ position: [0, floors * 1.5, 20], fov: 50, near: 0.1, far: 200 }}
      gl={{ antialias: true }}
      style={{ background: '#0f172a' }}
    >
      <PerspectiveCamera
        makeDefault
        position={[0, floors * 1.5, 20]}
        fov={50}
      />
      <SceneContent buildingId={buildingId} />
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        minDistance={10}
        maxDistance={60}
        maxPolarAngle={Math.PI / 2}
        minPolarAngle={Math.PI / 4}
        onPointerMissed={() => selectHouse(null)}
      />
    </Canvas>
  );
}

export default BuildingScene;
