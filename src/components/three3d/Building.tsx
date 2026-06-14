import { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, InstancedMesh, MeshStandardMaterial, Vector3, Matrix4 } from 'three';
import type { Building as BuildingType } from '@/types';
import useHouseStore from '@/store/useHouseStore';

const statusColors: Record<string, string> = {
  normal: '#1E54B7',
  vacant_warning: '#F59E0B',
  sublet_warning: '#EF4444',
  available: '#34D399',
  overdue_rent: '#F97316',
};

interface BuildingProps {
  building: BuildingType;
  position: [number, number, number];
  isSelected: boolean;
  onClick: (building: BuildingType) => void;
}

export function Building({ building, position, isSelected, onClick }: BuildingProps) {
  const meshRef = useRef<Mesh>(null);
  const windowsRef = useRef<InstancedMesh>(null);
  const materialRef = useRef<MeshStandardMaterial>(null);
  const [hovered, setHovered] = useState(false);

  const houses = useHouseStore((state) => state.houses);
  const buildingHouses = houses.filter((h) => h.buildingId === building.id);

  const buildingStatus = useMemo(() => {
    const statuses = buildingHouses.map((h) => h.status);
    if (statuses.includes('sublet_warning')) return 'sublet_warning';
    if (statuses.includes('overdue_rent')) return 'overdue_rent';
    if (statuses.includes('vacant_warning')) return 'vacant_warning';
    if (statuses.includes('available')) return 'available';
    return 'normal';
  }, [buildingHouses]);

  const isWarning = buildingStatus !== 'normal' && buildingStatus !== 'available';
  const borderColor = statusColors[buildingStatus] || statusColors.normal;

  const buildingHeight = building.floors * 1.5;
  const buildingWidth = 8;
  const buildingDepth = 6;

  const windowPositions = useMemo(() => {
    const positions: [number, number, number][] = [];

    for (let floor = 0; floor < building.floors; floor++) {
      for (let col = 0; col < 3; col++) {
        const x = -2.5 + col * 2.5;
        const y = 0.75 + floor * 1.5 - buildingHeight / 2;
        const zFront = buildingDepth / 2 + 0.01;
        const zBack = -buildingDepth / 2 - 0.01;
        positions.push([x, y, zFront]);
        positions.push([x, y, zBack]);
      }
      for (let row = 0; row < 2; row++) {
        const z = -1.5 + row * 3;
        const y = 0.75 + floor * 1.5 - buildingHeight / 2;
        const xLeft = -buildingWidth / 2 - 0.01;
        const xRight = buildingWidth / 2 + 0.01;
        positions.push([xLeft, y, z]);
        positions.push([xRight, y, z]);
      }
    }

    return positions;
  }, [building.floors, buildingDepth, buildingWidth, buildingHeight]);

  useEffect(() => {
    if (!windowsRef.current) return;
    const matrix = new Matrix4();
    windowPositions.forEach((pos, i) => {
      matrix.setPosition(pos[0], pos[1], pos[2]);
      windowsRef.current!.setMatrixAt(i, matrix);
    });
    windowsRef.current.instanceMatrix.needsUpdate = true;
  }, [windowPositions]);

  useFrame((state) => {
    if (materialRef.current && isWarning) {
      const time = state.clock.getElapsedTime();
      const pulse = 0.3 + Math.sin(time * 2) * 0.3;
      materialRef.current.emissiveIntensity = pulse;
    }

    if (meshRef.current) {
      const targetScale = hovered || isSelected ? 1.05 : 1;
      meshRef.current.scale.lerp(new Vector3(targetScale, targetScale, targetScale), 0.1);
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onClick(building);
        }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[buildingWidth, buildingHeight, buildingDepth]} />
        <meshStandardMaterial
          ref={materialRef}
          color="#1a2a4a"
          metalness={0.3}
          roughness={0.7}
          emissive={borderColor}
          emissiveIntensity={isWarning ? 0.3 : 0.1}
        />
      </mesh>

      <instancedMesh
        ref={windowsRef}
        args={[undefined, undefined, windowPositions.length]}
        onClick={(e) => {
          e.stopPropagation();
          onClick(building);
        }}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry args={[1.5, 1, 0.05]} />
        <meshStandardMaterial
          color={borderColor}
          emissive={borderColor}
          emissiveIntensity={0.5}
          transparent
          opacity={0.8}
        />
      </instancedMesh>

      {(isSelected || hovered) && (
        <mesh position={[0, -buildingHeight / 2 + 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[buildingWidth / 2 + 0.5, buildingWidth / 2 + 1, 32]} />
          <meshBasicMaterial color={borderColor} transparent opacity={0.6} side={2} />
        </mesh>
      )}
    </group>
  );
}
