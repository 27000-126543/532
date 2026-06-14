import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import { Group } from 'three';
import Effects from './Effects';
import useHouseStore from '@/store/useHouseStore';
import useSceneStore from '@/store/useSceneStore';

interface HouseSceneProps {
  houseId: string;
}

const roomColors = {
  living: '#f59e0b',
  bedroom: '#3b82f6',
  kitchen: '#10b981',
  bathroom: '#8b5cf6',
  dining: '#ec4899'
};

const roomLabels: Record<string, string> = {
  living: '客厅',
  bedroom: '卧室',
  kitchen: '厨房',
  bathroom: '卫生间',
  dining: '餐厅'
};

interface RoomConfig {
  type: string;
  position: [number, number, number];
  size: { width: number; depth: number };
}

function Wall({
  position,
  size,
  rotation = [0, 0, 0]
}: {
  position: [number, number, number];
  size: [number, number, number];
  rotation?: [number, number, number];
}) {
  return (
    <mesh position={position} rotation={rotation as any} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color="#f1f5f9" side={2} />
    </mesh>
  );
}

function Floor({
  position,
  size,
  color
}: {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
}) {
  return (
    <mesh position={position} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} opacity={0.7} transparent />
    </mesh>
  );
}

function Sofa({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.2, 0]} castShadow>
        <boxGeometry args={[2, 0.4, 0.8]} />
        <meshStandardMaterial color="#64748b" />
      </mesh>
      <mesh position={[0, 0.5, -0.3]} castShadow>
        <boxGeometry args={[2, 0.5, 0.2]} />
        <meshStandardMaterial color="#64748b" />
      </mesh>
      <mesh position={[-0.9, 0.35, 0]} castShadow>
        <boxGeometry args={[0.2, 0.3, 0.8]} />
        <meshStandardMaterial color="#64748b" />
      </mesh>
      <mesh position={[0.9, 0.35, 0]} castShadow>
        <boxGeometry args={[0.2, 0.3, 0.8]} />
        <meshStandardMaterial color="#64748b" />
      </mesh>
    </group>
  );
}

function Bed({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.15, 0]} castShadow>
        <boxGeometry args={[1.8, 0.3, 2]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>
      <mesh position={[0, 0.4, -0.8]} castShadow>
        <boxGeometry args={[1.8, 0.5, 0.1]} />
        <meshStandardMaterial color="#78716c" />
      </mesh>
      <mesh position={[0, 0.35, 0.1]} castShadow>
        <boxGeometry args={[1.6, 0.1, 1.6]} />
        <meshStandardMaterial color="#e2e8f0" />
      </mesh>
    </group>
  );
}

function Table({ position, size = [1.2, 0.7, 0.8] }: { position: [number, number, number]; size?: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, size[1] / 2, 0]} castShadow>
        <boxGeometry args={[size[0], 0.08, size[2]]} />
        <meshStandardMaterial color="#a16207" />
      </mesh>
      {[[-size[0] / 2 + 0.1, -size[2] / 2 + 0.1], [size[0] / 2 - 0.1, -size[2] / 2 + 0.1], [-size[0] / 2 + 0.1, size[2] / 2 - 0.1], [size[0] / 2 - 0.1, size[2] / 2 - 0.1]].map(([x, z], i) => (
        <mesh key={i} position={[x, size[1] / 2 - 0.3, z]} castShadow>
          <boxGeometry args={[0.08, size[1] - 0.08, 0.08]} />
          <meshStandardMaterial color="#78350f" />
        </mesh>
      ))}
    </group>
  );
}

function Chair({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.25, 0]} castShadow>
        <boxGeometry args={[0.4, 0.05, 0.4]} />
        <meshStandardMaterial color="#78350f" />
      </mesh>
      <mesh position={[0, 0.5, -0.15]} castShadow>
        <boxGeometry args={[0.4, 0.5, 0.05]} />
        <meshStandardMaterial color="#78350f" />
      </mesh>
      {[[-0.15, -0.15], [0.15, -0.15], [-0.15, 0.15], [0.15, 0.15]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.1, z]} castShadow>
          <boxGeometry args={[0.05, 0.4, 0.05]} />
          <meshStandardMaterial color="#78350f" />
        </mesh>
      ))}
    </group>
  );
}

function KitchenCabinet({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[1.5, 0.8, 0.6]} />
        <meshStandardMaterial color="#d6d3d1" />
      </mesh>
      <mesh position={[0, 1.2, 0]} castShadow>
        <boxGeometry args={[1.5, 0.6, 0.3]} />
        <meshStandardMaterial color="#a8a29e" />
      </mesh>
      <mesh position={[0, 0.81, 0]} castShadow>
        <boxGeometry args={[1.4, 0.02, 0.55]} />
        <meshStandardMaterial color="#525252" />
      </mesh>
    </group>
  );
}

function BathroomFixture({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.2, 0]} castShadow>
        <boxGeometry args={[0.8, 0.4, 0.5]} />
        <meshStandardMaterial color="#e2e8f0" />
      </mesh>
      <mesh position={[0, 0.45, 0.2]} castShadow>
        <cylinderGeometry args={[0.15, 0.12, 0.3, 16]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>
    </group>
  );
}

function RoomLabel({ type, position }: { type: string; position: [number, number, number] }) {
  return (
    <Html position={position} center>
      <div
        className="px-3 py-1 rounded-full text-white text-xs font-bold shadow-lg"
        style={{ backgroundColor: roomColors[type as keyof typeof roomColors] }}
      >
        {roomLabels[type]}
      </div>
    </Html>
  );
}

function getLayoutConfig(area: number): {
  rooms: RoomConfig[];
  totalWidth: number;
  totalDepth: number;
  wallHeight: number;
} {
  const wallHeight = 3;
  const configs: Record<number, { rooms: RoomConfig[]; totalWidth: number; totalDepth: number }> = {
    50: {
      totalWidth: 7,
      totalDepth: 7.5,
      rooms: [
        { type: 'living', position: [-0.5, 0, 0], size: { width: 5, depth: 4 } },
        { type: 'bedroom', position: [-0.5, 0, 3.5], size: { width: 5, depth: 3 } },
        { type: 'kitchen', position: [-3.5, 0, -1], size: { width: 1.5, depth: 3 } },
        { type: 'bathroom', position: [-3.5, 0, 2.5], size: { width: 1.5, depth: 2 } }
      ]
    },
    65: {
      totalWidth: 8,
      totalDepth: 8.5,
      rooms: [
        { type: 'living', position: [0, 0, 0], size: { width: 5.5, depth: 4.5 } },
        { type: 'bedroom', position: [0, 0, 4], size: { width: 3.5, depth: 3.5 } },
        { type: 'bedroom', position: [-4, 0, 4], size: { width: 3, depth: 3.5 } },
        { type: 'kitchen', position: [-4, 0, -0.5], size: { width: 2, depth: 3 } },
        { type: 'bathroom', position: [-4, 0, 2.5], size: { width: 2, depth: 2 } }
      ]
    },
    80: {
      totalWidth: 9,
      totalDepth: 9.5,
      rooms: [
        { type: 'living', position: [0.5, 0, -0.5], size: { width: 6, depth: 4.5 } },
        { type: 'dining', position: [0.5, 0, 3], size: { width: 3.5, depth: 2.5 } },
        { type: 'bedroom', position: [0.5, 0, 6], size: { width: 3.5, depth: 3 } },
        { type: 'bedroom', position: [-4.5, 0, 5], size: { width: 3, depth: 3.5 } },
        { type: 'kitchen', position: [-4.5, 0, 0.5], size: { width: 2, depth: 3.5 } },
        { type: 'bathroom', position: [-4.5, 0, 3.5], size: { width: 2, depth: 2 } }
      ]
    },
    95: {
      totalWidth: 10,
      totalDepth: 10.5,
      rooms: [
        { type: 'living', position: [1, 0, -0.5], size: { width: 6.5, depth: 5 } },
        { type: 'bedroom', position: [1, 0, 4.5], size: { width: 4, depth: 3.5 } },
        { type: 'bedroom', position: [-4.5, 0, 5.5], size: { width: 3, depth: 3.5 } },
        { type: 'bedroom', position: [-4.5, 0, 1.5], size: { width: 3, depth: 3 } },
        { type: 'kitchen', position: [-4.5, 0, -2], size: { width: 2, depth: 3 } },
        { type: 'bathroom', position: [4.5, 0, 4.5], size: { width: 2, depth: 2.5 } }
      ]
    }
  };

  return { ...configs[area] || configs[50], wallHeight };
}

function HouseInterior({ houseId }: { houseId: string }) {
  const house = useHouseStore((state) => state.getHouseById(houseId));
  const groupRef = useRef<Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });

  const layoutConfig = useMemo(() => {
    if (!house) return getLayoutConfig(50);
    return getLayoutConfig(house.area);
  }, [house]);

  if (!house) return null;

  const { rooms, totalWidth, totalDepth, wallHeight } = layoutConfig;
  const halfWidth = totalWidth / 2;
  const halfDepth = totalDepth / 2;
  const wallThickness = 0.2;

  const furnitureByRoom = (room: RoomConfig) => {
    const basePos: [number, number, number] = [room.position[0], 0, room.position[2]];
    switch (room.type) {
      case 'living':
        return (
          <>
            <Sofa position={[basePos[0], 0, basePos[2] + room.size.depth / 2 - 1]} />
            <Table
              position={[basePos[0], 0.3, basePos[2]]}
              size={[1.5, 0.6, 0.8]}
            />
            <Chair position={[basePos[0] - 0.8, 0, basePos[2] + 0.6]} />
            <Chair position={[basePos[0] + 0.8, 0, basePos[2] + 0.6]} />
          </>
        );
      case 'bedroom':
        return (
          <>
            <Bed position={[basePos[0], 0, basePos[2] + room.size.depth / 4]} />
            <Table
              position={[basePos[0] + room.size.width / 2 - 0.8, 0.4, basePos[2] - room.size.depth / 2 + 0.8]}
              size={[0.6, 0.5, 0.5]}
            />
          </>
        );
      case 'kitchen':
        return (
          <KitchenCabinet position={[basePos[0], 0, basePos[2]]} />
        );
      case 'bathroom':
        return (
          <BathroomFixture position={[basePos[0], 0, basePos[2]]} />
        );
      case 'dining':
        return (
          <>
            <Table
              position={[basePos[0], 0.3, basePos[2]]}
              size={[1.4, 0.6, 1.4]}
            />
            <Chair position={[basePos[0], 0, basePos[2] - 0.9]} />
            <Chair position={[basePos[0], 0, basePos[2] + 0.9]} />
            <Chair position={[basePos[0] - 0.7, 0, basePos[2]]} />
            <Chair position={[basePos[0] + 0.7, 0, basePos[2]]} />
          </>
        );
      default:
        return null;
    }
  };

  let bedroomCount = 0;

  return (
    <group ref={groupRef}>
      <Floor
        position={[0, -0.05, 0]}
        size={[totalWidth, totalDepth, 0.1]}
        color="#e2e8f0"
      />

      {rooms.map((room, index) => {
        const color = room.type === 'bedroom'
          ? (bedroomCount++ === 0 ? '#3b82f6' : '#6366f1')
          : roomColors[room.type as keyof typeof roomColors];
        return (
          <group key={index}>
            <Floor
              position={[room.position[0], 0.01, room.position[2]]}
              size={[room.size.width, room.size.depth, 0.02]}
              color={color}
            />
            <RoomLabel
              type={room.type}
              position={[room.position[0], wallHeight - 0.3, room.position[2]]}
            />
            {furnitureByRoom(room)}
          </group>
        );
      })}

      <Wall
        position={[0, wallHeight / 2, halfDepth]}
        size={[totalWidth + wallThickness * 2, wallHeight, wallThickness]}
      />
      <Wall
        position={[0, wallHeight / 2, -halfDepth]}
        size={[totalWidth + wallThickness * 2, wallHeight, wallThickness]}
      />
      <Wall
        position={[halfWidth, wallHeight / 2, 0]}
        size={[wallThickness, wallHeight, totalDepth]}
      />
      <Wall
        position={[-halfWidth, wallHeight / 2, 0]}
        size={[wallThickness, wallHeight, totalDepth]}
      />

      <mesh position={[0, wallHeight + 0.1, 0]} receiveShadow>
        <boxGeometry args={[totalWidth + 0.4, 0.2, totalDepth + 0.4]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>

      <ambientLight intensity={0.6} />
      <directionalLight
        position={[5, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <pointLight position={[0, wallHeight - 0.5, 0]} intensity={0.5} color="#fef3c7" />
    </group>
  );
}

function SceneContent({ houseId }: { houseId: string }) {
  const house = useHouseStore((state) => state.getHouseById(houseId));

  if (!house) return null;

  return (
    <>
      <HouseInterior houseId={houseId} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>

      <gridHelper args={[40, 20, '#1e293b', '#0f172a']} position={[0, 0.01, 0]} />

      <Effects />
    </>
  );
}

function HouseScene({ houseId }: HouseSceneProps) {
  const { selectHouse } = useSceneStore();

  return (
    <Canvas
      shadows
      camera={{ position: [10, 12, 12], fov: 50, near: 0.1, far: 200 }}
      gl={{ antialias: true }}
      style={{ background: '#0f172a' }}
    >
      <SceneContent houseId={houseId} />
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        minDistance={8}
        maxDistance={40}
        maxPolarAngle={Math.PI / 2}
        minPolarAngle={Math.PI / 6}
        onPointerMissed={() => selectHouse(null)}
      />
    </Canvas>
  );
}

export default HouseScene;
