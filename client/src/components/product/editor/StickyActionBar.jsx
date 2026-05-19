export default function StickyActionBar({ onSave, onCancel }) {
  return (
    <div className="fixed bottom-0 left-0 w-full bg-black/60 backdrop-blur-2xl border-t border-cyan-400/20 p-4 flex justify-between items-center z-50">

      <div className="text-slate-300 text-sm">
        Auto-saved
      </div>

      <div className="flex gap-3">

        {onCancel && (
          <button
            onClick={onCancel}
            className="px-6 py-2.5 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 transition"
          >
            Cancel
          </button>
        )}

        <button
          onClick={onSave}
          className="px-7 py-2.5 rounded-xl bg-cyan-400 text-black font-bold text-sm hover:bg-cyan-300 transition shadow-[0_0_30px_rgba(34,211,238,0.3)]"
        >
          Save Product
        </button>

      </div>

    </div>
  );
}
