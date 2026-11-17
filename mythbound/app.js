/* Mythbound fictional game portal.
   Set the public Dreamjourney bot URL here when ready. */
const DREAMJOURNEY_URL = "https://dreamjourneyai.com/creation/2b0418fb-ca3d-41b2-9638-ad9809062406"; 
const CLASS_DATA = {
  breaker:{name:"Breaker",role:"FRONTLINE · TANK",emblem:"✊",description:"A relentless martial arts master. Breakers meet danger with bare hands, staggering enemies and protecting allies through sheer endurance."},
  animar:{name:"Animar",role:"ADAPTIVE · EXPERT",emblem:"◈",description:"The shapeshifter who adapts to the moment. Animars exchange forms for melee, ranged attacks, defense and support; mastering their flexibility takes extraordinary practice."},
  herder:{name:"Herder",role:"SUPPORT · COMPANIONS",emblem:"❃",description:"Mounted companions and their loyal animal friends. Herders call creatures into battle to protect the party, interrupt danger and keep allies safe."},
  elemis:{name:"Elemis",role:"MAGIC · ELEMENTS",emblem:"✳",description:"Small but formidable fairies who command the elements. Elemis weave natural forces into powerful spells, clever control and magical utility."},
  strider:{name:"Strider",role:"MELEE · DUELIST",emblem:"⚔",description:"Fast, deadly and precise. Striders win encounters through footwork, timing and swordsmanship rather than brute force."},
  saint:{name:"Saint",role:"SUPPORT · HOLY MAGIC",emblem:"✥",description:"A holy protector who heals wounded allies, shields the vulnerable and channels sacred power to defend the party."}
};
const pages=[...document.querySelectorAll(".page")];
const navButtons=[...document.querySelectorAll("[data-page]")];
const overlay=document.getElementById("overlay");
const sheetContent=document.getElementById("sheet-content");
const whisperButton=document.getElementById("floating-whisper");
const headerWhisper=document.getElementById("header-whisper");
let previousFocus=null;
function navigate(page,replace=false){
  const valid=["home","discover","news","classes"];
  if(!valid.includes(page))page="home";
  pages.forEach(p=>{const active=p.id==="page-"+page;p.hidden=!active;p.classList.toggle("is-visible",active)});
  navButtons.forEach(b=>{const active=b.dataset.page===page;b.classList.toggle("is-active",active);if(active)b.setAttribute("aria-current","page");else b.removeAttribute("aria-current")});
  if(replace)history.replaceState(null,"","#"+page);else if(location.hash!=="#"+page)history.pushState(null,"","#"+page);
  window.scrollTo({top:0,behavior:"instant"});
}
navButtons.forEach(b=>b.addEventListener("click",()=>navigate(b.dataset.page)));
document.querySelectorAll("[data-go]").forEach(b=>b.addEventListener("click",()=>navigate(b.dataset.go)));
window.addEventListener("popstate",()=>navigate(location.hash.slice(1)||"home",true));
function selectClass(name){
  const c=CLASS_DATA[name];if(!c)return;
  document.getElementById("class-emblem").textContent=c.emblem;
  document.getElementById("class-type").textContent=c.role;
  document.getElementById("class-name").textContent=c.name;
  document.getElementById("class-description").textContent=c.description;
  document.querySelectorAll(".class-tile").forEach(b=>{b.classList.toggle("is-selected",b.dataset.class===name);b.setAttribute("aria-pressed",String(b.dataset.class===name))});
}
document.querySelectorAll("[data-class]").forEach(b=>b.addEventListener("click",()=>{navigate("classes");selectClass(b.dataset.class);document.getElementById("class-details").scrollIntoView({behavior:"smooth",block:"nearest"})}));
function closePanel(){overlay.hidden=true;document.body.classList.remove("sheet-open");if(previousFocus&&document.contains(previousFocus))previousFocus.focus()}
function openPanel(templateId){
  previousFocus=document.activeElement;
  sheetContent.replaceChildren(document.getElementById(templateId).content.cloneNode(true));
  overlay.hidden=false;document.body.classList.add("sheet-open");
  document.getElementById("sheet-close").focus();
  if(templateId==="profile-template"){document.getElementById("profile-message").addEventListener("click",openWhisper)}
  if(templateId==="whisper-template"){document.getElementById("reply-form").addEventListener("submit",handleReply)}
}
function openProfile(){openPanel("profile-template")}
function openWhisper(){openPanel("whisper-template");window.MythboundSocial?.markSeen()}
document.getElementById("fighter-friend").addEventListener("click",openProfile);
document.getElementById("rail-whisper").addEventListener("click",openWhisper);
headerWhisper.addEventListener("click",()=>window.MythboundSocial?.openInbox());
whisperButton.addEventListener("click",()=>window.MythboundSocial?.openInbox());
// Own account is handled by account.js; Fighter retains his separate profile.
document.getElementById("download-button").addEventListener("click",()=>{previousFocus=document.activeElement;sheetContent.replaceChildren();const title=document.createElement("div");title.className="profile-content";title.innerHTML='<h2 id="sheet-title">Download Mythbound</h2><p>This is a fictional MMORPG website built for a character story. There is no real game download, installation or purchase.</p><p>Feel free to keep exploring the site and its in-game social features.</p>';sheetContent.append(title);overlay.hidden=false;document.body.classList.add("sheet-open");document.getElementById("sheet-close").focus()});
document.getElementById("sheet-close").addEventListener("click",closePanel);
overlay.addEventListener("click",e=>{if(e.target===overlay)closePanel()});
document.addEventListener("keydown",e=>{
  if(overlay.hidden)return;
  if(e.key==="Escape")closePanel();
  if(e.key!=="Tab")return;
  const visible=[...overlay.querySelectorAll('button:not([disabled]),a[href],textarea')];
  if(!visible.length)return;
  const first=visible[0],last=visible[visible.length-1];
  if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
  else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
});
function handleReply(e){
  e.preventDefault();
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
  try{enabled=localStorage.getItem("mythbound-music-enabled")!=="false"}catch{}
  audio.volume=0.30;
  audio.loop=true;
  audio.muted=false;
  const announce=message=>{if(live)live.textContent=message};
  function save(){
    try{localStorage.setItem("mythbound-music-enabled",String(enabled))}catch{}
  }
  function sync(){
    const isPlaying=enabled&&!audio.paused;
    toggle.setAttribute("aria-pressed",String(enabled));
    toggle.classList.toggle("needs-gesture",enabled&&!isPlaying);
    label.textContent=!enabled?"Music Off":isPlaying?"Music On":"Play Music";
    toggle.setAttribute("aria-label",!enabled
      ?"Enable Mythbound soundtrack"
      :isPlaying?"Mute Mythbound soundtrack":"Play Mythbound soundtrack");
    toggle.title=!enabled?"Turn soundtrack on":unavailable?"Soundtrack file unavailable"
      :isPlaying?"Mute soundtrack":"Click to play: your browser may require interaction";
  }
  function tryPlay(){
    if(!enabled||unavailable||pending||!audio.paused)return;
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
  toggle.addEventListener("click",()=>{
    if(!enabled){
      enabled=true;unavailable=false;save();tryPlay();announce("Music enabled.");
    }else if(audio.paused){
      // A blocked autoplay click must START music, not switch the default on state off.
      tryPlay();
      announce("Starting Mythbound background music.");
    }else{
      enabled=false;save();audio.pause();
      announce("Music muted.");
    }
    sync();
  });
  // Playback request stays in the user-activation event; no off/on workaround needed.
  document.addEventListener("pointerdown",event=>{if(enabled&&!toggle.contains(event.target))tryPlay()},true);
  document.addEventListener("keydown",event=>{if(enabled&&!toggle.contains(event.target))tryPlay()},true);
  document.addEventListener("click",event=>{if(enabled&&!toggle.contains(event.target))tryPlay()},true);
  audio.addEventListener("play",()=>{blocked=false;sync()});
  audio.addEventListener("pause",sync);
  audio.addEventListener("canplay",()=>{if(enabled)tryPlay()});
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
