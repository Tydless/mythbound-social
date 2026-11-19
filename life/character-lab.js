(()=>{"use strict";
const $=id=>document.getElementById("lab-"+id),dialog=document.getElementById("character-lab");
const defaults={"personality":"Fighter is a former professional MMA fighter. A life-changing incident left his legs weaker. He is still bulky and strong, but his passion shifted toward gaming after discovering Mythbound Online. His main is the female Saint, his princess, who probably has more outfits than he does. He sometimes designs outfits for her himself. PRIVATE: he has a drawer of half-finished outfit sketches that he does not talk about. Do not volunteer that secret or assume anyone else knows it. He is hotheaded, loves challenges and cares about his buddies. He regularly playfights with Chaotic when Chaotic does something idiotic. The precise incident and further medical details are not established.","style":"Direct, casual, competitive, sometimes grumpy. Brief punchy reactions, dry teasing and friendly trash talk. Can get unexpectedly enthusiastic about his Saint or fashion, but do not force these interests into unrelated conversations. Do not speak or act for others.","memories":"","chaoticPersonality":"Chaotic is chaos incarnate. He talks first and probably never thinks. His regular sport is esports. His relationship status changes more often than his underwear. He is pretty and broke. He is Fighter's buddy and they often tease and playfight when he does something idiotic. His current partner and exact finances are unspecified.","chaoticStyle":"Impulsive, playful, irreverent, cheeky and unpredictable. React to what was actually said. Make ridiculous jokes or tease Fighter when appropriate, rather than repeating the same punchline. Do not constantly mention dating or money. Short natural English. Do not speak or act for others.","provider":"preview","model":"qwen3:4b","voiceProvider":"browser","voice":"marius","autospeak":false};
const key="afterhours-character-lab-v2",legacyKey="afterhours-character-lab-v1",fields={personality:"personality",style:"style",memories:"memories",chaoticPersonality:"chaotic-personality",chaoticStyle:"chaotic-style",provider:"provider",model:"model",voiceProvider:"voice-provider",voice:"voice"};
function restoreProfile(storage){
 const p={...defaults};let current=null,legacy=null;
 try{current=JSON.parse(storage.getItem(key)||"null");if(!current)legacy=JSON.parse(storage.getItem(legacyKey)||"null")}catch{}
 const saved=current||legacy;
 const allowed=current?Object.keys(defaults):["memories","provider","model","voiceProvider","voice","autospeak"];
 if(saved&&typeof saved==="object")for(const k of allowed)if(typeof saved[k]===typeof defaults[k])p[k]=saved[k];
 return p;
}
const voices=["marius","javert"],moods=["relaxed","excited","annoyed","tired","sad","amused","neutral"];
let history=[],busy=false,controller=null,speechController=null,objectURL=null,last=null,actualLocation="Your room",onClose=()=>{};
const local=location.hostname==="localhost"&&location.port==="3000"&&location.protocol==="http:";
const ollama="http://localhost:11434",pocket="http://localhost:8000";
function status(t){$("status").textContent=t}
function profile(){const p={};for(const [k,id] of Object.entries(fields))p[k]=$(id).value;p.autospeak=$("autospeak").checked;return p}
function load(){const p=restoreProfile(localStorage);for(const [k,id] of Object.entries(fields))$(id).value=p[k];$("autospeak").checked=p.autospeak;if(!["preview","ollama"].includes($("provider").value))$("provider").value="preview";if(!["browser","pocket","off"].includes($("voice-provider").value))$("voice-provider").value="browser";if(!voices.includes($("voice").value))$("voice").value="marius"}
function save(){try{localStorage.setItem(key,JSON.stringify(profile()));status("Character profile saved locally.");return true}catch{status("Local storage unavailable; export your profile instead.");return false}}
function context(){return {location:$("location").value,time:$("time").value,mood:$("mood").value,relationship:$("relationship").value,event:$("event").value}}
function line(role,t){const d=document.createElement("div");d.className="lab-line "+role;const who=document.createElement("strong");who.textContent=role==="player"?"PLAYER":role==="event"?"SIMULATED EVENT":role==="preview"?"FIGHTER · SCRIPTED PREVIEW":"FIGHTER · LIVE AI";const text=document.createElement("span");text.textContent=t;d.append(who,text);$("transcript").append(d);$("transcript").scrollTop=$("transcript").scrollHeight}
function voiceState(){const mode=$("voice-provider").value;$("voice").disabled=mode!=="pocket";$("voice-note").textContent=mode==="pocket"?"Marius and Javert are casting candidates; local Pocket TTS must be running.":mode==="browser"?"Temporary device voice, not a Pocket TTS voice. Availability varies by browser.":"Voice playback disabled."}
function stopVoice(){speechController?.abort();speechController=null;if("speechSynthesis" in window)window.speechSynthesis.cancel();const a=$("audio");a.pause();a.removeAttribute("src");a.hidden=true;if(objectURL){URL.revokeObjectURL(objectURL);objectURL=null}}
async function timedFetch(url,options={},timeout=10000){const c=options.controller||new AbortController();const timer=setTimeout(()=>c.abort(),timeout);try{return await fetch(url,{...options,controller:undefined,signal:c.signal})}finally{clearTimeout(timer)}}
function errorText(e){return e?.name==="AbortError"?"Request cancelled or timed out.":String(e?.message||e).slice(0,230)}
async function speak(t){const mode=$("voice-provider").value;stopVoice();if(!t.trim()||mode==="off")return;if(mode==="browser"){if(!("speechSynthesis" in window)){status("Browser speech is unavailable.");return}const u=new SpeechSynthesisUtterance(t);u.lang="en-US";const v=window.speechSynthesis.getVoices().find(v=>v.lang.startsWith("en")&&v.localService);if(v)u.voice=v;u.onerror=e=>{if(e.error!=="canceled"&&e.error!=="interrupted")status("Browser speech: "+e.error)};window.speechSynthesis.speak(u);status("Playing temporary browser voice.");return}
if(!local){status("Pocket TTS requires http://localhost:3000/life/ and a running local service. See README.");return}
const c=new AbortController();speechController=c;try{status("Generating Pocket TTS audio…");const data=new FormData();data.append("text",t.slice(0,1000));data.append("voice_url",voices.includes($("voice").value)?$("voice").value:"marius");const r=await timedFetch(pocket+"/tts",{method:"POST",body:data,controller:c},90000);if(!r.ok)throw Error("Pocket TTS HTTP "+r.status);const blob=await r.blob();if(c.signal.aborted||speechController!==c)return;objectURL=URL.createObjectURL(blob);const a=$("audio");a.src=objectURL;a.hidden=false;try{await a.play();status("Playing Pocket TTS voice.")}catch{status("Voice generated. Press play on the audio control.")}}catch(e){if(speechController===c)status("Pocket TTS: "+errorText(e))}finally{if(speechController===c)speechController=null}}
function normalize(v){if(!v||typeof v!=="object"||typeof v.dialogue!=="string")throw Error("The model did not return valid dialogue JSON.");return {dialogue:v.dialogue.slice(0,1000),emotion:moods.includes(v.emotion)?v.emotion:"neutral",action:typeof v.action==="string"?v.action.slice(0,200):"none"}}
// JSON mode alone permits arbitrary keys. Constrain the exact response contract.
const dialogueSchema={type:"object",properties:{dialogue:{type:"string"},emotion:{type:"string",enum:moods},action:{type:"string"}},required:["dialogue","emotion","action"],additionalProperties:false};
function decodeDialogue(data){
 const content=data?.message?.content;
 if(typeof content!=="string")throw Error("Missing message content");
 const raw=content.trim().replace(/^\x60\x60\x60(?:json)?\s*/i,"").replace(/\s*\x60\x60\x60$/,"");
 let parsed;try{parsed=JSON.parse(raw)}catch{throw Error(data.done_reason==="length"?"Response reached its token limit":"Incomplete or invalid JSON")}
 if(!parsed||Array.isArray(parsed)||typeof parsed.dialogue!=="string")throw Error("Missing dialogue field");
 return normalize(parsed);
}
function dialogueKey(text){return text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu," ").trim()}
async function requestDialogue(model,messages,ctrl,priorDialogue=[]){
 const used=new Set(priorDialogue.map(dialogueKey).filter(Boolean));
 let issue="";
 for(let attempt=0;attempt<2;attempt++){
  if(ctrl.signal.aborted)throw new DOMException("Cancelled","AbortError");
  const prompt=[{...messages[0],content:messages[0].content+"\nReturn exactly this JSON schema: "+JSON.stringify(dialogueSchema)+(attempt?"\nYour previous attempt was invalid or repeated an earlier line. Return one valid object with a new reaction, or leave dialogue empty if the exchange is over.":"")},...messages.slice(1)];
  const r=await timedFetch(ollama+"/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model,messages:prompt,stream:false,think:false,format:dialogueSchema,options:{num_predict:attempt?768:384,temperature:attempt?.35:.75,repeat_penalty:1.15}}),controller:ctrl},120000);
  if(!r.ok)throw Error("Ollama HTTP "+r.status+" — check that the selected model is installed.");
  const data=await r.json();
  if(ctrl.signal.aborted)throw new DOMException("Cancelled","AbortError");
  try{const v=decodeDialogue(data);if(v.dialogue.trim()&&used.has(dialogueKey(v.dialogue)))throw Error("Repeated earlier dialogue");return v}catch(e){issue=e.message}
 }
 if(issue==="Repeated earlier dialogue"){const e=Error("Conversation ended to avoid repeated dialogue.");e.code="REPEAT_DIALOGUE";throw e}
 throw Error("Invalid AI reply after retry: "+issue+". Try again or inspect the model.");
}
function preview(c,eventOnly){const dialogue=eventOnly?"Hey, you're here. What's up?":c.mood==="Tired"?"Sorry, I'm a little tired. What were you saying?":c.mood==="Annoyed"?"Give me a second, okay?": "Hey. Tell me more.";return {dialogue,emotion:c.mood.toLowerCase(),action:"none (preview only)"}}
async function respond(eventOnly){
 if(busy)return;const input=eventOnly?$("event").value.trim():$("message").value.trim();if(!input){status("Enter some dialogue or an event first.");return}
 const p=profile(),c=context();if(p.provider==="ollama"&&!local){status("Live Ollama requires the local development URL. Preview mode works here.");return}if(p.provider==="ollama"&&!p.model.trim()){status("Enter an installed Ollama model name.");return}
 busy=true;$("send").disabled=$("react").disabled=$("clear").disabled=true;const ctrl=new AbortController();controller=ctrl;
 line(eventOnly?"event":"player",input);if(!eventOnly)$("message").value="";
 try{let output;
 if(p.provider==="preview"){output=normalize(preview(c,eventOnly));status("Scripted interface preview — no LLM used.");}
 else{status("Waiting for local LLM…");
 const instructions="You portray the fictional character Fighter in a game. Output only JSON with dialogue (string, may be empty if silence is appropriate), emotion (relaxed/excited/annoyed/tired/sad/amused/neutral), and action (short suggested action). Do not control the player or claim actions occurred. Do not invent canonical memories. Use only supplied world knowledge. Keep dialogue brief. Profile: "+JSON.stringify({personality:p.personality,style:p.style,knownMemories:p.memories});
 const messages=[{role:"system",content:instructions},...history.filter(h=>h.mode==="ollama").slice(-12).map(h=>({role:h.role,content:h.content})),{role:"user",content:JSON.stringify({world:c,input,eventOnly})}];
 output=await requestDialogue(p.model.trim(),messages,ctrl);status("Live response received from "+p.model+".");
 }
 if(ctrl.signal.aborted)return;
 last={mode:p.provider,world:c,response:output};$("output").textContent=JSON.stringify(last,null,2);line(p.provider==="preview"?"preview":"fighter",output.dialogue||"(Fighter remains silent.)");
 history.push({mode:p.provider,role:"user",content:JSON.stringify({world:c,input,eventOnly})},{mode:p.provider,role:"assistant",content:JSON.stringify(output)});history=history.slice(-60);
 if(p.autospeak&&output.dialogue)speak(output.dialogue);
 }catch(e){if(!ctrl.signal.aborted){status("Dialogue failed: "+errorText(e));if(!eventOnly)$("message").value=input}}finally{if(controller===ctrl){controller=null;busy=false;$("send").disabled=$("react").disabled=$("clear").disabled=false}}
}
async function check(){if(!local){status("Public preview: run the repository locally at http://localhost:3000/life/ to connect Ollama and Pocket TTS.");return}$("check").disabled=true;status("Checking local services…");try{const results=await Promise.allSettled([timedFetch(ollama+"/api/tags"),timedFetch(pocket+"/health")]);const ok=r=>r.status==="fulfilled"&&r.value.ok;let models="";if(ok(results[0])){try{const j=await results[0].value.json();models=(j.models||[]).map(m=>m.name).join(", ")}catch{}}status("Ollama: "+(ok(results[0])?"connected"+(models?" · "+models:""):"unavailable")+" | Pocket TTS: "+(ok(results[1])?"connected":"unavailable"));}finally{$("check").disabled=false}}
// Shared provider and model, separate character profiles; no private test history.
function npcConfig(){const p=profile();return {mode:p.provider,model:p.model.trim(),local,characters:{Fighter:{personality:p.personality,style:p.style},Chaotic:{personality:p.chaoticPersonality,style:p.chaoticStyle}}}}
async function npcTurn(config,speaker,world,publicHistory,signal){
 if(config.mode!=="ollama"||!local)throw Error("Live Ollama requires the local development version.");
 if(!config.model||!Object.hasOwn(config.characters,speaker))throw Error("Missing model or character.");
 const ctrl=new AbortController(),cancel=()=>ctrl.abort();if(signal.aborted)cancel();else signal.addEventListener("abort",cancel,{once:true});
 try{
 const system="You portray "+speaker+", a fictional NPC in After Hours. Speak only as this character to the other NPC or the room. Use only public conversation and your own profile; do not invent private memories or control anyone else. One or two short natural sentences, at most 200 characters. Stay in character without reciting your profile. Advance the conversation rather than repeating a previous line. Do not claim actions have already occurred. You can address the player or the other NPC. Empty dialogue ends the exchange if naturally finished. Output JSON with dialogue, emotion (relaxed/excited/annoyed/tired/sad/amused/neutral), and action (suggestion only). Profile: "+JSON.stringify(config.characters[speaker]);
 const messages=[{role:"system",content:system},{role:"user",content:JSON.stringify({world,publicConversation:publicHistory.slice(-12),speaker,task:"Respond as "+speaker+" to the most recent public statement. Do not write dialogue for any other character."})}];
 const previous=publicHistory.filter(h=>h.speaker===speaker).map(h=>h.dialogue);const v=await requestDialogue(config.model,messages,ctrl,previous);return {...v,dialogue:v.dialogue.slice(0,240)};
 }finally{signal.removeEventListener("abort",cancel)}
}
function clear(){history=[];last=null;$("transcript").replaceChildren();$("output").textContent="No response yet.";status("Test conversation cleared.");stopVoice()}
$("save").onclick=save;$("provider").addEventListener("change",save);$("model").addEventListener("change",save);$("voice-provider").onchange=voiceState;$("speak").onclick=()=>speak($("audition").value);$("stop-voice").onclick=stopVoice;$("check").onclick=check;$("form").onsubmit=e=>{e.preventDefault();respond(false)};$("react").onclick=()=>respond(true);$("clear").onclick=clear;$("current").onclick=()=>{$("location").value=actualLocation;$("time").value=new Date().toTimeString().slice(0,5);status("Current room and device time copied into test context.")};$("close").onclick=()=>dialog.close();
$("export").onclick=()=>{const u=URL.createObjectURL(new Blob([JSON.stringify({schemaVersion:1,character:"Fighter",profile:profile(),world:context(),history,last},null,2)],{type:"application/json"}));const a=document.createElement("a");a.href=u;a.download="fighter-character-lab.json";a.click();setTimeout(()=>URL.revokeObjectURL(u),1000)};
dialog.addEventListener("close",()=>{controller?.abort();stopVoice();onClose()});
load();voiceState();
window.LifeLab=Object.freeze({npcConfig,npcTurn,open(room){actualLocation=room;if(!dialog.open){dialog.showModal();status(local?"Local development mode — check services before live testing.":"Preview mode — no live AI connected.")}},onClose(fn){onClose=fn}});
})();