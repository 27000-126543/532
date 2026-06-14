import { create } from 'zustand';
import type { Warning, WarningType, House, AccessRecord } from '@/types';
import houses from '@/data/houses';
import accessRecords from '@/data/accessRecords';

interface WarningState {
  warnings: Warning[];
  acknowledgedWarnings: Set<string>;
  getWarnings: (type?: WarningType) => Warning[];
  getUnacknowledgedWarnings: (type?: WarningType) => Warning[];
  getWarningsByHouseId: (houseId: string) => Warning[];
  getWarningsByBuildingId: (buildingId: string) => Warning[];
  acknowledgeWarning: (warningId: string, acknowledgedBy: string) => boolean;
  acknowledgeAllWarnings: (acknowledgedBy: string) => number;
  getWarningCount: (type?: WarningType) => number;
  getUnacknowledgedCount: (type?: WarningType) => number;
  refreshWarnings: () => void;
}

function detectVacantWarnings(houseList: House[], records: AccessRecord[]): Warning[] {
  const warnings: Warning[] = [];
  const now = new Date();
  const tenDaysAgo = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);

  const occupiedHouses = houseList.filter((h) => h.status !== 'available' && h.tenantId);

  occupiedHouses.forEach((house) => {
    const houseRecords = records.filter((r) => r.houseId === house.id && r.isTenant);
    const hasRecentAccess = houseRecords.some(
      (r) => new Date(r.timestamp) >= tenDaysAgo
    );

    if (!hasRecentAccess) {
      const lastAccess = houseRecords.length > 0
        ? new Date(Math.max(...houseRecords.map((r) => new Date(r.timestamp).getTime())))
        : null;

      const daysWithoutAccess = lastAccess
        ? Math.floor((now.getTime() - lastAccess.getTime()) / (24 * 60 * 60 * 1000))
        : 10;

      warnings.push({
        id: `WARN-VACANT-${house.id}`,
        type: 'vacant',
        houseId: house.id,
        buildingId: house.buildingId,
        buildingName: house.buildingName,
        roomNumber: house.roomNumber,
        tenantName: house.tenantId ? houseList.find((h) => h.tenantId === house.tenantId)?.tenantId : undefined,
        description: `该房屋已连续${daysWithoutAccess}天无住户进出记录，疑似空置`,
        detectedAt: now.toISOString(),
        acknowledged: false,
        level: daysWithoutAccess >= 20 ? 'high' : daysWithoutAccess >= 15 ? 'medium' : 'low',
        details: {
          daysWithoutAccess,
          lastAccessTime: lastAccess?.toISOString(),
          totalRecords: houseRecords.length
        }
      });
    }
  });

  return warnings;
}

function detectSubletWarnings(houseList: House[], records: AccessRecord[]): Warning[] {
  const warnings: Warning[] = [];
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const occupiedHouses = houseList.filter((h) => h.status !== 'available' && h.tenantId);

  occupiedHouses.forEach((house) => {
    const recentRecords = records.filter(
      (r) =>
        r.houseId === house.id &&
        !r.isTenant &&
        r.isMatched &&
        new Date(r.timestamp) >= thirtyDaysAgo
    );

    const nonTenantAccessCount = recentRecords.length;

    if (nonTenantAccessCount >= 3) {
      const nonTenantNames = [...new Set(recentRecords.map((r) => r.personName))];

      warnings.push({
        id: `WARN-SUBLET-${house.id}`,
        type: 'sublet',
        houseId: house.id,
        buildingId: house.buildingId,
        buildingName: house.buildingName,
        roomNumber: house.roomNumber,
        tenantName: house.tenantId ? houseList.find((h) => h.tenantId === house.tenantId)?.tenantId : undefined,
        description: `该房屋30天内有${nonTenantAccessCount}次非住户刷脸记录，涉及${nonTenantNames.length}个不同人员，疑似转租`,
        detectedAt: now.toISOString(),
        acknowledged: false,
        level: nonTenantAccessCount >= 8 ? 'high' : nonTenantAccessCount >= 5 ? 'medium' : 'low',
        details: {
          nonTenantAccessCount,
          nonTenantNames,
          records: recentRecords.map((r) => ({
            id: r.id,
            personName: r.personName,
            timestamp: r.timestamp,
            matchConfidence: r.matchConfidence
          }))
        }
      });
    }
  });

  return warnings;
}

function generateAllWarnings(): Warning[] {
  const vacantWarnings = detectVacantWarnings(houses, accessRecords);
  const subletWarnings = detectSubletWarnings(houses, accessRecords);
  return [...vacantWarnings, ...subletWarnings].sort(
    (a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime()
  );
}

const useWarningStore = create<WarningState>((set, get) => ({
  warnings: generateAllWarnings(),
  acknowledgedWarnings: new Set<string>(),

  getWarnings: (type) => {
    const { warnings } = get();
    return type ? warnings.filter((w) => w.type === type) : warnings;
  },

  getUnacknowledgedWarnings: (type) => {
    const { warnings, acknowledgedWarnings } = get();
    const filtered = type ? warnings.filter((w) => w.type === type) : warnings;
    return filtered.filter((w) => !acknowledgedWarnings.has(w.id));
  },

  getWarningsByHouseId: (houseId) =>
    get().warnings.filter((w) => w.houseId === houseId),

  getWarningsByBuildingId: (buildingId) =>
    get().warnings.filter((w) => w.buildingId === buildingId),

  acknowledgeWarning: (warningId, acknowledgedBy) => {
    const { warnings, acknowledgedWarnings } = get();
    const warning = warnings.find((w) => w.id === warningId);

    if (!warning || acknowledgedWarnings.has(warningId)) {
      return false;
    }

    const now = new Date().toISOString();
    const updatedWarning = {
      ...warning,
      acknowledged: true,
      acknowledgedAt: now,
      acknowledgedBy
    };

    set((state) => ({
      warnings: state.warnings.map((w) =>
        w.id === warningId ? updatedWarning : w
      ),
      acknowledgedWarnings: new Set([...state.acknowledgedWarnings, warningId])
    }));

    return true;
  },

  acknowledgeAllWarnings: (acknowledgedBy) => {
    const { warnings, acknowledgedWarnings } = get();
    const unacknowledged = warnings.filter((w) => !acknowledgedWarnings.has(w.id));

    if (unacknowledged.length === 0) {
      return 0;
    }

    const now = new Date().toISOString();
    const newAcknowledged = new Set(acknowledgedWarnings);

    const updatedWarnings = warnings.map((w) => {
      if (!w.acknowledged) {
        newAcknowledged.add(w.id);
        return {
          ...w,
          acknowledged: true,
          acknowledgedAt: now,
          acknowledgedBy
        };
      }
      return w;
    });

    set({
      warnings: updatedWarnings,
      acknowledgedWarnings: newAcknowledged
    });

    return unacknowledged.length;
  },

  getWarningCount: (type) => {
    const { warnings } = get();
    return type ? warnings.filter((w) => w.type === type).length : warnings.length;
  },

  getUnacknowledgedCount: (type) => {
    const { warnings, acknowledgedWarnings } = get();
    const filtered = type ? warnings.filter((w) => w.type === type) : warnings;
    return filtered.filter((w) => !acknowledgedWarnings.has(w.id)).length;
  },

  refreshWarnings: () => {
    const { acknowledgedWarnings } = get();
    const newWarnings = generateAllWarnings();

    const updatedWarnings = newWarnings.map((w) => ({
      ...w,
      acknowledged: acknowledgedWarnings.has(w.id)
    }));

    set({ warnings: updatedWarnings });
  }
}));

export default useWarningStore;
