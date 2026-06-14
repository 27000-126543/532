import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, MeshStandardMaterial, Color } from 'three';
import { Html } from '@react-three/drei';
import type { House } from '@/types';

const statusColors: Record<string, string> = {
  normal: '#1E54B7',
  vacant_warning: '#F59E0B',
  sublet_warning: '#EF4444',
  available: '#34D399',
  overdue_rent: '#F97316',
};

const statusNames: Record<string, string> = {
  normal: '正常',
  vacant_warning: '空置预警',
  sublet_warning: '转租预警',
  available: '可出租',
  overdue_rent: '逾期未缴',
};

interface HouseUnitProps {
  house: House;
  position: [number, number, number];
  isSelected: boolean;
  onClick: (house: House) => void;
  showLabel?: boolean;
}

export function HouseUnit({ house, position, isSelected, onClick, showLabel = false }: HouseUnitProps) {
  const meshRef = useRef<Mesh>(null);
  const materialRef = useRef<MeshStandardMaterial>(null);
  const [hovered, setHovered] = useState(false);

  const color = statusColors[house.status] || statusColors.normal;
  const isWarning = house.status !== 'normal' && house.status !== 'available';

  useFrame((state) => {
    if (materialRef.current && isWarning) {
      const time = state.clock.getElapsedTime();
      const flicker = (Math.sin(time * 4) + 1) / 2;
      materialRef.current.opacity = 0.6 + flicker * 0.4;
      materialRef.current.emissiveIntensity = 0.2 + flicker * 0.6;
    }

    if (meshRef.current) {
      const targetScale = hovered || isSelected ? 1.05 : 1;
      meshRef.current.scale.x = meshRef.current.scale.x + (targetScale - meshRef.current.scale.x) * 0.1;
      meshRef.current.scale.y = meshRef.current.scale.y + (targetScale - meshRef.current.scale.y) * 0.1;
      meshRef.current.scale.z = meshRef.current.scale.z + (targetScale - meshRef.current.scale.z) * 0.1;
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onClick(house);
        }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[2, 1.2, 3]} />
        <meshStandardMaterial
          ref={materialRef}
          color={color}
          emissive={new Color(color)}
          emissiveIntensity={isWarning ? 0.3 : 0.1}
          transparent
          opacity={isWarning ? 0.8 : 0.9}
          metalness={0.2}
          roughness={0.8}
        />
      </mesh>

      {(isSelected || hovered || showLabel) && (
        <Html
          position={[0, 1.5, 0]}
          center
          distanceFactor={8}
          zIndexRange={[100, 0]}
          style={{ pointerEvents: 'none' }}
        >
          <div className="bg-bg-glass backdrop-blur-sm border border-brand-500/50 rounded-lg px-3 py-2 whitespace-nowrap">
            <div className="text-white font-bold text-sm">{house.roomNumber}</div>
            <div className="text-xs" style={{ color }}>{statusNames[house.status] || '未知'}</div>
            <div className="text-gray-400 text-xs">{house.area}㎡ · {house.layout}</div>
          </div>
        </Html>
      )}

      {(isSelected || hovered) && (
        <mesh position={[0, -0.65, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.2, 1.5, 32]} />
          <meshBasicMaterial color={color} transparent opacity={0.6} side={2} />
        </mesh>
      )}
    </group>
  );
}
