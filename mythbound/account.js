/* Returning-player roleplay login. No authentication or real passwords. */
(() => {
  "use strict";
  const choices = [
    {id:"breaker",label:"Breaker",file:"ProfileBreaker.png",icon:"✊"},
    {id:"animar",label:"Animar",file:"ProfileAnimar.png",icon:"◈"},
    {id:"herder",label:"Herder",file:"ProfileHerder.png",icon:"❃"},
    {id:"elemis",label:"Elemis",file:"ProfileElemis.png",icon:"✳"},
    {id:"strider",label:"Strider",file:"ProfileStrider.png",icon:"⚔"},
    {id:"saint-male",label:"Saint · Male",file:"ProfileSaint.png",icon:"✥"},
    {id:"saint-female",label:"Saint · Female",file:"ProfileSaintFemale.png",icon:"✥"}
  ];
  const byId = id => document.getElementById(id);
  const screen=byId("mythbound-login"), form=byId("returning-player-form"), name=byId("player-nickname"),
    password=byId("fictional-password"), grid=byId("avatar-choices"), submit=byId("player-login-button"),
    title=byId("login-title"), sub=byId("login-subtitle"), cancel=byId("profile-cancel"),
    logout=byId("profile-logout"), selectedLabel=byId("selected-avatar-label"), account=byId("account-button");
  if(!screen||!form||!name||!password||!grid||!submit||!account)return;
  const PROFILE_KEY="mythbound-local-profile-v1", SESSION_KEY="mythbound-roleplay-session-v1";
  let profile=null, signedIn=false, editing=false, selected="";
  function getAvatar(id){return choices.find(c=>c.id===id)}
  try{
    const data=JSON.parse(localStorage.getItem(PROFILE_KEY)||"null");
    if(data&&typeof data.nickname==="string"&&data.nickname.trim()&&getAvatar(data.avatar))
      profile={nickname:data.nickname.trim().slice(0,24),avatar:data.avatar};
  }catch{}
  try{signedIn=!!profile&&sessionStorage.getItem(SESSION_KEY)==="1"}catch{}
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
    if(sigil){sigil.classList.add("mb-account-portrait");sigil.replaceChildren(portrait(avatar))}
    if(label){
      const online=document.createElement("small");online.textContent="Online";
      const nickname=document.createElement("span");nickname.className="mb-account-name";nickname.textContent=profile.nickname;
      label.replaceChildren(nickname,online);
    }
    account.setAttribute("aria-label","Edit profile for "+profile.nickname);
    const rail=byId("rail-player-name"), railAvatar=byId("rail-player-avatar");
    if(rail)rail.textContent=profile.nickname;
    if(railAvatar)railAvatar.replaceChildren(portrait(avatar));
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
    title.textContent=isEdit?"Your profile":"Welcome back!";
    sub.textContent=isEdit?"Give your profile a fresh look.":"We added a new feature: Choose your avatar-based profile picture!";
    submit.textContent=isEdit?"Save changes":"Log In";
    cancel.hidden=!isEdit;logout.hidden=!isEdit;
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
    profile={nickname:nickname.slice(0,24),avatar:avatar.id};signedIn=true;
    try{localStorage.setItem(PROFILE_KEY,JSON.stringify(profile));sessionStorage.setItem(SESSION_KEY,"1")}catch{}
    applyIdentity();hide();
    if(!editing&&typeof navigate==="function")navigate("home",true);
    account.focus({preventScroll:true});
  });
  account.addEventListener("click",()=>show(true));
  cancel.addEventListener("click",()=>{hide();account.focus({preventScroll:true})});
  logout.addEventListener("click",()=>{
    signedIn=false;try{sessionStorage.removeItem(SESSION_KEY)}catch{}
    show(false);
  });
  if(signedIn){applyIdentity();hide()}else show(false);

  // Fighter plays the female Saint. Keep this independent from the visitor's choice.
  function decorateFighter(){
    document.querySelectorAll("#fighter-friend .saint-avatar,#rail-whisper .saint-avatar,#sheet-content .saint-avatar,#sheet-content .profile-avatar").forEach(node=>{
      if(node.classList.contains("mb-fighter-portrait"))return;
      node.classList.add("mb-fighter-portrait");node.replaceChildren(portrait(getAvatar("saint-female")));
    });
  }
  decorateFighter();
  const sheet=byId("sheet-content");
  if(sheet)new MutationObserver(decorateFighter).observe(sheet,{childList:true,subtree:true});
})();
