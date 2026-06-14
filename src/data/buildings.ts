import type { Building } from '@/types';

const buildings: Building[] = [
  {
    id: 'B001',
    name: '和谐家园1号楼',
    district: '朝阳区',
    street: '和平街道',
    floors: 22,
    unitsPerFloor: 4,
    totalUnits: 88,
    position: { x: -15, y: 0, z: -10 },
    lat: 39.9285,
    lng: 116.4478,
    builtYear: 2020,
    propertyManager: '张建国',
    phone: '13800138001'
  },
  {
    id: 'B002',
    name: '和谐家园2号楼',
    district: '朝阳区',
    street: '和平街道',
    floors: 18,
    unitsPerFloor: 4,
    totalUnits: 72,
    position: { x: 0, y: 0, z: -10 },
    lat: 39.9286,
    lng: 116.4492,
    builtYear: 2020,
    propertyManager: '李秀英',
    phone: '13800138002'
  },
  {
    id: 'B003',
    name: '和谐家园3号楼',
    district: '朝阳区',
    street: '和平街道',
    floors: 25,
    unitsPerFloor: 4,
    totalUnits: 100,
    position: { x: 15, y: 0, z: -10 },
    lat: 39.9287,
    lng: 116.4506,
    builtYear: 2021,
    propertyManager: '王志强',
    phone: '13800138003'
  },
  {
    id: 'B004',
    name: '和谐家园4号楼',
    district: '朝阳区',
    street: '和平街道',
    floors: 20,
    unitsPerFloor: 4,
    totalUnits: 80,
    position: { x: -15, y: 0, z: 10 },
    lat: 39.9298,
    lng: 116.4478,
    builtYear: 2021,
    propertyManager: '赵丽华',
    phone: '13800138004'
  },
  {
    id: 'B005',
    name: '和谐家园5号楼',
    district: '朝阳区',
    street: '和平街道',
    floors: 24,
    unitsPerFloor: 4,
    totalUnits: 96,
    position: { x: 0, y: 0, z: 10 },
    lat: 39.9299,
    lng: 116.4492,
    builtYear: 2022,
    propertyManager: '刘明辉',
    phone: '13800138005'
  },
  {
    id: 'B006',
    name: '和谐家园6号楼',
    district: '朝阳区',
    street: '和平街道',
    floors: 21,
    unitsPerFloor: 4,
    totalUnits: 84,
    position: { x: 15, y: 0, z: 10 },
    lat: 39.9300,
    lng: 116.4506,
    builtYear: 2022,
    propertyManager: '陈美玲',
    phone: '13800138006'
  }
];

export default buildings;
