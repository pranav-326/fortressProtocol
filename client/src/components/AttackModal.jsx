import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ShieldAlert, Timer } from 'lucide-react';
import { useGame } from '../context/GameContext';

const AttackModal = ({ attack, onClose }) => {
    const { team, respondToAttack } = useGame();
    // Use the backend timer if possible, otherwise fallback to 45s default
    const [timeLeft, setTimeLeft] = useState(45);
    const [selectedDefense, setSelectedDefense] = useState(null);
    const [status, setStatus] = useState('pending'); // pending, success, partial, failed
    const [backendResult, setBackendResult] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (timeLeft <= 0 && status === 'pending' && !loading) {
            handleDefend('TIMEOUT_NO_RESPONSE');
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, status, loading]);

    const handleDefend = async (defenseId) => {
        if (status !== 'pending') return;

        setSelectedDefense(defenseId);
        setLoading(true);

        try {
            const defId = defenseId === 'TIMEOUT_NO_RESPONSE' ? '' : defenseId;
            const res = await respondToAttack(defId);

            setStatus(res.outcome); // 'success', 'partial', 'failed'
            setBackendResult(res);
        } catch (err) {
            console.error("Attack response failed:", err);
            setStatus('failed');
        } finally {
            setLoading(false);
            // Auto close after 4 seconds of showing the result
            setTimeout(onClose, 4000);
        }
    };

    // Options map to the exact backend IDs
    const options = [
        { id: 'email-filter', label: 'Advanced Email Filter' },
        { id: 'rate-limit', label: 'Traffic Rate Limiter' },
        { id: 'input-sanitization', label: 'Query Sanitizer' },
        { id: 'backup-restore', label: 'Immutable Backups' },
        { id: 'patch-management', label: 'Zero-Day Patching' }
    ];

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    className={`relative w-full max-w-3xl bg-cyber-surface/90 border-2 rounded-3xl overflow-hidden backdrop-blur-2xl shadow-[0_0_80px_rgba(255,0,85,0.2)] ${status === 'pending' ? 'border-cyber-danger' :
                        status === 'success' ? 'border-cyber-success shadow-[0_0_80px_rgba(0,255,170,0.2)]' :
                            status === 'partial' ? 'border-cyber-warning shadow-[0_0_80px_rgba(255,170,0,0.2)]' :
                                'border-red-900 opacity-90 backdrop-blur-none'
                        }`}
                >
                    {/* Header */}
                    <div className={`p-6 border-b ${status === 'pending' ? 'bg-cyber-danger/20 border-cyber-danger/50' :
                        status === 'success' ? 'bg-cyber-success/20 border-cyber-success/50' :
                            status === 'partial' ? 'bg-cyber-warning/20 border-cyber-warning/50' :
                                'bg-red-900/50 border-red-900'
                        }`}>
                        <div className="flex items-center justify-between">
                            <h2 className={`text-3xl font-bold flex items-center gap-3 uppercase tracking-widest ${status === 'pending' ? 'text-cyber-danger' :
                                status === 'success' ? 'text-cyber-success' :
                                    status === 'partial' ? 'text-cyber-warning' :
                                        'text-red-500'
                                }`}>
                                {status === 'pending' && <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ repeat: Infinity, duration: 2 }}><AlertTriangle className="w-10 h-10" /></motion.div>}
                                {status === 'success' && <ShieldAlert className="w-10 h-10" />}
                                {status === 'partial' && <ShieldAlert className="w-10 h-10 opacity-70" />}
                                {status === 'failed' && <AlertTriangle className="w-10 h-10" />}
                                {status === 'pending' ? 'INCOMING ATTACK' : status === 'success' ? 'DEFENSE SUCCESSFUL' : status === 'partial' ? 'PARTIAL DEFENSE' : 'BREACH DETECTED'}
                            </h2>
                            {status === 'pending' && (
                                <div className="flex items-center gap-2 text-2xl font-mono text-white bg-black/50 px-4 py-2 rounded border border-white/20">
                                    <Timer className={`w-6 h-6 ${timeLeft <= 10 ? 'text-cyber-danger animate-pulse' : 'text-cyber-warning'}`} />
                                    <span className={timeLeft <= 10 ? 'text-cyber-danger' : 'text-white'}>00:{timeLeft.toString().padStart(2, '0')}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Body */}
                    <div className="p-10 space-y-10">
                        <div className="text-center">
                            <h3 className="text-sm text-gray-400 font-bold uppercase tracking-[0.3em] pl-1 mb-2">Threat Signature:</h3>
                            <p className="text-5xl font-bold text-white tracking-widest text-shadow-neon uppercase">{attack.title}</p>
                        </div>

                        {status === 'pending' && (
                            <div className="space-y-6">
                                <p className="text-center text-cyber-warning font-bold uppercase tracking-widest text-xs mb-8 flex items-center justify-center gap-3">
                                    <span className="w-2 h-2 rounded-full bg-cyber-warning animate-ping shadow-[0_0_8px_rgba(255,170,0,0.8)]"></span>
                                    Select Countermeasure
                                    <span className="w-2 h-2 rounded-full bg-cyber-warning animate-ping shadow-[0_0_8px_rgba(255,170,0,0.8)]"></span>
                                </p>
                                <div className="grid grid-cols-2 gap-5">
                                    {options.map((opt) => {
                                        const isOwned = (team?.defenses || []).includes(opt.id);

                                        return (
                                            <motion.button
                                                key={opt.id}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => handleDefend(opt.id)}
                                                disabled={loading}
                                                className={`p-5 border rounded-2xl text-left group transition-all duration-300 ${isOwned
                                                    ? 'bg-cyber-success/10 border-cyber-success hover:bg-cyber-success/20 shadow-[0_0_15px_rgba(0,255,170,0.1)]'
                                                    : 'bg-black/40 border-white/10 hover:border-cyber-accent hover:bg-cyber-accent/10 hover:shadow-[0_0_20px_rgba(0,240,255,0.15)]'
                                                    }`}
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className={`block text-[10px] font-bold uppercase tracking-widest transition-colors ${isOwned ? 'text-cyber-success' : 'text-gray-500 group-hover:text-cyber-accent/80'}`}>
                                                        {isOwned ? 'Protocol Owned' : 'Deploy Protocol'}
                                                    </span>
                                                </div>
                                                <span className={`block text-xl font-bold transition-colors ${isOwned ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
                                                    {opt.label}
                                                </span>
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {status !== 'pending' && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-8"
                            >
                                {status === 'success' && (
                                    <p className="text-2xl font-bold text-cyber-success">
                                        Asset Secured: +PTS / +COINS
                                    </p>
                                )}
                                {status === 'partial' && (
                                    <p className="text-2xl font-bold text-cyber-warning">
                                        Partial Breach: Reduced Rewards
                                    </p>
                                )}
                                {status === 'failed' && (
                                    <p className="text-2xl font-bold text-cyber-danger">
                                        System Compromised: Integrity Lost
                                    </p>
                                )}

                                <p className="text-gray-400 mt-2">Connecting back to main dashboard...</p>
                            </motion.div>
                        )}
                    </div>

                    {/* Scanning Line overlay */}
                    <motion.div
                        animate={{ top: ['-10%', '110%'] }}
                        transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
                        className="absolute left-0 right-0 h-32 bg-gradient-to-b from-transparent via-white/5 to-transparent pointer-events-none"
                    />
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default AttackModal;
