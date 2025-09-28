// StarStone Rotating Gem — sample for 2 stones (round / marquise)

const PAL = {
  "アメジスト": ["#2c0a56","#7b4bd6","#d9c8ff","#ffffff"],  // base, mid, highlight, rim
  "ルビー":     ["#4a001e","#c41e4a","#ff6d9a","#ffffff"]
};

let animId = null, angle = 0;

function fixedBG(ctx, w, h){
  const g = ctx.createLinearGradient(0,0,w,h);
  g.addColorStop(0,"#090c14"); g.addColorStop(1,"#111b2e");
  ctx.fillStyle=g; ctx.fillRect(0,0,w,h);
  // 固定ランダムで星
  const rnd = seeded("rot_bg");
  for(let i=0;i<160;i++){
    const x=rnd()*w, y=rnd()*h, r=rnd()*1.7+0.2;
    ctx.fillStyle=`rgba(255,255,255,${0.25+rnd()*0.7})`;
    ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
  }
}

function seeded(key){
  let s = 0; for(let i=0;i<key.length;i++) s = (s*31 + key.charCodeAt(i)) >>> 0;
  if(s<=0) s=1;
  return function(){ s = (s*1664525 + 1013904223) >>> 0; return (s & 0xffffffff) / 0x100000000; };
}

function hexA(hex,a){
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if(!m) return hex;
  const r=parseInt(m[1],16), g=parseInt(m[2],16), b=parseInt(m[3],16);
  return `rgba(${r},${g},${b},${a})`;
}

// —— ラウンドカット（多面） ——
function drawRound(ctx, cx, cy, R, pal){
  // 胴体グラデ（カボション系）
  const rg = ctx.createRadialGradient(cx,cy,R*0.18,cx,cy,R);
  rg.addColorStop(0, pal[1]);
  rg.addColorStop(0.65, pal[0]);
  rg.addColorStop(1, "#000");
  ctx.fillStyle=rg; ctx.beginPath(); ctx.arc(cx,cy,R,0,Math.PI*2); ctx.fill();

  // 面（facets）
  const rnd = seeded("round_facets");
  ctx.save(); ctx.beginPath(); ctx.arc(cx,cy,R,0,Math.PI*2); ctx.clip();
  for(let i=0;i<28;i++){
    const a1=rnd()*Math.PI*2, a2=a1+(rnd()*0.5+0.15);
    const r1=R*(0.35+rnd()*0.55), r2=R*(0.35+rnd()*0.55);
    const p1=[cx+Math.cos(a1)*r1, cy+Math.sin(a1)*r1];
    const p2=[cx+Math.cos(a2)*r2, cy+Math.sin(a2)*r2];
    const p3=[cx+Math.cos((a1+a2)/2)*R*(0.15+rnd()*0.3),
              cy+Math.sin((a1+a2)/2)*R*(0.15+rnd()*0.3)];
    const g = ctx.createLinearGradient(p1[0],p1[1],p2[0],p2[1]);
    const shade = 0.25 + rnd()*0.5;
    g.addColorStop(0, hexA(pal[1],0.10));
    g.addColorStop(0.5, hexA(pal[2],0.18+shade*0.15));
    g.addColorStop(1, hexA(pal[0],0.10));
    ctx.fillStyle=g;
    ctx.beginPath(); ctx.moveTo(p1[0],p1[1]); ctx.lineTo(p2[0],p2[1]); ctx.lineTo(p3[0],p3[1]); ctx.closePath(); ctx.fill();
  }
  ctx.restore();

  // 周縁の色分散
  const rim = ctx.createRadialGradient(cx,cy,R*0.9,cx,cy,R*1.05);
  rim.addColorStop(0,"transparent"); rim.addColorStop(1, hexA(pal[3],0.6));
  ctx.fillStyle=rim; ctx.beginPath(); ctx.arc(cx,cy,R*1.05,0,Math.PI*2); ctx.fill();

  // ハイライト
  glint(ctx, cx-R*0.35, cy-R*0.45, R*0.55);
  glint(ctx, cx+R*0.25, cy+R*0.10, R*0.35);
}

// —— マーキースカット（舟形） ——
function drawMarquise(ctx, cx, cy, R, pal){
  // 形状パス（舟形）
  const L = R*1.7, W = R*0.85;
  ctx.save();
  const grad = ctx.createLinearGradient(cx-L/2, cy, cx+L/2, cy);
  grad.addColorStop(0, pal[0]); grad.addColorStop(0.5, pal[1]); grad.addColorStop(1, pal[0]);
  ctx.fillStyle=grad;

  ctx.beginPath();
  ctx.moveTo(cx-L/2, cy);                 // 左尖り
  ctx.quadraticCurveTo(cx-L/4, cy-W, cx, cy-W); // 上辺
  ctx.quadraticCurveTo(cx+L/4, cy-W, cx+L/2, cy); // 右尖り
  ctx.quadraticCurveTo(cx+L/4, cy+W, cx, cy+W);   // 下辺
  ctx.quadraticCurveTo(cx-L/4, cy+W, cx-L/2, cy); // 左へ戻る
  ctx.closePath(); ctx.fill();

  // ファセット（中心線に沿って細かく面）
  const rnd = seeded("marq_facets");
  ctx.clip();
  for(let i=0;i<18;i++){
    const t = (i+1)/19; // 0..1
    const x = cx-L/2 + L*t;
    const g = ctx.createLinearGradient(x,cy-W, x, cy+W);
    const shade = 0.12 + rnd()*0.35;
    g.addColorStop(0, hexA(pal[2], 0.10));
    g.addColorStop(0.5, hexA(pal[2], 0.18 + shade));
    g.addColorStop(1, hexA(pal[0], 0.10));
    ctx.fillStyle = g;
    ctx.fillRect(x-2, cy-W, 4, W*2);
  }
  ctx.restore();

  // リム
  ctx.strokeStyle = hexA(pal[3], 0.8);
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(cx-L/2, cy);
  ctx.quadraticCurveTo(cx-L/4, cy-W, cx, cy-W);
  ctx.quadraticCurveTo(cx+L/4, cy-W, cx+L/2, cy);
  ctx.quadraticCurveTo(cx+L/4, cy+W, cx, cy+W);
  ctx.quadraticCurveTo(cx-L/4, cy+W, cx-L/2, cy);
  ctx.closePath(); ctx.stroke();

  // ハイライト
  glint(ctx, cx-L*0.15, cy-W*0.6, R*0.45);
  glint(ctx, cx+L*0.10, cy+W*0.25, R*0.32);
}

function glint(ctx, x, y, r){
  const g = ctx.createRadialGradient(x,y,0,x,y,r);
  g.addColorStop(0,"rgba(255,255,255,.95)");
  g.addColorStop(1,"rgba(255,255,255,0)");
  ctx.fillStyle=g; ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
}

function border(ctx, w, h, rare){
  ctx.lineWidth = rare? 6:3;
  ctx.strokeStyle = rare? 'gold' : 'rgba(200,220,255,.45)';
  ctx.strokeRect(28,28,w-56,h-56);
}

function dateStamp(ctx, w, h){
  const d=new Date();
  const ds=`${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日`;
  ctx.textAlign='right'; ctx.fillStyle='#fff'; ctx.font='600 24px system-ui,-apple-system,Segoe UI,Roboto';
  ctx.fillText(ds, w-40, h-40);
}

function drawFrame(ctx, w, h, stoneLabel, rare){
  ctx.clearRect(0,0,w,h);
  fixedBG(ctx,w,h);
  border(ctx,w,h,rare);

  // タイトル
  ctx.fillStyle='#fff'; ctx.textAlign='center';
  ctx.font='700 40px system-ui,-apple-system,Segoe UI,Roboto';
  ctx.fillText(stoneLabel, w/2, 520);

  // 区切り線
  ctx.strokeStyle='rgba(200,220,255,.25)';
  ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(140,540); ctx.lineTo(w-140,540); ctx.stroke();

  dateStamp(ctx,w,h);
}

// —— 回転アニメ
function run(stone){
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  const rare = true; // デモは常時レア枠
  const pal = PAL[stone] || PAL["アメジスト"];
  const cut = (stone === "ルビー") ? "marquise" : "round";

  // flip 演出
  canvas.classList.add('flipping');
  setTimeout(()=>canvas.classList.remove('flipping'), 280);

  // 既存アニメ停止
  if(animId) cancelAnimationFrame(animId);
  angle = 0;

  const cx = w/2, cy = 280, R = 150;

  function tick(){
    drawFrame(ctx, w, h, `${stone}（${cut==='round'?'ラウンド':'マーキース'}）`, rare);

    // 宝石だけ回転
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.translate(-cx, -cy);

    if(cut === "round") drawRound(ctx, cx, cy, R, pal);
    else drawMarquise(ctx, cx, cy, R, pal);

    ctx.restore();

    angle += 0.005; // ゆる〜く
    animId = requestAnimationFrame(tick);
  }
  tick();

  // 保存ボタンを有効化
  document.getElementById('save').disabled = false;
}

function main(){
  const stoneSel = document.getElementById('stone');
  const drawBtn = document.getElementById('draw');
  const saveBtn = document.getElementById('save');
  const canvas = document.getElementById('canvas');

  drawBtn.addEventListener('click', ()=> run(stoneSel.value));

  saveBtn.addEventListener('click', ()=>{
    const link=document.createElement('a');
    link.download=`StarStone-Rotating-${stoneSel.value}.png`;
    link.href=canvas.toDataURL('image/png');
    link.click();
  });

  // 初期表示
  run(stoneSel.value);
}

document.addEventListener('DOMContentLoaded', main);
