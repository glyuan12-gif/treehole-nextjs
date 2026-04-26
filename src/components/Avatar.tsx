'use client'

import React from 'react'

const ROLE_LABELS: Record<string, string> = {
  student: '学生',
  worker: '打工人',
  freelancer: '自由职业',
  other: '其他',
}

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl'

function Avatar({ user, size = 'md' }: { user: { avatarStyle: string; avatarEmoji: string; avatarColor: string; nickname: string } | null; size?: AvatarSize }) {
  if (!user) {
    return (
      <div className={`avatar avatar-${size}`} style={{ background: 'var(--bg-secondary)' }}>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>?</span>
      </div>
    )
  }

  const sizeMap: Record<AvatarSize, number> = { sm: 28, md: 36, lg: 48, xl: 64 }
  const px = sizeMap[size]

  if (user.avatarStyle === 'emoji') {
    return (
      <div
        className={`avatar avatar-${size}`}
        style={{ background: user.avatarColor + '20', fontSize: px * 0.5 }}
      >
        {user.avatarEmoji}
      </div>
    )
  }

  if (user.avatarStyle === 'gradient') {
    return (
      <div
        className={`avatar avatar-${size}`}
        style={{
          background: `linear-gradient(135deg, ${user.avatarColor}, ${user.avatarColor}88)`,
          color: 'white',
          fontSize: px * 0.4,
          fontWeight: 700,
        }}
      >
        {user.nickname.charAt(0).toUpperCase()}
      </div>
    )
  }

  // initial style
  return (
    <div
      className={`avatar avatar-${size}`}
      style={{
        background: user.avatarColor,
        color: 'white',
        fontSize: px * 0.4,
        fontWeight: 700,
      }}
    >
      {user.nickname.charAt(0).toUpperCase()}
    </div>
  )
}

export { Avatar, ROLE_LABELS }
