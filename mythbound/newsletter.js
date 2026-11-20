document.addEventListener("DOMContentLoaded",()=>{
 const form=document.getElementById("newsletter-form"),check=document.getElementById("newsletter-consent"),submit=document.getElementById("newsletter-submit"),status=document.getElementById("newsletter-status");
 const key="mythbound-chronicle-subscription-v1";let subscribed=false;
 try{subscribed=localStorage.getItem(key)==="true"}catch{}
 function render(){check.checked=subscribed;check.disabled=subscribed;submit.textContent=subscribed?"Unsubscribe":"Subscribe now";status.textContent=subscribed?"✧ You are subscribed to the Mythbound Chronicle!":""}
 form.addEventListener("submit",event=>{event.preventDefault();if(!subscribed&&!check.checked)return;subscribed=!subscribed;try{localStorage.setItem(key,String(subscribed))}catch{}render();if(!subscribed)status.textContent="You have unsubscribed."});
 render();
});
