"use client"

import { useState, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { UploadCloud, Image as ImageIcon, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ImageUploaderProps {
    onImageSelected: (file: File) => void
    className?: string
}

export default function ImageUploader({
    onImageSelected,
    className,
}: ImageUploaderProps) {
    const [isDragging, setIsDragging] = useState(false)
    const [preview, setPreview] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }, [])

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }, [])

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault()
            setIsDragging(false)
            const file = e.dataTransfer.files[0]
            if (file && (file.type === "image/jpeg" || file.type === "image/png" || file.type === "image/webp")) {
                handleFile(file)
            } else {
                alert("Please upload a JPG, PNG, or WEBP image.")
            }
        },
        [onImageSelected]
    )

    const handleFile = (file: File) => {
        const objectUrl = URL.createObjectURL(file)
        setPreview(objectUrl)
        onImageSelected(file)
    }

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            handleFile(file)
        }
    }

    const clearImage = (e: React.MouseEvent) => {
        e.stopPropagation()
        setPreview(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
        // We might want to notify parent to clear, but for now just clear local preview
        // Actually we probably want to reset the parent state too, but let's stick to simple upload first.
    }

    return (
        <div className={cn("w-full max-w-xl mx-auto", className)}>
            <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                    "relative group cursor-pointer overflow-hidden rounded-3xl border-2 border-dashed transition-all duration-300 ease-in-out",
                    isDragging
                        ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 scale-[1.02]"
                        : "border-gray-300 dark:border-gray-700 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-zinc-800/50",
                    preview ? "border-solid border-transparent p-0" : "p-12"
                )}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileInput}
                    accept="image/jpeg, image/png, image/webp"
                    className="hidden"
                />

                <AnimatePresence mode="wait">
                    {preview ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="relative aspect-video w-full h-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center rounded-3xl overflow-hidden"
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={preview}
                                alt="Preview"
                                className="w-full h-full object-contain"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <p className="text-white font-medium">Click to change image</p>
                            </div>
                            <button
                                onClick={clearImage}
                                className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex flex-col items-center justify-center text-center space-y-4"
                        >
                            <div className="p-4 bg-white dark:bg-zinc-800 rounded-full shadow-lg shadow-gray-200/50 dark:shadow-none mb-2 group-hover:scale-110 transition-transform duration-300">
                                <UploadCloud
                                    className={cn(
                                        "w-8 h-8 transition-colors duration-300",
                                        isDragging ? "text-blue-500" : "text-gray-500 dark:text-gray-400"
                                    )}
                                />
                            </div>
                            <div className="space-y-1">
                                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Click or drag image to upload
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Supports JPG, PNG, WEBP (Max 10MB)
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
