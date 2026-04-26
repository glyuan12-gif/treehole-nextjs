const API_BASE = process.env.NEXT_PUBLIC_API_BASE || ''

let currentToken: string | null = null

export function setApiToken(token: string | null) {
  currentToken = token
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (currentToken) {
    headers['Authorization'] = `Bearer ${currentToken}`
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  })

  const data = await res.json()

  if (!res.ok) {
    const error = new Error(data.error || '请求失败')
    throw error
  }

  return data
}

async function get<T>(path: string, params?: Record<string, string>): Promise<T> {
  let url = path
  if (params) {
    const searchParams = new URLSearchParams(params)
    url = `${path}?${searchParams.toString()}`
  }
  return request<T>(url)
}

async function post<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  })
}

async function put<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, {
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  })
}

async function del<T>(path: string): Promise<T> {
  return request<T>(path, { method: 'DELETE' })
}

export interface PostAuthor {
  veinId: string
  nickname: string
  avatarStyle: string
  avatarEmoji: string
  avatarColor: string
  mbti: string
  bio: string
  tags: string
}

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
  createdAt: string
  updatedAt: string
  authorId: string
  author: PostAuthor
}

export interface Comment {
  id: string
  content: string
  createdAt: string
  postId: string
  authorId: string
  author: {
    veinId: string
    nickname: string
    avatarStyle: string
    avatarEmoji: string
    avatarColor: string
  }
}

export interface Conversation {
  conversationId: string
  other: {
    id: string
    veinId: string
    nickname: string
    avatarStyle: string
    avatarEmoji: string
    avatarColor: string
    mbti?: string
  }
  lastMessage: string
  lastMessageAt: string
  isSender: boolean
}

export interface Message {
  id: string
  content: string
  createdAt: string
  senderId: string
  receiverId: string
  sender: {
    id: string
    veinId: string
    nickname: string
    avatarStyle: string
    avatarEmoji: string
    avatarColor: string
  }
  receiver: {
    id: string
    veinId: string
    nickname: string
    avatarStyle: string
    avatarEmoji: string
    avatarColor: string
  }
}

export interface Diary {
  id: string
  date: string
  content: string
  mood: string
  isPublic: boolean
  createdAt: string
  updatedAt: string
  authorId: string
}

export interface Letter {
  id: string
  content: string
  openDate: string | null
  isOpened: boolean
  isSelf: boolean
  createdAt: string
  senderId: string
  receiverId: string | null
  sender: {
    veinId: string
    nickname: string
    avatarStyle: string
    avatarEmoji: string
    avatarColor: string
  }
  receiver: {
    veinId: string
    nickname: string
    avatarStyle: string
    avatarEmoji: string
    avatarColor: string
  } | null
}

export const api = {
  setToken: setApiToken,

  // Auth
  register: (data: { veinId: string; password: string; nickname: string; role: string; mbti?: string; avatarStyle?: string; avatarEmoji?: string; avatarColor?: string }) =>
    post<{ userId: string; veinId: string; token: string }>('/api/register', data),

  login: (veinId: string, password: string) =>
    post<{ userId: string; veinId: string; token: string }>('/api/login', { veinId, password }),

  // User
  getUser: (veinId: string) =>
    get<PostAuthor & { createdAt: string }>('/api/user/' + veinId),

  getMe: () =>
    get<{
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
      createdAt: string
      updatedAt: string
    }>('/api/user/me'),

  updateMe: (data: Record<string, unknown>) =>
    put<{
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
      createdAt: string
      updatedAt: string
    }>('/api/user/me', data),

  // Posts
  getPosts: (params?: Record<string, string>) =>
    get<{ posts: Post[]; total: number }>('/api/posts', params),

  getPost: (id: string) =>
    get<Post>('/api/posts/' + id),

  createPost: (data: { title: string; content: string; channel: string; mood?: string; tags?: string[]; image?: string; showVeinId?: boolean }) =>
    post<Post>('/api/posts', data),

  deletePost: (id: string) =>
    del<{ message: string }>('/api/posts/' + id),

  likePost: (id: string) =>
    post<{ liked: boolean }>('/api/posts/' + id + '/like'),

  getComments: (postId: string) =>
    get<Comment[]>('/api/posts/' + postId + '/comments'),

  addComment: (postId: string, content: string) =>
    post<Comment>('/api/posts/' + postId + '/comments', { content }),

  addReaction: (postId: string, type: string) =>
    post<{ reacted: boolean; type: string }>('/api/posts/' + postId + '/reactions', { type }),

  // Messages
  getConversations: () =>
    get<Conversation[]>('/api/messages'),

  getMessages: (conversationId: string) =>
    get<Message[]>('/api/messages/' + conversationId),

  sendMessage: (receiverVeinId: string, content: string) =>
    post<Message>('/api/messages', { receiverVeinId, content }),

  // Diaries
  getDiaries: () =>
    get<Diary[]>('/api/diaries'),

  saveDiary: (data: { date: string; content: string; mood?: string; isPublic?: boolean }) =>
    post<Diary>('/api/diaries', data),

  deleteDiary: (id: string) =>
    del<{ message: string }>('/api/diaries/' + id),

  // Letters
  getLetters: () =>
    get<Letter[]>('/api/letters'),

  getLetter: (id: string) =>
    get<Letter>('/api/letters/' + id),

  createLetter: (data: { content: string; receiverVeinId?: string; openDate?: string; isSelf?: boolean }) =>
    post<Letter>('/api/letters', data),

  deleteLetter: (id: string) =>
    del<{ message: string }>('/api/letters/' + id),

  // Reports
  report: (data: { postId?: string; reason: string; detail?: string }) =>
    post<{ id: string }>('/api/reports', data),
}
