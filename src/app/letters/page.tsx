'use client'

import React, { useState, useEffect } from 'react'
import { api, type Letter } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { Avatar } from '@/components/Avatar'
import Modal from '@/components/Modal'
import { formatTime } from '@/components/PostCard'

type LetterTab = 'all' | 'received' | 'sent'

export default function LettersPage() {
  const { user, isAuthenticated } = useAuth()
  const { showToast } = useToast()

  const [letters, setLetters] = useState<Letter[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<LetterTab>('all')
  const [showCreate, setShowCreate] = useState(false)
  const [showViewer, setShowViewer] = useState(false)
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null)

  // Create form
  const [letterContent, setLetterContent] = useState('')
  const [letterReceiver, setLetterReceiver] = useState('')
  const [letterReceiverUser, setLetterReceiverUser] = useState<{ nickname: string; avatarStyle: string; avatarEmoji: string; avatarColor: string } | null>(null)
  const [letterIsSelf, setLetterIsSelf] = useState(true)
  const [letterOpenDate, setLetterOpenDate] = useState('')
  const [letterSealed, setLetterSealed] = useState(false)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false)
      return
    }
    loadLetters()
  }, [isAuthenticated])

  const loadLetters = async () => {
    try {
      const data = await api.getLetters()
      setLetters(data)
    } catch {
      showToast('加载信件失败')
    } finally {
      setLoading(false)
    }
  }

  const filteredLetters = letters.filter(l => {
    if (activeTab === 'received') return l.receiverId === user?.id && !l.isSelf
    if (activeTab === 'sent') return l.senderId === user?.id
    return true
  })

  const isSealed = (letter: Letter) => {
    if (!letter.openDate) return false
    return new Date(letter.openDate) > new Date()
  }

  const getSealedCountdown = (letter: Letter) => {
    if (!letter.openDate) return ''
    const diff = new Date(letter.openDate).getTime() - Date.now()
    if (diff <= 0) return ''

    const days = Math.floor(diff / 86400000)
    const hours = Math.floor((diff % 86400000) / 3600000)

    if (days > 0) return `还有 ${days}天${hours}小时 可开封`
    return `还有 ${hours}小时 可开封`
  }

  const handleSearchReceiver = async () => {
    if (!letterReceiver.trim()) return
    try {
      const userData = await api.getUser(letterReceiver.trim())
      setLetterReceiverUser(userData)
    } catch {
      showToast('用户不存在')
      setLetterReceiverUser(null)
    }
  }

  const handleCreateLetter = async () => {
    if (!letterContent.trim()) {
      showToast('请输入信件内容')
      return
    }

    if (!letterIsSelf && !letterReceiverUser) {
      showToast('请输入收件人')
      return
    }

    try {
      setCreating(true)
      await api.createLetter({
        content: letterContent.trim(),
        receiverVeinId: letterIsSelf ? undefined : letterReceiver.trim(),
        openDate: letterSealed ? letterOpenDate || undefined : undefined,
        isSelf: letterIsSelf,
      })
      showToast('信件已寄出')
      setShowCreate(false)
      resetCreateForm()
      loadLetters()
    } catch {
      showToast('寄信失败')
    } finally {
      setCreating(false)
    }
  }

  const resetCreateForm = () => {
    setLetterContent('')
    setLetterReceiver('')
    setLetterReceiverUser(null)
    setLetterIsSelf(true)
    setLetterOpenDate('')
    setLetterSealed(false)
  }

  const handleDeleteLetter = async () => {
    if (!selectedLetter || !confirm('确定要删除这封信吗？')) return
    try {
      await api.deleteLetter(selectedLetter.id)
      showToast('已删除')
      setShowViewer(false)
      setSelectedLetter(null)
      loadLetters()
    } catch {
      showToast('删除失败')
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="page page-transition">
        <div className="empty-state animate-fade-in-up">
          <div className="empty-icon animate-pulse-soft">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
              <path d="M12 13v8" />
              <circle cx="12" cy="17" r="1" fill="currentColor" />
            </svg>
          </div>
          <div className="empty-title">给未来的自己写一封信</div>
          <div className="empty-desc" style={{ marginBottom: 20 }}>跨越时间的对话，寄给未来的自己</div>
          <a href="/settings" className="btn-primary" style={{ textDecoration: 'none' }}>去登录</a>
        </div>
      </div>
    )
  }

  return (
    <div className="page page-transition">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem' }}>信件</h2>
        <button className="btn-primary btn-sm" onClick={() => { resetCreateForm(); setShowCreate(true) }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          写信
        </button>
      </div>

      {/* Tabs */}
      <div className="letter-tabs">
        {[
          { id: 'all' as LetterTab, label: '全部' },
          { id: 'received' as LetterTab, label: '收件箱' },
          { id: 'sent' as LetterTab, label: '已发送' },
        ].map(tab => (
          <button
            key={tab.id}
            className={`letter-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Letter List */}
      {loading ? (
        Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 80, marginBottom: 12 }} />
        ))
      ) : filteredLetters.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </div>
          <div className="empty-title">还没有信件</div>
          <div className="empty-desc">写一封信给自己或他人吧</div>
        </div>
      ) : (
        filteredLetters.map((letter) => {
          const sealed = isSealed(letter)
          const isSent = letter.senderId === user?.id

          return (
            <div
              key={letter.id}
              className={`letter-item ${sealed ? 'sealed' : ''}`}
              onClick={() => {
                if (sealed) {
                  showToast('信件尚未到开封时间')
                  return
                }
                setSelectedLetter(letter)
                setShowViewer(true)
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <Avatar user={isSent ? letter.receiver || letter.sender : letter.sender} size="sm" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 500, fontSize: '0.85rem' }}>
                    {isSent ? `致 ${letter.isSelf ? '自己' : (letter.receiver?.nickname || '未知')}` : `来自 ${letter.sender.nickname}`}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {formatTime(letter.createdAt)}
                  </div>
                </div>
                {sealed && (
                  <span className="post-tag" style={{ color: 'var(--accent)', borderColor: 'var(--accent)' }}>
                    封存中
                  </span>
                )}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {sealed ? '这封信还在封存中...' : letter.content}
              </div>
              {sealed && getSealedCountdown(letter) && (
                <div style={{ fontSize: '0.75rem', color: 'var(--accent)', marginTop: 6 }}>
                  {getSealedCountdown(letter)}
                </div>
              )}
            </div>
          )
        })
      )}

      {/* Create Letter Modal */}
      <Modal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        title="写信"
        footer={
          <>
            <button className="btn-ghost" onClick={() => setShowCreate(false)}>取消</button>
            <button className="btn-primary" onClick={handleCreateLetter} disabled={creating}>
              {creating ? '寄出中...' : '寄出'}
            </button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label">收件人</label>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <button
              className={`filter-chip ${letterIsSelf ? 'active' : ''}`}
              onClick={() => setLetterIsSelf(true)}
            >
              写给自己
            </button>
            <button
              className={`filter-chip ${!letterIsSelf ? 'active' : ''}`}
              onClick={() => setLetterIsSelf(false)}
            >
              写给他人
            </button>
          </div>
          {!letterIsSelf && (
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                className="form-input"
                placeholder="输入对方叶脉号..."
                value={letterReceiver}
                onChange={(e) => setLetterReceiver(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSearchReceiver() }}
                style={{ flex: 1 }}
              />
              <button className="btn-ghost btn-sm" onClick={handleSearchReceiver}>查找</button>
            </div>
          )}
          {letterReceiverUser && !letterIsSelf && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, padding: 8, background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)' }}>
              <Avatar user={letterReceiverUser} size="sm" />
              <span style={{ fontSize: '0.85rem' }}>{letterReceiverUser.nickname}</span>
            </div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">封存（可选）</label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', color: 'var(--text-secondary)', cursor: 'pointer', marginBottom: 8 }}>
            <input
              type="checkbox"
              checked={letterSealed}
              onChange={(e) => setLetterSealed(e.target.checked)}
              style={{ accentColor: 'var(--accent)' }}
            />
            设为封存信（到期后才能查看）
          </label>
          {letterSealed && (
            <input
              type="date"
              className="form-input"
              value={letterOpenDate}
              onChange={(e) => setLetterOpenDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          )}
        </div>

        <div className="form-group">
          <label className="form-label">信件内容</label>
          <textarea
            className="form-textarea"
            placeholder="写下你想说的话..."
            value={letterContent}
            onChange={(e) => setLetterContent(e.target.value)}
            rows={6}
            maxLength={5000}
          />
          <div className={`char-count ${letterContent.length > 4500 ? 'warn' : ''}`}>
            {letterContent.length}/5000
          </div>
        </div>
      </Modal>

      {/* Letter Viewer Modal */}
      <Modal
        isOpen={showViewer}
        onClose={() => { setShowViewer(false); setSelectedLetter(null) }}
        title="信件"
        footer={
          <>
            <button className="btn-ghost" onClick={handleDeleteLetter} style={{ color: '#e74c3c', marginRight: 'auto' }}>
              删除
            </button>
            <button className="btn-ghost" onClick={() => setShowViewer(false)}>关闭</button>
          </>
        }
      >
        {selectedLetter && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
              <Avatar user={selectedLetter.sender} size="md" />
              <div>
                <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{selectedLetter.sender.nickname}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {formatTime(selectedLetter.createdAt)}
                </div>
              </div>
              <div style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {selectedLetter.isSelf ? '写给自己的信' : `致 ${selectedLetter.receiver?.nickname || '未知'}`}
              </div>
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.8, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {selectedLetter.content}
            </div>
          </>
        )}
      </Modal>
    </div>
  )
}
