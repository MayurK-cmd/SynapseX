import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function ChatLayout() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const API = api.defaults.baseURL;

  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isLoadingTask, setIsLoadingTask] = useState(false);

  const [prompt, setPrompt] = useState("");
  const [type, setType] = useState("TEXT");
  const [reward, setReward] = useState(10);

  // 🟣 Load User History
  const loadTasks = async () => {
    const res = await fetch(`${API}/tasks/my`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setTasks(data);
  };

  // 🟣 Load Specific Task
  const loadTask = async (id, showLoader = false) => {
    if (showLoader) setIsLoadingTask(true);
    const res = await fetch(`${API}/tasks/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setSelectedTask(data);
    if (showLoader) setIsLoadingTask(false);
  };

  // 🟣 Parse AI response
  const getAIContent = (task) => {
    if (task.result) return task.result;
    if (task.result_hash) {
      try {
        const parsed = typeof task.result_hash === "string"
          ? JSON.parse(task.result_hash)
          : task.result_hash;
        return parsed?.choices?.[0]?.message?.content ?? null;
      } catch (e) {
        console.error("Failed to parse result_hash", e);
        return null;
      }
    }
    return null;
  };

  // 🟣 Create Task
  const sendPrompt = async () => {
    if (!prompt) return;
    const res = await fetch(`${API}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ description: prompt, reward, type }),
    });
    const data = await res.json();
    setPrompt("");
    await loadTasks();
    loadTask(data.id, true);
  };

  // 🟣 Polling logic
  useEffect(() => {
    if (!selectedTask || selectedTask.status === "COMPLETED") return;
    const interval = setInterval(async () => {
      const res = await fetch(`${API}/tasks/${selectedTask.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSelectedTask(data);
      if (data.status === "COMPLETED") {
        clearInterval(interval);
        loadTasks();
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [selectedTask?.id, selectedTask?.status]);

  useEffect(() => { loadTasks(); }, []);

  const isPending = selectedTask && selectedTask.status !== "COMPLETED";
  const aiContent = selectedTask ? getAIContent(selectedTask) : null;

  return (
    <div className="flex h-screen bg-white font-sans text-slate-900 overflow-hidden">
      
      {/* --- Sidebar: Agent History --- */}
      <aside className="w-80 border-r border-slate-100 flex flex-col bg-slate-50/30">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Agent Logs</h3>
          <button 
            onClick={() => navigate('/dashboard')}
            className="text-[10px] font-bold text-blue-600 uppercase tracking-widest cursor-pointer hover:underline"
          >
            ← Back
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              onClick={() => loadTask(task.id, true)}
              className={`p-4 rounded-2xl cursor-pointer transition-all duration-200 border ${
                selectedTask?.id === task.id 
                ? "bg-white border-blue-100 shadow-sm" 
                : "bg-transparent border-transparent hover:bg-white hover:border-slate-100"
              }`}
            >
              <p className="text-sm font-bold truncate text-slate-800 mb-1">{task.title || "Untitled Agent Task"}</p>
              <div className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${task.status === 'COMPLETED' ? 'bg-green-500' : 'bg-amber-500'}`} />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{task.status}</span>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* --- Main Chat Panel --- */}
      <section className="flex-1 flex flex-col relative bg-white">
        
        {/* Messages Display */}
        <div className="flex-1 overflow-y-auto p-10 space-y-12">
          {isLoadingTask ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4 animate-pulse">
              <div className="w-10 h-10 border-2 border-slate-100 border-t-blue-600 rounded-full animate-spin" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Retrieving HCS Logs...</p>
            </div>
          ) : selectedTask ? (
            <div className="max-w-3xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* User Prompt */}
              <div className="flex flex-col items-end">
                <div className="bg-slate-900 text-white px-6 py-4 rounded-[2rem] rounded-tr-none shadow-xl shadow-slate-200 max-w-[80%]">
                  <p className="text-sm leading-relaxed">{selectedTask.description}</p>
                </div>
                <span className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">You • Task #{selectedTask.id}</span>
              </div>

              {/* AI Agent Response */}
              <div className="flex flex-col items-start">
                <div className="bg-white border border-slate-100 px-6 py-6 rounded-[2rem] rounded-tl-none shadow-sm max-w-[90%] min-w-[200px]">
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                    SynapseX Agent
                  </p>

                  {isPending ? (
                    <div className="flex items-center gap-3 py-4">
                      <div className="w-4 h-4 border-2 border-slate-100 border-t-blue-600 rounded-full animate-spin" />
                      <span className="text-sm font-bold text-amber-500 italic">Processing On-Chain...</span>
                    </div>
                  ) : aiContent ? (
                    <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                      {aiContent}
                    </div>
                  ) : selectedTask.output_url ? (
                    <img
                      src={selectedTask.output_url}
                      alt="Generated Artifact"
                      className="rounded-2xl border border-slate-100 shadow-lg mt-2 max-h-[400px] object-cover"
                    />
                  ) : (
                    <p className="text-slate-400 text-sm italic">No output found for this task.</p>
                  )}
                </div>
                <span className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">Hedera Consensus Service • Verified</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full opacity-30 grayscale">
               <div className="w-16 h-16 bg-slate-100 rounded-3xl mb-6 flex items-center justify-center text-3xl italic font-black">S</div>
               <p className="text-xs font-black uppercase tracking-[0.3em]">Initialize Agent Link</p>
            </div>
          )}
        </div>

        {/* --- Input Console --- */}
        <div className="p-8 border-t border-slate-50 bg-white">
          <div className="max-w-3xl mx-auto bg-slate-50 rounded-[2.5rem] border border-slate-100 p-2 shadow-inner">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Command your agent..."
              className="w-full bg-transparent px-6 py-4 text-sm focus:outline-none resize-none h-16 text-slate-800 placeholder:text-slate-400"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendPrompt();
                }
              }}
            />
            <div className="flex items-center justify-between px-4 pb-2">
              <div className="flex items-center gap-2">
                <select 
                  value={type} 
                  onChange={(e) => setType(e.target.value)}
                  className="bg-white border border-slate-200 text-[10px] font-black rounded-full px-3 py-1.5 uppercase tracking-widest cursor-pointer outline-none"
                >
                  <option value="TEXT">Text Gen</option>
                  <option value="IMAGE">Image Gen</option>
                </select>

                <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-full px-3 py-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reward</span>
                  <input
                    type="number"
                    value={reward}
                    onChange={(e) => setReward(Number(e.target.value))}
                    className="w-8 text-[10px] font-bold bg-transparent outline-none text-blue-600"
                  />
                  <span className="text-[10px] font-bold text-blue-600">HBAR</span>
                </div>
              </div>

              <button 
                onClick={sendPrompt} 
                disabled={!prompt}
                className="bg-blue-600 text-white px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-30 disabled:shadow-none cursor-pointer"
              >
                Execute
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Global Animation Styles */}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
}