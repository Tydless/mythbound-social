/* Region cues: local recordings may replace synthesized placeholders. */
(()=>{"use strict";
const page=document.getElementById("page-discover");if(!page)return;
const recordings={heavenly:"../HeavenlyRealmIntro.mp3"};
const notes={greatfields:[1760,2200,1480],fable:[523,659,784,988],wondrous:[784,1175,1047,1568,2093],bloodmoon:[65,98,58],heavenly:[131,196,262,330,392,523],dunes:[196,294,195]};
let ctx,current,epoch=0;
const enabled=()=>window.MythboundSFX?.enabled()!==false&&!page.hidden&&!document.hidden;
function stop(){epoch++;if(current){const old=current;current=null;try{old()}catch{}}}
function synth(id,ticket){if(ticket!==epoch||!enabled())return;try{
const C=window.AudioContext||window.webkitAudioContext;if(!C)return;ctx=ctx||new C();if(ctx.state==="suspended")ctx.resume().catch(()=>{});
const start=ctx.currentTime,out=ctx.createGain(),nodes=[];out.gain.value=.32;out.connect(ctx.destination);
let disposed=false;const dispose=()=>{if(disposed)return;disposed=true;for(const n of nodes)try{n.stop()}catch{};out.disconnect()};
current=dispose;
function tone(f,delay,len,vol,type="sine",end=f){const n=ctx.createOscillator(),g=ctx.createGain(),t=start+delay;n.type=type;n.frequency.setValueAtTime(f,t);n.frequency.exponentialRampToValueAtTime(end,t+len);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+Math.min(.35,len*.25));g.gain.exponentialRampToValueAtTime(.0001,t+len);n.connect(g);g.connect(out);n.start(t);n.stop(t+len+.02);nodes.push(n)}
function wind(f1,f2,vol){const b=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*2.5),ctx.sampleRate),data=b.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;const n=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),g=ctx.createGain();n.buffer=b;filter.type="bandpass";filter.frequency.setValueAtTime(f1,start);filter.frequency.exponentialRampToValueAtTime(f2,start+2.5);g.gain.setValueAtTime(.0001,start);g.gain.linearRampToValueAtTime(vol,start+.6);g.gain.linearRampToValueAtTime(0,start+2.5);n.connect(filter);filter.connect(g);g.connect(out);n.start(start);nodes.push(n)}
switch(id){
case "greatfields":wind(460,1000,.09);notes[id].forEach((f,i)=>tone(f,.22+i*.42,.35,.035,"sine",f*1.2));break;
case "fable":wind(900,400,.055);notes[id].forEach((f,i)=>{tone(f,.2+i*.24,1.1,.065);tone(f*2,.2+i*.24,.5,.018)});break;
case "wondrous":notes[id].forEach((f,i)=>{tone(f,i*.19,.9,.06);tone(f*2,i*.19,.4,.012)});break;
case "bloodmoon":wind(220,620,.10);notes[id].forEach((f,i)=>tone(f,i*.08,2.7,.09,"sine",f*.92));for(const at of [.2,1.1]){tone(55,at,.4,.15,"sine",35);tone(49,at+.19,.28,.08,"sine",32)}break;
case "dunes":wind(350,1400,.14);notes[id].forEach((f,i)=>tone(f,.45+i*.3,1.2,.04,"triangle"));break;
case "heavenly":notes[id].forEach((f,i)=>{tone(f*.997,i*.1,3,.036);tone(f*1.003,i*.1,3,.036);tone(f*2,i*.1,2.8,.012,"triangle")});break}
setTimeout(()=>{if(ticket===epoch){dispose();current=null}},3700);
}catch{}}
function play(id){if(!Object.prototype.hasOwnProperty.call(notes,id))return;stop();if(!enabled())return;const ticket=epoch;
try{const C=window.AudioContext||window.webkitAudioContext;if(C){ctx=ctx||new C();if(ctx.state==="suspended")ctx.resume().catch(()=>{})}}catch{}
if(!recordings[id]){synth(id,ticket);return}
const audio=new Audio(recordings[id]);audio.volume=.36;let failed=false;const dispose=()=>{audio.pause();audio.removeAttribute("src");audio.load()};current=dispose;
const fallback=()=>{if(failed||ticket!==epoch)return;failed=true;dispose();current=null;synth(id,ticket)};
audio.addEventListener("error",fallback,{once:true});audio.addEventListener("ended",()=>{if(ticket===epoch&&!failed)current=null},{once:true});try{audio.play()?.catch(fallback)}catch{fallback()}}
document.addEventListener("mythbound:sfx-change",()=>{if(!enabled())stop()});document.addEventListener("visibilitychange",()=>{if(document.hidden)stop()});document.addEventListener("mythbound:class-voice-start",stop);document.addEventListener("mythbound:party-voice-start",stop);window.addEventListener("pagehide",stop);new MutationObserver(()=>{if(page.hidden)stop()}).observe(page,{attributes:true,attributeFilter:["hidden"]});window.MythboundRegionAudio={play,stop};
})();