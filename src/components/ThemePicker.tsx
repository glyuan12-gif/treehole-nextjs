'use client'

import React from 'react'

const THEMES = [
  {
    id: '',
    name: '月光森林',
    preview: 'linear-gradient(135deg, #f0f4f0, #5b8c6e40)',
  },
  {
    id: 'dark',
    name: '暗夜森林',
    preview: 'linear-gradient(135deg, #0d1a0d, #7aab8e40)',
  },
  {
    id: 'starry',
    name: '星空',
    preview: 'linear-gradient(135deg, #0a0e2a, #6c8cff40)',
  },
  {
    id: 'sakura',
    name: '樱花',
    preview: 'linear-gradient(135deg, #fdf2f4, #d4728c40)',
  },
  {
    id: 'sunny',
    name: '暖阳',
    preview: 'linear-gradient(135deg, #fef9ef, #e8a83840)',
  },
]

interface ThemePickerProps {
  isOpen: boolean
  onClose: () => void
}

export default function ThemePicker({ isOpen, onClose }: ThemePickerProps) {
  const currentTheme = typeof document !== 'undefined'
    ? document.documentElement.getAttribute('data-theme') || ''
    : ''

  const handleSelect = (themeId: string) => {
    if (themeId) {
      document.documentElement.setAttribute('data-theme', themeId)
    } else {
      document.documentElement.removeAttribute('data-theme')
    }
    localStorage.setItem('treehole_theme', themeId)
    onClose()
  }

  return (
    <div className={`modal ${isOpen ? 'show' : ''}`} onClick={onClose}>
      <div className="modal-overlay" />
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
        <div className="modal-header">
          <h3>选择主题</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 12 }}>
            {THEMES.map((theme) => (
              <div
                key={theme.id}
                className={`theme-card ${currentTheme === theme.id ? 'active' : ''}`}
                onClick={() => handleSelect(theme.id)}
              >
                <div
                  className="theme-preview"
                  style={{ background: theme.preview }}
                />
                <div className="theme-name">{theme.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
