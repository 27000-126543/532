import { create } from 'zustand';
import type { Building, House, Tenant, AccessRecord, RepairOrder } from '@/types';
import buildings from '@/data/buildings';
import houses from '@/data/houses';
import tenants from '@/data/tenants';
import accessRecords from '@/data/accessRecords';
import repairOrders from '@/data/repairOrders';

interface HouseState {
  buildings: Building[];
  houses: House[];
  tenants: Tenant[];
  accessRecords: AccessRecord[];
  repairOrders: RepairOrder[];
  getBuildingById: (id: string) => Building | undefined;
  getHouseById: (id: string) => House | undefined;
  getTenantByHouseId: (houseId: string) => Tenant | undefined;
  getTenantById: (id: string) => Tenant | undefined;
  getAccessRecordsByHouseId: (houseId: string) => AccessRecord[];
  getRepairOrdersByHouseId: (houseId: string) => RepairOrder[];
  getHousesByBuildingId: (buildingId: string) => House[];
  getBuildingsByDistrict: (district: string) => Building[];
}

const useHouseStore = create<HouseState>((_, get) => ({
  buildings,
  houses,
  tenants,
  accessRecords,
  repairOrders,

  getBuildingById: (id) => get().buildings.find((b) => b.id === id),

  getHouseById: (id) => get().houses.find((h) => h.id === id),

  getTenantByHouseId: (houseId) => get().tenants.find((t) => t.houseId === houseId),

  getTenantById: (id) => get().tenants.find((t) => t.id === id),

  getAccessRecordsByHouseId: (houseId) =>
    get().accessRecords.filter((r) => r.houseId === houseId),

  getRepairOrdersByHouseId: (houseId) =>
    get().repairOrders.filter((r) => r.houseId === houseId),

  getHousesByBuildingId: (buildingId) =>
    get().houses.filter((h) => h.buildingId === buildingId),

  getBuildingsByDistrict: (district) =>
    get().buildings.filter((b) => b.district === district)
}));

export default useHouseStore;
