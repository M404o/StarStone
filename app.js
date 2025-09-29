// StarStone Tarot — Transit風 × Personal（メジャー22 × 石ことば）
async function loadTarot(){ const r = await fetch('tarot.json'); return await r.json(); }
function $(q){ return document.querySelector(q); }
function randInt(n){ return Math.floor(Math.random()*n); }

// 石パレット（背景と宝石色）
const STONE = {
  "アクアマリン":["#061824","#0a3850","#9dd6ff"],
  "アメジスト":["#0c0220","#3a0a6b","#cdb6ff"],
  "ローズクォーツ":["#1c0b19","#4a1c3a","#ffb6d9"],
  "ガーネット":["#22000a","#5a001b","#ff4d6d"],
  "ラピスラズリ":["#020b2a","#0c2a6b","#8fb3ff"],
  "ムーンストーン":["#0b0f19","#2a2e45","#bcd7ff"],
  "ルビー":["#2a0016","#9a003b","#ff2a6d"],
  "タイガーアイ":["#1a1200","#5b3b00","#ffb703"],
  "セレナイト":["#0b0f19","#1c2030","#e8ecff"],
  "ラブラドライト":["#0b1016","#0b3450","#9de0ff"],
  "ヘマタイト":["#0b0c0f","#1d2328","#a7b3c1"],
  "オブシディアン":["#04060a","#0f141d","#9fb3c8"],
  "ブラックトルマリン":["#030306","#0a0c12","#b8c2d0"],
  "クリスタル":["#070a12","#1a2448","#eaf2ff"],
  "フローライト":["#0c0820","#2d0c4a","#bb9dff"],
  "ペリドット":["#0c2400","#2f6d00","#b8ff57"],
  "シトリン":["#2a1c00","#7a5200","#ffd166"],
  "隕石":["#05060a","#0f1320","#a3b0c0"]
};

// Zodiacごとの重み（どのカードが出やすいかの“雰囲気”）
// ※本番のトランジットではここを“実惑星位置”から算出する
const WEIGHT = {
  aries:      ["戦車","皇帝","太陽","魔術師"],
  taurus:     ["女帝","法王","節制","正義"],
  gemini:     ["魔術師","恋人","運命の輪","星"],
  cancer:     ["女教皇","月","恋人","審判"],
  leo:        ["太陽","力","世界","星"],
  virgo:      ["隠者","正義","節制","女教皇"],
  libra:      ["正義","恋人","星","世界"],
  scorpio:    ["死神","悪魔","吊るされた男","審判"],
  sagittarius:["運命の輪","世界","星","太陽"],
  capricorn:  ["皇帝","審判","節制","力"],
  aquarius:   ["星","愚者","世界","魔術師"],
  pisces:     ["月","節制","女教皇","世界"]
};

// 乱数（モード別に“日付＋星座”からシード化して安定）
function seededRandom(seed){
  let s = seed % 2147483647; if (s <= 0) s += 2147483646;
  return function(){ return (s = s * 16807 % 2147483647) / 2147483647; };
}
function dailySeed(zodiac){
  const d = new Date();
  const key = `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}-${zodiac}`;
  let h=0; for (let i=0;i<key.length;i++) h = (h*31 + key.charCodeAt(i)) >>> 0;
  return h;
}
function personalSeed(zodiac){
  // 将来：生年月日/出生地/出生時刻を反映。今は星座だけで固定。
  let h=0; for (let i=0;i<zodiac.length;i++) h = (h*33 + zodiac.charCodeAt(i)) >>> 0;
  return h || 42;
}

// 背景
function drawBG(ctx,w,h,stone){
  const pal = STONE[stone] || ["#0c1024","#1a2448","#a7b3ff"];
  const g = ctx.createLinearGradient(0,0,w,h);
  g.addColorStop(0,pal[0]); g.addColorStop(1,pal[1]);
  ctx.fillStyle=g; ctx.fillRect(0,0,w,h);
  for(let i=0;i<140;i++){
    const x=Math.random()*w, y=Math.random()*h, r=Math.random()*1.6;
    ctx.fillStyle='rgba(255,255,255,'+(0.2+Math.random()*0.8)+')';
    ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
  }
  for(let i=0;i<3;i++){
    const nx=Math.random()*w, ny=Math.random()*h, nr=120+Math.random()*220;
    const ng=ctx.createRadialGradient(nx,ny,0,nx,ny,nr);
    ng.addColorStop(0,pal[2]+'44'); ng.addColorStop(1,'transparent');
    ctx.fillStyle=ng; ctx.beginPath(); ctx.arc(nx,ny,nr,0,Math.PI*2); ctx.fill();
  }
}

function wrapJP(ctx, text, x, y, maxWidth, lineHeight, limit=18){
  const lines=[]; let buf=''; for(const ch of text){ buf+=ch; if(buf.length>=limit){ lines.push(buf); buf=''; } }
  if(buf) lines.push(buf);
  for(const line of lines){ ctx.fillText(line,x,y,maxWidth); y+=lineHeight; }
}

// 1枚描画
function drawCard(canvas, card, rare){
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0,0,w,h);
  drawBG(ctx,w,h,card.stone);

  ctx.lineWidth = rare ? 6 : 3;
  ctx.strokeStyle = rare ? 'gold' : 'rgba(200,220,255,.45)';
  ctx.strokeRect(28,28,w-56,h-56);

  const cx=w/2, cy=260;
  const core = (STONE[card.stone]||[])[2] || '#ffffff';
  const rg=ctx.createRadialGradient(cx,cy,20,cx,cy,120);
  rg.addColorStop(0,core); rg.addColorStop(1,'rgba(255,255,255,0.06)');
  ctx.fillStyle=rg; ctx.beginPath(); ctx.arc(cx,cy,120,0,Math.PI*2); ctx.fill();

  // タロット名（シンボルの代わりに大きめタイトル）
  ctx.fillStyle='#fff'; ctx.textAlign='center';
  ctx.font='700 64px system-ui,-apple-system,Segoe UI,Roboto';
  ctx.fillText(card.tarot, cx, cy+25);

  // サブ：石ことば
  ctx.font='600 32px system-ui,-apple-system,Segoe UI,Roboto';
  ctx.fillStyle='#e7efff';
  ctx.fillText(`${card.stone}（${card.ishikotoba}）`, cx, 500);

  // 区切り
  ctx.strokeStyle='rgba(200,220,255,.25)';
  ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(140,540); ctx.lineTo(w-140,540); ctx.stroke();

  // メッセージ
  ctx.font='28px system-ui,-apple-system,Segoe UI,Roboto';
  ctx.textAlign='left'; ctx.fillStyle='#dbe2ff';
  wrapJP(ctx, '👉 '+card.hint, 110, 620, w-220, 46, 18);

  // 日付
  const d=new Date();
  const ds=`${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日`;
  ctx.textAlign='right'; ctx.fillStyle='#fff';
  ctx.font='600 24px system-ui,-apple-system,Segoe UI,Roboto';
  ctx.fillText(ds, w-40, h-40);
}

// 抽選（モード別）
function pickCard(tarot, zodiacKey, mode){
  let seed = mode==='transit' ? dailySeed(zodiacKey) : personalSeed(zodiacKey);
  const rnd = seededRandom(seed);

  // まず重みリストを作る（WEIGHTにあるカード名を優先）
  const pref = WEIGHT[zodiacKey] || [];
  const pool = tarot.map(t => {
    const w = pref.includes(t.tarot) ? 3 : 1; // 優先は重み3
    return {t, w};
  });

  // 重みに基づく選択
  const sum = pool.reduce((a,b)=>a+b.w,0);
  let r = rnd()*sum;
  for(const item of pool){
    if((r -= item.w) <= 0) return item.t;
  }
  return pool[0].t;
}

async function main(){
  const tarot = await loadTarot();
  const canvas = document.getElementById('card-canvas');
  const drawBtn = document.getElementById('draw-btn');
  const saveBtn = document.getElementById('save-btn');
  const copyBtn = document.getElementById('copy-btn');
  const zodiacSel = document.getElementById('zodiac');
  const modeEls = document.querySelectorAll('input[name="mode"]');
  const demoRare = document.getElementById('demo-rare');

  let current=null, rare=false;

  function flip(){ canvas.classList.add('flipping'); setTimeout(()=>canvas.classList.remove('flipping'), 300); }
  function getMode(){ return [...modeEls].find(r=>r.checked).value; }

  drawBtn.addEventListener('click', ()=>{
    flip();
    const zodiacKey = zodiacSel.value;
    const mode = getMode();
    current = pickCard(tarot, zodiacKey, mode);
    rare = demoRare.checked ? true : (Math.random()<0.05);
    setTimeout(()=> drawCard(canvas, current, rare), 150);
    saveBtn.disabled=false; copyBtn.disabled=false;
  });

  saveBtn.addEventListener('click', ()=>{
    if(!current) return;
    const link=document.createElement('a');
    link.download=`StarStoneTarot-${current.tarot}.png`;
    link.href=canvas.toDataURL('image/png');
    link.click();
  });

  copyBtn.addEventListener('click', async ()=>{
    if(!current) return;
    const d=new Date();
    const ds=`${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日`;
    const rareMark = rare ? ' 🌟' : '';
    const text = `【今日のStarStone Tarot】${rareMark}
星座：${$('#zodiac').selectedOptions[0].text}
カード：${current.tarot}（${current.en}）
石：${current.stone}／石ことば：${current.ishikotoba}
ヒント：${current.hint}
#今日のStarStone ${ds}`;
    await navigator.clipboard.writeText(text);
    copyBtn.textContent='コピー済み！';
    setTimeout(()=>copyBtn.textContent='テキストをコピー',1500);
  });
}
main();
