import { create } from 'zustand';
import type { UserRole } from '@/types';

type LogAction =
  | 'face_login'
  | 'role_switch'
  | 'approval_approve'
  | 'approval_reject'
  | 'warning_ack'
  | 'report_export'
  | 'repair_assign'
  | 'repair_escalate';

interface OperationLog {
  id: string;
  action: LogAction;
  operatorId: string;
  operatorName: string;
  operatorRole: UserRole;
  targetId?: string;
  targetName?: string;
  detail: string;
  result: string;
  timestamp: string;
}

interface LogFilter {
  action?: LogAction;
  operatorId?: string;
  startTime?: string;
  endTime?: string;
}

interface OperationLogState {
  logs: OperationLog[];
  addLog: (
    action: LogAction,
    operatorId: string,
    operatorName: string,
    operatorRole: UserRole,
    detail: string,
    result: string,
    targetId?: string,
    targetName?: string
  ) => void;
  getLogs: (filter?: LogFilter) => OperationLog[];
  getRecentLogs: (count: number) => OperationLog[];
  getLogsByOperator: (operatorId: string) => OperationLog[];
}

const operators: { id: string; name: string; role: UserRole }[] = [
  { id: 'U001', name: '张三', role: 'tenant' },
  { id: 'U002', name: '李物业', role: 'property' },
  { id: 'U003', name: '王街道', role: 'staff' },
  { id: 'U004', name: '赵区长', role: 'district_director' },
  { id: 'U005', name: '孙市长', role: 'city_director' }
];

const actionTemplates: {
  action: LogAction;
  detail: string;
  result: string;
  targetId?: string;
  targetName?: string;
  rolePool: UserRole[];
}[] = [
  {
    action: 'face_login',
    detail: '通过人脸识别登录系统',
    result: '成功',
    rolePool: ['tenant', 'property']
  },
  {
    action: 'face_login',
    detail: '人脸识别登录',
    result: '成功',
    rolePool: ['staff', 'district_director']
  },
  {
    action: 'role_switch',
    detail: '切换角色至物业管理员',
    result: '成功',
    rolePool: ['property']
  },
  {
    action: 'role_switch',
    detail: '切换角色至街道工作人员',
    result: '成功',
    rolePool: ['staff']
  },
  {
    action: 'approval_approve',
    detail: '审批通过B001栋保障房申请',
    result: '通过',
    targetId: 'APR003',
    targetName: '保障房申请审批',
    rolePool: ['staff', 'district_director', 'city_director']
  },
  {
    action: 'approval_approve',
    detail: '审批通过租房补贴申请',
    result: '通过',
    targetId: 'APR007',
    targetName: '租房补贴审批',
    rolePool: ['district_director', 'city_director']
  },
  {
    action: 'approval_reject',
    detail: '驳回B002栋保障房申请，材料不齐全',
    result: '驳回',
    targetId: 'APR012',
    targetName: '保障房申请审批',
    rolePool: ['staff', 'district_director']
  },
  {
    action: 'approval_reject',
    detail: '驳回补贴申请，收入超标',
    result: '驳回',
    targetId: 'APR018',
    targetName: '租房补贴审批',
    rolePool: ['district_director']
  },
  {
    action: 'warning_ack',
    detail: '确认空置预警：B003-05B已超30天无出入记录',
    result: '已确认',
    targetId: 'WRN005',
    targetName: '空置预警',
    rolePool: ['property', 'staff']
  },
  {
    action: 'warning_ack',
    detail: '确认转租预警：B001-03A人脸识别异常',
    result: '已确认',
    targetId: 'WRN011',
    targetName: '转租预警',
    rolePool: ['property', 'staff']
  },
  {
    action: 'report_export',
    detail: '导出月度能源消耗报表',
    result: '导出成功',
    rolePool: ['property', 'staff', 'district_director']
  },
  {
    action: 'report_export',
    detail: '导出租户信息统计报表',
    result: '导出成功',
    rolePool: ['staff', 'district_director']
  },
  {
    action: 'repair_assign',
    detail: '派单维修B002-08C水管漏水',
    result: '已派单',
    targetId: 'RPR004',
    targetName: '水管维修',
    rolePool: ['property']
  },
  {
    action: 'repair_assign',
    detail: '派单维修B001-02A电路故障',
    result: '已派单',
    targetId: 'RPR009',
    targetName: '电路维修',
    rolePool: ['property']
  },
  {
    action: 'repair_escalate',
    detail: '升级维修工单：B003-11B燃气泄漏，需专业处理',
    result: '已升级',
    targetId: 'RPR015',
    targetName: '燃气泄漏维修',
    rolePool: ['property', 'staff']
  }
];

function generateMockLogs(): OperationLog[] {
  const logs: OperationLog[] = [];
  const now = new Date();

  for (let i = 0; i < 30; i++) {
    const template = actionTemplates[i % actionTemplates.length];
    const pool = operators.filter((o) => template.rolePool.includes(o.role));
    const operator = pool[Math.floor(Math.random() * pool.length)];

    const daysAgo = 29 - i;
    const hour = 8 + Math.floor(Math.random() * 10);
    const minute = Math.floor(Math.random() * 60);
    const second = Math.floor(Math.random() * 60);
    const ts = new Date(now);
    ts.setDate(ts.getDate() - daysAgo);
    ts.setHours(hour, minute, second);

    logs.push({
      id: `LOG${String(i + 1).padStart(3, '0')}`,
      action: template.action,
      operatorId: operator.id,
      operatorName: operator.name,
      operatorRole: operator.role,
      targetId: template.targetId,
      targetName: template.targetName,
      detail: template.detail,
      result: template.result,
      timestamp: ts.toISOString()
    });
  }

  return logs;
}

const useOperationLogStore = create<OperationLogState>((set, get) => ({
  logs: generateMockLogs(),

  addLog: (action, operatorId, operatorName, operatorRole, detail, result, targetId, targetName) => {
    const log: OperationLog = {
      id: `LOG${String(Date.now())}`,
      action,
      operatorId,
      operatorName,
      operatorRole,
      detail,
      result,
      targetId,
      targetName,
      timestamp: new Date().toISOString()
    };
    set((state) => ({ logs: [...state.logs, log] }));
  },

  getLogs: (filter) => {
    const { logs } = get();
    if (!filter) return [...logs];
    return logs.filter((log) => {
      if (filter.action && log.action !== filter.action) return false;
      if (filter.operatorId && log.operatorId !== filter.operatorId) return false;

      if (filter.startTime) {
        const startDate = new Date(filter.startTime + 'T00:00:00.000Z');
        const logDate = new Date(log.timestamp);
        if (logDate < startDate) return false;
      }
      if (filter.endTime) {
        const endDate = new Date(filter.endTime + 'T23:59:59.999Z');
        const logDate = new Date(log.timestamp);
        if (logDate > endDate) return false;
      }
      return true;
    });
  },

  getRecentLogs: (count) => {
    const { logs } = get();
    return [...logs].sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, count);
  },

  getLogsByOperator: (operatorId) => {
    const { logs } = get();
    return logs.filter((log) => log.operatorId === operatorId);
  }
}));

export default useOperationLogStore;
export type { OperationLog, LogAction, LogFilter };
