"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Download, RefreshCw, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

interface ComparisonViewProps {
    originalImage: File
    processedImageBlob: Blob
    onReset: () => void
}

export default function ComparisonView({
    originalImage,
    processedImageBlob,
    onReset,
}: ComparisonViewProps) {
    const [sliderPosition, setSliderPosition] = useState(50)
    const [isResizing, setIsResizing] = useState(false)
    const [originalUrl, setOriginalUrl] = useState<string | null>(null)
    const [processedUrl, setProcessedUrl] = useState<string | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const origUrl = URL.createObjectURL(originalImage)
        const procUrl = URL.createObjectURL(processedImageBlob)

        setOriginalUrl(origUrl)
        setProcessedUrl(procUrl)

        return () => {
            URL.revokeObjectURL(origUrl)
            URL.revokeObjectURL(procUrl)
        }
    }, [originalImage, processedImageBlob])

    const handleDownload = () => {
        if (!processedUrl) return
        const link = document.createElement("a")
        link.href = processedUrl
        link.download = `imagex-removed-bg-${Date.now()}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const handleMouseDown = () => setIsResizing(true)
    const handleMouseUp = () => setIsResizing(false)

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isResizing || !containerRef.current) return
        const rect = containerRef.current.getBoundingClientRect()
        const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width))
        const percentage = (x / rect.width) * 100
        setSliderPosition(percentage)
    }

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isResizing || !containerRef.current) return
        const rect = containerRef.current.getBoundingClientRect()
        const x = Math.max(0, Math.min(e.touches[0].clientX - rect.left, rect.width))
        const percentage = (x / rect.width) * 100
        setSliderPosition(percentage)
    }

    useEffect(() => {
        document.addEventListener("mouseup", handleMouseUp)
        document.addEventListener("touchend", handleMouseUp)
        return () => {
            document.removeEventListener("mouseup", handleMouseUp)
            document.removeEventListener("touchend", handleMouseUp)
        }
    }, [])

    if (!originalUrl || !processedUrl) return null

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-4xl mx-auto space-y-8"
        >
            <div
                ref={containerRef}
                className="relative w-full aspect-video rounded-3xl overflow-hidden cursor-ew-resize select-none bg-[url('/grid.svg')] bg-center shadow-2xl shadow-gray-200/50 dark:shadow-black/50 border border-gray-100 dark:border-zinc-800"
                onMouseMove={handleMouseMove}
                onTouchMove={handleTouchMove}
                onMouseDown={handleMouseDown}
                onTouchStart={handleMouseDown}
            >
                {/* Background (Processed - Transparent/White) */}
                {/* We use a grid background to show transparency better */}
                <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Grey_square_optical_illusion.svg/1200px-Grey_square_optical_illusion.svg.png')] bg-repeat opacity-10"></div>
                <img
                    src={processedUrl}
                    alt="Processed"
                    className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                />

                {/* Foreground (Original) - Clipped with inset */}
                <div
                    className="absolute inset-0 border-r-2 border-white dark:border-zinc-900 shadow-[2px_0_10px_rgba(0,0,0,0.1)]"
                    style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                >
                    <img
                        src={originalUrl}
                        alt="Original"
                        className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                    />
                </div>

                {/* Slider Handle */}
                <div
                    className="absolute top-0 bottom-0 w-10 -ml-5 flex items-center justify-center cursor-ew-resize group"
                    style={{ left: `${sliderPosition}%` }}
                >
                    <div className="w-10 h-10 bg-white dark:bg-zinc-800 rounded-full shadow-lg flex items-center justify-center border border-gray-100 dark:border-zinc-700 transition-transform group-hover:scale-110">
                        <Zap className="w-4 h-4 text-blue-500 fill-blue-500" />
                    </div>
                </div>

                {/* Labels */}
                <div className="absolute bottom-4 left-4 px-3 py-1 bg-black/50 text-white rounded-full text-xs font-medium backdrop-blur-md pointer-events-none">
                    Original
                </div>
                <div className="absolute bottom-4 right-4 px-3 py-1 bg-blue-500/80 text-white rounded-full text-xs font-medium backdrop-blur-md pointer-events-none">
                    Removed Background
                </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                    onClick={onReset}
                    className="flex items-center gap-2 px-6 py-3 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
                >
                    <RefreshCw className="w-4 h-4" />
                    Process Another
                </button>

                <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-8 py-3 rounded-full bg-blue-600 text-white font-medium hover:bg-blue-700 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transition-all hover:-translate-y-0.5"
                >
                    <Download className="w-4 h-4" />
                    Download HD Image
                </button>
            </div>
        </motion.div>
    )
}
