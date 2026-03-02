import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function ChatLayout() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const API = api.defaults.baseURL;

  // 🟣 State Management
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isLoadingTask, setIsLoadingTask] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [type, setType] = useState("TEXT");
  const [reward, setReward] = useState(10);

  // 🟣 Load History
  const loadTasks = useCallback(async () => {
    try {
      const res = await fetch(`${API}/tasks/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load history:", err);
    }
  }, [API, token]);

  // 🟣 Load Specific Task
  const loadTask = async (id, showLoader = false) => {
    if (showLoader) setIsLoadingTask(true);
    try {
      const res = await fetch(`${API}/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSelectedTask(data);
    } catch (err) {
      console.error("Error fetching task:", err);
    } finally {
      if (showLoader) setIsLoadingTask(false);
    }
  };

  // 🟣 New Chat (Gemini Style)
  const handleNewChat = () => {
    setSelectedTask(null);
    setPrompt("");
  };

  // 🟣 Create Task
  const sendPrompt = async () => {
    if (!prompt.trim()) return;
    
    try {
      const res = await fetch(`${API}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ description: prompt, reward, type }),
      });
      const newTask = await res.json();
      
      setPrompt(""); 
      await loadTasks(); 
      loadTask(newTask.id, true); 
    } catch (err) {
      console.error("Task creation failed:", err);
    }
  };

  // 🟣 Polling Logic
  useEffect(() => {
    if (!selectedTask || selectedTask.status === "COMPLETED" || selectedTask.status === "FAILED") return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API}/tasks/${selectedTask.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const updatedTask = await res.json();
        setSelectedTask(updatedTask);

        if (updatedTask.status === "COMPLETED" || updatedTask.status === "FAILED") {
          loadTasks();
          clearInterval(interval);
        }
      } catch (e) {
        console.error("Polling error:", e);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedTask?.id, selectedTask?.status, token, API, loadTasks]);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  const isPending = selectedTask && (selectedTask.status === "OPEN" || selectedTask.status === "IN_PROGRESS");

  return (
    <div className="flex h-screen bg-white font-sans text-slate-900 overflow-hidden">
      
      {/* --- Sidebar --- */}
      <aside className="w-80 border-r border-slate-100 flex flex-col bg-slate-50/50">
        <div className="p-6 border-b border-slate-100 space-y-4 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-[.3em]">SynapseX</span>
            <button onClick={() => navigate('/dashboard')} className="text-[10px] font-bold text-slate-400 hover:text-blue-600 uppercase tracking-widest cursor-pointer">← Exit</button>
          </div>
          
          <button 
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95"
          >
            <span className="text-lg leading-none">+</span> New Competition
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[.2em] mb-4 ml-2">Recent Battles</p>
          
          {/* Force Sort: Latest First (Descending ID) */}
          {[...tasks]
            .sort((a, b) => parseInt(b.id) - parseInt(a.id))
            .map((task) => (
            <div 
              key={task.id} 
              onClick={() => loadTask(task.id, true)} 
              className={`p-4 rounded-2xl cursor-pointer transition-all border ${
                selectedTask?.id === task.id 
                ? "bg-white border-blue-200 shadow-sm ring-1 ring-blue-50" 
                : "border-transparent hover:bg-white hover:border-slate-200"
              }`}
            >
              <p className={`text-sm font-bold truncate ${selectedTask?.id === task.id ? 'text-blue-600' : 'text-slate-700'}`}>
                {task.description.substring(0, 30)}...
              </p>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${task.status === 'COMPLETED' ? 'bg-green-500' : 'bg-amber-500'}`} />
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{task.status}</span>
                </div>
                <span className="text-[8px] font-mono text-slate-300">#{task.id}</span>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* --- Main Arena --- */}
      <section className="flex-1 flex flex-col bg-white">
        <div className="flex-1 overflow-y-auto p-10">
          {isLoadingTask ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fetching Logs...</p>
            </div>
          ) : selectedTask ? (
            <div className="max-w-3xl mx-auto space-y-10 animate-in fade-in duration-500">
              
              {/* User Side */}
              <div className="flex flex-col items-end">
                <div className="bg-slate-900 text-white px-6 py-4 rounded-3xl rounded-tr-none text-sm max-w-[85%] shadow-xl">
                  {selectedTask.description}
                </div>
                <div className="mt-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                  Task #{selectedTask.id} • Bounty: {selectedTask.reward} HBAR
                </div>
              </div>

              {/* AI Side */}
              <div className="flex flex-col items-start">
                <div className={`w-full bg-white border rounded-[2.5rem] rounded-tl-none p-8 transition-all ${isPending ? 'border-blue-200 shadow-blue-50 shadow-2xl' : 'border-slate-100 shadow-sm'}`}>
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${isPending ? 'bg-blue-600 animate-ping' : 'bg-slate-300'}`} />
                      Arena Response
                    </span>
                    <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase ${
                      selectedTask.status === 'COMPLETED' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
                    }`}>{selectedTask.status}</span>
                  </div>

                  {isPending ? (
                    <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-blue-50 rounded-3xl bg-blue-50/20">
                       <div className="flex gap-1 mb-4">
                          <div className="w-1.5 h-6 bg-blue-600 animate-bounce" style={{animationDelay:'0.1s'}} />
                          <div className="w-1.5 h-6 bg-blue-400 animate-bounce" style={{animationDelay:'0.2s'}} />
                          <div className="w-1.5 h-6 bg-blue-200 animate-bounce" style={{animationDelay:'0.3s'}} />
                       </div>
                       <p className="text-xs font-bold text-slate-600">Models are competing...</p>
                       <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-widest">~10s for on-chain consensus</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {selectedTask.status === "COMPLETED" && selectedTask.winner_agent && (
                        <div className="grid grid-cols-2 gap-4 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                          <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Winner</p>
                            <p className="text-xs font-bold text-slate-800">{selectedTask.winner_agent.name}</p>
                            <br></br>
                             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Winner Agent ID</p>
                            <p className="text-xs font-bold text-slate-800">{selectedTask.winner_agent.id}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Usage</p>
                            <p className="text-xs font-bold text-blue-600">{selectedTask.total_tokens_used || 0} tokens</p>
                            <br></br>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Models Competed</p>
                            <p className="text-xs font-bold text-blue-600">{selectedTask.total_models_competed || 0} models</p>
                          </div>
                          <div className="col-span-2 pt-3 border-t border-slate-200">
                             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Winner Wallet</p>
                             <p className="text-[10px] font-mono text-slate-500 break-all leading-tight">{selectedTask.winner_agent.wallet_address}</p>
                          </div>
                        </div>
                      )}
                      <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {selectedTask.result || (selectedTask.status === "FAILED" ? "Model competition failed to reach consensus." : "Awaiting logs...")}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-3xl mb-4 flex items-center justify-center text-2xl font-black italic text-slate-200">S</div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Start a New Competition</h2>
              <p className="text-xs text-slate-400 max-w-xs uppercase tracking-widest font-medium">Post a task below and let AI models battle for the HBAR bounty.</p>
            </div>
          )}
        </div>

        {/* --- Input --- */}
        <div className="p-8">
          <div className="max-w-3xl mx-auto bg-slate-50 rounded-[2.5rem] border border-slate-200 p-2 shadow-inner focus-within:border-blue-300 transition-all">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Post a competitive task..."
              className="w-full bg-transparent px-6 py-4 text-sm focus:outline-none resize-none h-16 text-slate-800"
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendPrompt(); } }}
            />
            <div className="flex items-center justify-between px-4 pb-2">
              <div className="flex gap-2">
                <select value={type} onChange={(e) => setType(e.target.value)} className="bg-white border border-slate-200 text-[10px] font-black rounded-full px-3 py-1.5 outline-none cursor-pointer hover:border-blue-300 transition-colors">
                  <option value="TEXT">TEXT</option>
                  <option value="IMAGE">IMAGE</option>
                </select>
                <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-full px-3 py-1">
                  <input type="number" value={reward} onChange={(e) => setReward(Number(e.target.value))} className="w-8 text-[10px] font-bold text-blue-600 outline-none" />
                  <span className="text-[10px] font-black text-slate-400 uppercase">HBAR</span>
                </div>
              </div>
              <button 
                onClick={sendPrompt} 
                disabled={!prompt.trim() || isPending} 
                className="bg-blue-600 text-white px-8 py-2 rounded-full font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-blue-700 disabled:opacity-30 transition-all"
              >
                {isPending ? 'Competing...' : 'Execute'}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}