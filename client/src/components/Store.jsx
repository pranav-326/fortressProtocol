import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, ShieldPlus, Zap } from 'lucide-react';
import { useGame } from '../context/GameContext';

const Store = () => {
    const { team, buyDefense } = useGame();
    const [buying, setBuying] = useState(null);
    const [error, setError] = useState(null);

    const defenses = [
        { id: 'email-filter', name: 'Advanced Email Filter', type: 'Phishing', price: 500, description: 'Blocks malicious URLs and credential harvesting attempts.' },
        { id: 'rate-limit', name: 'Traffic Rate Limiter', type: 'DDoS', price: 800, description: 'Mitigates large-scale distributed denial of service attacks.' },
        { id: 'input-sanitization', name: 'Query Sanitizer', type: 'SQL', price: 1000, description: 'Filters out SQL injection and unauthorized database queries.' },
        { id: 'backup-restore', name: 'Immutable Backups', type: 'Ransomware', price: 1500, description: 'Restores encrypted data to completely neutralize ransomware.' },
        { id: 'patch-management', name: 'Zero-Day Patching', type: 'Exploit', price: 2000, description: 'Automatically deploys hotfixes for unknown vulnerabilities.' },
    ];

    const currentCoins = typeof team?.coins === 'number' ? team.coins : 0;
    const ownedDefenses = team?.defenses && typeof team.defenses === 'object' && !Array.isArray(team.defenses)
        ? team.defenses
        : {};

    const handleBuy = async (defenseId, basePrice) => {
        const currentLvl = ownedDefenses[defenseId] || 0;
        if (currentLvl >= 3) return;

        let finalPrice = basePrice;
        if (currentLvl === 1) finalPrice = Math.floor(basePrice * 1.5);
        else if (currentLvl === 2) finalPrice = Math.floor(basePrice * 2);

        if (currentCoins >= finalPrice) {
            setBuying(defenseId);
            setError(null);
            try {
                await buyDefense(defenseId, finalPrice);
            } catch (err) {
                setError(err.message || 'Purchase failed');
            } finally {
                setBuying(null);
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-3 text-white">
                    <ShoppingCart className="w-6 h-6 sm:w-8 sm:h-8 text-cyber-accent shrink-0" />
                    Defense Marketplace
                </h2>
                <div className="bg-black/50 px-4 sm:px-6 py-2 sm:py-3 rounded-xl border border-yellow-400/30 flex items-center gap-2 sm:gap-3 shadow-[0_0_15px_rgba(250,204,21,0.1)] shrink-0">
                    <span className="text-xs sm:text-sm text-gray-400 font-medium whitespace-nowrap">Available Funds</span>
                    <span className="text-xl sm:text-2xl font-mono font-bold text-yellow-400">{currentCoins.toLocaleString()}</span>
                </div>
            </div>

            {error && (
                <div className="bg-cyber-danger/20 border border-cyber-danger text-cyber-danger px-4 py-3 rounded text-sm mb-4">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {defenses.map((def, idx) => {
                    const currentLvl = ownedDefenses[def.id] || 0;

                    let upgradePrice = def.price;
                    if (currentLvl === 1) upgradePrice = Math.floor(def.price * 1.5);
                    else if (currentLvl === 2) upgradePrice = Math.floor(def.price * 2);

                    const canAfford = currentCoins >= upgradePrice;
                    const isMax = currentLvl >= 3;

                    return (
                        <motion.div
                            key={def.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.1 }}
                            className="group bg-cyber-surface/80 border border-white/5 rounded-2xl overflow-hidden hover:border-cyber-accent/50 transition-all duration-300 hover:shadow-[0_0_40px_rgba(0,240,255,0.15)] flex flex-col h-full"
                        >
                            <div className="p-6 sm:p-8 flex flex-col h-full flex-grow relative">
                                {/* Level Badge */}
                                {currentLvl > 0 && (
                                    <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border ${isMax ? 'bg-cyber-success/20 text-cyber-success border-cyber-success/50' : 'bg-cyber-accent/20 text-cyber-accent border-cyber-accent/50'} shadow-lg`}>
                                        {isMax ? 'MAX LVL' : `LVL ${currentLvl}`}
                                    </div>
                                )}

                                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-cyber-accent/10 border border-cyber-accent/20 flex items-center justify-center text-cyber-accent mb-5 sm:mb-6 group-hover:scale-110 group-hover:bg-cyber-accent/20 transition-all shrink-0">
                                    <ShieldPlus className="w-6 h-6 sm:w-7 sm:h-7" />
                                </div>
                                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">{def.name}</h3>
                                <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-cyber-accent font-bold mb-3 sm:mb-4 block opacity-80">Requires: {def.type} Protocol</span>
                                <p className="text-xs sm:text-sm text-gray-400 leading-relaxed flex-grow">
                                    {def.description}
                                </p>
                            </div>

                            <div className="p-5 sm:p-6 border-t border-white/5 bg-black/40 flex items-center justify-between mt-auto">
                                <span className={`font-mono text-lg sm:text-xl font-bold drop-shadow-[0_0_5px_rgba(255,255,0,0.5)] ${isMax ? 'text-gray-500' : 'text-yellow-400'}`}>
                                    {isMax ? '---' : `$${upgradePrice.toLocaleString()}`}
                                </span>
                                <button
                                    onClick={() => handleBuy(def.id, def.price)}
                                    disabled={!canAfford || buying === def.id || isMax}
                                    className={`font-bold px-3 sm:px-4 py-1.5 sm:py-2 rounded text-xs sm:text-sm flex items-center gap-2 transition-colors ${isMax
                                        ? 'bg-cyber-success/20 text-cyber-success border border-cyber-success/50 cursor-not-allowed'
                                        : !canAfford
                                            ? 'bg-gray-600 text-gray-300 opacity-50 cursor-not-allowed'
                                            : 'bg-cyber-accent text-black hover:bg-white hover:text-black'
                                        }`}
                                >
                                    {isMax ? 'MAXED' : buying === def.id ? 'Loading...' : (
                                        <>
                                            {currentLvl > 0 ? `Upgrade Lvl ${currentLvl + 1}` : 'Buy'}
                                            <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

export default Store;
