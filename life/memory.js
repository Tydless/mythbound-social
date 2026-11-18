/* Shared local event-store contract. Future authenticated backend adapter can replace this storage. */
(function(root){
"use strict";
const ID_KEY="afterhours-life-player-v1",PREFIX="afterhours-life-memory-v1:",SAVE_PREFIX="afterhours-life-save-v1:";
function read(key,fallback){try{const v=localStorage.getItem(key);return v===null?fallback:JSON.parse(v)}catch{return fallback}}
function write(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true}catch{return false}}
function uuid(){return globalThis.crypto?.randomUUID?.()||"p-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2)}
let id=read(ID_KEY,null);if(typeof id!=="string"||!id){id=uuid();write(ID_KEY,id)}
function player(){const p=read("mythbound-local-profile-v1",{});return {id,nickname:typeof p?.nickname==="string"&&p.nickname.trim()?p.nickname.slice(0,24):"Traveler",avatar:typeof p?.avatar==="string"?p.avatar:""}}
function all(){const v=read(PREFIX+id,[]);return Array.isArray(v)?v.filter(e=>e&&e.playerId===id):[]}
function record(source,type,details={}){
 const event={schemaVersion:1,id:uuid(),playerId:id,source:String(source).slice(0,64),type:String(type).slice(0,64),at:new Date().toISOString(),details:JSON.parse(JSON.stringify(details))};
 const events=all();events.push(event);write(PREFIX+id,events);return event
}
function load(){return read(SAVE_PREFIX+id,null)}
function save(state){return write(SAVE_PREFIX+id,state)}
function snapshot(){return {schemaVersion:1,player:player(),events:all(),roomSave:load()}}
root.WorldMemory=Object.freeze({player,record,all,load,save,snapshot});
})(window);