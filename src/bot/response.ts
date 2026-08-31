export function getBotHTML(): string {
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
.bot-subtext{font-size:clamp(1rem,3vw,2rem);color:var(--text-white);margin-top:1.5rem;max-width:800px;line-height:1.6}
.site-footer{margin-top:auto;padding:1.5rem;font-size:.85rem;color:var(--text-footer)}
.site-footer a{color:var(--text-footer);text-decoration:none}
.cursor{display:inline-block;width:3px;height:1em;background:var(--text-white);margin-left:4px;vertical-align:middle;animation:blink 1s steps(2) infinite}
@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
</style>
</head>
<body>
<div class="bot-hello">Hmpf! Dummi will dich sowieso nicht sehen.<span class="cursor"></span></div>
<div class="bot-subtext">Um Probleme mit Web-Crawlern zu verhindern, nutzen Sie bitte Chrome, Edge, Safari oder Firefox für den Zugriff auf diese Website.</div>
<footer class="site-footer">&copy; 2026 Dummi &mdash; The Future of AI Infrastructure &middot; <a href="https://www.dummi.net">dummi.net</a></footer>
</body>
</html>`;
}

export function botResponse(): Response {
  return new Response(getBotHTML(), {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'X-Robots-Tag': 'noindex, nofollow',
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
