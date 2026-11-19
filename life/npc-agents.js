(function(root){
"use strict";
const names=["Fighter","Chaotic"],maxMemory=24;
const copy=x=>JSON.parse(JSON.stringify(x));
function key(id,name){return "afterhours-npc-memory-v1:"+id+":"+name}
function validLine(x){return x&&typeof x.speaker==="string"&&typeof x.dialogue==="string"&&typeof x.location==="string"}
function load(storage,id,name){try{const a=JSON.parse(storage.getItem(key(id,name))||"[]");return Array.isArray(a)?a.filter(validLine).slice(-maxMemory):[]}catch{return []}}
function store(storage,id,name,lines){try{storage.setItem(key(id,name),JSON.stringify(lines.slice(-maxMemory)));return true}catch{return false}}
function create(config,world,storage,id){
 const agents={};
 for(const name of names){
  const p=config.characters[name];
  if(!p)continue;
  agents[name]={name,profile:copy(p),model:p.model||config.model,previous:load(storage,id,name),inbox:[],mood:"neutral",intent:"none",turns:0};
 }
 const room={location:String(world.location),time:String(world.time),present:world.present.filter(n=>n==="Player"||Object.hasOwn(agents,n))};
 function hear(speaker,dialogue){
  if(typeof dialogue!=="string"||!dialogue.trim()||!room.present.includes(speaker))return;
  for(const name of names){
   const a=agents[name];if(!a||!room.present.includes(name))continue;
   const line={speaker,dialogue:dialogue.slice(0,300),location:room.location,time:room.time};
   a.inbox.push({...line});
   // Only real, delivered public speech enters persistent memory. Not private plans or preview.
   if(config.mode==="ollama")store(storage,id,name,[...a.previous,...a.inbox]);
  }
 }
 function get(name){const a=agents[name];if(!a)throw Error("Unknown NPC");return a}
 function accept(name,v){const a=get(name);a.mood=v.emotion||"neutral";a.intent=v.action||"none";a.turns++}
 function prompt(name){
  const a=get(name);
  const known=(config.usePastMemory===false?[]:a.previous.slice(-6)).map(x=>({source:x.speaker,words:x.dialogue,place:x.location,time:x.time}));
  const system="You are "+name+", an individual fictional person in After Hours. Your identity and private knowledge belong only to you. Speak as yourself in first person, never narrate or speak for the player or another NPC. You independently decide your response, not what the other person should say. Your own earlier dialogue is in assistant messages; other speakers are in user messages. Those assistant messages are completed past turns, not examples to copy. Reply only to the newest input. Do not restate your earlier answer, mirror the other person's wording, or repeat a joke. You can disagree, ask a question, change topic naturally, or stay silent. Mythbound Online is a fictional MMORPG played on computers, not the physical world. A raid, class, Saint, PvP or match in Mythbound refers to the GAME unless explicitly specified otherwise. Fighter is a former MMA fighter, not currently a professional fighter. No recent physical fight, injury flare-up, meal or game session has been established by the current scene. Do not use your backstory as an excuse in every reply. Only facts supplied by the game or your own established profile are canonical. Previous spoken statements are recollections of what was said, not proof that an event occurred. Do not invent past events, assume an action happened, or expose private facts just to fill silence. Respond to the actual newest input in one or two natural sentences, at most 200 characters; empty dialogue means you choose not to speak. Output JSON with dialogue, emotion, action (intention suggestion only).\nYour personal profile: "+JSON.stringify({personality:a.profile.personality,style:a.profile.style,privateKnowledge:a.profile.privateKnowledge||""})+"\nOptional older recollections for reference only (not current dialogue; never replay them): "+JSON.stringify(known)+"\nYour present state: "+JSON.stringify({mood:a.mood,lastSuggestedIntention:a.intent});
  const messages=[{role:"system",content:system}];
  function add(role,content){const last=messages[messages.length-1];if(last.role===role&&role==="user")last.content+="\n"+content;else messages.push({role,content})}
  add("user","Current physical situation: "+JSON.stringify({...room,activity:"Hanging out; no game actions or movement have been executed."}));
  for(const line of a.inbox.slice(-16)){
   if(line.speaker===name)add("assistant",JSON.stringify({dialogue:line.dialogue}));
   else add("user",JSON.stringify({heardFrom:line.speaker,spoken:line.dialogue}));
  }
  add("user",a.inbox.length?"NEW TURN for "+name+". The latest audible statement was "+JSON.stringify(a.inbox[a.inbox.length-1])+". Respond to that statement with a new contribution, or stay silent.":"NEW TURN for "+name+". Begin a natural conversation if you have something to say.");
  return messages;
 }
 return {get,hear,accept,prompt};
}
function inspect(storage,id,name){if(!names.includes(name))return [];return load(storage,id,name)}
function clear(storage,id,name){if(!names.includes(name))return false;try{storage.removeItem(key(id,name));return true}catch{return false}}
const api=Object.freeze({create,inspect,clear});
if(typeof module!=="undefined"&&module.exports)module.exports=api;else root.LifeAgents=api;
})(typeof window!=="undefined"?window:globalThis);
