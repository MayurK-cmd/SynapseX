import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { ethers } from "ethers";

const ESCROW_CONTRACT_ADDRESS = import.meta.env.VITE_ESCROW_CONTRACT_ADDRESS;
const ESCROW_ABI = [
  "function lockTask(bytes32 taskId) external payable",
];

const getMetaMaskProvider = () => {
  if (!window.ethereum) throw new Error("MetaMask not installed");
  if (window.ethereum.providers) {
    const mm = window.ethereum.providers.find(p => p.isMetaMask && !p.isPhantom);
    if (!mm) throw new Error("MetaMask not found");
    return new ethers.BrowserProvider(mm);
  }
  if (window.ethereum.isPhantom) throw new Error("Please use MetaMask not Phantom");
  return new ethers.BrowserProvider(window.ethereum);
};

const lockTaskOnChain = async (taskId, rewardHbar) => {
  const provider = getMetaMaskProvider();
  try {
    await provider.send("wallet_switchEthereumChain", [{ chainId: "0x128" }]);
  } catch (err) {
    if (err.code === 4902 || err?.error?.code === 4902) {
      await provider.send("wallet_addEthereumChain", [{
        chainId: "0x128",
        chainName: "Hedera Testnet",
        nativeCurrency: { name: "HBAR", symbol: "HBAR", decimals: 18 },
        rpcUrls: ["https://testnet.hashio.io/api"],
        blockExplorerUrls: ["https://hashscan.io/testnet"],
      }]);
    } else throw err;
  }
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(ESCROW_CONTRACT_ADDRESS, ESCROW_ABI, signer);
  const taskIdBytes32 = ethers.id(taskId);
  const valueInWeibars = ethers.parseEther(String(rewardHbar));
  const tx = await contract.lockTask(taskIdBytes32, { value: valueInWeibars });
  console.log("lockTask tx sent:", tx.hash);
  await tx.wait();
  console.log("lockTask confirmed:", tx.hash);
  return tx.hash;
};

// ─── Model Selection Popup ────────────────────────────────────────────────────
function ModelSelectionPopup({ poolType, onConfirm, onClose, token, API }) {
  const [models, setModels] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const res = await fetch(
          `${API}/agents/available?pool=${poolType}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        setModels(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch models:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchModels();
  }, [poolType, token, API]);

  const toggle = (id) => {
    setSelected(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : prev.length < 3 ? [...prev, id] : prev
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div
        className="w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden"
        style={{ background: 'rgba(15,31,35,0.95)', backdropFilter: 'blur(12px)', border: '1px solid rgba(0,208,255,0.2)' }}
      >
        {/* Header */}
        <div className="px-8 pt-8 pb-4">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] font-black text-cyan-400 uppercase tracking-[.3em]">
              {poolType} Pool
            </p>
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-cyan-400 transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <h2 className="text-xl font-black text-slate-100">Choose Your Competitors</h2>
          <p className="text-xs text-slate-400 mt-1">
            Select up to 3 models — they will compete for the bounty
          </p>
        </div>

        {/* Progress bars */}
        <div className="px-8 pb-3">
          <div className="flex gap-2">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                  i < selected.length ? 'bg-cyan-400' : 'bg-white/10'
                }`}
              />
            ))}
          </div>
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1.5">
            {selected.length}/3 selected
          </p>
        </div>

        {/* Model list */}
        <div className="px-8 pb-4 max-h-72 overflow-y-auto space-y-2">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : models.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-sm font-bold text-slate-500">No models available</p>
            </div>
          ) : (
            models.map(model => {
              const isSelected = selected.includes(model.id);
              const isDisabled = !isSelected && selected.length >= 3;
              return (
                <div
                  key={model.id}
                  onClick={() => !isDisabled && toggle(model.id)}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-cyan-400/50 bg-cyan-400/10'
                      : isDisabled
                      ? 'border-white/5 bg-white/5 opacity-40 cursor-not-allowed'
                      : 'border-white/5 hover:border-cyan-400/30 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                      isSelected ? 'border-cyan-400 bg-cyan-400' : 'border-slate-600'
                    }`}>
                      {isSelected && (
                        <svg className="w-2.5 h-2.5 text-[#0f1f23]" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-100 truncate">{model.name}</p>
                      <p className="text-[10px] font-mono text-slate-500 truncate">{model.model_identifier}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0 ml-3">
                    <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase ${
                      model.model_source === 'PLATFORM'
                        ? 'bg-cyan-400/10 text-cyan-400'
                        : 'bg-violet-400/10 text-violet-400'
                    }`}>
                      {model.model_source}
                    </span>
                    <span className="text-[9px] font-bold text-amber-400">{model.reputation} rep</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-8 pb-8 pt-2 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-white/10 text-xs font-black text-slate-400 hover:bg-white/5 uppercase tracking-widest transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => selected.length > 0 && onConfirm(selected)}
            disabled={selected.length === 0}
            className="flex-grow py-3 px-8 rounded-xl bg-cyan-400 text-[#000000] text-xs font-black uppercase tracking-widest hover:brightness-110 disabled:opacity-30 transition-all shadow-[0_0_20px_rgba(0,208,255,0.3)] cursor-pointer disabled:cursor-not-allowed"
          >
            Confirm {selected.length > 0 ? `(${selected.length})` : ''}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
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
  const [modelPoolType, setModelPoolType] = useState("PLATFORM");
  const [lockingFunds, setLockingFunds] = useState(false);
  const [lockError, setLockError] = useState("");

  const [showModelPopup, setShowModelPopup] = useState(false);
  const [selectedModelIds, setSelectedModelIds] = useState([]);

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

  const handleNewChat = () => {
    setSelectedTask(null);
    setPrompt("");
    setLockError("");
    setSelectedModelIds([]);
  };

  const handlePoolChange = (newPool) => {
    setModelPoolType(newPool);
    setSelectedModelIds([]);
    setShowModelPopup(true);
  };

  const handleModelsConfirmed = (ids) => {
    setSelectedModelIds(ids);
    setShowModelPopup(false);
  };

  const sendPrompt = async () => {
    if (!prompt.trim()) return;
    if (selectedModelIds.length === 0) {
      setLockError("Please select at least 1 model to compete.");
      return;
    }
    setLockError("");

    let newTask;
    try {
      const res = await fetch(`${API}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          description: prompt,
          reward,
          type,
          model_pool_type: modelPoolType,
          reward_amount: reward,
          selected_agent_ids: selectedModelIds,
        }),
      });
      newTask = await res.json();
      if (!res.ok) throw new Error(newTask.message || "Task creation failed");
    } catch (err) {
      setLockError("Failed to create task: " + err.message);
      return;
    }

    try {
      setLockingFunds(true);
      const txHash = await lockTaskOnChain(newTask.id, reward);
      console.log("Escrow locked, tx:", txHash);
      await fetch(`${API}/tasks/${newTask.id}/escrow`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ escrow_tx_hash: txHash }),
      });
    } catch (err) {
      console.error("Escrow lock failed:", err);
      setLockError("Payment failed: " + (err.message || "MetaMask rejected or insufficient funds"));
      setLockingFunds(false);
      return;
    } finally {
      setLockingFunds(false);
    }

    setPrompt("");
    setSelectedModelIds([]);
    await loadTasks();
    loadTask(newTask.id, true);
  };

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
  useEffect(() => { setShowModelPopup(true); }, []);

  const isPending = selectedTask && (selectedTask.status === "OPEN" || selectedTask.status === "IN_PROGRESS");
  const isExecuting = isPending || lockingFunds;

  return (
    <div className="flex h-screen bg-[#000000] font-sans text-slate-100 overflow-hidden">

      {/* Model Selection Popup */}
      {showModelPopup && (
        <ModelSelectionPopup
          poolType={modelPoolType}
          token={token}
          API={API}
          onConfirm={handleModelsConfirmed}
          onClose={() => setShowModelPopup(false)}
        />
      )}

      {/* ── Sidebar ─────────────────────────────────────────────────── */}
      <aside className="w-72 border-r border-cyan-400/10 bg-[#000000]/50 hidden lg:flex flex-col">

        {/* Sidebar header */}
        <div className="p-5 border-b border-cyan-400/10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-cyan-400/10 rounded-lg flex items-center justify-center border border-cyan-400/30">
                <span className="text-cyan-400 font-black text-xs">SX</span>
              </div>
              <span className="text-slate-100 text-base font-extrabold tracking-tighter uppercase italic">
                Synapse<span className="text-cyan-400">X</span>
              </span>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="text-[10px] font-bold text-slate-500 hover:text-cyan-400 uppercase tracking-widest cursor-pointer transition-colors"
            >
              ← Exit
            </button>
          </div>
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 py-3 bg-cyan-400 text-[#000000] rounded-lg text-xs font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-[0_0_15px_rgba(0,208,255,0.3)] active:scale-95 cursor-pointer"
          >
            <span className="text-base leading-none">+</span> New Competition
          </button>
        </div>

        {/* Nav */}
        <nav className="px-4 pt-4 pb-2 flex gap-4">
          {['Arena', 'History', 'Assets'].map((item, i) => (
            <a
              key={item}
              href="#"
              className={`text-xs font-bold uppercase tracking-widest transition-colors ${
                i === 0 ? 'text-cyan-400 border-b-2 border-cyan-400 pb-1' : 'text-slate-500 hover:text-cyan-400'
              }`}
            >
              {item}
            </a>
          ))}
        </nav>

        {/* Recent battles */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-cyan-400 text-[10px] font-black uppercase tracking-[0.2em]">Recent Battles</p>
            <svg className="w-3.5 h-3.5 text-cyan-400/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          {[...tasks]
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .map((task) => (
              <div
                key={task.id}
                onClick={() => loadTask(task.id, true)}
                className={`p-3 rounded-lg cursor-pointer transition-all border ${
                  selectedTask?.id === task.id
                    ? 'bg-cyan-400/5 border-cyan-400/20'
                    : 'bg-[#000000] border-white/5 hover:border-cyan-400/20'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-[10px] font-bold uppercase ${selectedTask?.id === task.id ? 'text-cyan-400' : 'text-slate-400'}`}>
                    Task #{task.id.slice(0, 6)}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(task.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-slate-300 text-xs font-medium truncate mb-2">
                  {task.description.substring(0, 30)}...
                </p>
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${
                    task.status === 'COMPLETED'
                      ? 'bg-green-500/20 border-green-500'
                      : 'bg-slate-500/20 border-slate-500'
                  }`}>
                    <svg className={`w-2.5 h-2.5 ${task.status === 'COMPLETED' ? 'text-green-500' : 'text-slate-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      {task.status === 'COMPLETED'
                        ? <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        : <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                      }
                    </svg>
                  </div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-tighter">{task.status}</span>
                </div>
              </div>
            ))}
        </div>

        {/* Sidebar footer */}
        <div className="p-4 border-t border-cyan-400/10">
          <button className="w-full py-2 bg-cyan-400/10 hover:bg-cyan-400/20 border border-cyan-400/20 text-cyan-400 rounded-lg text-xs font-black uppercase tracking-widest transition-all cursor-pointer">
            View All Archives
          </button>
        </div>
      </aside>

      {/* ── Main Arena ──────────────────────────────────────────────── */}
      <section className="flex-1 flex flex-col min-w-0 relative">

        {/* Task header bar */}
        {selectedTask && (
          <div className="px-6 py-4 border-b border-cyan-400/10 bg-[#0f1f23]/30 shrink-0">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-cyan-400 text-[#000000] text-[10px] font-black px-1.5 rounded uppercase">
                    {isPending ? 'Live' : selectedTask.status}
                  </span>
                  <h1 className="text-slate-100 text-base font-bold truncate">
                    Task #{selectedTask.id.slice(0, 8)}: {selectedTask.description.substring(0, 40)}...
                  </h1>
                </div>
                <p className="text-slate-400 text-xs flex items-center gap-1">
                  <svg className="w-3 h-3 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                  </svg>
                  HBAR Hedera Mainnet Network: Consensus Active
                </p>
              </div>
              {isPending && (
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <div className="flex items-center gap-3">
                    <span className="text-cyan-400 text-xs font-mono font-bold">COMPETING...</span>
                    <div className="w-48 h-2 bg-cyan-400/10 rounded-full overflow-hidden border border-cyan-400/20">
                      <div className="h-full bg-cyan-400 rounded-full animate-pulse w-2/3" style={{ boxShadow: '0 0 8px rgba(0,208,255,0.6)' }} />
                    </div>
                  </div>
                  <span className="text-[10px] text-cyan-400/60 font-mono uppercase italic tracking-tighter animate-pulse">
                    Streaming cryptographic proofs...
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Chat area */}
        <div
          className="flex-1 overflow-y-auto p-6 flex flex-col gap-6"
          style={{
            backgroundImage: `linear-gradient(to bottom, transparent 50%, rgba(0,208,255,0.03) 50%)`,
            backgroundSize: '100% 4px',
          }}
        >
          {isLoadingTask ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Fetching Logs...</p>
            </div>
          ) : selectedTask ? (
            <div className="max-w-3xl mx-auto w-full space-y-8">

              {/* User message bubble */}
              <div className="flex flex-col items-end">
                <div className="bg-[#0f1f23] border border-cyan-400/20 text-slate-100 px-6 py-4 rounded-2xl rounded-tr-none text-sm max-w-[85%] shadow-xl">
                  {selectedTask.description}
                </div>
                <div className="mt-2 text-[9px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  Task #{selectedTask.id.slice(0, 8)} • Bounty: {selectedTask.reward} HBAR
                  {selectedTask.escrow_tx_hash && (
                    <span className="text-green-400">• Escrow Locked ✓</span>
                  )}
                </div>
              </div>

              {/* Arena response */}
              <div className="flex flex-col items-start">
                <div
                  className={`w-full rounded-2xl rounded-tl-none p-8 transition-all ${
                    isPending
                      ? 'border border-cyan-400/30 shadow-[0_0_30px_rgba(0,208,255,0.08)]'
                      : 'border border-white/5'
                  }`}
                  style={{ background: 'rgba(15,31,35,0.5)', backdropFilter: 'blur(12px)' }}
                >
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${isPending ? 'bg-cyan-400 animate-ping' : 'bg-slate-600'}`} />
                      Arena Response
                    </span>
                    <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase ${
                      selectedTask.status === 'COMPLETED'
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                        : selectedTask.status === 'FAILED'
                        ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {selectedTask.status}
                    </span>
                  </div>

                  {isPending ? (
                    <div className="py-12 flex flex-col items-center justify-center border border-cyan-400/10 rounded-xl bg-cyan-400/5">
                      <div className="flex gap-1 mb-4">
                        <div className="w-1.5 h-6 bg-cyan-400 animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-1.5 h-6 bg-cyan-400/60 animate-bounce" style={{ animationDelay: '0.2s' }} />
                        <div className="w-1.5 h-6 bg-cyan-400/30 animate-bounce" style={{ animationDelay: '0.3s' }} />
                      </div>
                      <p className="text-xs font-bold text-slate-300">Models are competing...</p>
                      <p className="text-[10px] text-slate-500 mt-2 uppercase tracking-widest">~10s for on-chain consensus</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {selectedTask.status === "COMPLETED" && selectedTask.winner_agent && (
                        <div className="grid grid-cols-2 gap-4 bg-[#000000]/40 p-6 rounded-xl border border-white/5">
                          <div>
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Winner</p>
                            <p className="text-xs font-bold text-slate-200">{selectedTask.winner_agent.name}</p>
                            <br />
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Winner Agent ID</p>
                            <p className="text-xs font-bold text-slate-200">{selectedTask.winner_agent.id}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Usage</p>
                            <p className="text-xs font-bold text-cyan-400">{selectedTask.total_tokens_used || 0} tokens</p>
                            <br />
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Models Competed</p>
                            <p className="text-xs font-bold text-cyan-400">{selectedTask.total_models_competed || 0} models</p>
                          </div>
                          <div className="col-span-2 pt-3 border-t border-white/5">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Winner Wallet</p>
                            <p className="text-[10px] font-mono text-slate-500 break-all leading-tight">{selectedTask.winner_agent.wallet_address}</p>
                          </div>
                          {selectedTask.payment_tx_hash && (
                            <div className="col-span-2 pt-3 border-t border-white/5">
                              <p className="text-[9px] font-black text-green-400 uppercase tracking-widest mb-1">✓ Payout Complete</p>
                              <p className="text-[10px] font-mono text-slate-500 break-all">{selectedTask.payment_tx_hash}</p>
                            </div>
                          )}
                        </div>
                      )}
                      <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {selectedTask.result || (selectedTask.status === "FAILED" ? "Model competition failed to reach consensus." : "Awaiting logs...")}
                      </div>
                    </div>
                  )}
                </div>

                {/* Hedera verification node */}
                {selectedTask.escrow_tx_hash && (
                  <div
                    className="mt-4 mx-auto w-full max-w-md py-4"
                  >
                    <div
                      className="rounded-xl p-4 flex items-center gap-4"
                      style={{ background: 'rgba(15,31,35,0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(0,208,255,0.3)' }}
                    >
                      <div className="relative shrink-0">
                        <div
                          className="w-12 h-12 rounded-full bg-cyan-400/20 flex items-center justify-center"
                          style={{ border: '1px solid #00d0ff', boxShadow: '0 0 10px rgba(0,208,255,0.2)' }}
                        >
                          <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                          </svg>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#000000] rounded-full flex items-center justify-center border border-cyan-400/40">
                          <svg className="w-2.5 h-2.5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75" />
                          </svg>
                        </div>
                      </div>
                      <div>
                        <p className="text-slate-100 text-xs font-bold uppercase tracking-widest">Hedera Proof Verified</p>
                        <p className="text-[10px] text-slate-500 font-mono break-all">
                          Hash: {selectedTask.escrow_tx_hash.slice(0, 12)}...{selectedTask.escrow_tx_hash.slice(-8)}
                        </p>
                        <a href="#" className="text-cyan-400 text-[10px] hover:underline uppercase font-bold mt-1 inline-block">
                          View on Explorer
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div
                className="w-16 h-16 rounded-2xl mb-4 flex items-center justify-center"
                style={{ background: 'rgba(15,31,35,0.7)', border: '1px solid rgba(0,208,255,0.2)' }}
              >
                <span className="text-2xl font-black italic text-cyan-400">S</span>
              </div>
              <h2 className="text-xl font-bold text-slate-100 mb-2">Start a New Competition</h2>
              <p className="text-xs text-slate-500 max-w-xs uppercase tracking-widest font-medium">
                Post a task and let AI models battle for the HBAR bounty.
              </p>
            </div>
          )}
        </div>

        {/* ── Input Area ─────────────────────────────────────────────── */}
        <div className="p-6 border-t border-cyan-400/20 bg-[#000000] shrink-0">
          <div className="max-w-4xl mx-auto space-y-3">

            {lockError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold px-5 py-3 rounded-xl">
                {lockError}
              </div>
            )}

            {lockingFunds && (
              <div className="bg-cyan-400/5 border border-cyan-400/20 text-cyan-400 text-xs font-bold px-5 py-3 rounded-xl flex items-center gap-3">
                <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin shrink-0" />
                MetaMask is opening — approve the HBAR payment to lock funds in escrow...
              </div>
            )}

            <div className="relative group">
              <div className="absolute -inset-0.5 bg-cyan-400/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition duration-500 pointer-events-none" />
              <div
                className="relative rounded-xl border border-cyan-400/20 focus-within:border-cyan-400 transition-all flex items-end p-2 pr-4"
                style={{ background: '#0f1f23' }}
              >
                <button className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-cyan-400 transition-colors cursor-pointer mb-0.5">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Issue command to neural net or provide verification proof..."
                  className="w-full bg-transparent border-none focus:ring-0 text-slate-100 placeholder:text-slate-600 resize-none py-3 px-2 max-h-32 min-h-[48px] text-sm outline-none"
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendPrompt(); } }}
                />
                <div className="flex items-center gap-2 mb-1 shrink-0">
                  <button className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-cyan-400 transition-colors cursor-pointer">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                  <button
                    onClick={sendPrompt}
                    disabled={!prompt.trim() || isExecuting || selectedModelIds.length === 0}
                    className="h-10 px-6 bg-cyan-400 text-[#000000] rounded-lg font-black text-xs uppercase tracking-widest hover:brightness-110 transition-all disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed shadow-[0_0_15px_rgba(0,208,255,0.3)]"
                  >
                    {lockingFunds ? 'Locking...' : isPending ? 'Running...' : 'Send'}
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom toolbar */}
            <div className="flex items-center justify-between px-2 flex-wrap gap-3">
              <div className="flex gap-2 flex-wrap items-center">
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="bg-[#0f1f23] border border-cyan-400/20 text-cyan-400 text-[10px] font-black rounded-full px-3 py-1.5 outline-none cursor-pointer hover:border-cyan-400/50 transition-colors"
                >
                  <option value="TEXT">TEXT</option>
                  <option value="IMAGE">IMAGE</option>
                </select>

                <select
                  value={modelPoolType}
                  onChange={(e) => handlePoolChange(e.target.value)}
                  className="bg-[#0f1f23] border border-cyan-400/20 text-cyan-400 text-[10px] font-black rounded-full px-3 py-1.5 outline-none cursor-pointer hover:border-cyan-400/50 transition-colors"
                >
                  <option value="PLATFORM">PLATFORM</option>
                  <option value="USER">USER</option>
                </select>

                <button
                  onClick={() => setShowModelPopup(true)}
                  className={`flex items-center gap-1.5 text-[10px] font-black rounded-full px-3 py-1.5 border transition-colors cursor-pointer ${
                    selectedModelIds.length > 0
                      ? 'bg-cyan-400/10 border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/20'
                      : 'bg-[#0f1f23] border-white/10 text-slate-500 hover:border-cyan-400/30'
                  }`}
                >
                  {selectedModelIds.length > 0
                    ? `${selectedModelIds.length} Model${selectedModelIds.length > 1 ? 's' : ''} ✓`
                    : 'Pick Models'}
                </button>

                <div className="flex items-center gap-2 bg-[#0f1f23] border border-cyan-400/20 rounded-full px-3 py-1">
                  <input
                    type="number"
                    value={reward}
                    onChange={(e) => setReward(Number(e.target.value))}
                    className="w-8 text-[10px] font-bold text-cyan-400 outline-none bg-transparent"
                  />
                  <span className="text-[10px] font-black text-slate-500 uppercase">HBAR</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-[10px] text-slate-500 uppercase flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Nodes: 2,491
                </span>
                <span className="text-[10px] text-cyan-400/40 uppercase font-mono italic hidden sm:block">
                  Encrypted via RSA-4096 / HCS
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}