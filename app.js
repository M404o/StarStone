// ==== StarStone Flip + Rare (no meteor) ====
async function loadDeck(){ const r = await fetch('deck.json'); return await r.json(); }
function randInt(n){ return Math.floor(Math.random()*n) }

// 石ごとの色（bg1, bg2, core）
const STONE = {
  "ルビー":["#2a0016","#9a003b","#ff2a6d"],
  "アメジスト":["#0c0220","#4a0a8a","#cdb6ff"],
  "ムーンストーン":["#060912","#21304a","#bcd7ff"],
  "ラピスラズリ":["#02081f","#0c2a6b","#8fb3ff"],
  "ローズクォーツ":["#12070f","#5a1c4a","#ffb6d9"],
  "ターコイズ":["#001f1f","#008a8a","#7af2f2"],
  "ガーネット":["#22000a","#5a001b","#ff4d6d"],
  "ペリドット":["#0a1600","#3b8a00","#b8ff57"],
  "クリスタル":["#070a12","#1a2448","#eaf2ff"],
};

function bg(ctx,w,h,stone){
  const pal = STONE[stone] || ["#0c1024","#1a2448","#a7b3ff"];
  const g = ctx.createLinearGradient(0,0,w,h);
  g.addColorStop(0,pal[0]); g.addColorStop(1,pal[1]);
  ctx.fillStyle=g; ctx.fillRect(0,0,w,h);
  // 星屑
  for(let i=0;i<140;i++){
    const x=Math.random()*w, y=Math.random()*h, r=Math.random()*1.6;
    ctx.fillStyle='rgba(255,255,255,'+(0.2+Math.random()*0.8)+')';
    ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
  }
  // 星雲
  for(let i=0;i<3;i++){
    const nx=Math.random()*w, ny=Math.random()*h, nr=120+Math.random()*220;
    const ng=ctx.createRadialGradient(nx,ny,0,nx,ny,nr);
    ng.addColorStop(0, pal[2]+'44'); ng.addColorStop(1,'transparent');
    ctx.fillStyle=ng; ctx.beginPath(); ctx.arc(nx,ny,nr,0,Math.PI*2); ctx.fill();
  }
}

function drawCard(ctx,w,h,card,{rare=false}={}){
  bg(ctx,w,h,card.stone);

  // 枠：レアは金、通常は淡い青
  ctx.lineWidth = rare ? 6 : 3;
  ctx.strokeStyle = rare ? 'gold' : 'rgba(200,220,255,.45)';
  ctx.strokeRect(28,28,w-56,h-56);

  // 宝石サークル
  const cx=w/2, cy=260;
  const core=(STONE[card.stone]||[])[2] || '#ffffff';
  const rg=ctx.createRadialGradient(cx,cy,20,cx,cy,120);
  rg.addColorStop(0, core); rg.addColorStop(1,'rgba(255,255,255,0.06)');
  ctx.fillStyle=rg; ctx.beginPath(); ctx.arc(cx,cy,120,0,Math.PI*2); ctx.fill();

  // シンボル
  ctx.fillStyle='#fff'; ctx.textAlign='center';
  ctx.font='bold 110px system-ui,-apple-system,Segoe UI,Roboto';
  ctx.fillText(card.symbol||'★', cx, cy+35);

  // タイトル
  ctx.font='700 44px system-ui,-apple-system,Segoe UI,Roboto';
  const title = (rare? '🌟 Rare StarStone! ' : '') + card.label;
  ctx.fillText(title, cx, 500);

  // 区切り線
  ctx.strokeStyle='rgba(200,220,255,.25)';
  ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(140,540); ctx.lineTo(w-140,540); ctx.stroke();

  // アクション（簡易折り返し）
  ctx.font='28px system-ui,-apple-system,Segoe UI,Roboto';
  ctx.textAlign='left'; ctx.fillStyle='#dbe2ff';
  const text='👉 '+(card.action||'');
  const x=110, y=620, maxWidth=w-220;
  const lines=[]; let buf=''; const limit=18, lh=46;
  for(const ch of text){ buf+=ch; if(buf.length>=limit){ lines.push(buf); buf=''; } }
  if(buf) lines.push(buf);
  let yy=y; for(const line of lines){ ctx.fillText(line,x,yy,maxWidth); yy+=lh; }

  // 日付スタンプ（白でくっきり）
  const d=new Date();
  const ds=`${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日`;
  ctx.textAlign='right'; ctx.fillStyle='#fff';
  ctx.font='600 24px system-ui,-apple-system,Segoe UI,Roboto';
  ctx.fillText(ds, w-40, h-40);
}

async function main(){
  const deck = await loadDeck();
  const canvas = document.getElementById('card-canvas');
  const ctx = canvas.getContext('2d');
  const drawBtn = document.getElementById('draw-btn');
  const saveBtn = document.getElementById('save-btn');
  const copyBtn = document.getElementById('copy-btn');
  const demoRare = document.getElementById('demo-rare');

  let current = null;

  function flip(){
    canvas.classList.add('flipping');
    setTimeout(()=>canvas.classList.remove('flipping'), 300);
  }

  drawBtn.addEventListener('click', ()=>{
    flip();
    // レア抽選（デモチェック時は常にレア）
    const rare = demoRare.checked ? true : (Math.random() < 0.05); // 5%
    current = deck[randInt(deck.length)];
    setTimeout(()=>{ drawCard(ctx, canvas.width, canvas.height, current, {rare}); }, 150);
    saveBtn.disabled = false;
    copyBtn.disabled = false;
    // 保存・コピー時用に保持
    canvas.dataset.rare = rare ? '1' : '0';
  });

  saveBtn.addEventListener('click', ()=>{
    if(!current) return;
    const link = document.createElement('a');
    link.download = `StarStone-${current.id}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  });

  copyBtn.addEventListener('click', async ()=>{
    if(!current) return;
    const d=new Date();
    const ds=`${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日`;
    const rareMark = canvas.dataset.rare === '1' ? ' 🌟' : '';
    const text = `【今日のStarStone】${rareMark}\n${current.label}\n${current.action}\n#今日のStarStone${rareMark} ${ds}`;
    await navigator.clipboard.writeText(text);
    copyBtn.textContent='コピー済み！';
    setTimeout(()=>copyBtn.textContent='テキストをコピー', 1500);
  });
}
main();
// ==== end ====
