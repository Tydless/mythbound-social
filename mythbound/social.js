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
  function unreadCount(thread){return incoming.filter(m=>(!thread||m.thread===thread)&&!readIds.has(m.id)).length}
  const unreadLabel=n=>n+" unread message"+(n===1?"":"s");
  const people={
    fighter:{name:"Fighter",file:"ProfileSaintFemale.png",glyph:"✥",info:"Saint · Lv. 84",status:"Online",online:true,level:84,className:"Saint",banner:"../BannerSaint.png",accent:"#e8c895",availability:"Inbox Open",quote:"I have enough heals. You, apparently, don't have enough brain cells.",about:"Perfect dye combinations. Beautiful armor. Good healing rotations. I know what I'm doing, so please stop running into the boss.",playstyle:"Raid support",favorite:"Outfit collecting"},
    chaotic:{name:"Chaotic Buddy",file:"ProfileAnimar.png",glyph:"◈",info:"Animar · Lv. 118",status:"Online",online:true,level:118,className:"Animar",accent:"#90d2d0",availability:"Only in-game",quote:"If it has a health bar, I can fight it.",about:"Animar main. Professional loot enjoyer. The party's best source of questionable decisions."},
    responsible:{name:"Responsible Buddy",glyph:"",info:"Lv. 12",status:"Last online 39 days ago",online:false,level:12,accent:"#b3bfd0",availability:"Don’t disturb",quote:"I was forced to do this."}
  };
  const oldChats=[
    {name:"MoonMoth",file:"ProfileElemis.png",preview:"You're good, honestly. We should run that again...",date:"2 days ago"},
    {name:"WoollyWanderer",file:"ProfileHerder.png",preview:"Thanks for helping with the quest!",date:"4 days ago"},
    {name:"CritHappens",file:"ProfileBreaker.png",preview:"gg! sorry about that last pull lol",date:"6 days ago"},
    {name:"LunarBlade",file:"ProfileStrider.png",preview:"Do you still have that spare material?",date:"1 week ago"},
    {name:"Rook_07",preview:"Hey, are you in a guild yet?",date:"2 weeks ago"}
  ];
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
  function markSeen(thread="fighter"){
    if(window.MythboundAccount?.isSignedIn()===false)return;
    for(const id of loadRead())readIds.add(id);
    for(const m of incoming)if(m.thread===thread)readIds.add(m.id);
    try{sessionStorage.setItem(readKey,JSON.stringify([...readIds]))}catch{}
    syncUnread();
  }
  function resetReadState(){
    readIds.clear();
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
      row.setAttribute("aria-label",(row.querySelector(".mb-inbox-top strong")?.textContent||"Conversation")+(count?", "+unreadLabel(count):", read"));
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
    content.replaceChildren(...nodes);
    $("sheet-kicker").textContent=kicker;
    overlay.hidden=false;document.body.classList.add("sheet-open");content.closest(".sheet").scrollTop=0;$("sheet-close").focus({preventScroll:true});
  }
  function friendRow(id){
    const p=people[id],button=make("button","mb-inbox-row mb-social-friend");button.type="button";
    const words=make("span","mb-inbox-words");words.append(make("strong","",p.name),make("small","",p.info));if(!p.online)words.append(make("small","mb-offline",p.status));
    button.append(avatar(p),words,make("span","mb-row-chevron","›"));
    button.addEventListener("click",()=>openFriend(id));return button;
  }
  function groupAvatar(){
    const g=make("span","mb-group-avatar");g.setAttribute("aria-hidden","true");
    g.append(avatar(people.fighter),avatar(people.chaotic),avatar(people.responsible));return g;
  }
  function inboxRow(p,options={}){
    const row=make(options.locked?"div":"button","mb-inbox-row"+(options.pinned?" mb-pinned":"")+(options.locked?" mb-archived":""));
    if(!options.locked){row.type="button";row.addEventListener("click",options.onClick)}
    else row.setAttribute("aria-label",p.name+", archived conversation preview, "+p.preview);
    const words=make("span","mb-inbox-words"),top=make("span","mb-inbox-top");
    top.append(make("strong","",p.name),make("small","mb-inbox-date",p.date));
    words.append(top,make("small","mb-message-preview",p.preview));
    row.append(options.pinned?groupAvatar():avatar(p),words);
    if(options.thread){row.dataset.mbInboxThread=options.thread;const n=unreadCount(options.thread),b=make("span","mb-unread-badge mb-thread-count");row.classList.toggle("mb-is-unread",n>0);badge(b,n);row.append(b)}
    if(options.locked)row.title="Archived conversation · preview only";
    return row;
  }
  function openInbox(){
    if(window.MythboundAccount?.isSignedIn()===false)return;
    const head=heading("Inbox","Whispers & party conversations");head.querySelector("p").id="mb-inbox-unread-summary";
    const tabs=make("div","mb-inbox-tabs");
    const chat=make("button","is-active","Messages");chat.type="button";chat.setAttribute("aria-pressed","true");chat.append(make("span","mb-unread-badge mb-inbox-tab-count"));
    const friends=make("button","","Friends · 3");friends.type="button";friends.setAttribute("aria-pressed","false");friends.addEventListener("click",openFriends);
    tabs.append(chat,friends);
    const list=make("div","mb-inbox-list");
    list.append(make("div","mb-inbox-label","PINNED · PARTY CHAT"));
    list.append(inboxRow({name:"The Usual Suspects",preview:"Chaotic Buddy: THE LOOT WAS MINE FIRST",date:"Yesterday"},{pinned:true,thread:"party",onClick:openGroup}));
    list.append(make("div","mb-inbox-label","WHISPERS"));
    const latest=incoming.filter(m=>m.thread==="fighter").slice(-1)[0];list.append(inboxRow({...people.fighter,preview:latest?.text||"",date:unreadCount("fighter")?"Just now":"Today"},{thread:"fighter",onClick:openWhisper}));
    oldChats.forEach(p=>list.append(inboxRow(p,{locked:true})));
    list.append(make("p","mb-social-note","Older conversation previews are archived."));
    display([head,tabs,list],"MYTHBOUND · SOCIAL");syncUnread();
  }
  function openFriends(){
    if(window.MythboundAccount?.isSignedIn()===false)return;
    const head=heading("Friends","2 online · 3 friends");
    const tabs=make("div","mb-inbox-tabs");
    const chat=make("button","","Messages");chat.type="button";chat.setAttribute("aria-pressed","false");chat.append(make("span","mb-unread-badge mb-inbox-tab-count"));chat.addEventListener("click",openInbox);
    const friends=make("button","is-active","Friends · 3");friends.type="button";friends.setAttribute("aria-pressed","true");
    tabs.append(chat,friends);
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
    const identity=make("div","mb-profile-identity"),photo=avatar(p,true),name=make("div","mb-profile-name");
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
    if(p.about)bio.append(make("h3","","About my character"),make("p","",p.about));
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
    head.prepend(groupAvatar());
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
      row.hidden=true;meta.append(make("strong","",p.name+(recording.person==="player"?" · You":"")),make("time","",recording.time));
      const control=createPartyVoice(recording,p,available=>{
        if(!row.isConnected)return;
        if(available)ready.add(recording.id);else ready.delete(recording.id);
        updateVoiceRows();
      });
      col.append(meta,control.bubble);row.append(avatar(p),col);log.append(row);
      voiceRows.set(recording.id,{row,recording});voiceLoads.push(control.load);
    }
    const stamp=s=>log.append(make("p","mb-chat-date",s));
    function msg(id,time,value){
      const p=people[id],row=make("div","mb-chat-row"),col=make("div","mb-chat-col"),meta=make("div","mb-chat-meta");
      meta.append(make("strong","",p.name),make("time","",time));
      col.append(meta,make("div","mb-chat-bubble",value));row.append(avatar(p),col);log.append(row);
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
  window.MythboundSocial={openInbox,openFriends,openFriend,markSeen,syncUnread,unreadCount,renderFighterMessages,resetReadState};
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
