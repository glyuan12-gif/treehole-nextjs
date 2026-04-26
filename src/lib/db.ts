// 内存数据存储
const store: Record<string, any[]> = {}

// 通用读写函数
function readJSON<T>(filename: string): T[] {
  return (store[filename] as T[]) || []
}

function writeJSON<T>(filename: string, data: T[]): void {
  store[filename] = data
}

// 生成唯一 ID
export function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 11)
}

// ==================== User ====================

export interface User {
  id: string
  veinId: string
  nickname: string
  role: string
  mbti: string
  avatarStyle: string
  avatarEmoji: string
  avatarColor: string
  allowFind: boolean
  bio: string
  tags: string
  notificationPrefs: string
  defaultAnonymous: boolean
  showOnline: boolean
  passwordHash?: string
  createdAt: string
  updatedAt: string
}

export const users = {
  getAll: (): User[] => readJSON<User>('users.json'),

  findById: (id: string): User | undefined =>
    readJSON<User>('users.json').find(u => u.id === id),

  findByVeinId: (veinId: string): User | undefined =>
    readJSON<User>('users.json').find(u => u.veinId === veinId),

  create: (data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): User => {
    const all = readJSON<User>('users.json')
    const now = new Date().toISOString()
    const user: User = { ...data, id: genId(), createdAt: now, updatedAt: now }
    all.push(user)
    writeJSON('users.json', all)
    return user
  },

  update: (id: string, data: Partial<User>): User | undefined => {
    const all = readJSON<User>('users.json')
    const idx = all.findIndex(u => u.id === id)
    if (idx === -1) return undefined
    all[idx] = { ...all[idx], ...data, updatedAt: new Date().toISOString() }
    writeJSON('users.json', all)
    return all[idx]
  },
}

// ==================== Post ====================

export interface Post {
  id: string
  title: string
  content: string
  channel: string
  mood: string
  tags: string
  image: string
  showVeinId: boolean
  auditStatus: string
  likeCount: number
  commentCount: number
  authorId: string
  createdAt: string
  updatedAt: string
}

export const posts = {
  getAll: (): Post[] => readJSON<Post>('posts.json'),

  findById: (id: string): Post | undefined =>
    readJSON<Post>('posts.json').find(p => p.id === id),

  create: (data: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>): Post => {
    const all = readJSON<Post>('posts.json')
    const now = new Date().toISOString()
    const post: Post = { ...data, id: genId(), createdAt: now, updatedAt: now }
    all.push(post)
    writeJSON('posts.json', all)
    return post
  },

  update: (id: string, data: Partial<Post>): Post | undefined => {
    const all = readJSON<Post>('posts.json')
    const idx = all.findIndex(p => p.id === id)
    if (idx === -1) return undefined
    all[idx] = { ...all[idx], ...data, updatedAt: new Date().toISOString() }
    writeJSON('posts.json', all)
    return all[idx]
  },

  delete: (id: string): boolean => {
    const all = readJSON<Post>('posts.json')
    const filtered = all.filter(p => p.id !== id)
    if (filtered.length === all.length) return false
    writeJSON('posts.json', filtered)
    return true
  },
}

// ==================== Comment ====================

export interface Comment {
  id: string
  content: string
  postId: string
  authorId: string
  createdAt: string
}

export const comments = {
  getAll: (): Comment[] => readJSON<Comment>('comments.json'),

  findByPostId: (postId: string): Comment[] =>
    readJSON<Comment>('comments.json').filter(c => c.postId === postId),

  create: (data: Omit<Comment, 'id' | 'createdAt'>): Comment => {
    const all = readJSON<Comment>('comments.json')
    const comment: Comment = { ...data, id: genId(), createdAt: new Date().toISOString() }
    all.push(comment)
    writeJSON('comments.json', all)
    return comment
  },
}

// ==================== PostLike ====================

export interface PostLike {
  id: string
  postId: string
  userId: string
  createdAt: string
}

export const postLikes = {
  getAll: (): PostLike[] => readJSON<PostLike>('postLikes.json'),

  findUnique: (postId: string, userId: string): PostLike | undefined =>
    readJSON<PostLike>('postLikes.json').find(l => l.postId === postId && l.userId === userId),

  create: (data: Omit<PostLike, 'id' | 'createdAt'>): PostLike => {
    const all = readJSON<PostLike>('postLikes.json')
    const like: PostLike = { ...data, id: genId(), createdAt: new Date().toISOString() }
    all.push(like)
    writeJSON('postLikes.json', all)
    return like
  },

  delete: (id: string): boolean => {
    const all = readJSON<PostLike>('postLikes.json')
    const filtered = all.filter(l => l.id !== id)
    if (filtered.length === all.length) return false
    writeJSON('postLikes.json', filtered)
    return true
  },
}

// ==================== Reaction ====================

export interface Reaction {
  id: string
  type: string
  postId: string
  userId: string
  createdAt: string
}

export const reactions = {
  getAll: (): Reaction[] => readJSON<Reaction>('reactions.json'),

  findUnique: (postId: string, userId: string, type: string): Reaction | undefined =>
    readJSON<Reaction>('reactions.json').find(
      r => r.postId === postId && r.userId === userId && r.type === type
    ),

  create: (data: Omit<Reaction, 'id' | 'createdAt'>): Reaction => {
    const all = readJSON<Reaction>('reactions.json')
    const reaction: Reaction = { ...data, id: genId(), createdAt: new Date().toISOString() }
    all.push(reaction)
    writeJSON('reactions.json', all)
    return reaction
  },

  delete: (id: string): boolean => {
    const all = readJSON<Reaction>('reactions.json')
    const filtered = all.filter(r => r.id !== id)
    if (filtered.length === all.length) return false
    writeJSON('reactions.json', filtered)
    return true
  },
}

// ==================== DirectMessage ====================

export interface DirectMessage {
  id: string
  content: string
  senderId: string
  receiverId: string
  createdAt: string
}

export const messages = {
  getAll: (): DirectMessage[] => readJSON<DirectMessage>('messages.json'),

  findBetween: (userId1: string, userId2: string): DirectMessage[] =>
    readJSON<DirectMessage>('messages.json').filter(
      m =>
        (m.senderId === userId1 && m.receiverId === userId2) ||
        (m.senderId === userId2 && m.receiverId === userId1)
    ),

  findByUser: (userId: string): DirectMessage[] =>
    readJSON<DirectMessage>('messages.json').filter(
      m => m.senderId === userId || m.receiverId === userId
    ),

  create: (data: Omit<DirectMessage, 'id' | 'createdAt'>): DirectMessage => {
    const all = readJSON<DirectMessage>('messages.json')
    const msg: DirectMessage = { ...data, id: genId(), createdAt: new Date().toISOString() }
    all.push(msg)
    writeJSON('messages.json', all)
    return msg
  },
}

// ==================== Diary ====================

export interface Diary {
  id: string
  date: string
  content: string
  mood: string
  isPublic: boolean
  authorId: string
  createdAt: string
  updatedAt: string
}

export const diaries = {
  getAll: (): Diary[] => readJSON<Diary>('diaries.json'),

  findByAuthorId: (authorId: string): Diary[] =>
    readJSON<Diary>('diaries.json')
      .filter(d => d.authorId === authorId)
      .sort((a, b) => b.date.localeCompare(a.date)),

  findByAuthorAndDate: (authorId: string, date: string): Diary | undefined =>
    readJSON<Diary>('diaries.json').find(d => d.authorId === authorId && d.date === date),

  findById: (id: string): Diary | undefined =>
    readJSON<Diary>('diaries.json').find(d => d.id === id),

  create: (data: Omit<Diary, 'id' | 'createdAt' | 'updatedAt'>): Diary => {
    const all = readJSON<Diary>('diaries.json')
    const now = new Date().toISOString()
    const diary: Diary = { ...data, id: genId(), createdAt: now, updatedAt: now }
    all.push(diary)
    writeJSON('diaries.json', all)
    return diary
  },

  update: (id: string, data: Partial<Diary>): Diary | undefined => {
    const all = readJSON<Diary>('diaries.json')
    const idx = all.findIndex(d => d.id === id)
    if (idx === -1) return undefined
    all[idx] = { ...all[idx], ...data, updatedAt: new Date().toISOString() }
    writeJSON('diaries.json', all)
    return all[idx]
  },

  delete: (id: string): boolean => {
    const all = readJSON<Diary>('diaries.json')
    const filtered = all.filter(d => d.id !== id)
    if (filtered.length === all.length) return false
    writeJSON('diaries.json', filtered)
    return true
  },
}

// ==================== Letter ====================

export interface Letter {
  id: string
  content: string
  openDate: string | null
  isOpened: boolean
  isSelf: boolean
  senderId: string
  receiverId: string | null
  createdAt: string
}

export const letters = {
  getAll: (): Letter[] => readJSON<Letter>('letters.json'),

  findById: (id: string): Letter | undefined =>
    readJSON<Letter>('letters.json').find(l => l.id === id),

  findByUser: (userId: string): Letter[] =>
    readJSON<Letter>('letters.json')
      .filter(l => l.senderId === userId || l.receiverId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),

  create: (data: Omit<Letter, 'id' | 'createdAt'>): Letter => {
    const all = readJSON<Letter>('letters.json')
    const letter: Letter = { ...data, id: genId(), createdAt: new Date().toISOString() }
    all.push(letter)
    writeJSON('letters.json', all)
    return letter
  },

  update: (id: string, data: Partial<Letter>): Letter | undefined => {
    const all = readJSON<Letter>('letters.json')
    const idx = all.findIndex(l => l.id === id)
    if (idx === -1) return undefined
    all[idx] = { ...all[idx], ...data }
    writeJSON('letters.json', all)
    return all[idx]
  },

  delete: (id: string): boolean => {
    const all = readJSON<Letter>('letters.json')
    const filtered = all.filter(l => l.id !== id)
    if (filtered.length === all.length) return false
    writeJSON('letters.json', filtered)
    return true
  },
}

// ==================== Report ====================

export interface Report {
  id: string
  reason: string
  detail: string
  postId: string | null
  reporterId: string
  createdAt: string
}

export const reports = {
  getAll: (): Report[] => readJSON<Report>('reports.json'),

  create: (data: Omit<Report, 'id' | 'createdAt'>): Report => {
    const all = readJSON<Report>('reports.json')
    const report: Report = { ...data, id: genId(), createdAt: new Date().toISOString() }
    all.push(report)
    writeJSON('reports.json', all)
    return report
  },
}

// ==================== 辅助函数：填充 author 信息 ====================

export function getUserPublicInfo(userId: string): {
  veinId: string
  nickname: string
  avatarStyle: string
  avatarEmoji: string
  avatarColor: string
  mbti: string
  bio: string
  tags: string
} | undefined {
  const user = users.findById(userId)
  if (!user) return undefined
  return {
    veinId: user.veinId,
    nickname: user.nickname,
    avatarStyle: user.avatarStyle,
    avatarEmoji: user.avatarEmoji,
    avatarColor: user.avatarColor,
    mbti: user.mbti,
    bio: user.bio,
    tags: user.tags,
  }
}

export function getUserBasicInfo(userId: string): {
  id: string
  veinId: string
  nickname: string
  avatarStyle: string
  avatarEmoji: string
  avatarColor: string
} | undefined {
  const user = users.findById(userId)
  if (!user) return undefined
  return {
    id: user.id,
    veinId: user.veinId,
    nickname: user.nickname,
    avatarStyle: user.avatarStyle,
    avatarEmoji: user.avatarEmoji,
    avatarColor: user.avatarColor,
  }
}

// ==================== 初始化示例数据 ====================

function seedData() {
  const existingPosts = readJSON<Post>('posts.json')
  if (existingPosts.length > 0) return

  const now = new Date().toISOString()
  const samplePosts: Post[] = [
    {
      id: genId(),
      title: '今天天气真好',
      content: '阳光明媚，适合出去走走。在校园里散步，看到樱花开了，心情特别好。希望大家也能享受这美好的天气。',
      channel: 'campus',
      mood: 'happy',
      tags: JSON.stringify(['日常', '校园']),
      image: '',
      showVeinId: true,
      auditStatus: 'approved',
      likeCount: 5,
      commentCount: 2,
      authorId: '',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: genId(),
      title: '实习焦虑',
      content: '马上就要开始实习了，感觉自己什么都不会。面试了好几家公司都没有回音，真的很焦虑。有没有前辈能给点建议？',
      channel: 'work',
      mood: 'anxious',
      tags: JSON.stringify(['实习', '焦虑']),
      image: '',
      showVeinId: false,
      auditStatus: 'approved',
      likeCount: 12,
      commentCount: 8,
      authorId: '',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: genId(),
      title: '深夜emo时间',
      content: '又是一个失眠的夜晚。最近压力好大，学业、社交、未来规划...感觉所有事情都压在一起。有时候真的很想找个树洞倾诉一下。',
      channel: 'emotion',
      mood: 'sad',
      tags: JSON.stringify(['情绪', '失眠']),
      image: '',
      showVeinId: false,
      auditStatus: 'approved',
      likeCount: 20,
      commentCount: 15,
      authorId: '',
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    },
    {
      id: genId(),
      title: '分享一个超好吃的食堂窗口',
      content: '二食堂三楼的麻辣香锅真的绝了！分量足，味道好，价格也合理。推荐大家去试试，记得加一份土豆和藕片！',
      channel: 'life',
      mood: 'excited',
      tags: JSON.stringify(['美食', '食堂']),
      image: '',
      showVeinId: true,
      auditStatus: 'approved',
      likeCount: 8,
      commentCount: 4,
      authorId: '',
      createdAt: new Date(Date.now() - 3600000 * 10).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 10).toISOString(),
    },
    {
      id: genId(),
      title: '写给未来的自己',
      content: '希望一年后的你，能变得更勇敢，不再害怕失败。记住，每一次跌倒都是为了更好地站起来。加油！',
      channel: 'treehole',
      mood: 'hopeful',
      tags: JSON.stringify(['树洞', '自我鼓励']),
      image: '',
      showVeinId: false,
      auditStatus: 'approved',
      likeCount: 15,
      commentCount: 6,
      authorId: '',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: genId(),
      title: '考研倒计时30天',
      content: '距离考研还有30天，每天早上六点起床去图书馆占座，晚上十点才回宿舍。虽然很累，但感觉自己在做一件有意义的事情。希望所有考研的同学们都能上岸！我们一起加油！',
      channel: 'campus',
      mood: 'tired',
      tags: JSON.stringify(['考研', '学习', '加油']),
      image: '',
      showVeinId: false,
      auditStatus: 'approved',
      likeCount: 32,
      commentCount: 18,
      authorId: '',
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
    {
      id: genId(),
      title: '终于拿到了offer',
      content: '投了三个月的简历，面了十几家公司，终于拿到了心仪的offer！虽然过程很煎熬，但回头看一切都是值得的。想告诉还在找工作的朋友们，不要放弃，属于你的机会一定会来。',
      channel: 'work',
      mood: 'excited',
      tags: JSON.stringify(['求职', 'offer', '坚持']),
      image: '',
      showVeinId: true,
      auditStatus: 'approved',
      likeCount: 45,
      commentCount: 22,
      authorId: '',
      createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    },
    {
      id: genId(),
      title: '和室友吵架了',
      content: '因为作息时间的问题和室友闹了矛盾，其实也不是什么大事，但就是觉得很难受。明明是好朋友，为什么连这点小事都沟通不好呢？有没有人有过类似的经历？',
      channel: 'emotion',
      mood: 'sad',
      tags: JSON.stringify(['室友', '矛盾', '人际关系']),
      image: '',
      showVeinId: false,
      auditStatus: 'approved',
      likeCount: 18,
      commentCount: 12,
      authorId: '',
      createdAt: new Date(Date.now() - 86400000 * 1.5).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 1.5).toISOString(),
    },
    {
      id: genId(),
      title: '发现了一个超棒的跑步路线',
      content: '从学校东门出发，沿着河边跑到公园再绕回来，全程大概5公里。沿途风景超美，尤其是傍晚的时候，夕阳洒在河面上，特别治愈。强烈推荐给喜欢跑步的同学！',
      channel: 'life',
      mood: 'happy',
      tags: JSON.stringify(['跑步', '运动', '校园周边']),
      image: '',
      showVeinId: true,
      auditStatus: 'approved',
      likeCount: 14,
      commentCount: 7,
      authorId: '',
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
    {
      id: genId(),
      title: '第一次做饭成功了',
      content: '作为一个从小到大只会煮泡面的人，今天居然成功做出了一道番茄炒蛋！虽然卖相一般，但味道还不错。感觉打开了新世界的大门，以后要多学几道菜。',
      channel: 'life',
      mood: 'excited',
      tags: JSON.stringify(['做饭', '生活技能', '第一次']),
      image: '',
      showVeinId: true,
      auditStatus: 'approved',
      likeCount: 22,
      commentCount: 9,
      authorId: '',
      createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 6).toISOString(),
    },
    {
      id: genId(),
      title: '毕业季的感慨',
      content: '再过几个月就要毕业了，想想大学四年真的过得好快。从军训到毕业论文，从陌生人到最好的朋友。虽然对未来有些迷茫，但更多的是感恩。感谢这段时光里的每一个人。',
      channel: 'campus',
      mood: 'grateful',
      tags: JSON.stringify(['毕业', '感慨', '青春']),
      image: '',
      showVeinId: false,
      auditStatus: 'approved',
      likeCount: 38,
      commentCount: 25,
      authorId: '',
      createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    },
    {
      id: genId(),
      title: '被导师批评了',
      content: '今天组会又被导师批评了，说我的实验数据不够严谨。虽然知道导师是对的，但心里还是很难受。回去重新整理了一遍数据，发现确实有些地方不够仔细。科研这条路真的需要耐心啊。',
      channel: 'campus',
      mood: 'anxious',
      tags: JSON.stringify(['科研', '导师', '成长']),
      image: '',
      showVeinId: false,
      auditStatus: 'approved',
      likeCount: 16,
      commentCount: 10,
      authorId: '',
      createdAt: new Date(Date.now() - 86400000 * 0.5).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 0.5).toISOString(),
    },
    {
      id: genId(),
      title: '周末去了趟书店',
      content: '在市中心发现了一家超有氛围的独立书店，木质书架配上暖黄色的灯光，还有咖啡的香味。在那里待了一整个下午，看了半本《百年孤独》。感觉时间都慢下来了。',
      channel: 'life',
      mood: 'calm',
      tags: JSON.stringify(['书店', '阅读', '周末']),
      image: '',
      showVeinId: true,
      auditStatus: 'approved',
      likeCount: 11,
      commentCount: 5,
      authorId: '',
      createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 8).toISOString(),
    },
    {
      id: genId(),
      title: '暗恋的人今天对我笑了',
      content: '在图书馆自习的时候，暗恋了半年的同学居然主动跟我打了招呼，还对我笑了一下。虽然可能只是出于礼貌，但我的内心已经演了一部完整的偶像剧了。这就是青春吧。',
      channel: 'emotion',
      mood: 'excited',
      tags: JSON.stringify(['暗恋', '青春', '心动']),
      image: '',
      showVeinId: false,
      auditStatus: 'approved',
      likeCount: 28,
      commentCount: 16,
      authorId: '',
      createdAt: new Date(Date.now() - 86400000 * 1.2).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 1.2).toISOString(),
    },
    {
      id: genId(),
      title: '转行做程序员三个月了',
      content: '从文科转行学编程已经三个月了，每天都在和各种bug作斗争。从最开始的hello world到现在能独立写一个简单的全栈项目，虽然进步缓慢，但确实在一点点变好。给所有转行的朋友说一句：不要怕，慢慢来。',
      channel: 'work',
      mood: 'hopeful',
      tags: JSON.stringify(['转行', '编程', '成长']),
      image: '',
      showVeinId: true,
      auditStatus: 'approved',
      likeCount: 35,
      commentCount: 20,
      authorId: '',
      createdAt: new Date(Date.now() - 86400000 * 9).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 9).toISOString(),
    },
    {
      id: genId(),
      title: '今天被陌生人帮助了',
      content: '下大雨没带伞，在地铁站门口犹豫要不要冲出去。一个完全不认识的姐姐主动把伞分给我一半，陪我走到了学校。虽然只是小事，但真的被暖到了。这个世界还是好人多。',
      channel: 'treehole',
      mood: 'grateful',
      tags: JSON.stringify(['温暖', '陌生人', '感动']),
      image: '',
      showVeinId: false,
      auditStatus: 'approved',
      likeCount: 42,
      commentCount: 15,
      authorId: '',
      createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    },
    {
      id: genId(),
      title: '组队参加黑客马拉松拿了奖',
      content: '和三个朋友一起参加了学校的黑客马拉松，48小时没怎么睡觉，最后做出了一个校园二手交易小程序，居然拿了二等奖！虽然累到不行，但团队合作的感觉真的太棒了。',
      channel: 'campus',
      mood: 'excited',
      tags: JSON.stringify(['黑客马拉松', '团队合作', '编程']),
      image: '',
      showVeinId: true,
      auditStatus: 'approved',
      likeCount: 26,
      commentCount: 11,
      authorId: '',
      createdAt: new Date(Date.now() - 86400000 * 11).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 11).toISOString(),
    },
    {
      id: genId(),
      title: '失眠的夜晚想了很多',
      content: '凌晨三点还睡不着，脑子里全是乱七八糟的想法。想家了，想妈妈做的红烧肉。上大学之后才发现，原来最想念的不是什么大城市的繁华，而是家里那盏永远为我亮着的灯。',
      channel: 'treehole',
      mood: 'sad',
      tags: JSON.stringify(['失眠', '想家', '深夜']),
      image: '',
      showVeinId: false,
      auditStatus: 'approved',
      likeCount: 33,
      commentCount: 19,
      authorId: '',
      createdAt: new Date(Date.now() - 86400000 * 0.2).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 0.2).toISOString(),
    },
  ]

  writeJSON('posts.json', samplePosts)

  // Seed comments
  const sampleComments: Comment[] = [
    { id: genId(), content: '加油！一切都会好起来的', postId: samplePosts[1].id, authorId: '', createdAt: new Date(Date.now() - 86400000 * 0.8).toISOString() },
    { id: genId(), content: '同感，我也是这样过来的', postId: samplePosts[1].id, authorId: '', createdAt: new Date(Date.now() - 86400000 * 0.7).toISOString() },
    { id: genId(), content: '早点休息吧，明天会更好的', postId: samplePosts[2].id, authorId: '', createdAt: new Date(Date.now() - 3600000 * 4).toISOString() },
    { id: genId(), content: '抱抱，你不是一个人', postId: samplePosts[2].id, authorId: '', createdAt: new Date(Date.now() - 3600000 * 3).toISOString() },
    { id: genId(), content: '已去！真的好吃，谢谢推荐', postId: samplePosts[3].id, authorId: '', createdAt: new Date(Date.now() - 3600000 * 8).toISOString() },
    { id: genId(), content: '土豆和藕片确实是灵魂配菜', postId: samplePosts[3].id, authorId: '', createdAt: new Date(Date.now() - 3600000 * 7).toISOString() },
    { id: genId(), content: '一起加油！一定会上岸的', postId: samplePosts[5].id, authorId: '', createdAt: new Date(Date.now() - 86400000 * 2.5).toISOString() },
    { id: genId(), content: '图书馆五楼有插座的位置最抢手了哈哈', postId: samplePosts[5].id, authorId: '', createdAt: new Date(Date.now() - 86400000 * 2.3).toISOString() },
    { id: genId(), content: '恭喜恭喜！坚持就是胜利', postId: samplePosts[6].id, authorId: '', createdAt: new Date(Date.now() - 86400000 * 3.5).toISOString() },
    { id: genId(), content: '请问是什么行业的offer呀？', postId: samplePosts[6].id, authorId: '', createdAt: new Date(Date.now() - 86400000 * 3.3).toISOString() },
    { id: genId(), content: '沟通是双向的，找个时间好好聊聊吧', postId: samplePosts[7].id, authorId: '', createdAt: new Date(Date.now() - 86400000 * 1.2).toISOString() },
    { id: genId(), content: '我之前也和室友有过矛盾，后来发现其实是误会', postId: samplePosts[7].id, authorId: '', createdAt: new Date(Date.now() - 86400000 * 1.1).toISOString() },
    { id: genId(), content: '青春啊，太美好了', postId: samplePosts[13].id, authorId: '', createdAt: new Date(Date.now() - 86400000 * 1).toISOString() },
    { id: genId(), content: '冲！说不定人家也对你有意思呢', postId: samplePosts[13].id, authorId: '', createdAt: new Date(Date.now() - 86400000 * 0.9).toISOString() },
  ]
  writeJSON('comments.json', sampleComments)

  // Seed diaries
  const today = new Date()
  const formatDateStr = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

  const sampleDiaries: Diary[] = [
    {
      id: genId(),
      date: formatDateStr(today),
      content: '今天是个普通但充实的一天。上午上了两节课，下午在图书馆看了一会儿书，晚上和室友一起吃了火锅。虽然没有什么特别的事情发生，但就是觉得很满足。有时候幸福就是这些平凡的小事。',
      mood: 'happy',
      isPublic: true,
      authorId: '',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: genId(),
      date: formatDateStr(new Date(Date.now() - 86400000)),
      content: '今天心情不太好，考试没考好，感觉辜负了之前的努力。晚上一个人在操场走了好几圈，吹了吹风，感觉好多了。明天又是新的一天，要继续加油。',
      mood: 'sad',
      isPublic: false,
      authorId: '',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: genId(),
      date: formatDateStr(new Date(Date.now() - 86400000 * 3)),
      content: '周末和高中同学聚了聚，大家都在不同的城市上大学，难得聚在一起。聊了很多以前的事情，笑到肚子疼。虽然各自的生活都变了，但友情还是老样子。',
      mood: 'excited',
      isPublic: true,
      authorId: '',
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
    {
      id: genId(),
      date: formatDateStr(new Date(Date.now() - 86400000 * 5)),
      content: '今天收到了一封来自未来的信（自己之前写的），打开看了之后发现之前给自己定的目标大部分都实现了。虽然过程比想象中艰难，但结果还不错。感谢当初努力的自己。',
      mood: 'grateful',
      isPublic: false,
      authorId: '',
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
    {
      id: genId(),
      date: formatDateStr(new Date(Date.now() - 86400000 * 7)),
      content: '连续下了三天的雨，整个人都闷闷的。在宿舍里看了一整天的剧，吃了两包薯片，感觉有点颓废。不过下雨天就该这样嘛，偶尔放松一下也没关系。',
      mood: 'calm',
      isPublic: true,
      authorId: '',
      createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    },
  ]
  writeJSON('diaries.json', sampleDiaries)

  // Seed letters
  const sampleLetters: Letter[] = [
    {
      id: genId(),
      content: '亲爱的自己：\n\n当你打开这封信的时候，应该已经毕业了吧？不知道你现在在哪里，在做什么工作，身边有没有交到好朋友。\n\n写这封信的时候，我还在为考研焦头烂额，对未来充满不确定。但我相信，不管结果如何，你一定已经找到了属于自己的路。\n\n希望你依然保持着对世界的好奇心，依然热爱生活，依然勇敢。\n\n加油！\n\n两年前的你',
      openDate: null,
      isOpened: true,
      isSelf: true,
      senderId: '',
      receiverId: null,
      createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    },
    {
      id: genId(),
      content: '致一年后的自己：\n\n希望你已经学会了好好照顾自己。不要再熬夜到凌晨了，记得按时吃饭，多运动。\n\n如果考研成功了，恭喜你！如果没成功，也不要灰心，人生不止一条路。\n\n不管怎样，我都为你骄傲。\n\n永远支持你的自己',
      openDate: new Date(Date.now() + 86400000 * 180).toISOString(),
      isOpened: false,
      isSelf: true,
      senderId: '',
      receiverId: null,
      createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
    },
    {
      id: genId(),
      content: '嗨，未来的我：\n\n这封信封存到下个月才能打开。到时候应该已经知道实习的结果了吧？不管结果如何，请记住：尝试本身就是一种勇气。\n\n如果一切顺利，那就继续努力。如果遇到了挫折，也不要害怕，因为每一次挫折都是成长的机会。\n\n期待看到更好的你。\n\n现在的你',
      openDate: new Date(Date.now() + 86400000 * 15).toISOString(),
      isOpened: false,
      isSelf: true,
      senderId: '',
      receiverId: null,
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
  ]
  writeJSON('letters.json', sampleLetters)
}

// 在模块加载时执行种子数据
seedData()
