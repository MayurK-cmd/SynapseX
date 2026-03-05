import React, { useEffect, useState, useCallback } from "react";
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

  // Hedera EVM: 1 HBAR = 1e8 tinybars at EVM level
  // BUT MetaMask shows decimals:18 so we use parseEther which = 1e18
  // Hedera internally maps 1e18 → 10 HBAR correctly via the JSON-RPC relay
  const valueInWeibars = ethers.parseEther(String(rewardHbar));

  const tx = await contract.lockTask(taskIdBytes32, { value: valueInWeibars });
  console.log("lockTask tx sent:", tx.hash);
  await tx.wait();
  console.log("lockTask confirmed:", tx.hash);
  return tx.hash;
};

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
  };

  // 🔑 Main function — lock funds first, then create task
  const sendPrompt = async () => {
    if (!prompt.trim()) return;
    setLockError("");
    

    // Step 1: Create task in DB first to get the task ID
    // We need the ID before locking on-chain
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
          reward_amount: reward, // store reward_amount for payout service
        }),
      });
      newTask = await res.json();
      if (!res.ok) throw new Error(newTask.message || "Task creation failed");
    } catch (err) {
      setLockError("Failed to create task: " + err.message);
      return;
    }

    // Step 2: Lock funds in escrow — MetaMask will pop open here
    try {
      setLockingFunds(true);
      const txHash = await lockTaskOnChain(newTask.id, reward);
      console.log("Escrow locked, tx:", txHash);

      // Save escrow tx hash to DB
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
      // Task was created but not funded — you may want to cancel it here
      return;
    } finally {
      setLockingFunds(false);
    }

    // Step 3: Navigate to the task view
    setPrompt("");
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

  const isPending = selectedTask && (selectedTask.status === "OPEN" || selectedTask.status === "IN_PROGRESS");
  const isExecuting = isPending || lockingFunds;

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
          {[...tasks]
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
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
                  <span className="text-[8px] font-mono text-slate-300">#{task.id.slice(0, 6)}</span>
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
                  Task #{selectedTask.id.slice(0, 8)} • Bounty: {selectedTask.reward} HBAR
                  {selectedTask.escrow_tx_hash && (
                    <span className="ml-2 text-green-500">• Escrow Locked ✓</span>
                  )}
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
                        <div className="w-1.5 h-6 bg-blue-600 animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-1.5 h-6 bg-blue-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
                        <div className="w-1.5 h-6 bg-blue-200 animate-bounce" style={{ animationDelay: '0.3s' }} />
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
                            <br />
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Winner Agent ID</p>
                            <p className="text-xs font-bold text-slate-800">{selectedTask.winner_agent.id}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Usage</p>
                            <p className="text-xs font-bold text-blue-600">{selectedTask.total_tokens_used || 0} tokens</p>
                            <br />
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Models Competed</p>
                            <p className="text-xs font-bold text-blue-600">{selectedTask.total_models_competed || 0} models</p>
                          </div>
                          <div className="col-span-2 pt-3 border-t border-slate-200">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Winner Wallet</p>
                            <p className="text-[10px] font-mono text-slate-500 break-all leading-tight">{selectedTask.winner_agent.wallet_address}</p>
                          </div>
                          {selectedTask.payment_tx_hash && (
                            <div className="col-span-2 pt-3 border-t border-slate-200">
                              <p className="text-[9px] font-black text-green-600 uppercase tracking-widest mb-1">✓ Payout Complete</p>
                              <p className="text-[10px] font-mono text-slate-400 break-all">{selectedTask.payment_tx_hash}</p>
                            </div>
                          )}
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
              <p className="text-xs text-slate-400 max-w-xs uppercase tracking-widest font-medium">Post a task and let AI models battle for the HBAR bounty.</p>
            </div>
          )}
        </div>

        {/* --- Input --- */}
        <div className="p-8">
          {lockError && (
            <div className="max-w-3xl mx-auto mb-4 bg-red-50 border border-red-200 text-red-600 text-xs font-bold px-5 py-3 rounded-2xl">
              {lockError}
            </div>
          )}

          {/* Locking funds overlay message */}
          {lockingFunds && (
            <div className="max-w-3xl mx-auto mb-4 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold px-5 py-3 rounded-2xl flex items-center gap-3">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin flex-shrink-0" />
              MetaMask is opening — approve the HBAR payment to lock funds in escrow...
            </div>
          )}

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
                <select value={modelPoolType} onChange={(e) => setModelPoolType(e.target.value)} className="bg-white border border-slate-200 text-[10px] font-black rounded-full px-3 py-1.5 outline-none cursor-pointer hover:border-blue-300 transition-colors">
                  <option value="PLATFORM">PLATFORM</option>
                  <option value="USER">USER</option>
                </select>
                <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-full px-3 py-1">
                  <input type="number" value={reward} onChange={(e) => setReward(Number(e.target.value))} className="w-8 text-[10px] font-bold text-blue-600 outline-none" />
                  <span className="text-[10px] font-black text-slate-400 uppercase">HBAR</span>
                </div>
              </div>
              <button
                onClick={sendPrompt}
                disabled={!prompt.trim() || isExecuting}
                className="bg-blue-600 text-white px-8 py-2 rounded-full font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-blue-700 disabled:opacity-30 transition-all"
              >
                {lockingFunds ? 'Locking Funds...' : isPending ? 'Competing...' : 'Execute'}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}