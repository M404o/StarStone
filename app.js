// ===== StarStone Demo Rare (move-then-freeze meteor, 1s) =====
async function loadDeck(){ const r = await fetch('deck.json'); return await r.json(); }
function randInt(n){return Math.floor(Math.random()*n)}

// 簡易パレット（必要なら追加してOK）
const STONE = {
  "ルビー":["#2a0016","#9a003b","#ff2a6d"],
  "アメジスト":["#0c0220","#4a0a8a","#cdb6ff"],
  "ムーンストーン":["#060912","#21304a","#bcd7ff"],
  "ラピスラズリ":["#02081f","#0c2a6b","#8fb3ff"],
  "ローズクォーツ":["#12070f","#5a1c4a","#ffb6d9"],
};

function gradientBackground(ctx, w, h, stone){
  const pal = STONE[stone]||["#0c1024","#1a2448","#a7b3ff"];
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

function drawBaseCard(ctx, w, h, card){
  gradientBackground(ctx, w, h, card.stone);
  // 金枠（デモは常にレア）
  ctx.strokeStyle='gold'; ctx.lineWidth=5;
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
  ctx.fillText('🌟 Rare StarStone! '+card.label, cx, 500);

  // 区切り線
  ctx.strokeStyle='rgba(200,220,255,.25)'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(140,540); ctx.lineTo(w-140,540); ctx.stroke();

  // アクション
  ctx.font='28px system-ui,-apple-system,Segoe UI,Roboto';
  ctx.textAlign='left'; ctx.fillStyle='#dbe2ff';
  const text='👉 '+(card.action||'');
  const x=110, y=620, maxWidth=w-220;
  // 日本語簡易折り返し
  const lines=[]; let buf=''; const limit=18, lh=46;
  for(const ch of text){ buf+=ch; if(buf.length>=limit){ lines.push(buf); buf=''; } }
  if(buf) lines.push(buf);
  let yy=y; for(const line of lines){ ctx.fillText(line,x,yy,maxWidth); yy+=lh; }

  // 日付スタンプ（白でクッキリ）
  const d=new Date();
  const ds=`${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日`;
  ctx.textAlign='right'; ctx.fillStyle='#fff';
  ctx.font='600 24px system-ui,-apple-system,Segoe UI,Roboto';
  ctx.fillText(ds, w-40, h-40);
}

// 流れ星アニメ：1秒で流れて停止 → その最終フレームを「写真の一瞬」として残す
function animateMeteorFreeze(canvas, card){
  const ctx=canvas.getContext('2d');
  const w=canvas.width, h=canvas.height;

  // ランダムな出現位置とベクトル
  const startX = Math.random()*w*0.6;                  // 左～中央から
  const startY = 80 + Math.random()*(h*0.4);           // 上寄り
  const dx = 220 + Math.random()*160;                  // 右下方向へ
  const dy = -80 + Math.random()*60;                   // 斜め上/下に少し
  const duration = 1000;                               // 1秒
  const trail = [];                                     // 残像用

  const t0 = performance.now();

  function step(tnow){
    const t = Math.min(1, (tnow - t0) / duration);     // 0→1
    // 背景＋カードを毎フレーム再描画（残像綺麗にするため）
    drawBaseCard(ctx, w, h, card);

    // 今の位置（イーズアウトでスッ→止まる）
    const ease = 1 - Math.pow(1 - t, 2);               // quadratic easeOut
    const x = startX + dx*ease;
    const y = startY + dy*ease;

    // 残像を記録
    trail.push({x,y,ts:tnow});
    // 最新20個だけ
    while(trail.length>20) trail.shift();

    // 残像を描画（古いほど透明）
    for(let i=0;i<trail.length;i++){
      const a = (i+1)/trail.length;                    // 0→1
      ctx.strokeStyle = `rgba(255,255,220,${a*0.9})`;
      ctx.lineWidth = 3*a + 0.5;
      ctx.beginPath();
      ctx.moveTo(trail[i].x-140*a, trail[i].y+45*a);
      ctx.lineTo(trail[i].x, trail[i].y);
      ctx.stroke();
    }

    // 星屑スパークル（レア演出）
    for(let i=0;i<24;i++){
      const sx = x - 60 + Math.random()*120;
      const sy = y - 60 + Math.random()*120;
      const r = Math.random()*1.6 + 0.4;
      const g = ctx.createRadialGradient(sx,sy,0,sx,sy,r*2);
      g.addColorStop(0,'rgba(255,255,255,.9)');
      g.addColorStop(1,'transparent');
      ctx.fillStyle=g; ctx.beginPath(); ctx.arc(sx,sy,r*2,0,Math.PI*2); ctx.fill();
    }

    if (t < 1){
      requestAnimationFrame(step);
    } else {
      // 完了：最終フレームをもう一度描いて“写真”のように静止
      drawBaseCard(ctx, w, h, card);
      // 残像を薄めに重ねて、止まった瞬間を切り取る
      ctx.strokeStyle='rgba(255,255,200,.95)';
      ctx.lineWidth=3.5;
      ctx.beginPath();
      ctx.moveTo(x-150, y+50);
      ctx.lineTo(x, y);
      ctx.stroke();
      // 余韻スパークル
      for(let i=0;i<30;i++){
        const sx = x - 70 + Math.random()*140;
        const sy = y - 70 + Math.random()*140;
        const r = Math.random()*1.8 + 0.6;
        const g = ctx.createRadialGradient(sx,sy,0,sx,sy,r*2.4);
        g.addColorStop(0,'rgba(255,255,255,.9)');
        g.addColorStop(1,'transparent');
        ctx.fillStyle=g; ctx.beginPath(); ctx.arc(sx,sy,r*2.4,0,Math.PI*2); ctx.fill();
      }
    }
  }

  requestAnimationFrame(step);
}

function drawCardAndMeteor(canvas, card){
  // まずベースカード
  const ctx=canvas.getContext('2d');
  drawBaseCard(ctx, canvas.width, canvas.height, card);
  // すぐ流れ星アニメ → 1秒後に静止画状態で残る
  animateMeteorFreeze(canvas, card);
}

async function main(){
  const deck=await loadDeck();
  const canvas=document.getElementById('card-canvas');
  const drawBtn=document.getElementById('draw-btn');
  const saveBtn=document.getElementById('save-btn');
  const copyBtn=document.getElementById('copy-btn');
  let current=null;

  drawBtn.addEventListener('click',()=>{
    current=deck[randInt(deck.length)];
    drawCardAndMeteor(canvas, current);   // ← 動いて止まる版
    saveBtn.disabled=false; copyBtn.disabled=false;
  });

  saveBtn.addEventListener('click',()=>{
    if(!current)return;
    const link=document.createElement('a');
    link.download=`StarStone-${current.id}.png`;
    link.href=canvas.toDataURL('image/png');
    link.click();
  });

  copyBtn.addEventListener('click',async()=>{
    if(!current)return;
    const d=new Date();
    const ds=`${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日`;
    const text=`【今日のStarStone】\n🌟 Rare StarStone! ${current.label}\n${current.action}\n#今日のStarStone 🌟 ${ds}`;
    await navigator.clipboard.writeText(text);
    copyBtn.textContent='コピー済み！';
    setTimeout(()=>copyBtn.textContent='テキストをコピー',1500);
  });
}
main();
// ===== end =====
