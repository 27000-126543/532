import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  ChevronDown,
  User,
  Clock,
  Logs,
  Camera,
  Shield,
  UserCog,
  Users,
  MapPin,
  Crown
} from 'lucide-react';
import useUserStore from '@/store/useUserStore';
import useSceneStore from '@/store/useSceneStore';
import useHouseStore from '@/store/useHouseStore';
import useOperationLogStore from '@/store/useOperationLogStore';
import type { UserRole } from '@/types';
import { cn } from '@/lib/utils';

const roleConfig: Record<UserRole, { label: string; icon: typeof User; color: string }> = {
  tenant: { label: '租户', icon: User, color: 'text-cyan-400' },
  property: { label: '物业', icon: Shield, color: 'text-blue-400' },
  staff: { label: '街道', icon: MapPin, color: 'text-emerald-400' },
  district_director: { label: '区局长', icon: Users, color: 'text-amber-400' },
  city_director: { label: '市局长', icon: Crown, color: 'text-rose-400' }
};

const roleOrder: UserRole[] = ['tenant', 'property', 'staff', 'district_director', 'city_director'];

export default function TopNav() {
  const { currentUser, isAuthenticated, setCurrentUser } = useUserStore();
  const { viewMode, selectedBuildingId, selectedHouseId } = useSceneStore();
  const { getBuildingById, getHouseById } = useHouseStore();
  const addLog = useOperationLogStore(s => s.addLog);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [faceLoginOpen, setFaceLoginOpen] = useState(false);
  const [faceLoginStage, setFaceLoginStage] = useState<'scanning' | 'success'>('scanning');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!currentUser) {
      const mockUser = {
        id: 'U005',
        username: 'city',
        name: '孙市长',
        role: 'city_director' as UserRole,
        phone: '13800138005',
        city: '北京市'
      };
      setCurrentUser(mockUser);
    }
  }, [currentUser, setCurrentUser]);

  const formatTime = (date: Date) => {
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  const getBreadcrumb = () => {
    const crumbs = ['社区总览'];
    if (selectedBuildingId) {
      const building = getBuildingById(selectedBuildingId);
      if (building) crumbs.push(building.name);
    }
    if (selectedHouseId) {
      const house = getHouseById(selectedHouseId);
      if (house) crumbs.push(house.roomNumber);
    }
    return crumbs;
  };

  const breadcrumbs = getBreadcrumb();
  const currentRoleConfig = currentUser ? roleConfig[currentUser.role] : null;
  const RoleIcon = currentRoleConfig?.icon || User;

  useEffect(() => {
    if (faceLoginOpen && faceLoginStage === 'scanning' && currentUser) {
      const timer = setTimeout(() => {
        setFaceLoginStage('success');
        addLog('face_login', currentUser.id, currentUser.name, currentUser.role,
          `人脸识别登录成功`,
          '登录成功');
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [faceLoginOpen, faceLoginStage, currentUser, addLog]);

  const handleRoleSwitch = (role: UserRole) => {
    const mockUsers: Record<UserRole, { id: string; username: string; name: string; role: UserRole; phone: string }> = {
      tenant: { id: 'U001', username: 'tenant', name: '张三', role: 'tenant', phone: '13800138001' },
      property: { id: 'U002', username: 'property', name: '李物业', role: 'property', phone: '13800138002' },
      staff: { id: 'U003', username: 'staff', name: '王街道', role: 'staff', phone: '13800138003' },
      district_director: { id: 'U004', username: 'district', name: '赵区长', role: 'district_director', phone: '13800138004' },
      city_director: { id: 'U005', username: 'city', name: '孙市长', role: 'city_director', phone: '13800138005' }
    };
    const newUser = mockUsers[role];
    const oldRoleLabel = currentUser ? roleConfig[currentUser.role].label : '未登录';
    const newRoleLabel = roleConfig[role].label;
    setCurrentUser(newUser);
    setRoleDropdownOpen(false);
    addLog('role_switch', newUser.id, newUser.name, newUser.role,
      `角色切换：从 ${oldRoleLabel} 切换为 ${newRoleLabel}`,
      '切换成功');
  };

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      className="fixed top-0 left-0 right-0 z-50 h-16 glass-panel rounded-none border-x-0 border-t-0 flex items-center px-6"
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <Building2 className="w-8 h-8 text-cyan-400" />
          <div className="absolute inset-0 bg-cyan-400/20 blur-xl rounded-full" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white tracking-wider">
            保障性住房智慧管理平台
          </h1>
          <p className="text-[10px] text-cyan-400/70 tracking-[0.2em]">
            SMART HOUSING MANAGEMENT SYSTEM
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="flex items-center gap-2">
              {index > 0 && (
                <ChevronDown className="w-4 h-4 text-blue-400/50 rotate-[-90deg]" />
              )}
              <span
                className={cn(
                  'text-sm',
                  index === breadcrumbs.length - 1
                    ? 'text-cyan-300 font-medium glow-text'
                    : 'text-blue-300/70'
                )}
              >
                {crumb}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-600/30">
          <Clock className="w-4 h-4 text-emerald-400 animate-breathing" />
          <span className="text-sm font-mono text-emerald-300 tracking-wide">
            {formatTime(currentTime)}
          </span>
        </div>

        <button
          onClick={() => {
            setFaceLoginStage('scanning');
            setFaceLoginOpen(true);
          }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 hover:border-purple-400/50 transition-all group"
        >
          <Camera className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
          <span className="text-sm text-purple-300">人脸识别</span>
        </button>

        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-600/30 hover:border-amber-500/50 transition-all group">
          <Logs className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          <span className="text-sm text-amber-300">操作日志</span>
        </button>

        <div className="relative">
          <button
            onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 hover:border-cyan-400/50 transition-all"
          >
            {currentRoleConfig && <RoleIcon className={cn('w-4 h-4', currentRoleConfig.color)} />}
            <span className={cn('text-sm font-medium', currentRoleConfig?.color)}>
              {currentRoleConfig?.label || '未登录'}
            </span>
            <ChevronDown
              className={cn(
                'w-4 h-4 text-blue-400 transition-transform',
                roleDropdownOpen && 'rotate-180'
              )}
            />
          </button>

          <AnimatePresence>
            {roleDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="absolute right-0 mt-2 w-48 glass-panel overflow-hidden"
              >
                <div className="p-1">
                  {roleOrder.map((role) => {
                    const config = roleConfig[role];
                    const Icon = config.icon;
                    const isActive = currentUser?.role === role;
                    return (
                      <button
                        key={role}
                        onClick={() => handleRoleSwitch(role)}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all',
                          isActive
                            ? 'bg-blue-500/20 border border-blue-500/30'
                            : 'hover:bg-slate-700/30'
                        )}
                      >
                        <Icon className={cn('w-4 h-4', config.color)} />
                        <span className={cn('text-sm', isActive ? config.color : 'text-slate-300')}>
                          {config.label}
                        </span>
                        {isActive && (
                          <div className="ml-auto w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {isAuthenticated && currentUser && (
          <div className="flex items-center gap-2 pl-4 border-l border-slate-600/30">
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <UserCog className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-white">{currentUser.name}</span>
              <span className="text-[10px] text-slate-400">ID: {currentUser.id}</span>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {faceLoginOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setFaceLoginOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-panel p-8 w-96 text-center"
            >
              <div className="relative w-48 h-48 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full border-2 border-cyan-400 animate-ping opacity-30" />
                <div className="absolute inset-2 rounded-full border border-cyan-400/50" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className={cn(
                    'w-32 h-40 rounded-2xl border-2 relative overflow-hidden bg-slate-800/50',
                    faceLoginStage === 'success' ? 'border-emerald-400' : 'border-cyan-400'
                  )}>
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-cyan-400 rounded-tl" />
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-cyan-400 rounded-tr" />
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-cyan-400 rounded-bl" />
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-cyan-400 rounded-br" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      {faceLoginStage === 'success' ? (
                        <UserCog className="w-12 h-12 text-emerald-400" />
                      ) : (
                        <Camera className="w-12 h-12 text-cyan-400 animate-breathing" />
                      )}
                    </div>
                    <motion.div
                      animate={faceLoginStage === 'success' ? { opacity: 0 } : { y: ['0%', '100%', '0%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
                    />
                  </div>
                </div>
              </div>
              {faceLoginStage === 'scanning' ? (
                <>
                  <h3 className="text-lg font-bold text-white mb-2">人脸识别登录</h3>
                  <p className="text-sm text-slate-400 mb-6">请将面部置于识别框内...</p>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-bold text-emerald-400 mb-2">识别成功</h3>
                  <p className="text-sm text-slate-300 mb-6">
                    欢迎回来，{currentUser?.name || '用户'}
                  </p>
                </>
              )}
              <button
                onClick={() => setFaceLoginOpen(false)}
                className="w-full py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium hover:opacity-90 transition-opacity"
              >
                {faceLoginStage === 'scanning' ? '取消' : '确定'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
