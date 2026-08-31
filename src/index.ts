import { Env } from './types';
import { isAIBot, isSearchBot, isBlockedBrowser } from './bot/patterns';
import { hasBotFingerprint } from './bot/fingerprint';
import { botResponse } from './bot/response';

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

    // 3. 黑名单浏览器 / App（UA 能识别的） → 拦截
    if (isBlockedBrowser(ua)) {
      return botResponse();
    }

    // 4. 严苛的请求头指纹检测 → 拦截裸爬虫 / 自动化工具 / 伪造 UA
    if (hasBotFingerprint(request)) {
      return botResponse();
    }

    // 5. 正常请求 → 下发静态 HTML
    // 客户端 JS 还会做第二层检测（Canvas / WebGL / 字体 / 音频指纹 + 反油猴）
    return env.ASSETS.fetch(request);
  },
};
