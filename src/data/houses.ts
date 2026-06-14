import type { House } from '@/types';

const areas = [50, 65, 80, 95];
const layouts: Record<number, string> = {
  50: '一室一厅',
  65: '两室一厅',
  80: '两室两厅',
  95: '三室一厅'
};
const statusList: House['status'][] = ['normal', 'normal', 'normal', 'normal', 'normal', 'available', 'vacant_warning', 'sublet_warning', 'overdue_rent'];

function getRentByArea(area: number): number {
  const baseRent: Record<number, [number, number]> = {
    50: [800, 1000],
    65: [1000, 1300],
    80: [1300, 1550],
    95: [1550, 1800]
  };
  const [min, max] = baseRent[area];
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateHousesForBuilding(buildingId: string, buildingName: string, count: number, startFloor: number): House[] {
  const houses: House[] = [];
  let unitIndex = 0;
  for (let i = 0; i < count; i++) {
    const floor = startFloor + Math.floor(i / 4);
    const unitNum = (i % 4) + 1;
    const unit = String.fromCharCode(64 + unitNum);
    const area = areas[i % areas.length];
    const status = statusList[i % statusList.length];
    const monthlyRent = getRentByArea(area);
    const house: House = {
      id: `${buildingId}-${String(floor).padStart(2, '0')}${unit}`,
      buildingId,
      buildingName,
      floor,
      unit,
      roomNumber: `${floor}${unit}`,
      area,
      layout: layouts[area],
      monthlyRent,
      status
    };
    if (status !== 'available') {
      house.tenantId = `T${buildingId.slice(1)}${String(i + 1).padStart(3, '0')}`;
      const checkInYear = 2023 + (i % 3);
      const checkInMonth = (i % 12) + 1;
      house.checkInDate = `${checkInYear}-${String(checkInMonth).padStart(2, '0')}-15`;
      house.lastPaymentDate = `2026-0${(i % 5) + 1}-10`;
    }
    if (status === 'overdue_rent') {
      house.overdueDays = (i % 30) + 15;
    }
    if (status === 'sublet_warning' || status === 'vacant_warning') {
      house.warningCount = (i % 3) + 1;
    }
    houses.push(house);
    unitIndex++;
  }
  return houses;
}

const houses: House[] = [
  ...generateHousesForBuilding('B001', '和谐家园1号楼', 65, 1),
  ...generateHousesForBuilding('B002', '和谐家园2号楼', 52, 1),
  ...generateHousesForBuilding('B003', '和谐家园3号楼', 78, 1),
  ...generateHousesForBuilding('B004', '和谐家园4号楼', 58, 1),
  ...generateHousesForBuilding('B005', '和谐家园5号楼', 72, 1),
  ...generateHousesForBuilding('B006', '和谐家园6号楼', 60, 1)
];

export default houses;
