async function loadDeck(){ const r = await fetch('deck.json'); return await r.json(); }
function randInt(n){return Math.floor(Math.random()*n)}

//背景色と宝石パレット（簡略）
const STONE = {
  "ルビー":["#2a0016","#9a003b","#ff2a6d"],
  "アメジスト":["#0c0220","#4a0a8a","#cdb6ff"],
  "ムーンストーン":["#060912","#21304a","#bcd7ff"],
  // …必要に応じて増やす
};

function gradientBackground(ctx, w, h, stone){
  const pal = STONE[stone]||["#0c1024","#1a2448","#a7b3ff"];
  const g = ctx.createLinearGradient(0,0,w,h);
  g.addColorStop(0,pal[0]);g.addColorStop(1,pal[1]);
  ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
  for(let i=0;i<150;i++){
    const x=Math.random()*w,y=Math.random()*h,r=Math.random()*1.5;
    ctx.fillStyle='rgba(255,255,255,'+(0.2+Math.random()*0.8)+')';
    ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
  }
}

function drawRare(ctx,w,h){
  //流星
  ctx.strokeStyle='rgba(255,255,200,.8)';
  ctx.lineWidth=3;
  ctx.beginPath();
  const x1=Math.random()*w,y1=Math.random()*h;
  ctx.moveTo(x1,y1);
  ctx.lineTo(x1+150,y1-50);
  ctx.stroke();
  //キラキラ
  for(let i=0;i<30;i++){
    const x=Math.random()*w,y=Math.random()*h,r=Math.random()*1.5+0.5;
    const g=ctx.createRadialGradient(x,y,0,x,y,r*2);
    g.addColorStop(0,'rgba(255,255,255,.9)');g.addColorStop(1,'transparent');
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r*2,0,Math.PI*2);ctx.fill();
  }
}

function drawCard(card){
  const canvas=document.getElementById('card-canvas');
  const ctx=canvas.getContext('2d');
  const w=canvas.width,h=canvas.height;
  ctx.clearRect(0,0,w,h);
  gradientBackground(ctx,w,h,card.stone);
  //金枠
  ctx.strokeStyle='gold';ctx.lineWidth=5;
  ctx.strokeRect(28,28,w-56,h-56);

  //宝石円
  const cx=w/2,cy=260;
  ctx.fillStyle=STONE[card.stone]?STONE[card.stone][2]:'#ffffff';
  ctx.beginPath();ctx.arc(cx,cy,120,0,Math.PI*2);ctx.fill();

  //シンボル
  ctx.fillStyle='#fff';
  ctx.textAlign='center';
  ctx.font='bold 110px system-ui';
  ctx.fillText(card.symbol||'★',cx,cy+35);

  //タイトル
  ctx.font='700 44px system-ui';
  ctx.fillText('🌟 Rare StarStone! '+card.label,cx,500);

  //アクション
  ctx.font='28px system-ui';
  ctx.textAlign='left';
  ctx.fillStyle='#dbe2ff';
  const text='👉 '+(card.action||'');
  ctx.fillText(text,110,620);

  //日付スタンプ
  const d=new Date();
  const ds=`${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日`;
  ctx.font='24px system-ui';
  ctx.fillStyle='#fff';
  ctx.textAlign='right';
  ctx.fillText(ds,w-40,h-40);

  drawRare(ctx,w,h);
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
    drawCard(current);
    saveBtn.disabled=false;copyBtn.disabled=false;
  });

  saveBtn.addEventListener('click',()=>{
    if(!current)return;
    const link=document.createElement('a');
    const d=new Date();
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
