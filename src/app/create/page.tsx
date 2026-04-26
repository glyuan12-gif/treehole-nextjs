'use client'

import React, { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { Avatar } from '@/components/Avatar'
import { api } from '@/lib/api'
import RoleSelector from '@/components/RoleSelector'
import { CHANNELS_WITH_COLORS, MOODS } from '@/lib/constants'

export default function CreatePage() {
  const router = useRouter()
  const { user, isAuthenticated, register } = useAuth()
  const { showToast } = useToast()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [channel, setChannel] = useState('treehole')
  const [mood, setMood] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [image, setImage] = useState('')
  const [showVeinId, setShowVeinId] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [showRoleSelector, setShowRoleSelector] = useState(false)

  // Registration form
  const [showRegister, setShowRegister] = useState(false)
  const [regVeinId, setRegVeinId] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regConfirmPassword, setRegConfirmPassword] = useState('')
  const [showRegPassword, setShowRegPassword] = useState(false)
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false)
  const [regNickname, setRegNickname] = useState('')
  const [regRole, setRegRole] = useState('other')

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      showToast('图片大小不能超过 5MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (ev) => {
      setImage(ev.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleAddTag = () => {
    const tag = tagInput.trim()
    if (tag && !tags.includes(tag) && tags.length < 5) {
      setTags([...tags, tag])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag))
  }

  const handleSubmit = async () => {
    if (!title.trim()) {
      showToast('请输入标题')
      return
    }
    if (!content.trim()) {
      showToast('请输入内容')
      return
    }
    if (!isAuthenticated) {
      setShowRegister(true)
      return
    }

    try {
      setSubmitting(true)
      await api.createPost({
        title: title.trim(),
        content: content.trim(),
        channel,
        mood,
        tags,
        image,
        showVeinId,
      })
      showToast('发布成功')
      router.push('/')
    } catch (err) {
      showToast('发布失败，请重试')
    } finally {
      setSubmitting(false)
    }
  }

  const handleRegister = async () => {
    if (!regVeinId.trim()) {
      showToast('请输入叶脉号')
      return
    }
    if (regVeinId.trim().length < 4) {
      showToast('叶脉号至少4个字符')
      return
    }
    if (!regPassword) {
      showToast('请输入密码')
      return
    }
    if (regPassword.length < 6) {
      showToast('密码至少6个字符')
      return
    }
    if (regPassword !== regConfirmPassword) {
      showToast('两次输入的密码不一致')
      return
    }
    if (!regNickname.trim()) {
      showToast('请输入昵称')
      return
    }

    try {
      const result = await register({
        veinId: regVeinId.trim(),
        password: regPassword,
        nickname: regNickname.trim(),
        role: regRole,
      })
      if (result) {
        showToast(`注册成功！你的叶脉号：${result.veinId}`)
        setShowRegister(false)
        setRegVeinId('')
        setRegPassword('')
        setRegConfirmPassword('')
        setRegNickname('')
      } else {
        showToast('注册失败')
      }
    } catch (err: any) {
      const msg = err?.message || ''
      if (msg.includes('已被占用')) {
        showToast('该叶脉号已被占用，请换一个')
      } else {
        showToast('注册失败')
      }
    }
  }

  return (
    <div className="page page-transition">
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <h2 className="gradient-text" style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', marginBottom: 24, textAlign: 'center' }}>
          倾诉心声
        </h2>

        {/* Identity Preview */}
        {isAuthenticated && user && (
          <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, padding: 16 }}>
            <Avatar user={user} size="lg" />
            <div>
              <div style={{ fontWeight: 500, fontSize: '0.95rem' }}>{user.nickname}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user.veinId}</div>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={showVeinId}
                  onChange={(e) => setShowVeinId(e.target.checked)}
                  style={{ accentColor: 'var(--accent)' }}
                />
                显示叶脉号
              </label>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="form-group">
          <label className="form-label">频道</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {CHANNELS_WITH_COLORS.map((ch) => (
              <button
                key={ch.id}
                className={`filter-chip ${channel === ch.id ? 'active' : ''}`}
                onClick={() => setChannel(ch.id)}
                style={channel === ch.id ? { background: 'var(--accent)', borderColor: 'var(--accent)' } : undefined}
              >
                {ch.label}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">标题</label>
          <input
            className="form-input"
            placeholder="给心声起个标题..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
          />
          <div className={`char-count ${title.length > 90 ? 'warn' : ''}`}>
            {title.length}/100
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">内容</label>
          <textarea
            className="form-textarea"
            placeholder="说出你想说的话..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={5000}
            rows={6}
          />
          <div className={`char-count ${content.length > 4500 ? 'warn' : ''}`}>
            {content.length}/5000
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">心情</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {MOODS.map((m) => (
              <button
                key={m.id}
                className={`filter-chip ${mood === m.id ? 'active' : ''}`}
                onClick={() => setMood(mood === m.id ? '' : m.id)}
                style={mood === m.id ? { transform: 'scale(1.05)' } : undefined}
              >
                {m.emoji} {m.label}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">标签（最多5个）</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
            {tags.map((tag) => (
              <span key={tag} className="post-tag" style={{ cursor: 'pointer' }} onClick={() => handleRemoveTag(tag)}>
                #{tag} &times;
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              className="form-input"
              placeholder="输入标签..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag() } }}
              style={{ flex: 1 }}
            />
            <button className="btn-primary btn-sm" onClick={handleAddTag}>添加</button>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">图片（可选）</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: 'none' }}
          />
          {image ? (
            <div style={{ position: 'relative', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              <img src={image} alt="" style={{ width: '100%', maxHeight: 300, objectFit: 'cover' }} />
              <button
                onClick={() => setImage('')}
                style={{
                  position: 'absolute', top: 8, right: 8,
                  background: 'rgba(0,0,0,0.5)', color: 'white',
                  border: 'none', borderRadius: '50%', width: 28, height: 28,
                  cursor: 'pointer', fontSize: '1rem',
                }}
              >
                &times;
              </button>
            </div>
          ) : (
            <div className="upload-area" onClick={() => fileInputRef.current?.click()}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)', marginBottom: 8 }}>
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 4 }}>点击或拖放上传图片</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>支持 JPG、PNG，最大 5MB</div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24 }}>
          <button className="btn-ghost" onClick={() => router.back()}>取消</button>
          <button className="btn-primary btn-lg" onClick={handleSubmit} disabled={submitting}>
            {submitting ? '发布中...' : '发布'}
          </button>
        </div>
      </div>

      {/* Register Modal */}
      <div className={`modal ${showRegister ? 'show' : ''}`} onClick={() => setShowRegister(false)}>
        <div className="modal-overlay" />
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>注册叶脉号</h3>
            <button className="modal-close" onClick={() => setShowRegister(false)}>&times;</button>
          </div>
          <div className="modal-body">
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 16 }}>
              发布帖子需要先注册，请设置你的叶脉号和密码
            </p>
            <div className="form-group">
              <label className="form-label">叶脉号</label>
              <input
                className="form-input"
                placeholder="自定义你的专属叶脉号（4-20个字符）..."
                value={regVeinId}
                onChange={(e) => setRegVeinId(e.target.value)}
                maxLength={20}
              />
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                这是你的唯一标识，注册后不可更改
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">密码</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="form-input"
                  type={showRegPassword ? 'text' : 'password'}
                  placeholder="设置密码（至少6个字符）..."
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  maxLength={50}
                  style={{ paddingRight: 40 }}
                />
                <button
                  type="button"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4,
                  }}
                >
                  {showRegPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">确认密码</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="form-input"
                  type={showRegConfirmPassword ? 'text' : 'password'}
                  placeholder="再次输入密码..."
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  maxLength={50}
                  style={{ paddingRight: 40 }}
                />
                <button
                  type="button"
                  onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4,
                  }}
                >
                  {showRegConfirmPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">昵称</label>
              <input
                className="form-input"
                placeholder="给自己取个名字..."
                value={regNickname}
                onChange={(e) => setRegNickname(e.target.value)}
                maxLength={20}
              />
            </div>
            <div className="form-group">
              <label className="form-label">身份</label>
              <div className="option-group">
                {[
                  { id: 'student', label: '学生', emoji: '🎓' },
                  { id: 'worker', label: '打工人', emoji: '💼' },
                  { id: 'freelancer', label: '自由职业', emoji: '🎨' },
                  { id: 'other', label: '其他', emoji: '🌟' },
                ].map((r) => (
                  <div
                    key={r.id}
                    className={`option-item ${regRole === r.id ? 'selected' : ''}`}
                    onClick={() => setRegRole(r.id)}
                  >
                    <span style={{ fontSize: '1.2rem' }}>{r.emoji}</span>
                    <span>{r.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn-ghost" onClick={() => setShowRegister(false)}>取消</button>
            <button className="btn-primary" onClick={handleRegister}>注册</button>
          </div>
        </div>
      </div>
    </div>
  )
}
