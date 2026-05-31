import React, { useState } from "react";
import { HelpCircle, HeartHandshake, ShieldAlert, BadgeInfo } from "lucide-react";

interface SupportTicket {
  id: string;
  category: string;
  subject: string;
  status: "OPEN" | "RESOLVED";
  date: string;
}

interface SupportCenterProps {
  tickets: SupportTicket[];
  onSubmitTicket: (category: string, subject: string) => void;
}

export default function SupportCenter({ tickets, onSubmitTicket }: SupportCenterProps) {
  const [category, setCategory] = useState("Strategy Audit");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) return;

    onSubmitTicket(category, subject);
    setSubject("");
    setDescription("");
    alert("SUPPORT UPLINK INITIATED\n\nYour operational ticket has been dispatched. Our technical operator core is routing the audit.");
  };

  return (
    <div id="support-center-tab" className="grid grid-cols-1 lg:grid-cols-3 gap-8 transition-all duration-300">
      
      {/* 2/3 COLUMN: Support Form */}
      <section className="lg:col-span-2 bg-surface-container-lowest neo-border neo-shadow p-6 relative flex flex-col justify-between">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>

        <div className="border-b-2 border-on-surface pb-3 mb-4 flex items-center gap-2 select-none">
          <HeartHandshake className="text-primary shrink-0" />
          <h3 className="font-display font-black text-sm uppercase text-on-surface">
            ARENA OPERATIONAL INCIDENT COMMUNICATIONS
          </h3>
        </div>

        <form onSubmit={handleTicketSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-mono font-bold text-on-surface-variant block mb-1.5 uppercase">
                COMM INCIDENT CATEGORY:
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-[100%] p-2.5 font-mono text-xs bg-surface text-on-surface neo-border-sm focus:outline-none rounded-sm"
              >
                <option value="Strategy Audit">STRATEGY AUDIT DISCREPANCY</option>
                <option value="Liquidation Appeal">LIQUIDATION FRACTION APPEAL</option>
                <option value="Reserves Mismatch">VAULT RESERVES DELAY</option>
                <option value="Operator Uplink">MAIN CORE INTERRUPT</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-mono font-bold text-on-surface-variant block mb-1.5 uppercase">
                INCIDENT SUBJECT TICKER:
              </label>
              <input 
                type="text" 
                value={subject}
                required
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., Kimi Doge Leverage Grid Audit"
                className="w-[100%] px-3 py-2.5 font-mono text-xs bg-surface text-on-surface neo-border-sm focus:outline-none focus:ring-2 focus:ring-action-gold rounded-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-mono font-bold text-on-surface-variant block mb-1.5 uppercase">
              DETAILED SIGNAL TRANSCRIPT ANALYSIS:
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="State full ledger timelines, trader IDs, and asset metrics involved for command-center auditing..."
              className="w-[100%] px-3 py-2.5 font-mono text-xs bg-surface text-on-surface neo-border-sm focus:outline-none focus:ring-2 focus:ring-action-gold rounded-sm"
            />
          </div>

          <button
            type="submit"
            className="w-[100%] py-3 bg-action-gold text-on-surface font-mono font-bold text-xs uppercase neo-border neo-shadow neo-hover neo-active cursor-pointer"
          >
            DISPATCH SECURED TICKET UPGRADE
          </button>
        </form>
      </section>

      {/* 1/3 COLUMN: Active Tickets Status Rail */}
      <section className="bg-surface-container-lowest neo-border neo-shadow p-6 flex flex-col relative select-none">
        
        {/* Rail Title */}
        <div className="border-b-2 border-on-surface pb-3 mb-4 select-none">
          <h3 className="font-display font-black text-sm uppercase text-on-surface">
            SIGNAL SYSTEM MONITOR
          </h3>
        </div>

        {/* Informational help box */}
        <div className="p-3 bg-surface border-l-4 border-primary text-[11px] text-on-surface-variant leading-relaxed mb-4 flex items-start gap-2">
          <BadgeInfo className="text-primary shrink-0" size={14} />
          <div>
            COMMAND SECURITY POLICY: Ticket handling latency is typically under 180 seconds. Upgrade to Diamond or Apex Challenger operator rank segments for instant priority routing.
          </div>
        </div>

        {/* Existing tickets list */}
        <div className="flex-1 space-y-3 font-mono text-[11px] overflow-y-auto max-h-[290px] pr-1">
          {tickets.length === 0 ? (
            <p className="text-center text-on-surface-variant/50 py-12">&gt; NO ACTIVE INCIDENT SIGNALS FOUND...</p>
          ) : (
            tickets.map((t) => (
              <div 
                key={t.id} 
                className="p-2.5 bg-surface border-r-2 border-on-surface border-y border-l neo-border-sm rounded-sm"
              >
                <div className="flex justify-between items-center text-[10px] text-on-surface-variant mb-1 font-bold">
                  <span className="text-primary text-xs font-black">#{t.id.toUpperCase()}</span>
                  <span>{t.date}</span>
                </div>
                <div className="font-sans font-black text-xs text-on-surface line-clamp-1">{t.subject}</div>
                <div className="flex justify-between items-center mt-2 pt-1 border-t border-on-surface/10">
                  <span className="text-[10px] text-on-surface-variant/80 font-bold uppercase">{t.category}</span>
                  <span className={`px-2 py-0.5 rounded-sm font-black text-[9px] ${
                    t.status === "OPEN" 
                      ? "bg-tertiary-fixed text-on-tertiary" 
                      : "bg-[#008a00]/15 text-[#006400]"
                  }`}>
                    {t.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

    </div>
  );
}
