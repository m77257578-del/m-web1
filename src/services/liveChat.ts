export interface ChatAttachment {
  name: string;
  type: 'image' | 'file';
  url: string; // Base64 or URL
  size?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'customer' | 'admin' | 'system';
  senderName?: string;
  text: string;
  attachment?: ChatAttachment;
  timestamp: string; // ISO string or local time
}

export interface ChatThread {
  id: string; // customer session ID e.g. "visitor-123456"
  customerName: string;
  customerPhone?: string;
  lastMessage: string;
  updatedAt: string;
  unreadByAdmin: boolean;
  unreadByCustomer: boolean;
  messages: ChatMessage[];
}

const STORAGE_KEY = 'mweb_live_chat_threads';
const VISITOR_SESSION_KEY = 'mweb_chat_visitor_id';

// Helper to get or create unique visitor session ID for the floating widget
export function getVisitorSessionId(): string {
  try {
    let id = localStorage.getItem(VISITOR_SESSION_KEY);
    if (!id) {
      id = 'visitor-' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem(VISITOR_SESSION_KEY, id);
    }
    return id;
  } catch {
    return 'visitor-default';
  }
}

export function getAllChatThreads(): ChatThread[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Could not read chat threads:', e);
  }
  return [];
}

export function saveChatThreads(threads: ChatThread[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(threads));
    window.dispatchEvent(new CustomEvent('live_chat_updated'));
  } catch (e) {
    console.warn('Could not save chat threads:', e);
  }
}

export function getThreadById(threadId: string): ChatThread | null {
  const threads = getAllChatThreads();
  return threads.find((t) => t.id === threadId) || null;
}

// Send message from customer in floating widget
export function sendCustomerMessage(
  threadId: string,
  text: string,
  customerName: string = 'عميل جديد',
  customerPhone?: string,
  attachment?: ChatAttachment
): ChatThread {
  const threads = getAllChatThreads();
  let thread = threads.find((t) => t.id === threadId);

  const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const isoTime = new Date().toISOString();

  const lastText = text.trim() || (attachment ? `[مرفق: ${attachment.type === 'image' ? 'صورة' : 'ملف'}]` : '');

  const newMsg: ChatMessage = {
    id: 'msg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
    sender: 'customer',
    senderName: customerName,
    text: text.trim(),
    attachment,
    timestamp: nowTime,
  };

  if (!thread) {
    thread = {
      id: threadId,
      customerName,
      customerPhone: customerPhone || '',
      lastMessage: lastText,
      updatedAt: isoTime,
      unreadByAdmin: true,
      unreadByCustomer: false,
      messages: [
        {
          id: 'welcome-sys',
          sender: 'system',
          senderName: 'الدعم المباشر',
          text: 'أهلاً بك! تواصلت مباشرة مع خدمة العملاء. يمكنك إرسال النصوص، الصور والملفات المرفقة لمهندسي الدعم.',
          timestamp: nowTime,
        },
        newMsg,
      ],
    };
    threads.unshift(thread);
  } else {
    if (customerName && customerName !== 'عميل جديد') {
      thread.customerName = customerName;
    }
    if (customerPhone) {
      thread.customerPhone = customerPhone;
    }
    thread.lastMessage = lastText;
    thread.updatedAt = isoTime;
    thread.unreadByAdmin = true;
    thread.messages.push(newMsg);

    // Re-order thread to top
    const idx = threads.findIndex((t) => t.id === threadId);
    if (idx > 0) {
      threads.splice(idx, 1);
      threads.unshift(thread);
    }
  }

  saveChatThreads(threads);
  return thread;
}

// Send reply from Admin in Admin Panel
export function sendAdminReply(
  threadId: string, 
  text: string, 
  attachment?: ChatAttachment
): ChatThread | null {
  const threads = getAllChatThreads();
  const thread = threads.find((t) => t.id === threadId);
  if (!thread) return null;

  const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const isoTime = new Date().toISOString();

  const lastText = text.trim() || (attachment ? `[مرفق: ${attachment.type === 'image' ? 'صورة' : 'ملف'}]` : '');

  const adminMsg: ChatMessage = {
    id: 'msg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
    sender: 'admin',
    senderName: 'خدمة العملاء (الدعم الفني)',
    text: text.trim(),
    attachment,
    timestamp: nowTime,
  };

  thread.messages.push(adminMsg);
  thread.lastMessage = lastText;
  thread.updatedAt = isoTime;
  thread.unreadByAdmin = false;
  thread.unreadByCustomer = true;

  saveChatThreads(threads);
  return thread;
}

// Mark thread as read by Admin
export function markThreadAsReadByAdmin(threadId: string): void {
  const threads = getAllChatThreads();
  const thread = threads.find((t) => t.id === threadId);
  if (thread && thread.unreadByAdmin) {
    thread.unreadByAdmin = false;
    saveChatThreads(threads);
  }
}

// Mark thread as read by Customer
export function markThreadAsReadByCustomer(threadId: string): void {
  const threads = getAllChatThreads();
  const thread = threads.find((t) => t.id === threadId);
  if (thread && thread.unreadByCustomer) {
    thread.unreadByCustomer = false;
    saveChatThreads(threads);
  }
}

export function deleteChatThread(threadId: string): void {
  const threads = getAllChatThreads().filter((t) => t.id !== threadId);
  saveChatThreads(threads);
}

export function getUnreadAdminCount(): number {
  const threads = getAllChatThreads();
  return threads.filter((t) => t.unreadByAdmin).length;
}
