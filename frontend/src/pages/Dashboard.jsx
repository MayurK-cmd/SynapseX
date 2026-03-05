import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from "../../api/axios";


const Dashboard = ({ accountId }) => {
  const navigate = useNavigate();
  const API = api.defaults.baseURL;
  const token = localStorage.getItem("token");
  const [walletAddress, setWalletAddress] = useState("");
  const [stats, setStats] = useState({
    total_models: 0, total_users: 0, total_tasks: 0,
    completed_tasks: 0, failed_tasks: 0,
    platform_agents: 0, user_agents: 0, total_rewards: 0,avg_latency_ms:0
  });
  const [recentTasks, setRecentTasks] = useState([]);
  const [myAgents, setMyAgents] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [statsRes, tasksRes, agentsRes, lbRes] = await Promise.all([
          fetch(`${API}/stats`, { headers }),
          fetch(`${API}/tasks/my`, { headers }),
          fetch(`${API}/agents/my`, { headers }),
          fetch(`${API}/stats/leaderboard`, { headers }),
        ]);
        const [statsData, tasksData, agentsData, lbData] = await Promise.all([
          statsRes.json(), tasksRes.json(), agentsRes.json(), lbRes.json(),
        ]);
        setStats(statsData);
        setRecentTasks(Array.isArray(tasksData) ? tasksData.slice(0, 5) : []);
        setMyAgents(Array.isArray(agentsData) ? agentsData : []);
        setLeaderboard(Array.isArray(lbData) ? lbData : []);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      }
    };
    fetchAll();
  }, [API, token]);

  useEffect(()=>{
    if(!window.ethereum) return;

    window.ethereum.request({method:"eth_accounts"})
      .then(accounts => setWalletAddress(accounts[0] || ""));

    window.ethereum.on("accountsChanged",(accounts) => {
      setWalletAddress(accounts[0] || "");
    });
  }, []);

  

  const successRate = stats.total_tasks > 0
    ? Math.round((stats.completed_tasks / stats.total_tasks) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      {/* Nav */}
      <nav className="border-b border-slate-50 px-8 py-4 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl italic leading-none">S</span>
          </div>
          <span className="text-xl font-black tracking-tighter">SynapseX</span>
        </div>
        <div className="flex items-center gap-6">
          <button onClick={() => navigate('/chat')} className="text-sm font-bold text-slate-400 hover:text-slate-600 transition cursor-pointer">Chat</button>
          <button onClick={() => navigate('/agents')} className="text-sm font-bold text-slate-400 hover:text-slate-600 transition cursor-pointer">Agents</button>
          <button onClick={() => navigate('/profile')} className="flex items-center gap-3 pl-4 border-l border-slate-100 group cursor-pointer">
            <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center group-hover:bg-blue-50 transition-colors">
              <span className="text-xs">🤖</span>
            </div>
            <span className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors">My Profile</span>
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-8 py-12 space-y-10">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tight mb-2">System Dashboard</h1>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${walletAddress ? 'bg-green-500 animate-pulse' : 'bg-red-400'}`} />
              <span className="text-sm text-slate-500">Wallet: </span>
              <span className={`text-sm font-bold ${walletAddress ? 'text-green-600' : 'text-red-500'}`}>
                {walletAddress ? `Connected — ${walletAddress}` : "Not Connected"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/agents')} className="bg-white text-slate-950 border-2 border-slate-950 px-6 py-3 rounded-2xl font-bold hover:bg-slate-50 transition-all cursor-pointer text-sm">
              + Add Model
            </button>
            <button onClick={() => navigate('/chat')} className="bg-slate-950 text-white px-6 py-3 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 cursor-pointer text-sm">
              Launch Chat →
            </button>
          </div>
        </div>

        {/* Primary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
  {[
    { label: "Total Models", value: stats.total_models, sub: `${stats.platform_agents} platform · ${stats.user_agents} user`, color: "text-blue-600" },
    { label: "Total Users", value: stats.total_users, sub: "Active participants", color: "text-violet-600" },
    { label: "Total Tasks", value: stats.total_tasks, sub: `${stats.completed_tasks} done · ${stats.failed_tasks} failed`, color: "text-emerald-600" },
    { label: "Avg Latency", value: `${(stats.avg_latency_ms / 1000).toFixed(1)}s`, sub: "Per model execution", color: "text-amber-600" },
  ].map((s) => (
    <div key={s.label} className="p-6 border border-slate-100 rounded-[2rem] bg-white shadow-sm hover:shadow-md transition-shadow">
      <p className={`text-[9px] font-black uppercase tracking-[0.2em] mb-3 ${s.color}`}>{s.label}</p>
      <p className="text-3xl font-black tracking-tight mb-1">{s.value}</p>
      <p className="text-[10px] text-slate-400 font-medium">{s.sub}</p>
    </div>
  ))}
</div>
        

        {/* Success Rate + Model Split */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Success Rate Bar */}
          <div className="p-8 border border-slate-100 rounded-[2rem] bg-white shadow-sm">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Task Success Rate</p>
            <div className="flex items-end gap-4 mb-4">
              <span className="text-5xl font-black text-slate-900">{successRate}%</span>
              <span className="text-sm text-slate-400 mb-2 font-medium">{stats.completed_tasks} of {stats.total_tasks} tasks</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full transition-all duration-700" style={{ width: `${successRate}%` }} />
            </div>
            <div className="flex justify-between mt-3">
              <span className="text-[9px] font-bold text-green-600 uppercase tracking-widest">✓ {stats.completed_tasks} Completed</span>
              <span className="text-[9px] font-bold text-red-400 uppercase tracking-widest">✗ {stats.failed_tasks} Failed</span>
            </div>
          </div>

          {/* Model Pool Split */}
          <div className="p-8 border border-slate-100 rounded-[2rem] bg-white shadow-sm">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Model Pool Breakdown</p>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Platform</span>
                  <span className="text-[10px] font-bold text-slate-500">{stats.platform_agents} models</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full transition-all duration-700"
                    style={{ width: stats.total_models > 0 ? `${(stats.platform_agents / stats.total_models) * 100}%` : '0%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-[10px] font-black text-violet-600 uppercase tracking-widest">User</span>
                  <span className="text-[10px] font-bold text-slate-500">{stats.user_agents} models</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-violet-500 h-2 rounded-full transition-all duration-700"
                    style={{ width: stats.total_models > 0 ? `${(stats.user_agents / stats.total_models) * 100}%` : '0%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Grid: Recent Tasks + My Agents + Leaderboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Recent Tasks */}
          <div className="p-6 border border-slate-100 rounded-[2rem] bg-white shadow-sm">
            <div className="flex justify-between items-center mb-5">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Recent Tasks</p>
              <button onClick={() => navigate('/chat')} className="text-[9px] font-black text-blue-600 uppercase tracking-widest hover:underline">View All →</button>
            </div>
            {recentTasks.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">No tasks yet</p>
            ) : (
              <div className="space-y-3">
                {recentTasks.map((task) => (
                  <div key={task.id} className="flex items-start gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => navigate('/chat')}>
                    <div className={`mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0 ${task.status === 'COMPLETED' ? 'bg-green-500' : task.status === 'FAILED' ? 'bg-red-400' : 'bg-amber-400'}`} />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-700 truncate">{task.description?.substring(0, 35)}...</p>
                      <p className="text-[9px] text-slate-400 uppercase tracking-widest mt-0.5">{task.status} · {task.reward} ℏ</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* My Agents */}
          <div className="p-6 border border-slate-100 rounded-[2rem] bg-white shadow-sm">
            <div className="flex justify-between items-center mb-5">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">My Agents</p>
              <button onClick={() => navigate('/agents')} className="text-[9px] font-black text-blue-600 uppercase tracking-widest hover:underline">Manage →</button>
            </div>
            {myAgents.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-xs text-slate-400 mb-3">No agents registered</p>
                <button onClick={() => navigate('/agents')} className="text-[10px] font-black text-blue-600 border border-blue-200 px-4 py-2 rounded-full hover:bg-blue-50 transition">+ Add Model</button>
              </div>
            ) : (
              <div className="space-y-3">
                {myAgents.slice(0, 4).map((agent) => (
                  <div key={agent.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-700 truncate">{agent.name}</p>
                      <p className="text-[9px] font-mono text-slate-400 truncate">{agent.model_identifier}</p>
                    </div>
                    <span className={`text-[8px] font-black px-2 py-1 rounded-full uppercase flex-shrink-0 ml-2 ${agent.competition_enabled ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                      {agent.competition_enabled ? 'Active' : 'Off'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Leaderboard */}
          <div className="p-6 border border-slate-100 rounded-[2rem] bg-white shadow-sm">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-5">Top Agents</p>
            {leaderboard.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">No data yet</p>
            ) : (
              <div className="space-y-3">
                {leaderboard.map((agent, i) => (
                  <div key={agent.id} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-colors">
                    <span className={`text-[10px] font-black w-5 text-center flex-shrink-0 ${i === 0 ? 'text-amber-500' : i === 1 ? 'text-slate-400' : i === 2 ? 'text-orange-400' : 'text-slate-300'}`}>
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-700 truncate">{agent.name}</p>
                      <p className="text-[9px] text-slate-400 uppercase tracking-widest">{agent.model_source}</p>
                    </div>
                    <span className="text-[9px] font-black text-blue-600 flex-shrink-0">{agent.reputation} rep</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Hero Banner */}
        <div className="bg-slate-950 rounded-[3rem] p-12 text-white relative overflow-hidden flex flex-col justify-center min-h-[200px]">
          <h2 className="text-3xl font-bold mb-4 italic">Autonomous AI Coordination</h2>
          <p className="text-slate-400 leading-relaxed max-w-2xl mb-6 text-sm">
            SynapseX leverages Hedera Consensus Service (HCS) and Token Service (HTS) to create a verifiable
            and liquid marketplace for AI labor. Discover tasks, verify execution, and settle instantly.
          </p>
          <div className="flex gap-3">
            <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-blue-400 uppercase tracking-widest">HCS Logs Active</div>
            <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-green-400 uppercase tracking-widest">HTS Escrow Ready</div>
          </div>
        </div>

      </main>
    </div>
  );
};

export default Dashboard;