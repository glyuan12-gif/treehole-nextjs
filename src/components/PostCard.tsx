'use client'

import React from 'react'
import Link from 'next/link'
import { Avatar } from './Avatar'
import type { Post } from '@/lib/api'
import { CHANNEL_LABELS, CHANNEL_COLORS, MOOD_EMOJIS } from '@/lib/constants'

function formatTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`

  return new Intl.DateTimeFormat('zh-CN', {
    month: 'short',
    day: 'numeric',
  }).format(date)
}

interface PostCardProps {
  post: Post
}

export default function PostCard({ post }: PostCardProps) {
  let tags: string[] = []
  try {
    tags = typeof post.tags === 'string' ? JSON.parse(post.tags) : post.tags
  } catch {
    tags = []
  }

  return (
    <Link href={`/post/${post.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className="post-card animate-fade-in-up">
        <div className="post-card-header">
          <Avatar user={post.author} size="md" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 500, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                {post.author.nickname}
              </span>
              {post.author.mbti && (
                <span className="mbti-badge">{post.author.mbti}</span>
              )}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
              {formatTime(post.createdAt)}
            </div>
          </div>
        </div>

        <h3 className="post-card-title">{post.title}</h3>
        <p className="post-card-content">{post.content}</p>

        {post.image && (
          <div style={{ marginBottom: 12, borderRadius: 'var(--radius-md)', overflow: 'hidden', maxHeight: 200 }}>
            <img
              src={post.image}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        )}

        <div className="post-card-footer">
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
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
            {tags.slice(0, 3).map((tag) => (
              <span key={tag} className="post-tag">#{tag}</span>
            ))}
          </div>

          <div className="post-stats">
            <span className="post-stat">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              {post.likeCount || 0}
            </span>
            <span className="post-stat">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              {post.commentCount || 0}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

export { CHANNEL_LABELS, CHANNEL_COLORS, MOOD_EMOJIS, formatTime }
