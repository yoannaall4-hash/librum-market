'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createPortal } from 'react-dom'
import { useAdminEditMode } from '@/contexts/AdminEditModeContext'

type Lang = 'bg' | 'en' | 'ro'

interface EditableTextProps {
  contentKey: string
  defaultValue: string
  className?: string
  tag?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div'
  multiline?: boolean
}

const LANGS: { key: Lang; label: string; flag: string }[] = [
  { key: 'bg', label: 'БГ', flag: '🇧🇬' },
  { key: 'en', label: 'EN', flag: '🇬🇧' },
  { key: 'ro', label: 'РО', flag: '🇷🇴' },
]

export default function EditableText({
  contentKey,
  defaultValue,
  className,
  tag: Tag = 'span',
  multiline = false,
}: EditableTextProps) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [editing, setEditing] = useState(false)
  const [values, setValues] = useState<Record<Lang, string>>({ bg: '', en: '', ro: '' })
  const [activeLang, setActiveLang] = useState<Lang>('bg')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0, width: 0 })
  const textRef = useRef<HTMLElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { editMode } = useAdminEditMode()

  useEffect(() => {
    fetch('/api/me')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.user?.role === 'admin') setIsAdmin(true) })
      .catch(() => {})
  }, [])

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (
      popoverRef.current &&
      !popoverRef.current.contains(e.target as Node) &&
      textRef.current &&
      !textRef.current.contains(e.target as Node)
    ) {
      setEditing(false)
    }
  }, [])

  useEffect(() => {
    if (editing) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [editing, handleClickOutside])

  async function startEditing(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!isAdmin) return

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()

    const popoverWidth = Math.max(rect.width, 280)
    // Use viewport coordinates (fixed positioning — no scroll offset needed)
    let topOffset = rect.bottom + 6
    let leftOffset = rect.left
    // Keep within right edge
    if (leftOffset + popoverWidth > window.innerWidth - 16) {
      leftOffset = window.innerWidth - popoverWidth - 16
    }
    // If too close to bottom, flip above the element
    if (topOffset + 180 > window.innerHeight) {
      topOffset = rect.top - 180
    }
    setPopoverPos({ top: topOffset, left: leftOffset, width: popoverWidth })

    // Fetch all language values
    try {
      const res = await fetch('/api/admin/content')
      if (res.ok) {
        const data = await res.json()
        const existing = data.content[contentKey]
        setValues(existing || { bg: defaultValue, en: '', ro: '' })
      } else {
        setValues({ bg: defaultValue, en: '', ro: '' })
      }
    } catch {
      setValues({ bg: defaultValue, en: '', ro: '' })
    }
    setEditing(true)
  }

  async function handleSave() {
    setSaving(true)
    try {
      await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [contentKey]: values }),
      })
      setSaved(true)
      setTimeout(() => {
        setSaved(false)
        setEditing(false)
        router.refresh()
      }, 800)
    } finally {
      setSaving(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') setEditing(false)
    if (!multiline && e.key === 'Enter') {
      e.preventDefault()
      handleSave()
    }
    if (multiline && e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleSave()
    }
  }

  if (!isAdmin) {
    return <Tag className={className}>{defaultValue}</Tag>
  }

  return (
    <>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <Tag
        ref={textRef as any}
        className={`${className ?? ''} relative cursor-pointer group/editable outline-none transition-all rounded ${
          editMode ? 'ring-2 ring-blue-400 ring-offset-1 bg-blue-50/60' : ''
        }`}
        onClick={startEditing}
        title="Кликни за редактиране"
        style={{ userSelect: 'none' }}
      >
        {defaultValue}
        {/* Pencil indicator: always visible in editMode, hover-only otherwise */}
        <span
          className={`inline-flex items-center justify-center w-4 h-4 rounded bg-stone-800 transition-opacity ml-1 relative -top-0.5 align-middle pointer-events-none ${
            editMode ? 'opacity-80' : 'opacity-0 group-hover/editable:opacity-90'
          }`}
          aria-hidden
        >
          <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
          </svg>
        </span>
      </Tag>

      {/* Floating editor portal */}
      {editing && typeof document !== 'undefined' && createPortal(
        <div
          ref={popoverRef}
          className="fixed z-[9999] bg-white border-2 border-stone-800 rounded-xl shadow-2xl p-3 flex flex-col gap-2"
          style={{ top: popoverPos.top, left: popoverPos.left, width: popoverPos.width, minWidth: 280 }}
          onClick={e => e.stopPropagation()}
        >
          {/* Key label */}
          <p className="text-[10px] font-mono text-stone-400 leading-none">{contentKey}</p>

          {/* Lang tabs */}
          <div className="flex gap-1">
            {LANGS.map(l => (
              <button
                key={l.key}
                onClick={() => setActiveLang(l.key)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                  activeLang === l.key
                    ? 'bg-stone-900 text-white'
                    : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                }`}
              >
                {l.flag} {l.label}
              </button>
            ))}
          </div>

          {/* Input */}
          {multiline ? (
            <textarea
              autoFocus
              value={values[activeLang]}
              onChange={e => setValues(v => ({ ...v, [activeLang]: e.target.value }))}
              onKeyDown={handleKeyDown}
              rows={3}
              className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:border-stone-600 focus:outline-none focus:ring-1 focus:ring-stone-600 resize-y bg-stone-50"
              placeholder="Текст…"
            />
          ) : (
            <input
              autoFocus
              type="text"
              value={values[activeLang]}
              onChange={e => setValues(v => ({ ...v, [activeLang]: e.target.value }))}
              onKeyDown={handleKeyDown}
              className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:border-stone-600 focus:outline-none focus:ring-1 focus:ring-stone-600 bg-stone-50"
              placeholder="Текст…"
            />
          )}

          {/* Actions */}
          <div className="flex gap-2 justify-end items-center">
            {multiline && (
              <span className="text-[10px] text-stone-300 mr-auto">Ctrl+Enter за запис</span>
            )}
            <button
              onClick={() => setEditing(false)}
              className="px-3 py-1.5 text-xs rounded-lg bg-stone-100 text-stone-600 hover:bg-stone-200 font-medium transition-colors"
            >
              Отказ
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-3 py-1.5 text-xs rounded-lg bg-stone-900 text-white hover:bg-stone-700 font-semibold transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              {saving ? (
                <>
                  <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin inline-block" />
                  Запазване...
                </>
              ) : saved ? (
                <>
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  Запазено!
                </>
              ) : (
                'Запази'
              )}
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
