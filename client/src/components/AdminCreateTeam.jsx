import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, UserPlus, Key, Lock, CheckCircle, AlertCircle } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_APP_BACKEND_URL || 'http://localhost:5001';

const AdminCreateTeam = () => {
    const [form, setForm] = useState({ name: '', password: '', adminKey: '' });
    const [status, setStatus] = useState(null); // null | 'loading' | 'success' | 'error'
    const [message, setMessage] = useState('');

    const handleChange = (e) =>
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        setMessage('');

        try {
            const res = await fetch(`${BACKEND_URL}/team/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-key': form.adminKey,
                },
                body: JSON.stringify({ name: form.name, password: form.password }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Creation failed');

            setStatus('success');
            setMessage(`Team "${data.name}" created successfully!`);
            setForm(prev => ({ ...prev, name: '', password: '' }));
        } catch (err) {
            setStatus('error');
            setMessage(err.message);
        } finally {
            setTimeout(() => setStatus(null), 4000);
        }
    };

    return (
        <div className="min-h-screen bg-cyber-bg flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <motion.div
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 4 }}
                        className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cyber-accent/10 border border-cyber-accent/30 mb-4"
                    >
                        <UserPlus className="w-8 h-8 text-cyber-accent" />
                    </motion.div>
                    <h1 className="text-3xl font-bold text-white tracking-widest uppercase">Admin Panel</h1>
                    <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest">Create Team Account</p>
                </div>

                {/* Card */}
                <div className="bg-cyber-surface border border-cyber-accent/20 rounded-2xl p-8 shadow-[0_0_40px_rgba(0,240,255,0.05)]">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Admin Key */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-cyber-accent mb-2">
                                Admin Key
                            </label>
                            <div className="relative">
                                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    type="password"
                                    name="adminKey"
                                    value={form.adminKey}
                                    onChange={handleChange}
                                    placeholder="Enter admin key"
                                    required
                                    className="w-full bg-black/40 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-cyber-accent transition-colors"
                                />
                            </div>
                        </div>

                        <hr className="border-white/5" />

                        {/* Team Name */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                                Team Name
                            </label>
                            <div className="relative">
                                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="Team designation"
                                    required
                                    className="w-full bg-black/40 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-cyber-accent transition-colors"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                                Access Code (Password)
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    type="password"
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    placeholder="Set team password"
                                    required
                                    className="w-full bg-black/40 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-cyber-accent transition-colors"
                                />
                            </div>
                        </div>

                        {/* Status Message */}
                        {status && status !== 'loading' && (
                            <motion.div
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium ${status === 'success'
                                        ? 'bg-cyber-success/10 border border-cyber-success/30 text-cyber-success'
                                        : 'bg-cyber-danger/10 border border-cyber-danger/30 text-cyber-danger'
                                    }`}
                            >
                                {status === 'success' ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                                {message}
                            </motion.div>
                        )}

                        {/* Submit */}
                        <motion.button
                            type="submit"
                            whileTap={{ scale: 0.97 }}
                            disabled={status === 'loading'}
                            className="w-full bg-cyber-accent text-black font-bold py-3 rounded-lg uppercase tracking-widest hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                        >
                            {status === 'loading' ? (
                                <>
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                                        className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full"
                                    />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <UserPlus className="w-4 h-4" />
                                    Create Team
                                </>
                            )}
                        </motion.button>
                    </form>
                </div>

                <p className="text-center text-gray-600 text-xs mt-6">
                    Teams start with 100 health, 1000 coins, and 0 score.
                </p>
            </motion.div>
        </div>
    );
};

export default AdminCreateTeam;
