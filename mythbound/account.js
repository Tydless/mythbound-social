/* Returning-player roleplay login. No authentication or real passwords. */
(() => {
  "use strict";
  const choices = [
    {id:"breaker",label:"Breaker",file:"ProfileBreaker.png",icon:"✊"},
    {id:"animar",label:"Animar",file:"ProfileAnimar.png",icon:"◈"},
    {id:"herder",label:"Herder",file:"ProfileHerder.png",icon:"❃"},
    {id:"elemis",label:"Elemis",file:"ProfileElemis.png",icon:"✳"},
    {id:"strider",label:"Strider",file:"ProfileStrider.png",icon:"⚔"},
    {id:"saint-male",label:"Saint",file:"ProfileSaint.png",icon:"✥"}
  ];
  // Exclusive portrait, never a player-selectable avatar.
  const fighterAvatar={id:"saint-female",label:"Saint · Female",file:"ProfileSaintFemale.png",icon:"✥"};
  const byId = id => document.getElementById(id);
  const screen=byId("mythbound-login"), form=byId("returning-player-form"), name=byId("player-nickname"),
    password=byId("fictional-password"), grid=byId("avatar-choices"), submit=byId("player-login-button"),
    title=byId("login-title"), sub=byId("login-subtitle"), cancel=byId("profile-cancel"),
    logout=byId("profile-logout"), selectedLabel=byId("selected-avatar-label"), account=byId("account-button");
  if(!screen||!form||!name||!password||!grid||!submit||!account)return;
  const PROFILE_KEY="mythbound-local-profile-v1", SESSION_KEY="mythbound-roleplay-session-v1";
  let profile=null, signedIn=false, guest=false, editing=false, selected="";
  function getAvatar(id){return choices.find(c=>c.id===id)}
  try{
    const data=JSON.parse(localStorage.getItem(PROFILE_KEY)||"null");
    if(data&&typeof data.nickname==="string"&&data.nickname.trim())
      profile={nickname:data.nickname.trim().slice(0,24),avatar:getAvatar(data.avatar)?data.avatar:""};
  }catch{}
  try{const session=sessionStorage.getItem(SESSION_KEY);signedIn=!!getAvatar(profile?.avatar)&&session==="1";guest=session==="0"}catch{}
  window.MythboundAccount={isSignedIn:()=>signedIn};
  const headerLogout=document.createElement("button");headerLogout.type="button";headerLogout.className="mb-session-action";headerLogout.textContent="Log out";headerLogout.hidden=true;account.after(headerLogout);
  // Every portrait includes its original decorative frame. No extra crop or frame.
  function portrait(avatar){
    const wrap=document.createElement("span");wrap.className="mb-avatar-art";
    const glyph=document.createElement("span");glyph.className="mb-avatar-fallback";glyph.textContent=avatar.icon;glyph.setAttribute("aria-hidden","true");
    const img=document.createElement("img");img.alt="";img.decoding="async";img.draggable=false;
    img.addEventListener("load",()=>wrap.classList.add("is-loaded"),{once:true});
    img.addEventListener("error",()=>{img.hidden=true},{once:true});
    wrap.append(glyph,img);img.src="../"+avatar.file;
    return wrap;
  }
  function applyIdentity(){
    if(!profile)return;
    const avatar=getAvatar(profile.avatar);
    const sigil=account.querySelector(".account-sigil"),label=account.querySelector(".account-label");
    if(sigil){sigil.hidden=false;sigil.classList.add("mb-account-portrait");sigil.replaceChildren(portrait(avatar));sigil.dataset.presence="online";sigil.title="Online"}
    if(label){
      
      const nickname=document.createElement("span");nickname.className="mb-account-name";nickname.textContent=profile.nickname;
      label.replaceChildren(nickname);
    }
    account.setAttribute("aria-label","Open profile for "+profile.nickname+" (online)");
    if(byId("own-profile-name"))byId("own-profile-name").textContent=profile.nickname;
    byId("own-profile-avatar")?.replaceChildren(portrait(avatar));
    if(byId("own-profile-portrait-label"))byId("own-profile-portrait-label").textContent=avatar.label;
    const rail=byId("rail-player-name"), railAvatar=byId("rail-player-avatar");
    if(rail)rail.textContent=profile.nickname;
    if(railAvatar)railAvatar.replaceChildren(portrait(avatar));
  }
  function renderSession(){
    document.body.classList.toggle("mythbound-guest",!signedIn);
    for(const node of [byId("header-friends"),byId("header-whisper"),byId("floating-whisper")]){
      if(node)node.hidden=!signedIn;
    }
    headerLogout.hidden=!signedIn;
    account.classList.toggle("mb-guest-login",!signedIn);
    if(signedIn){applyIdentity();window.MythboundSocial?.syncUnread();return}
    const sigil=account.querySelector(".account-sigil"),label=account.querySelector(".account-label");
    if(sigil){sigil.hidden=true;sigil.replaceChildren();delete sigil.dataset.presence;sigil.removeAttribute("title")}
    if(label)label.textContent="Log in";
    account.setAttribute("aria-label","Log in to Mythbound");
    const rail=byId("rail-player-name"),railAvatar=byId("rail-player-avatar");
    if(rail)rail.textContent="Traveler";
    if(railAvatar)railAvatar.replaceChildren();
  }
  function signOut(){
    signedIn=false;guest=true;editing=false;
    try{sessionStorage.setItem(SESSION_KEY,"0")}catch{}
    const panel=byId("overlay");if(panel)panel.hidden=true;
    byId("sheet-content")?.replaceChildren();
    document.body.classList.remove("sheet-open");
    renderSession();hide();if(location.hash==="#profile"&&typeof navigate==="function")navigate("home",true);account.focus({preventScroll:true});
  }
  function choose(id){
    if(!getAvatar(id))return;
    selected=id;
    grid.querySelectorAll("button").forEach(b=>{
      const active=b.dataset.avatar===selected;b.setAttribute("aria-pressed",String(active));b.classList.toggle("is-selected",active);
    });
    sync();
  }
  choices.forEach(avatar=>{
    const button=document.createElement("button");button.type="button";button.className="mb-avatar-option";button.dataset.avatar=avatar.id;
    button.setAttribute("aria-pressed","false");button.setAttribute("aria-label","Choose "+avatar.label+" profile picture");
    const label=document.createElement("span");label.className="mb-avatar-label";label.textContent=avatar.label;
    button.append(portrait(avatar),label);button.addEventListener("click",()=>choose(avatar.id));grid.append(button);
  });
  function sync(){
    const hasName=!!name.value.trim();
    password.textContent=hasName?"••••••••••":"";
    password.classList.toggle("is-filled",hasName);
    password.setAttribute("aria-label",hasName?"Simulated saved password, no real password is used":"Simulated password appears after entering a nickname");
    selectedLabel.textContent=getAvatar(selected)?.label||"Choose one";
    submit.disabled=!hasName||!getAvatar(selected);
  }
  function show(isEdit=false){
    editing=isEdit;
    title.textContent=isEdit?"Edit profile":"Welcome back!";
    sub.textContent=isEdit?"Give your profile a fresh look.":"We added a new feature: Choose your avatar-based profile picture!";
    submit.textContent=isEdit?"Save changes":"Log In";
    cancel.hidden=!(isEdit||guest);logout.hidden=!isEdit;
    name.value=profile?.nickname||"";
    selected=profile?.avatar||"";
    grid.querySelectorAll("button").forEach(b=>{
      const active=b.dataset.avatar===selected;b.classList.toggle("is-selected",active);b.setAttribute("aria-pressed",String(active));
    });
    screen.hidden=false;
    document.body.classList.add("mythbound-login-open");
    window.scrollTo(0,0);
    sync();
    // Avoid opening the mobile keyboard automatically on first visit.
    if(isEdit)name.focus({preventScroll:true});
  }
  function hide(){
    screen.hidden=true;document.body.classList.remove("mythbound-login-open");
  }
  name.addEventListener("input",sync);
  form.addEventListener("submit",e=>{
    e.preventDefault();
    const nickname=name.value.trim(),avatar=getAvatar(selected);
    if(!nickname||!avatar)return;
    const returningFromGuest=guest;
    const newPlaythrough=!signedIn&&!editing;
    profile={nickname:nickname.slice(0,24),avatar:avatar.id};signedIn=true;guest=false;
    try{localStorage.setItem(PROFILE_KEY,JSON.stringify(profile));sessionStorage.setItem(SESSION_KEY,"1")}catch{}
    if(newPlaythrough)window.MythboundSocial?.resetReadState();
    renderSession();hide();
    if(!editing&&!returningFromGuest&&typeof navigate==="function")navigate("home",true);
    (editing&&location.hash==="#profile"?byId("own-edit-profile"):account)?.focus({preventScroll:true});
  });
  account.addEventListener("click",()=>{if(signedIn)navigate("profile");else show(false)});
  byId("own-edit-profile")?.addEventListener("click",()=>{if(signedIn)show(true)});
  byId("own-profile-friends")?.addEventListener("click",()=>window.MythboundSocial?.openFriends());
  byId("own-profile-inbox")?.addEventListener("click",()=>window.MythboundSocial?.openInbox());
  cancel.addEventListener("click",()=>{hide();(editing&&location.hash==="#profile"?byId("own-edit-profile"):account)?.focus({preventScroll:true})});
  logout.addEventListener("click",signOut);
  headerLogout.addEventListener("click",signOut);
  renderSession();
  if(!signedIn&&location.hash==="#profile")navigate("home",true);
  if(signedIn||guest)hide();else show(false);

  // Fighter plays the female Saint. Keep this independent from the visitor's choice.
  function decorateFighter(){
    document.querySelectorAll("#fighter-friend .saint-avatar,#rail-whisper .saint-avatar,#sheet-content .saint-avatar,#sheet-content .profile-avatar").forEach(node=>{
      if(node.classList.contains("mb-fighter-portrait"))return;
      node.classList.add("mb-fighter-portrait");node.replaceChildren(portrait(fighterAvatar));
    });
  }
  decorateFighter();
  const sheet=byId("sheet-content");
  if(sheet)new MutationObserver(decorateFighter).observe(sheet,{childList:true,subtree:true});
})();
