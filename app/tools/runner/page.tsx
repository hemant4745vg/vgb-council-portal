"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BEST_KEY, BANK_KEY, readStorage, writeStorage } from "./game/constants";
import { freshGame, resetRun, moveLane, startJump, startSlide, updateGame, addBurst } from "./game/engine";
import { spawnObstacleSet, spawnPickupSet } from "./game/patterns";
import { drawScene } from "./rendering/scene";
import type { Game, Phase, Pickup } from "./game/types";

export default function RunnerPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gameRef = useRef<Game | null>(null);
  const rafRef = useRef<number | null>(null);
  const touchRef = useRef<{x:number;y:number}|null>(null);
  const audioRef = useRef<AudioContext | null>(null);
  const lastHudRef = useRef(0);

  const [phase,setPhase]=useState<Phase>("menu");
  const [sound,setSound]=useState(true);
  const [hud,setHud]=useState({score:0,distance:0,coins:0,bank:0,best:0,multiplier:1,power:"",combo:0,landmark:"ACADEMIC QUADRANGLE"});

  const syncHud=useCallback(()=>{
    const g=gameRef.current;if(!g)return;
    const power=g.boostUntil>g.elapsed?"BOOST":g.magnetUntil>g.elapsed?"MAGNET":g.shield?"SHIELD":"";
    setHud({score:Math.floor(g.score),distance:Math.floor(g.distance),coins:g.runCoins,bank:g.bankCoins,best:g.best,multiplier:g.multiplier,power,combo:g.combo,landmark:g.landmark});
  },[]);

  const beep=useCallback((frequency:number,duration=.06,type:OscillatorType="sine")=>{
    if(!sound||typeof window==="undefined")return;
    try{
      const AudioCtor=window.AudioContext||(window as typeof window & {webkitAudioContext?:typeof AudioContext}).webkitAudioContext;
      if(!AudioCtor)return;
      const audio=audioRef.current??new AudioCtor();audioRef.current=audio;
      if(audio.state==="suspended")void audio.resume();
      const o=audio.createOscillator(),gain=audio.createGain();o.type=type;o.frequency.value=frequency;
      gain.gain.setValueAtTime(.0001,audio.currentTime);gain.gain.exponentialRampToValueAtTime(.07,audio.currentTime+.01);gain.gain.exponentialRampToValueAtTime(.0001,audio.currentTime+duration);
      o.connect(gain);gain.connect(audio.destination);o.start();o.stop(audio.currentTime+duration+.01);
    }catch{}
  },[sound]);

  const finish=useCallback(()=>{
    const g=gameRef.current;if(!g||g.phase!=="playing")return;
    g.phase="gameover";g.best=Math.max(g.best,Math.floor(g.score));g.bankCoins+=g.runCoins;
    writeStorage(BEST_KEY,g.best);writeStorage(BANK_KEY,g.bankCoins);g.shake=16;g.flash=.22;addBurst(g,0,0,"spark",28);
    setPhase("gameover");syncHud();beep(90,.22,"sawtooth");
  },[beep,syncHud]);

  const collectSound=useCallback((p:Pickup)=>{
    if(p.kind==="coin")beep(720,.045,"sine");
    else if(p.kind==="magnet")beep(560,.08,"triangle");
    else if(p.kind==="shield")beep(480,.1,"sine");
    else if(p.kind==="multiplier")beep(880,.1,"square");
    else beep(980,.1,"sawtooth");
  },[beep]);

  const start=useCallback(()=>{
    const g=gameRef.current;if(!g)return;
    resetRun(g);setPhase("playing");syncHud();beep(520,.08,"square");
  },[beep,syncHud]);

  const move=useCallback((direction:-1|1)=>{
    const g=gameRef.current;if(!g||g.phase!=="playing")return;
    moveLane(g,direction);beep(180,.035,"triangle");
  },[beep]);

  const jump=useCallback(()=>{
    const g=gameRef.current;if(!g||!startJump(g))return;
    addBurst(g,0,0,"dust",7);beep(420,.06,"square");
  },[beep]);

  const slide=useCallback(()=>{
    const g=gameRef.current;if(!g||!startSlide(g))return;
    beep(145,.05,"sawtooth");
  },[beep]);

  const togglePause=useCallback(()=>{
    const g=gameRef.current;if(!g||(g.phase!=="playing"&&g.phase!=="paused"))return;
    if(g.phase==="playing"){g.phase="paused";setPhase("paused");}
    else{g.phase="playing";g.last=performance.now();setPhase("playing");}
  },[]);

  useEffect(()=>{
    const best=readStorage(BEST_KEY),bank=readStorage(BANK_KEY);gameRef.current=freshGame(best,bank);setHud(h=>({...h,best,bank}));
    return()=>{if(audioRef.current)void audioRef.current.close();};
  },[]);

  useEffect(()=>{
    const onKey=(e:KeyboardEvent)=>{
      const key=e.key.toLowerCase();
      if(["arrowleft","arrowright","arrowup","arrowdown"," "].includes(key))e.preventDefault();
      if(key==="arrowleft"||key==="a")move(-1);
      else if(key==="arrowright"||key==="d")move(1);
      else if(key==="arrowup"||key==="w"||key===" ")jump();
      else if(key==="arrowdown"||key==="s")slide();
      else if(key==="p"||key==="escape")togglePause();
      else if(key==="enter"&&(phase==="menu"||phase==="gameover"))start();
    };
    window.addEventListener("keydown",onKey,{passive:false});return()=>window.removeEventListener("keydown",onKey);
  },[jump,move,phase,slide,start,togglePause]);

  useEffect(()=>{
    const canvas=canvasRef.current;if(!canvas)return;
    const ctx=canvas.getContext("2d");if(!ctx)return;
    let width=0,height=0,mounted=true;

    const resize=()=>{
      const rect=canvas.getBoundingClientRect(),dpr=Math.min(window.devicePixelRatio||1,2);
      width=Math.max(320,Math.floor(rect.width));height=Math.max(500,Math.floor(rect.height));
      canvas.width=Math.floor(width*dpr);canvas.height=Math.floor(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
    };
    resize();const observer=new ResizeObserver(resize);observer.observe(canvas);

    const tick=(now:number)=>{
      if(!mounted)return;
      const g=gameRef.current;
      if(!g){rafRef.current=requestAnimationFrame(tick);return;}
      const dt=Math.min(.034,Math.max(0,(now-(g.last||now))/1000));
      if(g.phase==="playing"){
        updateGame(g,dt,now,()=>spawnObstacleSet(g),()=>spawnPickupSet(g),finish);
        if(now-lastHudRef.current>90){lastHudRef.current=now;syncHud();}
      } else if(g.phase==="paused"){g.last=now;}
      drawScene(ctx,g,width,height,now);
      rafRef.current=requestAnimationFrame(tick);
    };

    rafRef.current=requestAnimationFrame(tick);
    return()=>{mounted=false;observer.disconnect();if(rafRef.current)cancelAnimationFrame(rafRef.current);};
  },[finish,syncHud]);

  const pointerDown=(e:React.PointerEvent<HTMLCanvasElement>)=>{
    touchRef.current={x:e.clientX,y:e.clientY};e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const pointerUp=(e:React.PointerEvent<HTMLCanvasElement>)=>{
    const startPoint=touchRef.current;touchRef.current=null;if(!startPoint)return;
    const dx=e.clientX-startPoint.x,dy=e.clientY-startPoint.y,ax=Math.abs(dx),ay=Math.abs(dy);
    if(Math.max(ax,ay)<28){if(phase==="menu"||phase==="gameover")start();else if(phase==="playing")jump();return;}
    if(ax>ay)move(dx>0?1:-1);else if(dy<0)jump();else slide();
  };

  const activePower=useMemo(()=>hud.power?hud.power:hud.multiplier>1?`×${hud.multiplier}`:"",[hud.multiplier,hud.power]);

  return <main className="runner-page">
    <section className="runner-frame">
      <header className="topbar">
        <div className="brand"><div className="brand-mark">VGB</div><div><strong>RUNNER</strong><span>VIDYAGYAN CAMPUS</span></div></div>
        <div className="top-actions">
          <div className="top-stat"><span>BEST</span><b>{hud.best.toLocaleString()}</b></div>
          <div className="top-stat"><span>BANK</span><b>◆ {hud.bank}</b></div>
          <button className="icon-btn" onClick={()=>setSound(v=>!v)} aria-label={sound?"Mute sound":"Enable sound"}>{sound?"🔊":"🔇"}</button>
          <button className="icon-btn" onClick={togglePause} disabled={phase==="menu"||phase==="gameover"} aria-label={phase==="paused"?"Resume game":"Pause game"}>{phase==="paused"?"▶":"Ⅱ"}</button>
        </div>
      </header>

      <div className="game-wrap">
        <canvas ref={canvasRef} onPointerDown={pointerDown} onPointerUp={pointerUp} aria-label="VGB Runner game canvas"/>
        <div className="hud" aria-live="polite">
          <div className="metric"><small>SCORE</small><strong>{hud.score.toLocaleString()}</strong></div>
          <div className="metric center"><small>DISTANCE</small><strong>{hud.distance}m</strong></div>
          <div className="metric right"><small>TOKENS</small><strong>◆ {hud.coins}</strong></div>
          {(activePower||hud.combo>=2)&&<div className="status-row">{activePower&&<span className="power-pill">{activePower}</span>}{hud.combo>=2&&<span className="combo-pill">COMBO ×{hud.combo}</span>}</div>}
        </div>
        {hud.landmark&&phase==="playing"&&hud.landmark!=="ACADEMIC QUADRANGLE"&&<div className="landmark-chip">{hud.landmark}</div>}
        <div className="mobile-controls">
          <button onPointerDown={()=>move(-1)} aria-label="Move left">‹</button><button onPointerDown={jump} aria-label="Jump">↑</button><button onPointerDown={slide} aria-label="Slide">↓</button><button onPointerDown={()=>move(1)} aria-label="Move right">›</button>
        </div>

        {phase==="menu"&&<div className="overlay"><div className="hero-card">
          <div className="eyebrow">VGB ARCADE · ENDLESS RUN</div><h1>RUN THE<br/><em>CAMPUS.</em></h1>
          <p>Three lanes. Brick academic blocks. Covered walkways. Gardens. The main gate. Obstacles are communicated spatially, not with countdowns.</p>
          <button className="primary" onClick={start}>START RUN <span>→</span></button>
          <div className="controls"><span>← →</span> LANES <span>↑ / SPACE</span> JUMP <span>↓</span> SLIDE</div>
          <div className="touch-note">Swipe on the track · tap to jump</div>
        </div></div>}

        {phase==="paused"&&<div className="overlay compact-overlay"><div className="pause-card">
          <div className="eyebrow">RUN PAUSED</div><h2>TRACK FROZEN.</h2><p>The track is frozen. Even the obstacles have been granted administrative leave.</p><button className="primary" onClick={togglePause}>RESUME <span>▶</span></button>
        </div></div>}

        {phase==="gameover"&&<div className="overlay"><div className="result-card">
          <div className="eyebrow">RUN COMPLETE</div><h2>RUN<br/><em>ENDED.</em></h2>
          <div className="result-grid"><div><span>SCORE</span><b>{hud.score.toLocaleString()}</b></div><div><span>DISTANCE</span><b>{hud.distance}m</b></div><div><span>TOKENS</span><b>◆ {hud.coins}</b></div><div><span>BEST</span><b>{hud.best.toLocaleString()}</b></div></div>
          <button className="primary" onClick={start}>RUN AGAIN <span>↻</span></button>
        </div></div>}
      </div>
      <footer><span>VGB RUNNER · CAMPUS EDITION</span><span>KEYBOARD · SWIPE · TOUCH</span></footer>
    </section>

    <style jsx>{`
      .runner-page{min-height:100dvh;background:radial-gradient(circle at 50% -15%,#254f55 0,#0b1713 43%,#050a08 100%);color:#f4f8f1;padding:20px;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
      .runner-frame{width:min(1280px,100%);margin:auto;border:1px solid rgba(226,210,165,.16);border-radius:24px;overflow:hidden;background:#0a120e;box-shadow:0 30px 90px rgba(0,0,0,.45)}
      .topbar{height:70px;display:flex;align-items:center;justify-content:space-between;padding:0 20px;background:rgba(11,24,17,.96);border-bottom:1px solid rgba(232,214,169,.1)}
      .brand{display:flex;align-items:center;gap:11px}.brand-mark{display:grid;place-items:center;width:42px;height:42px;border-radius:12px;background:#d5413d;color:#fff;font-size:11px;font-weight:950;letter-spacing:.04em;box-shadow:0 8px 24px rgba(213,65,61,.22)}.brand strong,.brand span{display:block}.brand strong{font-size:14px;letter-spacing:.14em}.brand span{font-size:8px;color:#d8bd75;letter-spacing:.18em;margin-top:3px}
      .top-actions{display:flex;align-items:center;gap:14px}.top-stat{display:flex;flex-direction:column;align-items:flex-end;line-height:1.05}.top-stat span{font-size:8px;color:#809184;letter-spacing:.18em}.top-stat b{font-size:12px;margin-top:4px}.icon-btn{width:34px;height:34px;border-radius:10px;border:1px solid rgba(231,214,171,.14);background:#142119;color:#f3f5ed;cursor:pointer}.icon-btn:disabled{opacity:.3;cursor:default}
      .game-wrap{position:relative;height:min(78vh,790px);min-height:560px;background:#829766;touch-action:none;user-select:none}.game-wrap canvas{display:block;width:100%;height:100%;touch-action:none}
      .hud{position:absolute;top:16px;left:20px;right:20px;display:grid;grid-template-columns:1fr 1fr 1fr;pointer-events:none;text-shadow:0 2px 10px rgba(0,0,0,.55)}.metric{display:flex;flex-direction:column}.metric.center{align-items:center}.metric.right{align-items:flex-end}.metric small{font-size:8px;font-weight:800;letter-spacing:.2em;color:#e2eadb}.metric strong{font-size:19px;letter-spacing:.01em}.status-row{position:absolute;top:49px;left:50%;transform:translateX(-50%);display:flex;gap:7px}.power-pill,.combo-pill{padding:6px 10px;border-radius:999px;font-size:9px;font-weight:900;letter-spacing:.1em;white-space:nowrap}.power-pill{background:#f0d06d;color:#34270b}.combo-pill{background:#173f2d;color:#d8f2d8;border:1px solid rgba(210,239,206,.2)}.landmark-chip{position:absolute;top:21%;left:50%;transform:translateX(-50%);padding:8px 13px;border-radius:999px;background:rgba(17,33,23,.72);border:1px solid rgba(255,245,210,.2);backdrop-filter:blur(9px);font-size:8px;letter-spacing:.16em;pointer-events:none}
      .overlay{position:absolute;inset:0;display:grid;place-items:center;background:linear-gradient(90deg,rgba(5,14,9,.73),rgba(5,14,9,.18),rgba(5,14,9,.64));backdrop-filter:blur(2px)}.compact-overlay{background:rgba(5,14,9,.52)}
      .hero-card,.result-card,.pause-card{width:min(510px,calc(100% - 36px));padding:36px;border:1px solid rgba(239,223,179,.16);border-radius:22px;background:rgba(8,18,12,.84);box-shadow:0 30px 80px rgba(0,0,0,.35);backdrop-filter:blur(14px)}.hero-card h1,.result-card h2,.pause-card h2{margin:8px 0 14px;font-size:clamp(42px,6vw,72px);line-height:.86;letter-spacing:-.055em}.hero-card h1 em,.result-card h2 em{font-style:normal;color:#d7b75f}.hero-card p,.pause-card p{max-width:460px;color:#b8c5b9;line-height:1.6;font-size:14px}.eyebrow{font-size:9px;font-weight:900;letter-spacing:.2em;color:#d7b75f}.primary{margin-top:18px;border:0;border-radius:12px;padding:13px 16px;background:#d5413d;color:#fff;font-weight:900;letter-spacing:.1em;cursor:pointer;box-shadow:0 12px 30px rgba(213,65,61,.22)}.primary span{margin-left:10px}.controls{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:22px;color:#91a093;font-size:8px;letter-spacing:.12em}.controls span{padding:6px 8px;border:1px solid rgba(231,214,171,.15);border-radius:7px;color:#eee8d9}.touch-note{margin-top:12px;font-size:9px;color:#6f7f72}.result-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:20px 0}.result-grid div{padding:12px;border-radius:12px;background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.06)}.result-grid span{display:block;font-size:8px;color:#7f9082;letter-spacing:.16em}.result-grid b{display:block;margin-top:5px;font-size:20px}.mobile-controls{display:none;position:absolute;bottom:16px;left:50%;transform:translateX(-50%);gap:8px}.mobile-controls button{width:48px;height:44px;border-radius:12px;border:1px solid rgba(255,255,255,.16);background:rgba(10,20,14,.66);color:#fff;font-size:21px;backdrop-filter:blur(10px)}footer{display:flex;justify-content:space-between;padding:13px 18px;font-size:8px;color:#657468;letter-spacing:.16em}
      @media(max-width:760px){.runner-page{padding:0}.runner-frame{border-radius:0;border:0;min-height:100dvh}.topbar{height:60px;padding:0 12px}.top-stat{display:none}.game-wrap{height:calc(100dvh - 96px);min-height:500px}.mobile-controls{display:flex}.hero-card,.result-card,.pause-card{padding:26px}.hero-card h1,.result-card h2,.pause-card h2{font-size:48px}.hud{top:12px;left:12px;right:12px}.metric strong{font-size:16px}footer{height:36px;padding:10px 12px;font-size:7px}}
      @media(min-width:761px){.game-wrap:has(.overlay) .mobile-controls{display:none}}
    `}</style>
  </main>;
}
