import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Square,
  Trophy,
  Users,
  Star,
  Home,
  CheckCircle2,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import useHouseStore from '@/store/useHouseStore';
import { cn } from '@/lib/utils';

interface Applicant {
  id: string;
  name: string;
  score: number;
  rank: number;
  familyMembers: number;
  applyDate: string;
  housingType: string;
}

interface Winner {
  id: string;
  name: string;
  score: number;
  houseId: string;
  buildingName: string;
  roomNumber: string;
  area: number;
  layout: string;
  time: string;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
}

const applicants: Applicant[] = Array.from({ length: 50 }, (_, i) => ({
  id: `A${String(i + 1).padStart(5, '0')}`,
  name: ['张', '李', '王', '刘', '陈', '杨', '黄', '赵', '吴', '周'][i % 10] +
    ['伟', '芳', '娜', '敏', '静', '强', '磊', '军', '洋', '勇'][Math.floor(i / 5) % 10],
  score: Math.floor(80 + Math.random() * 20 * 100) / 100,
  rank: i + 1,
  familyMembers: 1 + Math.floor(Math.random() * 5),
  applyDate: `2025-${String(1 + Math.floor(Math.random() * 12)).padStart(2, '0')}-${String(1 + Math.floor(Math.random() * 28)).padStart(2, '0')}`,
  housingType: ['一居室', '两居室', '三居室'][Math.floor(Math.random() * 3)]
})).sort((a, b) => b.score - a.score).map((a, i) => ({ ...a, rank: i + 1 }));

export default function LotteryScreen() {
  const { houses, buildings } = useHouseStore();
  const [isRolling, setIsRolling] = useState(false);
  const [rollingDigits, setRollingDigits] = useState<string[]>(['0', '0', '0', '0', '0']);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [currentWinner, setCurrentWinner] = useState<Winner | null>(null);
  const [showExplosion, setShowExplosion] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [availableHouses, setAvailableHouses] = useState(() =>
    houses.filter(h => h.status === 'available').slice(0, 30)
  );
  const [selectedHouseId, setSelectedHouseId] = useState<string | null>(null);
  const [scrollOffset, setScrollOffset] = useState(0);

  const intervalRef = useRef<number | null>(null);
  const particleRef = useRef<number | null>(null);
  const scrollRef = useRef<number | null>(null);

  useEffect(() => {
    scrollRef.current = window.setInterval(() => {
      setScrollOffset(prev => (prev + 1) % (applicants.length * 48));
    }, 50);
    return () => {
      if (scrollRef.current) clearInterval(scrollRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isRolling) return;

    intervalRef.current = window.setInterval(() => {
      setRollingDigits(prev =>
        prev.map(() => String(Math.floor(Math.random() * 10)))
      );
    }, 50);

    const stopTimer = setTimeout(() => {
      stopRolling();
    }, 5000 + Math.random() * 3000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      clearTimeout(stopTimer);
    };
  }, [isRolling]);

  useEffect(() => {
    if (!showExplosion) return;

    const colors = ['#22D3EE', '#F472B6', '#FACC15', '#34D399', '#A78BFA', '#F87171'];
    const newParticles: Particle[] = Array.from({ length: 80 }, (_, i) => {
      const angle = (Math.PI * 2 * i) / 80 + Math.random() * 0.5;
      const speed = 3 + Math.random() * 6;
      return {
        id: Date.now() + i,
        x: 50,
        y: 50,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 4 + Math.random() * 8,
        life: 1
      };
    });
    setParticles(newParticles);

    particleRef.current = window.setInterval(() => {
      setParticles(prev =>
        prev
          .map(p => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.15,
            life: p.life - 0.025
          }))
          .filter(p => p.life > 0)
      );
    }, 16);

    const cleanupTimer = setTimeout(() => {
      setShowExplosion(false);
      setParticles([]);
      if (particleRef.current) clearInterval(particleRef.current);
    }, 2500);

    return () => {
      clearTimeout(cleanupTimer);
      if (particleRef.current) clearInterval(particleRef.current);
    };
  }, [showExplosion]);

  const startRolling = () => {
    if (availableHouses.length === 0) return;
    setIsRolling(true);
    setCurrentWinner(null);
  };

  const stopRolling = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsRolling(false);

    const remainingApplicants = applicants.filter(
      a => !winners.some(w => w.id === a.id)
    );
    if (remainingApplicants.length === 0 || availableHouses.length === 0) return;

    const weightedPool: Applicant[] = [];
    remainingApplicants.forEach((app, idx) => {
      const weight = Math.max(1, remainingApplicants.length - idx);
      for (let i = 0; i < weight; i++) {
        weightedPool.push(app);
      }
    });
    const selectedApplicant = weightedPool[Math.floor(Math.random() * weightedPool.length)];
    const houseIndex = Math.floor(Math.random() * availableHouses.length);
    const selectedHouse = availableHouses[houseIndex];
    const building = buildings.find(b => b.id === selectedHouse.buildingId);

    const winner: Winner = {
      id: selectedApplicant.id,
      name: selectedApplicant.name,
      score: selectedApplicant.score,
      houseId: selectedHouse.id,
      buildingName: building?.name || selectedHouse.buildingName,
      roomNumber: selectedHouse.roomNumber,
      area: selectedHouse.area,
      layout: selectedHouse.layout,
      time: new Date().toLocaleTimeString('zh-CN', { hour12: false })
    };

    setRollingDigits(selectedApplicant.id.slice(1).split(''));
    setCurrentWinner(winner);
    setWinners(prev => [winner, ...prev].slice(0, 20));
    setAvailableHouses(prev => prev.filter((_, i) => i !== houseIndex));
    setShowExplosion(true);
  };

  const handleHouseSelect = (houseId: string) => {
    setSelectedHouseId(prev => prev === houseId ? null : houseId);
  };

  const visibleApplicants = useMemo(() => {
    const extended = [...applicants, ...applicants];
    const startIdx = Math.floor(scrollOffset / 48);
    return extended.slice(startIdx, startIdx + 8);
  }, [scrollOffset]);

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-slate-950 via-blue-950/50 to-slate-950 overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(34, 211, 238, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34, 211, 238, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }} />
      </div>

      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-cyan-500/10 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-blue-500/10 to-transparent pointer-events-none" />

      <div className="relative z-10 h-full flex flex-col p-6 gap-4">
        <div className="text-center mb-2">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 px-8 py-3 rounded-full bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 border border-cyan-400/30"
          >
            <Trophy className="w-6 h-6 text-yellow-400" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-300 via-white to-cyan-300 bg-clip-text text-transparent tracking-wider">
              公租房配租公开摇号现场
            </h1>
            <Sparkles className="w-6 h-6 text-yellow-400" />
          </motion.div>
        </div>

        <div className="glass-panel overflow-hidden mb-2">
          <div className="px-4 py-2 bg-gradient-to-r from-amber-500/20 to-red-500/20 border-b border-amber-400/20 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium text-amber-300">申请人评分排名（实时滚动）</span>
            <div className="ml-auto flex items-center gap-4 text-xs">
              <span className="text-slate-400">总申请人数: <span className="text-amber-300 font-bold">{applicants.length}</span></span>
              <span className="text-slate-400">可选房源: <span className="text-emerald-300 font-bold">{availableHouses.length}</span></span>
              <span className="text-slate-400">已配租: <span className="text-cyan-300 font-bold">{winners.length}</span></span>
            </div>
          </div>
          <div className="h-40 overflow-hidden relative">
            <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-slate-900/80 to-transparent z-10" />
            <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-slate-900/80 to-transparent z-10" />
            <div
              className="py-2 transition-transform duration-100"
              style={{ transform: `translateY(-${scrollOffset % 48}px)` }}
            >
              {visibleApplicants.map((applicant, idx) => (
                <motion.div
                  key={`${applicant.id}-${idx}`}
                  className="flex items-center gap-4 px-4 py-2.5 hover:bg-cyan-500/10 transition-colors"
                  style={{
                    background: applicant.rank <= 10 ? 'rgba(34, 211, 238, 0.05)' : undefined
                  }}
                >
                  <div className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold',
                    applicant.rank === 1 && 'bg-gradient-to-br from-yellow-400 to-amber-500 text-slate-900',
                    applicant.rank === 2 && 'bg-gradient-to-br from-slate-300 to-slate-400 text-slate-900',
                    applicant.rank === 3 && 'bg-gradient-to-br from-amber-600 to-amber-700 text-white',
                    applicant.rank > 3 && 'bg-slate-700/50 text-slate-300'
                  )}>
                    {applicant.rank <= 3 ? <Star className="w-4 h-4" /> : applicant.rank}
                  </div>
                  <div className="w-24 led-text text-xs">{applicant.id}</div>
                  <div className="w-20 text-sm text-white font-medium">{applicant.name}</div>
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-blue-500/20 text-xs text-blue-300">
                    <Users className="w-3 h-3" />{applicant.familyMembers}人
                  </div>
                  <div className="px-2 py-0.5 rounded bg-purple-500/20 text-xs text-purple-300">
                    {applicant.housingType}
                  </div>
                  <div className="text-xs text-slate-500 ml-2">{applicant.applyDate}</div>
                  <div className="ml-auto flex items-center gap-2">
                    <div className="w-32 h-2 rounded-full bg-slate-700/50 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400"
                        style={{ width: `${(applicant.score / 100) * 100}%` }}
                      />
                    </div>
                    <span className="w-16 text-right led-text text-sm font-bold">
                      {applicant.score.toFixed(2)}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 flex gap-4 min-h-0">
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="relative perspective-[1000px]">
              <motion.div
                animate={isRolling ? {
                  rotateY: [0, 360],
                  scale: [1, 1.05, 1]
                } : {
                  rotateY: 0,
                  scale: currentWinner ? [1, 1.1, 1] : 1
                }}
                transition={isRolling ? {
                  rotateY: { duration: 3, repeat: Infinity, ease: 'linear' },
                  scale: { duration: 0.5, repeat: Infinity }
                } : {
                  duration: 0.5,
                  times: currentWinner ? [0, 0.5, 1] : undefined
                }}
                className="relative w-96 h-96 rounded-full"
                style={{ transformStyle: 'preserve-3d' }}
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-500/20 via-blue-500/10 to-purple-500/20 border-2 border-cyan-400/40" />
                <div className="absolute inset-4 rounded-full bg-gradient-to-br from-slate-900 via-blue-900/30 to-slate-900 border border-cyan-400/30 shadow-[0_0_60px_rgba(34,211,238,0.3)_inset]" />
                <div className="absolute inset-8 rounded-full bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-cyan-400/20 backdrop-blur-sm" />

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    <div className="text-center mb-4">
                      <span className="text-xs text-cyan-400/70 tracking-[0.3em]">摇号编号</span>
                    </div>
                    <div className="flex gap-3">
                      {rollingDigits.map((digit, idx) => (
                        <motion.div
                          key={idx}
                          className={cn(
                            'relative w-16 h-24 rounded-xl overflow-hidden border-2',
                            isRolling
                              ? 'border-cyan-400/60 bg-slate-900/80'
                              : currentWinner
                                ? 'border-yellow-400/80 bg-gradient-to-b from-yellow-500/10 to-amber-500/10 shadow-[0_0_30px_rgba(250,204,21,0.3)]'
                                : 'border-cyan-400/30 bg-slate-900/50'
                          )}
                        >
                          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-px bg-cyan-400/30 z-10" />
                          <div className="absolute left-0 right-0 top-0 h-1/2 bg-gradient-to-b from-black/30 to-transparent pointer-events-none z-10" />
                          <div className="absolute left-0 right-0 bottom-0 h-1/2 bg-gradient-to-t from-black/30 to-transparent pointer-events-none z-10" />
                          <motion.div
                            animate={isRolling ? {
                              y: [0, -2000]
                            } : { y: 0 }}
                            transition={isRolling ? {
                              duration: 0.5,
                              repeat: Infinity,
                              ease: 'linear'
                            } : { type: 'spring', stiffness: 100, damping: 15 }}
                            className="flex flex-col items-center justify-start py-4"
                          >
                            {isRolling
                              ? Array.from({ length: 50 }, (_, i) => (
                                <span
                                  key={i}
                                  className="h-16 flex items-center justify-center text-5xl font-bold leading-none"
                                  style={{
                                    fontFamily: 'monospace',
                                    color: idx < 50 * 0.3 || idx > 50 * 0.7 ? 'rgba(34,211,238,0.3)' : '#22D3EE',
                                    textShadow: '0 0 15px rgba(34,211,238,0.8)'
                                  }}
                                >
                                  {Math.floor(Math.random() * 10)}
                                </span>
                              ))
                              : (
                                <span
                                  className="h-16 flex items-center justify-center text-5xl font-bold leading-none"
                                  style={{
                                    fontFamily: 'monospace',
                                    color: currentWinner ? '#FACC15' : '#22D3EE',
                                    textShadow: currentWinner
                                      ? '0 0 20px rgba(250,204,21,0.8)'
                                      : '0 0 15px rgba(34,211,238,0.8)'
                                  }}
                                >
                                  {digit}
                                </span>
                              )}
                          </motion.div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {showExplosion && particles.map(p => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 1, scale: 1 }}
                      style={{
                        position: 'absolute',
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        width: p.size,
                        height: p.size,
                        borderRadius: '50%',
                        backgroundColor: p.color,
                        boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
                        opacity: p.life,
                        transform: 'translate(-50%, -50%)'
                      }}
                    />
                  ))}
                </AnimatePresence>

                <div className="absolute -inset-4 rounded-full border border-cyan-400/20 animate-ping opacity-30" />
              </motion.div>

              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-3 h-3 rounded-full bg-cyan-400"
                  style={{
                    left: `${50 + 55 * Math.cos((Math.PI * 2 * i) / 12)}%`,
                    top: `${50 + 55 * Math.sin((Math.PI * 2 * i) / 12)}%`,
                    transform: 'translate(-50%, -50%)',
                    boxShadow: '0 0 15px rgba(34,211,238,0.8)'
                  }}
                  animate={{
                    opacity: isRolling ? [1, 0.3, 1] : currentWinner ? [1, 0.5, 1] : 0.6,
                    scale: isRolling ? [1, 1.5, 1] : 1
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.08
                  }}
                />
              ))}
            </div>

            <div className="mt-8 flex flex-col items-center gap-4">
              <AnimatePresence mode="wait">
                {currentWinner ? (
                  <motion.div
                    key="winner"
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.9 }}
                    className="px-8 py-5 rounded-2xl bg-gradient-to-r from-yellow-500/20 via-amber-500/20 to-orange-500/20 border-2 border-yellow-400/40 text-center min-w-[400px]"
                  >
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                      <span className="text-emerald-300 font-bold tracking-wider">摇号成功</span>
                      <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div className="text-3xl font-bold text-yellow-300 mb-3 glow-text">
                      恭喜 {currentWinner.name} 中签！
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-left">
                        <div className="text-slate-400 text-xs mb-1">配租房源</div>
                        <div className="text-white font-medium">{currentWinner.buildingName} {currentWinner.roomNumber}</div>
                      </div>
                      <div className="text-left">
                        <div className="text-slate-400 text-xs mb-1">户型面积</div>
                        <div className="text-white font-medium">{currentWinner.layout} · {currentWinner.area}㎡</div>
                      </div>
                      <div className="text-left">
                        <div className="text-slate-400 text-xs mb-1">综合评分</div>
                        <div className="text-cyan-300 font-bold font-mono">{currentWinner.score.toFixed(2)}</div>
                      </div>
                      <div className="text-left">
                        <div className="text-slate-400 text-xs mb-1">中签时间</div>
                        <div className="text-emerald-300 font-mono">{currentWinner.time}</div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-[140px] flex items-center justify-center"
                  >
                    <p className="text-slate-400 text-lg">
                      {isRolling ? (
                        <span className="flex items-center gap-3">
                          <motion.span
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ repeat: Infinity, duration: 1 }}
                          >
                            🔄
                          </motion.span>
                          <span className="text-cyan-300">正在摇号中，请稍候...</span>
                        </span>
                      ) : (
                        '点击下方按钮开始摇号'
                      )}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex gap-4">
                {!isRolling ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={startRolling}
                    disabled={availableHouses.length === 0}
                    className={cn(
                      'flex items-center gap-3 px-10 py-4 rounded-xl font-bold text-lg transition-all',
                      availableHouses.length === 0
                        ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50'
                    )}
                  >
                    <Play className="w-6 h-6 fill-current" />
                    启动摇号
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={stopRolling}
                    className="flex items-center gap-3 px-10 py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg shadow-red-500/30 hover:shadow-red-500/50 transition-all"
                  >
                    <Square className="w-6 h-6 fill-current" />
                    停止摇号
                  </motion.button>
                )}
              </div>
            </div>

            <div className="mt-6 w-full max-w-2xl">
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-medium text-yellow-300">中签名单（滚动展示）</span>
                <div className="flex-1 h-px bg-gradient-to-r from-yellow-400/30 to-transparent" />
              </div>
              <div className="glass-panel p-3 max-h-40 overflow-y-auto scrollbar-thin">
                {winners.length === 0 ? (
                  <p className="text-center text-slate-500 text-sm py-4">暂无中签记录</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <AnimatePresence>
                      {winners.map((winner, idx) => (
                        <motion.div
                          key={winner.id + winner.time}
                          initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ delay: idx * 0.05 }}
                          className={cn(
                            'flex items-center gap-3 px-3 py-2 rounded-lg border',
                            idx === 0
                              ? 'bg-yellow-500/10 border-yellow-400/30'
                              : 'bg-slate-800/30 border-slate-700/30'
                          )}
                        >
                          <div className={cn(
                            'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold',
                            idx === 0 ? 'bg-yellow-500 text-slate-900' : 'bg-slate-700 text-slate-300'
                          )}>
                            {idx + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm text-white font-medium truncate">{winner.name}</div>
                            <div className="text-xs text-slate-400 truncate">{winner.buildingName} {winner.roomNumber}</div>
                          </div>
                          <span className="text-xs text-cyan-400 font-mono">{winner.time}</span>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="w-96 flex flex-col">
            <div className="px-4 py-3 bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-400/30 rounded-t-xl flex items-center gap-2">
              <Home className="w-5 h-5 text-emerald-400" />
              <span className="font-bold text-emerald-300">可分配房源列表</span>
              <span className="ml-auto px-2 py-0.5 rounded-full bg-emerald-500/30 text-xs text-emerald-300 font-bold">
                {availableHouses.length} 套
              </span>
            </div>
            <div className="flex-1 glass-panel rounded-t-none border-t-0 overflow-y-auto scrollbar-thin">
              {availableHouses.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 py-10">
                  <Home className="w-12 h-12 mb-3 opacity-30" />
                  <p className="text-sm">房源已全部配租完毕</p>
                </div>
              ) : (
                <div className="p-2 space-y-2">
                  {availableHouses.map((house, idx) => {
                    const building = buildings.find(b => b.id === house.buildingId);
                    const isSelected = selectedHouseId === house.id;
                    return (
                      <motion.div
                        key={house.id}
                        whileHover={{ scale: 1.02, x: -2 }}
                        onClick={() => handleHouseSelect(house.id)}
                        className={cn(
                          'relative p-3 rounded-xl border cursor-pointer transition-all',
                          isSelected
                            ? 'bg-emerald-500/20 border-emerald-400/60 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                            : 'bg-slate-800/30 border-slate-700/50 hover:border-emerald-400/40 hover:bg-emerald-500/5'
                        )}
                      >
                        {idx < 5 && (
                          <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-gradient-to-r from-orange-500 to-red-500 text-[10px] text-white font-bold">
                            热门
                          </div>
                        )}
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-white font-bold">{house.buildingName}</span>
                              <span className="px-2 py-0.5 rounded bg-emerald-500/30 text-xs text-emerald-300 font-mono">
                                {house.roomNumber}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {building?.district} · {building?.street} · {house.floor}层
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-xs">
                          <span className="flex items-center gap-1 text-slate-300">
                            <span className="text-cyan-400">{house.layout}</span>
                          </span>
                          <span className="text-slate-500">·</span>
                          <span className="text-amber-300 font-mono font-bold">{house.area}㎡</span>
                          <span className="text-slate-500">·</span>
                          <span className="text-rose-300 font-mono">¥{house.monthlyRent}/月</span>
                        </div>
                        {isSelected && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-3 pt-3 border-t border-emerald-400/20 flex items-center justify-between"
                          >
                            <span className="text-xs text-emerald-300">已选择此房源</span>
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          </motion.div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
