import type { Approval } from '@/types';
import tenants from './tenants';
import houses from './houses';

const streetApprovers = ['和平街道办-王主任', '和平街道办-李副主任', '和平街道办-张科长'];
const districtApprovers = ['朝阳区住建委-刘主任', '朝阳区住建委-陈副主任', '朝阳区住建委-赵科长'];
const cityApprovers = ['北京市住建委-周主任', '北京市住建委-吴副主任', '北京市住建委-郑科长'];

const opinions = {
  approved: ['情况属实，同意上报', '材料齐全，符合条件，同意', '审核通过，建议批准', '符合补贴政策，同意'],
  rejected: ['收入超标，不符合条件', '材料不全，退回补充', '租赁信息不符，驳回', '家庭人口信息有误，不予通过'],
  pending: ['待审核', '审核中', '材料已接收，正在核实']
};

const approvals: Approval[] = [];

for (let i = 0; i < 10; i++) {
  const tenant = tenants[i % tenants.length];
  const house = houses.find(h => h.id === tenant.houseId) || houses[0];
  const statuses: Approval['status'][] = ['pending', 'approved', 'approved', 'rejected', 'completed', 'pending', 'approved', 'completed', 'rejected', 'completed'];
  const stages: Approval['currentStage'][] = ['street', 'street', 'district', 'street', 'city', 'street', 'district', 'city', 'district', 'city'];
  const status = statuses[i];
  const currentStage = stages[i];
  
  const applyAmount = 200 + (i * 73) % 600;
  const subsidyRatio = 0.1 + ((i * 0.05) % 0.4);
  const approvedAmount = status === 'rejected' ? 0 : Math.floor(applyAmount * (0.8 + (i % 3) * 0.1));
  
  const applyDate = new Date(2026, 4, 1 + (i * 3) % 28);
  
  const approval: Approval = {
    id: `AP${String(i + 1).padStart(5, '0')}`,
    tenantId: tenant.id,
    tenantName: tenant.name,
    houseId: tenant.houseId,
    buildingName: house.buildingName,
    roomNumber: house.roomNumber,
    applyType: '租金补贴调整',
    applyAmount,
    approvedAmount,
    subsidyRatio: Math.round(subsidyRatio * 100) / 100,
    currentStage,
    status,
    applyDate: applyDate.toISOString().split('T')[0]
  };
  
  if (currentStage !== 'street' || status !== 'pending') {
    const streetDate = new Date(applyDate);
    streetDate.setDate(applyDate.getDate() + 2 + (i % 3));
    approval.streetApprover = streetApprovers[i % streetApprovers.length];
    approval.streetApproveTime = streetDate.toISOString().split('T')[0];
    approval.streetOpinion = status === 'rejected' && currentStage === 'street' 
      ? opinions.rejected[i % opinions.rejected.length]
      : opinions.approved[i % opinions.approved.length];
  } else if (status === 'pending') {
    approval.streetOpinion = opinions.pending[i % opinions.pending.length];
  }
  
  if ((currentStage === 'district' || currentStage === 'city') && status !== 'pending') {
    const districtDate = new Date(approval.streetApproveTime!);
    districtDate.setDate(new Date(approval.streetApproveTime!).getDate() + 3 + (i % 4));
    approval.districtApprover = districtApprovers[i % districtApprovers.length];
    approval.districtApproveTime = districtDate.toISOString().split('T')[0];
    approval.districtOpinion = status === 'rejected' && currentStage === 'district'
      ? opinions.rejected[i % opinions.rejected.length]
      : opinions.approved[i % opinions.approved.length];
  } else if (currentStage === 'district' && status === 'pending') {
    approval.districtOpinion = opinions.pending[i % opinions.pending.length];
  }
  
  if (currentStage === 'city' && status !== 'pending') {
    const cityDate = new Date(approval.districtApproveTime!);
    cityDate.setDate(new Date(approval.districtApproveTime!).getDate() + 5 + (i % 5));
    approval.cityApprover = cityApprovers[i % cityApprovers.length];
    approval.cityApproveTime = cityDate.toISOString().split('T')[0];
    approval.cityOpinion = status === 'rejected'
      ? opinions.rejected[i % opinions.rejected.length]
      : opinions.approved[i % opinions.approved.length];
  } else if (currentStage === 'city' && status === 'pending') {
    approval.cityOpinion = opinions.pending[i % opinions.pending.length];
  }
  
  if (status === 'completed') {
    approval.remark = '补贴调整已生效，从下月起执行';
  } else if (status === 'rejected') {
    approval.remark = '审批未通过，请补充材料后重新申请';
  }
  
  approvals.push(approval);
}

approvals.sort((a, b) => new Date(b.applyDate).getTime() - new Date(a.applyDate).getTime());

export default approvals;
