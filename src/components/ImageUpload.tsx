'use client'
import { useState, useRef } from 'react'

interface ImageUploadProps {
  images: string[]
  onChange: (images: string[]) => void
  max?: number
}

export default function ImageUpload({ images, onChange, max = 5 }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    if (images.length >= max) {
      setError(`Максимум ${max} снимки`)
      return
    }

    setError('')
    setUploading(true)

    const toUpload = Array.from(files).slice(0, max - images.length)
    const uploaded: string[] = []

    for (const file of toUpload) {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Грешка при качване'); break }
      uploaded.push(data.url)
    }

    onChange([...images, ...uploaded])
    setUploading(false)
  }

  function removeImage(index: number) {
    onChange(images.filter((_, i) => i !== index))
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    handleFiles(e.dataTransfer.files)
  }

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-stone-700">
        Снимки на корицата <span className="text-stone-400 font-normal">({images.length}/{max})</span>
      </label>

      {/* Preview grid */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((url, i) => (
            <div key={url} className="relative group w-24 h-28">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`Снимка ${i + 1}`}
                className="w-full h-full object-cover rounded-lg border border-stone-200"
              />
              {i === 0 && (
                <span className="absolute top-1 left-1 bg-stone-900 text-white text-[10px] px-1 rounded">
                  Корица
                </span>
              )}
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 w-5 h-5 bg-red-600 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload zone */}
      {images.length < max && (
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-stone-300 rounded-xl p-6 text-center cursor-pointer hover:border-stone-500 hover:bg-stone-50 transition-colors"
        >
          {uploading ? (
            <div className="flex items-center justify-center gap-2 text-stone-500">
              <div className="w-5 h-5 border-2 border-stone-700 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Качване...</span>
            </div>
          ) : (
            <>
              <div className="text-3xl mb-2">📷</div>
              <p className="text-sm font-medium text-stone-600">Кликнете или плъзнете снимки тук</p>
              <p className="text-xs text-stone-400 mt-1">JPG, PNG, WebP · до 5MB · макс. {max} снимки</p>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
