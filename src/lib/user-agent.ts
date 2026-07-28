export interface ParsedUserAgent {
  deviceType: "mobile" | "tablet" | "desktop";
  browser: string;
  os: string;
}

/** Minimal, dependency-free User-Agent sniffing — good enough for dashboard breakdowns, not a precision library. */
export function parseUserAgent(ua: string): ParsedUserAgent {
  const isTablet = /iPad|Tablet|(?:Android(?!.*Mobile))/i.test(ua);
  const isMobile = !isTablet && /Mobile|Android|iPhone|iPod/i.test(ua);
  const deviceType: ParsedUserAgent["deviceType"] = isTablet ? "tablet" : isMobile ? "mobile" : "desktop";

  let browser = "Autre";
  if (/Edg\//.test(ua)) browser = "Edge";
  else if (/OPR\//.test(ua)) browser = "Opera";
  else if (/Chrome\//.test(ua) && !/Chromium/.test(ua)) browser = "Chrome";
  else if (/CriOS\//.test(ua)) browser = "Chrome";
  else if (/FxiOS\//.test(ua) || /Firefox\//.test(ua)) browser = "Firefox";
  else if (/Safari\//.test(ua) && !/Chrome/.test(ua)) browser = "Safari";

  let os = "Autre";
  if (/Windows/.test(ua)) os = "Windows";
  else if (/Mac OS X/.test(ua) && !/iPhone|iPad/.test(ua)) os = "macOS";
  else if (/Android/.test(ua)) os = "Android";
  else if (/iPhone|iPad|iPod|iOS/.test(ua)) os = "iOS";
  else if (/Linux/.test(ua)) os = "Linux";

  return { deviceType, browser, os };
}
