"use client";

import { useEffect } from "react";

export default function RihanBirthdayExperience() {
  useEffect(() => {
    const screens = {
      home: document.getElementById("home"),
      letter: document.getElementById("letter"),
      final: document.getElementById("final"),
    };

    const whiteFlash = document.getElementById("whiteFlash")!;
    const startGift = document.getElementById("startGift")!;
    const ribbonOverlay = document.getElementById("ribbonOverlay")!;
    const bowCenter = document.getElementById("bowCenter")!;
    const letterContinue = document.getElementById("letterContinue")!;
    const letterCard = document.getElementById("letterCard")!;
    const finalWrap = document.getElementById("finalWrap")!;
    const wishCake = document.getElementById("wishCake")!;
    const returnHome = document.getElementById("returnHome")!;

    let isRibbonUntied = false;

    function showScreen(id: "home" | "letter" | "final") {
      Object.values(screens).forEach((screen) => {
        screen?.classList.remove("active");
      });
      screens[id]?.classList.add("active");
    }

    function openGift() {
      whiteFlash.classList.add("active");
      setTimeout(() => {
        showScreen("letter");
        setTimeout(() => {
          whiteFlash.classList.remove("active");
        }, 100);
      }, 400);
    }

    function handleStartGiftKeydown(event: Event) {
      const keyboardEvent = event as KeyboardEvent;
      if (keyboardEvent.key === "Enter" || keyboardEvent.key === " ") {
        keyboardEvent.preventDefault();
        openGift();
      }
    }

    function untieRibbon() {
      if (isRibbonUntied) return;
      isRibbonUntied = true;
      ribbonOverlay.classList.add("untied");
      setTimeout(() => {
        (ribbonOverlay as HTMLElement).style.display = "none";
      }, 900);
    }

    function handleBowKeydown(event: Event) {
      const keyboardEvent = event as KeyboardEvent;
      if (keyboardEvent.key === "Enter" || keyboardEvent.key === " ") {
        keyboardEvent.preventDefault();
        untieRibbon();
      }
    }

    function handleLetterCardClick(event: Event) {
      if (!isRibbonUntied) return;
      const target = event.target;
      if (target instanceof Element && target.closest(".letter-cta")) return;
      if (!letterCard.classList.contains("is-flipped")) {
        letterCard.classList.add("is-flipped");
      }
    }

    function makeWish() {
      if (finalWrap.classList.contains("wished")) return;
      finalWrap.classList.add("wished");
    }

    function handleWishCakeKeydown(event: Event) {
      const keyboardEvent = event as KeyboardEvent;
      if (keyboardEvent.key === "Enter" || keyboardEvent.key === " ") {
        keyboardEvent.preventDefault();
        makeWish();
      }
    }

    function handleLetterContinue() {
      showScreen("final");
    }

    function resetExperience() {
      isRibbonUntied = false;
      ribbonOverlay.classList.remove("untied");
      (ribbonOverlay as HTMLElement).style.display = "block";
      letterCard.classList.remove("is-flipped");
      finalWrap.classList.remove("wished");
      whiteFlash.classList.add("active");
      setTimeout(() => {
        showScreen("home");
        setTimeout(() => {
          whiteFlash.classList.remove("active");
        }, 100);
      }, 400);
    }

    function handleReturnHome() {
      resetExperience();
    }

    startGift.addEventListener("click", openGift);
    startGift.addEventListener("keydown", handleStartGiftKeydown);
    bowCenter.addEventListener("click", untieRibbon);
    bowCenter.addEventListener("keydown", handleBowKeydown);
    letterCard.addEventListener("click", handleLetterCardClick);
    letterContinue.addEventListener("click", handleLetterContinue);
    wishCake.addEventListener("click", makeWish);
    wishCake.addEventListener("keydown", handleWishCakeKeydown);
    returnHome.addEventListener("click", handleReturnHome);

    showScreen("home");

    return () => {
      startGift.removeEventListener("click", openGift);
      startGift.removeEventListener("keydown", handleStartGiftKeydown);
      bowCenter.removeEventListener("click", untieRibbon);
      bowCenter.removeEventListener("keydown", handleBowKeydown);
      letterCard.removeEventListener("click", handleLetterCardClick);
      letterContinue.removeEventListener("click", handleLetterContinue);
      returnHome.removeEventListener("click", handleReturnHome);
      wishCake.removeEventListener("click", makeWish);
      wishCake.removeEventListener("keydown", handleWishCakeKeydown);
    };
  }, []);

  return (
    <>
      <meta charSet="UTF-8" />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
      />
      <meta name="theme-color" content="#090815" />
      <title>A Little Something for Bushara</title>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&family=Pacifico&display=swap"
        rel="stylesheet"
      />
      <style>{`
/* =========================================================
   ROOT
========================================================= */
:root{
    --night:#090815;
    --night2:#120d20;
    --plum:#21132c;
    --wine:#702f4d;

    --rose:#ed91b2;
    --rose2:#ffbfd4;
    --lav:#b39be9;

    --gold:#e5c875;
    --gold2:#fff1b1;

    --paper:#fffaf0;
    --paper2:#f0e4d2;

    --ink:#35252b;
    --ink2:#624951;

    --white:#fffaff;
    --muted:#cfc4d5;

    --ease:cubic-bezier(.16,.82,.2,1);
}

/* =========================================================
   RESET
========================================================= */
*{
    box-sizing:border-box;
    -webkit-tap-highlight-color:transparent;
}

html,
body{
    width:100%;
    height:100%;
    min-height:100%;
    margin:0;
    overflow:hidden;
    background:var(--night);
}

body{
    font-family:"DM Sans",Arial,sans-serif;
    color:var(--white);
    overscroll-behavior:none;
}

button{
    font:inherit;
}

button,
.home-gift-wrapper,
.cake-container{
    user-select:none;
    -webkit-user-select:none;
}

/* =========================================================
   APP / SCREENS
========================================================= */
#app{
    position:relative;
    width:100%;
    height:100dvh;
    min-height:100%;
    overflow:hidden;
    background:
        radial-gradient(circle at 50% 20%,rgba(126,82,151,.14),transparent 34%),
        radial-gradient(circle at 20% 80%,rgba(220,103,151,.08),transparent 28%),
        linear-gradient(145deg,var(--night),var(--night2) 55%,#0b0813);
}

.screen{
    position:absolute;
    inset:0;
    display:flex;
    align-items:center;
    justify-content:center;
    padding:
        max(15px,env(safe-area-inset-top))
        max(15px,env(safe-area-inset-right))
        max(15px,env(safe-area-inset-bottom))
        max(15px,env(safe-area-inset-left));

    opacity:0;
    visibility:hidden;
    pointer-events:none;
    transform:scale(.985);
    transition:
        opacity .65s var(--ease),
        transform .8s var(--ease),
        visibility 0s linear .65s;
}

.screen.active{
    opacity:1;
    visibility:visible;
    pointer-events:auto;
    transform:scale(1);
    transition:
        opacity .65s var(--ease),
        transform .8s var(--ease),
        visibility 0s;
}

/* =========================================================
   BACKGROUND
========================================================= */
.stars{
    position:absolute;
    inset:0;
    overflow:hidden;
    pointer-events:none;
}

.star{
    position:absolute;
    width:2px;
    height:2px;
    border-radius:50%;
    background:#fff;
    opacity:.5;
    animation:twinkle 3s infinite ease-in-out;
}

.star:nth-child(1){left:8%;top:15%;animation-delay:.2s}
.star:nth-child(2){left:17%;top:72%;animation-delay:1.1s}
.star:nth-child(3){left:28%;top:24%;animation-delay:2s}
.star:nth-child(4){left:38%;top:82%;animation-delay:.7s}
.star:nth-child(5){left:51%;top:13%;animation-delay:1.7s}
.star:nth-child(6){left:64%;top:73%;animation-delay:.3s}
.star:nth-child(7){left:76%;top:21%;animation-delay:2.2s}
.star:nth-child(8){left:87%;top:61%;animation-delay:1.4s}
.star:nth-child(9){left:94%;top:12%;animation-delay:.5s}
.star:nth-child(10){left:45%;top:48%;animation-delay:2.4s}
.star:nth-child(11){left:12%;top:44%;animation-delay:1.6s}
.star:nth-child(12){left:82%;top:86%;animation-delay:.9s}

@keyframes twinkle{
    0%,100%{opacity:.18;transform:scale(.7)}
    50%{opacity:.85;transform:scale(1.5)}
}

.ambient{
    position:absolute;
    width:min(50vw,520px);
    aspect-ratio:1;
    border-radius:50%;
    background:radial-gradient(circle,rgba(232,135,180,.12),transparent 65%);
    filter:blur(20px);
    pointer-events:none;
}

.ambient.a{
    left:-18%;
    bottom:-30%;
}

.ambient.b{
    right:-18%;
    top:-25%;
}

/* =========================================================
   COMMON UI
========================================================= */
.eyebrow{
    margin:0 0 clamp(6px,1vh,12px);
    color:var(--gold2);
    font-size:clamp(.6rem,.75vw,.75rem);
    font-weight:700;
    letter-spacing:.24em;
    text-transform:uppercase;
}

.screen-title{
    margin:0;
    font-size:clamp(1.8rem, 3.5vw, 3rem);
    line-height:.95;
    letter-spacing:-.045em;
}

.screen-subtitle{
    max-width:550px;
    margin:clamp(10px,1.5vh,16px) auto 0;
    color:var(--muted);
    font-size:clamp(.85rem,1.1vw,1rem);
    line-height:1.65;
}

.center{
    position:relative;
    z-index:2;
    width:100%;
    text-align:center;
}

/* =========================================================
   CARTOONISTIC DOODLES (OUTER EDGES, WIDELY SPACED)
========================================================= */
.doodle {
    position: absolute;
    pointer-events: none;
    z-index: 1;
    opacity: 0.65;
    animation: floatDoodle 6s infinite ease-in-out alternate;
}
.doodle svg {
    width: 100%; height: 100%;
    filter: drop-shadow(0 0 10px currentColor);
}

@keyframes floatDoodle {
    0% { transform: translateY(0) rotate(0deg); }
    100% { transform: translateY(-20px) rotate(5deg); }
}
@keyframes swayDoodle {
    0% { transform: rotate(-5deg); }
    100% { transform: rotate(5deg); }
}

/* --- HOME (5 Items) --- */
.doodle-moon { top: 10%; left: 5%; width: 110px; height: 110px; color: #fff1b1; animation-delay: 0s; }
.doodle-cloud { top: 12%; right: 5%; width: 120px; height: 120px; color: #ed91b2; animation-delay: 1.5s; }
.doodle-tiny-star { top: 50%; right: 4%; width: 60px; height: 60px; color: #b39be9; animation-delay: 0.5s; }
.doodle-rocket { bottom: 10%; left: 6%; width: 100px; height: 100px; color: #b39be9; animation-delay: 3s; }
.doodle-shooting { bottom: 12%; right: 8%; width: 130px; height: 130px; color: #fff1b1; animation-delay: 1s; }

/* --- LETTER (5 Items) --- */
.doodle-bird { top: 10%; left: 8%; width: 90px; height: 90px; color: #fff1b1; animation-delay: 1s; }
.doodle-env { top: 12%; right: 6%; width: 100px; height: 100px; color: #b39be9; animation-delay: 0.5s; }
.doodle-heart { top: 45%; left: 4%; width: 80px; height: 80px; color: #ed91b2; animation-delay: 1.5s; }
.doodle-ink { bottom: 10%; left: 8%; width: 75px; height: 75px; color: #b39be9; animation-delay: 0s; }
.doodle-quill { bottom: 12%; right: 5%; width: 110px; height: 110px; color: #fff1b1; animation-delay: 2s; }

/* --- FINAL (5 Items) --- */
.doodle-music { top: 12%; left: 6%; width: 70px; height: 70px; color: #ed91b2; animation-delay: 1s; }
.doodle-bunting { top: 0%; right: 0%; width: 160px; height: 160px; animation-delay: 2.5s; animation: swayDoodle 8s infinite ease-in-out alternate; }
.doodle-gift { top: 50%; right: 4%; width: 90px; height: 90px; color: #b39be9; animation-delay: 0.2s; }
.doodle-cake-dood { bottom: 10%; left: 8%; width: 120px; height: 120px; color: #fff1b1; animation-delay: 0.5s; }
.doodle-balloons { bottom: 8%; right: 6%; width: 120px; height: 120px; color: #ed91b2; animation-delay: 1.5s; }

/* Responsive adjustments */
@media(max-width:850px){
    /* Home */
    .doodle-moon { top: 3%; left: 4%; width: 65px; height: 65px; }
    .doodle-cloud { top: 5%; right: 4%; width: 70px; height: 70px; }
    .doodle-tiny-star { top: 8%; left: 45%; width: 45px; height: 45px; } 
    .doodle-rocket { bottom: 3%; left: 5%; width: 70px; height: 70px; }
    .doodle-shooting { bottom: 6%; right: 5%; width: 80px; height: 80px; }

    /* Letter */
    .doodle-bird { top: 3%; left: 5%; width: 65px; height: 65px; }
    .doodle-env { top: 4%; right: 5%; width: 70px; height: 70px; }
    .doodle-heart { top: -2%; left: 40%; width: 55px; height: 55px; }
    .doodle-ink { bottom: 3%; left: 35%; width: 55px; height: 55px; } 
    .doodle-quill { bottom: 4%; right: 5%; width: 70px; height: 70px; }

    /* Final */
    .doodle-music { top: 5%; left: 5%; width: 50px; height: 50px; }
    .doodle-bunting { top: -2%; right: -2%; width: 100px; height: 100px; }
    .doodle-gift { bottom: 12%; left: 45%; width: 65px; height: 65px; } 
    .doodle-cake-dood { bottom: 4%; left: 5%; width: 75px; height: 75px; }
    .doodle-balloons { bottom: 3%; right: 5%; width: 75px; height: 75px; }
}


/* =========================================================
   HOME - THE GLOWING GIFT
========================================================= */
.home-content{
    position:relative;
    z-index:3;
    width:min(800px,90vw);
    text-align:center;
}

.home-content .screen-title{
    max-width:700px;
    margin-inline:auto;
}

.home-object-area{
    position:relative;
    width:min(250px,40vw);
    height:min(160px,25vh);
    margin:clamp(15px,3vh,30px) auto clamp(10px,2vh,20px);
    display:flex;
    align-items:center;
    justify-content:center;
}

/* Custom Minimalist Glowing Gift */
.home-gift-wrapper {
    position: relative; 
    width: 100px; 
    height: 100px;
    cursor: pointer; 
    z-index: 10;
    transition: transform 0.4s var(--ease);
    animation: floatGift 3s infinite ease-in-out alternate;
}
.home-gift-wrapper:hover { transform: scale(1.1); }
.home-gift-wrapper:active { transform: scale(0.95); }

.home-gift-box {
    position: absolute; 
    left: 15%; right: 15%; bottom: 15%; height: 50%;
    background: linear-gradient(135deg, rgba(179, 155, 233, 0.6), rgba(237, 145, 178, 0.6));
    border-radius: 8px; 
    border: 2px solid rgba(255,255,255,0.4);
    box-shadow: 0 0 30px rgba(237, 145, 178, 0.5);
}
.home-gift-lid {
    position: absolute; 
    left: 10%; right: 10%; bottom: 60%; height: 20%;
    background: linear-gradient(135deg, rgba(255, 241, 177, 0.9), rgba(229, 200, 117, 0.9));
    border-radius: 6px; 
    box-shadow: 0 4px 10px rgba(0,0,0,0.2);
}
.home-gift-ribbon-v {
    position: absolute; 
    left: 50%; bottom: 15%; width: 15%; height: 65%;
    transform: translateX(-50%); 
    background: rgba(255, 255, 255, 0.9);
}
.home-gift-bow {
    position: absolute; 
    left: 50%; bottom: 75%; width: 40px; height: 20px;
    transform: translateX(-50%);
}
.home-gift-bow::before, .home-gift-bow::after {
    content: ''; 
    position: absolute; top: 0; width: 50%; height: 100%;
    border: 4px solid rgba(255, 241, 177, 0.9); 
    border-radius: 50%;
}
.home-gift-bow::before { left: 0; transform: rotate(-15deg); }
.home-gift-bow::after { right: 0; transform: rotate(15deg); }

@keyframes floatGift {
    0% { transform: translateY(5px); }
    100% { transform: translateY(-5px); }
}

/* Screen transition flash */
.white-flash {
    position: fixed; inset: 0; background: #fff;
    z-index: 100; opacity: 0; pointer-events: none;
    transition: opacity 0.6s ease;
}
.white-flash.active { opacity: 1; }

.home-signature{
    margin-top:clamp(4px,1vh,10px); color:#cbb9cf;
    font-family:"Cormorant Garamond",serif; font-size:clamp(.9rem,1.2vw,1.1rem); font-style:italic;
}

.begin{
    margin-top:clamp(12px,2vh,20px); color:#e4d7e8;
    font-size:clamp(.6rem,.75vw,.75rem); letter-spacing:.2em;
    text-transform:uppercase; opacity:.7;
    animation: fadePulse 2s infinite alternate;
}

@keyframes fadePulse {
    from { opacity: 0.4; }
    to { opacity: 0.9; }
}

/* =========================================================
   LETTER CARD & RIBBON UI
========================================================= */
.letter-screen{ align-items:center; justify-content:center; perspective:1600px; }
.letter-wrap{ position:relative; z-index:3; width:min(750px, 92vw); height:min(540px, 78vh); perspective:1600px; }

/* Magical Ribbon Wrapper */
.ribbon-overlay { position: absolute; inset: 0; z-index: 10; pointer-events: none; }
.ribbon-clip { position: absolute; inset: 0; border-radius: 20px; overflow: hidden; pointer-events: none; box-shadow: inset 0 0 0 1px rgba(229,200,117,.15); }
.ribbon-darken { position: absolute; inset: 0; background: rgba(10, 8, 20, 0.65); transition: opacity 0.8s var(--ease); }
.ribbon-band { position: absolute; background: linear-gradient(90deg, #e8c86d, #fff0a5, #d4ad4f); box-shadow: 0 2px 15px rgba(0,0,0,0.6); transition: transform 0.9s cubic-bezier(0.7, 0, 0.3, 1), opacity 0.9s; }
.ribbon-band.vertical { top: 0; bottom: 0; left: 50%; width: 32px; transform: translateX(-50%); background: linear-gradient(0deg, #d4ad4f, #fff0a5 50%, #d4ad4f); }
.ribbon-band.horizontal { left: 0; right: 0; top: 50%; height: 32px; transform: translateY(-50%); }

.bow-center { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 65px; height: 65px; cursor: pointer; pointer-events: auto; z-index: 11; transition: transform 0.4s var(--ease), opacity 0.6s; filter: drop-shadow(0 4px 10px rgba(0,0,0,0.4)); }
.bow-center:hover { transform: translate(-50%, -50%) scale(1.08); }
.bow-knot { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 20px; height: 20px; background: linear-gradient(135deg, #fff0a5, #d4ad4f); border-radius: 50%; box-shadow: inset 0 -2px 4px rgba(0,0,0,0.2), 0 3px 6px rgba(0,0,0,0.5); z-index: 3; }
.bow-loop { position: absolute; top: 50%; width: 32px; height: 32px; border: 7px solid #e8c86d; border-radius: 50% 50% 50% 0; box-shadow: inset 0 2px 5px rgba(0,0,0,0.1), 0 3px 6px rgba(0,0,0,0.3); }
.bow-loop.left { left: -11px; transform: translateY(-50%) rotate(-45deg); }
.bow-loop.right { right: -11px; transform: translateY(-50%) rotate(135deg); }

.ribbon-hint { position: absolute; top: calc(50% + 55px); left: 50%; transform: translateX(-50%); color: #fff; font-size: 0.65rem; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase; background: rgba(0,0,0,0.55); padding: 6px 14px; border-radius: 20px; pointer-events: none; backdrop-filter: blur(8px); transition: opacity 0.4s; border: 1px solid rgba(255,255,255,0.1); }

.ribbon-overlay.untied .bow-center { transform: translate(-50%, -50%) scale(1.6); opacity: 0; pointer-events: none; }
.ribbon-overlay.untied .ribbon-band.vertical { transform: translate(-50%, -100%); }
.ribbon-overlay.untied .ribbon-band.horizontal { transform: translate(100%, -50%); }
.ribbon-overlay.untied .ribbon-darken, .ribbon-overlay.untied .ribbon-hint { opacity: 0; }

.letter-paper{ position:relative; width:100%; height:100%; padding:0; border:0; border-radius:20px; background:transparent; box-shadow:none; transform-style:preserve-3d; transition:transform .9s var(--ease); cursor:pointer; }
.ribbon-overlay:not(.untied) ~ .letter-paper { cursor: default; }
.letter-paper.is-flipped{ transform:rotateY(180deg); }

.letter-face{ position:absolute; inset:0; overflow:hidden; border-radius:20px; backface-visibility:hidden; -webkit-backface-visibility:hidden; transform-style:preserve-3d; }
.letter-front{ display:flex; align-items:center; justify-content:center; text-align:center; color:var(--white); background: radial-gradient(circle at 50% 28%,rgba(229,200,117,.16),transparent 24%), radial-gradient(circle at 20% 85%,rgba(237,145,178,.12),transparent 28%), linear-gradient(145deg,#21152d,#0e0b18 72%); border:1px solid rgba(229,200,117,.32); box-shadow: 0 25px 70px rgba(0,0,0,.48), inset 0 0 70px rgba(229,200,117,.035); }
.letter-front:before{ content:""; position:absolute; inset:16px; border:1px solid rgba(229,200,117,.22); border-radius:15px; pointer-events:none; }

.letter-cover-content{ position:relative; z-index:2; padding:30px; }
.letter-cover-kicker{ margin:0 0 15px; color:#d9c58b; font-size:clamp(.65rem, 1vw, .8rem); font-weight:700; letter-spacing:.28em; text-transform:uppercase; }
.letter-cover-title{ margin:0; color:#fff5d1; font-family:"Cormorant Garamond",serif; font-size:clamp(2.5rem, 6vw, 4.5rem); font-weight:600; line-height:.84; letter-spacing:-.045em; text-shadow:0 8px 25px rgba(0,0,0,.32); }
.letter-cover-name{ margin:20px 0 0; color:#f2dce4; font-family:"Pacifico",cursive; font-size:clamp(1.1rem,2vw,1.5rem); }
.letter-cover-hint{ margin:30px 0 0; color:#bdb0c7; font-size:clamp(.65rem, 1vw, .8rem); letter-spacing:.18em; text-transform:uppercase; }

.letter-back{ transform:rotateY(180deg); display:flex; flex-direction:column; color:var(--ink); background: radial-gradient(circle at 12% 10%,rgba(204,173,132,.14),transparent 22%), radial-gradient(circle at 90% 88%,rgba(204,173,132,.14),transparent 24%), linear-gradient(135deg,var(--paper),#f7ecda); border:1px solid rgba(102,68,66,.22); box-shadow: 0 25px 70px rgba(0,0,0,.46), inset 0 0 40px rgba(120,83,62,.035); cursor:default; }
.letter-back:before{ content:""; position:absolute; inset:12px; border:1px solid rgba(102,68,66,.22); border-radius:12px; pointer-events:none; }

.letter-content{ position:relative; z-index:2; flex:1; min-height:0; overflow-y:auto; padding:clamp(25px,4vw,40px) clamp(25px,5vw,50px) 15px; scrollbar-width:none; }
.letter-content::-webkit-scrollbar{ display:none; }

.letter-kicker{ margin:0 0 8px; color:#8b6465; font-size:clamp(.6rem, 1vw, .75rem); font-weight:700; letter-spacing:.2em; text-transform:uppercase; }
.letter-title{ margin:0; color:#4b3034; font-family:"Cormorant Garamond",serif; font-size:clamp(2.2rem,5vw,3.5rem); font-weight:600; line-height:.9; letter-spacing:-.03em; }

.letter-rule{ display:flex; align-items:center; gap:10px; margin:14px 0 12px; }
.letter-rule span{ display:block; height:1px; flex:1; background:rgba(103,68,67,.25); }
.letter-rule b{ color:#a06b70; font-size:.8rem; }

.letter-body{ color:var(--ink2); font-family:"Cormorant Garamond",serif; font-size:clamp(.95rem, 1.5vw, 1.15rem); line-height:1.45; }
.letter-body p{ margin:0 0 10px; }
.letter-body strong{ color:#4b3034; font-weight:700; }
.letter-body .highlight{ margin:14px 0; padding:12px 15px; border-left:3px solid #a06b70; background:rgba(160,107,112,.07); color:#69474d; font-style:italic; }

.letter-sign{ margin-top:8px; color:#4b3034; font-family:"Pacifico",cursive; font-size:1.1rem; }
.letter-cta{ position:relative; z-index:4; align-self:center; margin:0 0 20px; border:1px solid rgba(75,48,52,.18); border-radius:999px; padding:10px 22px; color:#fffaf5; background:#4b3034; box-shadow:0 8px 18px rgba(75,48,52,.2); cursor:pointer; font-size:.75rem; font-weight:700; letter-spacing:.08em; transition:transform .25s var(--ease),box-shadow .25s var(--ease); }
.letter-cta:hover{ transform:translateY(-2px); box-shadow:0 12px 24px rgba(75,48,52,.28); }

@media(max-width:700px){ .letter-cover-content{ padding:25px; } .letter-content{ padding:25px 20px 10px; } .letter-cta{ margin-bottom:15px; } }

/* =========================================================
   FINAL - THE WISH CAKE & FADE ANIMATION
========================================================= */
.final-wrap{ position:relative; z-index:3; width:min(750px,92vw); text-align:center; }

.wish-phase { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; transition: opacity 0.8s var(--ease), visibility 0.8s; z-index: 5; }
.final-wrap.wished .wish-phase { opacity: 0; visibility: hidden; }

.wish-text { font-size: clamp(1.8rem, 4vw, 3rem); color: #fff1b1; text-shadow: 0 0 20px rgba(255,241,177,0.5); font-family: "Cormorant Garamond", serif; margin: 0; line-height: 1.1; }
.wish-sub { color: #e3d3e6; margin-top: 12px; font-size: clamp(0.65rem, 1vw, 0.8rem); letter-spacing: 0.15em; text-transform: uppercase; animation: fadePulse 2s infinite alternate; }

/* The Cake Container */
.cake-container {
    position: relative; width: 140px; height: 120px;
    margin: clamp(20px, 4vh, 40px) auto;
    cursor: pointer; z-index: 10;
    transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.cake-container:hover { transform: scale(1.05); }
.cake-container:active { transform: scale(0.95); }

/* Cake Base & Icing */
.cake-base {
    position: absolute; left: 10%; right: 10%; bottom: 10%; height: 45%;
    background: linear-gradient(135deg, #e4aab9, #b98da3);
    border-radius: 8px 8px 12px 12px;
    box-shadow: inset 0 -5px 10px rgba(0,0,0,0.1), 0 10px 20px rgba(0,0,0,0.3);
}
.cake-icing {
    position: absolute; left: 5%; right: 5%; bottom: 45%; height: 20%;
    background: #fffaf0; border-radius: 12px 12px 16px 16px;
}
.cake-drip {
    position: absolute; top: 90%; width: 12%; height: 80%;
    background: #fffaf0; border-radius: 0 0 10px 10px;
}
.cake-drip:nth-child(1) { left: 20%; height: 120%; }
.cake-drip:nth-child(2) { left: 50%; height: 160%; transform: translateX(-50%); }
.cake-drip:nth-child(3) { right: 20%; height: 100%; }

/* The Candle & Flame */
.cake-candle {
    position: absolute; left: 50%; bottom: 62%; width: 10px; height: 35px;
    transform: translateX(-50%); background: linear-gradient(90deg, #fce8a1, #e3c875);
    border-radius: 4px;
}
.cake-flame {
    position: absolute; left: 50%; top: -26px; width: 16px; height: 26px;
    transform: translateX(-50%); background: #fff;
    border-radius: 50% 50% 20% 20%;
    box-shadow: 0 0 20px 8px #fff1b1, 0 0 40px 15px rgba(237, 145, 178, 0.6);
    animation: flameFlicker 0.6s infinite alternate ease-in-out;
    transform-origin: bottom center;
    transition: transform 0.4s, opacity 0.4s;
}

@keyframes flameFlicker {
    0% { transform: translateX(-50%) scale(0.9) rotate(-3deg); opacity: 0.9; }
    100% { transform: translateX(-50%) scale(1.1) rotate(3deg); opacity: 1; }
}
.final-wrap.wished .cake-flame {
    transform: translateX(-50%) scale(0);
    opacity: 0;
}

/* Expanding Light */
.expanding-light {
    position: fixed; top: 50%; left: 50%;
    width: 2px; height: 2px; border-radius: 50%;
    background: radial-gradient(circle, rgba(255,241,177,0.9), rgba(237, 145, 178, 0.6), transparent);
    transform: translate(-50%, -50%) scale(1);
    opacity: 0; pointer-events: none; z-index: 1;
}

.final-wrap.wished .expanding-light {
    animation: lightBurstFade 3.5s forwards ease-in-out;
}

@keyframes lightBurstFade {
    0% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
    20% { transform: translate(-50%, -50%) scale(500); opacity: 1; }
    50% { transform: translate(-50%, -50%) scale(1500); opacity: 1; }
    100% { transform: translate(-50%, -50%) scale(2000); opacity: 0; }
}

.reveal-phase {
    opacity: 0; visibility: hidden; transform: translateY(15px);
    transition: opacity 1.5s 1.5s var(--ease), transform 1.5s 1.5s var(--ease), visibility 1.5s 1.5s;
    display: flex; flex-direction: column; align-items: center; z-index: 4;
}
.final-wrap.wished .reveal-phase { opacity: 1; visibility: visible; transform: translateY(0); }

.final-title{ margin:0; font-size:clamp(2.2rem,5vw,4rem); line-height:.92; letter-spacing:-.055em; color: #fff; text-shadow: 0 4px 15px rgba(0,0,0,0.5); }
.final-message{ max-width:550px; margin:clamp(12px,2vh,20px) auto; color: #e0d6e6; font-size:clamp(.85rem,1.2vw,1.05rem); line-height:1.65; }
.final-message strong{ display:block; margin-top:8px; color:#fff1b1; font-weight:600; font-size: 1.1em; }
.final-small{ color:#bdaec2; font-family:"Cormorant Garamond",serif; font-size:clamp(.95rem,1.4vw,1.2rem); font-style:italic; }

.return-home{
    margin-top:clamp(15px,3vh,25px); border:1px solid rgba(255,255,255,0.15); border-radius: 30px;
    padding: 10px 24px; background:rgba(255,255,255,0.05); color:#e3d3e6; cursor:pointer;
    font-size:.7rem; letter-spacing:.13em; text-transform:uppercase; backdrop-filter: blur(5px);
    transition:background 0.3s, transform 0.3s;
}
.return-home:hover{ background:rgba(255,255,255,0.1); transform:translateY(-2px); }

/* =========================================================
   SHORT SCREENS & RESPONSIVE TWEAKS
========================================================= */
@media(max-height:650px){
    .home-object-area{ height:20vh; min-height:120px; }
    .letter-wrap{ height:88vh; }
    .cake-container { margin: 10px auto; width: 100px; height: 90px; }
}

@media(max-height:500px) and (orientation:landscape){
    .screen{ padding-top:10px; padding-bottom:10px; }
    .home-content{ transform:scale(.86); }
    .home-object-area{ height:18vh; min-height:90px; margin:5px auto; }
    .letter-wrap{ width:80vw; height:90vh; }
    .final-wrap{ transform:scale(.75); }
    .cake-container { margin: 5px auto; width: 90px; height: 80px; }
}

@media(prefers-reduced-motion:reduce){
    *, *:before, *:after{
        animation-duration:.01ms !important; animation-iteration-count:1 !important;
        scroll-behavior:auto !important; transition-duration:.01ms !important;
    }
}
`}</style>


<div id="app">

    {/* Global Background Elements */}
    <div className="stars" aria-hidden="true">
        <span className="star"></span> <span className="star"></span> <span className="star"></span>
        <span className="star"></span> <span className="star"></span> <span className="star"></span>
        <span className="star"></span> <span className="star"></span> <span className="star"></span>
        <span className="star"></span> <span className="star"></span> <span className="star"></span>
    </div>

    <div className="ambient a"></div>
    <div className="ambient b"></div>

    <div className="white-flash" id="whiteFlash"></div>

    {/* =====================================================
         HOME SCREEN
    ====================================================== */}
    <section className="screen active" id="home">
        
        {/* Screen Specific Doodles (5 items) */}
        <div className="doodle doodle-moon">
            <svg viewBox="0 0 100 100">
                <path d="M55,10 A40,40 0 1,0 90,55 A30,30 0 0,1 55,10 Z" fill="rgba(255, 241, 177, 0.15)" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M35,45 Q40,40 45,45" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round"/>
                <path d="M55,45 Q60,40 65,45" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round"/>
                <path d="M45,55 Q50,60 55,55" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round"/>
                <ellipse cx="32" cy="52" rx="4" ry="2" fill="#ed91b2" opacity="0.6"/>
                <ellipse cx="68" cy="52" rx="4" ry="2" fill="#ed91b2" opacity="0.6"/>
            </svg>
        </div>
        <div className="doodle doodle-cloud">
            <svg viewBox="0 0 100 100">
                <path d="M25,65 A15,15 0 0,1 35,35 A20,20 0 0,1 70,40 A15,15 0 0,1 75,65 Z" fill="rgba(237, 145, 178, 0.15)" stroke="currentColor" strokeWidth="4" strokeLinejoin="round"/>
            </svg>
        </div>
        <div className="doodle doodle-tiny-star">
            <svg viewBox="0 0 100 100">
                <path d="M50,10 L60,40 L90,50 L60,60 L50,90 L40,60 L10,50 L40,40 Z" fill="rgba(255, 241, 177, 0.3)" stroke="currentColor" strokeWidth="4" strokeLinejoin="round"/>
            </svg>
        </div>
        <div className="doodle doodle-rocket">
            <svg viewBox="0 0 100 100">
                <path d="M20,80 L35,65" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
                <path d="M40,70 L20,90 L30,60 Z" fill="rgba(179, 155, 233, 0.2)" stroke="currentColor" strokeWidth="3" strokeLinejoin="round"/>
                <path d="M30,60 C30,20 70,10 90,10 C90,30 80,70 40,70 Z" fill="rgba(179, 155, 233, 0.1)" stroke="currentColor" strokeWidth="4" strokeLinejoin="round"/>
                <circle cx="60" cy="40" r="8" fill="none" stroke="currentColor" strokeWidth="3"/>
            </svg>
        </div>
        <div className="doodle doodle-shooting">
            <svg viewBox="0 0 100 100">
                <path d="M30,30 L40,50 L60,55 L40,60 L30,80 L20,60 L0,55 L20,50 Z" fill="rgba(255, 241, 177, 0.15)" stroke="currentColor" strokeWidth="4" strokeLinejoin="round"/>
                <path d="M50,40 L90,20" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                <path d="M60,55 L100,45" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                <path d="M50,70 L80,80" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
            </svg>
        </div>

        <div className="home-content">
            <p className="eyebrow">A LITTLE SOMETHING FOR YOU</p>
            <h1 className="screen-title">I made something special for Bushara.</h1>
            <p className="screen-subtitle">There are two little surprises waiting for you. Take your time and explore them both.</p>

            <div className="home-object-area">
                {/* Glowing Gift Box */}
                <div className="home-gift-wrapper" id="startGift" role="button" tabIndex={0} aria-label="Begin Journey">
                    <div className="home-gift-box"></div>
                    <div className="home-gift-ribbon-v"></div>
                    <div className="home-gift-lid"></div>
                    <div className="home-gift-bow"></div>
                </div>
            </div>

            <div className="home-signature">By Rihan Khan</div>
            <div className="begin"><span className="tap-dot"></span> TAP THE GIFT TO BEGIN</div>
        </div>
    </section>

    {/* =====================================================
         LETTER SCREEN
    ====================================================== */}
    <section className="screen letter-screen" id="letter">
        
        {/* Screen Specific Doodles (5 items) */}
        <div className="doodle doodle-bird">
            <svg viewBox="0 0 100 100">
                <path d="M20,50 L50,20 L80,50 L50,40 Z" fill="rgba(255, 241, 177, 0.15)" stroke="currentColor" strokeWidth="4" strokeLinejoin="round"/>
                <path d="M20,50 L50,80 L80,50 Z" fill="none" stroke="currentColor" strokeWidth="4" strokeLinejoin="round"/>
            </svg>
        </div>
        <div className="doodle doodle-env">
            <svg viewBox="0 0 100 100">
                <rect x="15" y="30" width="70" height="40" rx="4" fill="rgba(179, 155, 233, 0.15)" stroke="currentColor" strokeWidth="4"/>
                <path d="M15,30 L50,55 L85,30" fill="none" stroke="currentColor" strokeWidth="4" strokeLinejoin="round"/>
            </svg>
        </div>
        <div className="doodle doodle-heart">
            <svg viewBox="0 0 100 100">
                <path d="M50,85 C20,55 10,35 10,20 A15,15 0 0,1 45,15 L50,22 L55,15 A15,15 0 0,1 90,20 C90,35 80,55 50,85 Z" fill="rgba(237, 145, 178, 0.15)" stroke="currentColor" strokeWidth="4" strokeLinejoin="round"/>
            </svg>
        </div>
        <div className="doodle doodle-ink">
            <svg viewBox="0 0 100 100">
                <path d="M35,40 L65,40 L75,90 L25,90 Z" fill="rgba(179, 155, 233, 0.15)" stroke="currentColor" strokeWidth="4" strokeLinejoin="round"/>
                <rect x="40" y="25" width="20" height="15" fill="none" stroke="currentColor" strokeWidth="4"/>
            </svg>
        </div>
        <div className="doodle doodle-quill">
            <svg viewBox="0 0 100 100">
                <path d="M20,80 Q40,50 80,10 Q60,50 20,80 Z" fill="rgba(255, 241, 177, 0.15)" stroke="currentColor" strokeWidth="4" strokeLinejoin="round"/>
                <path d="M20,80 L35,65" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
            </svg>
        </div>

        <div className="letter-wrap" id="letterWrap">

            <div className="ribbon-overlay" id="ribbonOverlay">
                <div className="ribbon-clip">
                    <div className="ribbon-darken"></div>
                    <div className="ribbon-band vertical"></div>
                    <div className="ribbon-band horizontal"></div>
                </div>
                <div className="bow-center" id="bowCenter" role="button" tabIndex={0} aria-label="Untie ribbon">
                    <div className="bow-loop left"></div>
                    <div className="bow-loop right"></div>
                    <div className="bow-knot"></div>
                </div>
                <div className="ribbon-hint">Tap bow to unlock</div>
            </div>

            <article className="letter-paper" id="letterCard" aria-label="Birthday letter card">
                <div className="letter-face letter-front">
                    <div className="letter-cover-content">
                        <p className="letter-cover-kicker">A little something for you</p>
                        <h2 className="letter-cover-title">A Letter<br />For You</h2>
                        <p className="letter-cover-name">Bushara</p>
                        <p className="letter-cover-hint">Tap to open • 180°</p>
                    </div>
                </div>

                <div className="letter-face letter-back">
                    <div className="letter-content">
                        <p className="letter-kicker">A little note for you</p>
                        <h2 className="letter-title">For Bushara</h2>

                        <div className="letter-rule"><span></span><b>♥</b><span></span></div>

                        <div className="letter-body">
                            <p><strong>Happy Birthday, Bushara 🎂</strong></p>
                            <p>Growing up with you has been one of the greatest blessings of my life. Today is a celebration of you—the wonderful sister you are, your endless warmth, and the beautiful energy you bring to our family.</p>
                            <p>As you step into this new chapter, my biggest wish is that this year overflows with happiness, success, and all the incredible adventures you truly deserve. No matter where life takes you, remember your brother is always cheering for you.</p>
                            <p className="highlight">May you always keep that radiant smile, and may your dreams blossom into reality. Never stop being the amazing person you are. ✨</p>
                            <p>Keep shining brightly, keep aiming high, and know that I am so proud of the person you are becoming. I hope life hands you everything you have been hoping for—and then a little bit more.</p>
                            <p>Happy Birthday to the best sister. ❤️</p>
                            <div className="letter-sign">— Your brother, Rihan</div>
                        </div>
                    </div>
                    <button className="letter-cta" id="letterContinue">One Last Thing →</button>
                </div>
            </article>

        </div>
    </section>

    {/* =====================================================
         FINAL SCREEN (CAKE & GLOW)
    ====================================================== */}
    <section className="screen" id="final">
        
        {/* Screen Specific Doodles (5 items) */}
        <div className="doodle doodle-music">
            <svg viewBox="0 0 100 100">
                <path d="M30,70 L30,30 L70,20 L70,60" fill="none" stroke="currentColor" strokeWidth="4" strokeLinejoin="round"/>
                <ellipse cx="22" cy="70" rx="8" ry="6" fill="rgba(237, 145, 178, 0.5)" stroke="currentColor" strokeWidth="4"/>
            </svg>
        </div>
        <div className="doodle doodle-bunting">
            <svg viewBox="0 0 100 100">
                <path d="M0,20 Q50,50 100,20" stroke="#a399a0" strokeWidth="2" fill="none"/>
                <path d="M15,27 L25,45 L35,32 Z" fill="rgba(237, 145, 178, 0.2)" stroke="#ed91b2" strokeWidth="3"/>
                <path d="M45,36 L55,55 L65,36 Z" fill="rgba(255, 241, 177, 0.2)" stroke="#fff1b1" strokeWidth="3"/>
            </svg>
        </div>
        <div className="doodle doodle-gift">
            <svg viewBox="0 0 100 100">
                <rect x="20" y="40" width="60" height="50" rx="4" fill="rgba(179, 155, 233, 0.15)" stroke="currentColor" strokeWidth="4"/>
                <rect x="15" y="30" width="70" height="10" rx="3" fill="rgba(179, 155, 233, 0.3)" stroke="currentColor" strokeWidth="4"/>
            </svg>
        </div>
        <div className="doodle doodle-cake-dood">
            <svg viewBox="0 0 100 100">
                <rect x="20" y="50" width="60" height="35" rx="5" fill="rgba(255, 241, 177, 0.15)" stroke="currentColor" strokeWidth="4" strokeLinejoin="round"/>
                <path d="M20,50 Q30,65 40,50 Q50,65 60,50 Q70,65 80,50" fill="none" stroke="#ed91b2" strokeWidth="4" strokeLinecap="round"/>
                <rect x="45" y="25" width="10" height="25" fill="rgba(179, 155, 233, 0.15)" stroke="#b39be9" strokeWidth="4" strokeLinejoin="round"/>
            </svg>
        </div>
        <div className="doodle doodle-balloons">
            <svg viewBox="0 0 100 100">
                <path d="M30,50 Q40,70 50,95" stroke="#a399a0" strokeWidth="2" fill="none"/>
                <ellipse cx="30" cy="35" rx="15" ry="20" fill="rgba(237, 145, 178, 0.15)" stroke="currentColor" strokeWidth="4"/>
            </svg>
        </div>

        <div className="final-wrap" id="finalWrap">
            
            <div className="expanding-light"></div>

            <div className="wish-phase">
                <h2 className="wish-text">Make a wish...</h2>
                <div className="wish-sub">Tap the flame to blow it out</div>
                
                <div className="cake-container" id="wishCake" role="button" tabIndex={0}>
                    <div className="cake-candle">
                        <div className="cake-flame"></div>
                    </div>
                    <div className="cake-icing">
                        <div className="cake-drip"></div>
                        <div className="cake-drip"></div>
                        <div className="cake-drip"></div>
                    </div>
                    <div className="cake-base"></div>
                </div>
            </div>

            <div className="reveal-phase">
                <p className="eyebrow">WISH GRANTED</p>
                <h2 className="final-title">Happy Birthday,<br />Bushara ❤️</h2>

                <div className="final-message">
                    I hope this year gives you more reasons to smile,
                    more moments to remember, and more happiness than you expect.
                    <strong>You deserve a beautiful year ahead.</strong>
                </div>

                <div className="final-small">Happy Birthday. 🎂✨</div>
                <button className="return-home" id="returnHome">↶ Return to Home</button>
            </div>
            
        </div>
    </section>

</div>





    </>
  );
}
