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
    fighter:{name:"Fighter",file:"ProfileSaintFemale.png",glyph:"✥",info:"Saint · Lv. 84",status:"Online",online:true},
    chaotic:{name:"Chaotic Buddy",file:"ProfileAnimar.png",glyph:"◈",info:"Animar · Lv. 118",status:"Online",online:true},
    responsible:{name:"Responsible Buddy",glyph:"",info:"Lv. 12",status:"Last online 39 days ago",online:false}
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
    overlay.hidden=false;document.body.classList.add("sheet-open");$("sheet-close").focus();
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
    if(id==="fighter"){openProfile();return}
    const p=people[id];if(!p)return;
    const head=heading(p.name,p.info+(p.online?"":" · "+p.status));head.prepend(avatar(p,true));
    const body=make("div","mb-buddy-profile");
    body.append(make("p","profile-quote",id==="responsible"?"I was forced to do this.":"If it has a health bar, I can fight it."));
    if(id==="chaotic"){
      body.append(make("h3","","About my character"),make("p","","Animar main. Professional loot enjoyer. The party's best source of questionable decisions."));
    }
    body.append(make("p","mb-social-note","2 mutual friends"));
    display([back("Back to friends",openFriends),head,body],"MYTHBOUND · PLAYER PROFILE");
  }
  function openGroup(){
    if(window.MythboundAccount?.isSignedIn()===false)return;
    const player=nickname();
    const head=heading("The Usual Suspects","4 members · "+player+", Fighter, Chaotic Buddy, Responsible Buddy");
    head.prepend(groupAvatar());
    const log=make("div","mb-group-log");log.setAttribute("role","log");
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
    const footer=make("div","mb-group-footer","Conversation history · Group replies are not available in this preview.");
    display([back(),head,log,footer],"MYTHBOUND · PARTY CHAT");markSeen("party");
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
