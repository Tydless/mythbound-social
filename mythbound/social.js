/* Mythbound fictional social history — local read state; no real messages sent. */
(() => {
  "use strict";
  const $=id=>document.getElementById(id);
  const content=$("sheet-content");
  const readKey="mythbound-fighter-whisper-seen-v1";
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
  let seen=false;
  try{seen=localStorage.getItem(readKey)==="true"}catch{}
  const make=(tag,cls,value)=>{
    const el=document.createElement(tag);if(cls)el.className=cls;if(value!==undefined)el.textContent=value;return el;
  };
  function nickname(){return $("rail-player-name")?.textContent.trim()||"Traveler"}
  function avatar(person,large=false){
    const wrap=make("span","mb-social-avatar"+(large?" is-large":""));wrap.setAttribute("aria-hidden","true");
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
  function markSeen(){
    seen=true;try{localStorage.setItem(readKey,"true")}catch{}syncUnread();
  }
  function syncUnread(){
    const badge=$("header-whisper")?.querySelector(".notification-count");
    if(badge){badge.hidden=seen;badge.textContent="1"}
    const dot=$("rail-whisper")?.querySelector(".unread-dot");if(dot)dot.hidden=seen;
    const mini=document.querySelector(".whispers-panel .mini-count");if(mini)mini.textContent=seen?"":"1 new";
    const float=$("floating-whisper");if(float){
      float.querySelector("span:last-child").textContent=seen?"Inbox":"1 new whisper";
      float.setAttribute("aria-label",seen?"Open inbox":"Open inbox, one unread whisper");
    }
    $("header-whisper")?.setAttribute("aria-label",seen?"Open inbox":"Open inbox, one unread whisper");
  }
  function heading(title,sub){
    const head=make("div","mb-social-heading");
    const text=make("div");const h=make("h2","",title);h.id="sheet-title";text.append(h,make("p","",sub));head.append(text);return head;
  }
  function back(label="Back to inbox",action=openInbox){
    const b=make("button","mb-social-back","‹ "+label);b.type="button";b.addEventListener("click",action);return b;
  }
  function display(nodes,kicker){
    if(overlay.hidden)previousFocus=document.activeElement;
    content.replaceChildren(...nodes);
    $("sheet-kicker").textContent=kicker;
    overlay.hidden=false;document.body.classList.add("sheet-open");$("sheet-close").focus();
  }
  function friendRow(id){
    const p=people[id],button=make("button","mb-inbox-row mb-social-friend");button.type="button";
    const words=make("span","mb-inbox-words");words.append(make("strong","",p.name),make("small","",p.info),make("small",p.online?"online-label":"mb-offline",p.online?"● Online":p.status));
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
    if(options.unread)row.append(make("span","unread-dot"));
    if(options.locked)row.title="Archived conversation · preview only";
    return row;
  }
  function openInbox(){
    const head=heading("Inbox","Whispers & party conversations");
    const tabs=make("div","mb-inbox-tabs");
    const chat=make("button","is-active","Messages");chat.type="button";chat.setAttribute("aria-pressed","true");
    const friends=make("button","","Friends · 3");friends.type="button";friends.setAttribute("aria-pressed","false");friends.addEventListener("click",openFriends);
    tabs.append(chat,friends);
    const list=make("div","mb-inbox-list");
    list.append(make("div","mb-inbox-label","PINNED · PARTY CHAT"));
    list.append(inboxRow({name:"The Usual Suspects",preview:"Chaotic Buddy: THE LOOT WAS MINE FIRST",date:"Yesterday"},{pinned:true,onClick:openGroup}));
    list.append(make("div","mb-inbox-label","WHISPERS"));
    list.append(inboxRow({...people.fighter,preview:"Yo, I've got time. You in for a raid?",date:seen?"Today":"Just now"},{unread:!seen,onClick:openWhisper}));
    oldChats.forEach(p=>list.append(inboxRow(p,{locked:true})));
    list.append(make("p","mb-social-note","Older conversation previews are archived."));
    display([head,tabs,list],"MYTHBOUND · SOCIAL");
  }
  function openFriends(){
    const head=heading("Friends","2 online · 3 friends");
    const tabs=make("div","mb-inbox-tabs");
    const chat=make("button","","Messages");chat.type="button";chat.setAttribute("aria-pressed","false");chat.addEventListener("click",openInbox);
    const friends=make("button","is-active","Friends · 3");friends.type="button";friends.setAttribute("aria-pressed","true");
    tabs.append(chat,friends);
    const list=make("div","mb-inbox-list");
    for(const id of ["fighter","chaotic","responsible"])list.append(friendRow(id));
    display([head,tabs,list],"MYTHBOUND · SOCIAL");
  }
  function openFriend(id){
    if(id==="fighter"){openProfile();return}
    const p=people[id];if(!p)return;
    const head=heading(p.name,p.info+" · "+p.status);head.prepend(avatar(p,true));
    const body=make("div","mb-buddy-profile");
    body.append(make("p","profile-quote",id==="responsible"?"I was forced to do this.":"If it has a health bar, I can fight it."));
    if(id==="chaotic"){
      body.append(make("h3","","About my character"),make("p","","Animar main. Professional loot enjoyer. The party's best source of questionable decisions."));
    }
    body.append(make("p","mb-social-note","2 mutual friends"));
    display([back("Back to friends",openFriends),head,body],"MYTHBOUND · PLAYER PROFILE");
  }
  function openGroup(){
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
    display([back(),head,log,footer],"MYTHBOUND · PARTY CHAT");
    // Start with the latest messages; older ones remain accessible by scrolling.
    log.scrollTop=log.scrollHeight;
  }
  // Entry points for existing site controls; the original Fighter reply redirect stays intact.
  window.MythboundSocial={openInbox,openFriends,openFriend,markSeen,syncUnread};
  $("chaotic-friend")?.addEventListener("click",()=>openFriend("chaotic"));
  $("responsible-friend")?.addEventListener("click",()=>openFriend("responsible"));
  $("all-friends")?.addEventListener("click",openFriends);
  $("open-inbox")?.addEventListener("click",openInbox);
  for(const id of ["chaotic","responsible"]){
    const node=$(id+"-friend")?.querySelector(".mb-buddy-avatar");
    if(node)node.replaceChildren(avatar(people[id]));
  }
  syncUnread();
  window.addEventListener("storage",e=>{if(e.key===readKey){seen=e.newValue==="true";syncUnread()}});
})();
