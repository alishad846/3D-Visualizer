import { useState, useCallback, useEffect } from "react";
import {
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiCheck,
} from "react-icons/fi";

export default function SpecificationsEditor({
  specs: externalSpecs = [],
  onChange: onSpecChange,
}) {

  // Sync when external value changes (edit-mode load)
  const [specs, setSpecs] = useState(externalSpecs);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editedSpec, setEditedSpec] = useState({ key: "", value: "" });

  useEffect(() => {
    setSpecs(externalSpecs);
  }, [externalSpecs]);

  const commit = (updated) => {
    setSpecs(updated);
    onSpecChange?.(updated);
  };

  // DELETE
  const deleteSpec = useCallback((index) => {
    commit(specs.filter((_, i) => i !== index));
  }, [specs]);

  // START EDIT
  const startEdit = useCallback((index) => {
    setEditingIndex(index);
    setEditedSpec(specs[index]);
  }, [specs]);

  // SAVE EDIT
  const saveEdit = useCallback(() => {
    if (editingIndex === null) return;
    const updated = [...specs];
    updated[editingIndex] = { ...editedSpec };
    commit(updated);
    setEditingIndex(null);
    setEditedSpec({ key: "", value: "" });
  }, [editingIndex, editedSpec, specs]);

  // ADD
  const addSpecification = useCallback(() => {
    commit([
      ...specs,
      { key: "New Key", value: "New Value" },
    ]);
  }, [specs]);

  // CANCEL EDIT
  const cancelEdit = useCallback(() => {
    setEditingIndex(null);
    setEditedSpec({ key: "", value: "" });
  }, []);

  return (
    <div className="bg-white/5 border border-cyan-400/20 rounded-2xl p-4 sm:p-6">

      <h2 className="text-xl font-semibold mb-6">
        Specifications
      </h2>

      <div className="space-y-4">

        {specs.map((spec, index) => (
          <div
            key={index}
            className="
              flex flex-col sm:grid sm:grid-cols-[1fr_1fr_auto]
              gap-3 sm:gap-4 sm:items-center p-4 sm:p-0 border border-cyan-400/10 sm:border-transparent rounded-xl sm:rounded-none bg-black/20 sm:bg-transparent
            "
          >
            {editingIndex === index ? (
              <>
                <input
                  value={editedSpec.key}
                  onChange={(e) =>
                    setEditedSpec((p) => ({ ...p, key: e.target.value }))
                  }
                  onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                  className="
                     h-12 rounded-lg px-4 bg-[#0b1622]
                     border border-cyan-500/30 outline-none focus:border-cyan-400
                   "
                />
                <input
                  value={editedSpec.value}
                  onChange={(e) =>
                    setEditedSpec((p) => ({ ...p, value: e.target.value }))
                  }
                  onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                  className="
                    h-12 rounded-lg px-4 bg-[#0b1622]
                    border border-cyan-500/30 outline-none focus:border-cyan-400
                  "
                />
              </>
            ) : (
              <>
                <input
                  value={spec.key}
                  readOnly
                  className="
                    h-12 rounded-lg px-4 bg-[#0b1622]
                    border border-cyan-500/30 text-slate-200
                  "
                />
                <input
                  value={spec.value}
                  readOnly
                  className="
                    h-12 rounded-lg px-4 bg-[#0b1622]
                    border border-cyan-500/30 text-slate-200
                  "
                />
              </>
            )}

            <div className="flex gap-3 text-slate-400 justify-end sm:justify-start mt-2 sm:mt-0">

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

              {editingIndex === index && (
                <button
                  onClick={cancelEdit}
                  className="px-2 py-0.5 text-xs rounded bg-white/10 hover:bg-white/20 transition"
                >
                  Esc
                </button>
              )}

              <FiTrash2
                onClick={() => deleteSpec(index)}
                className="cursor-pointer hover:text-red-400 transition"
              />

            </div>

          </div>
        ))}

        {/* ADD BUTTON */}
        <button
          onClick={addSpecification}
          className="
            flex items-center gap-2 px-4 py-2 rounded-lg
            border border-cyan-400/30 text-cyan-300
            hover:bg-cyan-400/10 mt-4 transition
          "
        >
          <FiPlus />
          Add Specification
        </button>

      </div>

    </div>
  );
}
