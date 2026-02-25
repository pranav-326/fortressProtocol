import { motion } from 'framer-motion';
import { Heart, ShieldCheck, Database, AlertTriangle } from 'lucide-react';
import { useGame } from '../context/GameContext';

const Dashboard = () => {
    const { team, gameState } = useGame();

    const health = team?.health ?? 100;

    // Vault status derived from team vault data or fallback
    const vaultsFromTeam = team?.vaults || { vault1: 'secure', vault2: 'secure' };
    const vaults = Object.keys(vaultsFromTeam).map((key, idx) => ({
        id: idx + 1,
        status: vaultsFromTeam[key]
    }));

    // Active defenses loaded from team
    const activeDefenses = (team?.defenses || []).map(def => ({
        name: def.replace('-', ' ').toUpperCase(),
        level: 1
    }));

    // Since we don't have a dedicated attack history array in the db schema yet,
    // we can either leave it mock, read from a subcollection, or just show the last attack responded.
    // Making this dynamic to show if there was a recent response, else fallback.
    const recentAttacks = [
        {
            id: team?.lastRespondedAttackId || 1,
            type: team?.lastRespondedAttackId ? 'LAST ATTACK' : 'DDoS',
            result: team?.lastRespondedAttackId ? 'responded' : 'defended',
            timestamp: team?.lastRespondedAttackId ? 'Recently' : '2 mins ago'
        }
    ];

    return (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

            {/* Left Column: Health & Vaults */}
            <div className="space-y-8 xl:col-span-1">
                {/* Team Health */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-cyber-surface/60 border border-white/10 rounded-2xl p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden"
                >
                    {/* Background Glow */}
                    <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[100px] opacity-20 pointer-events-none ${health < 30 ? 'bg-cyber-danger' : 'bg-cyber-success'}`}></div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Heart className={`w-6 h-6 ${health < 30 ? 'text-cyber-danger animate-pulse' : 'text-cyber-success'}`} />
                            System Integrity
                        </h2>
                        <span className="text-2xl font-mono font-bold text-white">{health}%</span>
                    </div>
                    <div className="h-4 w-full bg-black rounded-full overflow-hidden border border-white/5">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${health}%` }}
                            transition={{ duration: 1 }}
                            className={`h-full ${health < 30 ? 'bg-cyber-danger' : 'bg-cyber-success'} shadow-[0_0_10px_currentColor]`}
                        />
                    </div>
                </motion.div>

                {/* Vault Status */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-cyber-surface/60 border border-white/10 rounded-2xl p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden"
                >
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyber-accent rounded-full blur-[100px] opacity-10 pointer-events-none"></div>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Database className="w-6 h-6 text-cyber-accent" />
                        Vault Status
                    </h2>
                    <div className="flex gap-4">
                        {vaults.map(vault => (
                            <div
                                key={vault.id}
                                className={`flex-1 p-4 rounded-lg flex flex-col items-center justify-center border ${vault.status === 'secure'
                                    ? 'bg-cyber-success/10 border-cyber-success/30 text-cyber-success shadow-[0_0_15px_rgba(0,255,170,0.1)]'
                                    : 'bg-cyber-danger/10 border-cyber-danger/30 text-cyber-danger shadow-[0_0_15px_rgba(255,0,85,0.1)]'
                                    }`}
                            >
                                <Database className={`w-10 h-10 mb-2 ${vault.status === 'secure' ? 'animate-pulse' : 'opacity-50'}`} />
                                <span className="font-bold uppercase tracking-wider text-sm">
                                    {vault.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Middle Column: Active Defenses */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-cyber-surface/60 border border-white/10 rounded-2xl p-8 backdrop-blur-xl shadow-2xl xl:col-span-1 relative overflow-hidden flex flex-col"
            >
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyber-warning rounded-full blur-[100px] opacity-10 pointer-events-none"></div>
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <ShieldCheck className="w-6 h-6 text-cyber-warning" />
                    Active Defenses
                </h2>
                <div className="space-y-4">
                    {activeDefenses.map((def, idx) => (
                        <div key={idx} className="bg-black/40 border border-white/5 p-4 rounded-lg flex items-center justify-between hover:border-cyber-warning/50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="bg-cyber-warning/20 p-2 rounded text-cyber-warning">
                                    <ShieldCheck className="w-5 h-5" />
                                </div>
                                <span className="font-medium text-white">{def.name}</span>
                            </div>
                            <span className="px-2 py-1 bg-white/10 rounded text-xs font-mono">Lvl {def.level}</span>
                        </div>
                    ))}
                    {activeDefenses.length === 0 && (
                        <div className="text-gray-500 text-center py-8">No active defenses. Go to Store.</div>
                    )}
                </div>
            </motion.div>

            {/* Right Column: Attack Log */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-cyber-surface/60 border border-white/10 rounded-2xl p-8 backdrop-blur-xl shadow-2xl xl:col-span-1 relative overflow-hidden flex flex-col"
            >
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyber-danger rounded-full blur-[100px] opacity-10 pointer-events-none"></div>
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <AlertTriangle className="w-6 h-6 text-cyber-accent" />
                    Activity Log
                </h2>
                <div className="space-y-3">
                    {recentAttacks.map((attack) => (
                        <motion.div
                            key={attack.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`p-3 rounded border-l-4 ${attack.result === 'defended' ? 'bg-cyber-success/10 border-cyber-success text-cyber-success' :
                                attack.result === 'partial' || attack.result === 'responded' ? 'bg-cyber-warning/10 border-cyber-warning text-cyber-warning' :
                                    'bg-cyber-danger/10 border-cyber-danger text-cyber-danger'
                                }`}
                        >
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-bold text-sm tracking-widest uppercase">{attack.type}</span>
                                <span className="text-xs opacity-70">{attack.timestamp}</span>
                            </div>
                            <div className="text-xs uppercase font-mono">{attack.result}</div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

        </div>
    );
};

export default Dashboard;
