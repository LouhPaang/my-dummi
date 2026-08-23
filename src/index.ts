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

// 无头浏览器 / 自动化工具 / 命令行爬虫
const AUTOMATION_PATTERNS = [
  /HeadlessChrome/i, /Headless/i,
  /PhantomJS/i, /Selenium/i, /Puppeteer/i, /Playwright/i,
  /Crawl/i, /Scrape/i, /Spider/i, /Bot\//i,
  /python-requests/i, /urllib/i, /curl/i, /wget/i,
  /httpie/i, /axios/i, /node-fetch/i, /got\(/i,
  /httpx/i, /aiohttp/i, /scrapy/i, /mechanize/i,
  /Go-http-client/i, /Java\//i, /libwww/i,
  /facebookexternalhit/i, /whatsapp/i, /telegrambot/i
];

// 合法浏览器标识（UA 里必须有至少一个，否则视为未知爬虫）
const BROWSER_SIGNATURES = /Chrome|Chromium|Safari|Firefox|Edg|Edge|OPR|Opera|Brave|Vivaldi|DuckDuckGo|Ddg|Arc|SamsungBrowser|Mozilla/i;

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

function isAutomation(ua: string): boolean {
  return AUTOMATION_PATTERNS.some(p => p.test(ua));
}

function hasBrowserSignature(ua: string): boolean {
  return BROWSER_SIGNATURES.test(ua);
}

/**
 * 严苛的请求头指纹检测
 * 任何一项不通过即视为爬虫
 */
function hasBotFingerprint(request: Request): boolean {
  const h = request.headers;
  const ua = h.get('User-Agent') || '';

  // 0. 请求方法：只允许 GET / HEAD
  if (request.method !== 'GET' && request.method !== 'HEAD') return true;

  // 1. UA 基础检查
  if (!ua || ua.length < 20) return true;

  // 2. 无头 / 自动化工具
  if (isAutomation(ua)) return true;

  // 3. UA 必须包含合法浏览器标识（搜索引擎除外）
  if (!hasBrowserSignature(ua) && !isSearchBot(ua)) return true;

  // 4. 关键 Header 必须存在
  if (!h.has('Accept')) return true;
  if (!h.has('Accept-Language')) return true;
  if (!h.has('Accept-Encoding')) return true;

  // 5. Accept 头必须包含 text/html 或 */*
  const accept = h.get('Accept') || '';
  if (!accept.includes('text/html') && !accept.includes('*/*')) return true;

  // 6. Sec-Fetch 检查（现代浏览器）
  // Chrome 76+, Edge 79+, Firefox 90+, Safari 16.4+ 都会带
  const secFetchDest = h.get('Sec-Fetch-Dest');
  const secFetchMode = h.get('Sec-Fetch-Mode');
  const hasSecFetch = secFetchDest !== null || secFetchMode !== null;

  if (hasSecFetch) {
    // 如果带了 Sec-Fetch，对于主页面请求：
    // Dest 必须是 document
    if (secFetchDest && secFetchDest !== 'document') return true;
    // Mode 必须是 navigate
    if (secFetchMode && secFetchMode !== 'navigate') return true;
  }

  // 7. Cloudflare 特征（如果可用）
  const cf = (request as any).cf;
  if (cf) {
    // Bot Management 分数（需订阅，但有就利用）
    if (cf.botManagement?.score !== undefined && cf.botManagement.score < 30) return true;

    // 已知数据中心 ASN（大概率是服务器/爬虫，非家用宽带）
    // 来自数据中心 + 不是搜索引擎 = 可疑
    const dataCenterASNs = [
      16509,   // Amazon AWS
      15169,   // Google Cloud
      8075,    // Microsoft Azure
      14061,   // DigitalOcean
      63949,   // Linode
      16276,   // OVH
      132203,  // Tencent
      45090,   // Alibaba
      37963,   // Alibaba (Hangzhou)
      14618,   // Amazon
      20473,   // Vultr
      24940,   // Hetzner
      9009,    // M247
      60068,   // CDN77
      54113,   // Fastly
      13335,   // Cloudflare (如果是回源请求)
    ];
    if (cf.asn && dataCenterASNs.includes(cf.asn)) {
      // 来自数据中心，且不是搜索引擎 → 极大概率是爬虫
      if (!isSearchBot(ua)) return true;
    }
  }

  return false;
}

/* ========== Bot 页面 ========== */

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

    // 4. 严苛的请求头指纹检测 → 拦截裸爬虫 / 自动化工具 / 伪造 UA
    if (hasBotFingerprint(request)) {
      return botResponse();
    }

    // 5. 正常请求 → 下发静态 HTML
    // 客户端 JS 还会做第二层检测（360 的 mimeTypes、external 对象等）
    return env.ASSETS.fetch(request);
  }
};
