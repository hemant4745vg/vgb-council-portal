import {
  LANE_DIVIDER, PLAYER_Z, RUNNER_LINE_Z, SPAWN_Z,
  clamp, easeOut, laneX, lerp,
} from "../game/constants";
import type { Environment, Game, Lane, ObstacleKind, PickupKind } from "../game/types";

export function project(z: number, width: number, height: number) {
  const t = clamp(1 - z / SPAWN_Z, 0, 1);
  const eased = easeOut(t);
  const horizonY = height * 0.29;
  const bottomY = height * 0.94;
  const half = lerp(width * 0.052, Math.min(width * 0.47, 410), eased);
  const y = lerp(horizonY, bottomY, eased);
  const scale = lerp(0.12, 1.16, Math.pow(eased, 1.06));
  return { t: eased, y, half, scale };
}

function rounded(ctx: CanvasRenderingContext2D, x:number,y:number,w:number,h:number,r:number) {
  const radius = Math.min(r, Math.abs(w)/2, Math.abs(h)/2);
  ctx.beginPath();
  ctx.moveTo(x+radius,y);
  ctx.arcTo(x+w,y,x+w,y+h,radius);
  ctx.arcTo(x+w,y+h,x,y+h,radius);
  ctx.arcTo(x,y+h,x,y,radius);
  ctx.arcTo(x,y,x+w,y,radius);
  ctx.closePath();
}

export function drawRunnerZone(ctx: CanvasRenderingContext2D, cx:number, width:number, height:number) {
  const line = project(RUNNER_LINE_Z,width,height);
  const near = project(PLAYER_Z,width,height);
  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,.045)";
  ctx.beginPath();
  ctx.moveTo(cx-line.half,line.y); ctx.lineTo(cx+line.half,line.y);
  ctx.lineTo(cx+near.half,near.y); ctx.lineTo(cx-near.half,near.y);
  ctx.closePath(); ctx.fill();

  ctx.strokeStyle = "rgba(255,240,190,.58)";
  ctx.lineWidth = 2;
  ctx.setLineDash([12,12]);
  ctx.beginPath(); ctx.moveTo(cx-line.half,line.y); ctx.lineTo(cx+line.half,line.y); ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = "rgba(255,255,255,.72)";
  ctx.font = "900 9px system-ui";
  ctx.textAlign = "center";
  ctx.fillText("ACTION LINE",cx,line.y+16);
  ctx.restore();
}

function drawTree(ctx:CanvasRenderingContext2D,x:number,y:number,s:number) {
  ctx.fillStyle="#69452f"; ctx.fillRect(x-3*s,y-25*s,6*s,28*s);
  ctx.fillStyle="#2e6d3b";
  for (const [dx,dy,r] of [[0,-38,15],[-10,-31,11],[10,-31,11]] as const) {
    ctx.beginPath(); ctx.arc(x+dx*s,y+dy*s,r*s,0,Math.PI*2); ctx.fill();
  }
}

function drawBuilding(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,s:number,label?:string) {
  const bw=w*s,bh=h*s,left=x-bw/2,top=y-bh;
  ctx.fillStyle="rgba(22,18,15,.24)"; ctx.fillRect(left+8*s,y-2*s,bw,6*s);
  ctx.fillStyle="#a94f37"; ctx.fillRect(left,top,bw,bh);
  ctx.fillStyle="#7f3c2d"; ctx.fillRect(left,top,Math.max(4,8*s),bh);
  ctx.fillStyle="#d8a64f"; ctx.beginPath();
  ctx.moveTo(left-3*s,top);ctx.lineTo(x,top-10*s);ctx.lineTo(left+bw+3*s,top);ctx.closePath();ctx.fill();
  const cols=Math.max(2,Math.floor(bw/Math.max(18,34*s)));
  const rows=Math.max(2,Math.floor(bh/Math.max(22,38*s)));
  for(let r=0;r<rows;r++) for(let c=0;c<cols;c++){
    const wx=left+12*s+c*((bw-24*s)/Math.max(1,cols-1));
    const wy=top+14*s+r*((bh-28*s)/Math.max(1,rows-1));
    ctx.fillStyle="#263943";ctx.fillRect(wx-4*s,wy-7*s,8*s,13*s);
  }
  if(label && s>.42){ctx.fillStyle="rgba(28,25,20,.72)";ctx.font=`900 ${Math.max(7,9*s)}px system-ui`;ctx.textAlign="center";ctx.fillText(label,x,top-13*s);}
}

function drawWalkway(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,s:number) {
  const ww=w*s, roof=y-62*s;
  ctx.fillStyle="#9a6549";ctx.fillRect(x-ww/2,roof,ww,8*s);
  const count=Math.max(3,Math.floor(ww/Math.max(22,42*s)));
  for(let i=0;i<=count;i++){const px=x-ww/2+(ww/count)*i;ctx.fillStyle="#8b4b37";ctx.fillRect(px-3*s,roof+7*s,6*s,64*s);}
  ctx.fillStyle="rgba(244,220,178,.72)";ctx.fillRect(x-ww/2,roof+2*s,ww,3*s);
}

function drawGate(ctx:CanvasRenderingContext2D,x:number,y:number,s:number) {
  const w=150*s,h=86*s;
  ctx.fillStyle="#153e71";ctx.fillRect(x-w/2,y-h,w,h);
  ctx.fillStyle="#f1f1e9";ctx.fillRect(x-w/2+7*s,y-h+7*s,w-14*s,17*s);
  ctx.fillStyle="#d6423e";ctx.beginPath();ctx.moveTo(x,y-h+34*s);ctx.lineTo(x+21*s,y-h+55*s);ctx.lineTo(x,y-h+76*s);ctx.lineTo(x-21*s,y-h+55*s);ctx.closePath();ctx.fill();
  ctx.fillStyle="#173d68";ctx.font=`900 ${Math.max(7,11*s)}px system-ui`;ctx.textAlign="center";ctx.fillText("VIDYAGYAN",x,y-h+19*s);
}

export function drawPlayer(ctx:CanvasRenderingContext2D,x:number,groundY:number,s:number,jumpY:number,sliding:boolean,lean:number) {
  const lift=jumpY*.23;
  ctx.save();ctx.translate(x,groundY-lift);ctx.rotate(lean);
  ctx.fillStyle=`rgba(0,0,0,${clamp(.28-jumpY*.003,.08,.28)})`;
  ctx.beginPath();ctx.ellipse(0,9*s+lift*.35,Math.max(8,28*s-jumpY*.15),7*s,0,0,Math.PI*2);ctx.fill();
  if(sliding){
    ctx.fillStyle="#244f88";rounded(ctx,-25*s,-23*s,48*s,23*s,8*s);ctx.fill();
    ctx.fillStyle="#e7b18b";ctx.beginPath();ctx.arc(23*s,-18*s,9*s,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#17263b";ctx.fillRect(-27*s,0,18*s,6*s);ctx.fillRect(9*s,0,20*s,6*s);
  } else {
    ctx.fillStyle="#2e5a99";rounded(ctx,-14*s,-48*s,28*s,42*s,8*s);ctx.fill();
    ctx.fillStyle="#e7b18b";ctx.beginPath();ctx.arc(0,-59*s,12*s,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#20262c";ctx.beginPath();ctx.arc(0,-64*s,12*s,Math.PI,Math.PI*2);ctx.fill();
    ctx.strokeStyle="#e7b18b";ctx.lineWidth=5*s;ctx.beginPath();ctx.moveTo(-11*s,-39*s);ctx.lineTo(-21*s,-17*s);ctx.moveTo(11*s,-39*s);ctx.lineTo(21*s,-17*s);ctx.stroke();
    ctx.strokeStyle="#203e6a";ctx.lineWidth=7*s;ctx.beginPath();ctx.moveTo(-7*s,-6*s);ctx.lineTo(-12*s,16*s);ctx.moveTo(7*s,-6*s);ctx.lineTo(13*s,16*s);ctx.stroke();
  }
  ctx.restore();
}

export function drawPickup(ctx:CanvasRenderingContext2D,x:number,y:number,s:number,kind:PickupKind,phase:number,time:number) {
  const r=Math.max(4,10*s),bob=Math.sin(time*.006+phase)*4*s;
  ctx.save();ctx.translate(x,y-26*s+bob);
  if(kind==="coin"){ctx.rotate(time*.004);ctx.fillStyle="#f3bd3e";ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.fill();ctx.strokeStyle="#fff1a4";ctx.lineWidth=Math.max(1,1.5*s);ctx.stroke();}
  else {const fill=kind==="shield"?"#42d8ff":kind==="magnet"?"#9d78ff":kind==="boost"?"#ff8c3b":"#61e6a8";ctx.fillStyle=fill;ctx.beginPath();ctx.arc(0,0,r*1.15,0,Math.PI*2);ctx.fill();ctx.fillStyle="#081624";ctx.font=`900 ${Math.max(7,10*s)}px system-ui`;ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(kind==="shield"?"S":kind==="magnet"?"M":kind==="boost"?"⚡":"×",0,1);}
  ctx.restore();
}

export function drawObstacle(ctx:CanvasRenderingContext2D, cx:number, width:number, height:number, lane:Lane, kind:ObstacleKind, z:number, now:number) {
  const p=project(z,width,height); if(p.t<=0) return;
  const x=cx+laneX(lane,p.half), laneWidth=(p.half*2)/3, w=laneWidth*.68, h=Math.max(10,38*p.scale);
  const pulse=1+Math.sin(now*.006+z*.03)*.035;
  ctx.save();ctx.translate(x,p.y);ctx.scale(pulse,1);
  if(kind==="gap"){
    ctx.fillStyle="#322b28";ctx.fillRect(-w*.62,-3*p.scale,w*1.24,7*p.scale);
    ctx.strokeStyle="#e18c43";ctx.lineWidth=Math.max(1,2*p.scale);ctx.strokeRect(-w*.62,-4*p.scale,w*1.24,9*p.scale);
    ctx.fillStyle="rgba(255,180,70,.12)";ctx.fillRect(-w*.9,0,w*1.8,4*p.scale);
  } else if(kind==="bar"){
    ctx.fillStyle="#6b3d2c";ctx.fillRect(-w*.58,-h*1.65,Math.max(4,6*p.scale),h*1.65);ctx.fillRect(w*.52,-h*1.65,Math.max(4,6*p.scale),h*1.65);
    ctx.fillStyle="#d07d32";rounded(ctx,-w*.68,-h*1.55,w*1.36,h*.26,5*p.scale);ctx.fill();
  } else {
    const wall=kind==="wall";
    ctx.fillStyle=wall?"#7c382e":"#a44b35";rounded(ctx,-w/2,-h*(wall?1.8:1),w,h*(wall?1.8:1),6*p.scale);ctx.fill();
    ctx.fillStyle="#dca54d";ctx.fillRect(-w*.36,-h*(wall?1.52:.82),w*.72,Math.max(2,h*.11));
    if(wall){ctx.fillStyle="rgba(255,255,255,.16)";ctx.fillRect(-w*.33,-h*1.25,w*.66,Math.max(2,h*.08));}
  }
  ctx.restore();
}

export function drawScene(ctx:CanvasRenderingContext2D,g:Game,width:number,height:number,now:number) {
  const cx=width/2,horizon=height*.29,roadTop=width*.075,roadBottom=Math.min(width*.47,410),time=now*.001;
  ctx.clearRect(0,0,width,height);

  ctx.save();
  if(g.shake>0){const a=g.shake*.42;ctx.translate((Math.random()-.5)*a,(Math.random()-.5)*a);}

  const night=g.environment==="gate"||g.environment==="hostels";
  const sky=ctx.createLinearGradient(0,0,0,height);
  sky.addColorStop(0,night?"#13213a":"#8dc3df");sky.addColorStop(.46,night?"#355274":"#d8e5d0");sky.addColorStop(1,night?"#18261e":"#80965e");
  ctx.fillStyle=sky;ctx.fillRect(-20,-20,width+40,height+40);

  for(let i=0;i<8;i++){const bx=i/8*width,bh=22+(i%3)*13;ctx.fillStyle=night?"rgba(24,36,49,.72)":"rgba(105,91,73,.28)";ctx.fillRect(bx,horizon-bh,width/8+8,bh);}

  ctx.beginPath();ctx.moveTo(cx-roadTop,horizon);ctx.lineTo(cx+roadTop,horizon);ctx.lineTo(cx+roadBottom,height*.96);ctx.lineTo(cx-roadBottom,height*.96);ctx.closePath();ctx.fillStyle="#c6b28d";ctx.fill();
  ctx.beginPath();ctx.moveTo(cx-roadTop*.78,horizon);ctx.lineTo(cx+roadTop*.78,horizon);ctx.lineTo(cx+roadBottom*.82,height*.96);ctx.lineTo(cx-roadBottom*.82,height*.96);ctx.closePath();ctx.fillStyle="#a86e50";ctx.fill();

  for(const divider of [-1,1] as const){ctx.strokeStyle="rgba(84,58,44,.55)";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(cx+divider*roadTop*LANE_DIVIDER,horizon);ctx.lineTo(cx+divider*roadBottom*LANE_DIVIDER,height*.96);ctx.stroke();}

  const roadScroll=(g.distance*1.9)%82;
  for(let i=-1;i<20;i++){
    const z=i*62+roadScroll+18,p=project(z,width,height); if(p.t<=0) continue;
    ctx.fillStyle=night?"rgba(225,198,120,.75)":"rgba(88,72,56,.42)";
    for(const side of [-1,1] as const){const x=cx+side*(p.half+18*p.scale);ctx.fillRect(x-2*p.scale,p.y,4*p.scale,10*p.scale);}
  }

  drawRunnerZone(ctx,cx,width,height);

  const scenery=[
    {z:780,side:-1,label:"ACADEMIC BLOCK"},
    {z:610,side:1,label:""},
    {z:430,side:-1,label:""},
    {z:270,side:1,label:""},
    {z:145,side:-1,label:""},
    {z:70,side:1,label:""},
  ];
  for(const item of scenery){
    const p=project(item.z,width,height),x=cx+item.side*(p.half+42*p.scale);
    drawBuilding(ctx,x,p.y+4*p.scale,105+(item.z%3)*20,78+(item.z%2)*35,p.scale,item.label||undefined);
    if(item.z===610||item.z===145) drawWalkway(ctx,x+item.side*60*p.scale,p.y+4*p.scale,170,p.scale);
    drawTree(ctx,cx+item.side*(p.half+12*p.scale),p.y+8*p.scale,Math.max(.16,p.scale*.8));
  }

  if(g.environment==="garden") for(let i=0;i<6;i++){const p=project(35+i*32,width,height),side=i%2?1:-1;ctx.fillStyle="#547c3f";ctx.fillRect(cx+side*(p.half+16*p.scale)-10*p.scale,p.y,20*p.scale,6*p.scale);}
  if(g.environment==="gate"){const gp=project(180,width,height);drawGate(ctx,cx,gp.y,gp.scale*.85);}

  const warning=g.obstacles.filter(o=>!o.resolved&&o.z>RUNNER_LINE_Z&&o.z<220).sort((a,b)=>a.z-b.z);
  for(const o of warning.slice(0,2)){
    const p=project(o.z,width,height),x=cx+laneX(o.lane,p.half);
    ctx.save();ctx.globalAlpha=.72;ctx.fillStyle=o.kind==="bar"?"#e8bd54":"#efb24c";ctx.beginPath();ctx.arc(x,p.y-14*p.scale,7*p.scale,0,Math.PI*2);ctx.fill();ctx.restore();
  }

  for(const o of [...g.obstacles].sort((a,b)=>b.z-a.z)) drawObstacle(ctx,cx,width,height,o.lane,o.kind,o.z,now);
  for(const p of g.pickups){if(!p.collected&&p.z>-100&&p.z<SPAWN_Z+120){const q=project(p.z,width,height);drawPickup(ctx,cx+laneX(p.lane,q.half),q.y,q.scale,p.kind,p.phase,now);}}

  const player=project(PLAYER_Z,width,height),px=cx+laneX(g.lane,player.half);
  ctx.fillStyle="rgba(255,255,255,.2)";ctx.beginPath();ctx.ellipse(px,player.y+5,34*player.scale,8*player.scale,0,0,Math.PI*2);ctx.fill();
  drawPlayer(ctx,px,player.y,clamp(player.scale,.92,1.14),g.jumpY,g.sliding,(g.targetLane-g.lane)*-.12);

  for(const p of g.particles){ctx.globalAlpha=clamp(p.life/p.maxLife,0,1);ctx.fillStyle=p.kind==="spark"?"#ffd05a":"#d8c6a7";ctx.beginPath();ctx.arc(cx+p.x,player.y-p.y,p.size,0,Math.PI*2);ctx.fill();}
  ctx.globalAlpha=1;

  if(g.speed>420){ctx.strokeStyle=`rgba(255,255,255,${clamp((g.speed-420)/1200,.03,.14)})`;for(let i=0;i<13;i++){const x=(i*97+now*.22)%width,y=horizon+((i*71+now*.14)%Math.max(1,height-horizon));ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,y+14+g.speed*.02);ctx.stroke();}}

  const vignette=ctx.createRadialGradient(cx,height*.55,height*.12,cx,height*.55,height*.78);vignette.addColorStop(0,"rgba(0,0,0,0)");vignette.addColorStop(1,"rgba(15,25,20,.55)");ctx.fillStyle=vignette;ctx.fillRect(0,0,width,height);
  if(g.flash>0){ctx.fillStyle=`rgba(255,255,255,${g.flash})`;ctx.fillRect(0,0,width,height);}
  ctx.restore();
}
