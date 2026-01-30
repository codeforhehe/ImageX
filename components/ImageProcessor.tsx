"use client"

import { useState, useEffect } from "react"
import { removeBackground, Config } from "@imgly/background-removal"
import { motion } from "framer-motion"
import { AlertCircle, CheckCircle2 } from "lucide-react"

interface ImageProcessorProps {
    imageFile: File | null
    onProcessingComplete: (resultBlob: Blob, processingTime: number) => void
}

export default function ImageProcessor({
    imageFile,
    onProcessingComplete,
}: ImageProcessorProps) {
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
    const [progress, setProgress] = useState<string>("Initializing...")
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!imageFile) {
            setStatus("idle")
            return
        }

        const processImage = async () => {
            setStatus("loading")
            setError(null)
            setProgress("Loading AI model (this may take a moment first time)...")

            const startTime = performance.now()

            try {
                // Configuration for imgly
                const config: Config = {
                    progress: (key: string, current: number, total: number) => {
                        // Simply showing vague progress messages can be better than jerky numbers
                        if (key.includes("fetch")) setProgress(`Downloading model... ${Math.round((current / total) * 100)}%`)
                        else if (key.includes("compute")) setProgress("Processing image...")
                    },
                    debug: true,
                }

                const blob = await removeBackground(imageFile, config)

                const endTime = performance.now()
                const duration = (endTime - startTime) / 1000

                setStatus("success")
                onProcessingComplete(blob, duration)

            } catch (err) {
                console.error("Background removal failed:", err)
                setError(err instanceof Error ? err.message : "Failed to process image. Please try again.")
                setStatus("error")
            }
        }

        processImage()
    }, [imageFile, onProcessingComplete])

    if (status === "idle") return null

    return (
        <div className="w-full max-w-xl mx-auto mt-8">
            {status === "loading" && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center p-8 bg-white dark:bg-zinc-800 rounded-3xl shadow-sm border border-gray-100 dark:border-zinc-700"
                >
                    <div className="relative">
                        <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
                        {/* Pure CSS spinner for GPU-accelerated animation */}
                        <div className="w-12 h-12 relative z-10">
                            <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-zinc-700"></div>
                            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 animate-[spin_0.8s_linear_infinite]"></div>
                        </div>
                    </div>
                    <p className="mt-6 font-medium text-lg text-gray-700 dark:text-gray-200 animate-pulse">{progress}</p>

                    {/* Animated Progress Bar */}
                    <div className="w-full max-w-xs mt-4 h-2 bg-gray-100 dark:bg-zinc-700 rounded-full overflow-hidden relative">
                        <div className="absolute inset-0 bg-blue-500 w-2/3 animate-[shimmer_1.5s_infinite] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.5),transparent)] translate-x-[-100%]"></div>
                        <div className="h-full bg-blue-500 rounded-full w-full animate-pulse opacity-80"></div>
                    </div>

                    <p className="text-sm text-gray-400 mt-2 text-center max-w-xs">
                        Processing entirely on your device. <br />
                        <span className="opacity-75 text-xs">(Large images may take a few seconds)</span>
                    </p>
                </motion.div>
            )}

            {status === "error" && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-6 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl flex items-center gap-3 border border-red-100 dark:border-red-900/50"
                >
                    <AlertCircle className="w-6 h-6 shrink-0" />
                    <div>
                        <p className="font-semibold">Processing Error</p>
                        <p className="text-sm opacity-90">{error}</p>
                    </div>
                </motion.div>
            )}

            {status === "success" && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-2xl flex items-center justify-center gap-2 border border-green-100 dark:border-green-900/50"
                >
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-medium">Background successfully removed!</span>
                </motion.div>
            )}
        </div>
    )
}
