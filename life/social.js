(()=>{"use strict";
const $=id=>document.getElementById(id),panel=$("npc-social"),bubble=$("social-bubble"),controls=$("social-controls"),log=$("social-log");
const cast=["Fighter","Chaotic"],limit=6;
let place=null,session=null,activeSpeaker=null,skip=null;
function status(s){$("social-status").textContent=s}
function buttons(running){$("social-start").disabled=running;$("social-stop").disabled=!running;$("social-next").disabled=!running||!skip;$("social-topic").disabled=running;$("social-recall").disabled=running}
function hideBubble(){activeSpeaker=null;bubble.hidden=true}
function stop(message="Conversation stopped."){const s=session;session=null;if(s)s.ctrl.abort();if(skip)skip();skip=null;buttons(false);hideBubble();if(place)status(message)}
function detach(){stop();place=null;panel.hidden=true;log.replaceChildren()}
function attach(p){detach();place=p;panel.hidden=false;controls.hidden=false;$("social-toggle").textContent="−";$("social-toggle").setAttribute("aria-expanded","true");status("Ready — choose a topic or see what they talk about.");buttons(false)}
function append(speaker,text){const p=document.createElement("p"),name=document.createElement("strong");name.textContent=speaker+": ";p.append(name,document.createTextNode(text));log.append(p);log.scrollTop=log.scrollHeight}
function scripted(i,topic){
 const exchange=topic?["Alright, Chaotic. What do you reckon?","I have a brilliant plan. Step one: improvisation.","That's not a plan, you idiot.","See? We're already on step two."]:["Chaotic, one match. Try not to throw it this time.","I prefer the term experimental esports.","I swear, if you pull that stunt again...","Relax, champ. I've got at least three worse ideas."];
 return {dialogue:exchange[i]||"",emotion:"neutral",action:"none"};
}
function wait(ms,s){return new Promise(resolve=>{let timer;const finish=()=>{clearTimeout(timer);s.ctrl.signal.removeEventListener("abort",finish);if(skip===finish)skip=null;if(session===s)buttons(true);resolve()};skip=finish;timer=setTimeout(finish,ms);s.ctrl.signal.addEventListener("abort",finish,{once:true});buttons(true)})}
async function start(){
 if(session||!place||place.blocked()||document.hidden)return;
 const config={...window.LifeLab.npcConfig(),usePastMemory:$("social-recall").checked};
 if(config.mode==="ollama"&&!config.local){status("Live AI runs only at localhost:3000/life/. Select Preview in Character Laboratory to test here.");return}
 if(config.mode==="ollama"&&cast.some(name=>!(config.characters[name].model||config.model))){status("Select an installed model in Character Laboratory.");return}
 const p=place,s={ctrl:new AbortController(),history:[]};session=s;log.replaceChildren();buttons(true);
 const topic=$("social-topic").value.trim();
 if(topic){s.history.push({speaker:"Player",dialogue:topic});append("Player · public",topic)}
 const world={location:p.room,time:new Date().toTimeString().slice(0,5),present:["Fighter","Chaotic","Player"]};
 const agents=window.LifeAgents.create(config,world,localStorage,window.WorldMemory.player().id);
 if(topic)agents.hear("Player",topic);
 const label=config.mode==="ollama"?"Live AI":"Scripted preview · no LLM";
 let passes=0;const first=config.mode==="ollama"?Math.floor(Math.random()*cast.length):0;
 try{
 for(let i=0;i<(config.mode==="preview"?4:limit);i++){
  if(session!==s||place!==p||p.blocked()||document.hidden)return;
  const speaker=cast[(i+first)%cast.length];status(label+" — "+speaker+" is "+(config.mode==="ollama"?"thinking… ("+agents.get(speaker).model+")":"next…"));
  let result;
  try{result=config.mode==="ollama"?await window.LifeLab.npcTurn(config,speaker,agents,s.ctrl.signal):scripted(i,topic)}
  catch(e){if(e.code!=="REPEAT_DIALOGUE")throw e;result={dialogue:"",emotion:agents.get(speaker).mood,action:"none"};}
  if(session!==s||place!==p||s.ctrl.signal.aborted||p.blocked()||document.hidden)return;
  const dialogue=result.dialogue.trim();
  if(!dialogue){passes++;if(passes>=cast.length)break;status(label+" — "+speaker+" stays quiet; giving the other character a turn.");continue;}
  passes=0;
  if(config.mode==="ollama")agents.accept(speaker,result);agents.hear(speaker,dialogue);
  s.history.push({speaker,dialogue});append(speaker,dialogue);activeSpeaker=speaker;bubble.querySelector("strong").textContent=speaker;bubble.querySelector("span").textContent=dialogue;bubble.dataset.speaker=speaker;status(label+" — "+speaker+" is speaking");
  await wait(Math.min(9500,Math.max(2800,dialogue.length*53+900)),s);if(session!==s)return;hideBubble();
 }
 if(session===s){session=null;buttons(false);status(label+" — conversation finished.")}
 }catch(e){if(session===s)stop("Conversation failed: "+String(e.message||e).slice(0,160))}
 finally{if(session===s)stop("Conversation ended.")}
}
function project(B){
 if(!place||!activeSpeaker||place.blocked()||document.hidden){bubble.hidden=true;return}
 const {scene,camera,engine,canvas,npcs}=place,root=npcs[activeSpeaker];if(!root){bubble.hidden=true;return}
 const point=root.getAbsolutePosition().add(new B.Vector3(0,1.94,0)),width=engine.getRenderWidth(),height=engine.getRenderHeight(),v=B.Vector3.Project(point,B.Matrix.Identity(),scene.getTransformMatrix(),camera.viewport.toGlobal(width,height)),r=canvas.getBoundingClientRect();
 if(!Number.isFinite(v.x)||!Number.isFinite(v.y)||v.z<0||v.z>1||v.x<0||v.x>width||v.y<0||v.y>height){bubble.hidden=true;return}
 bubble.style.left=(r.left+v.x/width*r.width)+"px";bubble.style.top=(r.top+v.y/height*r.height)+"px";bubble.hidden=false;
}
function interrupt(){if(session)stop("Conversation stopped — start again when ready.");else hideBubble()}
$("social-start").onclick=start;$("social-stop").onclick=()=>stop();$("social-next").onclick=()=>skip?.();$("social-toggle").onclick=()=>{controls.hidden=!controls.hidden;$("social-toggle").textContent=controls.hidden?"+":"−";$("social-toggle").setAttribute("aria-expanded",String(!controls.hidden))};
document.addEventListener("visibilitychange",()=>{if(document.hidden)interrupt()});window.addEventListener("pagehide",interrupt);
window.LifeSocial=Object.freeze({attach,detach,interrupt,project});
})();