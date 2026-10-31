const ADMIN_PASSCODE_KEY = 'webrex_admin_passcode';
const ADMIN_SESSION_KEY = 'webrex_admin_session';
const DEFAULT_PASSCODE = '100100';

export function getAdminPasscode(): string {
  try {
    const saved = localStorage.getItem(ADMIN_PASSCODE_KEY);
    return saved && saved.trim() ? saved.trim() : DEFAULT_PASSCODE;
  } catch {
    return DEFAULT_PASSCODE;
  }
}

export function setAdminPasscode(newCode: string): { success: boolean; error?: string } {
  if (!newCode || newCode.trim().length < 4) {
    return { success: false, error: 'يجب أن يتكون كود الدخول من 4 خانات على الأقل.' };
  }
  try {
    localStorage.setItem(ADMIN_PASSCODE_KEY, newCode.trim());
    return { success: true };
  } catch (e) {
    return { success: false, error: 'فشل في حفظ الكود الجديد محلياً.' };
  }
}

export function validatePasscode(code: string): boolean {
  const current = getAdminPasscode();
  return code.trim() === current;
}

export function isAdminAuthenticated(): boolean {
  try {
    return sessionStorage.getItem(ADMIN_SESSION_KEY) === 'authenticated';
  } catch {
    return false;
  }
}

export function adminLogin(code: string): boolean {
  if (validatePasscode(code)) {
    try {
      sessionStorage.setItem(ADMIN_SESSION_KEY, 'authenticated');
    } catch (e) {
      console.warn(e);
    }
    return true;
  }
  return false;
}

export function adminLogout(): void {
  try {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
  } catch (e) {
    console.warn(e);
  }
}
