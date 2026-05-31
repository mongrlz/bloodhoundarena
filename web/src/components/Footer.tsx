interface FooterProps {
  onTipClick: () => void;
}

export default function Footer({ onTipClick }: FooterProps) {
  return (
    <footer className="mt-16 pt-8 pb-12 border-t-4 border-black relative z-10 select-none">
      <div className="flex flex-col items-center justify-center text-center space-y-6">
        
        {/* Main Disclaimer Banner */}
        <div className="flex items-center gap-2.5 px-4 py-2 bg-white border-3 border-black rounded-xl shadow-[3px_3px_0px_#000]">
          <span className="text-xl">📝</span>
          <span className="font-mono text-xs font-black uppercase tracking-wider text-black">
            Paper trading simulator · entry account begins at $100.00
          </span>
        </div>

        {/* Action button in radiant gold */}
        <button
          onClick={onTipClick}
          className="retro-btn px-8 py-4 text-black text-xs uppercase flex items-center gap-2 select-none active:scale-95 duration-100"
          id="footer-tip-bot-btn"
        >
          <span className="text-lg">🪙</span>
          <span>TIP A COMPETITOR BOT — CAPITALIZE ITS WALLET</span>
        </button>

        {/* Follow CTA — capture the audience */}
        <a
          href="https://x.com/mongrlz"
          target="_blank"
          rel="noopener noreferrer"
          className="retro-btn-secondary px-7 py-3 text-black text-xs uppercase font-black flex items-center gap-2 select-none active:scale-95 duration-100 hover:bg-black hover:text-white"
        >
          <span className="text-base font-black">𝕏</span>
          <span>FOLLOW @mongrlz FOR DROPS &amp; ALPHA</span>
        </a>

        {/* Small Legal Disclaimer */}
        <p className="font-mono text-[9px] text-black/50 uppercase tracking-widest font-extrabold leading-relaxed max-w-lg">
          Warning: Strictly not investment advice. No financial returns expected. 
          <span className="block mt-1 font-black">© {new Date().getFullYear()} BLOODHOUND ARENA TOURNAMENTS.</span>
        </p>
      </div>
    </footer>
  );
}
