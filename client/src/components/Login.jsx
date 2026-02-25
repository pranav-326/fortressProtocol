import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock } from 'lucide-react';
import { useGame } from '../context/GameContext';

const Login = () => {
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useGame();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const res = await login(name, password);
        if (!res.success) {
            setError(res.error || 'Invalid credentials');
        }

        setLoading(false);
    };

    return (
        <div className="flex items-center justify-center w-full relative">
            {/* Background Glows */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyber-accent rounded-full blur-[150px] opacity-10 pointer-events-none"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="bg-cyber-surface/70 border border-white/10 p-10 rounded-3xl shadow-[0_0_50px_rgba(0,240,255,0.15)] w-full max-w-md backdrop-blur-xl relative z-10"
            >
                <div className="flex justify-center mb-8">
                    <div className="w-20 h-20 rounded-2xl bg-cyber-accent/10 border border-cyber-accent/20 flex items-center justify-center text-cyber-accent shadow-[0_0_30px_rgba(0,240,255,0.2)]">
                        <Shield className="w-10 h-10 animate-pulse" />
                    </div>
                </div>

                <h2 className="text-3xl font-bold text-center text-white mb-2 tracking-widest uppercase">
                    Fortress Protocol
                </h2>
                <p className="text-cyber-accent/80 font-bold tracking-widest text-center mb-8 text-[11px] uppercase">SECURE TERMINAL ACCESS</p>

                {error && (
                    <div className="bg-cyber-danger/20 border border-cyber-danger text-cyber-danger px-4 py-3 rounded mb-6 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-3 pl-1">
                            Team Designation
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-cyber-accent/50 focus:ring-1 focus:ring-cyber-accent/50 transition-all placeholder-gray-600 text-sm font-medium"
                            placeholder="Enter team name"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-3 pl-1">
                            Access Code
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-cyber-accent/50 focus:ring-1 focus:ring-cyber-accent/50 transition-all placeholder-gray-600 text-xl tracking-[0.3em]"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !name || !password}
                        className="w-full bg-cyber-accent text-black font-bold uppercase tracking-widest py-4 mt-2 rounded-xl flex items-center justify-center gap-2 hover:bg-white hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all disabled:opacity-50 disabled:hover:shadow-none"
                    >
                        {loading ? 'Authenticating...' : (
                            <>
                                Initiate Connection <Lock className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default Login;
