import { isSearchBot, isAutomation, hasBrowserSignature } from './patterns';

// 已知数据中心 ASN（大概率是服务器 / 爬虫）
const DATA_CENTER_ASNS = [
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
  13335,   // Cloudflare（回源请求）
];

/**
 * 严苛的请求头指纹检测
 * 任何一项不通过即视为爬虫
 */
export function hasBotFingerprint(request: Request): boolean {
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
  const secFetchDest = h.get('Sec-Fetch-Dest');
  const secFetchMode = h.get('Sec-Fetch-Mode');
  const hasSecFetch = secFetchDest !== null || secFetchMode !== null;

  if (hasSecFetch) {
    if (secFetchDest && secFetchDest !== 'document') return true;
    if (secFetchMode && secFetchMode !== 'navigate') return true;
  }

  // 7. Cloudflare 特征（Bot Management + ASN）
  const cf = (request as any).cf;
  if (cf) {
    if (cf.botManagement?.score !== undefined && cf.botManagement.score < 30) {
      return true;
    }

    if (cf.asn && DATA_CENTER_ASNS.includes(cf.asn)) {
      // 来自数据中心，且不是搜索引擎 → 极大概率是爬虫
      if (!isSearchBot(ua)) return true;
    }
  }

  return false;
}
