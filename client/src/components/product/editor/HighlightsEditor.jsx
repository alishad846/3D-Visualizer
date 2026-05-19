import { useState, useCallback, useEffect } from "react";
import {
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiCheck,
} from "react-icons/fi";

export default function HighlightsEditor({
  highlights: externalHighlights = [],
  onChange: onHighlightChange,
}) {

  // Sync when external value changes (edit-mode load)
  const [highlights, setHighlights] = useState(externalHighlights);

  useEffect(() => {
    setHighlights(externalHighlights);
  }, [externalHighlights]);

  const commit = (updated) => {
    setHighlights(updated);
    onHighlightChange?.(updated);
  };

  // DELETE
  const deleteHighlight = useCallback((index) => {
    commit(highlights.filter((_, i) => i !== index));
  }, [highlights]);

  // EDIT
  const [editingIndex, setEditingIndex] = useState(null);
  const [editedText, setEditedText] = useState("");

  const startEdit = useCallback((index) => {
    setEditingIndex(index);
    setEditedText(highlights[index] ?? "");
  }, [highlights]);

  const saveEdit = useCallback(() => {
    if (editingIndex === null) return;
    const updated = [...highlights];
    updated[editingIndex] = editedText;
    commit(updated);
    setEditingIndex(null);
    setEditedText("");
  }, [editingIndex, editedText, highlights]);

  // ADD
  const addHighlight = useCallback(() => {
    commit([...highlights, "New Highlight"]);
  }, [highlights]);

  return (
    <div className="bg-white/5 border border-cyan-400/20 rounded-2xl p-6">

      <h2 className="text-xl font-semibold mb-6">
        Highlights
      </h2>

      <div className="space-y-4">

        {highlights.map((item, index) => (

          <div
            key={index}
            className="flex items-center justify-between gap-4 p-4 rounded-xl border border-cyan-400/10 bg-white/[0.03]"
          >

            {/* TEXT + DOT */}
            <div className="flex items-center gap-3 flex-1">

              <div className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />

              {editingIndex === index ? (
                <input
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                  className="
                    flex-1 bg-[#0b1622] border border-cyan-500/20
                    rounded-lg px-3 py-2 outline-none focus:border-cyan-400
                  "
                  autoFocus
                />
              ) : (
                <p className="text-slate-200 truncate">{item}</p>
              )}

            </div>

            {/* ACTIONS */}
            <div className="flex gap-3 text-slate-400 shrink-0">

              {editingIndex === index ? (
                <FiCheck
                  onClick={saveEdit}
                  className="cursor-pointer hover:text-green-400 transition"
                />
              ) : (
                <FiEdit2
                  onClick={() => startEdit(index)}
                  className="cursor-pointer hover:text-cyan-400 transition"
                />
              )}

              <FiTrash2
                onClick={() => deleteHighlight(index)}
                className="cursor-pointer hover:text-red-400 transition"
              />

            </div>

          </div>

        ))}

        <button
          onClick={addHighlight}
          className="
            flex items-center gap-2 px-4 py-2 rounded-lg
            border border-cyan-400/30 text-cyan-300
            hover:bg-cyan-400/10 mt-4 transition
          "
        >
          <FiPlus />
          Add Highlight
        </button>

      </div>

    </div>
  );
}
