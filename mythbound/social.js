/* Mythbound fictional social history — local read state; no real messages sent. */
(() => {
  "use strict";
  const $=id=>document.getElementById(id);
  const content=$("sheet-content");
  const readKey="mythbound-session-read-message-ids-v1";
  // Read receipts belong to this playthrough, not the saved player identity.
  // Reloads retain them, but a fresh tab/session or explicit login starts anew.
  const incoming=[{id:"fighter-raid-invite-live-1",thread:"fighter",text:"Yo, I've got time. You in for a raid?",time:"JUST NOW"}];
  function loadRead(){
    try{const raw=sessionStorage.getItem(readKey);if(raw!==null){const parsed=JSON.parse(raw);if(Array.isArray(parsed))return new Set(parsed.filter(x=>typeof x==="string"))}}catch{}
    return new Set();
  }
  let readIds=loadRead();
  function unreadCount(thread){return incoming.filter(m=>(!thread||m.thread===thread)&&!readIds.has(m.id)&&!isMuted(m.thread)&&!isArchived(m.thread)).length}
  const unreadLabel=n=>n+" unread message"+(n===1?"":"s");
  const people={
    fighter:{name:"Fighter",file:"ProfileSaintFemale.png",glyph:"✥",info:"Saint · Lv. 84",status:"Online",online:true,level:84,className:"Saint",banner:"../BannerSaint.png",accent:"#e8c895",availability:"Inbox Open",quote:"I have enough heals. You, apparently, don't have enough brain cells.",about:"Perfect dye combinations. Beautiful armor. Good healing rotations. I know what I'm doing, so please stop running into the boss.",playstyle:"Raid support",favorite:"Outfit collecting"},
    chaotic:{name:"Chaotic Buddy",file:"ProfileAnimar.png",glyph:"◈",info:"Animar · Lv. 118",status:"Online",online:true,level:118,className:"Animar",accent:"#90d2d0",availability:"Only in-game",quote:"If it has a health bar, I can fight it.",about:"Animar main. Professional loot enjoyer. The party's best source of questionable decisions."},
    responsible:{name:"Responsible Buddy",glyph:"",info:"Lv. 12",status:"Last online 39 days ago",online:false,level:12,accent:"#b3bfd0",availability:"Don’t disturb",quote:"I was forced to do this."}
  };
  const oldChats=[
    {id:"moonmoth",name:"MoonMoth",file:"ProfileElemis.png",preview:"You're good, honestly. We should run that again...",date:"2 days ago"},
    {id:"woolly",name:"WoollyWanderer",file:"ProfileHerder.png",preview:"Thanks for helping with the quest!",date:"4 days ago"},
    {id:"crit",name:"CritHappens",file:"ProfileBreaker.png",preview:"gg! sorry about that last pull lol",date:"6 days ago"},
    {id:"lunar",name:"LunarBlade",file:"ProfileStrider.png",preview:"Do you still have that spare material?",date:"1 week ago"},
    {id:"rook",name:"Rook_07",preview:"Hey, are you in a guild yet?",date:"2 weeks ago"}
  ];
  const contacts={...people,...Object.fromEntries(oldChats.map(p=>[p.id,p]))};
  const stateKey="mythbound-social-actions-v1";
  let socialState={muted:[],requests:[],archived:[],replies:{}};
  try{const v=JSON.parse(sessionStorage.getItem(stateKey)||"null");if(v&&typeof v==="object"){
    for(const k of ["muted","requests","archived"])if(Array.isArray(v[k]))socialState[k]=v[k].filter(id=>Object.hasOwn(contacts,id));
    if(v.replies&&typeof v.replies==="object")for(const id of Object.keys(contacts))if(Array.isArray(v.replies[id]))socialState.replies[id]=v.replies[id].filter(x=>typeof x?.text==="string").slice(-100);
  }}catch{}
  const saved=()=>{try{sessionStorage.setItem(stateKey,JSON.stringify(socialState))}catch{}};
  const isFriend=id=>Object.hasOwn(people,id);
  const isMuted=id=>socialState.muted.includes(id);
  const isArchived=id=>socialState.archived.includes(id);
  const make=(tag,cls,value)=>{
    const el=document.createElement(tag);if(cls)el.className=cls;if(value!==undefined)el.textContent=value;return el;
  };
  function nickname(){return $("rail-player-name")?.textContent.trim()||"Traveler"}
  function avatar(person,large=false){
    const wrap=make("span","mb-social-avatar"+(large?" is-large":""));wrap.setAttribute("aria-hidden","true");
    if(typeof person.online==="boolean"){wrap.dataset.presence=person.online?"online":"offline";wrap.title=person.online?"Online":person.status||"Offline";wrap.removeAttribute("aria-hidden");wrap.setAttribute("role","img");wrap.setAttribute("aria-label",wrap.title)}
    const fallback=make("span","mb-social-fallback",person.glyph||"");
    if(!person.glyph)fallback.classList.add("mb-default-person");
    wrap.append(fallback);
    if(person.file){
      const pic=make("img");pic.alt="";pic.decoding="async";pic.draggable=false;
      pic.addEventListener("load",()=>wrap.classList.add("has-image"),{once:true});
      pic.addEventListener("error",()=>pic.remove(),{once:true});
      wrap.append(pic);pic.src="../"+person.file;
    }
    return wrap;
  }
  let activeMenu=null,menuTrigger=null,toastTimer=0,currentView="inbox";
  const sheet=content.closest(".sheet");
  const menu=make("div","mb-contact-menu");menu.hidden=true;menu.setAttribute("role","group");menu.setAttribute("aria-label","Player actions");sheet.append(menu);
  const toast=make("div","mb-social-toast");toast.hidden=true;toast.setAttribute("role","status");toast.setAttribute("aria-live","polite");sheet.append(toast);
  function notify(message){clearTimeout(toastTimer);toast.textContent=message;toast.hidden=false;toastTimer=setTimeout(()=>toast.hidden=true,3200)}
  function closeContactMenu(restore=false){const old=menuTrigger;menu.hidden=true;menu.replaceChildren();activeMenu=null;menuTrigger=null;old?.setAttribute("aria-expanded","false");if(restore&&old?.isConnected)old.focus({preventScroll:true})}
  function placeMenu(){if(!menuTrigger?.isConnected){closeContactMenu();return}const b=menuTrigger.getBoundingClientRect(),host=sheet.getBoundingClientRect();if(b.bottom<host.top||b.top>host.bottom){closeContactMenu();return}const m=menu.getBoundingClientRect();menu.style.left=Math.max(host.left+8,Math.min(b.left,host.right-m.width-8))+"px";menu.style.top=Math.max(host.top+8,Math.min(b.bottom+6,host.bottom-m.height-8))+"px"}
  function syncMuteStyles(){content.querySelectorAll("[data-contact-id]").forEach(el=>el.classList.toggle("mb-muted",isMuted(el.dataset.contactId)));syncUnread()}
  function contactButton(id,large=false){
    const p=contacts[id],button=make("button","mb-contact-avatar");button.type="button";button.setAttribute("aria-label","Actions for "+p.name);button.setAttribute("aria-expanded","false");button.append(avatar(p,large));button.addEventListener("click",e=>{e.stopPropagation();openContactMenu(id,button)});return button;
  }
  function openContactMenu(id,trigger){
    if(!contacts[id]||window.MythboundAccount?.isSignedIn()===false)return;
    if(activeMenu===id&&menuTrigger===trigger){closeContactMenu(true);return}closeContactMenu();activeMenu=id;menuTrigger=trigger;trigger.setAttribute("aria-expanded","true");
    menu.append(make("strong","mb-contact-menu-title",contacts[id].name));
    function item(label,action){const b=make("button","",label);b.type="button";b.addEventListener("click",action);menu.append(b)}
    if(isFriend(id))item("View profile",()=>{closeContactMenu();openFriend(id)});
    item("Send Whisper",()=>{closeContactMenu();openContactWhisper(id)});
    item(isMuted(id)?"Unmute":"Mute",()=>{if(isMuted(id))socialState.muted=socialState.muted.filter(x=>x!==id);else socialState.muted.push(id);saved();syncMuteStyles();closeContactMenu(true)});
    item(isFriend(id)?"Already friends":socialState.requests.includes(id)?"Request Sent":"Send Friend Request",()=>{
      if(isFriend(id)){notify("Already friends");return}
      if(socialState.requests.includes(id)){notify("Already sent");return}
      socialState.requests.push(id);saved();notify("Request successfully sent");menu.querySelectorAll("button").forEach(b=>{if(b.textContent==="Send Friend Request")b.textContent="Request Sent"});
    });
    item("Report",()=>{closeContactMenu();openReport(id)});
    menu.hidden=false;placeMenu();menu.querySelector("button")?.focus({preventScroll:true});
  }
  document.addEventListener("pointerdown",e=>{if(activeMenu&&!menu.contains(e.target)&&!menuTrigger?.contains(e.target))closeContactMenu()},true);
  document.addEventListener("keydown",e=>{if(e.key==="Escape"&&activeMenu){e.preventDefault();e.stopImmediatePropagation();closeContactMenu(true)}},true);
  sheet.addEventListener("scroll",()=>{if(activeMenu)closeContactMenu()},{passive:true,capture:true});
  window.addEventListener("resize",()=>{if(activeMenu)placeMenu()});
  new MutationObserver(()=>{if(overlay.hidden)closeContactMenu();else if(menuTrigger&&!menuTrigger.isConnected)closeContactMenu()}).observe(overlay,{attributes:true,attributeFilter:["hidden"]});
  function markSeen(thread="fighter"){
    if(window.MythboundAccount?.isSignedIn()===false)return;
    for(const id of loadRead())readIds.add(id);
    for(const m of incoming)if(m.thread===thread)readIds.add(m.id);
    try{sessionStorage.setItem(readKey,JSON.stringify([...readIds]))}catch{}
    syncUnread();
  }
  function resetReadState(){
    readIds.clear();socialState={muted:[],requests:[],archived:[],replies:{}};saved();
    try{sessionStorage.removeItem(readKey)}catch{}
    syncUnread();
  }
  function badge(node,n){if(node){node.hidden=n===0;node.textContent=n>99?"99+":String(n);node.title=unreadLabel(n)}}
  function syncUnread(){
    const n=unreadCount(),f=unreadCount("fighter"),label=n?"Open inbox, "+unreadLabel(n):"Open inbox";
    badge($("header-whisper")?.querySelector(".notification-count"),n);
    for(const id of ["mobile-inbox-count","mobile-menu-unread","own-profile-inbox-count"])badge($(id),n);
    const dot=$("rail-whisper")?.querySelector(".unread-dot");if(dot)dot.hidden=f===0;
    const mini=document.querySelector(".whispers-panel .mini-count");if(mini)mini.textContent=n?n+" new":"";
    const float=$("floating-whisper");if(float){float.querySelector("span:last-child").textContent=n?n+" new message"+(n===1?"":"s"):"Inbox";float.setAttribute("aria-label",label)}
    for(const id of ["header-whisper","mobile-inbox","own-profile-inbox"])$(id)?.setAttribute("aria-label",label);
    const sub=$("mb-inbox-unread-summary");if(sub)sub.textContent=n?unreadLabel(n)+" · Whispers & party conversations":"All caught up · Whispers & party conversations";
    document.querySelectorAll("[data-mb-inbox-thread]").forEach(row=>{
      const count=unreadCount(row.dataset.mbInboxThread);row.classList.toggle("mb-is-unread",count>0);badge(row.querySelector(".mb-thread-count"),count);
      (row.querySelector(".mb-contact-open")||row).setAttribute("aria-label",(row.querySelector(".mb-inbox-top strong")?.textContent||"Conversation")+(count?", "+unreadLabel(count):", read"));
      if(row.dataset.mbInboxThread==="fighter"){const date=row.querySelector(".mb-inbox-date");if(date)date.textContent=count?"Just now":"Today"}
    });
    document.querySelectorAll(".mb-inbox-tab-count").forEach(el=>badge(el,n));
    document.dispatchEvent(new CustomEvent("mythbound:unread",{detail:{count:n}}));
  }
  function renderFighterMessages(){
    const log=content.querySelector(".conversation");if(!log)return;log.replaceChildren();let marked=false;
    for(const m of incoming.filter(m=>m.thread==="fighter")){
      const unread=!readIds.has(m.id);
      if(unread&&!marked){log.append(make("p","mb-new-message-divider","New messages"));marked=true}
      log.append(make("p","timestamp",unread?m.time:"TODAY"),make("div","received-message"+(unread?" mb-unread-message":""),m.text));
    }
  }
  function heading(title,sub){
    const head=make("div","mb-social-heading");
    const text=make("div");const h=make("h2","",title);h.id="sheet-title";text.append(h,make("p","",sub));head.append(text);return head;
  }
  function back(label="Back to inbox",action=openInbox){
    const b=make("button","mb-social-back","‹ "+label);b.type="button";b.addEventListener("click",action);return b;
  }
  function display(nodes,kicker){
    if(window.MythboundAccount?.isSignedIn()===false)return;
    if(overlay.hidden)previousFocus=document.activeElement;
    overlay.classList.remove("mb-launcher-modal");
    closeContactMenu();content.replaceChildren(...nodes);
    $("sheet-kicker").textContent=kicker;
    overlay.hidden=false;document.body.classList.add("sheet-open");content.closest(".sheet").scrollTop=0;$("sheet-close").focus({preventScroll:true});
  }
  function friendRow(id){
    const p=people[id],row=make("div","mb-inbox-row mb-social-friend");row.dataset.contactId=id;row.classList.toggle("mb-muted",isMuted(id));
    const button=make("button","mb-contact-open");button.type="button";
    const words=make("span","mb-inbox-words");words.append(make("strong","",p.name),make("small","",p.info));if(!p.online)words.append(make("small","mb-offline",p.status));
    button.append(words,make("span","mb-row-chevron","›"));row.append(contactButton(id),button);
    button.addEventListener("click",()=>openFriend(id));return row;
  }
  function groupAvatar(interactive=false){
    const g=make("span","mb-group-avatar"+(interactive?" mb-group-interactive":""));
    if(!interactive)g.setAttribute("aria-hidden","true");
    for(const id of ["fighter","chaotic","responsible"])g.append(interactive?contactButton(id):avatar(people[id]));return g;
  }
  function inboxRow(p,options={}){
    const id=options.thread,row=make("div","mb-inbox-row"+(options.pinned?" mb-pinned":""));const button=make("button","mb-contact-open");button.type="button";button.addEventListener("click",options.onClick);
    const words=make("span","mb-inbox-words"),top=make("span","mb-inbox-top");
    top.append(make("strong","",p.name),make("small","mb-inbox-date",p.date));words.append(top,make("small","mb-message-preview",p.preview));
    row.append(options.pinned?groupAvatar(true):contactButton(id),button);button.append(words);
    if(id){row.dataset.mbInboxThread=id;if(!options.pinned){row.dataset.contactId=id;row.classList.toggle("mb-muted",isMuted(id))}const n=unreadCount(id),b=make("span","mb-unread-badge mb-thread-count");row.classList.toggle("mb-is-unread",n>0);badge(b,n);button.append(b)}
    return row;
  }
  function inboxTabs(active){
    const tabs=make("div","mb-inbox-tabs");
    for(const [id,label,action] of [["inbox","Messages",openInbox],["friends","Friends · 3",openFriends],["archives","Archives",openArchives]]){
      const b=make("button",id===active?"is-active":"",label);b.type="button";b.setAttribute("aria-pressed",String(id===active));if(id==="inbox")b.append(make("span","mb-unread-badge mb-inbox-tab-count"));b.addEventListener("click",action);tabs.append(b)
    }return tabs
  }
  function threadRow(id){
    const p=contacts[id],last=socialState.replies[id]?.at(-1);
    const incomingText=id==="fighter"?incoming.filter(m=>m.thread==="fighter").at(-1)?.text:p.preview;
    return inboxRow({...p,preview:last?"You: "+last.text:incomingText||"Start a conversation",date:last?"Today":id==="fighter"?(unreadCount("fighter")?"Just now":"Today"):p.date||"Today"},{thread:id,onClick:()=>openContactWhisper(id)})
  }
  function openInbox(){
    if(window.MythboundAccount?.isSignedIn()===false)return;currentView="inbox";
    const head=heading("Inbox","Whispers & party conversations");head.querySelector("p").id="mb-inbox-unread-summary";
    const list=make("div","mb-inbox-list");
    list.append(make("div","mb-inbox-label","PINNED · PARTY CHAT"));
    list.append(inboxRow({name:"The Usual Suspects",preview:"Chaotic Buddy: THE LOOT WAS MINE FIRST",date:"Yesterday"},{pinned:true,thread:"party",onClick:openGroup}));
    list.append(make("div","mb-inbox-label","WHISPERS"));
    for(const id of ["fighter",...oldChats.map(p=>p.id),...["chaotic","responsible"].filter(id=>socialState.replies[id]?.length)])if(!isArchived(id))list.append(threadRow(id));
    display([head,inboxTabs("inbox"),list],"MYTHBOUND · SOCIAL");syncUnread();
  }
  function openArchives(){
    currentView="archives";const head=heading("Archives","Reported conversations"),list=make("div","mb-inbox-list");
    if(!socialState.archived.length)list.append(make("p","mb-social-note","No archived conversations yet."));
    for(const id of socialState.archived)list.append(threadRow(id));
    display([head,inboxTabs("archives"),list],"MYTHBOUND · SOCIAL");syncUnread()
  }
  function openContactWhisper(id){
    if(!contacts[id]||window.MythboundAccount?.isSignedIn()===false)return;
    if(id==="fighter"){openWhisper();return}
    currentView="whisper";
    const p=contacts[id],head=heading(p.name,p.info||"Whispers");head.prepend(contactButton(id,true));
    const log=make("div","conversation mb-local-conversation");log.setAttribute("role","log");
    function render(){log.replaceChildren();if(p.preview)log.append(make("p","timestamp",p.date.toUpperCase()),make("div","received-message",p.preview));for(const msg of socialState.replies[id]||[]){log.append(make("p","timestamp","TODAY"),make("div","mb-local-sent",msg.text))}}
    render();
    const form=make("form","reply-form"),label=make("label","","Your reply"),input=make("textarea");input.id="mb-local-reply";label.htmlFor=input.id;input.rows=2;input.maxLength=500;input.placeholder="Write a reply…";input.required=true;
    const send=make("button","solid-action wide","Send Whisper");send.type="submit";
    form.append(label,input,make("p","reply-hint","Fictional conversation · replies stay on this device."),send);
    form.addEventListener("submit",e=>{e.preventDefault();const text=input.value.trim();if(!text)return;(socialState.replies[id]??=[]).push({text});socialState.replies[id]=socialState.replies[id].slice(-100);saved();input.value="";render();log.scrollTop=log.scrollHeight;notify("Message sent")});
    display([back(isArchived(id)?"Back to archives":"Back to inbox",isArchived(id)?openArchives:openInbox),head,log,form],"MYTHBOUND · SOCIAL");
  }
  function openReport(id){
    const p=contacts[id],head=heading("Report "+p.name,"Are you sure you want to report this conversation?");
    const form=make("form","mb-report-form"),fields=make("fieldset");fields.append(make("legend","","Choose a reason"));
    for(const reason of ["Insult","Discrimination","Spam","Annoying","Because why not?"]){const label=make("label","mb-report-reason"),radio=make("input");radio.type="radio";radio.name="report-reason";radio.value=reason;radio.required=true;label.append(radio,make("span","",reason));fields.append(label)}
    const buttons=make("div","mb-report-actions"),cancel=make("button","outline-action","Cancel"),submit=make("button","solid-action","Report");cancel.type="button";submit.type="submit";
    cancel.addEventListener("click",()=>openContactWhisper(id));buttons.append(cancel,submit);form.append(fields,make("p","reply-hint","This is a fictional report. No real report is submitted."),buttons);
    form.addEventListener("submit",e=>{e.preventDefault();if(!form.querySelector("input:checked"))return;if(!isArchived(id))socialState.archived.push(id);saved();markSeen(id);openInbox();notify("Thanks, we’ll look into it.")});
    display([head,form],"MYTHBOUND · REPORT");
  }
  function openFriends(){
    if(window.MythboundAccount?.isSignedIn()===false)return;
    const head=heading("Friends","2 online · 3 friends");
    currentView="friends";const tabs=inboxTabs("friends");
    const list=make("div","mb-inbox-list");
    for(const id of ["fighter","chaotic","responsible"])list.append(friendRow(id));
    display([head,tabs,list],"MYTHBOUND · SOCIAL");syncUnread();
  }
  function openFriend(id){
    if(window.MythboundAccount?.isSignedIn()===false)return;
    const p=people[id];if(!p)return;
    const profile=make("article","mb-unified-profile mb-friend-profile");profile.style.setProperty("--profile-accent",p.accent);
    const banner=make("header","mb-profile-banner");
    if(p.banner)banner.style.setProperty("--profile-banner",'url("'+p.banner+'")');
    const identity=make("div","mb-profile-identity"),photo=contactButton(id,true),name=make("div","mb-profile-name");
    const title=make("h2","",p.name);title.id="sheet-title";
    name.append(title,make("p","mb-profile-presence",p.status));identity.append(photo,name);banner.append(identity);
    const wrap=make("div","mb-profile-main");
    const overview=make("div","mb-profile-overview"),details=make("dl","mb-profile-facts");
    for(const [label,value] of [["Level",String(p.level)],["Class",p.className],["Current region",p.region],["Guild",p.guild]]){
      const item=make("div");item.append(make("dt","",label),make("dd",value?"":"mb-profile-unknown",value||"Not revealed"));details.append(item);
    }
    const stage=make("section","mb-profile-model");stage.setAttribute("aria-label","3D character preview coming soon");
    const art=make("div","mb-profile-model-art");art.innerHTML='<svg viewBox="0 0 100 150" fill="none" aria-hidden="true"><ellipse cx="50" cy="130" rx="38" ry="12" stroke="currentColor" stroke-width="1.5"/><ellipse cx="50" cy="130" rx="29" ry="7" stroke="currentColor" stroke-dasharray="2 4"/><circle cx="50" cy="40" r="12" stroke="currentColor" stroke-width="1.5"/><path d="M50 53v42M31 72l19-10 19 10M50 95l-17 30M50 95l17 30" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M12 130V20h76v110" stroke="currentColor" stroke-dasharray="2 5" opacity=".4"/></svg>';
    stage.append(art,make("span","mb-profile-model-label","3D viewer · Coming soon"));overview.append(details,stage);wrap.append(overview);
    const availability=make("section","mb-profile-availability");
    availability.append(make("h3","","Status"),make("span","mb-profile-status",p.availability));
    availability.lastChild.dataset.availability=p.availability;wrap.append(availability);
    const bio=make("section","mb-profile-bio");bio.append(make("p","profile-quote","“"+p.quote+"”"));
    if(p.playstyle||p.favorite){const extras=make("dl","mb-profile-extras");for(const [label,value] of [["Playstyle",p.playstyle],["Favorite thing",p.favorite]])if(value){const item=make("div");item.append(make("dt","",label),make("dd","",value));extras.append(item)}bio.append(extras)}
    wrap.append(bio,make("p","mb-mutual-note","✧ You and "+p.name+" have 2 mutual friends."));
    if(id==="fighter"){const message=make("button","solid-action wide","Open Fighter’s whisper ↗");message.type="button";message.addEventListener("click",openWhisper);wrap.append(message)}
    profile.append(banner,wrap);
    display([back("Back to friends",openFriends),profile],"MYTHBOUND · PLAYER PROFILE");
  }
  // Only supplied, successfully loaded recordings appear in the fictional archive.
  // Files live at the repository root. No microphone access or synthesized speech.
  const partyRecordings=[
    {id:"chaotic-01",person:"chaotic",time:"20:48",file:"VoiceChatChaoticBuddy01.mp3"},
    {id:"player-01",person:"player",time:"20:49",file:"VoiceChatPlayer01.mp3"},
    {id:"fighter-01",person:"fighter",time:"20:49",file:"VoiceChatFighter01.mp3",requires:"player-01"},
    {id:"responsible-01",person:"responsible",time:"20:50",file:"VoiceChatResponsibleBuddy01.mp3",requires:"player-01"}
  ];
  const partyVersion=new URL(document.currentScript?.src||location.href,document.baseURI).searchParams.get("v");
  const partyMusic=$("mythbound-theme");
  let playingPartyAudio=null;
  const playIcon='<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l12-7z"/></svg>';
  const pauseIcon='<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 5h4v14H7zm6 0h4v14h-4z"/></svg>';
  const microphoneIcon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2m-7 9v3m-3 0h6"/></svg>';
  function releasePartyVoice(audio){
    if(playingPartyAudio!==audio)return;
    playingPartyAudio=null;
    window.MythboundAudio?.release("party-voice");
  }
  function stopPartyVoice(){
    const audio=playingPartyAudio;
    if(audio){audio.pause();releasePartyVoice(audio)}
  }
  function startPartyVoice(audio){
    if(playingPartyAudio===audio)return;
    stopPartyVoice();
    document.dispatchEvent(new Event("mythbound:party-voice-start"));
    playingPartyAudio=audio;
    window.MythboundAudio?.duck("party-voice",.12,.10,"full");
  }
  function durationText(value){
    const n=Math.max(0,Math.floor(Number.isFinite(value)?value:0));
    return Math.floor(n/60)+":"+String(n%60).padStart(2,"0");
  }
  function createPartyVoice(recording,person,onAvailability){
    const bubble=make("div","mb-chat-bubble mb-voice-bubble"),audio=make("audio");
    audio.preload="metadata";audio.hidden=true;
    const controls=make("div","mb-voice-controls"),play=make("button","mb-voice-play");
    play.type="button";play.disabled=true;play.innerHTML=playIcon;
    const track=make("div","mb-voice-track"),wave=make("div","mb-voice-wave");
    wave.setAttribute("aria-hidden","true");
    for(let i=0;i<34;i++){
      const segment=make("span");segment.style.height=(4+Math.round(Math.abs(Math.sin(i*2.31)*Math.cos(i*.29))*20))+"px";wave.append(segment);
    }
    const seek=make("input","mb-voice-seek");seek.type="range";seek.min="0";seek.max="1";seek.step=".01";seek.value="0";seek.disabled=true;seek.setAttribute("aria-label","Seek voice message");
    track.append(wave,seek);
    const time=make("span","mb-voice-time","0:00"),label=make("span","mb-voice-label","Voice message"),status=make("span","mb-voice-status");
    status.hidden=true;status.setAttribute("role","status");
    controls.append(play,track,time);bubble.append(controls,label,status,audio);
    let available=false;
    function sync(){
      const duration=audio.duration,valid=Number.isFinite(duration)&&duration>0,now=audio.currentTime||0;
      seek.value=String(valid?now:0);
      track.style.setProperty("--voice-progress",(valid?Math.min(1,now/duration)*100:0)+"%");
      const playing=!audio.paused&&!audio.ended;
      play.innerHTML=playing?pauseIcon:playIcon;
      play.setAttribute("aria-label",(playing?"Pause":"Play")+" voice message from "+person.name);
      time.textContent=playing||(!audio.ended&&now>0)?durationText(now)+" / "+durationText(duration):durationText(duration);
      bubble.classList.toggle("is-playing",playing);
    }
    audio.addEventListener("loadedmetadata",()=>{
      available=Number.isFinite(audio.duration)&&audio.duration>0;
      if(available){seek.max=String(audio.duration);play.disabled=false;seek.disabled=false;sync()}
      onAvailability(available);
    });
    audio.addEventListener("error",()=>{available=false;play.disabled=true;seek.disabled=true;releasePartyVoice(audio);onAvailability(false)});
    audio.addEventListener("play",()=>{
      if(!audio.isConnected||overlay.hidden){audio.pause();return}
      startPartyVoice(audio);sync();
    });
    audio.addEventListener("pause",()=>{releasePartyVoice(audio);sync()});
    audio.addEventListener("ended",()=>{releasePartyVoice(audio);sync()});
    audio.addEventListener("timeupdate",sync);audio.addEventListener("seeking",sync);
    play.addEventListener("click",()=>{
      if(!available)return;
      if(!audio.paused){audio.pause();return}
      if(audio.ended)audio.currentTime=0;
      stopPartyVoice();status.hidden=true;
      const failed=()=>{releasePartyVoice(audio);status.textContent="Playback unavailable. Try again.";status.hidden=false;sync()};
      try{const pending=audio.play();pending?.catch(failed)}catch{failed()}
    });
    seek.addEventListener("input",()=>{if(available){audio.currentTime=Number(seek.value);sync()}});
    const url=new URL("../"+recording.file,document.baseURI);
    if(partyVersion)url.searchParams.set("v",partyVersion);
    return {bubble,load:()=>{audio.src=url.href}};
  }
  new MutationObserver(()=>{if(overlay.hidden||!content.querySelector(".mb-group-log"))stopPartyVoice()}).observe(overlay,{attributes:true,attributeFilter:["hidden"]});
  new MutationObserver(()=>{if(playingPartyAudio&&!playingPartyAudio.isConnected)stopPartyVoice()}).observe(content,{childList:true});
  document.addEventListener("visibilitychange",()=>{if(document.hidden)stopPartyVoice()});
  document.addEventListener("mythbound:class-voice-start",stopPartyVoice);
  window.addEventListener("pagehide",stopPartyVoice);
  function openGroup(){
    if(window.MythboundAccount?.isSignedIn()===false)return;
    const player=nickname();
    const head=heading("The Usual Suspects","4 members · "+player+", Fighter, Chaotic Buddy, Responsible Buddy");
    head.prepend(groupAvatar(true));
    const log=make("div","mb-group-log");log.setAttribute("role","log");
    const savedAvatar=$("rail-player-avatar")?.querySelector("img")?.getAttribute("src");
    const playerPerson={name:player,file:savedAvatar?.startsWith("../")?savedAvatar.slice(3):undefined,glyph:"✧"};
    const ready=new Set(),voiceRows=new Map(),voiceLoads=[];
    let windJoke=null;
    function updateVoiceRows(){
      const atBottom=log.scrollHeight-log.scrollTop-log.clientHeight<48;
      const firstVisible=Array.from(log.children).find(el=>!el.hidden&&el.getBoundingClientRect().bottom>log.getBoundingClientRect().top);
      const offset=firstVisible?.getBoundingClientRect().top;
      for(const {row,recording} of voiceRows.values()){
        const visible=ready.has(recording.id)&&(!recording.requires||ready.has(recording.requires));
        if(!visible&&row.contains(playingPartyAudio))stopPartyVoice();
        row.hidden=!visible;
      }
      if(windJoke)windJoke.hidden=!ready.has("player-01");
      if(atBottom)log.scrollTop=log.scrollHeight;
      else if(firstVisible&&!firstVisible.hidden&&offset!==undefined)log.scrollTop+=firstVisible.getBoundingClientRect().top-offset;
    }
    function voice(recording){
      const p=recording.person==="player"?playerPerson:people[recording.person];
      const row=make("div","mb-chat-row mb-voice-row"+(recording.person==="player"?" mb-chat-own":"")),col=make("div","mb-chat-col"),meta=make("div","mb-chat-meta");
      row.hidden=true;if(recording.person!=="player"){row.dataset.contactId=recording.person;row.classList.toggle("mb-muted",isMuted(recording.person))}meta.append(make("strong","",p.name+(recording.person==="player"?" · You":"")),make("time","",recording.time));
      const control=createPartyVoice(recording,p,available=>{
        if(!row.isConnected)return;
        if(available)ready.add(recording.id);else ready.delete(recording.id);
        updateVoiceRows();
      });
      col.append(meta,control.bubble);row.append(recording.person==="player"?avatar(p):contactButton(recording.person),col);log.append(row);
      voiceRows.set(recording.id,{row,recording});voiceLoads.push(control.load);
    }
    const stamp=s=>log.append(make("p","mb-chat-date",s));
    function msg(id,time,value){
      const p=people[id],row=make("div","mb-chat-row"),col=make("div","mb-chat-col"),meta=make("div","mb-chat-meta");
      meta.append(make("strong","",p.name),make("time","",time));
      col.append(meta,make("div","mb-chat-bubble",value));row.dataset.contactId=id;row.classList.toggle("mb-muted",isMuted(id));row.append(contactButton(id),col);log.append(row);
    }
    stamp("39 DAYS AGO");
    msg("chaotic","20:43","get online. we need a fourth");
    msg("responsible","20:45","I have work at six tomorrow.");
    msg("fighter","20:45","Relax. One run.");
    msg("responsible","20:46","You said that three runs ago.");
    msg("chaotic","20:46","but "+player+" isn't even here yet");
    msg("responsible","20:47","Then go to bed.");
    for(const recording of partyRecordings)voice(recording);
    msg("chaotic","20:51","guys i think "+player+" just unlocked the Wind element");
    windJoke=log.lastElementChild;windJoke.hidden=true;
    stamp("YESTERDAY");
    msg("chaotic","22:11","raid tonight?? "+player+" hasn't logged in yet");
    msg("fighter","22:12","Let's just fill the slots. I'll ask later.");
    msg("chaotic","22:13","okay but if we wipe it's legally not my fault");
    msg("fighter","22:14","Use your tank form for once.");
    msg("chaotic","22:15","but this one looks better");
    msg("fighter","23:08","Finally. GG.");
    msg("chaotic","23:09","WAIT WHY DID YOU ROLL ON MY DROP");
    msg("fighter","23:09","Skill issue.");
    msg("chaotic","23:10","THE LOOT WAS MINE FIRST");
    const footer=make("div","mb-group-footer mb-group-composer"),controls=make("div","mb-composer-controls");
    const field=make("input","mb-group-reply");field.type="text";field.disabled=true;field.placeholder="Group replies unavailable";field.setAttribute("aria-label","Group replies unavailable");
    const record=make("button","mb-record-voice");record.type="button";record.disabled=true;record.innerHTML=microphoneIcon;record.setAttribute("aria-label","Record voice message — temporarily disabled");record.setAttribute("aria-describedby","mb-voice-policy");record.title="Voice recording temporarily disabled";
    const notice=make("p","mb-voice-policy","Notice: Voice message recording is temporarily disabled due to repeated misuse of the feature. Existing messages can still be played.");notice.id="mb-voice-policy";
    controls.append(field,record);footer.append(controls,notice);
    display([back(),head,log,footer],"MYTHBOUND · PARTY CHAT");markSeen("party");
    voiceLoads.forEach(load=>load());
    // Start with the latest messages; older ones remain accessible by scrolling.
    log.scrollTop=log.scrollHeight;
  }
  // Entry points for existing site controls; the original Fighter reply redirect stays intact.
  window.MythboundSocial={openInbox,openFriends,openFriend,markSeen,syncUnread,unreadCount,renderFighterMessages,resetReadState,attachFighterMenu(){const heading=content.querySelector(".whisper-heading");if(heading){heading.prepend(contactButton("fighter",true));heading.querySelector(".friend-avatar")?.remove()}},closeContactMenu};
  $("chaotic-friend")?.addEventListener("click",()=>openFriend("chaotic"));
  $("responsible-friend")?.addEventListener("click",()=>openFriend("responsible"));
  $("all-friends")?.addEventListener("click",openFriends);
  $("open-inbox")?.addEventListener("click",openInbox);
  for(const id of ["chaotic","responsible"]){
    const node=$(id+"-friend")?.querySelector(".mb-buddy-avatar");
    if(node){node.replaceChildren(avatar(people[id]));node.removeAttribute("aria-hidden")}
  }
  syncUnread();
  window.addEventListener("storage",e=>{if(e.storageArea===sessionStorage&&(e.key===readKey||e.key===null)){readIds=loadRead();syncUnread()}});
})();
