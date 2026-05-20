import { QRCodeCanvas } from "qrcode.react";

export default function ARModal({

    isOpen,

    onClose,

    arUrl,

}) {

    if (!isOpen) return null;

    return (

        <div className="fixed inset-0 z-[999] bg-black/80 backdrop-blur-xl flex items-center justify-center">

            <div className="w-[420px] rounded-3xl border border-cyan-400/20 bg-[#071018] p-8 relative">

                {/* CLOSE */}

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white text-xl"
                >
                    ✕
                </button>

                {/* TITLE */}

                <h2 className="text-3xl font-bold text-white mb-3">

                    Open In AR

                </h2>

                <p className="text-slate-400 mb-8 leading-relaxed">

                    Scan this QR code with your phone to launch
                    the real AR product experience.

                </p>

                {/* QR */}

                <div className="bg-white p-5 rounded-3xl w-fit mx-auto">

                    <QRCodeCanvas
                        value={arUrl}
                        size={260}
                    />

                </div>

                {/* URL */}

                <div className="mt-6 text-center text-cyan-400 text-sm break-all">

                    {arUrl}

                </div>

            </div>

        </div>
    );
}