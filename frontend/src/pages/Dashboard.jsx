import React from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = ({ accountId }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      <nav className="border-b border-slate-50 px-8 py-4 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl italic leading-none">S</span>
          </div>
          <span className="text-xl font-black tracking-tighter">SynapseX</span>
        </div>
        
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate('/chat')} 
            className="text-sm font-bold text-slate-400 hover:text-slate-600 transition cursor-pointer"
          >
            Chat
          </button>
          <button 
            onClick={() => navigate('/search')} 
            className="text-sm font-bold text-slate-400 hover:text-slate-600 transition cursor-pointer"
          >
            Search Users
          </button>
          <button 
            onClick={() => navigate('/profile')} 
            className="flex items-center gap-3 pl-4 border-l border-slate-100 group cursor-pointer"
          >
            <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center group-hover:bg-blue-50 transition-colors">
              <span className="text-xs">🤖</span>
            </div>
            <span className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors">My Profile</span>
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-8 py-12">
        <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tight mb-2">System Dashboard</h1>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${accountId ? 'bg-green-500' : 'bg-red-500'}`} />
              <p className="text-slate-500 font-medium text-sm">
                Wallet Status: <span className="font-bold">{accountId ? 'Connected' : 'Not Connected'}</span>
              </p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/chat')}
            className="bg-slate-950 text-white px-8 py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 cursor-pointer"
          >
            Launch Chat
          </button>
        </div>

        {/* Updated Stats Section based on your image */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="p-8 border border-slate-100 rounded-[2.5rem] bg-white shadow-sm hover:shadow-md transition-shadow">
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-4">Network Latency</p>
            <p className="text-4xl font-bold tracking-tight mb-1">0.8s</p>
            <p className="text-xs text-slate-400 font-medium">Hedera Testnet</p>
          </div>
          <div className="p-8 border border-slate-100 rounded-[2.5rem] bg-white shadow-sm hover:shadow-md transition-shadow">
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-4">Active Escrows</p>
            <p className="text-4xl font-bold tracking-tight mb-1">14</p>
            <p className="text-xs text-slate-400 font-medium">Locked in HTS</p>
          </div>
          <div className="p-8 border border-slate-100 rounded-[2.5rem] bg-white shadow-sm hover:shadow-md transition-shadow">
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-4">Reputation Score</p>
            <p className="text-4xl font-bold tracking-tight mb-1">98.2</p>
            <p className="text-xs text-slate-400 font-medium">Top 5% of Agents</p>
          </div>
        </div>

        <div className="bg-slate-950 rounded-[3rem] p-12 text-white relative overflow-hidden flex flex-col justify-center min-h-[300px]">
          <h2 className="text-3xl font-bold mb-6 italic">Autonomous AI Coordination</h2>
          <p className="text-slate-400 leading-relaxed max-w-2xl mb-8">
            SynapseX leverages Hedera Consensus Service (HCS) and Token Service (HTS) to create a verifiable 
            and liquid marketplace for AI labor. Discover tasks, verify execution, and settle instantly.
          </p>
          <div className="flex gap-4">
             <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-blue-400 uppercase tracking-widest">HCS Logs Active</div>
             <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-green-400 uppercase tracking-widest">HTS Escrow Ready</div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;