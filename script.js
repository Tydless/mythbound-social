// EDIT YOUR STORY HERE: add your own drawings to images/ and edit image paths below.
const ROLEPLAY_URL = ""; // Paste your DreamJourney bot URL when published.
const posts = [
{id:"champion",handle:"@arena.official",time:"3 years ago",location:"Championship Finals",tag:"TAGGED POST",color:"gold",emoji:"🏆",image:"",artTitle:"THE FINAL ROUND",artSub:"Your art: victorious fighter in the ring",caption:"AND YOUR NEW CHAMPION IS— 🏆 The last round was absolutely unreal.",likes:"14.8k",comments:[["@fighter.offline","Told you I'd win."],["@best.buddy","You also told us you'd clean your kitchen."],["@chaos.buddy","CAN I HAVE THE TROPHY WHEN YOU GET BORED OF IT"]]},
{id:"trophy",handle:"@fighter.offline",time:"2 years, 11 months ago",location:"Home",tag:"PERSONAL POST",color:"red",emoji:"🥇",image:"",artTitle:"PROOF.",artSub:"Your art: proud trophy pose",caption:"For everyone who said I couldn't do it. Thanks for the motivation.",likes:"6,204",comments:[["@chaos.buddy","can i borrow the prize money"],["@best.buddy","Congratulations. Ignore him."]]},
{id:"friends",handle:"@chaos.buddy",time:"2 years ago",location:"After the match",tag:"TAGGED POST",color:"blue",emoji:"📸",image:"",artTitle:"THREE PROBLEMS",artSub:"Your art: group selfie with both buddies",caption:"the gang's all here. one of us is famous and still doesn't pay for parking.",likes:"3,921",comments:[["@fighter.offline","DELETE THE SECOND PHOTO."],["@best.buddy","He parked in my space again."]]},
{id:"training",handle:"@fighter.offline",time:"18 months ago",location:"The gym",tag:"PERSONAL POST",color:"orange",emoji:"🥊",image:"",artTitle:"ONE MORE ROUND",artSub:"Your art: training or sparring snapshot",caption:"Back at it tomorrow. Same time. No excuses.",likes:"4,008",comments:[["@best.buddy","Take a rest day for once."],["@fighter.offline","No."]]},
{id:"hospital",handle:"@chaos.buddy",time:"1 year ago",location:"Hospital",tag:"TAGGED POST",color:"slate",emoji:"🩹",image:"",artTitle:"GONE TOO SOON",artSub:"Your art: MC grumpy in a hospital bed",caption:"bro had a good life 🕊️💀",likes:"11.2k",comments:[["@fighter.offline","I'M NOT FUCKING DEAD."],["@best.buddy","He is currently threatening the nursing staff over hospital food."],["@chaos.buddy","he typed this from beyond the grave"]]},
{id:"recovery",handle:"@best.buddy",time:"8 months ago",location:"The apartment",tag:"TAGGED POST",color:"sage",emoji:"🛋️",image:"",artTitle:"STILL HERE",artSub:"Your art: ordinary hangout during recovery",caption:"He's recovering. He's also terrible company. Some things never change.",likes:"2,319",comments:[["@fighter.offline","Then why are you here?"],["@best.buddy","Someone has to stop you ordering delivery for every meal."]]},
{id:"princess",handle:"@fighter.offline",time:"2 months ago",location:"Mythbound Online",tag:"PERSONAL POST",color:"violet",emoji:"👑",image:"",artTitle:"SHE'S PERFECT",artSub:"Your art: his gorgeous MMO princess avatar",caption:"Finally got the dye match right. Don't talk to me about the shoulder pieces.",likes:"1,876",comments:[["@chaos.buddy","who is she and is she single"],["@fighter.offline","IT'S MY CHARACTER."],["@best.buddy","He's been working on this for six hours."]]},
{id:"contest",handle:"@fighter.offline",time:"Yesterday",location:"Design table, 03:18 AM",tag:"PERSONAL POST",color:"pink",emoji:"✏️",image:"",artTitle:"CAPES. AGAIN.",artSub:"Your art: tank top, messy desk, outfit sketches",caption:"Mythbound outfit contest. Deadline soon. Whoever says 'just use the blue one' is blocked.",likes:"2,014",comments:[["@best.buddy","Please get some sleep."],["@chaos.buddy","just use the blue one"],["@fighter.offline","Blocked."]]}
];
const ad={id:"mythbound-ad",color:"ad",emoji:"✧",image:"",artTitle:"MYTHBOUND ONLINE",artSub:"Design your destiny · Rule the realm",caption:"NEW EVENT — DESIGN THE LEGEND! Submit an original outfit set for a chance to see it added to Mythbound Online."};
let oldestFirst=true; const liked=new Set();let following=false;let lastFocus=null;
const feed=document.getElementById("feed"),backdrop=document.getElementById("modal-backdrop"),modalKicker=document.getElementById("modal-kicker"),modalTitle=document.getElementById("modal-title"),modalContent=document.getElementById("modal-content");
function el(tag,cls,txt){const e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=txt;return e}
function imageBlock(entry,extra=""){const wrapper=el("div",`art art-${entry.color} ${extra}`);if(entry.image){const img=el("img","post-image");img.src=entry.image;img.alt=entry.artSub;img.loading="lazy";wrapper.append(img)}else{wrapper.append(el("span","art-decor",entry.emoji));const label=el("div","art-text");label.append(el("strong","",entry.artTitle),el("span","",entry.artSub));wrapper.append(label)}return wrapper}
function makePost(p){const card=el("article","post");card.id="post-"+p.id;const header=el("div","post-header"),identity=el("div","post-identity");identity.append(el("span","post-handle",p.handle),el("span","post-location",p.time+" · "+p.location));header.append(identity,el("span","post-tag",p.tag));card.append(header);const artBtn=el("button","art-button");artBtn.type="button";artBtn.setAttribute("aria-label","Open post by "+p.handle);artBtn.append(imageBlock(p));artBtn.addEventListener("click",()=>openPost(p));card.append(artBtn);const actions=el("div","post-actions"),like=el("button","icon-button");like.type="button";function sync(){like.textContent=liked.has(p.id)?"♥":"♡";like.classList.toggle("liked",liked.has(p.id));like.setAttribute("aria-pressed",String(liked.has(p.id)));like.setAttribute("aria-label",liked.has(p.id)?"Unlike post":"Like post")}sync();like.addEventListener("click",()=>{liked.has(p.id)?liked.delete(p.id):liked.add(p.id);sync()});const comment=el("button","icon-button","◌");comment.type="button";comment.setAttribute("aria-label","Open comments");comment.addEventListener("click",()=>openPost(p));actions.append(like,comment,el("span","like-count",p.likes+" likes"));card.append(actions);const caption=el("p","post-caption");caption.append(el("strong","",p.handle+"  "),document.createTextNode(p.caption));card.append(caption);const link=el("button","comments-link","View all "+p.comments.length+" comments →");link.type="button";link.addEventListener("click",()=>openPost(p));card.append(link);return card}
function makeAd(){const c=el("article","ad-card");c.append(el("p","eyebrow","SPONSORED · FICTIONAL IN-WORLD AD"));c.append(imageBlock(ad));const info=el("div","ad-info");info.append(el("strong","","MYTHBOUND ONLINE"),el("p","",ad.caption));const b=el("button","ad-button","View the event ↗");b.type="button";b.addEventListener("click",openAd);info.append(b);c.append(info);return c}
function renderFeed(){feed.replaceChildren();const order=oldestFirst?[...posts]:[...posts].reverse();order.forEach((p,i)=>{feed.append(makePost(p));if(i===4)feed.append(makeAd())})}
function showModal(kicker,title){lastFocus=document.activeElement;modalKicker.textContent=kicker;modalTitle.textContent=title;modalContent.replaceChildren();backdrop.hidden=false;document.body.classList.add("modal-open");document.getElementById("modal-close").focus()}
function hideModal(){backdrop.hidden=true;document.body.classList.remove("modal-open");if(lastFocus&&document.contains(lastFocus))lastFocus.focus()}
function openPost(p){showModal(p.tag,p.handle);modalContent.append(imageBlock(p,"modal-art"),el("p","modal-caption",p.caption),el("h3","comments-heading","Comments"));p.comments.forEach(([handle,text])=>{const line=el("div","comment");line.append(el("strong","",handle),el("p","",text));modalContent.append(line)})}
function openAd(){showModal("MYTHBOUND ONLINE · PROMOTION","Design the Legend");modalContent.append(imageBlock(ad,"modal-art"),el("p","modal-caption","Submit your own original outfit concept for a chance to have it featured inside Mythbound Online. Our favorite grumpy fighter has apparently decided this contest is his life's mission."),el("p","modal-note","Fictional promotional content. No real purchases, sign-ups, or downloads."))}
function openDM(){showModal("MYTHBOUND ONLINE · DIRECT MESSAGE","New message");const chat=el("div","chat-preview"),profile=el("div","chat-profile"),info=el("div");info.append(el("strong","","Your ridiculously gorgeous party member"),el("small","","Online now · Mythbound Online"));profile.append(el("span","chat-avatar","♛"),info);chat.append(profile,el("p","chat-date","Just now"),el("div","chat-bubble","Yo. I'm waiting. Come online!"),el("p","chat-narration","And this is where your roleplay begins."));if(ROLEPLAY_URL){const a=el("a","primary continue","Open the roleplay ↗");a.href=ROLEPLAY_URL;a.target="_blank";a.rel="noopener noreferrer";chat.append(a)}else chat.append(el("p","modal-note","When your DreamJourney bot is ready, add its URL to ROLEPLAY_URL in script.js."));modalContent.append(chat)}
document.getElementById("follow-button").addEventListener("click",e=>{following=!following;e.currentTarget.textContent=following?"Following ✓":"Follow";e.currentTarget.setAttribute("aria-pressed",String(following))});
document.getElementById("sort-button").addEventListener("click",e=>{oldestFirst=!oldestFirst;e.currentTarget.textContent=oldestFirst?"Oldest first ↓":"Newest first ↓";renderFeed()});
document.getElementById("message-button").addEventListener("click",openMythboundPortal);
document.getElementById("open-dm").addEventListener("click",openMythboundPortal);
document.querySelectorAll("[data-open-post]").forEach(b=>b.addEventListener("click",()=>{const p=posts.find(x=>x.id===b.dataset.openPost);if(p)openPost(p)}));
document.getElementById("modal-close").addEventListener("click",hideModal);
backdrop.addEventListener("click",e=>{if(e.target===backdrop)hideModal()});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!backdrop.hidden)hideModal();if(e.key==="Tab"&&!backdrop.hidden){const focusable=[...backdrop.querySelectorAll("button,a[href]")].filter(x=>!x.disabled);if(!focusable.length)return;const first=focusable[0],last=focusable[focusable.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}});
renderFeed();


/* AFTERHOURS → MYTHBOUND: Optional persistent game whisper.
   Visitors can keep reading; clicking opens the fictional game portal in a new tab. */
const MYTHBOUND_PORTAL_URL = "./mythbound/";
let portalNoticeShown = false;

// A soft, original two-note chime, synthesized locally.
// Browsers block unsolicited audio. An explicit "Enable audio" control offers
// a reliable way to unlock sound before the scroll-triggered whisper arrives.
let mythboundAudio = null;
let mythboundAudioReady = false;
let mythboundSoundEnabled = true;
let mythboundAudioButton = null;
let syncPopupAudioControls = () => {};
try { mythboundSoundEnabled = localStorage.getItem("afterhours-mythbound-sound") !== "off"; } catch {}

function saveMythboundSoundPreference(){
  try { localStorage.setItem("afterhours-mythbound-sound",mythboundSoundEnabled?"on":"off"); } catch {}
}
function syncMythboundAudioUI(){
  if(mythboundAudioButton){
    mythboundAudioButton.textContent = !mythboundSoundEnabled
      ? "🔇 Sound muted"
      : mythboundAudioReady ? "🔊 Sound ready" : "♫ Enable audio";
    mythboundAudioButton.setAttribute("aria-pressed", String(mythboundSoundEnabled && mythboundAudioReady));
    mythboundAudioButton.title = mythboundSoundEnabled && mythboundAudioReady
      ? "Notification chimes enabled. Click to mute."
      : "Click to enable notification sound before scrolling.";
  }
  syncPopupAudioControls();
}
async function primeMythboundAudio(){
  if(!mythboundSoundEnabled)return false;
  const Context = window.AudioContext || window.webkitAudioContext;
  if(!Context)return false;
  try{
    // Create or resume the context directly from a user gesture.
    if(!mythboundAudio)mythboundAudio=new Context();
    if(mythboundAudio.state!=="running")await mythboundAudio.resume();
    mythboundAudioReady=mythboundAudio.state==="running";
  }catch{
    mythboundAudioReady=false;
  }
  syncMythboundAudioUI();
  return mythboundAudioReady;
}
function installEarlyAudioControl(){
  const bar=document.querySelector(".topbar");
  if(!bar)return;
  const button=document.createElement("button");
  button.type="button";
  button.className="afterhours-audio-enable";
  button.setAttribute("aria-label","Enable website notification audio");
  bar.insertBefore(button,bar.querySelector(".topbar-star"));
  mythboundAudioButton=button;
  button.addEventListener("click",()=>{
    if(mythboundSoundEnabled && mythboundAudioReady){
      mythboundSoundEnabled=false;
      saveMythboundSoundPreference();
      syncMythboundAudioUI();
    }else{
      mythboundSoundEnabled=true;
      saveMythboundSoundPreference();
      void primeMythboundAudio();
    }
  });
  syncMythboundAudioUI();
}
// Any normal user interaction also unlocks sound silently.
document.addEventListener("pointerdown",()=>{void primeMythboundAudio()},{passive:true});
document.addEventListener("keydown",()=>{void primeMythboundAudio()},{passive:true});

async function playMythboundChime(fromUserAction=false){
  if(!mythboundSoundEnabled)return false;
  if(fromUserAction)await primeMythboundAudio();
  const ctx=mythboundAudio;
  if(!ctx || ctx.state!=="running")return false;
  try{
    const now=ctx.currentTime+0.015;
    [[740,0,.23,.035],[1109.8,.145,.33,.03]].forEach(([pitch,delay,length,volume])=>{
      const tone=ctx.createOscillator();
      const envelope=ctx.createGain();
      tone.type="sine";
      tone.frequency.setValueAtTime(pitch,now+delay);
      envelope.gain.setValueAtTime(0.0001,now+delay);
      envelope.gain.exponentialRampToValueAtTime(volume,now+delay+.018);
      envelope.gain.exponentialRampToValueAtTime(0.0001,now+delay+length);
      tone.connect(envelope);
      envelope.connect(ctx.destination);
      tone.start(now+delay);
      tone.stop(now+delay+length+.01);
    });
    return true;
  }catch{return false}
}
installEarlyAudioControl();

/* Before visitors scroll, give the browser one deliberate interaction to
   unlock the chime. This preserves the surprise without revealing Mythbound.
   Silent entry remains available for visitors who do not want audio. */
function installAfterhoursEntry(){
  if(!mythboundSoundEnabled)return;
  const cover=document.createElement("div");
  cover.className="afterhours-entry";
  cover.setAttribute("role","dialog");
  cover.setAttribute("aria-modal","true");
  cover.setAttribute("aria-labelledby","afterhours-entry-title");
  cover.innerHTML='<div class="afterhours-entry-card"><div class="afterhours-entry-mark">afterhours<span>.</span></div><p class="afterhours-entry-eyebrow">A STORY IN POSTS</p><h2 id="afterhours-entry-title">There is more to the story.</h2><p>Take a look around. Some things are easier to find than others.</p><button type="button" class="afterhours-enter">Enter Afterhours <span aria-hidden="true">↗</span></button><button type="button" class="afterhours-enter-silent">Enter without sound</button><span class="afterhours-entry-hint">Sound is on by default. You can mute it anytime.</span></div>';
  document.body.append(cover);
  document.body.classList.add("afterhours-entry-open");
  const enter=cover.querySelector(".afterhours-enter");
  const silent=cover.querySelector(".afterhours-enter-silent");
  let complete=false;
  function finish(){
    if(complete)return;
    complete=true;
    cover.remove();
    document.body.classList.remove("afterhours-entry-open");
    document.getElementById("follow-button")?.focus({preventScroll:true});
  }
  enter.addEventListener("click",()=>{
    // Prime the Web Audio context synchronously during this click.
    void primeMythboundAudio();
    finish();
  });
  silent.addEventListener("click",()=>{
    mythboundSoundEnabled=false;
    saveMythboundSoundPreference();
    syncMythboundAudioUI();
    finish();
  });
  // Keep keyboard navigation inside the entry dialog until a choice is made.
  cover.addEventListener("keydown",event=>{
    if(event.key!=="Tab")return;
    const controls=[enter,silent],idx=controls.indexOf(document.activeElement);
    if(event.shiftKey && idx===0){event.preventDefault();silent.focus()}
    else if(!event.shiftKey && idx===1){event.preventDefault();enter.focus()}
  });
  enter.focus({preventScroll:true});
}
installAfterhoursEntry();

function openMythboundPortal(){
  window.open(MYTHBOUND_PORTAL_URL,"_blank","noopener,noreferrer");
}
function installMythboundNotice(){
  const notice=document.createElement("aside");
  notice.id="mythbound-notice";
  notice.className="mythbound-notice";
  notice.setAttribute("aria-label","Mythbound message notification");
  notice.innerHTML='<div class="mythbound-notice-head"><span>✧ MYTHBOUND ONLINE</span><button type="button" class="mythbound-notice-dismiss" aria-label="Minimize Mythbound notification">×</button></div><div class="mythbound-notice-body"><span class="mythbound-notice-avatar" aria-hidden="true">✥</span><div><strong>Fighter · New Whisper</strong><p>Yo, I\'ve got time. You in for a raid?</p></div></div><button type="button" class="mythbound-notice-open">Open Mythbound ↗</button>';
  const badge=document.createElement("button");
  badge.id="mythbound-notice-badge";
  badge.type="button";
  badge.className="mythbound-notice-badge";
  badge.hidden=true;
  badge.textContent="✧ Mythbound · 1 new whisper";
  badge.setAttribute("aria-label","Reopen minimized Mythbound message");
  document.body.append(notice,badge);
  // Keep optional audio controls subtle and separate from the navigation.
  const audioControls=document.createElement("div");
  audioControls.className="mythbound-notice-audio";
  const toggleSound=document.createElement("button");
  toggleSound.type="button";
  toggleSound.className="mythbound-notice-sound";
  const replaySound=document.createElement("button");
  replaySound.type="button";
  replaySound.className="mythbound-notice-replay";
  replaySound.textContent="♫ Replay chime";
  function syncSoundControl(){
    toggleSound.textContent=!mythboundSoundEnabled?"🔇 Sound off"
      : mythboundAudioReady?"🔊 Sound on":"♫ Enable sound";
    toggleSound.setAttribute("aria-pressed",String(mythboundSoundEnabled && mythboundAudioReady));
    toggleSound.setAttribute("aria-label",!mythboundSoundEnabled
      ? "Enable Mythbound notification sounds"
      : mythboundAudioReady?"Mute Mythbound notification sounds":"Enable Mythbound audio in your browser");
    replaySound.disabled=!mythboundSoundEnabled;
  }
  syncPopupAudioControls=syncSoundControl;
  toggleSound.addEventListener("click",()=>{
    if(mythboundSoundEnabled && mythboundAudioReady){
      mythboundSoundEnabled=false;
      saveMythboundSoundPreference();
      syncMythboundAudioUI();
    }else{
      mythboundSoundEnabled=true;
      saveMythboundSoundPreference();
      // Activating sound from a button press is permitted by browser autoplay rules.
      void playMythboundChime(true).then(()=>syncMythboundAudioUI());
    }
  });
  replaySound.addEventListener("click",()=>{void playMythboundChime(true)});
  audioControls.append(toggleSound,replaySound);
  notice.insertBefore(audioControls,notice.querySelector(".mythbound-notice-open"));
  syncSoundControl();
  const dismiss=notice.querySelector(".mythbound-notice-dismiss");
  dismiss.addEventListener("click",()=>{notice.classList.remove("is-visible");badge.hidden=false});
  badge.addEventListener("click",()=>{badge.hidden=true;notice.classList.add("is-visible")});
  notice.querySelector(".mythbound-notice-open").addEventListener("click",openMythboundPortal);
  function showAtNaturalMoment(){
    if(portalNoticeShown)return;
    // Reveal after a little browsing, not after 30% of the entire long feed.
    const threshold=Math.max(220,Math.min(650,window.innerHeight*.85));
    if(window.scrollY<threshold)return;
    portalNoticeShown=true;
    notice.classList.add("is-visible");
    void playMythboundChime();
    window.removeEventListener("scroll",showAtNaturalMoment);
  }
  window.addEventListener("scroll",showAtNaturalMoment,{passive:true});
  showAtNaturalMoment();
}
installMythboundNotice();
