(function(){
 const header=document.querySelector(".site-header"),toggle=document.getElementById("mobile-menu-toggle"),nav=document.getElementById("primary-navigation");
 const mobile=window.matchMedia("(max-width:760px)");
 const isOpen=()=>toggle.getAttribute("aria-expanded")==="true";
 function setOpen(open,focus=false){
  open=open&&mobile.matches;
  header.classList.toggle("mobile-nav-open",open);
  toggle.setAttribute("aria-expanded",String(open));
  updateMenuLabel();
  if(focus)toggle.focus({preventScroll:true});
 }
 toggle.addEventListener("click",()=>setOpen(!isOpen()));
 nav.querySelectorAll("[data-page]").forEach(b=>b.addEventListener("click",()=>{if(mobile.matches)setOpen(false,true)}));
 document.addEventListener("click",e=>{if(isOpen()&&!header.contains(e.target))setOpen(false)});
 document.addEventListener("keydown",e=>{if(e.key==="Escape"&&isOpen()){setOpen(false,true);e.preventDefault()}});
 if(mobile.addEventListener)mobile.addEventListener("change",()=>setOpen(false));else mobile.addListener(()=>setOpen(false));
 document.getElementById("mobile-inbox").addEventListener("click",()=>{setOpen(false,true);window.MythboundSocial?.openInbox()});
 document.getElementById("mobile-friends").addEventListener("click",()=>{setOpen(false,true);window.MythboundSocial?.openFriends()});
 document.getElementById("mobile-logout").addEventListener("click",()=>{setOpen(false,true);header.querySelector(".mb-session-action")?.click()});
 document.getElementById("mobile-download").addEventListener("click",()=>document.getElementById("download-button").click());
 function updateMenuLabel(){
  const n=window.MythboundSocial?.unreadCount()||0;
  toggle.setAttribute("aria-label",(isOpen()?"Close navigation menu":"Open navigation menu")+(n&&window.MythboundAccount?.isSignedIn()?", "+n+" unread message"+(n===1?"":"s"):""));
 }
 document.addEventListener("mythbound:unread",updateMenuLabel);
 document.getElementById("mobile-refresh").addEventListener("click",()=>{setOpen(false);document.getElementById("mb-refresh").click()});
 new MutationObserver(()=>{if(document.body.classList.contains("mythbound-login-open"))setOpen(false)}).observe(document.body,{attributes:true,attributeFilter:["class"]});
})();
