import { motion } from 'framer-motion';
import { Heart, ShieldCheck, Database, AlertTriangle, Zap, Activity, Shield, Cpu, Wifi } from 'lucide-react';
import { useGame } from '../context/GameContext';

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.1
        }
    }
};

const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    show: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            type: 'spring',
            stiffness: 100,
            damping: 15
        }
    }
};

const Dashboard = () => {
    const { team, gameState } = useGame();

    const health = team?.health ?? 100;
    const score = team?.score ?? 0;
    const coins = team?.coins ?? 0;

    // Active defenses loaded from team
    const rawDefenses = team?.defenses || {};
    let defenseEntries = [];

    if (Array.isArray(rawDefenses)) {
        defenseEntries = rawDefenses.map(def => ({ id: def, level: 1 }));
    } else if (typeof rawDefenses === 'object') {
        defenseEntries = Object.entries(rawDefenses).map(([id, level]) => ({ id, level }));
    }

    const activeDefenses = defenseEntries.map(def => ({
        id: def.id,
        name: def.id.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        level: def.level
    }));

    // Vault status
    const vaultsFromTeam = team?.vaults || { vault1: 'secure', vault2: 'secure' };
    const vaults = Object.keys(vaultsFromTeam).map((key, idx) => ({
        id: idx + 1,
        name: `Vault ${String.fromCharCode(65 + idx)}`,
        status: vaultsFromTeam[key]
    }));

    // Game status
    const gameStatus = gameState?.status || 'waiting';
    const isGameRunning = gameStatus === 'running';

    // Defense icon mapping
    const defenseIcons = {
        'email-filter': Wifi,
        'rate-limit': Activity,
        'input-sanitization': Database,
        'backup-restore': Cpu,
        'patch-management': Shield
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-6 sm:space-y-8 relative z-10 w-full overflow-x-hidden"
        >
            {/* ── Top Stats Row ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
                {/* Health Stat */}
                <motion.div variants={cardVariants} className="card-hover-lift bg-cyber-surface/50 border border-white/5 rounded-2xl p-5 sm:p-6 backdrop-blur-xl relative overflow-hidden animate-border-glow">
                    <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full blur-[80px] opacity-20 pointer-events-none bg-cyber-success animate-pulse-glow"></div>
                    <div className="flex items-center gap-3 mb-3 sm:mb-4">
                        <div className={`p-2 sm:p-2.5 rounded-xl ${health < 30 ? 'bg-cyber-danger/20 text-cyber-danger' : 'bg-cyber-success/20 text-cyber-success'}`}>
                            <Heart className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-gray-400">Health</span>
                    </div>
                    <div className="text-3xl sm:text-4xl font-bold text-white font-mono mb-2 sm:mb-3">{health}<span className="text-sm sm:text-lg text-gray-500">%</span></div>
                    <div className="h-1.5 sm:h-2 w-full bg-black/60 rounded-full overflow-hidden border border-white/5">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${health}%` }}
                            transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 }}
                            className={`h-full rounded-full ${health < 30 ? 'health-bar-danger' : 'health-bar-gradient'}`}
                        />
                    </div>
                </motion.div>

                {/* Score Stat */}
                <motion.div variants={cardVariants} className="card-hover-lift bg-cyber-surface/50 border border-white/5 rounded-2xl p-5 sm:p-6 backdrop-blur-xl relative overflow-hidden">
                    <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full blur-[80px] opacity-20 pointer-events-none bg-cyber-warning animate-pulse-glow" style={{ animationDelay: '0.5s' }}></div>
                    <div className="flex items-center gap-3 mb-3 sm:mb-4">
                        <div className="p-2 sm:p-2.5 rounded-xl bg-cyber-warning/20 text-cyber-warning">
                            <Zap className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-gray-400">Score</span>
                    </div>
                    <div className="text-3xl sm:text-4xl font-bold text-white font-mono truncate">{score.toLocaleString()}<span className="text-sm sm:text-lg text-gray-500 ml-1">pts</span></div>
                </motion.div>

                {/* Coins Stat */}
                <motion.div variants={cardVariants} className="card-hover-lift bg-cyber-surface/50 border border-white/5 rounded-2xl p-5 sm:p-6 backdrop-blur-xl relative overflow-hidden">
                    <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full blur-[80px] opacity-20 pointer-events-none bg-yellow-400 animate-pulse-glow" style={{ animationDelay: '1s' }}></div>
                    <div className="flex items-center gap-3 mb-3 sm:mb-4">
                        <div className="p-2 sm:p-2.5 rounded-xl bg-yellow-400/20 text-yellow-400">
                            <Activity className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-gray-400">Credits</span>
                    </div>
                    <div className="text-3xl sm:text-4xl font-bold text-white font-mono truncate">{coins.toLocaleString()}</div>
                </motion.div>

                {/* Game Status */}
                <motion.div variants={cardVariants} className="card-hover-lift bg-cyber-surface/50 border border-white/5 rounded-2xl p-5 sm:p-6 backdrop-blur-xl relative overflow-hidden">
                    <div className={`absolute -top-16 -right-16 w-32 h-32 rounded-full blur-[80px] opacity-20 pointer-events-none ${isGameRunning ? 'bg-cyber-accent' : 'bg-gray-500'} animate-pulse-glow`} style={{ animationDelay: '1.5s' }}></div>
                    <div className="flex items-center gap-3 mb-3 sm:mb-4">
                        <div className={`p-2 sm:p-2.5 rounded-xl ${isGameRunning ? 'bg-cyber-accent/20 text-cyber-accent' : 'bg-gray-500/20 text-gray-500'}`}>
                            <Cpu className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-gray-400">Status</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${isGameRunning ? 'bg-cyber-accent animate-pulse shadow-[0_0_12px_rgba(0,240,255,0.8)]' : 'bg-gray-500'}`}></span>
                        <span className={`text-xl sm:text-2xl font-bold uppercase tracking-widest ${isGameRunning ? 'text-cyber-accent' : 'text-gray-500'}`}>{gameStatus}</span>
                    </div>
                </motion.div>
            </div>

            {/* ── Main Content Grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">

                {/* Active Defenses */}
                <motion.div
                    variants={cardVariants}
                    className="card-hover-lift bg-cyber-surface/50 border border-white/5 rounded-2xl p-5 sm:p-8 backdrop-blur-xl relative overflow-hidden lg:col-span-2"
                >
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyber-warning rounded-full blur-[120px] opacity-10 pointer-events-none animate-pulse-glow"></div>

                    {/* Shimmer band */}
                    <div className="absolute inset-0 animate-shimmer rounded-2xl pointer-events-none"></div>

                    <h2 className="text-base sm:text-lg font-bold mb-5 sm:mb-6 flex flex-wrap items-center gap-2 sm:gap-3 relative z-10">
                        <div className="p-1.5 sm:p-2 rounded-xl bg-cyber-warning/15 text-cyber-warning shrink-0">
                            <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <span className="uppercase tracking-widest">Active Defenses</span>
                        <span className="ml-auto text-[10px] sm:text-xs font-mono text-gray-500 bg-black/40 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-white/5 shrink-0">{activeDefenses.length} / 5</span>
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 relative z-10">
                        {activeDefenses.map((def, idx) => {
                            const IconComponent = defenseIcons[def.id] || ShieldCheck;
                            return (
                                <motion.div
                                    key={def.id}
                                    initial={{ opacity: 0, x: -20, scale: 0.95 }}
                                    animate={{ opacity: 1, x: 0, scale: 1 }}
                                    transition={{ delay: 0.5 + idx * 0.1, type: 'spring', stiffness: 120 }}
                                    className="bg-black/30 border border-cyber-warning/15 p-4 sm:p-5 rounded-xl flex items-center gap-3 sm:gap-4 hover:border-cyber-warning/40 hover:bg-cyber-warning/5 transition-all duration-300 group"
                                >
                                    <div className="bg-cyber-warning/10 p-2 sm:p-3 rounded-lg text-cyber-warning group-hover:scale-110 transition-transform duration-300 shrink-0">
                                        <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <span className="block font-semibold text-white text-xs sm:text-sm truncate">{def.name}</span>
                                        <span className="block text-[8px] sm:text-[10px] uppercase tracking-widest text-cyber-warning/70 mt-0.5">Protocol Active</span>
                                    </div>
                                    <span className="px-2 sm:px-3 py-1 bg-cyber-warning/10 border border-cyber-warning/20 rounded-lg text-[8px] sm:text-[10px] font-bold text-cyber-warning uppercase tracking-wider shrink-0">Lvl {def.level}</span>
                                </motion.div>
                            );
                        })}
                        {activeDefenses.length === 0 && (
                            <div className="col-span-full text-center py-8 sm:py-12 text-gray-500">
                                <Shield className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 opacity-30" />
                                <p className="text-xs sm:text-sm font-medium">No active defenses deployed</p>
                                <p className="text-[10px] sm:text-xs mt-1 text-gray-600">Visit the Store to acquire defense protocols</p>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Vault Status */}
                <motion.div
                    variants={cardVariants}
                    className="card-hover-lift bg-cyber-surface/50 border border-white/5 rounded-2xl p-5 sm:p-8 backdrop-blur-xl relative overflow-hidden"
                >
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyber-accent rounded-full blur-[120px] opacity-10 pointer-events-none animate-pulse-glow"></div>

                    <h2 className="text-base sm:text-lg font-bold mb-5 sm:mb-6 flex flex-wrap items-center gap-2 sm:gap-3">
                        <div className="p-1.5 sm:p-2 rounded-xl bg-cyber-accent/15 text-cyber-accent shrink-0">
                            <Database className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <span className="uppercase tracking-widest">Vault Status</span>
                    </h2>

                    <div className="space-y-3 sm:space-y-4">
                        {vaults.map((vault, idx) => (
                            <motion.div
                                key={vault.id}
                                initial={{ opacity: 0, x: 20, scale: 0.95 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                transition={{ delay: 0.6 + idx * 0.1, type: 'spring', stiffness: 120 }}
                                className={`p-4 sm:p-5 rounded-xl border flex items-center gap-3 sm:gap-4 transition-all duration-300 ${vault.status === 'secure'
                                    ? 'bg-cyber-success/5 border-cyber-success/20 hover:border-cyber-success/40'
                                    : 'bg-cyber-danger/5 border-cyber-danger/20 hover:border-cyber-danger/40'
                                    }`}
                            >
                                <div className={`p-2 sm:p-3 rounded-xl shrink-0 ${vault.status === 'secure' ? 'bg-cyber-success/15 text-cyber-success' : 'bg-cyber-danger/15 text-cyber-danger'}`}>
                                    <Database className={`w-4 h-4 sm:w-6 sm:h-6 ${vault.status === 'secure' ? 'animate-pulse' : ''}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <span className="block text-white font-semibold text-xs sm:text-sm truncate">{vault.name}</span>
                                    <span className={`block text-[8px] sm:text-[10px] xl:text-[9px] uppercase tracking-widest mt-0.5 font-bold truncate ${vault.status === 'secure' ? 'text-cyber-success/80' : 'text-cyber-danger/80'}`}>
                                        {vault.status === 'secure' ? '● Encrypted & Secure' : '● Compromised'}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* ── Threat Intelligence Bar ── */}
            <motion.div
                variants={cardVariants}
                className="card-hover-lift bg-cyber-surface/50 border border-white/5 rounded-2xl p-5 sm:p-6 backdrop-blur-xl relative overflow-hidden"
            >
                <div className="absolute inset-0 animate-shimmer rounded-2xl pointer-events-none"></div>
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 relative z-10 w-full">
                    <div className="flex items-center gap-3 shrink-0">
                        <div className="p-2 sm:p-2.5 rounded-xl bg-cyber-danger/15 text-cyber-danger">
                            <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <div>
                            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-white">Threat Intelligence</h3>
                            <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">Real-time attack monitoring active</p>
                        </div>
                    </div>
                    <div className="flex-1"></div>
                    <div className="flex items-center gap-3 sm:gap-4 w-full md:w-auto">
                        <div className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-black/30 px-3 sm:px-4 py-2 rounded-lg border border-white/5">
                            <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${isGameRunning ? 'bg-cyber-accent animate-pulse' : 'bg-gray-600'}`}></span>
                            <span className="text-[10px] sm:text-xs font-mono text-gray-400">
                                {isGameRunning ? 'SCANNING' : 'STANDBY'}
                            </span>
                        </div>
                        <div className="flex-1 md:flex-none flex items-center justify-center gap-1.5 sm:gap-2 bg-black/30 px-3 sm:px-4 py-2 rounded-lg border border-white/5">
                            <span className="text-[10px] sm:text-xs font-mono text-gray-400 whitespace-nowrap">NEXT WAVE:</span>
                            <span className="text-[10px] sm:text-xs font-mono text-cyber-warning font-bold whitespace-nowrap hidden sm:inline">
                                {gameState?.nextAttackAt ? '~2 MIN' : '--:--'}
                            </span>
                            <span className="text-[10px] font-mono text-cyber-warning font-bold whitespace-nowrap sm:hidden">
                                {gameState?.nextAttackAt ? '2M' : '--'}
                            </span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default Dashboard;
