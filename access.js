/* A convenience gate for casual visitors; static files remain publicly accessible. */
(() => {
  'use strict';
  const config = window.GardenAccessConfig;
  const script = document.currentScript;
  const base = new URL('.', script.src);
  const login = new URL('login.html', base);
  const key = 'learning-garden-access-v1';
  const isLogin = location.pathname === login.pathname;
  const maxAge = 7 * 24 * 60 * 60 * 1000;
  function read(storage) {
    try { return JSON.parse(storage.getItem(key)); } catch { return null; }
  }
  function valid(session) {
    const now = Date.now();
    return config && session?.version === config.version && Number.isFinite(session.until) &&
      Number.isFinite(session.started) && session.started <= now && session.until > now &&
      session.until - session.started <= maxAge;
  }
  function authorized() {
    try { return valid(read(sessionStorage)) || valid(read(localStorage)); }
    catch { return false; }
  }
  function returnPath() { return location.href.slice(base.href.length); }
  function lock() {
    if (isLogin) return;
    document.documentElement.style.visibility = 'hidden';
    const target = new URL(login);
    target.searchParams.set('next', returnPath());
    location.replace(target.href);
  }
  function check() { if (!authorized()) lock(); }
  function clear() {
    for (const storage of [sessionStorage, localStorage]) {
      try { storage.removeItem(key); } catch { /* Storage may be unavailable. */ }
    }
  }
  function nextPage() {
    let candidate;
    try { candidate = new URL(new URL(location.href).searchParams.get('next') || 'index.html', base); }
    catch { return new URL('index.html', base).href; }
    if (candidate.origin !== base.origin || !candidate.pathname.startsWith(base.pathname) ||
        candidate.pathname === login.pathname || !/\.html$/.test(candidate.pathname)) {
      return new URL('index.html', base).href;
    }
    return candidate.href;
  }
  async function signIn(code, remember) {
    if (!config || !crypto.subtle) throw new Error('请使用 HTTPS 或本机地址打开花园。');
    const encoder = new TextEncoder();
    const material = await crypto.subtle.importKey('raw', encoder.encode(code), 'PBKDF2', false, ['deriveBits']);
    const bits = await crypto.subtle.deriveBits({name:'PBKDF2', salt:encoder.encode(config.salt),
      iterations:config.iterations, hash:'SHA-256'}, material, 256);
    const actual = Array.from(new Uint8Array(bits), b => b.toString(16).padStart(2, '0')).join('');
    if (actual !== config.verifier) return false;
    clear();
    const started = Date.now();
    const session = {version:config.version, started, until:started + maxAge};
    try { (remember ? localStorage : sessionStorage).setItem(key, JSON.stringify(session)); }
    catch { throw new Error('浏览器无法保存登录状态，请允许本网站使用存储后再试。'); }
    location.replace(nextPage());
    return true;
  }
  window.GardenAccess = Object.freeze({signIn, logout() { clear(); location.replace(login.href); }});
  if (!isLogin) {
    check();
    addEventListener('pageshow', check);
    addEventListener('focus', check);
    addEventListener('storage', event => { if (event.key === key || event.key === null) check(); });
    document.addEventListener('visibilitychange', check);
    setInterval(check, 30000);
  }
})();
