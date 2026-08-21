// src/index.ts
export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const userAgent = request.headers.get('User-Agent') || '';

    // ---------- 黑名单（拦截） ----------
    const blockedAgents: RegExp[] = [
      // AI 爬虫
      /GPTBot/i, /ChatGPT-User/i, /OAI-SearchBot/i, /ClaudeBot/i,
      /anthropic-ai/i, /CCBot/i, /PerplexityBot/i, /Applebot-Extended/i,
      /Bytespider/i, /Amazonbot/i, /FacebookBot/i, /YouBot/i,
      /Diffbot/i, /ImagesiftBot/i, /cohere-ai/i, /omgili/i, /Webzio/i,
      /AI2Bot/i, /Ai2Bot-Dolma/i, /DataForSeoBot/i,
      // 小红书
      /Xiaohongshu/i, /RedBook/i, /小红书/i,
      // 国产浏览器（含手机）
      /360SE|360EE|QIHU|QihooBrowser|QHBrowser|360chrome|360sou|360browser/i,
      /360ENT|360Enterprise|360SafeBrowser/i,
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
      // 支付宝/淘宝内置
      /AlipayClient|AliApp|TBIOS|WindVane|Taobao/i,
      // 华为浏览器
      /HuaweiBrowser/i,
    ];

    // ---------- 白名单（放行搜索引擎） ----------
    const searchBots: RegExp[] = [
      /Googlebot/i, /Bingbot/i, /Slurp/i, /DuckDuckBot/i,
      /Baiduspider/i, /YandexBot/i, /Sogou.*spider/i, /NaverBot/i,
    ];

    // 1. 如果是搜索引擎 → 放行（让它们正常抓取）
    if (searchBots.some(bot => bot.test(userAgent))) {
      return fetch(request);
    }

    // 2. 如果匹配黑名单 → 返回 403 错误页
    if (blockedAgents.some(agent => agent.test(userAgent))) {
      return new Response(
        `
        <!DOCTYPE html>
        <html lang="de">
        <head><meta charset="UTF-8"><title>Zugriff verweigert</title></head>
        <body style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;background:#f5f5f5;color:#333;margin:0;">
          <div style="text-align:center;max-width:600px;padding:2rem;">
            <h1 style="font-size:3rem;">🚫</h1>
            <p style="font-size:1.5rem;font-weight:bold;">Hmpf! Dummi will dich sowieso nicht sehen.</p>
            <p style="font-size:1.2rem;">Um Probleme mit Web-Crawlern zu verhindern, nutzen Sie bitte Chrome, Edge, Safari oder Firefox für den Zugriff auf diese Website.</p>
            <p style="color:#999;font-size:0.9rem;margin-top:2rem;">— Dummi</p>
          </div>
        </body>
        </html>
        `,
        {
          status: 403,
          headers: { 'Content-Type': 'text/html' },
        }
      );
    }

    // 3. 其他所有请求 → 正常放行（转发到你的源站）
    return fetch(request);
  },
};
