async function loadDeck() {
  const res = await fetch('deck.json');
  return await res.json();
}

function randInt(n){return Math.floor(Math.random()*n)}

function gradientBackground(ctx, w, h) {
  const g = ctx.createLinearGradient(0,0,w,h);
  g.addColorStop(0, '#0c1024');
  g.addColorStop(1, '#1a2448');
  ctx.fillStyle = g;
  ctx.fillRect(0,0,w,h);
  // stars
  for (let i=0;i<120;i++){
    const x = Math.random()*w;
    const y = Math.random()*h;
    const r = Math.random()*1.6;
    ctx.fillStyle = 'rgba(255,255,255,'+(0.2+Math.random()*0.8)+')';
    ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
  }
}

function cardFrame(ctx, w, h) {
  const pad = 28;
  ctx.strokeStyle = 'rgba(200,220,255,.35)';
  ctx.lineWidth = 2;
  ctx.strokeRect(pad,pad,w-2*pad,h-2*pad);
}

function drawCardToCanvas(card, brand=true){
  const canvas = document.getElementById('card-canvas');
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0,0,w,h);
  gradientBackground(ctx, w, h);
  cardFrame(ctx, w, h);

  // Symbol circle
  const cx = w/2, cy = 260;
  const r = 120;
  const rg = ctx.createRadialGradient(cx, cy, r*0.2, cx, cy, r);
  rg.addColorStop(0, 'rgba(255,255,255,.9)');
  rg.addColorStop(1, 'rgba(120,160,255,.12)');
  ctx.fillStyle = rg;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2); ctx.fill();

  // Symbol text
  ctx.fillStyle = '#e8ecff';
  ctx.textAlign = 'center';
  ctx.font = 'bold 110px system-ui, -apple-system, Segoe UI, Roboto';
  ctx.fillText(card.symbol || '★', cx, cy+35);

  // Label
  ctx.font = '600 40px system-ui, -apple-system, Segoe UI, Roboto';
  ctx.fillText(card.label, cx, 480);

  // Divider
  ctx.strokeStyle = 'rgba(200,220,255,.25)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(160, 520); ctx.lineTo(w-160, 520); ctx.stroke();

  // Action text (wrap)
  ctx.font = '28px system-ui, -apple-system, Segoe UI, Roboto';
  ctx.textAlign = 'left';
  ctx.fillStyle = '#dbe2ff';

  const text = '👉 ' + (card.action || '');
  const maxWidth = w - 220;
  const x = 110, yStart = 600, lineHeight = 42;

  // Simple word wrap for Japanese/emoji: break by 18 chars approx
  const chunks = [];
  let buf = '';
  const limit = 18;
  for (const ch of text){
    buf += ch;
    if (buf.length >= limit){
      chunks.push(buf);
      buf = '';
    }
  }
  if (buf) chunks.push(buf);

  let y = yStart;
  for (const line of chunks){
    ctx.fillText(line, x, y, maxWidth);
    y += lineHeight;
  }

  if (brand){
    ctx.textAlign = 'center';
    ctx.font = '500 22px system-ui, -apple-system, Segoe UI, Roboto';
    ctx.fillStyle = 'rgba(200,220,255,.7)';
    ctx.fillText('StarStone Daily Deck', w/2, h-40);
  }
}

async function main(){
  const deck = await loadDeck();
  const drawBtn = document.getElementById('draw-btn');
  const saveBtn = document.getElementById('save-btn');
  const copyBtn = document.getElementById('copy-btn');
  const brandToggle = document.getElementById('brand-mark');
  let current = null;

  drawBtn.addEventListener('click', ()=>{
    current = deck[randInt(deck.length)];
    drawCardToCanvas(current, brandToggle.checked);
    saveBtn.disabled = false;
    copyBtn.disabled = false;
  });

  saveBtn.addEventListener('click', ()=>{
    if(!current) return;
    const canvas = document.getElementById('card-canvas');
    const link = document.createElement('a');
    const ts = new Date().toISOString().slice(0,10);
    link.download = `StarStone-${current.id}-${ts}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  });

  copyBtn.addEventListener('click', async ()=>{
    if(!current) return;
    const text = `【今日のStarStone】\n${current.symbol} ${current.label}\n${current.action}`;
    try{
      await navigator.clipboard.writeText(text);
      copyBtn.textContent = 'コピー済み！';
      setTimeout(()=>copyBtn.textContent='テキストをコピー', 1500);
    }catch(e){
      alert('コピーに失敗しました');
    }
  });

  brandToggle.addEventListener('change', ()=>{
    if(current) drawCardToCanvas(current, brandToggle.checked);
  });
}

main();
