import type { RepairOrder, RepairType, RepairStatus } from '@/types';
import houses from './houses';
import tenants from './tenants';

const repairTypes: RepairType[] = ['water', 'electricity', 'gas', 'doors_windows', 'appliance'];
const repairTypeNames: Record<RepairType, string> = {
  water: '水电维修',
  electricity: '电路维修',
  gas: '燃气维修',
  doors_windows: '门窗维修',
  appliance: '家电维修'
};

const repairTitles: Record<RepairType, string[]> = {
  water: ['水龙头漏水', '下水道堵塞', '水管爆裂', '热水器故障', '水表异常'],
  electricity: ['灯泡不亮', '插座没电', '空气开关跳闸', '线路老化', '电表异常'],
  gas: ['燃气泄漏', '燃气灶打不着', '热水器故障', '燃气表异常', '管道漏气'],
  doors_windows: ['门锁损坏', '窗户关不严', '门把手松动', '纱窗破损', '铰链生锈'],
  appliance: ['冰箱不制冷', '洗衣机不转', '空调不制冷', '油烟机故障', '微波炉不加热']
};

const statuses: RepairStatus[] = ['pending', 'assigned', 'in_progress', 'completed', 'escalated'];
const priorities: RepairOrder['priority'][] = ['low', 'medium', 'high', 'urgent'];
const assignees = ['李师傅', '王师傅', '张师傅', '赵师傅', '刘师傅'];

function generateRepairOrder(seed: number, houseId: string): RepairOrder {
  const house = houses.find(h => h.id === houseId) || houses[0];
  const tenant = tenants.find(t => t.houseId === houseId);
  const type = repairTypes[seed % repairTypes.length];
  const titles = repairTitles[type];
  const title = titles[seed % titles.length];
  const status = statuses[seed % statuses.length];
  const priority = priorities[seed % priorities.length];
  const reportDaysAgo = seed % 30;
  const reportTime = new Date();
  reportTime.setDate(reportTime.getDate() - reportDaysAgo);
  reportTime.setHours(9 + (seed % 8), (seed * 7) % 60, 0, 0);

  const order: RepairOrder = {
    id: `RO${String(seed + 1).padStart(5, '0')}`,
    houseId,
    buildingId: house.buildingId,
    buildingName: house.buildingName,
    roomNumber: house.roomNumber,
    tenantId: tenant?.id,
    tenantName: tenant?.name || '未知住户',
    tenantPhone: tenant?.phone || '13800000000',
    type,
    typeName: repairTypeNames[type],
    title,
    description: `${title}，请尽快安排维修。`,
    status,
    priority,
    reportTime: reportTime.toISOString()
  };

  if (status !== 'pending') {
    order.assignedTime = new Date(reportTime.getTime() + 3600000 * (1 + (seed % 24))).toISOString();
    order.assignee = assignees[seed % assignees.length];
    order.assigneePhone = `139${String(10000000 + ((seed * 137) % 89999999)).slice(0, 8)}`;
  }

  if (status === 'in_progress' || status === 'completed') {
    order.startTime = new Date(reportTime.getTime() + 3600000 * (2 + (seed % 48))).toISOString();
  }

  if (status === 'completed') {
    order.completedTime = new Date(reportTime.getTime() + 3600000 * (24 + (seed % 72))).toISOString();
    order.cost = 50 + (seed * 17) % 450;
    order.rating = 3 + (seed % 3);
    order.feedback = order.rating >= 4 ? '维修及时，服务很好！' : '维修一般，还需改进。';
  }

  return order;
}

const repairOrders: RepairOrder[] = [];
let seed = 0;

const occupiedHouses = houses.filter(h => h.status !== 'available');
for (let i = 0; i < 40 && i < occupiedHouses.length; i++) {
  repairOrders.push(generateRepairOrder(seed++, occupiedHouses[i].id));
  if (i % 3 === 0) {
    repairOrders.push(generateRepairOrder(seed++, occupiedHouses[i].id));
  }
}

repairOrders.sort((a, b) => new Date(b.reportTime).getTime() - new Date(a.reportTime).getTime());

export default repairOrders;
