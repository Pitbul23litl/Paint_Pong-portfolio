const CHANNEL_URL = 'https://www.youtube.com/@paint_pong';

// -------- subtle interactive layer --------
const cursorGlow = document.querySelector('.cursor-glow');
let pointerX = innerWidth / 2, pointerY = innerHeight / 2, glowX = pointerX, glowY = pointerY;
window.addEventListener('pointermove', e => { pointerX=e.clientX; pointerY=e.clientY; });
function animateGlow(){ glowX += (pointerX-glowX)*.09; glowY += (pointerY-glowY)*.09; cursorGlow.style.left=glowX+'px'; cursorGlow.style.top=glowY+'px'; requestAnimationFrame(animateGlow); }
animateGlow();

// magnetic hover — lightweight, no dependencies
for(const el of document.querySelectorAll('.magnetic')){
  el.addEventListener('pointermove', e=>{
    const r=el.getBoundingClientRect(), x=e.clientX-(r.left+r.width/2), y=e.clientY-(r.top+r.height/2);
    el.style.transform=`translate(${x*.07}px,${y*.07}px)`;
  });
  el.addEventListener('pointerleave',()=>el.style.transform='');
}

// tilt cards
for(const card of document.querySelectorAll('.tilt-card')){
  card.addEventListener('pointermove',e=>{
    if(innerWidth<850) return;
    const r=card.getBoundingClientRect(), x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5;
    card.style.transform=`perspective(850px) rotateX(${y*-4}deg) rotateY(${x*5}deg) translateY(-2px)`;
  });
  card.addEventListener('pointerleave',()=>card.style.transform='');
}

// canvas particles
const canvas=document.getElementById('particles'), ctx=canvas.getContext('2d');
let dots=[];
function resizeCanvas(){canvas.width=innerWidth*devicePixelRatio; canvas.height=innerHeight*devicePixelRatio; canvas.style.width=innerWidth+'px'; canvas.style.height=innerHeight+'px'; ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0); dots=Array.from({length:Math.min(85,Math.floor(innerWidth/18))},()=>({x:Math.random()*innerWidth,y:Math.random()*innerHeight,vx:(Math.random()-.5)*.25,vy:(Math.random()-.5)*.25,r:Math.random()*1.5+.2}));}
function particleLoop(){ctx.clearRect(0,0,innerWidth,innerHeight); for(const d of dots){d.x=(d.x+d.vx+innerWidth)%innerWidth;d.y=(d.y+d.vy+innerHeight)%innerHeight;ctx.beginPath();ctx.arc(d.x,d.y,d.r,0,Math.PI*2);ctx.fillStyle='rgba(150,190,220,.35)';ctx.fill();} requestAnimationFrame(particleLoop)}
resizeCanvas(); particleLoop(); addEventListener('resize',resizeCanvas);

// reveal on scroll
const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('in')}),{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

// active navigation + scroll progress
const sections=[...document.querySelectorAll('main section[id]')], navLinks=[...document.querySelectorAll('.nav-link')], progress=document.querySelector('.scroll-progress span');
addEventListener('scroll',()=>{
  const total=document.documentElement.scrollHeight-innerHeight; progress.style.width=(total?scrollY/total*100:0)+'%';
  let current='home'; for(const s of sections){if(scrollY+innerHeight*.3>=s.offsetTop) current=s.id;}
  navLinks.forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+current));
},{passive:true});

document.getElementById('year').textContent=new Date().getFullYear();

// -------- YouTube latest feed without an API key --------
// GitHub Pages cannot safely call YouTube directly due to CORS in many browsers.
// The first proxy is tried, followed by a second fallback; if both fail the UI offers a direct channel link.
function uniq(arr){return [...new Map(arr.map(x=>[x.id,x])).values()];}
function extractVideos(html){
  const out=[]; const idRe=/(?:watch\?v=|\"videoId\":\")([A-Za-z0-9_-]{11})/g; let m;
  while((m=idRe.exec(html)) && out.length<10){
    const id=m[1]; if(out.some(v=>v.id===id)) continue;
    const start=Math.max(0,m.index-1200), chunk=html.slice(start,m.index+1800);
    let title='Paint_Pong — видео';
    const tm=chunk.match(/\"text\":\"([^\"]+)/);
    if(tm) title=tm[1].replace(/\\u0026/g,'&').replace(/\\"/g,'');
    out.push({id,title,url:`https://www.youtube.com/watch?v=${id}`});
  }
  return uniq(out).slice(0,6);
}
async function getFeed(){
  const target=encodeURIComponent(CHANNEL_URL+'/videos');
  const proxies=[`https://api.allorigins.win/raw?url=${target}`,`https://corsproxy.io/?url=${target}`];
  for(const url of proxies){
    try{const res=await fetch(url,{signal:AbortSignal.timeout(8000)}); if(!res.ok) continue; const html=await res.text(); const vids=extractVideos(html); if(vids.length) return vids;}catch(e){}
  }
  return [];
}
function renderFeed(videos){
  const box=document.getElementById('youtube-feed');
  if(!videos.length){box.innerHTML=`<div class="feed-fallback"><div class="fallback-icon">▶</div><h3>Открой свежие ролики на YouTube</h3><p>Автоматическая выборка зависит от доступности публичной YouTube-страницы. Сам сайт остаётся полностью рабочим даже без API.</p><a class="btn btn-primary magnetic" href="${CHANNEL_URL}" target="_blank" rel="noreferrer">@paint_pong ↗</a></div>`; return;}
  box.innerHTML=videos.map((v,i)=>`<a class="yt-card" href="${v.url}" target="_blank" rel="noreferrer"><img loading="lazy" src="https://i.ytimg.com/vi/${v.id}/hqdefault.jpg" alt=""><div><h4>${i===0?'LATEST · ':''}${escapeHTML(v.title)}</h4><small>WATCH ON YOUTUBE ↗</small></div></a>`).join('');
}
function escapeHTML(s){return s.replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
getFeed().then(renderFeed);
