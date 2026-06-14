import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FileCheck2,
  Building2,
  Wrench,
  Zap,
  AlertTriangle,
  FileSpreadsheet,
  ListChecks,
  ChevronLeft,
  ChevronRight,
  Home as HomeIcon,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  User,
  Phone,
  MapPin,
  Calendar,
  X as XIcon,
  Eye,
  Activity,
  Wifi,
  Database,
  Shield,
  Thermometer,
  Droplets,
  Flame,
  Layers,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Search,
  Filter,
  Clock,
  Download,
  LogOut,
  ScanFace,
  FileText,
  BarChart3,
  ArrowUpRight,
  ChevronDown
} from 'lucide-react';
import TopNav from '@/components/layout/TopNav';
import CommunityScene from '@/components/three3d/CommunityScene';
import BuildingScene from '@/components/three3d/BuildingScene';
import HouseScene from '@/components/three3d/HouseScene';
import LotteryScreen from '@/components/modules/LotteryScreen';
import RepairDispatch from '@/components/modules/RepairDispatch';
import ReportExport from '@/components/modules/ReportExport';
import useSceneStore from '@/store/useSceneStore';
import useHouseStore from '@/store/useHouseStore';
import useUserStore from '@/store/useUserStore';
import useWarningStore from '@/store/useWarningStore';
import useApprovalStore from '@/store/useApprovalStore';
import useOperationLogStore from '@/store/useOperationLogStore';
import energyStatsData from '@/data/energyStats';
import type { UserRole, House, ApprovalStage, ApprovalStatus } from '@/types';
import { cn } from '@/lib/utils';

type MenuKey = 'overview' | 'approval' | 'lottery' | 'repair' | 'energy' | 'warning' | 'report' | 'logs';

const menuItems: {
  key: MenuKey;
  label: string;
  icon: typeof LayoutDashboard;
  requiredRole: UserRole;
  color: string;
}[] = [
  { key: 'overview', label: '总览', icon: LayoutDashboard, requiredRole: 'property', color: 'from-cyan-500 to-blue-500' },
  { key: 'approval', label: '审批中心', icon: FileCheck2, requiredRole: 'staff', color: 'from-amber-500 to-orange-500' },
  { key: 'lottery', label: '配租管理', icon: Building2, requiredRole: 'staff', color: 'from-emerald-500 to-teal-500' },
  { key: 'repair', label: '报修调度', icon: Wrench, requiredRole: 'property', color: 'from-blue-500 to-indigo-500' },
  { key: 'energy', label: '能耗管理', icon: Zap, requiredRole: 'property', color: 'from-yellow-500 to-amber-500' },
  { key: 'warning', label: '预警中心', icon: AlertTriangle, requiredRole: 'staff', color: 'from-rose-500 to-red-500' },
  { key: 'report', label: '报表导出', icon: FileSpreadsheet, requiredRole: 'staff', color: 'from-purple-500 to-pink-500' },
  { key: 'logs', label: '操作日志', icon: ListChecks, requiredRole: 'district_director', color: 'from-slate-500 to-slate-600' }
];

const statusColors = {
  normal: { bg: 'bg-emerald-500', text: 'text-emerald-400', label: '正常' },
  warning: { bg: 'bg-amber-500', text: 'text-amber-400', label: '预警' },
  error: { bg: 'bg-red-500', text: 'text-red-400', label: '违规' },
  offline: { bg: 'bg-slate-500', text: 'text-slate-400', label: '离线' }
};

function SidePanel({
  collapsed,
  onToggle,
  activeMenu,
  onMenuChange
}: {
  collapsed: boolean;
  onToggle: () => void;
  activeMenu: MenuKey;
  onMenuChange: (key: MenuKey) => void;
}) {
  const { currentUser, hasPermission } = useUserStore();

  const visibleMenuItems = useMemo(() => {
    return menuItems.filter(item => hasPermission(item.requiredRole));
  }, [hasPermission]);

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 240 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed left-0 top-16 bottom-12 z-40 glass-panel rounded-none border-l-0 border-y-0 flex flex-col overflow-hidden"
    >
      <div className="flex items-center justify-between px-3 py-3 border-b border-slate-700/30">
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs font-medium text-slate-400 uppercase tracking-wider"
          >
            功能菜单
          </motion.div>
        )}
        <button
          onClick={onToggle}
          className={cn(
            'p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-all',
            collapsed && 'mx-auto'
          )}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      <nav className="flex-1 py-3 px-2 overflow-y-auto scrollbar-thin space-y-1">
        {visibleMenuItems.map((item, idx) => {
          const Icon = item.icon;
          const isActive = activeMenu === item.key;
          return (
            <motion.button
              key={item.key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => onMenuChange(item.key)}
              className={cn(
                'group relative w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all overflow-hidden',
                isActive
                  ? 'text-white shadow-lg'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/30'
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="sideMenuActive"
                  className={cn('absolute inset-0 bg-gradient-to-r opacity-20', item.color)}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              {isActive && (
                <div className={cn('absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-gradient-to-b', item.color)} />
              )}
              <div className={cn(
                'relative z-10 w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-all',
                isActive
                  ? `bg-gradient-to-br ${item.color} shadow-lg`
                  : 'bg-slate-800/50 group-hover:bg-slate-700/50'
              )}>
                <Icon className={cn('w-5 h-5', isActive ? 'text-white' : '')} />
              </div>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="relative z-10 text-sm font-medium whitespace-nowrap"
                >
                  {item.label}
                </motion.span>
              )}
              {!collapsed && isActive && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="ml-auto w-2 h-2 rounded-full bg-cyan-400 animate-pulse"
                />
              )}
            </motion.button>
          );
        })}
      </nav>

      {!collapsed && currentUser && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 border-t border-slate-700/30"
        >
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium text-white truncate">{currentUser.name}</div>
                <div className="text-[10px] text-slate-500">{currentUser.id}</div>
              </div>
            </div>
            <div className="flex gap-1">
              <div className="flex-1 py-1 px-2 rounded bg-slate-800/50 text-center">
                <div className="text-[10px] text-slate-500">角色</div>
                <div className="text-xs text-cyan-300 font-medium">
                  {{
                    tenant: '租户',
                    property: '物业',
                    staff: '街道',
                    district_director: '区长',
                    city_director: '市长'
                  }[currentUser.role]}
                </div>
              </div>
              <div className="flex-1 py-1 px-2 rounded bg-slate-800/50 text-center">
                <div className="text-[10px] text-slate-500">状态</div>
                <div className="text-xs text-emerald-400 font-medium flex items-center justify-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  在线
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.aside>
  );
}

function StatsDashboard() {
  const { houses, buildings, repairOrders } = useHouseStore();
  const { getUnacknowledgedCount } = useWarningStore();

  const stats = useMemo(() => {
    const totalUnits = houses.length;
    const availableUnits = houses.filter(h => h.status === 'available').length;
    const occupiedUnits = totalUnits - availableUnits;
    const overdueCount = houses.filter(h => h.status === 'overdue_rent').length;
    const pendingRepairs = repairOrders.filter(r => ['pending', 'assigned'].includes(r.status)).length;
    const warningCount = getUnacknowledgedCount();
    const vacancyRate = totalUnits > 0 ? (availableUnits / totalUnits) * 100 : 0;
    const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;

    return {
      totalBuildings: buildings.length,
      totalUnits,
      occupiedUnits,
      availableUnits,
      vacancyRate,
      occupancyRate,
      overdueCount,
      pendingRepairs,
      warningCount
    };
  }, [houses, buildings, repairOrders, getUnacknowledgedCount]);

  const statItems = [
    { icon: Building2, label: '楼栋数', value: stats.totalBuildings, unit: '栋', color: 'text-cyan-400' },
    { icon: HomeIcon, label: '入住率', value: stats.occupancyRate.toFixed(1), unit: '%', color: 'text-emerald-400' },
    { icon: AlertTriangle, label: '待处理预警', value: stats.warningCount, unit: '起', color: 'text-amber-400' },
    { icon: Wrench, label: '待处理工单', value: stats.pendingRepairs, unit: '单', color: 'text-blue-400' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3, type: 'spring' }}
      className="fixed top-20 right-4 z-30 space-y-3 w-64"
    >
      {statItems.map((item, idx) => {
        const Icon = item.icon;
        return (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + idx * 0.1 }}
            whileHover={{ scale: 1.03, x: -4 }}
            className="glass-panel p-4 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10 blur-2xl"
              style={{ background: item.color.replace('text-', '') }}
            />
            <div className="relative flex items-start justify-between">
              <div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">{item.label}</div>
                <div className="flex items-baseline gap-1">
                  <span className={cn('text-2xl font-bold font-mono glow-text', item.color)}>
                    {item.value}
                  </span>
                  <span className="text-xs text-slate-500">{item.unit}</span>
                </div>
              </div>
              <div className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center',
                'bg-slate-800/50 border border-slate-700/50'
              )}>
                <Icon className={cn('w-5 h-5', item.color)} />
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

function HouseDetailPanel({ house, onClose }: { house: House; onClose: () => void }) {
  const { getBuildingById, getTenantByHouseId, getRepairOrdersByHouseId, getAccessRecordsByHouseId } = useHouseStore();
  const { getWarningsByHouseId } = useWarningStore();

  const building = getBuildingById(house.buildingId);
  const tenant = getTenantByHouseId(house.id);
  const repairs = getRepairOrdersByHouseId(house.id);
  const warnings = getWarningsByHouseId(house.id);
  const accessRecords = getAccessRecordsByHouseId(house.id).slice(0, 5);

  const statusConfig = {
    normal: { label: '正常居住', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
    available: { label: '空置可租', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
    vacant_warning: { label: '空置预警', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
    sublet_warning: { label: '转租预警', color: 'bg-red-500/20 text-red-300 border-red-500/30' },
    overdue_rent: { label: '租金逾期', color: 'bg-orange-500/20 text-orange-300 border-orange-500/30' }
  }[house.status];

  return (
    <motion.div
      initial={{ opacity: 0, x: 400 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 400 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed right-0 top-16 bottom-12 w-96 z-40 glass-panel rounded-none border-r-0 border-y-0 flex flex-col overflow-hidden"
    >
      <div className="px-5 py-4 border-b border-slate-700/30 flex items-center justify-between bg-gradient-to-r from-cyan-500/10 to-transparent">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <HomeIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-white">{house.buildingName}</h3>
            <p className="text-xs text-slate-400">{house.roomNumber} · {house.layout}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
        >
          <XIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/30 border border-slate-700/30">
          <span className="text-sm text-slate-400">房屋状态</span>
          <span className={cn('px-3 py-1 rounded-full text-xs font-medium border', statusConfig)}>
            {statusConfig.label.split(' ')[0]}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-700/30">
            <div className="text-[10px] text-slate-500 mb-1">建筑面积</div>
            <div className="text-lg font-bold text-cyan-300 font-mono">{house.area}<span className="text-xs text-slate-500 ml-1">㎡</span></div>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-700/30">
            <div className="text-[10px] text-slate-500 mb-1">月租金</div>
            <div className="text-lg font-bold text-amber-300 font-mono">¥{house.monthlyRent}</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-700/30">
            <div className="text-[10px] text-slate-500 mb-1">所在楼层</div>
            <div className="text-lg font-bold text-blue-300 font-mono">{house.floor}层</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-700/30">
            <div className="text-[10px] text-slate-500 mb-1">户型</div>
            <div className="text-lg font-bold text-purple-300">{house.layout}</div>
          </div>
        </div>

        {building && (
          <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border border-blue-500/20">
            <div className="text-xs text-slate-400 mb-2 flex items-center gap-1">
              <Building2 className="w-3 h-3" /> 楼栋信息
            </div>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">行政区</span>
                <span className="text-white">{building.district}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">街道</span>
                <span className="text-white">{building.street}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">总楼层</span>
                <span className="text-white">{building.floors}层</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">物业经理</span>
                <span className="text-white">{building.propertyManager}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">联系电话</span>
                <span className="text-cyan-300 font-mono">{building.phone}</span>
              </div>
            </div>
          </div>
        )}

        {tenant && (
          <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/5 to-pink-500/5 border border-purple-500/20">
            <div className="text-xs text-slate-400 mb-3 flex items-center gap-1">
              <Users className="w-3 h-3" /> 租户信息
            </div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-bold text-white">{tenant.name}</div>
                <div className="text-xs text-slate-500">{tenant.id}</div>
              </div>
            </div>
            <div className="space-y-1.5 text-sm">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-slate-400">联系电话:</span>
                <span className="text-cyan-300 font-mono">{tenant.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-slate-400">家庭成员:</span>
                <span className="text-white">{tenant.familyMembers}人</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-slate-400">实缴租金:</span>
                <span className="text-amber-300 font-mono">¥{tenant.actualRent}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-slate-400">合同期:</span>
                <span className="text-white text-xs">{tenant.leaseStart} ~ {tenant.leaseEnd}</span>
              </div>
            </div>
          </div>
        )}

        {warnings.length > 0 && (
          <div className="p-4 rounded-xl bg-gradient-to-br from-red-500/5 to-orange-500/5 border border-red-500/20">
            <div className="text-xs text-red-400 mb-3 flex items-center gap-1 font-medium">
              <AlertTriangle className="w-3 h-3" /> 预警信息 ({warnings.length})
            </div>
            <div className="space-y-2">
              {warnings.slice(0, 3).map(w => (
                <div key={w.id} className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20">
                  <div className="flex items-start gap-2">
                    <div className={cn(
                      'w-2 h-2 rounded-full mt-1.5 shrink-0',
                      w.level === 'high' ? 'bg-red-500' : w.level === 'medium' ? 'bg-amber-500' : 'bg-yellow-500'
                    )} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={cn(
                          'text-[10px] px-1.5 py-0.5 rounded',
                          w.type === 'vacant' ? 'bg-amber-500/20 text-amber-300' : 'bg-red-500/20 text-red-300'
                        )}>
                          {w.type === 'vacant' ? '空置预警' : '转租预警'}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {w.tenantName && `住户: ${w.tenantName}`}
                        </span>
                      </div>
                      <div className="text-xs text-white line-clamp-2">{w.description}</div>
                      <div className="text-[10px] text-slate-500 mt-1">
                        {new Date(w.detectedAt).toLocaleDateString('zh-CN')}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {repairs.length > 0 && (
          <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border border-blue-500/20">
            <div className="text-xs text-blue-400 mb-3 flex items-center gap-1">
              <Wrench className="w-3 h-3" /> 报修记录 ({repairs.length})
            </div>
            <div className="space-y-2">
              {repairs.slice(0, 3).map(r => (
                <div key={r.id} className="p-2.5 rounded-lg bg-slate-800/30 border border-slate-700/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-white">{r.title}</span>
                    <span className={cn(
                      'text-[10px] px-1.5 py-0.5 rounded',
                      r.status === 'completed' ? 'bg-emerald-500/20 text-emerald-300' :
                        r.status === 'pending' ? 'bg-amber-500/20 text-amber-300' :
                          'bg-blue-500/20 text-blue-300'
                    )}>
                      {{ pending: '待派单', assigned: '已派单', in_progress: '维修中', completed: '已完成', escalated: '已升级' }[r.status]}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500">{r.typeName} · {new Date(r.reportTime).toLocaleDateString('zh-CN')}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {accessRecords.length > 0 && (
          <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border border-emerald-500/20">
            <div className="text-xs text-emerald-400 mb-3 flex items-center gap-1">
              <Eye className="w-3 h-3" /> 最近门禁记录
            </div>
            <div className="space-y-2">
              {accessRecords.map(r => (
                <div key={r.id} className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/20">
                  <div className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center text-[10px]',
                    r.accessType === 'in' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'
                  )}>
                    {r.accessType === 'in' ? '进' : '出'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-white truncate">{r.personName}</div>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {new Date(r.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function StatusBar() {
  const { houses, repairOrders, buildings } = useHouseStore();
  const { getUnacknowledgedCount } = useWarningStore();

  const stats = useMemo(() => {
    const totalUnits = houses.length;
    const abnormalUnits = houses.filter(h =>
      h.status === 'vacant_warning' || h.status === 'sublet_warning' || h.status === 'overdue_rent'
    ).length;
    const warningUnits = houses.filter(h =>
      h.status === 'vacant_warning' || h.status === 'overdue_rent'
    ).length;
    const errorUnits = houses.filter(h => h.status === 'sublet_warning').length;
    const pendingRepairs = repairOrders.filter(r => r.status === 'pending').length;
    const escalatedRepairs = repairOrders.filter(r => r.status === 'escalated').length;
    const unackWarnings = getUnacknowledgedCount();

    return {
      totalUnits,
      normalUnits: totalUnits - abnormalUnits,
      warningUnits,
      errorUnits,
      pendingRepairs,
      escalatedRepairs,
      unackWarnings
    };
  }, [houses, repairOrders, getUnacknowledgedCount]);

  const statusIndicators = [
    { ...statusColors.normal, label: '系统运行', count: stats.normalUnits, desc: '正常' },
    { ...statusColors.warning, label: '预警房屋', count: stats.warningUnits + stats.pendingRepairs, desc: '待处理' },
    { ...statusColors.error, label: '违规房屋', count: stats.errorUnits + stats.escalatedRepairs, desc: '需处理' },
    { bg: 'bg-blue-500', text: 'text-blue-400', label: '数据连接', count: buildings.length, desc: '楼栋在线' }
  ];

  return (
    <motion.footer
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2, type: 'spring', stiffness: 100, damping: 20 }}
      className="fixed bottom-0 left-0 right-0 z-50 h-12 glass-panel rounded-none border-x-0 border-b-0 flex items-center px-6"
    >
      <div className="flex items-center gap-6 flex-1">
        {statusIndicators.map((ind, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <div className="relative">
              <div className={cn('w-2.5 h-2.5 rounded-full', ind.bg)} />
              <div className={cn('absolute inset-0 w-2.5 h-2.5 rounded-full opacity-50 animate-ping', ind.bg)} />
            </div>
            <span className={cn('text-sm font-medium', ind.text)}>{ind.label}</span>
            <span className="text-xs text-slate-500">{ind.count} {ind.desc}</span>
            {idx < statusIndicators.length - 1 && <div className="w-px h-5 bg-slate-700/50 ml-2" />}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <Wifi className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-emerald-400">网络正常</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Database className="w-3.5 h-3.5 text-cyan-400" />
          <span>数据库连接正常</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-purple-400" />
          <span>安全防护中</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700/30">
          <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span className="text-slate-300 font-mono">v2.6.1</span>
        </div>
      </div>
    </motion.footer>
  );
}

function BreadcrumbNav() {
  const { viewMode, selectedBuildingId, selectedHouseId, resetScene } = useSceneStore();
  const { getBuildingById, getHouseById } = useHouseStore();

  const building = selectedBuildingId ? getBuildingById(selectedBuildingId) : null;
  const house = selectedHouseId ? getHouseById(selectedHouseId) : null;

  const crumbs = [
    { label: '社区总览', onClick: resetScene, show: true },
    { label: building?.name || '', onClick: () => { }, show: !!building },
    { label: house?.roomNumber || '', onClick: () => { }, show: !!house }
  ];

  return (
    <div className="fixed bottom-14 left-4 z-30">
      <div className="glass-panel px-4 py-2 flex items-center gap-2">
        {crumbs.filter(c => c.show).map((crumb, idx, arr) => (
          <div key={idx} className="flex items-center gap-2">
            {idx > 0 && <span className="text-slate-600">/</span>}
            <button
              onClick={crumb.onClick}
              className={cn(
                'text-sm transition-colors',
                idx === arr.filter(c => c.show).length - 1
                  ? 'text-cyan-300 font-medium glow-text'
                  : 'text-slate-400 hover:text-slate-200'
              )}
            >
              {crumb.label}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ViewModeBadge() {
  const { viewMode, selectBuilding } = useSceneStore();

  const config = {
    community: { label: '社区视图', color: 'from-cyan-500 to-blue-500', desc: '点击楼栋进入详情' },
    building: { label: '楼栋视图', color: 'from-emerald-500 to-teal-500', desc: '点击房屋进入详情' },
    house: { label: '房屋视图', color: 'from-purple-500 to-pink-500', desc: '3D户型漫游' }
  }[viewMode];

  return (
    <div className="fixed bottom-14 right-4 z-30">
      <motion.div
        key={viewMode}
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="glass-panel px-4 py-2 flex items-center gap-3"
      >
        <div className={cn('w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center', config.color)}>
          <Layers className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="text-sm font-bold text-white">{config.label}</div>
          <div className="text-[10px] text-slate-500">{config.desc}</div>
        </div>
      </motion.div>
    </div>
  );
}

function EnergyManagement() {
  const { buildings } = useHouseStore();
  const energyStats = useMemo(() => energyStatsData, []);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);

  const selectedStat = useMemo(
    () => energyStats.find((s: any) => s.buildingId === selectedBuildingId),
    [energyStats, selectedBuildingId]
  );

  const energySuggestions: Record<string, string[]> = {
    electricity: [
      '建议将公共区域照明更换为LED节能灯，预计节电30%',
      '优化电梯运行策略，非高峰时段减少运行台数',
      '安装光照传感器，白天自动降低楼道照明亮度'
    ],
    water: [
      '检查各楼层卫生间冲水装置，更换节水型阀件',
      '排查地下管网漏水点，建议进行水压测试',
      '安装感应式水龙头，减少公共区域水资源浪费'
    ],
    gas: [
      '建议对燃气管道进行年检，排查泄漏隐患',
      '优化锅炉运行参数，提升热效率降低气耗',
      '安装燃气流量计实现分户计量精细管理'
    ]
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-950 via-amber-950/10 to-slate-950 p-6 overflow-y-auto scrollbar-thin">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Zap className="w-7 h-7 text-amber-400" />
            能耗管理
          </h2>
          <p className="text-sm text-slate-400 mt-1 ml-10">按楼栋监控水电气能耗 · 预算对比 · 节能建议</p>
        </div>
      </div>

      <div className="grid grid-cols-6 gap-3 mb-6">
        {energyStats.map((stat: any) => {
          const isOver = stat.isOverBudget;
          const isSelected = selectedBuildingId === stat.buildingId;
          return (
            <motion.button
              key={stat.buildingId}
              whileHover={{ scale: 1.03, y: -2 }}
              onClick={() => setSelectedBuildingId(isSelected ? null : stat.buildingId)}
              className={cn(
                'glass-panel p-4 text-left transition-all relative overflow-hidden',
                isSelected && 'ring-2 ring-cyan-400/50',
                isOver && !isSelected && 'ring-1 ring-orange-500/40'
              )}
            >
              {isOver && (
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              )}
              <div className="text-xs text-slate-400 mb-1 truncate">{stat.buildingName}</div>
              <div className={cn('text-lg font-bold font-mono', isOver ? 'text-orange-400' : 'text-cyan-300')}>
                {((stat.totalElectricity + stat.totalWater + stat.totalGas) / 1000).toFixed(1)}
                <span className="text-xs text-slate-500 ml-1">k</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                {isOver ? `超支: ${stat.overBudgetItems.map((i: string) => i === 'electricity' ? '电' : i === 'water' ? '水' : '气').join('/')}` : '预算内'}
              </div>
            </motion.button>
          );
        })}
      </div>

      {selectedStat && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="glass-panel p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-cyan-400" />
                {selectedStat.buildingName} 能耗详情
              </h3>
              {selectedStat.isOverBudget && (
                <span className="px-3 py-1 rounded-full bg-orange-500/15 text-orange-400 text-xs font-medium border border-orange-500/30 animate-pulse">
                  预算超标
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { key: 'electricity', label: '用电', unit: 'kWh', icon: Zap, color: 'amber', data: selectedStat.totalElectricity, budget: selectedStat.totalElectricityBudget },
                { key: 'water', label: '用水', unit: '吨', icon: Droplets, color: 'blue', data: selectedStat.totalWater, budget: selectedStat.totalWaterBudget },
                { key: 'gas', label: '用气', unit: 'm³', icon: Flame, color: 'orange', data: selectedStat.totalGas, budget: selectedStat.totalGasBudget }
              ].map(item => {
                const Icon = item.icon;
                const isOver = item.data > item.budget;
                const ratio = item.budget > 0 ? ((item.data / item.budget) * 100) : 0;
                return (
                  <div key={item.key} className={cn(
                    'p-4 rounded-xl border',
                    isOver ? 'bg-orange-500/5 border-orange-500/30' : 'bg-slate-800/30 border-slate-700/30'
                  )}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Icon className={cn('w-5 h-5', `text-${item.color}-400`)} />
                        <span className="text-sm text-slate-300">{item.label}</span>
                      </div>
                      {isOver && (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-red-500/15 text-red-400 font-medium">
                          超预算
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline gap-1 mb-1">
                      <span className={cn('text-2xl font-bold font-mono', isOver ? 'text-orange-400' : `text-${item.color}-300`)}>
                        {item.data.toLocaleString()}
                      </span>
                      <span className="text-xs text-slate-500">{item.unit}</span>
                    </div>
                    <div className="text-xs text-slate-500 mb-2">
                      预算: {item.budget.toLocaleString()} {item.unit}
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-700/50 overflow-hidden">
                      <div
                        className={cn('h-full rounded-full transition-all', isOver ? 'bg-red-400' : `bg-${item.color}-400`)}
                        style={{ width: `${Math.min(ratio, 100)}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1 text-right">
                      {ratio.toFixed(1)}%
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-medium text-slate-300 mb-3">月度趋势</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-800/40">
                      <th className="px-3 py-2 text-left text-xs text-slate-400">月份</th>
                      <th className="px-3 py-2 text-center text-xs text-amber-400">用电(kWh)</th>
                      <th className="px-3 py-2 text-center text-xs text-slate-500">预算</th>
                      <th className="px-3 py-2 text-center text-xs text-blue-400">用水(吨)</th>
                      <th className="px-3 py-2 text-center text-xs text-slate-500">预算</th>
                      <th className="px-3 py-2 text-center text-xs text-orange-400">用气(m³)</th>
                      <th className="px-3 py-2 text-center text-xs text-slate-500">预算</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/20">
                    {selectedStat.months.map((m: any) => (
                      <tr key={m.month} className="hover:bg-slate-800/20">
                        <td className="px-3 py-2 text-slate-300">{m.month}</td>
                        <td className={cn('px-3 py-2 text-center font-mono', m.electricity > m.electricityBudget ? 'text-orange-400' : 'text-amber-300')}>
                          {m.electricity.toLocaleString()}
                        </td>
                        <td className="px-3 py-2 text-center font-mono text-slate-500">{m.electricityBudget.toLocaleString()}</td>
                        <td className={cn('px-3 py-2 text-center font-mono', m.water > m.waterBudget ? 'text-orange-400' : 'text-blue-300')}>
                          {m.water.toLocaleString()}
                        </td>
                        <td className="px-3 py-2 text-center font-mono text-slate-500">{m.waterBudget.toLocaleString()}</td>
                        <td className={cn('px-3 py-2 text-center font-mono', m.gas > m.gasBudget ? 'text-orange-400' : 'text-orange-300')}>
                          {m.gas.toLocaleString()}
                        </td>
                        <td className="px-3 py-2 text-center font-mono text-slate-500">{m.gasBudget.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {selectedStat.isOverBudget && (
            <div className="glass-panel p-5 border-orange-500/30">
              <h4 className="text-sm font-bold text-orange-400 mb-3 flex items-center gap-2">
                <Thermometer className="w-4 h-4" /> 节能建议
              </h4>
              <div className="space-y-3">
                {selectedStat.overBudgetItems.map((item: string) => (
                  <div key={item} className="p-3 rounded-lg bg-orange-500/5 border border-orange-500/15">
                    <div className="text-xs text-orange-400 font-medium mb-2">
                      {item === 'electricity' ? '⚡ 用电超标' : item === 'water' ? '💧 用水超标' : '🔥 用气超标'}
                    </div>
                    <ul className="space-y-1.5">
                      {(energySuggestions[item] || []).map((suggestion, idx) => (
                        <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                          <span className="text-orange-400 mt-0.5">•</span>
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {!selectedStat && (
        <div className="glass-panel p-5">
          <h3 className="text-sm font-medium text-slate-300 mb-4">全部楼栋能耗概览</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-800/40">
                  <th className="px-4 py-3 text-left text-xs text-slate-400">楼栋</th>
                  <th className="px-4 py-3 text-center text-xs text-amber-400">用电(kWh)</th>
                  <th className="px-4 py-3 text-center text-xs text-blue-400">用水(吨)</th>
                  <th className="px-4 py-3 text-center text-xs text-orange-400">用气(m³)</th>
                  <th className="px-4 py-3 text-center text-xs text-slate-400">预算状态</th>
                  <th className="px-4 py-3 text-center text-xs text-slate-400">超支项</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/20">
                {energyStats.map((stat: any) => (
                  <motion.tr
                    key={stat.buildingId}
                    whileHover={{ backgroundColor: 'rgba(6,182,212,0.05)' }}
                    onClick={() => setSelectedBuildingId(stat.buildingId)}
                    className="cursor-pointer"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-white">{stat.buildingName}</div>
                    </td>
                    <td className="px-4 py-3 text-center font-mono text-amber-300">{stat.totalElectricity.toLocaleString()}</td>
                    <td className="px-4 py-3 text-center font-mono text-blue-300">{stat.totalWater.toLocaleString()}</td>
                    <td className="px-4 py-3 text-center font-mono text-orange-300">{stat.totalGas.toLocaleString()}</td>
                    <td className="px-4 py-3 text-center">
                      {stat.isOverBudget ? (
                        <span className="px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-400 text-xs">超标</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-xs">正常</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-xs text-slate-400">
                      {stat.overBudgetItems.length > 0
                        ? stat.overBudgetItems.map((i: string) => i === 'electricity' ? '电' : i === 'water' ? '水' : '气').join('、')
                        : '-'}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function WarningCenter({ onNavigateToHouse }: { onNavigateToHouse: (houseId: string) => void }) {
  const { warnings, acknowledgeWarning } = useWarningStore();
  const { currentUser } = useUserStore();
  const { getTenantByHouseId } = useHouseStore();
  const [filter, setFilter] = useState<'all' | 'vacant' | 'sublet'>('all');

  const filteredWarnings = filter === 'all' ? warnings : warnings.filter(w => w.type === filter);

  const getTenantName = useCallback((houseId: string) => {
    const tenant = getTenantByHouseId(houseId);
    return tenant?.name || '未知';
  }, [getTenantByHouseId]);

  return (
    <div className="w-full h-full p-6 overflow-y-auto scrollbar-thin">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <AlertTriangle className="w-7 h-7 text-red-400" />
            预警中心
          </h2>
          <p className="text-sm text-slate-400 mt-1 ml-10">智能预警 · 空置/转租异常检测</p>
        </div>
        <div className="flex gap-2">
          {(['all', 'vacant', 'sublet'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm transition-all',
                filter === f
                  ? 'bg-red-500/20 border border-red-400/30 text-red-300'
                  : 'bg-slate-800/50 border border-slate-700/30 text-slate-400 hover:text-white'
              )}
            >
              {f === 'all' ? '全部' : f === 'vacant' ? '空置预警' : '转租预警'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredWarnings.slice(0, 20).map(w => (
          <motion.div
            key={w.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              'glass-panel p-5 relative overflow-hidden',
              w.acknowledged && 'opacity-60'
            )}
          >
            <div className={cn(
              'absolute top-0 left-0 w-1 h-full',
              w.type === 'vacant' ? 'bg-amber-500' : 'bg-red-500'
            )} />
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-11 h-11 rounded-xl flex items-center justify-center',
                  w.type === 'vacant'
                    ? 'bg-amber-500/20 border border-amber-500/30'
                    : 'bg-red-500/20 border border-red-500/30'
                )}>
                  {w.type === 'vacant' ? (
                    <Thermometer className={cn('w-5 h-5', w.level === 'high' ? 'text-red-400' : w.level === 'medium' ? 'text-amber-400' : 'text-yellow-400')} />
                  ) : (
                    <AlertTriangle className={cn('w-5 h-5', w.level === 'high' ? 'text-red-400' : w.level === 'medium' ? 'text-amber-400' : 'text-yellow-400')} />
                  )}
                </div>
                <div>
                  <div className="font-bold text-white">{w.buildingName} {w.roomNumber}</div>
                  <div className="text-xs text-slate-500 flex items-center gap-2">
                    <span>{w.type === 'vacant' ? '空置预警' : '转租预警'}</span>
                    <span>·</span>
                    <span>住户: <span className="text-cyan-300">{getTenantName(w.houseId)}</span></span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigateToHouse(w.houseId)}
                  className="px-2 py-1 rounded-lg text-[10px] bg-slate-700/50 border border-slate-600/30 text-slate-300 hover:text-white hover:border-cyan-400/40 transition-all"
                >
                  查看房屋
                </button>
                {!w.acknowledged && (
                  <button
                    onClick={() => currentUser && acknowledgeWarning(w.id, currentUser.id)}
                    className="px-3 py-1.5 rounded-lg text-xs bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium hover:opacity-90 transition-opacity"
                  >
                    处理
                  </button>
                )}
                {w.acknowledged && (
                  <span className="px-3 py-1.5 rounded-lg text-xs bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                    已处理
                  </span>
                )}
              </div>
            </div>
            <p className="text-sm text-slate-300 mb-3">{w.description}</p>
            <div className="text-xs text-slate-500 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              检测时间: {new Date(w.detectedAt).toLocaleString('zh-CN')}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ApprovalCenter() {
  const { approvals, approveAtStage, rejectAtStage, getPendingCount, getCompletedCount, getRejectedCount } = useApprovalStore();
  const { tenants, getTenantById, getHouseById } = useHouseStore();
  const { currentUser } = useUserStore();
  const addLog = useOperationLogStore(s => s.addLog);
  const [statusFilter, setStatusFilter] = useState<ApprovalStatus | 'all'>('all');
  const [selectedApprovalId, setSelectedApprovalId] = useState<string | null>(null);
  const [opinionText, setOpinionText] = useState('');
  const [rejectMode, setRejectMode] = useState(false);

  const filteredApprovals = useMemo(() => {
    if (statusFilter === 'all') return approvals;
    return approvals.filter(a => a.status === statusFilter);
  }, [approvals, statusFilter]);

  const selectedApproval = useMemo(
    () => approvals.find(a => a.id === selectedApprovalId),
    [approvals, selectedApprovalId]
  );

  const selectedTenant = useMemo(
    () => selectedApproval ? getTenantById(selectedApproval.tenantId) : undefined,
    [selectedApproval, getTenantById]
  );

  const selectedHouse = useMemo(
    () => selectedApproval ? getHouseById(selectedApproval.houseId) : undefined,
    [selectedApproval, getHouseById]
  );

  const stageLabels: Record<ApprovalStage, string> = { street: '街道初审', district: '区住建复核', city: '市住建终审' };
  const stageOrder: ApprovalStage[] = ['street', 'district', 'city'];

  const handleApprove = useCallback(() => {
    if (!selectedApproval || !currentUser) return;
    const result = approveAtStage(selectedApproval.id, selectedApproval.currentStage, currentUser.name, opinionText || '同意');
    if (result) {
      addLog('approval_approve', currentUser.id, currentUser.name, currentUser.role,
        `${stageLabels[selectedApproval.currentStage]}通过：${selectedApproval.tenantName}的${selectedApproval.applyType}`,
        '审批通过', selectedApproval.id, selectedApproval.applyType);
      setOpinionText('');
      setRejectMode(false);
    }
  }, [selectedApproval, currentUser, approveAtStage, addLog, opinionText]);

  const handleReject = useCallback(() => {
    if (!selectedApproval || !currentUser || !opinionText.trim()) return;
    const result = rejectAtStage(selectedApproval.id, selectedApproval.currentStage, currentUser.name, opinionText);
    if (result) {
      addLog('approval_reject', currentUser.id, currentUser.name, currentUser.role,
        `${stageLabels[selectedApproval.currentStage]}驳回：${selectedApproval.tenantName}的${selectedApproval.applyType}，原因：${opinionText}`,
        '审批驳回', selectedApproval.id, selectedApproval.applyType);
      setOpinionText('');
      setRejectMode(false);
    }
  }, [selectedApproval, currentUser, rejectAtStage, addLog, opinionText]);

  const getStatusBadge = (status: ApprovalStatus) => {
    const map: Record<ApprovalStatus, { label: string; cls: string }> = {
      pending: { label: '待审批', cls: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
      approved: { label: '已通过', cls: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
      rejected: { label: '已驳回', cls: 'bg-red-500/15 text-red-300 border-red-500/30' },
      completed: { label: '已完成', cls: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' }
    };
    const cfg = map[status];
    return <span className={cn('px-2 py-0.5 rounded-full text-xs border', cfg.cls)}>{cfg.label}</span>;
  };

  const getStageProgress = (approval: typeof approvals[0]) => {
    const currentIdx = stageOrder.indexOf(approval.currentStage);
    return stageOrder.map((stage, idx) => {
      let state: 'done' | 'current' | 'pending' = 'pending';
      if (approval.status === 'rejected') {
        if (idx < currentIdx) state = 'done';
        else if (idx === currentIdx) state = 'current';
      } else if (approval.status === 'completed') {
        state = 'done';
      } else {
        if (idx < currentIdx) state = 'done';
        else if (idx === currentIdx) state = 'current';
      }
      return { stage, label: stageLabels[stage], state };
    });
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-950 via-amber-950/10 to-slate-950 flex overflow-hidden">
      <div className="w-[420px] border-r border-slate-700/30 flex flex-col">
        <div className="p-4 border-b border-slate-700/30">
          <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-3">
            <FileCheck2 className="w-6 h-6 text-amber-400" />
            审批中心
          </h2>
          <div className="flex gap-1.5">
            {(['all', 'pending', 'approved', 'rejected', 'completed'] as const).map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs transition-all',
                  statusFilter === s
                    ? 'bg-amber-500/20 border border-amber-400/30 text-amber-300'
                    : 'bg-slate-800/30 border border-slate-700/30 text-slate-400 hover:text-white'
                )}
              >
                {s === 'all' ? `全部(${approvals.length})` :
                 s === 'pending' ? `待审(${getPendingCount()})` :
                 s === 'completed' ? `完成(${getCompletedCount()})` :
                 s === 'rejected' ? `驳回(${getRejectedCount()})` : `通过(${approvals.filter(a => a.status === 'approved').length})`}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-2">
          {filteredApprovals.map(a => (
            <motion.button
              key={a.id}
              whileHover={{ x: 4 }}
              onClick={() => { setSelectedApprovalId(a.id); setOpinionText(''); setRejectMode(false); }}
              className={cn(
                'w-full p-3 rounded-xl text-left transition-all',
                selectedApprovalId === a.id
                  ? 'bg-amber-500/10 border border-amber-400/30'
                  : 'bg-slate-800/20 border border-slate-700/20 hover:bg-slate-800/40'
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-bold text-white">{a.tenantName}</span>
                {getStatusBadge(a.status)}
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-2">
                <span>{a.buildingName} {a.roomNumber}</span>
                <span>·</span>
                <span>{a.applyType}</span>
              </div>
              <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                <span>当前: {stageLabels[a.currentStage]}</span>
                <span>·</span>
                <span>申请金额: ¥{a.applyAmount}</span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-6">
        {selectedApproval && selectedTenant ? (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">
                审批详情 - {selectedApproval.id}
              </h3>
              {getStatusBadge(selectedApproval.status)}
            </div>

            <div className="glass-panel p-5">
              <h4 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" /> 住户信息
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-slate-800/30">
                  <div className="text-[10px] text-slate-500 mb-0.5">姓名</div>
                  <div className="text-sm text-white font-medium">{selectedTenant.name}</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-800/30">
                  <div className="text-[10px] text-slate-500 mb-0.5">家庭人口</div>
                  <div className="text-sm text-white font-medium">{selectedTenant.familyMembers}人</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-800/30">
                  <div className="text-[10px] text-slate-500 mb-0.5">当前月收入</div>
                  <div className="text-sm text-amber-300 font-mono">¥{selectedTenant.monthlyIncome.toLocaleString()}</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-800/30">
                  <div className="text-[10px] text-slate-500 mb-0.5">联系电话</div>
                  <div className="text-sm text-cyan-300 font-mono">{selectedTenant.phone}</div>
                </div>
              </div>
            </div>

            <div className="glass-panel p-5">
              <h4 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-amber-400" /> 补贴调整方案
              </h4>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="p-3 rounded-lg bg-slate-800/30 text-center">
                  <div className="text-[10px] text-slate-500 mb-1">原月租金</div>
                  <div className="text-lg font-bold text-white font-mono">
                    ¥{selectedHouse?.monthlyRent || '-'}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-800/30 text-center">
                  <div className="text-[10px] text-slate-500 mb-1">原补贴比例</div>
                  <div className="text-lg font-bold text-slate-300 font-mono">
                    {selectedTenant.subsidyRatio ? (selectedTenant.subsidyRatio * 100).toFixed(0) + '%' : '-'}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-center">
                  <div className="text-[10px] text-amber-400 mb-1">建议调整比例</div>
                  <div className="text-lg font-bold text-amber-300 font-mono">
                    {selectedApproval.subsidyRatio ? (selectedApproval.subsidyRatio * 100).toFixed(0) + '%' : '-'}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-slate-800/30">
                  <div className="text-[10px] text-slate-500 mb-1">申请补贴金额</div>
                  <div className="text-sm text-cyan-300 font-mono font-bold">¥{selectedApproval.applyAmount}/月</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-800/30">
                  <div className="text-[10px] text-slate-500 mb-1">调整后实缴</div>
                  <div className="text-sm text-emerald-300 font-mono font-bold">
                    ¥{selectedHouse ? Math.max(0, selectedHouse.monthlyRent - selectedApproval.applyAmount) : '-'}/月
                  </div>
                </div>
              </div>
              <div className="mt-3 p-3 rounded-lg bg-blue-500/5 border border-blue-500/15">
                <div className="text-xs text-blue-300">
                  收入变化：月收入 ¥{selectedTenant.monthlyIncome.toLocaleString()}，
                  {selectedTenant.monthlyIncome < 5000 ? '低于保障线，建议提高补贴比例' :
                   selectedTenant.monthlyIncome < 8000 ? '接近保障线，建议维持或微调补贴比例' :
                   '超过保障线，建议降低补贴比例'}
                </div>
              </div>
            </div>

            <div className="glass-panel p-5">
              <h4 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                <ArrowRight className="w-4 h-4 text-purple-400" /> 审批流程
              </h4>
              <div className="space-y-3">
                {getStageProgress(selectedApproval).map(({ stage, label, state }, idx) => (
                  <div key={stage} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold',
                        state === 'done' ? 'bg-emerald-500 text-white' :
                        state === 'current' ? 'bg-amber-500 text-white ring-2 ring-amber-400/30' :
                        'bg-slate-700 text-slate-500'
                      )}>
                        {state === 'done' ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                      </div>
                      {idx < 2 && <div className={cn('w-0.5 h-8', state === 'done' ? 'bg-emerald-500' : 'bg-slate-700')} />}
                    </div>
                    <div className="flex-1 pt-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className={cn('text-sm font-medium', state === 'current' ? 'text-amber-300' : state === 'done' ? 'text-emerald-300' : 'text-slate-500')}>
                          {label}
                        </span>
                        {state === 'done' && (
                          <span className="text-[10px] text-emerald-400">
                            {stage === 'street' ? selectedApproval.streetApproveTime :
                             stage === 'district' ? selectedApproval.districtApproveTime :
                             selectedApproval.cityApproveTime ? new Date(selectedApproval.cityApproveTime).toLocaleDateString('zh-CN') : ''}
                          </span>
                        )}
                      </div>
                      {state !== 'pending' && (
                        <div className="text-xs text-slate-400">
                          <span className="text-slate-500">
                            {stage === 'street' ? selectedApproval.streetApprover :
                             stage === 'district' ? selectedApproval.districtApprover :
                             selectedApproval.cityApprover || '-'}
                          </span>
                          {(stage === 'street' ? selectedApproval.streetOpinion :
                            stage === 'district' ? selectedApproval.districtOpinion :
                            selectedApproval.cityOpinion) && (
                            <span className="ml-2">
                              {(stage === 'street' ? selectedApproval.streetOpinion :
                                stage === 'district' ? selectedApproval.districtOpinion :
                                selectedApproval.cityOpinion)}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedApproval.status === 'pending' && (
              <div className="glass-panel p-5">
                <h4 className="text-sm font-bold text-slate-300 mb-3">审批操作</h4>
                <div className="mb-3 text-xs text-slate-400">
                  当前环节：<span className="text-amber-300 font-medium">{stageLabels[selectedApproval.currentStage]}</span>
                </div>
                <textarea
                  value={opinionText}
                  onChange={e => setOpinionText(e.target.value)}
                  placeholder={rejectMode ? '请输入驳回原因（必填）' : '审批意见（选填）'}
                  className="w-full h-20 px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700/30 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400/40 resize-none"
                />
                <div className="flex gap-3 mt-3">
                  <button
                    onClick={handleApprove}
                    className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" /> 通过并流转
                  </button>
                  <button
                    onClick={() => setRejectMode(true)}
                    className={cn(
                      'px-5 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2',
                      rejectMode
                        ? 'bg-red-500 text-white'
                        : 'bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20'
                    )}
                  >
                    <XCircle className="w-4 h-4" /> 驳回
                  </button>
                </div>
                {rejectMode && opinionText.trim() && (
                  <button
                    onClick={handleReject}
                    className="w-full mt-2 py-2.5 rounded-lg text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
                  >
                    确认驳回
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <FileCheck2 className="w-16 h-16 text-amber-400/20 mx-auto mb-4" />
              <p className="text-slate-500">请从左侧选择一条审批申请</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function OperationLogs() {
  const { logs, getLogs } = useOperationLogStore();
  const { currentUser, hasPermission } = useUserStore();
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [operatorFilter, setOperatorFilter] = useState<string>('all');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const canFilter = hasPermission('district_director');

  const actionLabels: Record<string, { label: string; icon: typeof ScanFace; color: string }> = {
    face_login: { label: '人脸识别登录', icon: ScanFace, color: 'text-cyan-400' },
    role_switch: { label: '角色切换', icon: Users, color: 'text-purple-400' },
    approval_approve: { label: '审批通过', icon: CheckCircle2, color: 'text-emerald-400' },
    approval_reject: { label: '审批驳回', icon: XCircle, color: 'text-red-400' },
    warning_ack: { label: '预警处置', icon: AlertTriangle, color: 'text-amber-400' },
    report_export: { label: '报表导出', icon: Download, color: 'text-blue-400' },
    repair_assign: { label: '维修派单', icon: Wrench, color: 'text-teal-400' },
    repair_escalate: { label: '维修升级', icon: ArrowUpRight, color: 'text-orange-400' }
  };

  const operators = useMemo(() => {
    const map = new Map<string, { name: string; role: string }>();
    logs.forEach(l => {
      if (!map.has(l.operatorId)) {
        map.set(l.operatorId, { name: l.operatorName, role: l.operatorRole });
      }
    });
    return Array.from(map.entries());
  }, [logs]);

  const filteredLogs = useMemo(() => {
    return getLogs({
      action: actionFilter !== 'all' ? actionFilter as any : undefined,
      operatorId: operatorFilter !== 'all' ? operatorFilter : undefined,
      startTime: startTime || undefined,
      endTime: endTime || undefined
    }).sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }, [getLogs, actionFilter, operatorFilter, startTime, endTime]);

  const roleLabels: Record<string, string> = {
    tenant: '租户', property: '物业', staff: '街道专干',
    district_director: '区分局长', city_director: '市住建局长'
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 overflow-y-auto scrollbar-thin">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <ListChecks className="w-7 h-7 text-slate-400" />
            操作日志
          </h2>
          <p className="text-sm text-slate-400 mt-1 ml-10">全系统操作审计追踪 · 可追溯可查询</p>
        </div>
        <div className="text-xs text-slate-500">
          共 <span className="text-cyan-300 font-bold">{filteredLogs.length}</span> 条记录
        </div>
      </div>

      <div className="glass-panel p-4 mb-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <span className="text-xs text-slate-400">筛选:</span>
          </div>
          <select
            value={actionFilter}
            onChange={e => setActionFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/30 text-sm text-slate-300 focus:outline-none focus:border-cyan-400/40"
          >
            <option value="all">全部操作</option>
            {Object.entries(actionLabels).map(([key, val]) => (
              <option key={key} value={key}>{val.label}</option>
            ))}
          </select>
          {canFilter && (
            <select
              value={operatorFilter}
              onChange={e => setOperatorFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/30 text-sm text-slate-300 focus:outline-none focus:border-cyan-400/40"
            >
              <option value="all">全部人员</option>
              {operators.map(([id, info]) => (
                <option key={id} value={id}>{info.name} ({roleLabels[info.role] || info.role})</option>
              ))}
            </select>
          )}
          {canFilter && (
            <>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500">从</span>
                <input
                  type="date"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  className="px-2 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/30 text-xs text-slate-300 focus:outline-none focus:border-cyan-400/40"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500">至</span>
                <input
                  type="date"
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  className="px-2 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/30 text-xs text-slate-300 focus:outline-none focus:border-cyan-400/40"
                />
              </div>
            </>
          )}
          {(actionFilter !== 'all' || operatorFilter !== 'all' || startTime || endTime) && (
            <button
              onClick={() => { setActionFilter('all'); setOperatorFilter('all'); setStartTime(''); setEndTime(''); }}
              className="px-3 py-1.5 rounded-lg text-xs bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
            >
              重置
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {filteredLogs.map((log, idx) => {
          const actionInfo = actionLabels[log.action];
          const Icon = actionInfo?.icon || Activity;
          return (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(idx * 0.02, 0.5) }}
              className="glass-panel p-4 flex items-center gap-4 hover:bg-slate-800/30 transition-colors"
            >
              <div className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                'bg-slate-800/50 border border-slate-700/30'
              )}>
                <Icon className={cn('w-5 h-5', actionInfo?.color || 'text-slate-400')} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-medium text-white">{actionInfo?.label || log.action}</span>
                  <span className={cn(
                    'px-2 py-0.5 rounded text-[10px]',
                    log.result.includes('成功') || log.result.includes('通过') || log.result.includes('已')
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : log.result.includes('驳回')
                        ? 'bg-red-500/15 text-red-400'
                        : 'bg-slate-500/15 text-slate-400'
                  )}>
                    {log.result}
                  </span>
                </div>
                <div className="text-xs text-slate-400 truncate">{log.detail}</div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-xs text-white font-medium">{log.operatorName}</div>
                <div className="text-[10px] text-slate-500">{roleLabels[log.operatorRole] || log.operatorRole}</div>
              </div>

              <div className="text-right shrink-0 min-w-[120px]">
                <div className="text-xs text-slate-400 font-mono">
                  {new Date(log.timestamp).toLocaleDateString('zh-CN')}
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  {new Date(log.timestamp).toLocaleTimeString('zh-CN')}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default function Home() {
  const [activeMenu, setActiveMenu] = useState<MenuKey>('overview');
  const [sidePanelCollapsed, setSidePanelCollapsed] = useState(false);
  const { viewMode, selectedBuildingId, selectedHouseId, selectHouse } = useSceneStore();
  const { getHouseById } = useHouseStore();

  const selectedHouse = selectedHouseId ? getHouseById(selectedHouseId) : null;

  const handleNavigateToHouse = useCallback((houseId: string) => {
    setActiveMenu('overview');
    setTimeout(() => selectHouse(houseId), 100);
  }, [selectHouse]);

  const renderMainContent = () => {
    switch (activeMenu) {
      case 'lottery':
        return <LotteryScreen />;
      case 'repair':
        return <RepairDispatch />;
      case 'report':
        return <ReportExport />;
      case 'energy':
        return <EnergyManagement />;
      case 'warning':
        return <WarningCenter onNavigateToHouse={handleNavigateToHouse} />;
      case 'approval':
        return <ApprovalCenter />;
      case 'logs':
        return <OperationLogs />;
      case 'overview':
      default:
        if (selectedHouseId) {
          return <HouseScene houseId={selectedHouseId} />;
        }
        if (selectedBuildingId) {
          return <BuildingScene buildingId={selectedBuildingId} />;
        }
        return <CommunityScene />;
    }
  };

  const show3DScene = activeMenu === 'overview';
  const showStatsDashboard = show3DScene;
  const showHouseDetail = show3DScene && selectedHouse;

  return (
    <div className="fixed inset-0 overflow-hidden bg-slate-950">
      <TopNav />

      <SidePanel
        collapsed={sidePanelCollapsed}
        onToggle={() => setSidePanelCollapsed(!sidePanelCollapsed)}
        activeMenu={activeMenu}
        onMenuChange={setActiveMenu}
      />

      <motion.main
        initial={false}
        animate={{
          marginLeft: sidePanelCollapsed ? 80 : 240,
          marginRight: showHouseDetail ? 384 : 0
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="absolute top-16 bottom-12 left-0 right-0 transition-all"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeMenu + (selectedHouseId || '') + (selectedBuildingId || '')}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full relative"
          >
            {renderMainContent()}
          </motion.div>
        </AnimatePresence>
      </motion.main>

      {showHouseDetail && selectedHouse && (
        <AnimatePresence>
          <HouseDetailPanel house={selectedHouse} onClose={() => selectHouse(null)} />
        </AnimatePresence>
      )}

      {showStatsDashboard && <StatsDashboard />}

      {show3DScene && <BreadcrumbNav />}
      {show3DScene && <ViewModeBadge />}

      <StatusBar />
    </div>
  );
}
