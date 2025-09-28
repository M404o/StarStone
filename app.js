async function loadDeck(){ const r = await fetch('deck.json'); return await r.json(); }
function randInt(n){return Math.floor(Math.random()*n)}

// Stone palettes (start, end, gem core, highlight)
const STONE = {
  "ルビー":        ["#3b0022","#6a0030","#ff2a6d","#ffffff"],
  "エメラルド":    ["#002418","#0a5b44","#3dffb3","#ffffff"],
  "シトリン":      ["#2a1c00","#7a5200","#ffd166","#ffffff"],
  "ムーンストーン":["#0b0f19","#2a2e45","#bcd7ff","#ffffff"],
  "タイガーアイ":  ["#1a1200","#5b3b00","#ffb703","#ffffff"],
  "ペリドット":    ["#0c2400","#2f6d00","#b8ff57","#ffffff"],
  "ラピスラズリ":  ["#020b2a","#0c2a6b","#8fb3ff","#ffffff"],
  "オブシディアン":["#04060a","#0f141d","#9fb3c8","#d0daff"],
  "ターコイズ":    ["#002a2a","#006d6d","#7af2f2","#ffffff"],
  "アメジスト":    ["#100225","#3a0a6b","#cdb6ff","#ffffff"],
  "ラブラドライト":["#0b1016","#0b3450","#9de0ff","#ffffff"],
  "アクアマリン":  ["#061824","#0a3850","#9dd6ff","#ffffff"],
  "クリスタル":    ["#0b0f19","#1a2448","#eaf2ff","#ffffff"],
  "セレナイト":    ["#0b0f19","#1c2030","#e8ecff","#ffffff"],
  "フローライト":  ["#0c0820","#2d0c4a","#bb9dff","#ffffff"],
  "ローズクォーツ":["#1c0b19","#4a1c3a","#ffb6d9","#ffffff"],
  "ガーネット":    ["#22000a","#5a001b","#ff4d6d","#ffffff"],
  "イエローカルサイト":["#241a00","#6a4a00","#ffd86b","#ffffff"],
  "スモーキークォーツ":["#0a0a0a","#1f1a16","#cdbba7","#ffffff"],
  "ヘマタイト":    ["#0b0c0f","#1d2328","#a7b3c1","#ffffff"],
  "ラリマー":      ["#061a24","#0c3850","#a7e6ff","#ffffff"],
  "ブラックトルマリン":["#030306","#0a0c12","#b8c2d0","#e6ecff"],
  "カーネリアン":  ["#220800","#5a1a00","#ff7b3a","#ffffff"],
  "マラカイト":    ["#001a12","#004d33","#3dffb3","#ffffff"],
  "クリソプレーズ":["#001a1a","#0c5a5a","#a3ffe6","#ffffff"],
  "ブルーレースアゲート":["#061424","#0c2a5a","#b6d6ff","#ffffff"],
  "隕石":          ["#05060a","#0f1320","#a3b0c0","#e6ecff"],
  "オパライト":    ["#1a0a1a","#3a1a5a","#ffd6ff","#ffffff"],
  "ムーカイト":    ["#20080a","#5a1a28","#ff9aa2","#ffffff"],
  "ブラックオニキス":["#020203","#0b0d12","#cdd6e6","#e6ecff"],
};

function gradientBackground(ctx, w, h, stone){
  const pal = STONE[stone] || ["#0c1024","#1a2448","#a7b3ff","#ffffff"];
  const g = ctx.createLinearGradient(0,0,w,h);
  g.addColorStop(0, pal[0]);
  g.addColorStop(1, pal[1]);
  ctx.fillStyle = g;
  ctx.fillRect(0,0,w,h);
  // star field
  for (let i=0;i<120;i++){
    const x = Math.random()*w, y = Math.random()*h, r = Math.random()*1.6;
    ctx.fillStyle = 'rgba(255,255,255,'+(0.2+Math.random()*0.8)+')';
    ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
  }
  // faint nebula blobs
  for (let i=0;i<3;i++){
    const nx = Math.random()*w, ny = Math.random()*h, nr = 120+Math.random()*220;
    const ng = ctx.createRadialGradient(nx,ny,0,nx,ny,nr);
    ng.addColorStop(0, pal[2]+'33');
    ng.addColorStop(1, 'transparent');
    ctx.fillStyle = ng; ctx.beginPath(); ctx.arc(nx,ny,nr,0,Math.PI*2); ctx.fill();
  }
}

function cardFrame(ctx, w, h){
  const pad=28;
  ctx.strokeStyle='rgba(200,220,255,.35)';
  ctx.lineWidth=2; ctx.strokeRect(pad,pad,w-2*pad,h-2*pad);
}

// Gem "cabochon" rendering
function drawGem(ctx, cx, cy, stone){
  const pal = STONE[stone] || ["#0c1024","#1a2448","#a7b3ff","#ffffff"];
  const r = 120;
  const rg = ctx.createRadialGradient(cx, cy, r*0.1, cx, cy, r);
  rg.addColorStop(0, pal[2]);
  rg.addColorStop(1, 'rgba(255,255,255,0.08)');
  ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.fill();
  // highlight
  const hg = ctx.createRadialGradient(cx-30, cy-40, 0, cx-30, cy-40, r*0.6);
  hg.addColorStop(0, pal[3]); hg.addColorStop(1, 'transparent');
  ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(cx-30,cy-40,r*0.6,0,Math.PI*2); ctx.fill();
  // subtle ring
  ctx.strokeStyle = 'rgba(255,255,255,.25)';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(cx,cy,r-2,0,Math.PI*2); ctx.stroke();
}

// Moon phase calc (simple approximation)
function moonPhase01(date){
  // Returns 0..1 (0 new moon, 0.5 full)
  const synodic = 29.53058867;
  const knownNewMoon = Date.UTC(2000,0,6,18,14); // Jan 6, 2000
  const days = (date.getTime() - knownNewMoon) / 86400000;
  let phase = (days % synodic) / synodic;
  if (phase<0) phase += 1;
  return phase;
}
function drawMoon(ctx, cx, cy, r){
  const phase = moonPhase01(new Date());
  // base disc
  ctx.fillStyle = '#e8ecff';
  ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = '#0b0f19';
  // terminator ellipse
  const k = Math.cos(phase*2*Math.PI);
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(cx,cy,Math.abs(k)*r, r, 0, 0, 2*Math.PI);
  ctx.clip();
  ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.fill();
  ctx.restore();
  // glow
  const g = ctx.createRadialGradient(cx, cy, r*0.2, cx, cy, r*1.6);
  g.addColorStop(0,'rgba(255,255,255,.6)');
  g.addColorStop(1,'transparent');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx,cy,r*1.6,0,Math.PI*2); ctx.fill();
}

function drawSymbolOrMoon(ctx, card, cx, cy){
  if(card.label && card.label.startsWith('月')){
    drawMoon(ctx, cx, cy, 120);
    return;
  }
  // symbol text
  ctx.fillStyle = '#e8ecff';
  ctx.textAlign = 'center';
  ctx.font = 'bold 110px system-ui, -apple-system, Segoe UI, Roboto';
  ctx.fillText(card.symbol || '★', cx, cy+35);
}

function drawCard(card, brand=true){
  const canvas = document.getElementById('card-canvas');
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0,0,w,h);
  gradientBackground(ctx, w, h, card.stone);

  cardFrame(ctx, w, h);
  const cx = w/2, cy = 260;
  drawGem(ctx, cx, cy, card.stone);
  drawSymbolOrMoon(ctx, card, cx, cy);

  // Label
  ctx.fillStyle = '#e8ecff';
  ctx.textAlign = 'center';
  ctx.font = '600 40px system-ui, -apple-system, Segoe UI, Roboto';
  ctx.fillText(card.label, cx, 480);

  // Divider
  ctx.strokeStyle = 'rgba(200,220,255,.25)';
  ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(160,520); ctx.lineTo(w-160,520); ctx.stroke();

  // Action
  ctx.font = '28px system-ui, -apple-system, Segoe UI, Roboto';
  ctx.textAlign = 'left';
  ctx.fillStyle = '#dbe2ff';
  const text = '👉 ' + (card.action || '');
  const maxWidth = w - 220;
  const x = 110, yStart = 600, lineHeight = 42;
  const chunks = [];
  let buf=''; const limit=18;
  for (const ch of text){ buf += ch; if(buf.length>=limit){chunks.push(buf); buf='';} }
  if(buf) chunks.push(buf);
  let y=yStart; for (const line of chunks){ ctx.fillText(line, x, y, maxWidth); y += lineHeight; }

  if (brand){
    ctx.textAlign = 'center';
    ctx.font = '500 22px system-ui, -apple-system, Segoe UI, Roboto';
    ctx.fillStyle = 'rgba(200,220,255,.7)';
    ctx.fillText('StarStone Daily Deck', w/2, h-40);
  }
}

async function main(){
  const deck = await loadDeck();
  const canvas = document.getElementById('card-canvas');
  const drawBtn = document.getElementById('draw-btn');
  const saveBtn = document.getElementById('save-btn');
  const copyBtn = document.getElementById('copy-btn');
  const brandToggle = document.getElementById('brand-mark');
  let current = null;

  function flip(){
    canvas.classList.add('flipping');
    setTimeout(()=>canvas.classList.remove('flipping'), 400);
  }

  drawBtn.addEventListener('click', ()=>{
    flip();
    current = deck[randInt(deck.length)];
    setTimeout(()=>{
      drawCard(current, brandToggle.checked);
      saveBtn.disabled = false;
      copyBtn.disabled = false;
    }, 200);
  });

  saveBtn.addEventListener('click', ()=>{
    if(!current) return;
    const link = document.createElement('a');
    const ts = new Date().toISOString().slice(0,10);
    link.download = `StarStone-${current.id}-${ts}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  });

  copyBtn.addEventListener('click', async ()=>{
    if(!current) return;
    const text = `【今日のStarStone】\n${current.symbol} ${current.label}\n${current.action}`;
    try{ await navigator.clipboard.writeText(text);
      copyBtn.textContent='コピー済み！'; setTimeout(()=>copyBtn.textContent='テキストをコピー',1500);
    }catch(e){ alert('コピーに失敗しました'); }
  });

  brandToggle.addEventListener('change', ()=>{ if(current) drawCard(current, brandToggle.checked); });
}

main();
