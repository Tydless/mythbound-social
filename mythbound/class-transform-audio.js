/* Class transformation audio and lifecycle. Independent of portrait rendering. */
(()=>{
"use strict";
window.createMythboundTransformationAudio=function({$,classPage,isArchsaint}){
// Original transformation foley. Unlock on the selection gesture; play only when the new image is ready.
let transformAudioContext=null, transformAudioSource=null, recordedChoir=null, transformGain=null, transformGainBase=1;
const sfxLevel=()=>window.MythboundSFX?.volume()??1;
// Choir of Voices - Single Chord, bone666138, CC0. See audio-credits.md.
const choirSource="https://raw.githubusercontent.com/baron-elmwich/tethered-game/f23cd62702aa235f9056e1ac4d096a74cf1c5237/Assets/Audio/274121__bone666138__choir-of-voices-single-chord.wav";
const transformBuffers=Object.create(null);
function transformationMuted(){return window.MythboundSFX?.enabled()===false}
function prepareTransformationAudio(){
 if(transformationMuted())return;
 try{
  const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;
  transformAudioContext=transformAudioContext||new Audio();
  if(transformAudioContext.state==="suspended")transformAudioContext.resume().catch(()=>{});
 }catch{}
}
function stopTransformationAudio(){
 if(recordedChoir){const old=recordedChoir;recordedChoir=null;old.pause();old.removeAttribute("src");old.load()}
 if(transformAudioSource){try{transformAudioSource.stop()}catch{}transformAudioSource=null}
 transformGain=null;
 window.MythboundAudio?.release("class-transform");
}

// Original choir-like and mysterious sound effects.
function specialSound(ac,kind){
 const heaven=kind==="archsaint",duration=heaven?3.1:2.7,rate=ac.sampleRate,b=ac.createBuffer(1,Math.ceil(rate*duration),rate),data=b.getChannelData(0),tau=2*Math.PI;
 const clamp=x=>Math.max(0,Math.min(1,x)),smooth=x=>{x=clamp(x);return x*x*(3-2*x)};
 if(heaven){
  for(const [f,g,delay] of [[146.832,.06,0],[220,.075,.05],[293.665,.075,.12],[369.994,.06,.22],[440,.055,.32],[587.33,.035,.43]]){
   const weights=Array.from({length:8},(_,i)=>{const k=i+1,hz=f*k;return (k===1?.8:0)+(.6*Math.exp(-Math.pow((hz-720)/310,2))+.27*Math.exp(-Math.pow((hz-1250)/380,2)))/Math.sqrt(k)});
   const sum=weights.reduce((a,b)=>a+b,0);
   for(const detune of [-.003,.001,.004]){
    const phase=Math.random()*tau;
    for(let i=Math.floor(delay*rate);i<data.length;i++){
     const t=i/rate,env=smooth((t-delay)/.52)*(1-smooth((t-1.25)/(duration-1.25)));
     const a=tau*f*(1+detune)*(t-delay)+phase+.18*Math.sin(tau*4.4*t+phase);
     let v=0;for(let k=0;k<weights.length;k++)v+=weights[k]*Math.sin((k+1)*a+k*.43);
     data[i]+=g*env*v/(3*sum);
    }
   }
  }
  for(let i=0;i<data.length;i++){const t=i/rate-.7;if(t>0)data[i]+=.025*smooth(t/.2)*Math.exp(-1.8*t)*(Math.sin(tau*880*t)+.24*Math.sin(tau*1760*t))}
 }else{
  let low=0,mid=0,fast=0;
  for(let i=0;i<data.length;i++){
   const t=i/rate,n=Math.random()*2-1;low+=.004*(n-low);mid+=.035*(n-mid);fast+=.15*(n-fast);
   const env=smooth(t/.82)*(1-smooth((t-1.1)/(duration-1.1)));
   data[i]=env*(.075*Math.sin(tau*73.416*t+.8*Math.sin(t*1.2))+.028*Math.sin(tau*110*t)+.48*(mid-low)+.08*(fast-mid))+.02*smooth((t-.5)/.6)*(1-smooth((t-1.2)/1.3))*Math.sin(tau*146.83*t);
  }
 }
 const dry=data.slice();
 for(const [delay,g] of [[.047,.18],[.103,.14],[.181,.10],[.263,.07],[.361,.04]]){const off=Math.round(delay*rate);for(let i=off;i<data.length;i++)data[i]+=dry[i-off]*g}
 let peak=0;for(let i=0;i<data.length;i++){const tail=clamp((data.length-1-i)/(rate*.25));data[i]*=tail*tail;peak=Math.max(peak,Math.abs(data[i]))}
 if(peak>.4)for(let i=0;i<data.length;i++)data[i]*=.4/peak;
 return b;
}
function playRecordedChoir(){
 if(transformationMuted()||document.hidden||classPage.hidden)return;
 stopTransformationAudio();
 const audio=new Audio(choirSource);recordedChoir=audio;audio.preload="auto";audio.volume=.65*sfxLevel();
 const fallback=()=>{if(recordedChoir!==audio)return;stopTransformationAudio();if(isArchsaint()&&!classPage.hidden)playSpecialSound("archsaint",true)};
 audio.addEventListener("error",fallback,{once:true});
 audio.addEventListener("ended",()=>{if(recordedChoir===audio)stopTransformationAudio()},{once:true});
 function fade(){
  if(recordedChoir!==audio)return;
  const t=audio.currentTime;
  if(t>=4.8){stopTransformationAudio();return}
  audio.volume=.65*sfxLevel()*Math.max(0,Math.min(1,(4.8-t)/1.35));
  requestAnimationFrame(fade);
 }
 audio.addEventListener("playing",()=>{if(recordedChoir!==audio)return;window.MythboundAudio?.duck("class-transform",.12,.065);requestAnimationFrame(fade)},{once:true});
 try{audio.play().catch(fallback)}catch{fallback()}
}
function playSpecialSound(kind,forceSynth=false){
 if(kind==="archsaint"&&!forceSynth){playRecordedChoir();return}
 if(transformationMuted()||document.hidden||classPage.hidden)return;
 const ac=transformAudioContext;if(!ac||ac.state==="closed")return;
 stopTransformationAudio();
 try{const buffer=transformBuffers[kind]||(transformBuffers[kind]=specialSound(ac,kind));
 const sound=ac.createBufferSource(),gain=ac.createGain();sound.buffer=buffer;transformGain=gain;transformGainBase=kind==="archsaint"?.9:.85;gain.gain.value=transformGainBase*sfxLevel();
 sound.connect(gain);gain.connect(ac.destination);transformAudioSource=sound;
 sound.onended=()=>{sound.disconnect();gain.disconnect();if(transformAudioSource===sound){transformAudioSource=null;transformGain=null;window.MythboundAudio?.release("class-transform")}};window.MythboundAudio?.duck("class-transform",.10,.05);sound.start()}catch{stopTransformationAudio()}
}

function playTransformationAudio(fallen){
 if(transformationMuted()||document.hidden)return;
 const ac=transformAudioContext;if(!ac||ac.state==="closed")return;
 stopTransformationAudio();
 try{
  const key=fallen?"fire":"sparkle";
  if(!transformBuffers[key]){
   const rate=ac.sampleRate,duration=fallen?2.48:1.85;
   const buffer=ac.createBuffer(1,Math.ceil(rate*duration),rate),data=buffer.getChannelData(0);
   if(fallen){
    let low=0,mid=0;
    for(let i=0;i<data.length;i++){
     const t=i/rate,n=Math.random()*2-1;
     low+=.065*(n-low);mid+=.28*(n-mid);
     const env=Math.min(1,t/.20)*Math.pow(Math.max(0,1-t/duration),.75);
     data[i]=(low*.31+(n-mid)*.055)*env;
    }
    for(let k=0;k<63;k++){
     const start=Math.floor((.09+Math.random()*(duration-.30))*rate);
     const length=Math.floor((.007+Math.random()*.031)*rate);
     const strength=.08+Math.random()*.27;
     let previous=0;
     for(let i=0;i<length&&start+i<data.length;i++){
      const n=Math.random()*2-1,env=Math.exp(-i/(length*.21))*Math.min(1,i/Math.max(1,rate*.001));
      data[start+i]+=(.67*n+.33*previous)*strength*env;previous=n;
     }
    }
   }else{
    // A single breathing, luminous chord, not a sequence of bell notes.
    // Layered soft vowel-like harmonics and a diffuse high-frequency shimmer.
    const tau=2*Math.PI;
    const voices=[
     {f:220,g:.070},{f:329.6276,g:.060},{f:440,g:.052},{f:554.3653,g:.026}
    ];
    const harmonics=[1,.30,.20,.075,.045];
    for(const voice of voices){
     for(const detune of [-.0018,.0018]){
      const phase=Math.random()*tau;
      for(let i=0;i<data.length;i++){
       const t=i/rate,q=t/duration;
       const attack=Math.sin(Math.PI*.5*Math.min(1,t/.45))**2;
       const release=Math.cos(Math.PI*.5*Math.max(0,(q-.37)/.63))**2;
       const angle=tau*voice.f*(1+detune)*t+phase+.10*Math.sin(tau*1.7*t+phase);
       let vowel=0;
       for(let k=0;k<harmonics.length;k++)vowel+=harmonics[k]*Math.sin(angle*(k+1)+k*.4);
       data[i]+=voice.g*.5*vowel*attack*release;
      }
     }
    }
    let slow=0,fast=0;
    for(let i=0;i<data.length;i++){
     const t=i/rate,q=t/duration,n=Math.random()*2-1;
     slow+=.025*(n-slow);fast+=.26*(n-fast);
     const air=Math.sin(Math.PI*q)**2;
     const shimmer=Math.sin(tau*1318.510*t+.45*Math.sin(tau*.9*t))*.010+
       Math.sin(tau*1760*t+.35*Math.sin(tau*1.3*t))*.007;
     data[i]+=air*((fast-slow)*.040+shimmer);
    }
    // A very quiet diffuse tail gives the swell a spacious, chapel-like decay.
    const dry=data.slice();
    for(const [delay,level] of [[.063,.13],[.117,.095],[.173,.065],[.247,.04]]){
     const offset=Math.round(delay*rate);
     for(let i=offset;i<data.length;i++)data[i]+=dry[i-offset]*level;
    }
    for(let i=0;i<data.length;i++){
     const tail=Math.min(1,(data.length-1-i)/(rate*.18));
     data[i]*=tail*tail;
    }
   }
   transformBuffers[key]=buffer;
  }
  const sound=ac.createBufferSource(),gain=ac.createGain();sound.buffer=transformBuffers[key];
  transformGain=gain;transformGainBase=fallen?.85:.9;gain.gain.value=transformGainBase*sfxLevel();sound.connect(gain);gain.connect(ac.destination);
  transformAudioSource=sound;
  sound.onended=()=>{sound.disconnect();gain.disconnect();if(transformAudioSource===sound){transformAudioSource=null;transformGain=null;window.MythboundAudio?.release("class-transform")}};
  window.MythboundAudio?.duck("class-transform",.10,.05);sound.start();
 }catch{stopTransformationAudio()}
}
document.addEventListener("visibilitychange",()=>{if(document.hidden)stopTransformationAudio()});
window.addEventListener("pagehide",stopTransformationAudio);
document.addEventListener("mythbound:sfx-change",()=>{if(transformationMuted())stopTransformationAudio();else{if(transformGain)transformGain.gain.value=transformGainBase*sfxLevel();if(recordedChoir)recordedChoir.volume=.65*sfxLevel()*Math.max(0,Math.min(1,(4.8-recordedChoir.currentTime)/1.35))}});
const transformVisibility=new MutationObserver(()=>{if(classPage.hidden||document.body.classList.contains("mythbound-login-open"))stopTransformationAudio()});
transformVisibility.observe(classPage,{attributes:true,attributeFilter:["hidden"]});transformVisibility.observe(document.body,{attributes:true,attributeFilter:["class"]});
document.addEventListener("mythbound:party-voice-start",stopTransformationAudio);
return {prepareTransformationAudio,stopTransformationAudio,playSpecialSound,playTransformationAudio};
};
})();
