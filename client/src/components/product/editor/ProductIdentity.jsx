export default function ProductIdentity({
  name = "",
  brand = "",
  model = "",
  category = "",
  description = "",
  errors = {},
  onChange: onFieldChange,
}) {

  const handleChange = (field) => (e) => {
    onFieldChange?.({ [field]: e.target.value });
  };

  return (
    <div className="bg-white/5 border border-cyan-400/20 rounded-2xl p-4 sm:p-6">

      <h2 className="text-xl font-semibold mb-6">
        Identity
      </h2>

      <div className="space-y-4">

        {/* NAME */}
        <div>
          <label className="text-sm text-slate-300">Product Name</label>
          <input
            type="text"
            value={name}
            onChange={handleChange("name")}
            placeholder="Sony WH-1000XM5"
            className={`
              w-full mt-2 bg-[#0b1622] border 
              rounded-lg px-4 py-3 outline-none
              ${errors.name ? 'border-red-500/50 focus:border-red-500' : 'border-cyan-500/30 focus:border-cyan-400'}
            `}
          />
          {errors.name && <p className="text-red-400 text-xs mt-1 font-semibold">details have to be filled</p>}
        </div>

        {/* MODEL + DESCRIPTION */}
        <div>
          <label className="text-sm text-slate-300">Description</label>
          <textarea
            value={description}
            onChange={handleChange("description")}
            placeholder="Brief product description..."
            rows={3}
            className={`
              w-full mt-2 bg-[#0b1622] border 
              rounded-lg px-4 py-3 outline-none resize-none
              ${errors.description ? 'border-red-500/50 focus:border-red-500' : 'border-cyan-500/30 focus:border-cyan-400'}
            `}
          />
          {errors.description && <p className="text-red-400 text-xs mt-1 font-semibold">details have to be filled</p>}
        </div>

        {/* 3-col GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

          <div>
            <label className="text-sm text-slate-300">Brand</label>
            <input
              type="text"
              value={brand}
              onChange={handleChange("brand")}
              placeholder="Sony"
              className={`w-full mt-2 bg-[#0b1622] border rounded-lg px-4 py-3 outline-none ${errors.brand ? 'border-red-500/50 focus:border-red-500' : 'border-cyan-500/30 focus:border-cyan-400'}`}
            />
            {errors.brand && <p className="text-red-400 text-xs mt-1 font-semibold">details have to be filled</p>}
          </div>

          <div>
            <label className="text-sm text-slate-300">Model</label>
            <input
              type="text"
              value={model}
              onChange={handleChange("model")}
              placeholder="WH-1000XM5"
              className={`w-full mt-2 bg-[#0b1622] border rounded-lg px-4 py-3 outline-none ${errors.model ? 'border-red-500/50 focus:border-red-500' : 'border-cyan-500/30 focus:border-cyan-400'}`}
            />
            {errors.model && <p className="text-red-400 text-xs mt-1 font-semibold">details have to be filled</p>}
          </div>

          <div>
            <label className="text-sm text-slate-300">Category</label>
            <select
              value={category}
              onChange={handleChange("category")}
              className="
                w-full mt-2 bg-[#0b1622] border border-cyan-500/30
                rounded-lg px-4 py-3 outline-none
                focus:border-cyan-400 appearance-none
              "
            >
              <option>Electronics / Audio</option>
              <option>Electronics / Mobile</option>
              <option>Electronics / Laptop</option>
              <option>Furniture</option>
              <option>Fashion</option>
              <option>Automobile</option>
              <option>Gaming</option>
              <option>Industrial</option>
              <option>Medical</option>
              <option>Sports</option>
            </select>
          </div>

        </div>

      </div>

    </div>
  );
}
