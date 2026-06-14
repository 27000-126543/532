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

const missingHistories = [
  {
    missingItems: ['2024年度收入证明', '2025年上半年银行流水'],
    missingPeriod: '约12个月',
    impactItems: ['收入变化趋势判断', '补贴比例调整依据']
  },
  {
    missingItems: ['上次审批通过文件', '历史租金缴纳记录'],
    missingPeriod: '约6个月',
    impactItems: ['租金变化对比', '补贴历史追溯']
  },
  {
    missingItems: ['家庭人口变更证明', '收入变动说明材料'],
    missingPeriod: '约3个月',
    impactItems: ['保障资格确认', '补贴档位核定']
  }
];

const approvals: Approval[] = [];

const tenantApplProfiles = [
  { tenantIdx: 0, applications: 4, trend: 'up' as const, startIncome: 3200 },
  { tenantIdx: 1, applications: 3, trend: 'down' as const, startIncome: 7800 },
  { tenantIdx: 2, applications: 2, trend: 'stable' as const, startIncome: 5500 },
  { tenantIdx: 3, applications: 5, trend: 'up' as const, startIncome: 2800 },
  { tenantIdx: 4, applications: 2, trend: 'down' as const, startIncome: 6200 },
  { tenantIdx: 5, applications: 1, trend: 'up' as const, startIncome: 4500, missingHistory: true },
  { tenantIdx: 6, applications: 3, trend: 'stable' as const, startIncome: 4100 },
  { tenantIdx: 7, applications: 2, trend: 'up' as const, startIncome: 3800, missingHistory: true },
  { tenantIdx: 8, applications: 4, trend: 'down' as const, startIncome: 8500 },
  { tenantIdx: 9, applications: 1, trend: 'stable' as const, startIncome: 5000, missingHistory: true }
];

let approvalCounter = 0;

tenantApplProfiles.forEach(profile => {
  const tenant = tenants[profile.tenantIdx % tenants.length];
  const house = houses.find(h => h.id === tenant.houseId) || houses[0];

  let currentIncome = profile.startIncome;
  let currentSubsidyRatio = 0.3;
  let previousSubsidyRatio = 0.25;

  for (let i = 0; i < profile.applications; i++) {
    const isLatest = i === profile.applications - 1;
    const hasHistory = i > 0 && !profile.missingHistory;
    const isHighRisk = !hasHistory || Math.abs(currentIncome - (profile.startIncome * (profile.trend === 'up' ? 1 + i * 0.1 : profile.trend === 'down' ? 1 - i * 0.1 : 1))) > 1000;

    const incomeChange = profile.trend === 'up'
      ? currentIncome * (0.08 + (i * 0.03))
      : profile.trend === 'down'
        ? -currentIncome * (0.06 + (i * 0.02))
        : currentIncome * 0.02 * (i % 2 === 0 ? 1 : -1);

    const newIncome = Math.round(currentIncome + incomeChange);
    const incomeChangePercent = ((newIncome - currentIncome) / currentIncome) * 100;

    const incomeTrend = Math.abs(incomeChangePercent) < 3 ? 'stable' : incomeChangePercent > 0 ? 'up' : 'down';

    const newSubsidyRatio = Math.max(0.05, Math.min(0.6,
      currentSubsidyRatio + (incomeChangePercent > 0 ? -0.03 : 0.04) * (i + 1)
    ));

    const applyAmount = Math.round(house.monthlyRent * newSubsidyRatio);
    const suggestedRent = Math.max(0, house.monthlyRent - applyAmount);

    const statuses: Approval['status'][] = ['completed', 'completed', 'completed', 'pending'];
    const stages: Approval['currentStage'][] = ['street', 'district', 'city', 'city'];
    const status = isLatest ? (i % 3 === 0 ? 'pending' : statuses[(approvalCounter + i) % statuses.length]) : 'completed';
    const currentStage = isLatest
      ? (status === 'pending' ? stages[(approvalCounter + i) % 3] : 'city')
      : 'city';

    const applyDate = new Date(2026, 1, 1 + (approvalCounter * 5) + i * 28);
    applyDate.setDate(applyDate.getDate() + i * 30);

    const approval: Approval = {
      id: `AP${String(approvalCounter + 1).padStart(5, '0')}`,
      tenantId: tenant.id,
      tenantName: tenant.name,
      houseId: tenant.houseId,
      buildingName: house.buildingName,
      roomNumber: house.roomNumber,
      applyType: '租金补贴调整',
      applyAmount,
      approvedAmount: status === 'rejected' ? 0 : Math.floor(applyAmount * (0.85 + (i % 3) * 0.05)),
      subsidyRatio: Math.round(newSubsidyRatio * 100) / 100,
      previousSubsidyRatio: Math.round(currentSubsidyRatio * 100) / 100,
      originalIncome: hasHistory ? currentIncome : undefined,
      currentIncome: newIncome,
      incomeChangePercent: Math.round(incomeChangePercent * 10) / 10,
      incomeTrend: hasHistory ? incomeTrend : 'unknown',
      previousRent: house.monthlyRent - Math.round(house.monthlyRent * currentSubsidyRatio),
      suggestedRent,
      rentChangeAmount: Math.round(suggestedRent - (house.monthlyRent - Math.round(house.monthlyRent * currentSubsidyRatio))),
      hasHistoryBasis: hasHistory,
      missingHistoryInfo: !hasHistory ? missingHistories[approvalCounter % missingHistories.length] : undefined,
      isHighRisk,
      highRiskReasons: [
        ...(!hasHistory ? ['历史资料不完整'] : []),
        ...(Math.abs(incomeChangePercent) > 15 ? ['收入波动异常大'] : [])
      ],
      currentStage,
      status,
      applyDate: applyDate.toISOString().split('T')[0],
      submitter: tenant.name,
      submitTime: applyDate.toISOString()
    };

    if (status !== 'pending' || currentStage !== 'street') {
      const streetDate = new Date(applyDate);
      streetDate.setDate(applyDate.getDate() + 2 + (i % 3));
      approval.streetApprover = streetApprovers[(approvalCounter + i) % streetApprovers.length];
      approval.streetApproveTime = streetDate.toISOString();
      approval.streetOpinion = status === 'rejected' && currentStage === 'street'
        ? opinions.rejected[(approvalCounter + i) % opinions.rejected.length]
        : opinions.approved[(approvalCounter + i) % opinions.approved.length];
    } else if (status === 'pending') {
      approval.streetOpinion = opinions.pending[(approvalCounter + i) % opinions.pending.length];
    }

    if ((currentStage === 'district' || currentStage === 'city') && status !== 'pending') {
      const districtDate = new Date(approval.streetApproveTime!);
      districtDate.setDate(new Date(approval.streetApproveTime!).getDate() + 3 + (i % 4));
      approval.districtApprover = districtApprovers[(approvalCounter + i) % districtApprovers.length];
      approval.districtApproveTime = districtDate.toISOString();
      approval.districtOpinion = status === 'rejected' && currentStage === 'district'
        ? opinions.rejected[(approvalCounter + i) % opinions.rejected.length]
        : opinions.approved[(approvalCounter + i) % opinions.approved.length];
    } else if (currentStage === 'district' && status === 'pending') {
      approval.districtOpinion = opinions.pending[(approvalCounter + i) % opinions.pending.length];
    }

    if (currentStage === 'city' && status !== 'pending') {
      const cityDate = new Date(approval.districtApproveTime!);
      cityDate.setDate(new Date(approval.districtApproveTime!).getDate() + 5 + (i % 5));
      approval.cityApprover = cityApprovers[(approvalCounter + i) % cityApprovers.length];
      approval.cityApproveTime = cityDate.toISOString();
      approval.cityOpinion = status === 'rejected'
        ? opinions.rejected[(approvalCounter + i) % opinions.rejected.length]
        : opinions.approved[(approvalCounter + i) % opinions.approved.length];
    } else if (currentStage === 'city' && status === 'pending') {
      approval.cityOpinion = opinions.pending[(approvalCounter + i) % opinions.pending.length];
    }

    if (status === 'completed') {
      approval.remark = '补贴调整已生效，从下月起执行';
    } else if (status === 'rejected') {
      approval.remark = '审批未通过，请补充材料后重新申请';
    }

    approvals.push(approval);
    approvalCounter++;

    currentIncome = newIncome;
    previousSubsidyRatio = currentSubsidyRatio;
    currentSubsidyRatio = newSubsidyRatio;
  }
});

approvals.sort((a, b) => new Date(b.applyDate).getTime() - new Date(a.applyDate).getTime());

export default approvals;
