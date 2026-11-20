// Original, synthesized UI foley: no downloaded sound assets or external dependencies.
(function installMythboundInterfaceSounds(){
 let ctx,noise,last=-Infinity;const outputs=new Set();
 function play(kind){
  // Respect the existing audio preference; no surprise sounds when muted.
  if(window.MythboundSFX?.enabled()===false)return;
  const Audio=window.AudioContext||window.webkitAudioContext;
  if(!Audio)return;
  try{
   ctx=ctx||new Audio();
   if(ctx.state==="closed")return;
   if(ctx.state==="suspended")ctx.resume().catch(()=>{});
   const t=ctx.currentTime;
   if(t-last<.055)return;
   last=t;
   if(!noise){
    noise=ctx.createBuffer(1,Math.ceil(ctx.sampleRate*.42),ctx.sampleRate);
    const samples=noise.getChannelData(0);
    for(let i=0;i<samples.length;i++)samples[i]=Math.random()*2-1;
   }
   const out=ctx.createGain();out.gain.value=.6*(window.MythboundSFX?.volume()??1);out.connect(ctx.destination);outputs.add(out);
   // Ordinary interface sounds play without changing the soundtrack volume.
   function rustle(start,duration,from,to,volume,q){
    const source=ctx.createBufferSource();source.buffer=noise;
    const filter=ctx.createBiquadFilter();filter.type="bandpass";filter.Q.value=q;
    filter.frequency.setValueAtTime(from,start);filter.frequency.exponentialRampToValueAtTime(to,start+duration);
    const gain=ctx.createGain();gain.gain.setValueAtTime(.0001,start);gain.gain.exponentialRampToValueAtTime(volume,start+duration*.2);gain.gain.exponentialRampToValueAtTime(.0001,start+duration);
    source.connect(filter);filter.connect(gain);gain.connect(out);source.start(start);source.stop(start+duration+.01);
   }
   function tick(start,duration,frequency,volume){
    const osc=ctx.createOscillator(),gain=ctx.createGain();osc.type="sine";
    osc.frequency.setValueAtTime(frequency,start);osc.frequency.exponentialRampToValueAtTime(frequency*.82,start+duration);
    gain.gain.setValueAtTime(.0001,start);gain.gain.exponentialRampToValueAtTime(volume,start+.008);gain.gain.exponentialRampToValueAtTime(.0001,start+duration);
    osc.connect(gain);gain.connect(out);osc.start(start);osc.stop(start+duration+.01);
   }
   if(kind==="page"){
    rustle(t,.25,2500,850,.18,.65);rustle(t+.095,.16,4000,1400,.095,.9);tick(t+.19,.055,250,.045);
   }else{
    rustle(t,.095,1250,3800,.10,1.2);tick(t+.025,.12,940,.065);tick(t+.045,.09,1400,.025);
   }
   setTimeout(()=>{out.disconnect();outputs.delete(out)},kind==="page"?320:185);
  }catch{}
 }
 // Capture before handlers replace skill buttons or update route selection.
 document.addEventListener("click",event=>{
  if(!event.isTrusted)return;
  const button=event.target.closest("button,[data-page],[data-go],[data-class]");
  if(!button||button.disabled||button.closest("[hidden]"))return;
  if(button.matches(".path-option,.skill-icon")){play("select");return}
  const page=button.dataset.page||button.dataset.go||(button.dataset.class?"classes":null);
  if(page&&location.hash!=="#"+page){play("page");return}
  if(button.dataset.class)play("select");
 },true);
 document.addEventListener("mythbound:sfx-change",()=>{for(const out of outputs)out.gain.value=.6*(window.MythboundSFX?.volume()??1)});
 window.addEventListener("pagehide",()=>{if(ctx&&ctx.state==="running")ctx.suspend().catch(()=>{})});
})();
