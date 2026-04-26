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

export const MBTI_DETAILED: Record<string, { traits: string[], description: string }> = {
  INTJ: { traits: ['战略思维', '独立自主', '追求效率', '完美主义'], description: '你是富有想象力的战略家，对一切事物都有改进的计划。你善于将理论和想法转化为切实的行动方案，享受攻克难题的过程。' },
  INTP: { traits: ['逻辑分析', '好奇心强', '创新思维', '独立思考'], description: '你是具有创新精神的发明家，对知识有着永不满足的渴望。你善于发现模式和逻辑上的不一致，享受理论探索的乐趣。' },
  ENTJ: { traits: ['领导力', '果断决策', '目标导向', '自信坚定'], description: '你是大胆且富有想象力的领导者，总能找到或创造解决方案。你天生具有领导才能，善于将人员和资源组织起来实现目标。' },
  ENTP: { traits: ['创意无限', '善于辩论', '适应力强', '充满活力'], description: '你是聪明好奇的思想者，无法抗拒智力上的挑战。你喜欢从不同角度看问题，善于在辩论中发现真理。' },
  INFJ: { traits: ['理想主义', '洞察力强', '有远见', '富有同情心'], description: '你是安静而神秘的理想主义者，内心有着鼓舞人心的愿景。你善于理解他人的情感，追求有意义的人际关系。' },
  INFP: { traits: ['理想主义', '富有创意', '善良温柔', '追求真实'], description: '你是诗意善良的治愈者，总是寻找最好的一面。你有丰富的内心世界，追求真实和有意义的生活。' },
  ENFJ: { traits: ['魅力四射', '善于激励', '富有同理心', '有责任感'], description: '你是富有魅力的领导者，能够感染和激励身边的人。你善于理解他人的需求，乐于帮助他人成长。' },
  ENFP: { traits: ['热情洋溢', '创意丰富', '善于社交', '乐观向上'], description: '你是热情且有创造力的自由精灵，总能找到理由微笑。你善于发现可能性，享受与他人建立联系的过程。' },
  ISTJ: { traits: ['务实可靠', '注重细节', '有责任感', '条理清晰'], description: '你是务实且注重事实的人，具有强烈的责任感。你重视传统和规则，是值得信赖的执行者。' },
  ISFJ: { traits: ['温暖体贴', '忠诚可靠', '细心周到', '乐于助人'], description: '你是非常专注且温暖的守护者，随时准备保护所爱的人。你善于记住他人的需求，默默地为他人付出。' },
  ESTJ: { traits: ['组织能力强', '务实高效', '有领导力', '重视规则'], description: '你是出色的组织者，善于管理人和项目。你重视秩序和效率，能够将混乱变为有序。' },
  ESFJ: { traits: ['善于社交', '关心他人', '忠诚可靠', '乐于奉献'], description: '你是极富同情心的人，善于照顾他人的需求。你喜欢和谐的环境，乐于为社区和他人做出贡献。' },
  ISTP: { traits: ['动手能力强', '冷静理性', '善于分析', '灵活适应'], description: '你是大胆且实际的实验家，善于使用各种工具。你喜欢探索事物的工作原理，享受动手解决问题的过程。' },
  ISFP: { traits: ['温和友善', '艺术气质', '追求和谐', '活在当下'], description: '你是灵活而有魅力的艺术家，总是准备探索和体验新事物。你善于用行动表达自己，追求内心的和谐。' },
  ESTP: { traits: ['精力充沛', '善于应变', '务实直接', '喜欢冒险'], description: '你是聪明、精力充沛且善于感知的人，真正享受生活在边缘。你喜欢冒险和挑战，善于把握当下。' },
  ESFP: { traits: ['热情活泼', '乐观开朗', '善于表演', '享受生活'], description: '你是自发的、精力充沛且热情的人——生活在他们周围永远不会无聊。你善于让每一刻都变得特别。' },
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
