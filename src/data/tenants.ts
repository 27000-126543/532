import type { Tenant } from '@/types';
import houses from './houses';

const surnames = ['张', '王', '李', '赵', '刘', '陈', '杨', '黄', '周', '吴', '徐', '孙', '胡', '朱', '高', '林', '何', '郭', '马', '罗'];
const givenNames = ['伟', '芳', '娜', '秀英', '敏', '静', '丽', '强', '磊', '军', '洋', '勇', '艳', '杰', '娟', '涛', '明', '超', '秀兰', '霞', '平', '刚', '桂英', '玉兰', '丽华', '建华', '文', '志远', '晓东', '小红', '建国', '建军', '晓红', '海燕', '志强', '春梅', '雪莲', '文博', '雅婷', '浩然'];

function generateChineseName(seed: number): string {
  const surname = surnames[seed % surnames.length];
  const givenName = givenNames[(seed * 7) % givenNames.length];
  return surname + givenName;
}

function generateIdCard(seed: number): string {
  const areaCode = '110105';
  const year = 1970 + (seed % 40);
  const month = String(((seed % 12) + 1)).padStart(2, '0');
  const day = String(((seed % 28) + 1)).padStart(2, '0');
  const seq = String(1000 + (seed % 9000)).slice(1);
  const checkCode = (seed % 10).toString();
  return `${areaCode}${year}${month}${day}${seq}${checkCode}`;
}

function generatePhone(seed: number): string {
  return `139${String(10000000 + ((seed * 137) % 89999999)).slice(0, 8)}`;
}

const buildingHouseMap: Record<string, { houses: typeof houses; index: number }> = {};
houses.forEach(h => {
  if (!buildingHouseMap[h.buildingId]) {
    buildingHouseMap[h.buildingId] = { houses: [], index: 0 };
  }
  buildingHouseMap[h.buildingId].houses.push(h);
});

const tenants: Tenant[] = [];
let seedCounter = 0;

Object.keys(buildingHouseMap).forEach(buildingId => {
  const buildingData = buildingHouseMap[buildingId];
  buildingData.houses.forEach(house => {
    if (house.status !== 'available' && house.tenantId) {
      seedCounter++;
      const seed = seedCounter;
      const name = generateChineseName(seed);
      const familyMembers = (seed % 5) + 1;
      const monthlyIncome = 3000 + ((seed * 211) % 9001);
      const subsidyRatio = 0.1 + ((seed * 0.07) % 0.41);
      const actualRent = Math.floor(house.monthlyRent * (1 - subsidyRatio));
      const startYear = 2023 + (seed % 2);
      const startMonth = (seed % 12) + 1;
      const endYear = startYear + 2;
      const applyYear = startYear;
      const applyMonth = Math.max(1, startMonth - 1);

      tenants.push({
        id: house.tenantId,
        houseId: house.id,
        buildingId,
        name,
        idCard: generateIdCard(seed),
        phone: generatePhone(seed),
        familyMembers,
        monthlyIncome,
        subsidyRatio: Math.round(subsidyRatio * 100) / 100,
        actualRent,
        leaseStart: `${startYear}-${String(startMonth).padStart(2, '0')}-01`,
        leaseEnd: `${endYear}-${String(startMonth).padStart(2, '0')}-01`,
        emergencyContact: generateChineseName(seed + 100),
        emergencyPhone: generatePhone(seed + 100),
        applyDate: `${applyYear}-${String(applyMonth).padStart(2, '0')}-15`
      });
    }
  });
});

export default tenants;
