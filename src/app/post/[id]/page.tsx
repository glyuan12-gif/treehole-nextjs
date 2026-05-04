'use client'

export const dynamic = 'force-dynamic'

import React, { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { api, type Post, type Comment } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { Avatar } from '@/components/Avatar'
import Modal from '@/components/Modal'
import { CHANNEL_LABELS, CHANNEL_COLORS, MOOD_EMOJIS } from '@/lib/constants'
import { formatTime } from '@/components/PostCard'

const REACTIONS = [
  { type: 'touched', label: '感动', emoji: '🥺' },
  { type: 'empathy', label: '共情', emoji: '💜' },
  { type: 'resonate', label: '共鸣', emoji: '🫂' },
  { type: 'agree', label: '赞同', emoji: '👍' },
  { type: 'think', label: '思考', emoji: '🤔' },
  { type: 'warm', label: '温暖', emoji: '☀️' },
]

export default function PostDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const { showToast } = useToast()

  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [commentText, setCommentText] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [userReactions, setUserReactions] = useState<Set<string>>(new Set())
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [reportDetail, setReportDetail] = useState('')
  const [showReactions, setShowReactions] = useState(false)

  const commentsEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const loadPost = async () => {
      try {
        const id = params.id as string
        const [postData, commentsData] = await Promise.all([
          api.getPost(id),
          api.getComments(id),
        ])
        setPost(postData)
        setComments(commentsData)
        setLikeCount(postData.likeCount || 0)
      } catch (err) {
        showToast('加载帖子失败')
      } finally {
        setLoading(false)
      }
    }
    loadPost()
  }, [params.id, showToast])

  const handleLike = async () => {
    if (!isAuthenticated) {
      showToast('请先登录')
      return
    }
    try {
      const result = await api.likePost(post!.id)
      setLiked(result.liked)
      setLikeCount(prev => result.liked ? prev + 1 : prev - 1)
    } catch {
      showToast('操作失败')
    }
  }

  const handleReaction = async (type: string) => {
    if (!isAuthenticated) {
      showToast('请先登录')
      return
    }
    try {
      const result = await api.addReaction(post!.id, type)
      setUserReactions(prev => {
        const next = new Set(prev)
        if (result.reacted) {
          next.add(type)
        } else {
          next.delete(type)
        }
        return next
      })
    } catch {
      showToast('操作失败')
    }
  }

  const handleComment = async () => {
    if (!commentText.trim()) {
      showToast('请输入评论内容')
      return
    }
    if (!isAuthenticated) {
      showToast('请先登录')
      return
    }

    try {
      setSubmittingComment(true)
      const newComment = await api.addComment(post!.id, commentText.trim())
      setComments(prev => [...prev, newComment])
      setCommentText('')
      setPost(prev => prev ? { ...prev, commentCount: prev.commentCount + 1 } : prev)
      setTimeout(() => {
        commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } catch {
      showToast('评论失败')
    } finally {
      setSubmittingComment(false)
    }
  }

  const handleReport = async () => {
    if (!reportReason.trim()) {
      showToast('请输入举报原因')
      return
    }
    try {
      await api.report({
        postId: post!.id,
        reason: reportReason,
        detail: reportDetail,
      })
      showToast('举报已提交')
      setShowReportModal(false)
      setReportReason('')
      setReportDetail('')
    } catch {
      showToast('举报失败')
    }
  }

  const handleDelete = async () => {
    if (!confirm('确定要删除这篇帖子吗？')) return
    try {
      await api.deletePost(post!.id)
      showToast('已删除')
      router.push('/')
    } catch {
      showToast('删除失败')
    }
  }

  if (loading) {
    return (
      <div className="page page-transition">
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <div className="skeleton" style={{ width: '60%', height: 24, marginBottom: 16 }} />
          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            <div className="skeleton" style={{ width: 36, height: 36, borderRadius: '50%' }} />
            <div className="skeleton" style={{ width: 120, height: 16 }} />
          </div>
          <div className="skeleton" style={{ width: '100%', height: 16, marginBottom: 8 }} />
          <div className="skeleton" style={{ width: '100%', height: 16, marginBottom: 8 }} />
          <div className="skeleton" style={{ width: '80%', height: 16 }} />
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="page page-transition">
        <div className="empty-state">
          <div className="empty-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <div className="empty-title">帖子不存在</div>
          <div className="empty-desc">该帖子可能已被删除</div>
          <button className="btn-ghost" onClick={() => router.back()} style={{ marginTop: 16 }}>返回</button>
        </div>
      </div>
    )
  }

  let tags: string[] = []
  try {
    tags = typeof post.tags === 'string' ? JSON.parse(post.tags) : post.tags
  } catch {
    tags = []
  }

  const isAuthor = user && post.authorId === user.id

  return (
    <div className="page page-transition">
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        {/* Back button */}
        <button
          className="btn-ghost btn-sm"
          onClick={() => router.back()}
          style={{ marginBottom: 16 }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          返回
        </button>

        {/* Post Content */}
        <div className="glass-card" style={{ padding: 28, marginBottom: 24 }}>
          {/* Author */}
          <div className="post-card-header">
            <Avatar user={post.author} size="lg" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 500, fontSize: '0.95rem' }}>{post.author.nickname}</span>
                {post.author.mbti && <span className="mbti-badge">{post.author.mbti}</span>}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
                {formatTime(post.createdAt)}
                {post.showVeinId && ` · ${post.author.veinId}`}
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '16px 0 12px', lineHeight: 1.5, letterSpacing: '0.01em' }}>
            {post.title}
          </h1>

          {/* Content */}
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.9, whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxWidth: '100%' }}>
            {post.content}
          </div>

          {/* Image */}
          {post.image && (
            <div style={{ marginTop: 16, borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              <img src={post.image} alt="" style={{ width: '100%', maxHeight: 400, objectFit: 'cover' }} />
            </div>
          )}

          {/* Tags & Mood */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 16, alignItems: 'center' }}>
            <span
              className="post-tag"
              style={{
                borderColor: CHANNEL_COLORS[post.channel] + '40',
                color: CHANNEL_COLORS[post.channel],
              }}
            >
              {CHANNEL_LABELS[post.channel] || post.channel}
            </span>
            {post.mood && MOOD_EMOJIS[post.mood] && (
              <span className="mood-badge" style={{ background: 'var(--bg-glass)' }}>
                {MOOD_EMOJIS[post.mood]}
              </span>
            )}
            {tags.map((tag) => (
              <span key={tag} className="post-tag">#{tag}</span>
            ))}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
            <button
              className="btn-ghost btn-sm"
              onClick={handleLike}
              style={liked ? { color: 'var(--accent)', borderColor: 'var(--accent)' } : undefined}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              {likeCount}
            </button>

            <div style={{ position: 'relative' }}>
              <button
                className="btn-ghost btn-sm"
                onClick={() => setShowReactions(!showReactions)}
              >
                😊 情绪反应
              </button>
              {showReactions && (
                <div style={{
                  position: 'absolute', top: '100%', left: 0, marginTop: 8,
                  background: 'var(--bg-modal)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)', padding: 8,
                  display: 'flex', gap: 6, flexWrap: 'wrap', width: 240,
                  boxShadow: 'var(--shadow-lg)', zIndex: 10,
                }}>
                  {REACTIONS.map((r) => (
                    <button
                      key={r.type}
                      className={`filter-chip ${userReactions.has(r.type) ? 'active' : ''}`}
                      onClick={() => handleReaction(r.type)}
                      style={{ fontSize: '0.75rem', padding: '4px 10px', transition: 'all 0.2s' }}
                    >
                      {r.emoji} {r.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div style={{ flex: 1 }} />

            {isAuthenticated && (
              <>
                {!isAuthor && (
                  <button className="btn-ghost btn-sm" onClick={() => setShowReportModal(true)} style={{ color: 'var(--text-muted)' }}>
                    举报
                  </button>
                )}
                {isAuthor && (
                  <button className="btn-ghost btn-sm" onClick={handleDelete} style={{ color: '#e74c3c' }}>
                    删除
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Comments Section */}
        <div style={{ marginBottom: 100 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16, color: 'var(--text-secondary)', paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
            评论 ({comments.length})
          </h3>

          {comments.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px 0' }}>
              <div className="empty-icon" style={{ marginBottom: 8 }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                还没有评论，来说点什么吧
              </div>
            </div>
          ) : (
            <div>
              {comments.map((comment) => (
                <div key={comment.id} className="comment-item">
                  <Avatar user={comment.author} size="sm" />
                  <div className="comment-body">
                    <div className="comment-author">{comment.author.nickname}</div>
                    <div className="comment-text">{comment.content}</div>
                    <div className="comment-time">{formatTime(comment.createdAt)}</div>
                  </div>
                </div>
              ))}
              <div ref={commentsEndRef} />
            </div>
          )}
        </div>

        {/* Comment Input (Fixed bottom) */}
        <div style={{
          position: 'fixed', bottom: 'var(--bottom-nav-height)', left: 0, right: 0,
          background: 'var(--bg-navbar)', backdropFilter: 'blur(20px)',
          borderTop: '1px solid var(--border)', padding: '12px 20px',
          zIndex: 50, display: 'flex', gap: 8, alignItems: 'center',
          maxWidth: 640, margin: '0 auto',
        }}>
          {isAuthenticated ? (
            <>
              <input
                className="form-input"
                placeholder="写下你的评论..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleComment() }}
                style={{ flex: 1 }}
              />
              <button
                className="btn-primary btn-sm"
                onClick={handleComment}
                disabled={submittingComment || !commentText.trim()}
              >
                {submittingComment ? '...' : '发送'}
              </button>
            </>
          ) : (
            <div style={{ flex: 1, textAlign: 'center', padding: '4px 0' }}>
              <Link href="/settings" style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: '0.9rem' }}>
                登录后可以评论
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Report Modal */}
      <Modal isOpen={showReportModal} onClose={() => setShowReportModal(false)} title="举报帖子">
        <div className="form-group">
          <label className="form-label">举报原因</label>
          <input
            className="form-input"
            placeholder="请简要描述举报原因..."
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">详细说明（可选）</label>
          <textarea
            className="form-textarea"
            placeholder="提供更多细节..."
            value={reportDetail}
            onChange={(e) => setReportDetail(e.target.value)}
            rows={3}
          />
        </div>
        <div className="modal-footer">
          <button className="btn-ghost" onClick={() => setShowReportModal(false)}>取消</button>
          <button className="btn-primary" onClick={handleReport}>提交举报</button>
        </div>
      </Modal>
    </div>
  )
}
