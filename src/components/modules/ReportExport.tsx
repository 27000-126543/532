import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileSpreadsheet,
  Download,
  ChevronDown,
  Building2,
  Percent,
  Clock,
  AlertTriangle,
  Home,
  Users,
  DollarSign,
  MapPin,
  BarChart3,
  FileCheck,
  Loader2,
  CheckCircle2,
  Calendar,
  Filter,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import * as XLSX from 'xlsx';
import useHouseStore from '@/store/useHouseStore';
import useWarningStore from '@/store/useWarningStore';
import { cn } from '@/lib/utils';

type Quarter = 'Q1' | 'Q2' | 'Q3' | 'Q4';

interface BuildingStats {
  buildingId: string;
  buildingName: string;
  district: string;
  street: string;
  totalUnits: number;
  occupiedUnits: number;
  availableUnits: number;
  vacancyRate: number;
  overdueCount: number;
  overdueRate: number;
  totalRent: number;
  collectedRent: number;
  arrearsAmount: number;
  repairCount: number;
  avgRepairTime: number;
  subletWarnings: number;
  vacantWarnings: number;
  manager: string;
  phone: string;
  builtYear: number;
}

const quarters: { value: Quarter; label: string; months: string[] }[] = [
  { value: 'Q1', label: '第一季度 (1-3月)', months: ['01', '02', '03'] },
  { value: 'Q2', label: '第二季度 (4-6月)', months: ['04', '05', '06'] },
  { value: 'Q3', label: '第三季度 (7-9月)', months: ['07', '08', '09'] },
  { value: 'Q4', label: '第四季度 (10-12月)', months: ['10', '11', '12'] }
];

export default function ReportExport() {
  const { buildings, houses, tenants, repairOrders } = useHouseStore();
  const { warnings } = useWarningStore();

  const [selectedQuarter, setSelectedQuarter] = useState<Quarter>('Q2');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [quarterDropdownOpen, setQuarterDropdownOpen] = useState(false);
  const [districtDropdownOpen, setDistrictDropdownOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const districts = useMemo(() => {
    const set = new Set(buildings.map(b => b.district));
    return ['all', ...Array.from(set)];
  }, [buildings]);

  const filteredBuildings = useMemo(() => {
    return selectedDistrict === 'all'
      ? buildings
      : buildings.filter(b => b.district === selectedDistrict);
  }, [buildings, selectedDistrict]);

  const buildingStats: BuildingStats[] = useMemo(() => {
    return filteredBuildings.map(building => {
      const buildingHouses = houses.filter(h => h.buildingId === building.id);
      const occupiedHouses = buildingHouses.filter(h => h.status !== 'available');
      const availableHouses = buildingHouses.filter(h => h.status === 'available');
      const overdueHouses = buildingHouses.filter(h => h.status === 'overdue_rent');
      const buildingRepairs = repairOrders.filter(r => r.buildingId === building.id);
      const completedRepairs = buildingRepairs.filter(r => r.status === 'completed');

      let totalRepairTime = 0;
      completedRepairs.forEach(r => {
        if (r.reportTime && r.completedTime) {
          totalRepairTime += (new Date(r.completedTime).getTime() - new Date(r.reportTime).getTime()) / (1000 * 60 * 60);
        }
      });
      const avgRepairTime = completedRepairs.length > 0 ? totalRepairTime / completedRepairs.length : 0;

      const totalRent = occupiedHouses.reduce((sum, h) => sum + h.monthlyRent * 3, 0);
      const arrearsAmount = overdueHouses.reduce((sum, h) => sum + h.monthlyRent * (h.overdueDays ? Math.ceil(h.overdueDays / 30) : 1), 0);

      const buildingWarnings = warnings.filter(w => w.buildingId === building.id);
      const subletWarnings = buildingWarnings.filter(w => w.type === 'sublet').length;
      const vacantWarnings = buildingWarnings.filter(w => w.type === 'vacant').length;

      return {
        buildingId: building.id,
        buildingName: building.name,
        district: building.district,
        street: building.street,
        totalUnits: buildingHouses.length,
        occupiedUnits: occupiedHouses.length,
        availableUnits: availableHouses.length,
        vacancyRate: buildingHouses.length > 0 ? (availableHouses.length / buildingHouses.length) * 100 : 0,
        overdueCount: overdueHouses.length,
        overdueRate: occupiedHouses.length > 0 ? (overdueHouses.length / occupiedHouses.length) * 100 : 0,
        totalRent,
        collectedRent: totalRent - arrearsAmount,
        arrearsAmount,
        repairCount: buildingRepairs.length,
        avgRepairTime,
        subletWarnings,
        vacantWarnings,
        manager: building.propertyManager,
        phone: building.phone,
        builtYear: building.builtYear
      };
    });
  }, [filteredBuildings, houses, repairOrders, warnings]);

  const overallStats = useMemo(() => {
    const totalUnits = buildingStats.reduce((s, b) => s + b.totalUnits, 0);
    const availableUnits = buildingStats.reduce((s, b) => s + b.availableUnits, 0);
    const occupiedUnits = buildingStats.reduce((s, b) => s + b.occupiedUnits, 0);
    const totalOverdue = buildingStats.reduce((s, b) => s + b.overdueCount, 0);
    const totalRepairs = buildingStats.reduce((s, b) => s + b.repairCount, 0);
    const avgRepair = buildingStats.length > 0
      ? buildingStats.reduce((s, b) => s + b.avgRepairTime, 0) / buildingStats.length
      : 0;
    const totalSublet = buildingStats.reduce((s, b) => s + b.subletWarnings, 0);
    const totalVacant = buildingStats.reduce((s, b) => s + b.vacantWarnings, 0);
    const totalArrears = buildingStats.reduce((s, b) => s + b.arrearsAmount, 0);
    const totalRent = buildingStats.reduce((s, b) => s + b.totalRent, 0);

    return {
      vacancyRate: totalUnits > 0 ? (availableUnits / totalUnits) * 100 : 0,
      overdueRate: occupiedUnits > 0 ? (totalOverdue / occupiedUnits) * 100 : 0,
      avgRepairTime: avgRepair,
      subletCount: totalSublet,
      vacantCount: totalVacant,
      totalArrears,
      totalRent,
      totalUnits,
      occupiedUnits,
      availableUnits,
      totalRepairs,
      subletInvestigations: totalSublet,
      totalTenants: tenants.length
    };
  }, [buildingStats, tenants]);

  const handleExport = async () => {
    setExporting(true);

    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      const wb = XLSX.utils.book_new();

      const summaryData = [
        ['保障性住房管理统计报表'],
        [`统计周期: 2026年${quarters.find(q => q.value === selectedQuarter)?.label}`],
        [`统计范围: ${selectedDistrict === 'all' ? '全部行政区' : selectedDistrict}`],
        [`生成时间: ${new Date().toLocaleString('zh-CN')}`],
        [],
        ['指标名称', '数值', '单位'],
        ['总房源数', overallStats.totalUnits, '套'],
        ['已入住', overallStats.occupiedUnits, '套'],
        ['空置房源', overallStats.availableUnits, '套'],
        ['空置率', overallStats.vacancyRate.toFixed(2) + '%', '%'],
        ['欠租房源数', buildingStats.reduce((s, b) => s + b.overdueCount, 0), '套'],
        ['欠费率', overallStats.overdueRate.toFixed(2) + '%', '%'],
        ['欠费总额', overallStats.totalArrears.toLocaleString(), '元'],
        ['应收租金总额', overallStats.totalRent.toLocaleString(), '元'],
        ['报修工单总数', overallStats.totalRepairs, '单'],
        ['平均响应时间', overallStats.avgRepairTime.toFixed(2), '小时'],
        ['空置预警数', overallStats.vacantCount, '起'],
        ['转租预警数', overallStats.subletCount, '起'],
        ['转租查处数', overallStats.subletInvestigations, '起']
      ];
      const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
      wsSummary['!cols'] = [
        { wch: 25 }, { wch: 20 }, { wch: 15 }
      ];
      wsSummary['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: 2 } },
        { s: { r: 2, c: 0 }, e: { r: 2, c: 2 } }
      ];
      XLSX.utils.book_append_sheet(wb, wsSummary, '统计汇总');

      const detailHeader = [
        '楼栋编号', '楼栋名称', '行政区', '街道', '建成年份',
        '总套数', '已入住', '空置套数', '空置率(%)',
        '欠租房源', '欠费率(%)', '欠费金额(元)',
        '应收租金(元)', '报修工单', '平均响应时间(小时)',
        '空置预警', '转租预警', '物业经理', '联系电话'
      ];
      const detailData = [
        detailHeader,
        ...buildingStats.map(b => [
          b.buildingId, b.buildingName, b.district, b.street, b.builtYear,
          b.totalUnits, b.occupiedUnits, b.availableUnits, b.vacancyRate.toFixed(2),
          b.overdueCount, b.overdueRate.toFixed(2), b.arrearsAmount,
          b.totalRent, b.repairCount, b.avgRepairTime.toFixed(2),
          b.vacantWarnings, b.subletWarnings, b.manager, b.phone
        ])
      ];
      const wsDetail = XLSX.utils.aoa_to_sheet(detailData);
      wsDetail['!cols'] = detailHeader.map((_, i) => ({
        wch: i === 1 ? 22 : i === 18 ? 15 : i >= 5 && i <= 16 ? 14 : 12
      }));
      wsDetail['!autofilter'] = { ref: `A1:${String.fromCharCode(64 + detailHeader.length)}${buildingStats.length + 1}` };
      XLSX.utils.book_append_sheet(wb, wsDetail, '楼栋明细');

      const tenantHeader = ['租户ID', '姓名', '楼栋', '房号', '面积', '户型', '月租金', '入住日期', '合同到期', '联系电话'];
      const tenantData = [
        tenantHeader,
        ...tenants.slice(0, 100).map(t => {
          const house = houses.find(h => h.id === t.houseId);
          return [
            t.id, t.name, house?.buildingName || '-', house?.roomNumber || '-',
            house?.area || 0, house?.layout || '-', house?.monthlyRent || 0,
            t.leaseStart, t.leaseEnd, t.phone
          ];
        })
      ];
      const wsTenant = XLSX.utils.aoa_to_sheet(tenantData);
      wsTenant['!cols'] = tenantHeader.map(() => ({ wch: 16 }));
      XLSX.utils.book_append_sheet(wb, wsTenant, '租户信息(前100条)');

      const fileName = `保障性住房统计报表_2026${selectedQuarter}_${selectedDistrict === 'all' ? '全部' : selectedDistrict}_${new Date().getTime()}.xlsx`;
      XLSX.writeFile(wb, fileName);

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setExporting(false);
    }
  };

  const StatCard = ({
    icon: Icon,
    label,
    value,
    unit,
    color,
    trend,
    subValue
  }: {
    icon: typeof Building2;
    label: string;
    value: string | number;
    unit?: string;
    color: string;
    trend?: 'up' | 'down' | 'neutral';
    subValue?: string;
  }) => (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      className="glass-panel p-5 relative overflow-hidden group"
    >
      <div className={cn(
        'absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-10',
        color.replace('text-', 'bg-')
      )} />
      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <div className={cn(
            'w-11 h-11 rounded-xl flex items-center justify-center',
            color.replace('text-', 'bg-').replace('-400', '-500/20').replace('-300', '-500/20'),
            'border',
            color.replace('text-', 'border-').replace('-400', '-500/30').replace('-300', '-500/30')
          )}>
            <Icon className={cn('w-6 h-6', color)} />
          </div>
          {trend && (
            <div className={cn(
              'flex items-center gap-1 text-xs px-2 py-0.5 rounded-full',
              trend === 'up' ? 'bg-emerald-500/15 text-emerald-400' :
                trend === 'down' ? 'bg-red-500/15 text-red-400' :
                  'bg-slate-500/15 text-slate-400'
            )}>
              {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : trend === 'down' ? <TrendingDown className="w-3 h-3" /> : null}
              {trend !== 'neutral' && (subValue || '')}
            </div>
          )}
        </div>
        <div className="text-xs text-slate-400 mb-1">{label}</div>
        <div className="flex items-baseline gap-1">
          <span className={cn('text-3xl font-bold font-mono', color, 'glow-text')}>
            {value}
          </span>
          {unit && <span className="text-sm text-slate-400">{unit}</span>}
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-950 via-blue-950/20 to-slate-950 p-6 overflow-y-auto scrollbar-thin">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="relative">
              <FileSpreadsheet className="w-8 h-8 text-emerald-400" />
              <div className="absolute inset-0 bg-emerald-400/20 blur-xl rounded-full" />
            </div>
            数据统计与报表导出
          </h2>
          <p className="text-sm text-slate-400 mt-1 ml-11">多维度数据分析 · 一键导出Excel报表</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => {
                  setQuarterDropdownOpen(!quarterDropdownOpen);
                  setDistrictDropdownOpen(false);
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-600/30 hover:border-cyan-400/40 transition-all min-w-[200px]"
              >
                <Calendar className="w-4 h-4 text-cyan-400" />
                <span className="text-sm text-slate-300">2026{selectedQuarter}</span>
                <span className="text-xs text-slate-500 flex-1 text-right">
                  {quarters.find(q => q.value === selectedQuarter)?.label}
                </span>
                <ChevronDown className={cn('w-4 h-4 text-slate-400 transition-transform', quarterDropdownOpen && 'rotate-180')} />
              </button>

              <AnimatePresence>
                {quarterDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute right-0 mt-2 w-72 glass-panel overflow-hidden z-20"
                  >
                    <div className="p-1">
                      {quarters.map(q => (
                        <button
                          key={q.value}
                          onClick={() => {
                            setSelectedQuarter(q.value);
                            setQuarterDropdownOpen(false);
                          }}
                          className={cn(
                            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left',
                            selectedQuarter === q.value
                              ? 'bg-cyan-500/15 border border-cyan-400/30'
                              : 'hover:bg-slate-700/30'
                          )}
                        >
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                            <span className="text-sm font-bold text-cyan-300">{q.value}</span>
                          </div>
                          <div>
                            <div className={cn('text-sm font-medium', selectedQuarter === q.value ? 'text-cyan-300' : 'text-white')}>
                              2026{q.value}
                            </div>
                            <div className="text-xs text-slate-500">{q.label}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative">
              <button
                onClick={() => {
                  setDistrictDropdownOpen(!districtDropdownOpen);
                  setQuarterDropdownOpen(false);
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-600/30 hover:border-cyan-400/40 transition-all min-w-[160px]"
              >
                <MapPin className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-slate-300 flex-1 text-left">
                  {selectedDistrict === 'all' ? '全部行政区' : selectedDistrict}
                </span>
                <ChevronDown className={cn('w-4 h-4 text-slate-400 transition-transform', districtDropdownOpen && 'rotate-180')} />
              </button>

              <AnimatePresence>
                {districtDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute right-0 mt-2 w-48 glass-panel overflow-hidden z-20"
                  >
                    <div className="p-1 max-h-60 overflow-y-auto scrollbar-thin">
                      {districts.map(d => (
                        <button
                          key={d}
                          onClick={() => {
                            setSelectedDistrict(d);
                            setDistrictDropdownOpen(false);
                          }}
                          className={cn(
                            'w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-left',
                            selectedDistrict === d
                              ? 'bg-purple-500/15 border border-purple-400/30'
                              : 'hover:bg-slate-700/30'
                          )}
                        >
                          <MapPin className={cn('w-4 h-4', selectedDistrict === d ? 'text-purple-400' : 'text-slate-500')} />
                          <span className={cn('text-sm', selectedDistrict === d ? 'text-purple-300' : 'text-slate-300')}>
                            {d === 'all' ? '全部行政区' : d}
                          </span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="h-8 w-px bg-slate-700" />

          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/30 border border-slate-700/30">
            <Filter className="w-4 h-4 text-slate-500" />
            <span className="text-xs text-slate-400">
              {filteredBuildings.length} 栋楼 · {houses.filter(h => filteredBuildings.some(b => b.id === h.buildingId)).length} 套房
            </span>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleExport}
            disabled={exporting}
            className={cn(
              'flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-all shadow-lg',
              exporting
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-emerald-500/25 hover:shadow-emerald-500/40'
            )}
          >
            {exporting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : exportSuccess ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <Download className="w-5 h-5" />
            )}
            {exporting ? '正在导出...' : exportSuccess ? '导出成功' : '导出Excel报表'}
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={Home}
          label="空置率"
          value={overallStats.vacancyRate.toFixed(2)}
          unit="%"
          color="text-cyan-400"
          trend="down"
          subValue="-2.1%"
        />
        <StatCard
          icon={DollarSign}
          label="欠费率"
          value={overallStats.overdueRate.toFixed(2)}
          unit="%"
          color="text-rose-400"
          trend="down"
          subValue="-1.5%"
        />
        <StatCard
          icon={Clock}
          label="报修平均响应时间"
          value={overallStats.avgRepairTime.toFixed(1)}
          unit="小时"
          color="text-amber-400"
          trend="down"
          subValue="-0.8h"
        />
        <StatCard
          icon={AlertTriangle}
          label="转租查处数"
          value={overallStats.subletInvestigations}
          unit="起"
          color="text-emerald-400"
          trend="up"
          subValue="+3起"
        />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard
          icon={Building2}
          label="管理楼栋总数"
          value={filteredBuildings.length}
          unit="栋"
          color="text-blue-400"
        />
        <StatCard
          icon={Users}
          label="服务租户总数"
          value={overallStats.totalTenants}
          unit="户"
          color="text-purple-400"
        />
        <StatCard
          icon={BarChart3}
          label="季度欠费总额"
          value={overallStats.totalArrears.toLocaleString()}
          unit="元"
          color="text-orange-400"
        />
      </div>

      <div className="glass-panel overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-700/30 flex items-center justify-between bg-slate-800/20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center border border-cyan-400/20">
              <FileCheck className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="font-bold text-white">楼栋明细数据</h3>
              <p className="text-xs text-slate-500">各楼栋运营指标详细数据 · 包含于导出报表</p>
            </div>
          </div>
          <div className="text-xs text-slate-400">
            共 <span className="text-cyan-300 font-bold">{buildingStats.length}</span> 条记录
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-800/40">
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">楼栋信息</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase tracking-wider">总套数</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase tracking-wider">已入住</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase tracking-wider">空置率</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase tracking-wider">欠费</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase tracking-wider">欠费率</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase tracking-wider">欠费金额</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase tracking-wider">报修</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase tracking-wider">响应(h)</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase tracking-wider">预警</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {buildingStats.map((b, idx) => (
                <motion.tr
                  key={b.buildingId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="hover:bg-cyan-500/5 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-400/20 flex items-center justify-center shrink-0">
                        <Building2 className="w-4 h-4 text-blue-400" />
                      </div>
                      <div>
                        <div className="font-medium text-white">{b.buildingName}</div>
                        <div className="text-xs text-slate-500">{b.district} · {b.street}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center font-mono text-slate-300">{b.totalUnits}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-mono">
                      {b.occupiedUnits}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-slate-700/50 overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full',
                            b.vacancyRate > 15 ? 'bg-red-400' : b.vacancyRate > 10 ? 'bg-amber-400' : 'bg-cyan-400'
                          )}
                          style={{ width: `${Math.min(b.vacancyRate * 3, 100)}%` }}
                        />
                      </div>
                      <span className={cn(
                        'font-mono text-xs',
                        b.vacancyRate > 15 ? 'text-red-400' : b.vacancyRate > 10 ? 'text-amber-400' : 'text-cyan-300'
                      )}>
                        {b.vacancyRate.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn(
                      'px-2 py-0.5 rounded-full font-mono text-xs',
                      b.overdueCount > 0 ? 'bg-red-500/15 text-red-400' : 'bg-slate-500/15 text-slate-500'
                    )}>
                      {b.overdueCount}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center font-mono text-xs text-rose-300">{b.overdueRate.toFixed(1)}%</td>
                  <td className="px-4 py-3 text-right font-mono text-amber-300">¥{b.arrearsAmount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-center font-mono text-slate-300">{b.repairCount}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn(
                      'font-mono text-xs',
                      b.avgRepairTime > 24 ? 'text-red-400' : b.avgRepairTime > 12 ? 'text-amber-400' : 'text-emerald-400'
                    )}>
                      {b.avgRepairTime.toFixed(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {b.vacantWarnings > 0 && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 text-[10px] font-mono">
                          空{b.vacantWarnings}
                        </span>
                      )}
                      {b.subletWarnings > 0 && (
                        <span className="px-1.5 py-0.5 rounded bg-red-500/15 text-red-400 text-[10px] font-mono">
                          转{b.subletWarnings}
                        </span>
                      )}
                      {b.vacantWarnings === 0 && b.subletWarnings === 0 && (
                        <span className="text-[10px] text-slate-600">-</span>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
