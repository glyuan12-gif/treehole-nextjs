'use client'

import React from 'react'
import { useAuth } from '@/contexts/AuthContext'

const ROLES = [
  {
    id: 'student',
    label: '学生',
    desc: '校园里的青春故事',
    emoji: '🎓',
  },
  {
    id: 'worker',
    label: '打工人',
    desc: '职场中的酸甜苦辣',
    emoji: '💼',
  },
  {
    id: 'freelancer',
    label: '自由职业',
    desc: '自由自在的生活',
    emoji: '🎨',
  },
  {
    id: 'other',
    label: '其他',
    desc: '每一种生活都值得记录',
    emoji: '🌟',
  },
]

interface RoleSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (role: string) => void
}

export default function RoleSelector({ isOpen, onClose, onSelect }: RoleSelectorProps) {
  return (
    <div className={`modal ${isOpen ? 'show' : ''}`} onClick={onClose}>
      <div className="modal-overlay" />
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
        <div className="modal-header">
          <h3>选择你的身份</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 20 }}>
            选择一个最符合你的身份标签，这将显示在你的帖子旁边
          </p>
          <div className="option-group">
            {ROLES.map((role) => (
              <div
                key={role.id}
                className="option-item"
                onClick={() => {
                  onSelect(role.id)
                  onClose()
                }}
              >
                <span style={{ fontSize: '1.5rem' }}>{role.emoji}</span>
                <div>
                  <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{role.label}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{role.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
