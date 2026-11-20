/* Mythbound fictional game portal.
   Set the public Dreamjourney bot URL here when ready. */
const DREAMJOURNEY_URL = "https://dreamjourneyai.com/creation/2b0418fb-ca3d-41b2-9638-ad9809062406"; 
const CLASS_DATA = {
  breaker:{name:"Breaker",role:"FRONTLINE · TANK",emblem:"✊",description:"A relentless martial arts master. Breakers meet danger with bare hands, staggering enemies and protecting allies through sheer endurance."},
  animar:{name:"Animar",role:"ADAPTIVE · EXPERT",emblem:"◈",description:"The shapeshifter who adapts to the moment. Animars exchange forms for melee, ranged attacks, defense and support; mastering their flexibility takes extraordinary practice."},
  herder:{name:"Herder",role:"SUPPORT · COMPANIONS",emblem:"❃",description:"Mounted companions and their loyal animal friends. Herders call creatures into battle to protect the party, interrupt danger and keep allies safe."},
  elemis:{name:"Elemis",role:"MAGIC · ELEMENTS",emblem:"✳",description:"Small but formidable fairies who command the elements. Elemis weave natural forces into powerful spells, clever control and magical utility."},
  strider:{name:"Strider",role:"MELEE · DUELIST",emblem:"⚔",description:"Fast, deadly and precise. Striders win encounters through footwork, timing and swordsmanship rather than brute force."},
  saint:{name:"Saint",role:"SUPPORT · PRIEST",emblem:"✥",description:"A holy protector who heals wounded allies, shields the vulnerable and channels sacred power to defend the party in its darkest hour."}
};
const pages=[...document.querySelectorAll(".page")];
const navButtons=[...document.querySelectorAll("[data-page]")];
const overlay=document.getElementById("overlay");
const sheetContent=document.getElementById("sheet-content");
const whisperButton=document.getElementById("floating-whisper");
const headerWhisper=document.getElementById("header-whisper");
let previousFocus=null;
function navigate(page,replace=false){
  const valid=["home","discover","news","classes","gameplay","profile"];
  if(!valid.includes(page)||(page==="profile"&&window.MythboundAccount?.isSignedIn()===false))page="home";
  pages.forEach(p=>{const active=p.id==="page-"+page;p.hidden=!active;p.classList.toggle("is-visible",active)});
  navButtons.forEach(b=>{const active=b.dataset.page===page;b.classList.toggle("is-active",active);if(active)b.setAttribute("aria-current","page");else b.removeAttribute("aria-current")});
  if(replace)history.replaceState(null,"","#"+page);else if(location.hash!=="#"+page)history.pushState(null,"","#"+page);
  if(page!=="home"){const trailer=document.getElementById("home-trailer-video");if(trailer&&!trailer.paused)trailer.pause()}
  window.scrollTo({top:0,behavior:"instant"});
}
navButtons.forEach(b=>b.addEventListener("click",()=>navigate(b.dataset.page)));
document.querySelectorAll("[data-go]").forEach(b=>b.addEventListener("click",()=>navigate(b.dataset.go)));
/* Stay on Home; account for the actual sticky header height at any viewport. */
document.getElementById("home-whats-new")?.addEventListener("click",()=>{
 const target=document.getElementById("home-latest-news");
 if(!target)return;
 const header=document.querySelector(".site-header");
 const offset=header?Math.max(0,header.getBoundingClientRect().bottom):0;
 const top=Math.max(0,window.scrollY+target.getBoundingClientRect().top-offset-12);
 document.getElementById("home-news-title")?.focus({preventScroll:true});
 window.scrollTo({top,behavior:(window.MythboundPreferences?.reduced()??window.matchMedia("(prefers-reduced-motion: reduce)").matches)?"instant":"smooth"});
});
/* An empty trailer source deliberately displays a non-interactive placeholder. */
(function(){
 const video=document.getElementById("home-trailer-video"),placeholder=document.getElementById("home-trailer-placeholder"),status=document.getElementById("home-trailer-status");
 if(!video||!placeholder||!status)return;
 const source=(video.dataset.trailerSrc||"").trim();
 if(!source)return;
 video.addEventListener("loadedmetadata",()=>{video.hidden=false;placeholder.hidden=true});
 video.addEventListener("error",()=>{video.hidden=true;placeholder.hidden=false;status.textContent="Trailer currently unavailable"});
 video.src=source;
})();

window.addEventListener("popstate",()=>navigate(location.hash.slice(1)||"home",true));
function setClassArtwork(host,name,variant=null){
  const data=variant||CLASS_DATA[name];if(!host||!data)return;
  const src="../Icon"+data.name+".png";
  if(host.dataset.artSrc===src&&host.querySelector("img.class-art-image"))return;
  host.dataset.artSrc=src;
  host.classList.add("class-art-host");host.classList.remove("has-class-art");
  const fallback=document.createElement("span");fallback.className="class-art-fallback";fallback.textContent=data.emblem;
  const img=document.createElement("img");img.className="class-art-image";img.alt="";img.decoding="async";img.draggable=false;
  img.addEventListener("load",()=>{if(img.parentNode===host)host.classList.add("has-class-art")},{once:true});
  img.addEventListener("error",()=>{if(img.parentNode===host)host.classList.remove("has-class-art")},{once:true});
  host.replaceChildren(fallback,img);img.src=src;
}
document.querySelectorAll(".class-tile, .preview-class").forEach(button=>{
  // A subclass without approved icon art keeps its own neutral symbol, not the base class icon.
  if(Number(button.dataset.classPath||0)===0)setClassArtwork(button.querySelector(".class-glyph, .preview-symbol"),button.dataset.class);
});
function selectClass(name){
  const c=CLASS_DATA[name];if(!c)return;
  setClassArtwork(document.getElementById("class-emblem"),name);
  document.getElementById("class-type").textContent=c.role;
  document.getElementById("class-name").textContent=c.name;
  document.getElementById("class-description").textContent=c.description;
  document.querySelectorAll(".class-tile").forEach(b=>{b.classList.toggle("is-selected",b.dataset.class===name);b.setAttribute("aria-pressed",String(b.dataset.class===name))});
}
// Align the codex heading just below the sticky header, on every screen size.
function scrollToClassCodex(){
  requestAnimationFrame(()=>{
    const codex=document.querySelector("#class-details .showcase-overline");
    const header=document.querySelector(".site-header");
    if(!codex)return;
    const headerBottom=header?Math.max(0,header.getBoundingClientRect().bottom):0;
    const top=Math.max(0,window.scrollY+codex.getBoundingClientRect().top-headerBottom-4);
    window.scrollTo({top,behavior:(window.MythboundPreferences?.reduced()??window.matchMedia("(prefers-reduced-motion: reduce)").matches)?"instant":"smooth"});
  });
}
document.querySelectorAll("[data-class]").forEach(b=>b.addEventListener("click",()=>{navigate("classes");selectClass(b.dataset.class);scrollToClassCodex()}));
function closePanel(){window.MythboundSocial?.closeContactMenu();overlay.hidden=true;overlay.classList.remove("mb-launcher-modal");document.body.classList.remove("sheet-open");if(previousFocus&&document.contains(previousFocus))previousFocus.focus()}
function openPanel(templateId){
  if(window.MythboundAccount?.isSignedIn()===false)return;
  if(overlay.hidden)previousFocus=document.activeElement;
  overlay.classList.remove("mb-launcher-modal");
  document.getElementById("sheet-kicker").textContent="MYTHBOUND · SOCIAL";
  sheetContent.replaceChildren(document.getElementById(templateId).content.cloneNode(true));
  overlay.hidden=false;document.body.classList.add("sheet-open");
  sheetContent.closest(".sheet").scrollTop=0;document.getElementById("sheet-close").focus({preventScroll:true});
  if(templateId==="whisper-template"){document.getElementById("reply-form").addEventListener("submit",handleReply)}
}
function openProfile(){window.MythboundSocial?.openFriend("fighter")}
function openWhisper(){if(window.MythboundAccount?.isSignedIn()===false)return;openPanel("whisper-template");window.MythboundSocial?.attachFighterMenu();window.MythboundSocial?.renderFighterMessages();window.MythboundSocial?.markSeen("fighter")}
document.getElementById("fighter-friend").addEventListener("click",openProfile);
document.getElementById("rail-whisper").addEventListener("click",openWhisper);
headerWhisper.addEventListener("click",()=>window.MythboundSocial?.openInbox());
document.getElementById("header-friends")?.addEventListener("click",()=>window.MythboundSocial?.openFriends());
whisperButton.addEventListener("click",()=>window.MythboundSocial?.openInbox());
// Own account is handled by account.js; all friends use the shared character profile.
// The fictional launcher responds to the current roleplay session, not real installation or account data.
document.getElementById("download-button").addEventListener("click",()=>{
  const signedIn=window.MythboundAccount?.isSignedIn()===true;
  previousFocus=document.activeElement;
  overlay.classList.add("mb-launcher-modal");
  sheetContent.replaceChildren();
  const title=document.createElement("div");
  title.className="profile-content";
  title.innerHTML='<div style="font-size:42px;color:var(--gold);margin-bottom:8px" aria-hidden="true">✧</div><span class="eyebrow">MYTHBOUND LAUNCHER</span><h2 id="sheet-title"></h2><p></p><button type="button" class="solid-action wide" id="download-return">Got it</button>';
  title.querySelector("h2").textContent=signedIn?"You already have downloaded it!":"Create an account first!";
  title.querySelector("p").textContent=signedIn?"Mythbound is already installed. Your adventure awaits, Traveler.":"You need a Mythbound account before you can download the game. Your legend is waiting, Traveler!";
  sheetContent.append(title);
  document.getElementById("download-return").addEventListener("click",closePanel);
  overlay.hidden=false;
  document.body.classList.add("sheet-open");
  document.getElementById("sheet-close").focus();
});
document.getElementById("sheet-close").addEventListener("click",closePanel);
overlay.addEventListener("click",e=>{if(e.target===overlay)closePanel()});
document.addEventListener("keydown",e=>{
  if(overlay.hidden)return;
  if(e.key==="Escape")closePanel();
  if(e.key!=="Tab")return;
  const visible=[...overlay.querySelectorAll('button:not([disabled]),a[href],textarea,input:not([disabled]),select:not([disabled])')].filter(el=>!el.closest('[hidden]')&&el.getClientRects().length);
  if(!visible.length)return;
  const first=visible[0],last=visible[visible.length-1];
  if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
  else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
});
function handleReply(e){
  e.preventDefault();
  if(window.MythboundAccount?.isSignedIn()===false)return;
  const status=document.getElementById("reply-status");
  if(!DREAMJOURNEY_URL || !/^https:\/\/(?:www\.)?dreamjourneyai\.com\//i.test(DREAMJOURNEY_URL)){
    status.textContent="The Dreamjourney character URL hasn't been configured yet. Add it to DREAMJOURNEY_URL in mythbound/app.js before publishing the full experience.";
    return;
  }
  // An ordinary new-tab link keeps Mythbound open and avoids misleading popup status.
  const link=document.createElement("a");
  link.href=DREAMJOURNEY_URL;
  link.target="_blank";
  link.rel="noopener noreferrer";
  document.body.append(link);
  link.click();
  link.remove();
}
const route=location.hash.slice(1);navigate(route||"home",true);selectClass("saint");


/* MYTHBOUND WEBSITE SOUNDTRACK
   Entire original track repeats; music is enabled unless the visitor muted it.
   Audible autoplay is browser-controlled. A real interaction resumes it.
   When blocked, clicking Play Music starts playback instead of turning it off. */
(function installMythboundTheme(){
  const audio=document.getElementById("mythbound-theme");
  const toggle=document.getElementById("music-toggle");
  const label=toggle?.querySelector(".music-state");
  const live=document.getElementById("music-announcement");
  if(!audio||!toggle||!label)return;
  let enabled=true, blocked=false, unavailable=false, pending=false;
  enabled=(window.MythboundAudio?.level("music")??.3)>0;
  window.MythboundAudio?.applyMusic();
  audio.loop=true;
  let requested=window.MythboundPreferences?.get("autoplay")!==false;
  audio.autoplay=enabled&&requested;
  audio.muted=false;
  const announce=message=>{if(live)live.textContent=message};
  function sync(){
    const isPlaying=enabled&&!audio.paused;
    toggle.setAttribute("aria-pressed",String(enabled));
    toggle.classList.toggle("needs-gesture",enabled&&!isPlaying);
    label.textContent=!enabled?"Music Off":isPlaying?"Music On":"Play Music";
    // The mixer owns the accessible volume label.
  }
  function tryPlay(){
    if(!enabled||!requested||unavailable||pending||!audio.paused)return;
    pending=true;
    try{
      const p=audio.play();
      if(p&&typeof p.then==="function"){
        p.then(()=>{
          pending=false;blocked=false;
          // If muted during the pending request, do not continue playing.
          if(!enabled)audio.pause();
          sync();
        }).catch(()=>{
          pending=false;
          blocked=true;sync();
        });
      }else{pending=false;sync()}
    }catch{pending=false;blocked=true;sync()}
  }
  document.addEventListener("mythbound:music-change",()=>{
    enabled=(window.MythboundAudio?.level("music")??0)>0;
    if(enabled)requested=true;
    audio.autoplay=enabled&&requested;
    if(enabled){tryPlay()}else{audio.pause()}
    sync();
  });
  toggle.addEventListener("click",()=>{if(enabled){requested=true;audio.autoplay=true;tryPlay()}});
  document.addEventListener("mythbound:preferences-change",e=>{if(e.detail?.key==="autoplay"&&e.detail.value){requested=true;audio.autoplay=enabled;tryPlay()}else if(e.detail?.key==="autoplay"){requested=false;audio.autoplay=false}});
  // Playback request stays in the user-activation event; no off/on workaround needed.
  const firstInteraction=event=>{if(enabled&&!toggle.contains(event.target))tryPlay()};
  for(const event of ["pointerdown","pointerup","touchend"])document.addEventListener(event,firstInteraction,true);
  document.addEventListener("keydown",event=>{if(enabled&&!toggle.contains(event.target))tryPlay()},true);
  document.addEventListener("click",event=>{if(enabled&&!toggle.contains(event.target))tryPlay()},true);
  audio.addEventListener("play",()=>{blocked=false;sync()});
  audio.addEventListener("pause",sync);
  audio.addEventListener("loadeddata",()=>{if(enabled&&!blocked)tryPlay()});
  audio.addEventListener("canplay",()=>{if(enabled&&!blocked)tryPlay()});
  audio.addEventListener("error",()=>{unavailable=true;pending=false;sync();announce("The music file could not be loaded.")});
  window.addEventListener("pageshow",()=>{if(enabled)tryPlay()});
  document.addEventListener("visibilitychange",()=>{if(!document.hidden&&enabled)tryPlay()});
  sync();
  if(enabled)tryPlay();else audio.pause();
})();


// The illustrated hero is optional until the image file is uploaded.
// This avoids a blank banner if the asset has not reached GitHub Pages yet.
(function loadMythboundHomeLandscape(){
  const hero=document.querySelector("#page-home .hero");
  if(!hero)return;
  const landscape=new Image();
  landscape.onload=()=>hero.classList.add("has-watercolor-landscape");
  landscape.onerror=()=>hero.classList.remove("has-watercolor-landscape");
  landscape.src="../mythbound-home-watercolor.jpg";
})();


// Original, synthesized UI foley: no downloaded sound assets or external dependencies.
(function installMythboundInterfaceSounds(){
 let ctx,noise,last=-Infinity;const outputs=new Set();
 const audioMix=()=>window.MythboundAudio;
 function play(kind){
  // Respect the existing audio preference; no surprise sounds when muted.
  if(window.MythboundSFX?.enabled()===false)return;
  const Audio=window.AudioContext||window.webkitAudioContext;
  if(!Audio)return;
  try{
   ctx=ctx||new Audio();
   if(ctx.state==="closed")return;
   if(ctx.state==="suspended")ctx.resume().catch(()=>{});
   const t=ctx.currentTime;
   if(t-last<.055)return;
   last=t;
   if(!noise){
    noise=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*.42),ctx.sampleRate);
    const samples=noise.getChannelData(0);
    for(let i=0;i<samples.length;i++)samples[i]=Math.random()*2-1;
   }
   const out=ctx.createGain();out.gain.value=.6*(window.MythboundSFX?.volume()??1);out.connect(ctx.destination);outputs.add(out);
   // Each click owns its duck so rapid overlapping clicks cannot restore music early.
   audioMix()?.duck(out,.12,.045);
   function rustle(start,duration,from,to,volume,q){
    const source=ctx.createBufferSource();source.buffer=noise;
    const filter=ctx.createBiquadFilter();filter.type="bandpass";filter.Q.value=q;
    filter.frequency.setValueAtTime(from,start);filter.frequency.exponentialRampToValueAtTime(to,start+duration);
    const gain=ctx.createGain();gain.gain.setValueAtTime(.0001,start);gain.gain.exponentialRampToValueAtTime(volume,start+duration*.2);gain.gain.exponentialRampToValueAtTime(.0001,start+duration);
    source.connect(filter);filter.connect(gain);gain.connect(out);source.start(start);source.stop(start+duration+.01);
   }
   function tick(start,duration,frequency,volume){
    const osc=ctx.createOscillator(),gain=ctx.createGain();osc.type="sine";
    osc.frequency.setValueAtTime(frequency,start);osc.frequency.exponentialRampToValueAtTime(frequency*.82,start+duration);
    gain.gain.setValueAtTime(.0001,start);gain.gain.exponentialRampToValueAtTime(volume,start+.008);gain.gain.exponentialRampToValueAtTime(.0001,start+duration);
    osc.connect(gain);gain.connect(out);osc.start(start);osc.stop(start+duration+.01);
   }
   if(kind==="page"){
    rustle(t,.25,2500,850,.18,.65);rustle(t+.095,.16,4000,1400,.095,.9);tick(t+.19,.055,250,.045);
   }else{
    rustle(t,.095,1250,3800,.10,1.2);tick(t+.025,.12,940,.065);tick(t+.045,.09,1400,.025);
   }
   setTimeout(()=>{audioMix()?.release(out);out.disconnect();outputs.delete(out)},kind==="page"?320:185);
  }catch{}
 }
 // Capture before handlers replace skill buttons or update route selection.
 document.addEventListener("click",event=>{
  if(!event.isTrusted)return;
  const button=event.target.closest("button,[data-page],[data-go],[data-class]");
  if(!button||button.disabled||button.closest("[hidden]"))return;
  if(button.matches(".path-option,.skill-icon")){play("select");return}
  const page=button.dataset.page||button.dataset.go||(button.dataset.class?"classes":null);
  if(page&&location.hash!=="#"+page){play("page");return}
  if(button.dataset.class)play("select");
 },true);
 document.addEventListener("mythbound:sfx-change",()=>{for(const out of outputs)out.gain.value=.6*(window.MythboundSFX?.volume()??1)});
 window.addEventListener("pagehide",()=>{for(const out of outputs)audioMix()?.release(out);if(ctx&&ctx.state==="running")ctx.suspend().catch(()=>{})});
})();

/* Updates: reload current route with a new cache key; session and read IDs stay in storage. */
(function(){
 const refresh=document.getElementById("mb-refresh"),mobile=document.getElementById("mobile-refresh");if(!refresh)return;let pending=false;
 refresh.addEventListener("click",()=>{
  if(pending)return;pending=true;refresh.disabled=true;if(mobile)mobile.disabled=true;refresh.classList.add("is-refreshing");refresh.setAttribute("aria-label","Checking for updates");refresh.title="Checking for updates";
  const url=new URL(location.href);url.searchParams.set("_mbupdate",String(Date.now()));location.replace(url.href);
 });
 window.addEventListener("pageshow",()=>{pending=false;refresh.disabled=false;if(mobile)mobile.disabled=false;refresh.classList.remove("is-refreshing");refresh.setAttribute("aria-label","Check for updates — refresh Mythbound");refresh.title="Check for updates"});
})();
