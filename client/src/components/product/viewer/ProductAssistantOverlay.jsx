import { useEffect, useMemo, useRef, useState } from "react";
import {
    Bot,
    Loader2,
    MessageCircle,
    Mic,
    MicOff,
    Send,
    Sparkles,
    X,
} from "lucide-react";

import { askProductAssistant } from "../../../api/ai";
import { logProductScan } from "../../../api/viewer";

function normalizeAssistantText(text) {
    if (!text) return "";
    return text
        .replace(/^#+\s*/gm, "")
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .replace(/__([^_]+)__/g, "$1")
        .replace(/`([^`]+)`/g, "$1")
        .replace(/^\s*-\s+/gm, "• ")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}

const SpeechRecognition =
    typeof window !== "undefined"
        ? window.SpeechRecognition || window.webkitSpeechRecognition
        : null;

function buildQuickQuestions(product) {
    const name = product?.name || "this product";
    const category = product?.category;
    const firstFeature = Array.isArray(product?.features) ? product.features[0] : null;
    const firstSpec = Array.isArray(product?.specifications) ? product.specifications[0] : null;

    return [
        `Explain ${name} in simple terms`,
        firstFeature ? `What does ${firstFeature} mean?` : `What are the key benefits?`,
        firstSpec ? `Explain ${firstSpec.key}` : `What specs should I check?`,
        category ? `Recommend similar ${category} products` : `Recommend similar products`,
        `Should I buy this product?`,
    ].filter(Boolean);
}

function MessageBubble({ message }) {
    const isUser = message.role === "user";
    return (
        <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
            <div
                className={`max-w-[86%] rounded-lg px-3 py-2 text-sm leading-relaxed ${isUser
                        ? "bg-cyan-300 text-slate-950"
                        : "border border-white/10 bg-white/[0.055] text-slate-100"
                    }`}
            >
                {message.intent ? (
                    <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-200">
                        {message.intent.replace("_", " ")}
                    </div>
                ) : null}
                <p className="whitespace-pre-wrap">
                    {message.role === "assistant" ? normalizeAssistantText(message.text) : message.text}
                </p>
            </div>
        </div>
    );
}

export default function ProductAssistantOverlay({
    open,
    onClose,
    product,
    sessionId,
}) {
    const [query, setQuery] = useState("");
    const [messages, setMessages] = useState([]);
    const [status, setStatus] = useState("idle");
    const [error, setError] = useState("");
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef(null);
    const messagesEndRef = useRef(null);

    const productRecordId = product?.id;
    const quickQuestions = useMemo(() => buildQuickQuestions(product), [product]);
    const canSubmit = query.trim() && productRecordId && status !== "thinking";

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, [messages, status]);

    useEffect(() => {
        if (!open) {
            recognitionRef.current?.stop?.();
            setIsListening(false);
        }
    }, [open]);

    const submitQuery = async (text = query) => {
        const cleanQuery = text.trim();
        if (!cleanQuery || !productRecordId || status === "thinking") return;

        setError("");
        setStatus("thinking");
        setQuery("");
        setMessages((current) => [
            ...current,
            { id: crypto.randomUUID(), role: "user", text: cleanQuery },
        ]);

        try {
            const response = await askProductAssistant({
                productId: productRecordId,
                query: cleanQuery,
                sessionId,
                language: "en",
            });

            setMessages((current) => [
                ...current,
                {
                    id: crypto.randomUUID(),
                    role: "assistant",
                    text: response.responseText || response.speechPayload || "I could not form a response.",
                    intent: response.intent,
                    suggestedActions: response.suggestedActions || [],
                    recommendedProductIds: response.recommendedProductIds || [],
                },
            ]);

            logProductScan(productRecordId, { voice_used: true }).catch((err) => {
                console.warn("[ProductAssistantOverlay] Voice analytics log failed:", err);
            });
        } catch (err) {
            setError(err.message || "Assistant is unavailable right now.");
        } finally {
            setStatus("idle");
        }
    };

    const startVoiceInput = () => {
        if (!SpeechRecognition) {
            setError("Voice input is not supported in this browser. Use text input for now.");
            return;
        }

        setError("");
        const recognition = new SpeechRecognition();
        recognition.lang = "en-US";
        recognition.interimResults = true;
        recognition.continuous = false;

        recognition.onstart = () => {
            setIsListening(true);
            setStatus("listening");
        };

        recognition.onresult = (event) => {
            const transcript = Array.from(event.results)
                .map((result) => result[0]?.transcript || "")
                .join(" ")
                .trim();
            setQuery(transcript);
        };

        recognition.onerror = (event) => {
            setError(event.error ? `Voice input error: ${event.error}` : "Voice input failed.");
            setIsListening(false);
            setStatus("idle");
        };

        recognition.onend = () => {
            setIsListening(false);
            setStatus((current) => (current === "listening" ? "idle" : current));
        };

        recognitionRef.current = recognition;
        recognition.start();
    };

    const stopVoiceInput = () => {
        recognitionRef.current?.stop?.();
        setIsListening(false);
        setStatus("idle");
    };

    const handleTextareaKeyDown = (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            submitQuery();
        }
    };

    if (!open) return null;

    return (
        <aside className="pointer-events-auto flex h-full max-h-full w-full max-w-[420px] flex-col rounded-lg border border-white/10 bg-[#06101d]/72 text-white shadow-[0_24px_70px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
            <div className="pointer-events-none absolute inset-0 rounded-lg opacity-[0.07] [background-image:radial-gradient(circle_at_1px_1px,#ffffff_1px,transparent_0)] [background-size:10px_10px]" />
            <div className="relative flex items-center justify-between border-b border-white/10 p-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-cyan-300 text-slate-950">
                        <Bot size={19} />
                    </div>
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-200">
                            AI Assistant
                        </p>
                        <h2 className="text-base font-semibold leading-tight">
                            Product Expert
                        </h2>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    className="flex h-9 w-9 items-center justify-center rounded-md border border-white/10 text-slate-300 transition hover:bg-white/10 hover:text-white"
                    aria-label="Close AI assistant"
                >
                    <X size={17} />
                </button>
            </div>

            <div className="relative flex min-h-0 flex-1 flex-col">
                <div className="border-b border-white/10 px-4 py-3">
                    <div className="flex items-start gap-2 rounded-md border border-cyan-300/20 bg-cyan-300/[0.08] p-3">
                        <Sparkles size={16} className="mt-0.5 shrink-0 text-cyan-200" />
                        <p className="text-xs leading-relaxed text-slate-200">
                            I can answer using verified details for {product?.name || "this product"} and recommend similar products when needed. English is active for now.
                        </p>
                    </div>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto p-4">
                    {messages.length === 0 ? (
                        <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
                            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                                <MessageCircle size={16} className="text-cyan-200" />
                                Try asking
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {quickQuestions.map((question) => (
                                    <button
                                        key={question}
                                        type="button"
                                        onClick={() => submitQuery(question)}
                                        className="rounded-md border border-white/10 bg-white/[0.055] px-3 py-2 text-left text-xs leading-snug text-slate-200 transition hover:border-cyan-300/40 hover:bg-cyan-300/10"
                                    >
                                        {question}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : null}

                    {messages.map((message) => (
                        <MessageBubble key={message.id} message={message} />
                    ))}

                    {status === "thinking" ? (
                        <div className="flex justify-start">
                            <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.055] px-3 py-2 text-sm text-slate-200">
                                <Loader2 size={15} className="animate-spin text-cyan-200" />
                                Thinking through product data
                            </div>
                        </div>
                    ) : null}
                    <div ref={messagesEndRef} />
                </div>

                {error ? (
                    <div className="mx-4 mb-3 rounded-md border border-rose-400/25 bg-rose-500/10 px-3 py-2 text-xs leading-relaxed text-rose-100">
                        {error}
                    </div>
                ) : null}

                <div className="border-t border-white/10 p-4">
                    <div className="ai-orbit-border rounded-lg p-[1px]">
                        <form
                            onSubmit={(event) => {
                                event.preventDefault();
                                submitQuery();
                            }}
                            className="flex items-end gap-2 rounded-lg bg-[#06101d]/95 p-2"
                        >
                            <button
                                type="button"
                                onClick={isListening ? stopVoiceInput : startVoiceInput}
                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md border transition ${isListening
                                        ? "border-rose-300/40 bg-rose-400/15 text-rose-100"
                                        : "border-white/10 bg-white/[0.045] text-cyan-100 hover:bg-white/10"
                                    }`}
                                aria-label={isListening ? "Stop voice input" : "Start voice input"}
                            >
                                {isListening ? <MicOff size={17} /> : <Mic size={17} />}
                            </button>
                            <textarea
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                                onKeyDown={handleTextareaKeyDown}
                                rows={1}
                                placeholder={isListening ? "Listening in English..." : "Ask about specs, usage, or recommendations"}
                                className="max-h-28 min-h-10 flex-1 resize-none bg-transparent px-1 py-2 text-sm leading-relaxed text-white outline-none placeholder:text-slate-500 hide-scrollbar"
                            />
                            <button
                                type="submit"
                                disabled={!canSubmit}
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-cyan-300 text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-45"
                                aria-label="Send assistant question"
                            >
                                <Send size={17} />
                            </button>
                        </form>
                    </div>
                    <div className="mt-2 flex flex-col gap-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                        <span>{status === "listening" ? "Listening" : status === "thinking" ? "Thinking" : "Text output only"}</span>
                        <span className="text-slate-400">Enter to send · Shift+Enter for newline</span>
                        <span>EN</span>
                    </div>
                </div>
            </div>
        </aside>
    );
}
