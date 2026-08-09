import { createHmac, timingSafeEqual } from "node:crypto";

function requestHostname(request) {
  const forwardedHost = String(request.headers["x-forwarded-host"] || "").split(",")[0].trim();
  const requestHost = forwardedHost || String(request.headers.host || "");
  try {
    return new URL(`http://${requestHost}`).hostname.replace(/^\[|\]$/g, "").toLowerCase();
  } catch {
    return "";
  }
}

function isLocalRequest(request) {
  const hostname = requestHostname(request);
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
}

function safeEqual(leftValue, rightValue) {
  const left = Buffer.from(String(leftValue || ""));
  const right = Buffer.from(String(rightValue || ""));
  return left.length > 0 && left.length === right.length && timingSafeEqual(left, right);
}

function cookieValue(request, name) {
  const cookies = String(request.headers.cookie || "").split(";");
  for (const item of cookies) {
    const separator = item.indexOf("=");
    if (separator < 0) continue;
    if (item.slice(0, separator).trim() !== name) continue;
    return decodeURIComponent(item.slice(separator + 1).trim());
  }
  return "";
}

export function createEditorAuth({
  publicEditorHost,
  publicEditorToken,
  cookieName = "claudia_editor_session",
  legacyCookieName = "claudia_editor_access",
  sessionTtlMs = 12 * 60 * 60 * 1000,
}) {
  const editorHost = String(publicEditorHost || "").trim().toLowerCase();
  const secret = String(publicEditorToken || "");

  function isPublicEditorRequest(request) {
    return Boolean(editorHost) && requestHostname(request) === editorHost;
  }

  function sign(expiry) {
    return createHmac("sha256", secret).update(`claudia-editor:${expiry}`).digest("base64url");
  }

  function createSessionValue(now = Date.now()) {
    const expiry = now + sessionTtlMs;
    return `${expiry}.${sign(expiry)}`;
  }

  function sessionIsValid(value, now = Date.now()) {
    if (!secret || typeof value !== "string") return false;
    const separator = value.indexOf(".");
    if (separator < 1) return false;
    const expiry = Number(value.slice(0, separator));
    const signature = value.slice(separator + 1);
    return Number.isFinite(expiry) && expiry > now && safeEqual(signature, sign(expiry));
  }

  function isAuthorized(request) {
    if (isLocalRequest(request)) return true;
    return isPublicEditorRequest(request) && sessionIsValid(cookieValue(request, cookieName));
  }

  function establishLegacySession(request, response, requestUrl) {
    if (isLocalRequest(request) || !isPublicEditorRequest(request) || !secret) return false;
    if (!safeEqual(cookieValue(request, legacyCookieName), secret)) return false;
    response.writeHead(302, {
      Location: `${requestUrl.pathname}${requestUrl.search}`,
      "Cache-Control": "no-store",
      "Set-Cookie": [
        `${cookieName}=${encodeURIComponent(createSessionValue())}; Path=/; Max-Age=${Math.floor(sessionTtlMs / 1000)}; HttpOnly; Secure; SameSite=Strict`,
        `${legacyCookieName}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict`,
      ],
      "X-Robots-Tag": "noindex, nofollow, noarchive",
    }).end();
    return true;
  }

  function establishSession(request, response, requestUrl) {
    if (isLocalRequest(request) || !isPublicEditorRequest(request) || !secret) return false;
    const access = requestUrl.searchParams.get("access") || "";
    if (!safeEqual(access, secret)) return false;

    const cleanParams = new URLSearchParams(requestUrl.searchParams);
    cleanParams.delete("access");
    const location = `${requestUrl.pathname}${cleanParams.size ? `?${cleanParams.toString()}` : ""}`;
    response.writeHead(302, {
      Location: location,
      "Cache-Control": "no-store",
      "Set-Cookie": `${cookieName}=${encodeURIComponent(createSessionValue())}; Path=/; Max-Age=${Math.floor(sessionTtlMs / 1000)}; HttpOnly; Secure; SameSite=Strict`,
      "X-Robots-Tag": "noindex, nofollow, noarchive",
    }).end();
    return true;
  }

  function mutationOriginIsAllowed(request) {
    if (isLocalRequest(request)) return true;
    if (!isPublicEditorRequest(request)) return false;
    if (String(request.headers["sec-fetch-site"] || "").toLowerCase() === "cross-site") return false;
    const origin = String(request.headers.origin || "");
    if (!origin) return false;
    try {
      return new URL(origin).hostname.toLowerCase() === editorHost;
    } catch {
      return false;
    }
  }

  return {
    configured: Boolean(editorHost && secret),
    createSessionValue,
    establishLegacySession,
    establishSession,
    isAuthorized,
    isPublicEditorRequest,
    mutationOriginIsAllowed,
    sessionIsValid,
  };
}
