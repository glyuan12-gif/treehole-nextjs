'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function BottomNav() {
  const pathname = usePathname()
  const { isAuthenticated } = useAuth()

  const tabs = [
    {
      href: '/',
      label: '首页',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      href: '/messages',
      label: '私信',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      ),
    },
    {
      href: '/create',
      label: '发帖',
      isCreate: true,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      ),
    },
    {
      href: '/diary',
      label: '日记',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
    },
    {
      href: '/letters',
      label: '信件',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      ),
    },
  ]

  return (
    <div className="mobile-tab-bar">
      {tabs.map((tab) => {
        const needsAuth = ['/messages', '/diary', '/letters'].includes(tab.href)
        const isDisabled = needsAuth && !isAuthenticated

        if (tab.isCreate) {
          return (
            <Link key={tab.href} href={tab.href} className="tab-create">
              {tab.icon}
            </Link>
          )
        }

        const isActive = pathname === tab.href

        return (
          <Link
            key={tab.href}
            href={isDisabled ? '/settings' : tab.href}
            className={`tab-item ${isActive ? 'active' : ''}`}
            style={isDisabled ? { opacity: 0.5 } : undefined}
            onClick={isDisabled ? (e) => { e.preventDefault(); window.location.href = '/settings' } : undefined}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </Link>
        )
      })}
    </div>
  )
}
