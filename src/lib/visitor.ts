// 방문자/세션 식별자 — 클라이언트 전용 (localStorage/sessionStorage 기반)

export function getOrCreateVisitorId(): string {
  try {
    let vid = localStorage.getItem("_miso_vid");
    if (!vid) {
      vid = crypto.randomUUID();
      localStorage.setItem("_miso_vid", vid);
    }
    return vid;
  } catch {
    return "unknown";
  }
}

export function getOrCreateSessionId(): string {
  try {
    const key = "_miso_sid";
    const tsKey = "_miso_sid_ts";
    const SESSION_TIMEOUT = 30 * 60 * 1000; // 30분

    const now = Date.now();
    const lastTs = parseInt(sessionStorage.getItem(tsKey) ?? "0");
    let sid = sessionStorage.getItem(key);

    if (!sid || now - lastTs > SESSION_TIMEOUT) {
      sid = crypto.randomUUID();
      sessionStorage.setItem(key, sid);
    }
    sessionStorage.setItem(tsKey, String(now));
    return sid;
  } catch {
    return "unknown";
  }
}

export function isNewVisitor(): boolean {
  try {
    const key = "_miso_visited";
    const visited = localStorage.getItem(key);
    if (!visited) {
      localStorage.setItem(key, "1");
      return true;
    }
    return false;
  } catch {
    return true;
  }
}
