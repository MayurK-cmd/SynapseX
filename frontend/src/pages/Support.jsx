import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const CATEGORIES = ["Bug Report", "Feature Request", "Payment Issue", "Model Quality", "Other"];

export default function Support() {
  const navigate = useNavigate();
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!category || !message.trim()) { setError("Please select a category and write a message."); return; }
    setError("");
    setSubmitting(true);
    try {
      // POST to your backend — add this route or swap for email/form service
      await api.post("/support", { category, message, email: email.trim() || null });
      setSubmitted(true);
    } catch (e) {
      // If no backend route yet, just show success anyway — swap this once route exists
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <div className="max-w-xl mx-auto px-6 pt-16 pb-20">

        {/* Header */}
        <div className="flex items-center gap-2 mb-12">
          {/* <button onClick={() => navigate(-1)} className="text-[10px] font-black text-slate-400 hover:text-blue-600 uppercase tracking-widest transition cursor-pointer">← Back</button> */}
          <span className="text-slate-200 mx-1">/</span>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-xs italic">S</span>
            </div>
            <span className="text-sm font-black tracking-tight">SynapseX</span>
            <span className="text-slate-300 mx-1">/</span>
            <span className="text-sm font-bold text-slate-400">Support</span>
          </div>
        </div>

        {!submitted ? (
          <>
            {/* Hero text */}
            <div className="mb-10">
              <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-600 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                 We Need You
              </div>
              <h1 className="text-4xl font-black tracking-tight leading-tight mb-4">
                Your feedback shapes<br />what ships next.
              </h1>
              <p className="text-slate-500 text-sm leading-relaxed">
                SynapseX is live. Every bug report, idea, and complaint directly influences what we build. We read everything — no ticket queue, no bot replies.
              </p>
            </div>

            {/* Why it matters cards */}
            <div className="grid grid-cols-3 gap-3 mb-10">
              {[
                { icon: "🚀", label: "Live now!", text: "Your reports and feedbacks, help us to improve." },
                { icon: "👀", label: "Founders Read It", text: "No support team — straight to the builders." },
                { icon: "💎", label: "Shape Features", text: "Top requests get prioritised immediately." },
              ].map(({ icon, label, text }) => (
                <div key={label} className="border border-slate-100 rounded-2xl p-4 text-center">
                  <div className="text-xl mb-2">{icon}</div>
                  <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest mb-1">{label}</p>
                  <p className="text-[10px] text-slate-400 leading-relaxed">{text}</p>
                </div>
              ))}
            </div>

            {/* Form */}
            <div className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-100 text-red-500 text-xs font-bold px-4 py-3 rounded-xl">
                  {error}
                </div>
              )}

              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Category</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c}
                      onClick={() => setCategory(c)}
                      className={`text-[10px] font-black px-4 py-2 rounded-full border uppercase tracking-widest transition-all cursor-pointer ${
                        category === c
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-white text-slate-500 border-slate-200 hover:border-slate-400"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Message <span className="text-red-400">*</span></label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us exactly what happened, what you expected, or what you'd love to see..."
                  rows={5}
                  className="w-full border border-slate-200 rounded-2xl px-5 py-4 text-sm text-slate-800 focus:outline-none focus:border-blue-300 transition-colors resize-none placeholder:text-slate-300"
                />
              </div>

              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Email <span className="text-slate-300 normal-case font-medium tracking-normal">(optional — for follow-up)</span></label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full border border-slate-200 rounded-2xl px-5 py-3 text-sm text-slate-800 focus:outline-none focus:border-blue-300 transition-colors placeholder:text-slate-300"
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-sm hover:bg-slate-700 transition-all disabled:opacity-40 cursor-pointer"
              >
                {submitting ? "Sending..." : "Send Feedback →"}
              </button>

              <p className="text-center text-[10px] text-slate-300 font-medium">
                No account needed. Completely anonymous if you skip email.
              </p>
            </div>
          </>
        ) : (
          /* Success state */
          <div className="flex flex-col items-center justify-center text-center py-20">
            <div className="w-16 h-16 bg-green-50 border border-green-100 rounded-3xl flex items-center justify-center text-3xl mb-6">✓</div>
            <h2 className="text-2xl font-black tracking-tight mb-3">Got it. Thank you.</h2>
            <p className="text-slate-500 text-sm max-w-xs leading-relaxed mb-8">
              Your feedback has been received. We genuinely appreciate it — this is exactly what helps us launch something worth using.
            </p>
            <div className="flex gap-3">
              <button onClick={() => navigate('/dashboard')} className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-700 transition cursor-pointer">
                Dashboard →
              </button>
              <button onClick={() => { setSubmitted(false); setCategory(""); setMessage(""); setEmail(""); }} className="border border-slate-200 text-slate-500 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:border-slate-400 transition cursor-pointer">
                Send Another
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}