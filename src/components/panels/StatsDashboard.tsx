import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  Home,
  Users,
  AlertTriangle,
  RefreshCw,
  Percent,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import useHouseStore from '@/store/useHouseStore';
import useWarningStore from '@/store/useWarningStore';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  suffix?: string;
  iconColor: string;
  iconBg: string;
  glowColor: string;
  trend?: 'up' | 'down';
  trendValue?: string;
  delay?: number;
}

function StatCard({
  icon,
  label,
  value,
  suffix,
  iconColor,
  iconBg,
  glowColor,
  trend,
  trendValue,
  delay = 0
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: 'easeOut' }}
      className="relative overflow-hidden glass-panel p-4 group hover:scale-[1.02] transition-transform duration-300"
      style={{
        boxShadow: `0 0 30px ${glowColor}`,
      }}
    >
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
        style={{
          background: `radial-gradient(circle at top right, ${glowColor}, transparent 70%)`
        }}
      />
      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs text-slate-400 mb-2">{label}</p>
          <div className="flex items-baseline gap-1">
            <span
              className="text-3xl font-bold led-text tracking-wider"
              style={{
                color: iconColor,
                textShadow: `0 0 12px ${iconColor}, 0 0 24px ${glowColor}`
              }}
            >
              {value}
            </span>
            {suffix && (
              <span className="text-sm text-slate-400 font-medium">{suffix}</span>
            )}
          </div>
          {trendValue && (
            <div className="mt-2 flex items-center gap-1 text-xs">
              {trend === 'up' ? (
                <TrendingUp size={12} className="text-green-400" />
              ) : (
                <TrendingDown size={12} className="text-red-400" />
              )}
              <span className={trend === 'up' ? 'text-green-400' : 'text-red-400'}>
                {trendValue}
              </span>
            </div>
          )}
        </div>
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconBg} border border-white/10`}
          style={{
            boxShadow: `inset 0 0 20px ${glowColor}, 0 0 15px ${glowColor}`
          }}
        >
          <div className={iconColor}>{icon}</div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-0.5 opacity-50"
        style={{ background: `linear-gradient(90deg, transparent, ${iconColor}, transparent)` }}
      />
    </motion.div>
  );
}

export default function StatsDashboard() {
  const { buildings, houses } = useHouseStore();
  const { getWarningCount, getWarnings } = useWarningStore();

  const stats = useMemo(() => {
    const buildingCount = buildings.length;
    const houseCount = houses.length;
    const occupiedHouses = houses.filter((h) => h.status !== 'available');
    const tenantCount = occupiedHouses.length;
    const vacantWarningCount = getWarningCount('vacant');
    const subletWarningCount = getWarningCount('sublet');
    const overdueHouses = houses.filter((h) => h.status === 'overdue_rent').length;
    const overdueRate = tenantCount > 0 ? Math.round((overdueHouses / tenantCount) * 100) : 0;

    return {
      buildingCount,
      houseCount,
      tenantCount,
      vacantWarningCount,
      subletWarningCount,
      overdueRate
    };
  }, [buildings, houses, getWarningCount, getWarnings]);

  return (
    <div className="w-full px-4 pt-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 max-w-7xl mx-auto">
        <StatCard
          icon={<Building2 size={24} />}
          label="楼栋总数"
          value={stats.buildingCount}
          suffix="栋"
          iconColor="text-cyan-400"
          iconBg="bg-cyan-500/20"
          glowColor="rgba(34, 211, 238, 0.3)"
          trend="up"
          trendValue="+1 本月新增"
          delay={0}
        />
        <StatCard
          icon={<Home size={24} />}
          label="房屋总数"
          value={stats.houseCount}
          suffix="套"
          iconColor="text-blue-400"
          iconBg="bg-blue-500/20"
          glowColor="rgba(96, 165, 250, 0.3)"
          delay={0.05}
        />
        <StatCard
          icon={<Users size={24} />}
          label="在租户数"
          value={stats.tenantCount}
          suffix="户"
          iconColor="text-green-400"
          iconBg="bg-green-500/20"
          glowColor="rgba(74, 222, 128, 0.3)"
          trend="up"
          trendValue="入住率 89%"
          delay={0.1}
        />
        <StatCard
          icon={<AlertTriangle size={24} />}
          label="空置预警"
          value={stats.vacantWarningCount}
          suffix="条"
          iconColor="text-yellow-400"
          iconBg="bg-yellow-500/20"
          glowColor="rgba(250, 204, 21, 0.3)"
          trend={stats.vacantWarningCount > 0 ? 'up' : 'down'}
          trendValue={stats.vacantWarningCount > 0 ? '需处理' : '正常'}
          delay={0.15}
        />
        <StatCard
          icon={<RefreshCw size={24} />}
          label="转租预警"
          value={stats.subletWarningCount}
          suffix="条"
          iconColor="text-red-400"
          iconBg="bg-red-500/20"
          glowColor="rgba(248, 113, 113, 0.3)"
          trend={stats.subletWarningCount > 0 ? 'up' : 'down'}
          trendValue={stats.subletWarningCount > 0 ? '高风险' : '正常'}
          delay={0.2}
        />
        <StatCard
          icon={<Percent size={24} />}
          label="欠费率"
          value={stats.overdueRate}
          suffix="%"
          iconColor={stats.overdueRate > 5 ? 'text-red-400' : 'text-purple-400'}
          iconBg={stats.overdueRate > 5 ? 'bg-red-500/20' : 'bg-purple-500/20'}
          glowColor={stats.overdueRate > 5 ? 'rgba(248, 113, 113, 0.3)' : 'rgba(192, 132, 252, 0.3)'}
          trend={stats.overdueRate > 5 ? 'up' : 'down'}
          trendValue={stats.overdueRate > 5 ? '超阈值' : '正常范围'}
          delay={0.25}
        />
      </div>
    </div>
  );
}
