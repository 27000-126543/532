import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  User,
  Users,
  Calendar,
  DollarSign,
  Percent,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Wrench,
  LogIn,
  LogOut,
  Home
} from 'lucide-react';
import useSceneStore from '@/store/useSceneStore';
import useHouseStore from '@/store/useHouseStore';
import type { AccessRecord, RepairOrder } from '@/types';

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return `${d.getMonth() + 1}月${d.getDate()}日 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getRepairStatusInfo(status: RepairOrder['status']) {
  const map: Record<RepairOrder['status'], { label: string; color: string; bg: string }> = {
    pending: { label: '待派单', color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
    assigned: { label: '已派单', color: 'text-blue-400', bg: 'bg-blue-500/20' },
    in_progress: { label: '处理中', color: 'text-purple-400', bg: 'bg-purple-500/20' },
    completed: { label: '已完成', color: 'text-green-400', bg: 'bg-green-500/20' },
    escalated: { label: '已升级', color: 'text-red-400', bg: 'bg-red-500/20' }
  };
  return map[status];
}

function LeaseProgress({ leaseStart, leaseEnd }: { leaseStart: string; leaseEnd: string }) {
  const progress = useMemo(() => {
    const start = new Date(leaseStart).getTime();
    const end = new Date(leaseEnd).getTime();
    const now = Date.now();
    if (now >= end) return 100;
    if (now <= start) return 0;
    return Math.round(((now - start) / (end - start)) * 100);
  }, [leaseStart, leaseEnd]);

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-slate-400 mb-1">
        <span>租约进度</span>
        <span className="text-cyan-400 font-mono">{progress}%</span>
      </div>
      <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      <div className="flex justify-between text-xs text-slate-500 mt-1">
        <span>{leaseStart}</span>
        <span>{leaseEnd}</span>
      </div>
    </div>
  );
}

function PaymentRecord({ month, amount, status }: { month: string; amount: number; status: 'paid' | 'overdue' | 'pending' }) {
  const isOverdue = status === 'overdue';
  return (
    <motion.tr
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors ${isOverdue ? 'bg-red-500/10' : ''}`}
    >
      <td className="py-2 px-3 text-sm text-slate-300">{month}</td>
      <td className="py-2 px-3 text-sm text-right font-mono text-cyan-400">¥{amount}</td>
      <td className="py-2 px-3 text-sm text-center">
        {status === 'paid' && (
          <span className="inline-flex items-center gap-1 text-green-400 text-xs">
            <CheckCircle size={12} /> 已缴
          </span>
        )}
        {status === 'overdue' && (
          <span className="inline-flex items-center gap-1 text-red-400 text-xs font-semibold bg-red-500/10 px-2 py-0.5 rounded">
            <AlertTriangle size={12} /> 欠费
          </span>
        )}
        {status === 'pending' && (
          <span className="inline-flex items-center gap-1 text-yellow-400 text-xs">
            <Clock size={12} /> 待缴
          </span>
        )}
      </td>
    </motion.tr>
  );
}

function AccessTimelineItem({ record, index }: { record: AccessRecord; index: number }) {
  const isNonTenant = !record.isTenant;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className={`relative pl-6 pb-4 border-l-2 ${isNonTenant ? 'border-red-500/50' : 'border-cyan-500/30'} last:border-l-transparent last:pb-0`}
    >
      <div className={`absolute left-[-6px] top-0 w-3 h-3 rounded-full border-2 ${
        isNonTenant
          ? 'bg-red-500 border-red-400 animate-pulse'
          : record.accessType === 'in'
          ? 'bg-green-500 border-green-400'
          : 'bg-blue-500 border-blue-400'
      }`} />
      <div className={`p-3 rounded-lg ${isNonTenant ? 'bg-red-500/10 border border-red-500/30' : 'bg-slate-800/50 border border-slate-700/50'}`}>
        <div className="flex items-center justify-between mb-1">
          <span className={`text-xs font-mono ${isNonTenant ? 'text-red-400' : 'text-slate-400'}`}>
            {formatDateTime(record.timestamp)}
          </span>
          <span className="flex items-center gap-1 text-xs">
            {record.accessType === 'in' ? (
              <span className="text-green-400 flex items-center gap-1"><LogIn size={12} />进入</span>
            ) : (
              <span className="text-blue-400 flex items-center gap-1"><LogOut size={12} />离开</span>
            )}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className={`text-sm font-medium ${isNonTenant ? 'text-red-300' : 'text-slate-200'}`}>
            {record.personName}
            {isNonTenant && <span className="ml-2 text-xs bg-red-500/30 text-red-300 px-1.5 py-0.5 rounded">非住户</span>}
          </span>
          <span className={`text-xs flex items-center gap-1 ${
            record.isMatched ? 'text-green-400' : 'text-yellow-400'
          }`}>
            {record.isMatched ? (
              <><CheckCircle size={10} /> 匹配 {Math.round((record.matchConfidence || 0) * 100)}%</>
            ) : (
              <><XCircle size={10} /> 未通过</>
            )}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function RepairItem({ order, index }: { order: RepairOrder; index: number }) {
  const statusInfo = getRepairStatusInfo(order.status);
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-cyan-500/30 transition-colors"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <Wrench size={14} className="text-cyan-400" />
          <span className="text-sm font-medium text-slate-200">{order.title}</span>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded ${statusInfo.bg} ${statusInfo.color}`}>
          {statusInfo.label}
        </span>
      </div>
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span className="bg-slate-700/50 px-2 py-0.5 rounded">{order.typeName}</span>
        <span className="font-mono">{formatDateTime(order.reportTime)}</span>
      </div>
    </motion.div>
  );
}

export default function HouseDetailPanel() {
  const { selectedHouseId, selectHouse } = useSceneStore();
  const house = useHouseStore((s) => s.getHouseById(selectedHouseId || ''));
  const tenant = useHouseStore((s) => s.getTenantByHouseId(selectedHouseId || ''));
  const accessRecords = useHouseStore((s) => s.getAccessRecordsByHouseId(selectedHouseId || ''));
  const repairOrders = useHouseStore((s) => s.getRepairOrdersByHouseId(selectedHouseId || ''));

  const isOpen = !!selectedHouseId;

  const recentAccess = useMemo(() => {
    const now = Date.now();
    const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;
    return accessRecords
      .filter((r) => new Date(r.timestamp).getTime() >= twentyFourHoursAgo)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 12);
  }, [accessRecords]);

  const paymentRecords = useMemo(() => {
    if (!tenant) return [];
    const records: { month: string; amount: number; status: 'paid' | 'overdue' | 'pending' }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const status: 'paid' | 'overdue' | 'pending' =
        i >= 2 ? 'paid' : i === 1 ? (house?.overdueDays ? 'overdue' : 'paid') : 'pending';
      records.push({ month, amount: tenant.actualRent, status });
    }
    return records;
  }, [tenant, house]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => selectHouse(null)}
            className="fixed inset-0 bg-black/40 z-40"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-[480px] max-w-[95vw] z-50 glass-panel rounded-none border-l-2 border-cyan-500/30 shadow-2xl shadow-cyan-500/10 overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-700/50 bg-gradient-to-r from-cyan-900/30 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                  <Home className="text-cyan-400" size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">
                    {house?.buildingName} {house?.roomNumber}
                  </h2>
                  <p className="text-xs text-slate-400">
                    {house?.layout} · {house?.area}㎡
                  </p>
                </div>
              </div>
              <button
                onClick={() => selectHouse(null)}
                className="w-8 h-8 rounded-lg bg-slate-700/50 hover:bg-red-500/30 flex items-center justify-center transition-colors group"
              >
                <X size={18} className="text-slate-400 group-hover:text-red-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
              {tenant && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-cyan-500/20"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-cyan-500/30">
                      {tenant.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-1">{tenant.name}</h3>
                      <p className="text-sm text-slate-400 font-mono">{tenant.phone}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="p-3 rounded-lg bg-slate-900/50 flex items-center gap-3">
                      <Users size={18} className="text-blue-400" />
                      <div>
                        <p className="text-xs text-slate-400">家庭人口</p>
                        <p className="text-lg font-bold text-white font-mono">{tenant.familyMembers}人</p>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-900/50 flex items-center gap-3">
                      <Calendar size={18} className="text-purple-400" />
                      <div>
                        <p className="text-xs text-slate-400">到期日</p>
                        <p className="text-sm font-bold text-white font-mono">{formatDate(tenant.leaseEnd)}</p>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-900/50 flex items-center gap-3">
                      <DollarSign size={18} className="text-green-400" />
                      <div>
                        <p className="text-xs text-slate-400">月租金</p>
                        <p className="text-lg font-bold text-green-400 font-mono">¥{tenant.actualRent}</p>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-900/50 flex items-center gap-3">
                      <Percent size={18} className="text-orange-400" />
                      <div>
                        <p className="text-xs text-slate-400">补贴比例</p>
                        <p className="text-lg font-bold text-orange-400 font-mono">{Math.round(tenant.subsidyRatio * 100)}%</p>
                      </div>
                    </div>
                  </div>

                  <LeaseProgress leaseStart={tenant.leaseStart} leaseEnd={tenant.leaseEnd} />
                </motion.div>
              )}

              {!tenant && (
                <div className="p-8 rounded-xl bg-slate-800/50 border border-slate-700/50 text-center">
                  <User size={48} className="text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-500">该房屋暂无住户信息</p>
                </div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50"
              >
                <div className="flex items-center gap-2 mb-3">
                  <FileText size={16} className="text-cyan-400" />
                  <h3 className="text-sm font-semibold text-white">历史缴费记录</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-xs text-slate-400 border-b border-slate-700/50">
                        <th className="py-2 px-3 text-left font-medium">月份</th>
                        <th className="py-2 px-3 text-right font-medium">金额</th>
                        <th className="py-2 px-3 text-center font-medium">状态</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paymentRecords.map((r, i) => (
                        <PaymentRecord key={r.month} {...r} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-cyan-400" />
                    <h3 className="text-sm font-semibold text-white">近24小时门禁记录</h3>
                  </div>
                  <span className="text-xs text-slate-400">{recentAccess.length}条</span>
                </div>
                {recentAccess.length > 0 ? (
                  <div className="space-y-1">
                    {recentAccess.map((r, i) => (
                      <AccessTimelineItem key={r.id} record={r} index={i} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500 text-sm">暂无门禁记录</div>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Wrench size={16} className="text-cyan-400" />
                    <h3 className="text-sm font-semibold text-white">报修工单</h3>
                  </div>
                  <span className="text-xs text-slate-400">{repairOrders.length}条</span>
                </div>
                {repairOrders.length > 0 ? (
                  <div className="space-y-2">
                    {repairOrders.slice(0, 5).map((o, i) => (
                      <RepairItem key={o.id} order={o} index={i} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500 text-sm">暂无报修记录</div>
                )}
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
