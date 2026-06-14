import type { AccessRecord } from '@/types';
import buildings from './buildings';
import tenants from './tenants';

const nonTenantNames = ['陌生人A', '快递员小王', '外卖员小李', '维修工赵师傅', '访客陈先生', '中介刘先生', '朋友王先生', '家政张阿姨', '送水师傅', '快递员小孙', '外卖员小周', '访客吴女士'];

function generateTimestamp(hoursAgo: number, minutesAgo: number): string {
  const now = new Date();
  now.setHours(now.getHours() - hoursAgo, now.getMinutes() - minutesAgo, 0, 0);
  return now.toISOString();
}

const accessRecords: AccessRecord[] = [];
let recordId = 1;

for (let i = 0; i < 80; i++) {
  const isTenantRecord = Math.random() > 0.15;
  const building = buildings[i % buildings.length];
  const hoursAgo = Math.floor(i / 4);
  const minutesAgo = (i * 7) % 60;

  if (isTenantRecord && tenants.length > 0) {
    const tenant = tenants[i % tenants.length];
    accessRecords.push({
      id: `AR${String(recordId++).padStart(5, '0')}`,
      buildingId: building.id,
      houseId: tenant.houseId,
      tenantId: tenant.id,
      personName: tenant.name,
      accessType: i % 2 === 0 ? 'in' : 'out',
      timestamp: generateTimestamp(hoursAgo, minutesAgo),
      isMatched: true,
      matchConfidence: 0.9 + (Math.random() * 0.09),
      isTenant: true
    });
  } else {
    const name = nonTenantNames[i % nonTenantNames.length];
    const isMatched = Math.random() > 0.5;
    accessRecords.push({
      id: `AR${String(recordId++).padStart(5, '0')}`,
      buildingId: building.id,
      personName: name,
      accessType: 'in',
      timestamp: generateTimestamp(hoursAgo, minutesAgo),
      isMatched,
      matchConfidence: isMatched ? 0.5 + Math.random() * 0.3 : Math.random() * 0.4,
      isTenant: false,
      remark: isMatched ? '疑似转租，非住户匹配成功' : '陌生人未通过验证'
    });
  }
}

for (let i = 0; i < 15; i++) {
  const building = buildings[i % buildings.length];
  const tenant = tenants[(i * 5) % tenants.length];
  const hoursAgo = (i * 2) % 24;
  const minutesAgo = (i * 13) % 60;
  const nonTenantName = nonTenantNames[(i + 3) % nonTenantNames.length];

  accessRecords.push({
    id: `AR${String(recordId++).padStart(5, '0')}`,
    buildingId: building.id,
    houseId: tenant.houseId,
    tenantId: tenant.id,
    personName: nonTenantName,
    accessType: 'in',
    timestamp: generateTimestamp(hoursAgo, minutesAgo),
    isMatched: true,
    matchConfidence: 0.7 + Math.random() * 0.2,
    isTenant: false,
    remark: `转租预警：${tenant.name}房屋频繁出现非住户刷脸`
  });
}

accessRecords.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

export default accessRecords;
