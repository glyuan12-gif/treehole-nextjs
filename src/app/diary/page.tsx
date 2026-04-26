'use client'

import React, { useState, useEffect } from 'react'
import { api, type Diary } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import Modal from '@/components/Modal'
import { MOODS } from '@/lib/constants'

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

function formatDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export default function DiaryPage() {
  const { isAuthenticated } = useAuth()
  const { showToast } = useToast()

  const [diaries, setDiaries] = useState<Diary[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [showEditor, setShowEditor] = useState(false)
  const [showViewer, setShowViewer] = useState(false)
  const [selectedDiary, setSelectedDiary] = useState<Diary | null>(null)

  // Editor state
  const [editorDate, setEditorDate] = useState('')
  const [editorContent, setEditorContent] = useState('')
  const [editorMood, setEditorMood] = useState('')
  const [editorPublic, setEditorPublic] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false)
      return
    }
    loadDiaries()
  }, [isAuthenticated])

  const loadDiaries = async () => {
    try {
      const data = await api.getDiaries()
      setDiaries(data)
    } catch {
      showToast('加载日记失败')
    } finally {
      setLoading(false)
    }
  }

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)
  const today = new Date()
  const todayStr = formatDate(today)

  const diaryDates = new Set(diaries.map(d => d.date))
  const diaryMap = new Map(diaries.map(d => [d.date, d]))

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const handleDayClick = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const diary = diaryMap.get(dateStr)
    if (diary) {
      setSelectedDiary(diary)
      setShowViewer(true)
    } else {
      setEditorDate(dateStr)
      setEditorContent('')
      setEditorMood('')
      setEditorPublic(false)
      setShowEditor(true)
    }
  }

  const handleSaveDiary = async () => {
    if (!editorContent.trim()) {
      showToast('请输入日记内容')
      return
    }

    try {
      setSaving(true)
      await api.saveDiary({
        date: editorDate,
        content: editorContent.trim(),
        mood: editorMood,
        isPublic: editorPublic,
      })
      showToast('保存成功')
      setShowEditor(false)
      loadDiaries()
    } catch {
      showToast('保存失败')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteDiary = async () => {
    if (!selectedDiary || !confirm('确定要删除这篇日记吗？')) return
    try {
      await api.deleteDiary(selectedDiary.id)
      showToast('已删除')
      setShowViewer(false)
      setSelectedDiary(null)
      loadDiaries()
    } catch {
      showToast('删除失败')
    }
  }

  const handleEditDiary = () => {
    if (!selectedDiary) return
    setEditorDate(selectedDiary.date)
    setEditorContent(selectedDiary.content)
    setEditorMood(selectedDiary.mood)
    setEditorPublic(selectedDiary.isPublic)
    setShowViewer(false)
    setShowEditor(true)
  }

  if (!isAuthenticated) {
    return (
      <div className="page page-transition">
        <div className="empty-state animate-fade-in-up">
          <div className="empty-icon animate-pulse-soft">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
              <path d="M8 14h.01" strokeWidth="2" strokeLinecap="round" />
              <path d="M12 14h.01" strokeWidth="2" strokeLinecap="round" />
              <path d="M16 14h.01" strokeWidth="2" strokeLinecap="round" />
              <path d="M8 18h.01" strokeWidth="2" strokeLinecap="round" />
              <path d="M12 18h.01" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <div className="empty-title">记录每一天的心情</div>
          <div className="empty-desc" style={{ marginBottom: 20 }}>在这里，你可以安全地写下自己的日记</div>
          <a href="/settings" className="btn-primary" style={{ textDecoration: 'none' }}>去登录</a>
        </div>
      </div>
    )
  }

  // Build calendar days
  const calendarDays: { day: number; isCurrentMonth: boolean; dateStr: string }[] = []

  // Previous month days
  const prevMonthDays = getDaysInMonth(year, month - 1)
  for (let i = firstDay - 1; i >= 0; i--) {
    const day = prevMonthDays - i
    const m = month === 0 ? 12 : month
    const y = month === 0 ? year - 1 : year
    calendarDays.push({
      day,
      isCurrentMonth: false,
      dateStr: `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    })
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    calendarDays.push({ day, isCurrentMonth: true, dateStr })
  }

  // Next month days to fill the grid
  const remaining = 42 - calendarDays.length
  for (let day = 1; day <= remaining; day++) {
    const m = month === 11 ? 1 : month + 2
    const y = month === 11 ? year + 1 : year
    calendarDays.push({
      day,
      isCurrentMonth: false,
      dateStr: `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    })
  }

  return (
    <div className="page page-transition">
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: 24, textAlign: 'center' }}>
        我的日记
      </h2>

      {/* Calendar */}
      <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: 20, marginBottom: 24 }}>
        {/* Month Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <button className="btn-ghost btn-sm" onClick={prevMonth}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <span style={{ fontWeight: 500, fontSize: '1rem' }}>
            {year}年{month + 1}月
          </span>
          <button className="btn-ghost btn-sm" onClick={nextMonth}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        {/* Weekday Headers */}
        <div className="diary-cal-header">
          {WEEKDAYS.map(d => <div key={d}>{d}</div>)}
        </div>

        {/* Calendar Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
          {calendarDays.map((item, idx) => {
            const isToday = item.dateStr === todayStr
            const hasDiary = diaryDates.has(item.dateStr)

            return (
              <div
                key={idx}
                className={`diary-cal-day ${!item.isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''} ${hasDiary ? 'has-diary' : ''}`}
                onClick={() => item.isCurrentMonth && handleDayClick(item.day)}
              >
                {item.day}
              </div>
            )
          })}
        </div>
      </div>

      {/* Recent Diaries */}
      <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 12, color: 'var(--text-secondary)' }}>
        最近日记
      </h3>

      {loading ? (
        Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 80, marginBottom: 12, borderRadius: 'var(--radius-md)' }} />
        ))
      ) : diaries.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </div>
          <div className="empty-title">还没有日记</div>
          <div className="empty-desc">点击日历上的日期开始记录</div>
        </div>
      ) : (
        diaries.slice(0, 10).map((diary) => {
          const moodEmoji = MOODS.find(m => m.id === diary.mood)?.emoji || ''
          return (
            <div
              key={diary.id}
              className="diary-item animate-fade-in-up"
              onClick={() => {
                setSelectedDiary(diary)
                setShowViewer(true)
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{diary.date}</span>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  {moodEmoji && <span style={{ fontSize: '1rem' }}>{moodEmoji}</span>}
                  {diary.isPublic && <span className="post-tag" style={{ fontSize: '0.65rem' }}>公开</span>}
                </div>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {diary.content}
              </div>
            </div>
          )
        })
      )}

      {/* Diary Editor Modal */}
      <Modal
        isOpen={showEditor}
        onClose={() => setShowEditor(false)}
        title={editorContent ? '编辑日记' : '写日记'}
        footer={
          <>
            <button className="btn-ghost" onClick={() => setShowEditor(false)}>取消</button>
            <button className="btn-primary" onClick={handleSaveDiary} disabled={saving}>
              {saving ? '保存中...' : '保存'}
            </button>
          </>
        }
      >
        <div style={{ marginBottom: 12, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {editorDate}
        </div>
        <div className="form-group">
          <label className="form-label">心情</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {MOODS.map((m) => (
              <button
                key={m.id}
                className={`filter-chip ${editorMood === m.id ? 'active' : ''}`}
                onClick={() => setEditorMood(editorMood === m.id ? '' : m.id)}
              >
                {m.emoji} {m.label}
              </button>
            ))}
          </div>
        </div>
        <div className="form-group">
          <textarea
            className="form-textarea"
            placeholder="今天发生了什么..."
            value={editorContent}
            onChange={(e) => setEditorContent(e.target.value)}
            rows={8}
            maxLength={10000}
          />
          <div className={`char-count ${editorContent.length > 9000 ? 'warn' : ''}`}>
            {editorContent.length}/10000
          </div>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={editorPublic}
            onChange={(e) => setEditorPublic(e.target.checked)}
            style={{ accentColor: 'var(--accent)' }}
          />
          公开日记（其他用户可见）
        </label>
      </Modal>

      {/* Diary Viewer Modal */}
      <Modal
        isOpen={showViewer}
        onClose={() => { setShowViewer(false); setSelectedDiary(null) }}
        title={selectedDiary?.date || ''}
        footer={
          <>
            <button className="btn-ghost" onClick={handleDeleteDiary} style={{ color: '#e74c3c', marginRight: 'auto' }}>
              删除
            </button>
            <button className="btn-ghost" onClick={() => setShowViewer(false)}>关闭</button>
            <button className="btn-primary" onClick={handleEditDiary}>编辑</button>
          </>
        }
      >
        {selectedDiary && (
          <>
            <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
              {selectedDiary.mood && MOODS.find(m => m.id === selectedDiary.mood) && (
                <span className="mood-badge" style={{ background: 'var(--bg-glass)' }}>
                  {MOODS.find(m => m.id === selectedDiary.mood)?.emoji}{' '}
                  {MOODS.find(m => m.id === selectedDiary.mood)?.label}
                </span>
              )}
              {selectedDiary.isPublic && <span className="post-tag">公开</span>}
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.8, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {selectedDiary.content}
            </div>
          </>
        )}
      </Modal>
    </div>
  )
}
