'use client'

import React, { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { MBTI_DESC, MBTI_DETAILED } from '@/lib/constants'

// ===== Types =====
interface QuestionOption {
  text: string
  value: string
}

interface Question {
  id: number
  dimension: string
  text: string
  a: QuestionOption
  b: QuestionOption
}

type Phase = 'start' | 'quiz' | 'result'

interface DimensionResult {
  left: string  // e.g. 'E'
  right: string // e.g. 'I'
  leftCount: number
  rightCount: number
  leftLabel: string
  rightLabel: string
  percentage: number // percentage for the dominant side
}

// ===== Questions =====
const questions: Question[] = [
  // E/I dimension (4 questions)
  { id: 1, dimension: 'EI', text: '周末到了，你更想...', a: { text: '约朋友出去聚会', value: 'E' }, b: { text: '在家看书/追剧/打游戏', value: 'I' } },
  { id: 2, dimension: 'EI', text: '在一个陌生的社交场合，你通常会...', a: { text: '主动认识新朋友', value: 'E' }, b: { text: '等别人来和你搭话', value: 'I' } },
  { id: 3, dimension: 'EI', text: '长时间独处后，你的感受是...', a: { text: '有点闷，想找人聊天', value: 'E' }, b: { text: '很享受，感觉电量充满', value: 'I' } },
  { id: 4, dimension: 'EI', text: '遇到问题时，你更倾向于...', a: { text: '和别人讨论解决', value: 'E' }, b: { text: '自己先想清楚再说', value: 'I' } },

  // S/N dimension (4 questions)
  { id: 5, dimension: 'SN', text: '你更关注...', a: { text: '眼前的事实和细节', value: 'S' }, b: { text: '未来的可能性和想象', value: 'N' } },
  { id: 6, dimension: 'SN', text: '学习新东西时，你更喜欢...', a: { text: '按步骤来，循序渐进', value: 'S' }, b: { text: '先了解全貌，再深入细节', value: 'N' } },
  { id: 7, dimension: 'SN', text: '你更信赖...', a: { text: '亲身经历和经验', value: 'S' }, b: { text: '直觉和第六感', value: 'N' } },
  { id: 8, dimension: 'SN', text: '描述一件事时，你更倾向于...', a: { text: '具体、准确地描述细节', value: 'S' }, b: { text: '用比喻和联想来表达', value: 'N' } },

  // T/F dimension (4 questions)
  { id: 9, dimension: 'TF', text: '做决定时，你更看重...', a: { text: '逻辑分析和客观事实', value: 'T' }, b: { text: '个人感受和他人影响', value: 'F' } },
  { id: 10, dimension: 'TF', text: '朋友找你倾诉烦恼，你第一反应是...', a: { text: '帮他分析问题，给建议', value: 'T' }, b: { text: '先安慰他，让他感觉好点', value: 'F' } },
  { id: 11, dimension: 'TF', text: '你认为更重要的是...', a: { text: '公平和正义', value: 'T' }, b: { text: '和谐与善意', value: 'F' } },
  { id: 12, dimension: 'TF', text: '被批评时，你更可能...', a: { text: '理性思考批评是否合理', value: 'T' }, b: { text: '感到受伤或沮丧', value: 'F' } },

  // J/P dimension (4 questions)
  { id: 13, dimension: 'JP', text: '对于计划，你的态度是...', a: { text: '提前规划，按计划执行', value: 'J' }, b: { text: '随机应变，保持灵活', value: 'P' } },
  { id: 14, dimension: 'JP', text: '你的房间/桌面通常是...', a: { text: '整洁有序，东西各有其位', value: 'J' }, b: { text: '有点乱但我知道东西在哪', value: 'P' } },
  { id: 15, dimension: 'JP', text: '面对deadline，你通常会...', a: { text: '提前完成，留出检查时间', value: 'J' }, b: { text: '在最后一刻爆发生产力', value: 'P' } },
  { id: 16, dimension: 'JP', text: '旅行时，你更喜欢...', a: { text: '提前做好详细攻略', value: 'J' }, b: { text: '到了再说，随心所欲', value: 'P' } },
]

const DIMENSION_LABELS: Record<string, { left: string; right: string; leftLabel: string; rightLabel: string }> = {
  EI: { left: 'E', right: 'I', leftLabel: '外向 (E)', rightLabel: '内向 (I)' },
  SN: { left: 'S', right: 'N', leftLabel: '感觉 (S)', rightLabel: '直觉 (N)' },
  TF: { left: 'T', right: 'F', leftLabel: '思考 (T)', rightLabel: '情感 (F)' },
  JP: { left: 'J', right: 'P', leftLabel: '判断 (J)', rightLabel: '知觉 (P)' },
}

const DIMENSION_DESCRIPTIONS: Record<string, { left: string; right: string }> = {
  EI: { left: '能量来源：从与人互动中获取', right: '能量来源：从独处和内省中获取' },
  SN: { left: '信息获取：关注具体事实和细节', right: '信息获取：关注整体模式和可能性' },
  TF: { left: '决策方式：基于逻辑和客观分析', right: '决策方式：基于价值观和人际和谐' },
  JP: { left: '生活方式：有计划、有条理', right: '生活方式：灵活、随性' },
}

// ===== Helper: Calculate MBTI Result =====
function calculateResult(answers: Record<number, string>): { type: string; dimensions: DimensionResult[] } {
  const counts: Record<string, Record<string, number>> = {
    EI: { E: 0, I: 0 },
    SN: { S: 0, N: 0 },
    TF: { T: 0, F: 0 },
    JP: { J: 0, P: 0 },
  }

  for (const [qId, value] of Object.entries(answers)) {
    const question = questions.find(q => q.id === Number(qId))
    if (question) {
      counts[question.dimension][value]++
    }
  }

  const dimensions: DimensionResult[] = []
  let mbtiType = ''

  for (const dim of ['EI', 'SN', 'TF', 'JP']) {
    const labels = DIMENSION_LABELS[dim]
    const leftCount = counts[dim][labels.left]
    const rightCount = counts[dim][labels.right]
    const total = leftCount + rightCount
    const dominant = leftCount >= rightCount ? labels.left : labels.right
    const percentage = total > 0 ? Math.round((Math.max(leftCount, rightCount) / total) * 100) : 50

    dimensions.push({
      left: labels.left,
      right: labels.right,
      leftCount,
      rightCount,
      leftLabel: labels.leftLabel,
      rightLabel: labels.rightLabel,
      percentage,
    })

    mbtiType += dominant
  }

  return { type: mbtiType, dimensions }
}

// ===== Start Phase =====
function StartPhase({ onStart }: { onStart: () => void }) {
  const router = useRouter()

  return (
    <div style={{ animation: 'fadeInUp 0.5s ease-out both' }}>
      <div className="glass-card" style={{ padding: 32, textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: '3rem', marginBottom: 16 }}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block' }}>
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
            <path d="M2 12h20" />
          </svg>
        </div>
        <h2 className="gradient-text" style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', marginBottom: 12 }}>
          MBTI 人格测试
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.8, marginBottom: 8 }}>
          MBTI（迈尔斯-布里格斯类型指标）通过四个维度来描述人的性格特征，
          帮助你更好地了解自己的思维方式、决策风格和社交偏好。
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 20, marginBottom: 24, textAlign: 'left' }}>
          {[
            { dim: 'E/I', desc: '外向 vs 内向' },
            { dim: 'S/N', desc: '感觉 vs 直觉' },
            { dim: 'T/F', desc: '思考 vs 情感' },
            { dim: 'J/P', desc: '判断 vs 知觉' },
          ].map(item => (
            <div
              key={item.dim}
              style={{
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--accent-bg)',
                border: '1px solid var(--border)',
              }}
            >
              <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--accent)' }}>{item.dim}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.desc}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 24 }}>
          共 16 道题，大约需要 3-5 分钟
        </div>
        <button className="btn-primary btn-lg" onClick={onStart} style={{ width: '100%' }}>
          开始测试
        </button>
      </div>

      <div style={{ textAlign: 'center' }}>
        <button
          className="btn-ghost"
          onClick={() => router.push('/settings')}
          style={{ fontSize: '0.85rem' }}
        >
          已知自己的类型？去手动选择
        </button>
      </div>
    </div>
  )
}

// ===== Quiz Phase =====
function QuizPhase({
  answers,
  onAnswer,
}: {
  answers: Record<number, string>
  onAnswer: (questionId: number, value: string) => void
}) {
  const currentQuestionIndex = Object.keys(answers).length
  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex) / questions.length) * 100

  if (!currentQuestion) return null

  return (
    <div style={{ animation: 'fadeInUp 0.3s ease-out both' }}>
      {/* Progress bar */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            第 {currentQuestionIndex + 1} / {questions.length} 题
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 600 }}>
            {Math.round(progress)}%
          </span>
        </div>
        <div
          style={{
            width: '100%',
            height: 6,
            borderRadius: 'var(--radius-full)',
            background: 'var(--bg-secondary)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: '100%',
              borderRadius: 'var(--radius-full)',
              background: 'linear-gradient(90deg, var(--accent), var(--accent-light))',
              transition: 'width 0.4s ease',
            }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="glass-card" style={{ padding: 28, marginBottom: 20 }}>
        <div style={{
          fontSize: '0.75rem',
          color: 'var(--accent)',
          fontWeight: 600,
          marginBottom: 12,
          textTransform: 'uppercase',
          letterSpacing: 1,
        }}>
          {DIMENSION_LABELS[currentQuestion.dimension].leftLabel} / {DIMENSION_LABELS[currentQuestion.dimension].rightLabel}
        </div>
        <h3 style={{
          fontSize: '1.15rem',
          fontWeight: 600,
          color: 'var(--text-primary)',
          lineHeight: 1.6,
          marginBottom: 24,
        }}>
          {currentQuestion.text}
        </h3>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { key: 'a' as const, option: currentQuestion.a, label: 'A' },
            { key: 'b' as const, option: currentQuestion.b, label: 'B' },
          ].map(({ key, option, label }) => (
            <button
              key={key}
              onClick={() => onAnswer(currentQuestion.id, option.value)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                width: '100%',
                padding: '16px 20px',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)',
                background: 'var(--bg-glass)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                textAlign: 'left',
                fontFamily: 'var(--font-body)',
                fontSize: '0.95rem',
                lineHeight: 1.5,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--accent-bg-hover)'
                e.currentTarget.style.borderColor = 'var(--accent)'
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = 'var(--shadow-md)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--bg-glass)'
                e.currentTarget.style.borderColor = 'var(--border)'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <span style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'var(--accent-bg)',
                color: 'var(--accent)',
                fontWeight: 700,
                fontSize: '0.85rem',
                flexShrink: 0,
                fontFamily: 'var(--font-ui)',
              }}>
                {label}
              </span>
              <span>{option.text}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ===== Result Phase =====
function ResultPhase({
  result,
  onReset,
}: {
  result: { type: string; dimensions: DimensionResult[] }
  onReset: () => void
}) {
  const { user, updateProfile } = useAuth()
  const { showToast } = useToast()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const detailed = MBTI_DETAILED[result.type]
  const desc = MBTI_DESC[result.type]
  const isAlreadySet = user?.mbti === result.type

  const handleSetMbti = async () => {
    try {
      setSaving(true)
      const success = await updateProfile({ mbti: result.type })
      if (success) {
        setSaved(true)
        showToast(`已将你的 MBTI 设为 ${result.type}`)
      } else {
        showToast('设置失败，请重试')
      }
    } catch {
      showToast('设置失败')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ animation: 'fadeInUp 0.5s ease-out both' }}>
      {/* MBTI Type Display */}
      <div className="glass-card" style={{ padding: 36, textAlign: 'center', marginBottom: 20 }}>
        <div style={{
          fontSize: '3.5rem',
          fontWeight: 700,
          letterSpacing: 8,
          fontFamily: 'var(--font-display)',
          marginBottom: 8,
          animation: 'fadeInUp 0.5s ease-out 0.2s both',
        }}>
          <span className="gradient-text">{result.type}</span>
        </div>
        <div style={{
          fontSize: '1rem',
          color: 'var(--text-secondary)',
          marginBottom: 20,
          animation: 'fadeInUp 0.5s ease-out 0.3s both',
        }}>
          {desc}
        </div>

        {/* Traits */}
        {detailed && (
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            justifyContent: 'center',
            marginBottom: 20,
            animation: 'fadeInUp 0.5s ease-out 0.4s both',
          }}>
            {detailed.traits.map(trait => (
              <span
                key={trait}
                style={{
                  padding: '4px 14px',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--accent-bg)',
                  color: 'var(--accent)',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  fontFamily: 'var(--font-ui)',
                  border: '1px solid var(--border)',
                }}
              >
                {trait}
              </span>
            ))}
          </div>
        )}

        {/* Description */}
        {detailed && (
          <p style={{
            fontSize: '0.9rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.8,
            textAlign: 'left',
            animation: 'fadeInUp 0.5s ease-out 0.5s both',
          }}>
            {detailed.description}
          </p>
        )}
      </div>

      {/* Dimension Analysis */}
      <div className="glass-card" style={{ padding: 24, marginBottom: 20 }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 16 }}>维度分析</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {result.dimensions.map((dim, index) => {
            const dominant = dim.leftCount >= dim.rightCount ? dim.left : dim.right
            const dominantLabel = dim.leftCount >= dim.rightCount ? dim.leftLabel : dim.rightLabel
            const dominantCount = Math.max(dim.leftCount, dim.rightCount)
            const totalCount = dim.leftCount + dim.rightCount
            const dimDesc = DIMENSION_DESCRIPTIONS[
              Object.keys(DIMENSION_LABELS).find(k =>
                DIMENSION_LABELS[k].left === dim.left && DIMENSION_LABELS[k].right === dim.right
              ) || ''
            ]

            return (
              <div
                key={index}
                style={{
                  padding: 16,
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-glass)',
                  border: '1px solid var(--border)',
                  animation: `fadeInUp 0.4s ease-out ${0.6 + index * 0.1}s both`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {dominantLabel}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 600 }}>
                    {dim.percentage}%
                  </span>
                </div>

                {/* Bar */}
                <div style={{
                  display: 'flex',
                  height: 8,
                  borderRadius: 'var(--radius-full)',
                  overflow: 'hidden',
                  marginBottom: 8,
                  background: 'var(--bg-secondary)',
                }}>
                  <div style={{
                    width: `${(dim.leftCount / totalCount) * 100}%`,
                    background: dim.leftCount >= dim.rightCount ? 'var(--accent)' : 'var(--border-strong)',
                    borderRadius: 'var(--radius-full)',
                    transition: 'width 0.6s ease',
                  }} />
                  <div style={{
                    width: `${(dim.rightCount / totalCount) * 100}%`,
                    background: dim.rightCount > dim.leftCount ? 'var(--accent)' : 'var(--border-strong)',
                    borderRadius: 'var(--radius-full)',
                    transition: 'width 0.6s ease',
                  }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>
                  <span>{dim.leftLabel} ({dim.leftCount})</span>
                  <span>{dim.rightLabel} ({dim.rightCount})</span>
                </div>

                {dimDesc && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    {dominant === dim.left ? dimDesc.left : dimDesc.right}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 40 }}>
        {isAlreadySet ? (
          <div style={{
            textAlign: 'center',
            padding: '12px 20px',
            borderRadius: 'var(--radius-pill)',
            background: 'var(--accent-bg)',
            color: 'var(--accent)',
            fontSize: '0.9rem',
            fontWeight: 500,
            fontFamily: 'var(--font-ui)',
          }}>
            你的 MBTI 已设置为 {result.type}
          </div>
        ) : saved ? (
          <div style={{
            textAlign: 'center',
            padding: '12px 20px',
            borderRadius: 'var(--radius-pill)',
            background: 'var(--accent-bg)',
            color: 'var(--accent)',
            fontSize: '0.9rem',
            fontWeight: 500,
            fontFamily: 'var(--font-ui)',
          }}>
            已设置成功
          </div>
        ) : (
          <button
            className="btn-primary btn-lg"
            onClick={handleSetMbti}
            disabled={saving}
            style={{ width: '100%' }}
          >
            {saving ? '设置中...' : `设为我的 MBTI`}
          </button>
        )}

        <button
          className="btn-ghost"
          onClick={onReset}
          style={{ width: '100%' }}
        >
          重新测试
        </button>

        <button
          className="btn-ghost"
          onClick={() => router.push('/settings')}
          style={{ width: '100%' }}
        >
          返回设置
        </button>
      </div>
    </div>
  )
}

// ===== Main Page =====
export default function MbtiTestPage() {
  const [phase, setPhase] = useState<Phase>('start')
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [result, setResult] = useState<{ type: string; dimensions: DimensionResult[] } | null>(null)

  const handleStart = useCallback(() => {
    setAnswers({})
    setResult(null)
    setPhase('quiz')
  }, [])

  const handleAnswer = useCallback((questionId: number, value: string) => {
    const newAnswers = { ...answers, [questionId]: value }
    setAnswers(newAnswers)

    // Check if all questions answered
    if (Object.keys(newAnswers).length === questions.length) {
      // Small delay before showing result
      setTimeout(() => {
        const calcResult = calculateResult(newAnswers)
        setResult(calcResult)
        setPhase('result')
      }, 400)
    }
  }, [answers])

  const handleReset = useCallback(() => {
    setAnswers({})
    setResult(null)
    setPhase('start')
  }, [])

  return (
    <div className="page page-transition">
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <h2 className="gradient-text" style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.8rem',
          marginBottom: 24,
          textAlign: 'center',
        }}>
          MBTI 人格测试
        </h2>

        {phase === 'start' && <StartPhase onStart={handleStart} />}
        {phase === 'quiz' && <QuizPhase answers={answers} onAnswer={handleAnswer} />}
        {phase === 'result' && result && <ResultPhase result={result} onReset={handleReset} />}
      </div>
    </div>
  )
}
