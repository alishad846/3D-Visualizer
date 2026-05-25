export default function StickyActionBar({ onSave, onCancel }) {
  return (
    <div className="fixed bottom-0 left-0 w-full bg-transparent backdrop-blur-2xl border-t border-white/10 p-3 sm:p-4 flex justify-end items-center z-50">

      <div className="flex gap-2 sm:gap-3">

        {onCancel && (
          <button
            onClick={onCancel}
            className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 transition text-xs sm:text-sm"
          >
            Cancel
          </button>
        )}

        <button
          onClick={onSave}
          className="px-5 sm:px-7 py-2 sm:py-2.5 rounded-xl bg-cyan-400 text-black font-bold text-xs sm:text-sm hover:bg-cyan-300 transition shadow-[0_0_30px_rgba(34,211,238,0.3)] whitespace-nowrap"
        >
          Save Product
        </button>

      </div>

    </div>
  );
}
