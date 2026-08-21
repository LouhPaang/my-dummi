export interface Env {
  ASSETS: Fetcher;
}

/* ========== 黑名单定义 ========== */

const AI_BOT_PATTERNS = [
  /ChatGPT-User/i, /GPTBot/i, /OAI-SearchBot/i, /ClaudeBot/i,
  /anthropic-ai/i, /CCBot/i, /PerplexityBot/i, /Applebot-Extended/i,
  /Bytespider/i, /Amazonbot/i, /FacebookBot/i, /YouBot/i,
  /Diffbot/i, /ImagesiftBot/i, /cohere-ai/i, /omgili/i, /Webzio/i,
  /AI2Bot/i, /Ai2Bot-Dolma/i, /DataForSeoBot/i,
  /Xiaohongshu/i, /RedBook/i
];

const SEARCH_BOT_PATTERNS = [
  /Googlebot/i, /Bingbot/i, /Slurp/i, /DuckDuckBot/i,
  /Baiduspider/i, /YandexBot/i, /Sogou.*spider/i, /NaverBot/i
];

const BLOCKED_BROWSER_PATTERNS = [
  /MSIE|Trident/i,
  /360SE|360EE|QIHU|QihooBrowser|QHBrowser|360chrome|360sou|360browser|360ENT|360Enterprise|360SafeBrowser/i,
  /QQBrowser|QQ/i,
  /SE\s*2\.X|MetaSr|Sogou/i,
  /SohuNewsBrowser|SohuBrowser/i,
  /Quark/i,
  /WukongBrowser|悟空浏览器/i,
  /Doubao|DoubaoBrowser|豆包/i,
  /UCBrowser|UC\b/i,
  /LBBROWSER|LieBao/i,
  /Maxthon/i,
  /2345Browser|2345Explorer/i,
  /AlipayClient|AliApp|TBIOS|WindVane/i,
  /\bTaobao\b/i,
  /HuaweiBrowser/i
];

/* ========== 检测函数 ========== */

function isAIBot(ua: string): boolean {
  return AI_BOT_PATTERNS.some(p => p.test(ua));
}

function isSearchBot(ua: string): boolean {
  return SEARCH_BOT_PATTERNS.some(p => p.test(ua));
}

function isBlockedBrowser(ua: string): boolean {
  return BLOCKED_BROWSER_PATTERNS.some(p => p.test(ua));
}

/**
 * 请求头指纹检测
 * 裸爬虫通常缺少标准浏览器的请求头特征
 */
function hasBotFingerprint(request: Request): boolean {
  const h = request.headers;
  
  // 正常浏览器必有 Accept-Language；裸爬虫（curl/wget）通常没有
  const hasAcceptLang = h.has('Accept-Language');
  
  // Sec-Fetch-* 是现代浏览器（Chrome 76+/Edge 79+/Firefox 90+/Safari 16+）的标准头
  // 旧版浏览器没有这些头，但也不会被误判为爬虫，因为下面要求"同时缺少"
  const hasSecFetch = h.has('Sec-Fetch-Dest') || h.has('Sec-Fetch-Mode');
  
  // 同时缺少语言头和 Sec-Fetch → 极大概率是自动化工具
  if (!hasAcceptLang && !hasSecFetch) return true;
  
  // Accept 头异常：只接受 JSON 或图片，不要 HTML
  const accept = h.get('Accept') || '';
  if (accept && !accept.includes('text/html') && !accept.includes('*/*')) {
    if (/application\/json|image\/|text\/plain/.test(accept)) return true;
  }
  
  // Cookie 头为空但请求了根路径（首次访问就带空 Cookie 很奇怪）
  // 这个比较激进，暂时注释掉，需要时再开
  // if (h.has('Cookie') && !h.get('Cookie')) return true;
  
  return false;
}

/* ========== Bot 页面（和客户端完全一致） ========== */

function getBotHTML(): string {
  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Go Away — Dummi</title>
<style>
:root{--bg:#0a0a0a;--text-white:#fff;--text-footer:#555;--stroke:#000}
@media(prefers-color-scheme:light){:root{--bg:#d5d5d5;--text-footer:#000}}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:"Alegreya",Georgia,"Times New Roman",serif;background:var(--bg);min-height:100vh;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;padding:2rem;transition:background .4s ease}
.bot-hello{font-size:clamp(3rem,10vw,11.71875rem);font-weight:700;color:var(--text-white);font-style:italic;white-space:nowrap;line-height:1.2;letter-spacing:.01em;text-shadow:-1px -1px 0 var(--stroke),1px -1px 0 var(--stroke),-1px 1px 0 var(--stroke),1px 1px 0 var(--stroke)}
.site-footer{margin-top:auto;padding:1.5rem;font-size:.85rem;color:var(--text-footer)}
.site-footer a{color:var(--text-footer);text-decoration:none}
.cursor{display:inline-block;width:3px;height:1em;background:var(--text-white);margin-left:4px;vertical-align:middle;animation:blink 1s steps(2) infinite}
@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
</style>
</head>
<body>
<div class="bot-hello">Hmpf! Dummi will dich sowieso nicht sehen.<span class="cursor"></span></div>
<div class="bot-hello" style="margin-top:.5rem">Um Probleme mit Web-Crawlern zu verhindern, nutzen Sie bitte Chrome, Edge, Safari oder Firefox für den Zugriff auf diese Website.</div>
<footer class="site-footer">&copy; Dummi &mdash; The Future of AI Infrastructure &middot; <a href="https://www.dummi.net">dummi.net</a></footer>
</body>
</html>`;
}

function botResponse(): Response {
  return new Response(getBotHTML(), {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'X-Robots-Tag': 'noindex, nofollow',
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff'
    }
  });
}

/* ========== Worker 入口 ========== */

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const ua = request.headers.get('User-Agent') || '';
    
    // 1. 搜索引擎爬虫 → 直接放行（SEO 必须）
    if (isSearchBot(ua)) {
      return env.ASSETS.fetch(request);
    }
    
    // 2. AI 爬虫 → 拦截
    if (isAIBot(ua)) {
      return botResponse();
    }
    
    // 3. 黑名单浏览器（UA 能识别的） → 拦截
    if (isBlockedBrowser(ua)) {
      return botResponse();
    }
    
    // 4. 请求头指纹检测 → 拦截裸爬虫
    if (hasBotFingerprint(request)) {
      return botResponse();
    }
    
    // 5. 正常请求 → 下发静态 HTML
    // 客户端 JS 还会做第二层检测（360 的 mimeTypes、external 对象等）
    return env.ASSETS.fetch(request);
  }
};
