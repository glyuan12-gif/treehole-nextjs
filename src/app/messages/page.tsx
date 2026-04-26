'use client'

import React, { useState, useEffect, useRef } from 'react'
import { api, type Conversation, type Message } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { Avatar } from '@/components/Avatar'
import Modal from '@/components/Modal'
import { formatTime } from '@/components/PostCard'

function getMbtiCompatibility(mbti1: string, mbti2: string): string {
  if (!mbti1 || !mbti2) return ''
  if (mbti1 === mbti2) return '100% 契合'
  // Simple compatibility based on shared letters
  const shared = [...mbti1].filter(c => mbti2.includes(c)).length
  const percent = Math.round((shared / 4) * 100)
  return `${percent}% 契合`
}

export default function MessagesPage() {
  const { user, isAuthenticated } = useAuth()
  const { showToast } = useToast()

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [messageText, setMessageText] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showNewChat, setShowNewChat] = useState(false)
  const [newChatVeinId, setNewChatVeinId] = useState('')
  const [newChatUser, setNewChatUser] = useState<{ nickname: string; avatarStyle: string; avatarEmoji: string; avatarColor: string; mbti?: string } | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isAuthenticated) return
    loadConversations()
  }, [isAuthenticated])

  const loadConversations = async () => {
    try {
      const data = await api.getConversations()
      setConversations(data)
    } catch {
      showToast('加载会话失败')
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async (conversationId: string) => {
    try {
      const data = await api.getMessages(conversationId)
      setMessages(data)
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } catch {
      showToast('加载消息失败')
    }
  }

  const handleSelectConversation = (conv: Conversation) => {
    setSelectedConversation(conv)
    loadMessages(conv.conversationId)
  }

  const handleBack = () => {
    setSelectedConversation(null)
    setMessages([])
  }

  const handleSend = async () => {
    if (!messageText.trim() || !selectedConversation) return

    try {
      setSending(true)
      const msg = await api.sendMessage(
        selectedConversation.other.veinId,
        messageText.trim()
      )
      setMessages(prev => [...prev, msg])
      setMessageText('')
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } catch (err) {
      showToast('发送失败')
    } finally {
      setSending(false)
    }
  }

  const handleSearchUser = async () => {
    if (!newChatVeinId.trim()) return
    try {
      const userData = await api.getUser(newChatVeinId.trim())
      setNewChatUser(userData)
    } catch {
      showToast('用户不存在')
      setNewChatUser(null)
    }
  }

  const handleStartChat = () => {
    if (!newChatUser) return
    const conv: Conversation = {
      conversationId: '', // Will be set by the server
      other: {
        id: '', // Will be set by the server
        veinId: newChatVeinId.trim(),
        ...newChatUser,
      },
      lastMessage: '',
      lastMessageAt: new Date().toISOString(),
      isSender: true,
    }
    setShowNewChat(false)
    setNewChatVeinId('')
    setNewChatUser(null)
    // Reload conversations to get the proper conversation
    loadConversations().then(() => {
      // Find the conversation with this user
      const found = conversations.find(c => c.other.veinId === newChatVeinId.trim())
      if (found) {
        handleSelectConversation(found)
      }
    })
  }

  // Get the other user's MBTI for compatibility display
  const getOtherMbti = (): string => {
    if (!selectedConversation) return ''
    // Try to find MBTI from the conversation's other user data
    const other = selectedConversation.other as Record<string, unknown>
    return (other.mbti as string) || ''
  }

  if (!isAuthenticated) {
    return (
      <div className="page page-transition">
        <div className="empty-state animate-fade-in-up">
          <div className="empty-icon animate-pulse-soft">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              <circle cx="9" cy="10" r="1" fill="currentColor" />
              <circle cx="12" cy="10" r="1" fill="currentColor" />
              <circle cx="15" cy="10" r="1" fill="currentColor" />
              <path d="M9 14c1 1 2 1 3 0s2-1 3 0" />
            </svg>
          </div>
          <div className="empty-title">和志同道合的人匿名交流</div>
          <div className="empty-desc" style={{ marginBottom: 20 }}>在这里，你可以安全地与他人私信聊天</div>
          <a href="/settings" className="btn-primary" style={{ textDecoration: 'none' }}>去登录</a>
        </div>
      </div>
    )
  }

  // Chat View
  if (selectedConversation) {
    const otherMbti = getOtherMbti()
    const compatibility = user?.mbti ? getMbtiCompatibility(user.mbti, otherMbti) : ''

    return (
      <div className="page page-transition" style={{ padding: 0, maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', height: '100vh', paddingTop: 'var(--navbar-height)' }}>
        {/* Chat Header */}
        <div className="chat-header">
          <button className="btn-ghost btn-sm" onClick={handleBack} style={{ border: 'none', padding: '4px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <Avatar user={selectedConversation.other} size="sm" />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{selectedConversation.other.nickname}</div>
            {compatibility && (
              <div style={{ fontSize: '0.7rem', color: 'var(--accent)' }}>
                {compatibility}
              </div>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="chat-messages" style={{ flex: 1, paddingBottom: 80 }}>
          {messages.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px 0' }}>
              <div className="empty-icon" style={{ marginBottom: 8 }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                开始你们的对话吧
              </div>
            </div>
          ) : (
            messages.map((msg) => {
              const isSent = msg.senderId === user?.id
              return (
                <div key={msg.id} style={{ display: 'flex', justifyContent: isSent ? 'flex-end' : 'flex-start' }}>
                  <div className={`chat-bubble ${isSent ? 'sent' : 'received'}`}>
                    {msg.content}
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="chat-input-bar" style={{ position: 'fixed', bottom: 'var(--bottom-nav-height)', left: 0, right: 0, maxWidth: 800, margin: '0 auto' }}>
          <input
            placeholder="输入消息..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSend() }}
          />
          <button className="btn-primary btn-sm" onClick={handleSend} disabled={sending || !messageText.trim()}>
            发送
          </button>
        </div>
      </div>
    )
  }

  // Conversation List
  return (
    <div className="page page-transition">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem' }}>私信</h2>
        <button className="btn-primary btn-sm" onClick={() => setShowNewChat(true)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          新对话
        </button>
      </div>

      {loading ? (
        Array.from({ length: 3 }).map((_, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, padding: 16, background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', marginBottom: 8 }}>
            <div className="skeleton" style={{ width: 40, height: 40, borderRadius: '50%' }} />
            <div style={{ flex: 1 }}>
              <div className="skeleton" style={{ width: '40%', height: 14, marginBottom: 8 }} />
              <div className="skeleton" style={{ width: '70%', height: 12 }} />
            </div>
          </div>
        ))
      ) : conversations.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              <line x1="9" y1="9" x2="15" y2="15" />
              <line x1="15" y1="9" x2="9" y2="15" />
            </svg>
          </div>
          <div className="empty-title">还没有私信</div>
          <div className="empty-desc">点击「新对话」开始聊天</div>
        </div>
      ) : (
        conversations.map((conv) => (
          <div
            key={conv.conversationId}
            className="post-card animate-fade-in-up"
            style={{ cursor: 'pointer' }}
            onClick={() => handleSelectConversation(conv)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Avatar user={conv.other} size="md" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{conv.other.nickname}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {formatTime(conv.lastMessageAt)}
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {conv.lastMessage}
                </div>
              </div>
            </div>
          </div>
        ))
      )}

      {/* New Chat Modal */}
      <Modal isOpen={showNewChat} onClose={() => setShowNewChat(false)} title="发起新对话">
        <div className="form-group">
          <label className="form-label">对方叶脉号</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              className="form-input"
              placeholder="输入对方的叶脉号..."
              value={newChatVeinId}
              onChange={(e) => setNewChatVeinId(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSearchUser() }}
              style={{ flex: 1 }}
            />
            <button className="btn-ghost btn-sm" onClick={handleSearchUser}>查找</button>
          </div>
        </div>
        {newChatUser && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16, background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <Avatar user={newChatUser} size="md" />
            <div>
              <div style={{ fontWeight: 500 }}>{newChatUser.nickname}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{newChatVeinId}</div>
              {newChatUser.mbti && (
                <div style={{ fontSize: '0.75rem', color: 'var(--accent)' }}>
                  {user?.mbti ? getMbtiCompatibility(user.mbti, newChatUser.mbti) : newChatUser.mbti}
                </div>
              )}
            </div>
          </div>
        )}
        <div className="modal-footer">
          <button className="btn-ghost" onClick={() => setShowNewChat(false)}>取消</button>
          <button className="btn-primary" onClick={handleStartChat} disabled={!newChatUser}>开始对话</button>
        </div>
      </Modal>
    </div>
  )
}
