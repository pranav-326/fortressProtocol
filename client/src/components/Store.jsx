import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, ShieldPlus, Zap } from 'lucide-react';
import { useGame } from '../context/GameContext';

const Store = () => {
    const { team, buyDefense } = useGame();
    const [buying, setBuying] = useState(null);
    const [error, setError] = useState(null);

    const coins = team?.coins || 0;
    const ownedDefenses = team?.defenses || [];

    const defenses = [
        { id: 'email-filter', name: 'Advanced Email Filter', type: 'Phishing', price: 500, description: 'Blocks malicious URLs and credential harvesting attempts.' },
        { id: 'rate-limit', name: 'Traffic Rate Limiter', type: 'DDoS', price: 800, description: 'Mitigates large-scale distributed denial of service attacks.' },
        { id: 'input-sanitization', name: 'Query Sanitizer', type: 'SQL', price: 1000, description: 'Filters out SQL injection and unauthorized database queries.' },
        { id: 'backup-restore', name: 'Immutable Backups', type: 'Ransomware', price: 1500, description: 'Restores encrypted data to completely neutralize ransomware.' },
        { id: 'patch-management', name: 'Zero-Day Patching', type: 'Exploit', price: 2000, description: 'Automatically deploys hotfixes for unknown vulnerabilities.' },
    ];

    const handleBuy = async (defenseId, price) => {
        if (coins >= price) {
            setBuying(defenseId);
            setError(null);
            try {
                // calls the backend POST /team/buy which updates Firestore
                await buyDefense(defenseId, price);
            } catch (err) {
                setError(err.message || 'Purchase failed');
            } finally {
                setBuying(null);
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold flex items-center gap-3 text-white">
                    <ShoppingCart className="w-8 h-8 text-cyber-accent" />
                    Defense Marketplace
                </h2>
                <div className="bg-black/50 px-6 py-3 rounded-xl border border-yellow-400/30 flex items-center gap-3 shadow-[0_0_15px_rgba(250,204,21,0.1)]">
                    <span className="text-gray-400 font-medium">Available Funds</span>
                    <span className="text-2xl font-mono font-bold text-yellow-400">{coins.toLocaleString()}</span>
                </div>
            </div>

            {error && (
                <div className="bg-cyber-danger/20 border border-cyber-danger text-cyber-danger px-4 py-3 rounded text-sm mb-4">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {defenses.map((def, idx) => {
                    const isOwned = ownedDefenses.includes(def.id);
                    const canAfford = coins >= def.price;

                    return (
                        <motion.div
                            key={def.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.1 }}
                            className="group bg-cyber-surface/80 border border-white/5 rounded-2xl overflow-hidden hover:border-cyber-accent/50 transition-all duration-300 hover:shadow-[0_0_40px_rgba(0,240,255,0.15)] flex flex-col h-full"
                        >
                            <div className="p-8 flex flex-col h-full flex-grow">
                                <div className="w-14 h-14 rounded-xl bg-cyber-accent/10 border border-cyber-accent/20 flex items-center justify-center text-cyber-accent mb-6 group-hover:scale-110 group-hover:bg-cyber-accent/20 transition-all">
                                    <ShieldPlus className="w-7 h-7" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">{def.name}</h3>
                                <span className="text-[10px] uppercase tracking-widest text-cyber-accent font-bold mb-4 block opacity-80">Requires: {def.type} Protocol</span>
                                <p className="text-sm text-gray-400 leading-relaxed flex-grow">
                                    {def.description}
                                </p>
                            </div>

                            <div className="p-6 border-t border-white/5 bg-black/40 flex items-center justify-between mt-auto">
                                <span className="font-mono text-xl font-bold text-yellow-400 drop-shadow-[0_0_5px_rgba(255,255,0,0.5)]">
                                    ${def.price.toLocaleString()}
                                </span>
                                <button
                                    onClick={() => handleBuy(def.id, def.price)}
                                    disabled={!canAfford || buying === def.id || isOwned}
                                    className={`font-bold px-4 py-2 rounded flex items-center gap-2 transition-colors ${isOwned
                                        ? 'bg-cyber-success/20 text-cyber-success border border-cyber-success/50 cursor-not-allowed'
                                        : !canAfford
                                            ? 'bg-gray-600 text-gray-300 opacity-50 cursor-not-allowed'
                                            : 'bg-cyber-accent text-black hover:bg-white hover:text-black'
                                        }`}
                                >
                                    {isOwned ? 'Owned' : buying === def.id ? 'Loading...' : (
                                        <>Buy <Zap className="w-4 h-4" /></>
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
