import { useState } from "react";
import { useDropzone } from "react-dropzone";
import {
    FiUploadCloud,
    FiCheckCircle,
} from "react-icons/fi";

export default function ModelUploader() {

    const [modelFile, setModelFile] = useState(null);

    const [uploadProgress, setUploadProgress] = useState(0);

    const [uploading, setUploading] = useState(false);

    // HANDLE FILE
    const onDrop = (acceptedFiles) => {

        const file = acceptedFiles[0];

        if (!file) return;

        setModelFile(file);

        simulateUpload();
    };

    // DROPZONE
    const { getRootProps, getInputProps } = useDropzone({
        accept: {
            "model/gltf-binary": [".glb"],
            "model/gltf+json": [".gltf"]
        },
        onDrop,
    });

    // FAKE UPLOAD SIMULATION
    const simulateUpload = () => {

        setUploading(true);

        setUploadProgress(0);

        let progress = 0;

        const interval = setInterval(() => {

            progress += 5;

            setUploadProgress(progress);

            if (progress >= 100) {

                clearInterval(interval);

                setUploading(false);
            }

        }, 120);
    };

    // REPLACE MODEL
    const replaceModel = () => {

        setModelFile(null);

        setUploadProgress(0);

        setUploading(false);
    };

    return (
        <div className="bg-white/5 border border-cyan-400/20 rounded-2xl p-6">

            <h2 className="text-xl font-semibold mb-6">
                Visual Assets
            </h2>

            <div
                {...getRootProps()}
                className="border-2 border-dashed border-cyan-400/30 rounded-2xl p-10 text-center cursor-pointer hover:border-cyan-400 transition bg-cyan-400/5"
            >

                <input {...getInputProps()} />

                <FiUploadCloud className="text-5xl mx-auto text-cyan-400 mb-4" />

                <h3 className="text-lg font-semibold mb-2">
                    3D GLB Model
                </h3>

                <p className="text-slate-400 mb-6">
                    Drag & Drop GLB / GLTF Model
                </p>

                {/* FILE NAME */}
                {modelFile && (

                    <div className="mb-4 text-sm text-cyan-300 flex items-center justify-center gap-2">

                        <FiCheckCircle />

                        {modelFile.name}

                    </div>

                )}

                {/* PROGRESS BAR */}
                <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden mb-6">

                    <div
                        className={`h-full transition-all duration-200 ${uploadProgress === 100
                                ? "bg-green-400"
                                : "bg-cyan-400"
                            }`}
                        style={{
                            width: `${uploadProgress}%`
                        }}
                    />

                </div>

                {/* STATUS */}
                <div className="mb-5 text-sm text-slate-400">

                    {uploading
                        ? `Uploading... ${uploadProgress}%`
                        : uploadProgress === 100
                            ? "Upload Complete"
                            : "Waiting for Upload"}

                </div>

                {/* BUTTONS */}
                <div className="flex items-center justify-center gap-4">

                    <button
                        className="px-4 py-2 rounded-lg bg-cyan-400 text-black font-semibold hover:bg-cyan-300"
                    >
                        Upload
                    </button>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            replaceModel();
                        }}
                        className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600"
                    >
                        Replace
                    </button>

                </div>

            </div>

        </div>
    );
}