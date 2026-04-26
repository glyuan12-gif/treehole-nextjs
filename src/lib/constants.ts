// ===== Shared Constants =====

export const MBTI_TYPES = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP',
] as const

export const MBTI_DESC: Record<string, string> = {
  INTJ: '建筑师 - 富有想象力的战略思想家',
  INTP: '逻辑学家 - 具有创新精神的发明家',
  ENTJ: '指挥官 - 大胆、富有想象力的强势领导者',
  ENTP: '辩论家 - 聪明好奇的思想者',
  INFJ: '提倡者 - 安静而神秘、鼓舞人心且不知疲倦的理想主义者',
  INFP: '调停者 - 诗意、善良的利他主义者',
  ENFJ: '主人公 - 富有魅力鼓舞人心的领导者',
  ENFP: '竞选者 - 热情、有创造力、社交能力强的自由精灵',
  ISTJ: '物流师 - 实际且注重事实的个人',
  ISFJ: '守卫者 - 非常专注且温暖的守护者',
  ESTJ: '总经理 - 出色的管理者',
  ESFJ: '执政官 - 极其关心他人的人',
  ISTP: '鉴赏家 - 大胆而实际的实验家',
  ISFP: '探险家 - 灵活且有魅力的艺术家',
  ESTP: '企业家 - 聪明、精力充沛且善于感知的人',
  ESFP: '表演者 - 自发、精力充沛且热情的人',
}

export const CHANNELS = [
  { id: '', label: '全部' },
  { id: 'campus', label: '校园' },
  { id: 'work', label: '职场' },
  { id: 'emotion', label: '情感' },
  { id: 'life', label: '生活' },
  { id: 'treehole', label: '树洞' },
] as const

export const CHANNELS_WITH_COLORS = [
  { id: 'campus', label: '校园', color: 'var(--channel-campus)' },
  { id: 'work', label: '职场', color: 'var(--channel-work)' },
  { id: 'emotion', label: '情感', color: 'var(--channel-emotion)' },
  { id: 'life', label: '生活', color: 'var(--channel-life)' },
  { id: 'treehole', label: '树洞', color: 'var(--accent)' },
] as const

export const CHANNEL_LABELS: Record<string, string> = {
  campus: '校园',
  work: '职场',
  emotion: '情感',
  life: '生活',
  treehole: '树洞',
}

export const CHANNEL_COLORS: Record<string, string> = {
  campus: 'var(--channel-campus)',
  work: 'var(--channel-work)',
  emotion: 'var(--channel-emotion)',
  life: 'var(--channel-life)',
  treehole: 'var(--accent)',
}

export const MOODS = [
  { id: 'happy', label: '开心', emoji: '😊' },
  { id: 'sad', label: '难过', emoji: '😢' },
  { id: 'angry', label: '生气', emoji: '😤' },
  { id: 'anxious', label: '焦虑', emoji: '😰' },
  { id: 'calm', label: '平静', emoji: '😌' },
  { id: 'tired', label: '疲惫', emoji: '😴' },
  { id: 'excited', label: '兴奋', emoji: '🤩' },
  { id: 'grateful', label: '感恩', emoji: '🙏' },
] as const

export const MOOD_EMOJIS: Record<string, string> = {
  happy: '😊',
  sad: '😢',
  angry: '😤',
  anxious: '😰',
  calm: '😌',
  tired: '😴',
  excited: '🤩',
  grateful: '🙏',
}

export const EMOJIS = [
  '😊', '😂', '🥰', '😎', '🤔', '😴', '🥳', '😇',
  '🤗', '🫠', '👻', '🐱', '🐶', '🦊', '🐼', '🦋',
  '🌸', '🍀', '⭐', '🌙', '❄️', '🔥', '💎', '🌈',
] as const

export const COLORS = [
  '#5b8c6e', '#4a90d9', '#e67e22', '#e74c3c', '#2ecc71', '#9b59b6',
  '#1abc9c', '#3498db', '#f39c12', '#e91e63', '#00bcd4', '#8bc34a',
  '#ff5722', '#607d8b', '#795548', '#ff9800', '#673ab7', '#009688',
] as const
