/* Mythbound fictional game portal.
   Set the public Dreamjourney bot URL here when ready. */
const DREAMJOURNEY_URL = ""; 
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
function openWhisper(){openPanel("whisper-template")}
document.getElementById("fighter-friend").addEventListener("click",openProfile);
document.getElementById("rail-whisper").addEventListener("click",openWhisper);
headerWhisper.addEventListener("click",openWhisper);
whisperButton.addEventListener("click",openWhisper);
document.getElementById("account-button").addEventListener("click",()=>{openPanel("profile-template")});
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
  // Must be opened from the direct user interaction to avoid most popup blockers.
  const newTab=window.open(DREAMJOURNEY_URL,"_blank","noopener,noreferrer");
  if(!newTab)status.textContent="Your browser blocked the new tab. Please allow pop-ups or open the character page manually.";
}
const route=location.hash.slice(1);navigate(route||"home",true);selectClass("saint");
