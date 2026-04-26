'use client'

import React, { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { api, type Post } from '@/lib/api'
import PostCard from '@/components/PostCard'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import ThemePicker from '@/components/ThemePicker'
import RoleSelector from '@/components/RoleSelector'
import { CHANNELS, MBTI_TYPES } from '@/lib/constants'

function HomeContent() {
  const { user, isAuthenticated, isLoading: authLoading, updateProfile } = useAuth()
  const { showToast } = useToast()
  const searchParams = useSearchParams()
  const router = useRouter()

  const searchQuery = searchParams.get('search') || ''

  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [channel, setChannel] = useState('')
  const [mbti, setMbti] = useState('')
  const [sort, setSort] = useState('latest')
  const [heroCollapsed, setHeroCollapsed] = useState(false)
  const [showThemePicker, setShowThemePicker] = useState(false)
  const [showRoleSelector, setShowRoleSelector] = useState(false)

  const loadPosts = useCallback(async (pageNum: number, append = false) => {
    try {
      setLoading(true)
      const params: Record<string, string> = {
        page: String(pageNum),
        limit: '20',
        sort,
      }
      if (channel) params.channel = channel
      if (mbti) params.mbti = mbti
      if (searchQuery) params.search = searchQuery

      const data = await api.getPosts(params)
      if (append) {
        setPosts(prev => [...prev, ...data.posts])
      } else {
        setPosts(data.posts)
      }
      setTotal(data.total)
      setHasMore(data.posts.length >= 20 && data.posts.length < data.total)
    } catch (err) {
      showToast('加载帖子失败')
    } finally {
      setLoading(false)
    }
  }, [channel, mbti, sort, searchQuery, showToast])

  useEffect(() => {
    setPage(1)
    loadPosts(1, false)
  }, [channel, mbti, sort, searchQuery, loadPosts])

  const handleLoadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    loadPosts(nextPage, true)
  }

  const handleClearSearch = () => {
    router.push('/')
  }

  const handleRoleSelect = async (role: string) => {
    if (!isAuthenticated) {
      showToast('请先登录')
      return
    }
    const success = await updateProfile({ role })
    if (success) {
      showToast('身份已更新')
    } else {
      showToast('更新失败')
    }
  }

  // Initialize theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('treehole_theme')
    if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme)
    }
  }, [])

  return (
    <div className="page page-transition">
      {/* Hero Section */}
      <div className="home-header" style={heroCollapsed ? { padding: '20px 20px 16px' } : undefined}>
        {!heroCollapsed ? (
          <>
            <h1 className="hero-title">树洞</h1>
            <p className="hero-subtitle">在这里，做最真实的自己</p>
            <div className="hero-actions">
              <button className="btn-primary" onClick={() => {
                if (isAuthenticated) {
                  window.location.href = '/create'
                } else {
                  setShowRoleSelector(true)
                }
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                开始倾诉
              </button>
              <Link href="/mbti" className="btn-ghost" style={{ textDecoration: 'none' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
                  <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
                </svg>
                MBTI 测试
              </Link>
              <button className="btn-ghost" onClick={() => setShowThemePicker(true)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
                切换主题
              </button>
            </div>
            <button className="hero-collapse-btn" onClick={() => setHeroCollapsed(true)}>
              收起
            </button>
          </>
        ) : (
          <button className="hero-expand-btn" onClick={() => setHeroCollapsed(false)}>
            展开
          </button>
        )}
      </div>

      {/* Search Result Banner */}
      {searchQuery && (
        <div className="search-result-banner">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              搜索结果: <strong style={{ color: 'var(--text-primary)' }}>{searchQuery}</strong>
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              (共 {total} 条)
            </span>
          </div>
          <button
            className="btn-ghost btn-sm"
            onClick={handleClearSearch}
            style={{ fontSize: '0.8rem' }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            清除搜索
          </button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="filter-scroll">
          {CHANNELS.map((ch) => (
            <button
              key={ch.id}
              className={`filter-chip ${channel === ch.id ? 'active' : ''}`}
              onClick={() => setChannel(ch.id)}
            >
              {ch.label}
            </button>
          ))}
          <div style={{ width: 1, background: 'var(--border)', margin: '0 4px', flexShrink: 0 }} />
          {MBTI_TYPES.map((type) => (
            <button
              key={type}
              className={`filter-chip ${mbti === type ? 'active' : ''}`}
              onClick={() => setMbti(mbti === type ? '' : type)}
              style={{ fontSize: '0.7rem' }}
            >
              {type}
            </button>
          ))}
          <div style={{ width: 1, background: 'var(--border)', margin: '0 4px', flexShrink: 0 }} />
          <button
            className={`filter-chip ${sort === 'latest' ? 'active' : ''}`}
            onClick={() => setSort('latest')}
          >
            最新
          </button>
          <button
            className={`filter-chip ${sort === 'hot' ? 'active' : ''}`}
            onClick={() => setSort('hot')}
          >
            最热
          </button>
        </div>
      </div>

      {/* Post List */}
      <div style={{ marginTop: 16 }}>
        {loading && posts.length === 0 ? (
          // Skeleton loading
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="post-card" style={{ cursor: 'default' }}>
              <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                <div className="skeleton" style={{ width: 36, height: 36, borderRadius: '50%' }} />
                <div style={{ flex: 1 }}>
                  <div className="skeleton" style={{ width: '40%', height: 14, marginBottom: 6 }} />
                  <div className="skeleton" style={{ width: '25%', height: 12 }} />
                </div>
              </div>
              <div className="skeleton" style={{ width: '70%', height: 18, marginBottom: 8 }} />
              <div className="skeleton" style={{ width: '100%', height: 14, marginBottom: 4 }} />
              <div className="skeleton" style={{ width: '90%', height: 14, marginBottom: 12 }} />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div className="skeleton" style={{ width: 80, height: 24, borderRadius: 12 }} />
                <div className="skeleton" style={{ width: 60, height: 14 }} />
              </div>
            </div>
          ))
        ) : posts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              {searchQuery ? (
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                  <line x1="8" y1="11" x2="14" y2="11" />
                </svg>
              ) : (
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              )}
            </div>
            <div className="empty-title">{searchQuery ? '没有找到相关帖子' : '还没有帖子'}</div>
            <div className="empty-desc">{searchQuery ? '试试换个关键词搜索吧' : '成为第一个倾诉者吧'}</div>
            {searchQuery && (
              <button className="btn-ghost btn-sm" onClick={handleClearSearch} style={{ marginTop: 16 }}>
                查看全部帖子
              </button>
            )}
          </div>
        ) : (
          <>
            {posts.map((post, index) => (
              <div key={post.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 0.06}s` }}>
                <PostCard post={post} />
              </div>
            ))}

            {hasMore && (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <button
                  className="btn-ghost"
                  onClick={handleLoadMore}
                  disabled={loading}
                >
                  {loading ? '加载中...' : '加载更多'}
                </button>
              </div>
            )}

            {!hasMore && posts.length > 0 && (
              <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                已经到底了
              </div>
            )}
          </>
        )}
      </div>

      {/* Theme Picker */}
      <ThemePicker isOpen={showThemePicker} onClose={() => setShowThemePicker(false)} />

      {/* Role Selector */}
      <RoleSelector
        isOpen={showRoleSelector}
        onClose={() => setShowRoleSelector(false)}
        onSelect={handleRoleSelect}
      />
    </div>
  )
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="page">
        <div style={{ padding: '40px 0' }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="post-card" style={{ cursor: 'default', marginBottom: 16 }}>
              <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                <div className="skeleton" style={{ width: 36, height: 36, borderRadius: '50%' }} />
                <div style={{ flex: 1 }}>
                  <div className="skeleton" style={{ width: '40%', height: 14, marginBottom: 6 }} />
                  <div className="skeleton" style={{ width: '25%', height: 12 }} />
                </div>
              </div>
              <div className="skeleton" style={{ width: '70%', height: 18, marginBottom: 8 }} />
              <div className="skeleton" style={{ width: '100%', height: 14, marginBottom: 4 }} />
              <div className="skeleton" style={{ width: '90%', height: 14 }} />
            </div>
          ))}
        </div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  )
}
