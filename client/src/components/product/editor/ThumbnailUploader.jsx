import { useState, useCallback } from "react";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { useDropzone } from "react-dropzone";

export default function ThumbnailUploader({ images = [], onImagesChange }) {

    const handleDrop = useCallback((acceptedFiles) => {
        const imageUrls = acceptedFiles.map((file) => ({
            file,
            preview: URL.createObjectURL(file),
        }));
        onImagesChange?.([...(images || []), ...imageUrls]);
    }, [images, onImagesChange]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: handleDrop,
        accept: { "image/*": [] },
        multiple: true,
    });

    const removeImage = (index) => {
        const updated = images.filter((_, i) => i !== index);
        onImagesChange?.(updated);
    };

    return (
        <div className="bg-white/5 border border-cyan-400/20 rounded-2xl p-4 sm:p-6">

            <h2 className="text-xl font-semibold mb-6">
                Thumbnails
            </h2>

            <div
                {...getRootProps()}
                className={`
                    border-2 border-dashed rounded-2xl p-5 bg-cyan-400/5 cursor-pointer
                    ${isDragActive ? "border-cyan-400 bg-cyan-400/15" : "border-cyan-400/30"}
                `}
            >

                {/* IMAGE GRID */}
                <div className="flex flex-wrap gap-4">

                    {/* PREVIEW IMAGES */}
                    {images.map((image, index) => (
                        <div
                            key={`${image.preview}-${index}`}
                            className="relative w-24 h-24 rounded-xl overflow-hidden border border-cyan-400/20 bg-slate-900"
                        >
                            <img
                                src={image.preview}
                                alt="thumbnail"
                                className="w-full h-full object-cover"
                            />
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeImage(index);
                                }}
                                className="absolute top-1 right-1 bg-black/70 p-1 rounded-full text-red-400 hover:bg-red-500 hover:text-white transition"
                            >
                                <FiTrash2 size={14} />
                            </button>
                        </div>
                    ))}

                    {/* ADD BUTTON */}
                    <div className="w-24 h-24 rounded-xl border-2 border-dashed border-cyan-400/30 flex items-center justify-center hover:border-cyan-400 hover:bg-cyan-400/10 transition">
                        <FiPlus size={30} className="text-cyan-400" />
                    </div>

                </div>

                {/* FOOTER TEXT */}
                <p className="text-slate-400 text-sm mt-5">
                    Drop images here or click to browse
                </p>

                <input {...getInputProps()} />

            </div>

        </div>
    );
}
