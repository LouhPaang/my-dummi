/* ========== AI 爬虫 ========== */
export const AI_BOT_PATTERNS = [
  /ChatGPT-User/i,
  /GPTBot/i,
  /OAI-SearchBot/i,
  /ClaudeBot/i,
  /anthropic-ai/i,
  /CCBot/i,
  /PerplexityBot/i,
  /Applebot-Extended/i,
  /Bytespider/i,
  /Amazonbot/i,
  /FacebookBot/i,
  /YouBot/i,
  /Diffbot/i,
  /ImagesiftBot/i,
  /cohere-ai/i,
  /omgili/i,
  /Webzio/i,
  /AI2Bot/i,
  /Ai2Bot-Dolma/i,
  /DataForSeoBot/i,
  /Xiaohongshu/i,
  /RedBook/i,
];

/* ========== 搜索引擎爬虫（需要放行 SEO） ========== */
export const SEARCH_BOT_PATTERNS = [
  /Googlebot/i,
  /Bingbot/i,
  /Slurp/i,
  /DuckDuckBot/i,
  /Baiduspider/i,
  /YandexBot/i,
  /Sogou.*spider/i,
  /NaverBot/i,
];

/* ========== 被拦截的浏览器 / App / 内置 WebView ========== */
export const BLOCKED_BROWSER_PATTERNS = [
  // IE / 旧 Trident
  /MSIE|Trident/i,

  // 360 系列
  /360SE|360EE|QIHU|QihooBrowser|QHBrowser|360chrome|360sou|360browser|360ENT|360Enterprise|360SafeBrowser/i,

  // QQ / 腾讯
  /QQBrowser|QQ\//i,

  // 搜狗
  /SE\s*2\.X|MetaSr|Sogou/i,

  // 搜狐
  /SohuNewsBrowser|SohuBrowser/i,

  // 夸克
  /Quark/i,

  // 悟空
  /WukongBrowser|悟空浏览器/i,

  // 豆包
  /Doubao|DoubaoBrowser|豆包/i,

  // UC
  /UCBrowser|UC\b/i,

  // 猎豹
  /LBBROWSER|LieBao/i,

  // 傲游
  /Maxthon/i,

  // 2345
  /2345Browser|2345Explorer/i,

  // 支付宝 / 淘宝
  /AlipayClient|AliApp|TBIOS|WindVane/i,
  /\bTaobao\b/i,

  // 华为浏览器
  /HuaweiBrowser/i,

  // Tabbitt / Zero / 联想 / 迅雷 / 星愿
  /Tabbitt|TabbittAI|TabbittBrowser/i,
  /ZERO|ZeroBrowser|Zero\s*Browser/i,
  /LenovoBrowser|SLBrowser|联想浏览器|SmartLenovo/i,
  /Thunder|Xunlei|迅雷浏览器|迅雷/i,
  /Twinkstar|星愿浏览器|TwinkstarBrowser/i,

  // AI 浏览器（OpenAI Atlas, Perplexity Comet, Fellou, Sigma AI, Jatter）
  /OpenAI.*Atlas|AtlasBrowser|OpenAIAtlas/i,
  /Perplexity.*Comet|CometBrowser|PerplexityComet/i,
  /Fellou|FellouBrowser/i,
  /Sigma.*AI|SigmaBrowser|SigmaAI/i,
  /Jatter|JatterBrowser/i,

  // 国内 App 内置 WebView
  /aweme|bytedancewebview|BytedanceWebview|ByteLocale/i,   // 抖音
  /Xiaohongshu|xhsapp|xhs/i,                                // 小红书
  /BiliApp|BiliDroid|bilibili/i,                            // Bilibili
  /Lark|Feishu|飞书/i,                                      // 飞书
  /Weibo/i,                                                 // 微博
  /NewsArticle|TTWebView/i,                                 // 头条
];

/* ========== 自动化工具 / 无头浏览器 / 命令行爬虫 ========== */
export const AUTOMATION_PATTERNS = [
  /HeadlessChrome/i,
  /Headless/i,
  /PhantomJS/i,
  /Selenium/i,
  /Puppeteer/i,
  /Playwright/i,
  /Crawl/i,
  /Scrape/i,
  /Spider/i,
  /Bot\//i,
  /python-requests/i,
  /urllib/i,
  /curl/i,
  /wget/i,
  /httpie/i,
  /axios/i,
  /node-fetch/i,
  /got\(/i,
  /httpx/i,
  /aiohttp/i,
  /scrapy/i,
  /mechanize/i,
  /Go-http-client/i,
  /Java\//i,
  /libwww/i,
  /facebookexternalhit/i,
  /whatsapp/i,
  /telegrambot/i,
];

/* ========== 合法浏览器签名（UA 中至少要有其中一个） ========== */
export const BROWSER_SIGNATURES = /Chrome|Chromium|Safari|Firefox|Edg|Edge|OPR|Opera|Brave|Vivaldi|DuckDuckGo|Ddg|Arc|SamsungBrowser|Mozilla/i;

/* ========== 便捷检测函数 ========== */
export function isAIBot(ua: string): boolean {
  return AI_BOT_PATTERNS.some(p => p.test(ua));
}

export function isSearchBot(ua: string): boolean {
  return SEARCH_BOT_PATTERNS.some(p => p.test(ua));
}

export function isBlockedBrowser(ua: string): boolean {
  return BLOCKED_BROWSER_PATTERNS.some(p => p.test(ua));
}

export function isAutomation(ua: string): boolean {
  return AUTOMATION_PATTERNS.some(p => p.test(ua));
}

export function hasBrowserSignature(ua: string): boolean {
  return BROWSER_SIGNATURES.test(ua);
}
