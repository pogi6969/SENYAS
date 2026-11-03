#!/usr/bin/env python3
"""Builds SENYAS from src/: app/index.html (the app, one file), index.html (the website) and privacy.html."""
import pathlib
R = pathlib.Path(__file__).resolve().parent
S = R / "src"
rd = lambda n: (S / n).read_text(encoding="utf-8")
def js(*names): return "\n".join(rd(n) for n in names).replace("</script", "<\\/script")
policy = rd("policy.html")
logo = (R / "assets" / "senyas-logo.svg").read_text(encoding="utf-8").replace('id="sg"', 'id="lg"').replace("url(#sg)", "url(#lg)")
logo = logo[logo.index("<svg"):].replace("<title>SENYAS</title>", "").replace('role="img" aria-label="SENYAS"', 'aria-hidden="true"')
def brand(h): return h.replace('<span class="logo" aria-hidden="true"></span>', '<span class="logo">' + logo + "</span>").replace('<span class="logo"></span>', '<span class="logo">' + logo + "</span>")

app = brand(rd("app.html")).replace("/*CSS*/", rd("app.css")).replace("<!--PRIVACY-->", policy)
app = app.replace("/*JS*/", js("hand.js", "avatar.js", "data.js", "recog.js", "braille.js", "app.js"))
(R / "app").mkdir(exist_ok=True)
(R / "app" / "index.html").write_text(app, encoding="utf-8")

site = brand(rd("site.html"))
(R / "index.html").write_text(site.replace("/*JS*/", js("hand.js", "avatar.js", "data.js")), encoding="utf-8")

head, _, rest = site.partition("<main id=\"top\">")
_, _, tail = rest.partition("</main>")
foot = tail.split("<script>")[0]
priv = head.replace("<title>SENYAS · Live sign language translator</title>", "<title>SENYAS · Privacy policy and cookies</title>")
priv = priv.replace('href="#features"', 'href="index.html#features"').replace('href="#learn"', 'href="index.html#learn"').replace('href="#download"', 'href="index.html#download"').replace('href="#top"', 'href="index.html"')
priv += '<main class="wrap" style="padding:40px 16px"><div class="policy">' + policy + "</div></main>" + foot.replace('href="#" id="ckOpen"', 'href="#" id="ckOpen"')
priv += """<script>(function(){function c(n){var m=document.cookie.match(new RegExp("(?:^|; )"+n+"=([^;]*)"));return m?m[1]:null}
function s(n,v){document.cookie=n+"="+v+"; Max-Age=31536000; Path=/; SameSite=Lax"+(location.protocol==="https:"?"; Secure":"")}
var k=document.getElementById("ck");if(!c("senyas_consent"))k.hidden=false;
document.getElementById("ckYes").onclick=function(){s("senyas_consent","all");k.hidden=true};
document.getElementById("ckNo").onclick=function(){s("senyas_consent","essential");document.cookie="senyas_lang=; Max-Age=0; Path=/";k.hidden=true};
document.getElementById("ckOpen").onclick=function(e){e.preventDefault();k.hidden=false};
document.querySelectorAll(".lang button").forEach(function(b){b.onclick=function(){location.href="index.html"}});})();</script></body></html>"""
(R / "privacy.html").write_text(priv, encoding="utf-8")
print("built", len(app) // 1024, "KB app,", len(site) // 1024, "KB site")
