'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { Avatar } from '@/components/Avatar'
import ThemePicker from '@/components/ThemePicker'
import RoleSelector from '@/components/RoleSelector'
import { EMOJIS, COLORS, MBTI_TYPES, MBTI_DESC } from '@/lib/constants'

// 密码显示/隐藏切换图标组件
function EyeIcon({ show, onClick }: { show: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        position: 'absolute',
        right: 12,
        top: '50%',
        transform: 'translateY(-50%)',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: 'var(--text-muted)',
        padding: 4,
        display: 'flex',
        alignItems: 'center',
        borderRadius: 'var(--radius-sm)',
        transition: 'color 0.2s, background 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = 'var(--accent)'
        e.currentTarget.style.background = 'var(--accent-bg)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = 'var(--text-muted)'
        e.currentTarget.style.background = 'none'
      }}
    >
      {show ? (
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
  )
}

export default function SettingsPage() {
  const { user, isAuthenticated, register, login, updateProfile, logout } = useAuth()
  const { showToast } = useToast()

  const [showThemePicker, setShowThemePicker] = useState(false)
  const [showRoleSelector, setShowRoleSelector] = useState(false)

  // Login form
  const [loginVeinId, setLoginVeinId] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [loggingIn, setLoggingIn] = useState(false)

  // Register form
  const [showRegister, setShowRegister] = useState(false)
  const [regVeinId, setRegVeinId] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regConfirmPassword, setRegConfirmPassword] = useState('')
  const [showRegPassword, setShowRegPassword] = useState(false)
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false)
  const [regNickname, setRegNickname] = useState('')
  const [regRole, setRegRole] = useState('other')
  const [registering, setRegistering] = useState(false)

  // Profile edit
  const [editNickname, setEditNickname] = useState('')
  const [editMbti, setEditMbti] = useState('')
  const [editAvatarStyle, setEditAvatarStyle] = useState('emoji')
  const [editAvatarEmoji, setEditAvatarEmoji] = useState('😊')
  const [editAvatarColor, setEditAvatarColor] = useState('#5b8c6e')
  const [saving, setSaving] = useState(false)

  // Copy veinId
  const [veinIdCopied, setVeinIdCopied] = useState(false)

  useEffect(() => {
    if (user) {
      setEditNickname(user.nickname)
      setEditMbti(user.mbti)
      setEditAvatarStyle(user.avatarStyle)
      setEditAvatarEmoji(user.avatarEmoji)
      setEditAvatarColor(user.avatarColor)
    }
  }, [user])

  const handleLogin = async () => {
    if (!loginVeinId.trim()) {
      showToast('请输入叶脉号')
      return
    }
    if (!loginPassword) {
      showToast('请输入密码')
      return
    }
    try {
      setLoggingIn(true)
      const result = await login(loginVeinId.trim(), loginPassword)
      if (result) {
        showToast('登录成功')
        setLoginVeinId('')
        setLoginPassword('')
      } else {
        showToast('登录失败，请检查叶脉号和密码')
      }
    } catch {
      showToast('登录失败')
    } finally {
      setLoggingIn(false)
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
      setRegistering(true)
      const result = await register({
        veinId: regVeinId.trim(),
        password: regPassword,
        nickname: regNickname.trim(),
        role: regRole,
        avatarEmoji: editAvatarEmoji,
        avatarColor: editAvatarColor,
        avatarStyle: editAvatarStyle,
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
    } finally {
      setRegistering(false)
    }
  }

  const handleSaveProfile = async () => {
    if (!editNickname.trim()) {
      showToast('昵称不能为空')
      return
    }
    try {
      setSaving(true)
      await updateProfile({
        nickname: editNickname.trim(),
        mbti: editMbti,
        avatarStyle: editAvatarStyle,
        avatarEmoji: editAvatarEmoji,
        avatarColor: editAvatarColor,
      })
      showToast('保存成功')
    } catch {
      showToast('保存失败')
    } finally {
      setSaving(false)
    }
  }

  const handleCopyVeinId = () => {
    if (user?.veinId) {
      navigator.clipboard.writeText(user.veinId).then(() => {
        setVeinIdCopied(true)
        showToast('已复制叶脉号')
        setTimeout(() => setVeinIdCopied(false), 2000)
      })
    }
  }

  // Not logged in - show login/register
  if (!isAuthenticated || !user) {
    return (
      <div className="page page-transition">
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <h2 className="gradient-text" style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', marginBottom: 8, textAlign: 'center' }}>
            树洞
          </h2>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: 32, fontSize: '0.9rem' }}>
            登录或注册以开始你的匿名社交之旅
          </p>

          {/* Login */}
          <div className="glass-card" style={{ padding: 28, marginBottom: 16 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 16 }}>登录</h3>
            <div className="form-group">
              <label className="form-label">叶脉号</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </span>
                <input
                  className="form-input"
                  placeholder="输入你的叶脉号..."
                  value={loginVeinId}
                  onChange={(e) => setLoginVeinId(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleLogin() }}
                  style={{ paddingLeft: 36 }}
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">密码</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="form-input"
                  type={showLoginPassword ? 'text' : 'password'}
                  placeholder="输入密码..."
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleLogin() }}
                  style={{ paddingRight: 40 }}
                />
                <EyeIcon show={showLoginPassword} onClick={() => setShowLoginPassword(!showLoginPassword)} />
              </div>
            </div>
            <button className="btn-primary" onClick={handleLogin} disabled={loggingIn} style={{ width: '100%' }}>
              {loggingIn ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  登录中...
                </span>
              ) : '登录'}
            </button>
          </div>

          {/* Register */}
          <div className="glass-card" style={{ padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0, color: 'var(--accent)' }}>注册</h3>
              <button className="btn-ghost btn-sm" onClick={() => setShowRegister(!showRegister)}>
                {showRegister ? '收起' : '展开'}
              </button>
            </div>

            {showRegister && (
              <>
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
                    <EyeIcon show={showRegPassword} onClick={() => setShowRegPassword(!showRegPassword)} />
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
                    <EyeIcon show={showRegConfirmPassword} onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)} />
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

                <div className="form-group">
                  <label className="form-label">头像风格</label>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                    {[
                      { id: 'emoji', label: 'Emoji' },
                      { id: 'gradient', label: '渐变' },
                      { id: 'initial', label: '首字母' },
                    ].map((s) => (
                      <button
                        key={s.id}
                        className={`filter-chip ${editAvatarStyle === s.id ? 'active' : ''}`}
                        onClick={() => setEditAvatarStyle(s.id)}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>

                  {editAvatarStyle === 'emoji' && (
                    <div className="emoji-grid" style={{ marginBottom: 12 }}>
                      {EMOJIS.map((emoji) => (
                        <div
                          key={emoji}
                          className={`emoji-item ${editAvatarEmoji === emoji ? 'selected' : ''}`}
                          onClick={() => setEditAvatarEmoji(emoji)}
                        >
                          {emoji}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="color-grid">
                    {COLORS.map((color) => (
                      <div
                        key={color}
                        className={`color-item ${editAvatarColor === color ? 'selected' : ''}`}
                        style={{ background: color }}
                        onClick={() => setEditAvatarColor(color)}
                      />
                    ))}
                  </div>
                </div>

                <button className="btn-primary" onClick={handleRegister} disabled={registering} style={{ width: '100%' }}>
                  {registering ? '注册中...' : '注册'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Logged in - show settings
  return (
    <div className="page page-transition">
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <h2 className="gradient-text" style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', marginBottom: 24, textAlign: 'center' }}>
          个人设置
        </h2>

        {/* Identity Preview */}
        <div className="glass-card" style={{ padding: 28, marginBottom: 24, textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
            <Avatar user={user} size="xl" />
          </div>
          <div style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: 4 }}>{user.nickname}</div>
          <div
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: '0.85rem', color: 'var(--text-muted)',
              background: 'var(--bg-glass)', padding: '4px 12px',
              borderRadius: 'var(--radius-full)', cursor: 'pointer',
              border: '1px solid var(--border)',
            }}
            onClick={handleCopyVeinId}
          >
            {user.veinId}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            {veinIdCopied && <span style={{ color: 'var(--accent)' }}>已复制</span>}
          </div>
        </div>

        {/* Nickname */}
        <div className="glass-card" style={{ padding: 20, marginBottom: 16 }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 12 }}>昵称</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              className="form-input"
              value={editNickname}
              onChange={(e) => setEditNickname(e.target.value)}
              maxLength={20}
              style={{ flex: 1 }}
            />
          </div>
        </div>

        {/* Role */}
        <div className="glass-card" style={{ padding: 20, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>身份</h3>
            <button className="btn-ghost btn-sm" onClick={() => setShowRoleSelector(true)}>切换</button>
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {{
              student: '🎓 学生',
              worker: '💼 打工人',
              freelancer: '🎨 自由职业',
              other: '🌟 其他',
            }[user.role] || user.role}
          </div>
        </div>

        {/* Avatar Style */}
        <div className="glass-card" style={{ padding: 20, marginBottom: 16 }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 12 }}>头像风格</h3>

          {/* Style selector */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {[
              { id: 'emoji', label: 'Emoji' },
              { id: 'gradient', label: '渐变' },
              { id: 'initial', label: '首字母' },
            ].map((s) => (
              <button
                key={s.id}
                className={`filter-chip ${editAvatarStyle === s.id ? 'active' : ''}`}
                onClick={() => setEditAvatarStyle(s.id)}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Preview */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <Avatar
              user={{
                avatarStyle: editAvatarStyle,
                avatarEmoji: editAvatarEmoji,
                avatarColor: editAvatarColor,
                nickname: editNickname,
              }}
              size="xl"
            />
          </div>

          {/* Emoji grid */}
          {editAvatarStyle === 'emoji' && (
            <div style={{ marginBottom: 16 }}>
              <div className="form-label" style={{ marginBottom: 8 }}>选择 Emoji</div>
              <div className="emoji-grid">
                {EMOJIS.map((emoji) => (
                  <div
                    key={emoji}
                    className={`emoji-item ${editAvatarEmoji === emoji ? 'selected' : ''}`}
                    onClick={() => setEditAvatarEmoji(emoji)}
                  >
                    {emoji}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Color grid */}
          <div>
            <div className="form-label" style={{ marginBottom: 8 }}>选择颜色</div>
            <div className="color-grid">
              {COLORS.map((color) => (
                <div
                  key={color}
                  className={`color-item ${editAvatarColor === color ? 'selected' : ''}`}
                  style={{ background: color }}
                  onClick={() => setEditAvatarColor(color)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* MBTI */}
        <div className="glass-card" style={{ padding: 20, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>MBTI 人格</h3>
            <Link
              href="/mbti"
              style={{
                fontSize: '0.8rem',
                color: 'var(--accent)',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontFamily: 'var(--font-ui)',
                transition: 'opacity 0.2s',
              }}
            >
              去测试
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 10 }}>手动选择</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginBottom: 8 }}>
            {MBTI_TYPES.map((type) => (
              <button
                key={type}
                className={`filter-chip ${editMbti === type ? 'active' : ''}`}
                onClick={() => setEditMbti(editMbti === type ? '' : type)}
                style={{ fontSize: '0.7rem', justifyContent: 'center', padding: '6px 4px' }}
              >
                {type}
              </button>
            ))}
          </div>
          {editMbti && MBTI_DESC[editMbti] && (
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 8 }}>
              {MBTI_DESC[editMbti]}
            </div>
          )}
        </div>

        {/* Theme */}
        <div className="glass-card" style={{ padding: 20, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 4 }}>主题</h3>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>切换界面主题风格</div>
            </div>
            <button className="btn-ghost btn-sm" onClick={() => setShowThemePicker(true)}>选择</button>
          </div>
        </div>

        {/* Save Button */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <button className="btn-primary" onClick={handleSaveProfile} disabled={saving} style={{ flex: 1 }}>
            {saving ? '保存中...' : '保存设置'}
          </button>
        </div>

        {/* Logout */}
        <button
          className="btn-ghost"
          onClick={() => {
            logout()
            showToast('已退出登录')
          }}
          style={{ width: '100%', color: '#e74c3c', borderColor: '#e74c3c40', marginBottom: 40 }}
        >
          退出登录
        </button>
      </div>

      {/* Theme Picker */}
      <ThemePicker isOpen={showThemePicker} onClose={() => setShowThemePicker(false)} />

      {/* Role Selector */}
      <RoleSelector
        isOpen={showRoleSelector}
        onClose={() => setShowRoleSelector(false)}
        onSelect={async (role) => {
          const success = await updateProfile({ role })
          if (success) showToast('身份已更新')
          else showToast('更新失败')
        }}
      />
    </div>
  )
}
