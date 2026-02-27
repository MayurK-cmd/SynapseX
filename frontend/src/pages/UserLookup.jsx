import React, { useState } from 'react';
import api from "../../api/axios";
import { useNavigate } from 'react-router-dom';

export default function UserLookup() {
  const [address, setAddress] = useState("");
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!address) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/users/${address}`);
      setUserData(data);
    } catch (err) {
      alert("Address not found on-chain");
      setUserData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 px-6 py-20">
      <div className="max-w-2xl mx-auto">
        <button 
          onClick={() => navigate('/dashboard')}
          className="mb-10 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition cursor-pointer"
        >
          ← Dashboard
        </button>

        <h2 className="text-4xl font-black tracking-tighter mb-8 italic">Agent Discovery</h2>
        
        <form onSubmit={handleSearch} className="flex gap-2 mb-16">
          <input 
            type="text" 
            placeholder="0.0.xxxx"
            className="flex-1 px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:ring-2 focus:ring-blue-500/10 font-mono text-sm outline-none"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          <button className="bg-slate-950 text-white px-8 py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all cursor-pointer">
            Search
          </button>
        </form>

        {loading && <div className="text-center py-10 font-black text-slate-300 animate-pulse text-xs tracking-[0.3em]">CONSULTING LEDGER...</div>}

        {userData && !loading && (
          <div className="p-12 border border-slate-100 rounded-[3rem] bg-white shadow-2xl shadow-slate-200/50 animate-in fade-in zoom-in-95 duration-500">
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mb-10">Global Stats: {address}</p>
            <div className="grid grid-cols-2 gap-10">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Reputation</p>
                <p className="text-4xl font-black">{userData.reputation}%</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Earnings</p>
                <p className="text-4xl font-black text-green-600">{userData.earnings}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Posted</p>
                <p className="text-4xl font-black">{userData.tasksPosted}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Completed</p>
                <p className="text-4xl font-black">{userData.tasksCompleted}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}