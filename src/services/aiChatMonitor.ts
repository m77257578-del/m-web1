import { RobotChatTurn } from '../utils/aiRobotHelper';
import { syncCatalogDocToFirestore, subscribeToSettingsDoc } from './firebase';
import { syncSectionToDataJson } from './dataJsonService';

export interface AiMonitoredSession {
  sessionId: string;
  visitorLabel: string;
  lastUserQuestion: string;
  lastBotAnswer: string;
  updatedAt: string;
  unreadByAdmin: boolean;
  turns: RobotChatTurn[];
}

const STORAGE_KEY = 'mweb_ai_monitored_sessions_v1';
const VISITOR_AI_SESSION_KEY = 'mweb_ai_visitor_session_id';
export const AI_MONITOR_EVENT = 'mweb_ai_monitor_updated';

if (typeof window !== 'undefined') {
  subscribeToSettingsDoc<{ sessions: AiMonitoredSession[] }>('ai_monitored_sessions', (data) => {
    if (data && Array.isArray(data.sessions)) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data.sessions));
        window.dispatchEvent(new CustomEvent(AI_MONITOR_EVENT, { detail: data.sessions }));
      } catch {
        // ignore
      }
    }
  });
}

export function getOrCreateAiVisitorSessionId(
  storage?: Pick<Storage, 'getItem' | 'setItem'>
): string {
  const store = storage || (typeof localStorage !== 'undefined' ? localStorage : null);
  if (!store) return 'ai-visitor-default';
  try {
    let id = store.getItem(VISITOR_AI_SESSION_KEY);
    if (!id) {
      id = 'ai-visitor-' + Math.random().toString(36).substring(2, 8);
      store.setItem(VISITOR_AI_SESSION_KEY, id);
    }
    return id;
  } catch {
    return 'ai-visitor-default';
  }
}

export function getAllAiMonitoredSessions(
  storage?: Pick<Storage, 'getItem'>
): AiMonitoredSession[] {
  const store = storage || (typeof localStorage !== 'undefined' ? localStorage : null);
  if (!store) return [];
  try {
    const raw = store.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Could not read AI monitored sessions:', e);
  }
  return [];
}

export function saveAiMonitoredSessions(
  sessions: AiMonitoredSession[],
  storage?: Pick<Storage, 'setItem'>
): void {
  const store = storage || (typeof localStorage !== 'undefined' ? localStorage : null);
  if (!store) return;
  try {
    const trimmed = sessions.slice(0, 50);
    store.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    if (!storage && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(AI_MONITOR_EVENT, { detail: trimmed }));
      syncCatalogDocToFirestore('settings', 'ai_monitored_sessions', { sessions: trimmed }).catch(
        () => {}
      );
      syncSectionToDataJson('aiMonitoredSessions', trimmed).catch(() => {});
    }
  } catch (e) {
    console.warn('Could not save AI monitored sessions:', e);
  }
}

export function recordAiConversationExchange(
  sessionId: string,
  userTurn: RobotChatTurn,
  botTurn: RobotChatTurn,
  visitorLabel?: string,
  storage?: Pick<Storage, 'getItem' | 'setItem'>
): AiMonitoredSession {
  const sessions = getAllAiMonitoredSessions(storage);
  const existingIdx = sessions.findIndex((s) => s.sessionId === sessionId);
  const nowIso = new Date().toISOString();
  const shortCode = sessionId.replace('ai-visitor-', '').toUpperCase();
  const label = visitorLabel || `زائر الذكاء الاصطناعي #${shortCode}`;

  let session: AiMonitoredSession;

  if (existingIdx === -1) {
    session = {
      sessionId,
      visitorLabel: label,
      lastUserQuestion: userTurn.text || '[صورة مرفقة]',
      lastBotAnswer: botTurn.text,
      updatedAt: nowIso,
      unreadByAdmin: true,
      turns: [userTurn, botTurn],
    };
    sessions.unshift(session);
  } else {
    const existing = sessions[existingIdx];
    session = {
      ...existing,
      visitorLabel: visitorLabel || existing.visitorLabel,
      lastUserQuestion: userTurn.text || '[صورة مرفقة]',
      lastBotAnswer: botTurn.text,
      updatedAt: nowIso,
      unreadByAdmin: true,
      turns: [...existing.turns, userTurn, botTurn].slice(-40),
    };
    sessions.splice(existingIdx, 1);
    sessions.unshift(session);
  }

  saveAiMonitoredSessions(sessions, storage);
  return session;
}

export function markAiSessionReadByAdmin(
  sessionId: string,
  storage?: Pick<Storage, 'getItem' | 'setItem'>
): void {
  const sessions = getAllAiMonitoredSessions(storage);
  const target = sessions.find((s) => s.sessionId === sessionId);
  if (target && target.unreadByAdmin) {
    target.unreadByAdmin = false;
    saveAiMonitoredSessions(sessions, storage);
  }
}

export function deleteAiMonitoredSession(
  sessionId: string,
  storage?: Pick<Storage, 'getItem' | 'setItem'>
): AiMonitoredSession[] {
  const filtered = getAllAiMonitoredSessions(storage).filter((s) => s.sessionId !== sessionId);
  saveAiMonitoredSessions(filtered, storage);
  return filtered;
}

export function clearAllAiMonitoredSessions(
  storage?: Pick<Storage, 'setItem'>
): void {
  saveAiMonitoredSessions([], storage);
}
