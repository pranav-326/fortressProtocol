import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { Shield, Coins, Activity, LogOut } from 'lucide-react';
import Dashboard from './components/Dashboard';
import Store from './components/Store';
import AttackModal from './components/AttackModal';
import Login from './components/Login';
import AdminCreateTeam from './components/AdminCreateTeam';
import { GameProvider, useGame } from './context/GameContext';

const AppContent = () => {
  const { team, gameState, currentAttack, loading, logout } = useGame();

  if (loading) {
    return <div className="min-h-screen bg-cyber-bg flex items-center justify-center text-cyber-accent">Loading Terminals...</div>;
  }

  if (!team) {
    return (
      <Router>
        <Routes>
          <Route path="/admin" element={<AdminCreateTeam />} />
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center bg-cyber-bg text-gray-200 font-sans selection:bg-cyber-accent selection:text-black p-4">
              <Login />
            </div>
          } />
        </Routes>
      </Router>
    );
  }

  // Active attack is triggered globally when gameState has an attack ID,
  // the team hasn't already responded, and the attack document has been fetched.
  const isAttackActive = gameState?.currentAttackId
    && team?.lastRespondedAttackId !== gameState?.currentAttackId
    && currentAttack?.id === gameState?.currentAttackId;

  // Use the real attack data from Firestore instead of hardcoded values
  const activeAttackData = isAttackActive ? {
    id: currentAttack.id,
    title: currentAttack.name,
    description: currentAttack.description || '',
    responseWindow: currentAttack.responseWindow || 45
  } : null;

  return (
    <Router>
      <div className="min-h-screen bg-cyber-bg text-gray-200 font-sans selection:bg-cyber-accent selection:text-black">
        {/* Navigation / Header */}
        <nav className="sticky top-0 z-50 bg-cyber-surface/80 border-b border-white/5 backdrop-blur-xl shrink-0">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Shield className="w-8 h-8 text-cyber-accent filter drop-shadow-[0_0_8px_rgba(0,240,255,0.5)]" />
              <div>
                <h1 className="text-xl font-bold text-white tracking-widest uppercase">{team.name}</h1>
                <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase text-cyber-success mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyber-success animate-pulse shadow-[0_0_5px_rgba(0,255,170,0.8)]"></span>
                  System Online
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3 bg-black/40 px-5 py-2.5 rounded-xl border border-white/5 shadow-inner">
                <Activity className="w-4 h-4 text-cyber-warning drop-shadow-[0_0_5px_rgba(255,170,0,0.5)]" />
                <span className="font-mono text-white text-sm tracking-widest">{team.score?.toLocaleString() || 0} PTS</span>
              </div>
              <div className="flex items-center gap-3 bg-black/40 px-5 py-2.5 rounded-xl border border-white/5 shadow-inner">
                <Coins className="w-4 h-4 text-yellow-400 drop-shadow-[0_0_5px_rgba(255,255,0,0.5)]" />
                <span className="font-mono text-white text-sm tracking-widest">{team.coins?.toLocaleString() || 0}</span>
              </div>
            </div>

            <div className="flex gap-2 items-center">
              <Link to="/" className="px-5 py-2 rounded-lg font-bold text-sm tracking-wider uppercase text-gray-400 hover:text-white hover:bg-white/5 transition-all">Dashboard</Link>
              <Link to="/store" className="px-5 py-2 rounded-lg font-bold text-sm tracking-wider uppercase text-gray-400 hover:text-white hover:bg-white/5 transition-all">Store</Link>
              <div className="h-6 w-px bg-white/10 mx-2"></div>
              <button onClick={logout} className="p-2 text-gray-500 hover:text-cyber-danger hover:bg-cyber-danger/10 rounded-lg transition-all" title="Disconnect">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </nav>

        {/* Global Test Actions (Remove in production - keeping mostly for user reference) */}
        {!isAttackActive && (
          <div className="fixed bottom-4 right-4 z-50 text-xs text-gray-500 bg-black/50 p-2 rounded">
            Attacks managed via Backend & GameState sync
          </div>
        )}

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto w-full px-6 py-10">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/store" element={<Store />} />
            <Route path="/admin" element={<AdminCreateTeam />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Attack Modal (Global Overlay) */}
        {activeAttackData && (
          <AttackModal
            key={activeAttackData.id}
            attack={activeAttackData}
            onClose={() => { }}
          />
        )}
      </div>
    </Router>
  );
};

function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}

export default App;
