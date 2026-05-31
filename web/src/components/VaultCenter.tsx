import React, { useState } from "react";
import { 
  Lock, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Coins, 
  CircleDollarSign, 
  ShieldCheck, 
  Sparkle 
} from "lucide-react";

interface VaultCenterProps {
  userBalance: number;
  onModifyBalance: (amount: number, type: "deposit" | "withdraw") => void;
  operatorRank: string;
}

export default function VaultCenter({ userBalance, onModifyBalance, operatorRank }: VaultCenterProps) {
  const [depositAmount, setDepositAmount] = useState("100");
  const [depositToken, setDepositToken] = useState("USD");
  const [withdrawAmount, setWithdrawAmount] = useState("50");
  const [withdrawToken, setWithdrawToken] = useState("USD");

  const [ledger, setLedger] = useState<Array<{ id: string; type: "deposit" | "withdraw"; amount: number; token: string; status: "PROCESSED" | "PENDING"; date: string; txHash: string }>>([
    { id: "tx01", type: "deposit", amount: 500, token: "USD", status: "PROCESSED", date: "2026-05-30 20:30:15", txHash: "0xba45df...e21a" },
    { id: "tx02", type: "deposit", amount: 150, token: "USD", status: "PROCESSED", date: "2026-05-30 18:41:03", txHash: "0x39fa8e...909c" },
    { id: "tx03", type: "withdraw", amount: 30, token: "USD", status: "PROCESSED", date: "2026-05-30 12:15:40", txHash: "0xcc2a43...7b41" }
  ]);

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(depositAmount);
    if (isNaN(val) || val <= 0) return;
    
    onModifyBalance(val, "deposit");
    
    const nowStr = new Date().toISOString().replace("T", " ").substring(0, 19);
    setLedger(prev => [
      {
        id: "tx_" + Date.now(),
        type: "deposit",
        amount: val,
        token: depositToken,
        status: "PROCESSED" as const,
        date: nowStr,
        txHash: "0x" + Math.random().toString(16).substr(2, 8) + "..." + Math.random().toString(16).substr(2, 4)
      },
      ...prev
    ]);
    setDepositAmount("");
  };

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(withdrawAmount);
    if (isNaN(val) || val <= 0) return;
    if (val > userBalance) {
      alert("DECLINED: Insufficient Vault reserves collateral.");
      return;
    }

    onModifyBalance(val, "withdraw");
    
    const nowStr = new Date().toISOString().replace("T", " ").substring(0, 19);
    setLedger(prev => [
      {
        id: "tx_" + Date.now(),
        type: "withdraw",
        amount: val,
        token: withdrawToken,
        status: "PROCESSED" as const,
        date: nowStr,
        txHash: "0x" + Math.random().toString(16).substr(2, 8) + "..." + Math.random().toString(16).substr(2, 4)
      },
      ...prev
    ]);
    setWithdrawAmount("");
  };

  // Rank thresholds display details
  const rankMilestones = [
    { name: "Bronze", limit: 0, text: "Standard access." },
    { name: "Gold", limit: 250, text: "Unlocks 25x leverage capabilities." },
    { name: "Diamond", limit: 600, text: "Max 100x leverage + real-time search grounding index." },
    { name: "Apex Challenger", limit: 1500, text: "Customized AI sentiment injection + priority support channels." }
  ];

  return (
    <div id="vault-tab-view" className="space-y-8 transition-all duration-300">
      
      {/* SECTION 1: WALLET HUDS */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Core Wallet HUD */}
        <div className="bg-surface-container-lowest neo-border neo-shadow p-5 flex items-center justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none text-primary">
            <Coins size={92} />
          </div>
          <div>
            <span className="font-mono text-[10px] font-bold text-on-surface-variant block uppercase">
              ACTIVE VAULT BALANCE
            </span>
            <div className="font-display font-black text-3xl sm:text-4xl text-on-surface mt-1">
              ${userBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <span className="font-mono text-[9px] text-[#008a00] font-black mt-1 inline-block">
              ● LIQUID SECURED
            </span>
          </div>
          <div className="w-12 h-12 bg-primary/10 neo-border-sm rounded-sm flex items-center justify-center text-primary shrink-0">
            <CircleDollarSign size={24} />
          </div>
        </div>

        {/* Collateral Limit Rank HUD */}
        <div className="bg-surface-container-lowest neo-border neo-shadow p-5 flex items-center justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none text-secondary">
            <Sparkle size={92} />
          </div>
          <div>
            <span className="font-mono text-[10px] font-bold text-on-surface-variant block uppercase">
              OPERATOR RANK SEGMENT
            </span>
            <div className="font-display font-black text-2xl sm:text-3xl text-[#ba002c] tracking-tight uppercase mt-1">
              {operatorRank}
            </div>
            <span className="font-mono text-[9px] text-on-surface-variant/70 font-semibold block mt-1">
              Milestone limit based on reserves
            </span>
          </div>
          <div className="w-12 h-12 bg-secondary/10 neo-border-sm rounded-sm flex items-center justify-center text-secondary shrink-0">
            <Sparkle size={20} className="animate-spin" />
          </div>
        </div>

        {/* Vault Security Status Card */}
        <div className="bg-surface-container-lowest neo-border neo-shadow p-5 flex items-center justify-between relative overflow-hidden group">
          <div>
            <span className="font-mono text-[10px] font-bold text-on-surface-variant block uppercase">
              SECURITY SHIELD ENGINES
            </span>
            <div className="font-display font-black text-lg text-on-surface leading-tight mt-1">
              AES-256 ENCRYPTED
            </div>
            <span className="font-mono text-[9px] text-[#008a00] font-extrabold mt-1 inline-block">
              ✓ COLD STORAGE VAULT SECURE
            </span>
          </div>
          <div className="w-12 h-12 bg-tertiary-fixed text-on-tertiary-fixed neo-border-sm rounded-sm flex items-center justify-center shrink-0 shadow-[2px_2px_rgba(0,0,0,1)]">
            <ShieldCheck size={20} />
          </div>
        </div>

      </section>

      {/* SECTION 2: TRANSACTION FLOW DIALOGS */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Deposit Box */}
        <div className="bg-surface-container-lowest neo-border neo-shadow p-6 flex flex-col relative">
          <div className="border-b-2 border-on-surface pb-3 mb-4 flex items-center gap-2 select-none">
            <ArrowUpRight className="text-[#008a00] shrink-0" />
            <h3 className="font-display font-black text-sm uppercase text-on-surface">
              SECURE DEPOSIT GATEWAY
            </h3>
          </div>

          <form onSubmit={handleDeposit} className="space-y-4">
            <div>
              <label className="text-[10px] font-mono font-bold text-on-surface-variant block mb-1.5 uppercase">
                TARGET ASSET CLASS:
              </label>
              <select
                value={depositToken}
                onChange={(e) => setDepositToken(e.target.value)}
                className="w-[100%] p-2.5 font-mono text-xs bg-surface text-on-surface neo-border-sm focus:outline-none rounded-sm"
              >
                <option value="USD">USD DIRECT CREDIT</option>
                <option value="BTC">BITCOIN (MOCK BRIDGE)</option>
                <option value="ETH">ETHEREUM (MOCK BRIDGE)</option>
                <option value="SOL">SOLANA (MOCK BRIDGE)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-mono font-bold text-on-surface-variant block mb-1.5 uppercase">
                DEPOSIT SUM ($):
              </label>
              <input 
                type="number" 
                value={depositAmount}
                min="10"
                max="5000"
                step="5"
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="Enter deposit amount"
                className="w-[100%] px-3 py-2.5 font-mono text-xs bg-surface text-on-surface neo-border-sm focus:outline-none focus:ring-2 focus:ring-action-gold rounded-sm"
              />
            </div>

            <button
              type="submit"
              className="w-[100%] py-3 bg-action-gold text-on-surface font-mono font-bold text-xs uppercase neo-border neo-shadow neo-hover neo-active cursor-pointer"
            >
              UPGRADE CREDITS VIA COLD WALLET
            </button>
          </form>
        </div>

        {/* Withdraw Box */}
        <div className="bg-surface-container-lowest neo-border neo-shadow p-6 flex flex-col relative">
          <div className="border-b-2 border-on-surface pb-3 mb-4 flex items-center gap-2 select-none">
            <ArrowDownLeft className="text-secondary shrink-0" />
            <h3 className="font-display font-black text-sm uppercase text-on-surface">
              WITHDRAW COLLATERAL HOLDINGS
            </h3>
          </div>

          <form onSubmit={handleWithdraw} className="space-y-4">
            <div>
              <label className="text-[10px] font-mono font-bold text-on-surface-variant block mb-1.5 uppercase">
                WITHDRAW TOKEN / ADDRESS:
              </label>
              <select
                value={withdrawToken}
                onChange={(e) => setWithdrawToken(e.target.value)}
                className="w-[100%] p-2.5 font-mono text-xs bg-surface text-on-surface neo-border-sm focus:outline-none rounded-sm"
              >
                <option value="USD">USD CHECKING ACCOUNT</option>
                <option value="BTC">BTC COLD WALLET ADDRESS</option>
                <option value="ETH">ETH METAMASK PROTOCOL</option>
                <option value="SOL">SOL PHANTOM SEED</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-mono font-bold text-on-surface-variant block mb-1.5 uppercase">
                WITHDRAW SUM ($):
              </label>
              <input 
                type="number" 
                value={withdrawAmount}
                min="5"
                max="1000"
                step="5"
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="Enter withdraw amount"
                className="w-[100%] px-3 py-2.5 font-mono text-xs bg-surface text-on-surface neo-border-sm focus:outline-none focus:ring-2 focus:ring-action-gold rounded-sm"
              />
            </div>

            <button
              type="submit"
              className="w-[100%] py-3 bg-secondary text-on-secondary font-mono font-bold text-xs uppercase neo-border neo-shadow neo-hover neo-active cursor-pointer"
            >
              WITHDRAW RESERVES TO BANKING GATEWAY
            </button>
          </form>
        </div>

      </section>

      {/* SECTION 3: MILESTONE SCALE */}
      <section className="bg-surface-container-lowest neo-border neo-shadow p-6 relative">
        <h3 className="font-display font-black text-sm uppercase pb-3 border-b-2 border-on-surface mb-4">
          OPERATOR RANK ADVANCEMENT TRACK
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {rankMilestones.map((m, i) => {
            const unlocked = userBalance >= m.limit;
            
            return (
              <div 
                key={i} 
                className={`p-3 neo-border-sm relative rounded-sm ${
                  unlocked ? "bg-tertiary-fixed/15" : "bg-surface-container-high opacity-70"
                }`}
              >
                {unlocked && (
                  <span className="absolute top-1.5 right-1.5 text-xs text-[#008a00] font-bold">✓</span>
                )}
                <div className="font-display font-bold text-sm text-on-surface">{m.name}</div>
                <div className="font-mono text-[9px] text-on-surface-variant font-bold mt-1">
                  LIMIT: &gt; ${m.limit}
                </div>
                <p className="font-sans text-[10px] text-on-surface-variant leading-tight mt-2.5">
                  {m.text}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 4: HISTORIC LEDGER */}
      <section className="bg-surface-container-lowest neo-border neo-shadow overflow-hidden">
        <div className="p-4 bg-surface-container-high border-b-2 border-on-surface select-none">
          <h3 className="font-display font-black text-sm uppercase text-on-surface">
            VAULT TRANSACTION PROTOCOL LEDGER
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-[100%] text-left font-mono text-xs">
            <thead>
              <tr className="bg-surface border-b-2 border-on-surface text-on-surface-variant select-none">
                <th className="p-3">TXID</th>
                <th className="p-3">TYPE</th>
                <th className="p-3">SUM</th>
                <th className="p-3">TOKEN</th>
                <th className="p-3">TIMELOG</th>
                <th className="p-3">SECURE HASH</th>
                <th className="p-3">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {ledger.map((item) => (
                <tr key={item.id} className="border-b border-on-surface/10 hover:bg-surface-container-low">
                  <td className="p-3 font-bold text-primary">{item.id.toUpperCase()}</td>
                  <td className="p-3 uppercase">
                    <span className={`px-2 py-0.5 font-bold rounded-sm text-[10px] ${
                      item.type === "deposit" ? "bg-[#008a00]/10 text-[#006400]" : "bg-error/10 text-error"
                    }`}>
                      {item.type}
                    </span>
                  </td>
                  <td className="p-3 font-bold">${item.amount.toLocaleString()}</td>
                  <td className="p-3 font-bold">{item.token}</td>
                  <td className="p-3 text-on-surface-variant">{item.date}</td>
                  <td className="p-3 text-on-surface-variant">{item.txHash}</td>
                  <td className="p-3">
                    <span className="font-black text-[10px] text-[#008a00]">
                      ✓ {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
}
