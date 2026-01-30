"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import ImageUploader from "@/components/ImageUploader"
import ImageProcessor from "@/components/ImageProcessor"
import ComparisonView from "@/components/ComparisonView"
import { Sparkles } from "lucide-react"

export default function Home() {
  const [step, setStep] = useState<"upload" | "processing" | "result">("upload")
  const [originalFile, setOriginalFile] = useState<File | null>(null)
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null)

  const handleImageSelected = (file: File) => {
    setOriginalFile(file)
    setStep("processing")
  }

  const handleProcessingComplete = (blob: Blob) => {
    setProcessedBlob(blob)
    setStep("result")
  }

  const handleReset = () => {
    setStep("upload")
    setOriginalFile(null)
    setProcessedBlob(null)
  }

  return (
    <main className="min-h-screen bg-white dark:bg-black selection:bg-blue-500/30">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-24">
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-medium mb-4"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered Background Removal</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white"
          >
            Remove backgrounds <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">in seconds.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto text-lg sm:text-xl text-gray-600 dark:text-gray-400"
          >
            Upload your image and let our AI automatically remove the background. Free, fast, and private - processing happens 100% in your browser.
          </motion.p>
        </div>

        {/* Main Interface */}
        <AnimatePresence mode="wait">
          {step === "upload" && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
            >
              <ImageUploader onImageSelected={handleImageSelected} />
            </motion.div>
          )}

          {step === "processing" && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ImageProcessor
                imageFile={originalFile}
                onProcessingComplete={handleProcessingComplete}
              />
            </motion.div>
          )}

          {step === "result" && originalFile && processedBlob && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <ComparisonView
                originalImage={originalFile}
                processedImageBlob={processedBlob}
                onReset={handleReset}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-20 text-center text-sm text-gray-400"
        >
          <p>Powered by WebAssembly & imgly • No data leaves your browser</p>
        </motion.div>
      </div>
    </main>
  )
}
