'use client'

import React, { useState, useEffect } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  footer?: React.ReactNode
  maxWidth?: string
}

export default function Modal({ isOpen, onClose, title, children, footer, maxWidth }: ModalProps) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (isOpen) {
      // Delay to trigger CSS transition
      requestAnimationFrame(() => setShow(true))
    } else {
      setShow(false)
    }
  }, [isOpen])

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

  if (!isOpen && !show) return null

  return (
    <div className={`modal ${show ? 'show' : ''}`} onClick={onClose}>
      <div className="modal-overlay" />
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={maxWidth ? { maxWidth } : undefined}
      >
        {title && (
          <div className="modal-header">
            <h3>{title}</h3>
            <button className="modal-close" onClick={onClose}>
              &times;
            </button>
          </div>
        )}
        {!title && (
          <button
            className="modal-close"
            onClick={onClose}
            style={{ position: 'absolute', top: 16, right: 16, zIndex: 1 }}
          >
            &times;
          </button>
        )}
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  )
}
