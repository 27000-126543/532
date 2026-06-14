import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Droplets,
  Zap,
  Flame,
  DoorOpen,
  Refrigerator,
  MapPin,
  Clock,
  AlertTriangle,
  Send,
  Play,
  CheckCircle2,
  User,
  Phone,
  ChevronRight,
  Wrench,
  TrendingUp,
  AlertCircle,
  Timer,
  Layers
} from 'lucide-react';
import useHouseStore from '@/store/useHouseStore';
import type { RepairOrder, RepairType, RepairStatus } from '@/types';
import { cn } from '@/lib/utils';

type TabType = 'pending' | 'in_progress' | 'completed' | 'escalated';

const repairTypeIcons: Record<RepairType, typeof Droplets> = {
  water: Droplets,
  electricity: Zap,
  gas: Flame,
  doors_windows: DoorOpen,
  appliance: Refrigerator
};

const repairTypeColors: Record<RepairType, string> = {
  water: 'from-blue-500 to-cyan-500',
  electricity: 'from-yellow-500 to-amber-500',
  gas: 'from-red-500 to-orange-500',
  doors_windows: 'from-emerald-500 to-teal-500',
  appliance: 'from-purple-500 to-pink-500'
};

const repairTypeBgColors: Record<RepairType, string> = {
  water: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  electricity: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  gas: 'bg-red-500/20 text-red-300 border-red-500/30',
  doors_windows: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  appliance: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
};

const priorityConfig: Record<RepairOrder['priority'], { label: string; color: string; bg: string }> = {
  low: { label: '低', color: 'text-slate-300', bg: 'bg-slate-500/20 border-slate-500/30' },
  medium: { label: '中', color: 'text-blue-300', bg: 'bg-blue-500/20 border-blue-500/30' },
  high: { label: '高', color: 'text-amber-300', bg: 'bg-amber-500/20 border-amber-500/30' },
  urgent: { label: '紧急', color: 'text-red-300', bg: 'bg-red-500/20 border-red-500/30' }
};

const tabConfig: { key: TabType; label: string; icon: typeof Layers; statuses: RepairStatus[] }[] = [
  { key: 'pending', label: '待派单', icon: Send, statuses: ['pending'] },
  { key: 'in_progress', label: '进行中', icon: Play, statuses: ['assigned', 'in_progress'] },
  { key: 'completed', label: '已完成', icon: CheckCircle2, statuses: ['completed'] },
  { key: 'escalated', label: '已超时', icon: AlertTriangle, statuses: ['escalated'] }
];

const assigneePool = ['李师傅', '王师傅', '张师傅', '赵师傅', '刘师傅', '陈师傅'];

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function getHoursSince(iso: string): number {
  return (Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60);
}

function DispatchFlowAnimation({ order }: { order: RepairOrder }) {
  const flowActive = order.status === 'assigned' || order.status === 'in_progress';

  return (
    <div className="relative w-full h-20 mt-3 rounded-xl overflow-hidden bg-slate-800/30 border border-slate-700/30">
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `radial-gradient(circle, rgba(59,130,246,0.5) 1px, transparent 1px)`,
        backgroundSize: '20px 20px'
      }} />
      <svg viewBox="0 0 400 80" className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="50%" stopColor="#22D3EE" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path
          d="M 40 40 Q 100 10 160 40 T 280 40 T 360 40"
          fill="none"
          stroke="rgba(59,130,246,0.2)"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path
          d="M 40 40 Q 100 10 160 40 T 280 40 T 360 40"
          fill="none"
          stroke="url(#flowGradient)"
          strokeWidth="3"
          strokeLinecap="round"
          filter="url(#glow)"
          className={flowActive ? 'animate-flow-path' : ''}
          style={{
            strokeDasharray: flowActive ? '15 8' : 'none',
            opacity: flowActive ? 1 : 0.3
          }}
        />
        <circle cx="40" cy="40" r="12" fill="#1E293B" stroke="#3B82F6" strokeWidth="2" />
        <text x="40" y="44" textAnchor="middle" fill="#94A3B8" fontSize="10" fontWeight="bold">报</text>
        <circle cx="360" cy="40" r="12" fill="#1E293B" stroke={order.status === 'completed' ? '#10B981' : '#F59E0B'} strokeWidth="2" />
        <text x="360" y="44" textAnchor="middle" fill={order.status === 'completed' ? '#10B981' : '#F59E0B'} fontSize="10" fontWeight="bold">
          {order.status === 'completed' ? '完' : order.status === 'in_progress' ? '修' : '派'}
        </text>
        {flowActive && (
          <motion.circle
            r="6"
            fill="#22D3EE"
            filter="url(#glow)"
          >
            <animateMotion
              dur="2s"
              repeatCount="indefinite"
              path="M 40 40 Q 100 10 160 40 T 280 40 T 360 40"
            />
          </motion.circle>
        )}
      </svg>
      <div className="absolute left-4 top-2 text-[10px] text-slate-400 flex items-center gap-1">
        <User className="w-3 h-3" />
        报修人
      </div>
      <div className="absolute right-4 top-2 text-[10px] text-slate-400 flex items-center gap-1">
        <Wrench className="w-3 h-3" />
        维修员
      </div>
      <div className="absolute left-4 bottom-2 text-[10px] text-slate-500 font-mono">
        {formatDateTime(order.reportTime)}
      </div>
      <div className="absolute right-4 bottom-2 text-[10px] text-slate-500 font-mono">
        {order.assignee || '待分配'}
      </div>
    </div>
  );
}

function RepairCard({ order, onDispatch, onAccept, onComplete }: {
  order: RepairOrder;
  onDispatch: (id: string) => void;
  onAccept: (id: string) => void;
  onComplete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const TypeIcon = repairTypeIcons[order.type];
  const hoursSinceReport = getHoursSince(order.reportTime);
  const isEscalated = hoursSinceReport > 2 && order.status === 'pending';
  const priority = priorityConfig[order.priority];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.01 }}
      className={cn(
        'relative p-4 rounded-xl border transition-all',
        isEscalated || order.status === 'escalated'
          ? 'bg-red-500/5 border-red-500/40 shadow-[0_0_20px_rgba(239,68,68,0.1)]'
          : 'glass-panel hover:border-cyan-400/30'
      )}
    >
      {(isEscalated || order.status === 'escalated') && (
        <div className="absolute -top-1 -right-1 flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500 text-[10px] text-white font-bold animate-pulse">
          <AlertCircle className="w-3 h-3" />
          超时升级
        </div>
      )}
      {order.priority === 'urgent' && order.status !== 'completed' && (
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-red-500 to-orange-500 text-[10px] text-white font-bold animate-pulse">
          <AlertTriangle className="w-3 h-3" />
          紧急
        </div>
      )}

      <div className="flex items-start gap-3">
        <div className={cn(
          'relative w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br',
          repairTypeColors[order.type],
          'shadow-lg'
        )} style={{
          boxShadow: order.priority === 'urgent' ? '0 0 20px rgba(239,68,68,0.4)' : undefined
        }}>
          <TypeIcon className="w-6 h-6 text-white" />
          {order.status === 'completed' && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center border-2 border-slate-900">
              <CheckCircle2 className="w-3 h-3 text-white" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 mb-1">
            <h4 className="text-white font-bold truncate">{order.title}</h4>
            <span className={cn('shrink-0 px-2 py-0.5 rounded text-[10px] font-bold border', priority.bg, priority.color)}>
              {priority.label}优先级
            </span>
          </div>
          <p className="text-xs text-slate-400 mb-2 line-clamp-2">{order.description}</p>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
            <span className={cn('flex items-center gap-1 px-2 py-0.5 rounded border', repairTypeBgColors[order.type])}>
              <TypeIcon className="w-3 h-3" />
              {order.typeName}
            </span>
            <span className="flex items-center gap-1 text-slate-400">
              <MapPin className="w-3 h-3 text-cyan-400" />
              {order.buildingName} {order.roomNumber}
            </span>
            <span className="flex items-center gap-1 text-slate-400">
              <User className="w-3 h-3 text-purple-400" />
              {order.tenantName}
            </span>
            <span className="flex items-center gap-1 text-slate-400">
              <Phone className="w-3 h-3 text-emerald-400" />
              {order.tenantPhone}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-700/30 flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1 text-slate-400">
            <Clock className="w-3 h-3" />
            {formatDateTime(order.reportTime)}
          </span>
          {hoursSinceReport > 0.5 && (
            <span className={cn(
              'flex items-center gap-1 font-mono font-bold',
              hoursSinceReport > 2 ? 'text-red-400' : hoursSinceReport > 1 ? 'text-amber-400' : 'text-blue-400'
            )}>
              <Timer className="w-3 h-3" />
              {hoursSinceReport < 1
                ? `${Math.round(hoursSinceReport * 60)}分钟前`
                : `${hoursSinceReport.toFixed(1)}小时前`}
            </span>
          )}
          {order.assignee && (
            <span className="flex items-center gap-1 text-cyan-300">
              <Wrench className="w-3 h-3" />
              {order.assignee}
            </span>
          )}
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="p-1.5 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
        >
          <ChevronRight className={cn('w-4 h-4 transition-transform', expanded && 'rotate-90')} />
        </button>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="overflow-hidden"
          >
            <DispatchFlowAnimation order={order} />

            <div className="mt-3 flex items-center justify-end gap-2">
              {order.status === 'pending' && (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => onDispatch(order.id)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-sm font-medium shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-shadow"
                >
                  <Send className="w-4 h-4" />
                  智能派单
                </motion.button>
              )}
              {order.status === 'assigned' && (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => onAccept(order.id)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-medium shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transition-shadow"
                >
                  <Play className="w-4 h-4" />
                  接单维修
                </motion.button>
              )}
              {order.status === 'in_progress' && (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => onComplete(order.id)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-medium shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-shadow"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  完成工单
                </motion.button>
              )}
              {order.status === 'completed' && order.rating && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <span className="text-sm text-emerald-300">评分:</span>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map(n => (
                      <span
                        key={n}
                        className={cn('text-lg', n <= (order.rating || 0) ? 'text-yellow-400' : 'text-slate-600')}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {order.cost !== undefined && order.status === 'completed' && (
                <div className="flex items-center gap-1 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <span className="text-xs text-slate-400">费用:</span>
                  <span className="text-sm font-bold text-amber-300 font-mono">¥{order.cost}</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function RepairDispatch() {
  const { repairOrders } = useHouseStore();
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [localOrders, setLocalOrders] = useState(repairOrders);

  const processedOrders = useMemo(() => {
    return localOrders.map(order => {
      const hoursSince = getHoursSince(order.reportTime);
      if (order.status === 'pending' && hoursSince > 2) {
        return { ...order, status: 'escalated' as RepairStatus };
      }
      return order;
    });
  }, [localOrders]);

  const filteredOrders = useMemo(() => {
    const config = tabConfig.find(t => t.key === activeTab)!;
    return processedOrders.filter(o => config.statuses.includes(o.status));
  }, [processedOrders, activeTab]);

  const stats = useMemo(() => {
    const pending = processedOrders.filter(o => o.status === 'pending').length;
    const inProgress = processedOrders.filter(o => ['assigned', 'in_progress'].includes(o.status)).length;
    const completed = processedOrders.filter(o => o.status === 'completed').length;
    const escalated = processedOrders.filter(o => o.status === 'escalated').length;
    return { pending, inProgress, completed, escalated, total: processedOrders.length };
  }, [processedOrders]);

  const handleDispatch = (id: string) => {
    setLocalOrders(prev => prev.map(o => {
      if (o.id !== id) return o;
      const assignee = assigneePool[Math.floor(Math.random() * assigneePool.length)];
      return {
        ...o,
        status: 'assigned' as RepairStatus,
        assignee,
        assigneePhone: `139${String(Math.floor(10000000 + Math.random() * 89999999)).slice(0, 8)}`,
        assignedTime: new Date().toISOString()
      };
    }));
  };

  const handleAccept = (id: string) => {
    setLocalOrders(prev => prev.map(o => {
      if (o.id !== id) return o;
      return {
        ...o,
        status: 'in_progress' as RepairStatus,
        startTime: new Date().toISOString()
      };
    }));
  };

  const handleComplete = (id: string) => {
    setLocalOrders(prev => prev.map(o => {
      if (o.id !== id) return o;
      return {
        ...o,
        status: 'completed' as RepairStatus,
        completedTime: new Date().toISOString(),
        cost: 50 + Math.floor(Math.random() * 450),
        rating: 3 + Math.floor(Math.random() * 3),
        feedback: Math.random() > 0.5 ? '维修及时，服务很好！' : '服务质量满意'
      };
    }));
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-950 via-blue-950/30 to-slate-950 p-6 overflow-hidden flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="relative">
              <Wrench className="w-8 h-8 text-cyan-400" />
              <div className="absolute inset-0 bg-cyan-400/20 blur-xl rounded-full" />
            </div>
            报修工单智能调度中心
          </h2>
          <p className="text-sm text-slate-400 mt-1 ml-11">全流程工单追踪 · 智能派单 · 超时自动升级</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            <div>
              <div className="text-[10px] text-slate-400">今日完成率</div>
              <div className="text-lg font-bold text-cyan-300">
                {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {tabConfig.map((tab, idx) => {
          const count = stats[tab.key];
          const isActive = activeTab === tab.key;
          const Icon = tab.icon;
          const borderColors = [
            'from-blue-500 to-cyan-500',
            'from-amber-500 to-orange-500',
            'from-emerald-500 to-teal-500',
            'from-red-500 to-rose-500'
          ];
          return (
            <motion.button
              key={tab.key}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'relative p-4 rounded-xl border text-left transition-all overflow-hidden',
                isActive
                  ? 'bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-400/40 shadow-[0_0_30px_rgba(34,211,238,0.1)]'
                  : 'glass-panel hover:border-slate-500/50'
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className={cn('absolute inset-x-0 top-0 h-1 bg-gradient-to-r', borderColors[idx])}
                />
              )}
              <div className="flex items-center justify-between mb-2">
                <Icon className={cn('w-5 h-5', isActive ? 'text-cyan-400' : 'text-slate-400')} />
                <span className={cn(
                  'text-3xl font-bold font-mono',
                  idx === 0 && 'text-blue-300',
                  idx === 1 && 'text-amber-300',
                  idx === 2 && 'text-emerald-300',
                  idx === 3 && 'text-red-300',
                  'glow-text'
                )}>
                  {count}
                </span>
              </div>
              <div className={cn('text-sm font-medium', isActive ? 'text-white' : 'text-slate-300')}>
                {tab.label}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">工单数量</div>
            </motion.button>
          );
        })}
      </div>

      <div className="flex-1 glass-panel flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-700/30 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {tabConfig.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'relative px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  activeTab === tab.key
                    ? 'text-white'
                    : 'text-slate-400 hover:text-white'
                )}
              >
                {activeTab === tab.key && (
                  <motion.div
                    layoutId="tabBg"
                    className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/30"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
                <span className="relative z-10 ml-2 px-1.5 py-0.5 rounded-full text-[10px] bg-slate-700/50 text-slate-300">
                  {stats[tab.key]}
                </span>
              </button>
            ))}
          </div>
          <div className="text-xs text-slate-500">
            共 <span className="text-slate-300 font-bold">{filteredOrders.length}</span> 条工单
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin p-4">
          {filteredOrders.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500">
              <Wrench className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-lg">暂无工单</p>
              <p className="text-sm mt-1 opacity-60">当前分类下没有工单记录</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              <motion.div layout className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredOrders.map(order => (
                  <RepairCard
                    key={order.id}
                    order={order}
                    onDispatch={handleDispatch}
                    onAccept={handleAccept}
                    onComplete={handleComplete}
                  />
                ))}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
