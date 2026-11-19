/* Desktop and mobile class transformations. No class state or audio dependencies. */
(()=>{
"use strict";
function revealSpecialPath(stage,oldImage,picture,kind){
 const heaven=kind==="archsaint",duration=heaven?2400:2250;
 const finish=()=>{oldImage?.remove();stage.querySelector(".portrait-special-effect")?.remove();stage.classList.remove("portrait-revealing");picture.classList.remove("portrait-incoming");picture.style.removeProperty("opacity");picture.style.removeProperty("filter")};
 const layer=document.createElement("div");layer.className="portrait-special-effect "+(heaven?"heavenly-effect":"mystery-effect");layer.setAttribute("aria-hidden","true");
 const add=(cls,vars={})=>{const e=document.createElement("span");e.className=cls;for(const [k,v] of Object.entries(vars))e.style.setProperty(k,v);layer.append(e)};
 if(heaven){
  add("heavenly-glow");add("heavenly-ring");
  for(let i=0;i<7;i++)add("heavenly-ray",{"--angle":(-31+i*10.3)+"deg","--ray-width":(9+i%3*4)+"%","--delay":i*.025+"s"});
  for(let i=0;i<32;i++)add(i%4===0?"heavenly-feather":"heavenly-spark",{"--x":(8+Math.random()*84)+"%","--y":(Math.random()*53)+"%","--drift":(-65+Math.random()*130)+"px","--turn":(-120+Math.random()*240)+"deg","--delay":Math.random()*.48+"s","--size":(i%4===0?6+Math.random()*8:2+Math.random()*4)+"px"});
 }else{
  add("mystery-veil");add("mystery-seam");
  for(let i=0;i<9;i++)add("mystery-cloud",{"--x":(10+Math.random()*66)+"%","--y":(4+i*10)+"%","--drift":(i%2?1:-1)*(70+Math.random()*90)+"px","--delay":i*.04+"s"});
  for(let i=0;i<22;i++)add("mystery-mote",{"--x":(10+Math.random()*80)+"%","--y":(10+Math.random()*80)+"%","--drift":(-50+Math.random()*100)+"px","--delay":Math.random()*.65+"s","--size":(1+Math.random()*3)+"px"});
 }
 stage.append(layer);stage.classList.add("portrait-revealing");picture.style.opacity="0";
 let start=null;const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x)};
 function frame(now){
  if(!stage.isConnected)return;
  if(start===null)start=now;
  const p=Math.min(1,(now-start)/duration),a=smooth((p-.32)/.43);
  if(oldImage)oldImage.style.opacity=String(1-smooth((p-.09)/.38));
  picture.style.opacity=String(a);picture.style.filter="blur("+((heaven?4:8)*(1-a)).toFixed(2)+"px) drop-shadow(0 18px 22px #08122265)";
  if(p<1)requestAnimationFrame(frame);else finish();
 }
 requestAnimationFrame(frame);
}

// Divine manifestation: a broad feathered gradient rising over the old image,
// with little star-shaped glints that appear along its moving boundary.
function revealSaint(stage,oldImage,picture){
 const finish=()=>{
  oldImage.remove();stage.querySelector(".portrait-burn-canvas")?.remove();
  stage.classList.remove("portrait-revealing","portrait-crossfade");picture.classList.remove("portrait-incoming");
 };
 try{
  const b=stage.getBoundingClientRect();
  if(!b.width||!b.height){finish();return}
  const canvas=document.createElement("canvas");
  canvas.className="portrait-burn-canvas";canvas.setAttribute("aria-hidden","true");
  canvas.style.zIndex="3";
  const w=canvas.width=Math.min(720,Math.ceil(b.width*1.3)),h=canvas.height=Math.round(w*b.height/b.width);
  const ctx=canvas.getContext("2d");
  if(!ctx){stage.classList.add("portrait-crossfade");setTimeout(finish,1050);return}
  const masked=window.CSS&&(CSS.supports("mask-image","linear-gradient(black,transparent)")||CSS.supports("-webkit-mask-image","linear-gradient(black,transparent)"));
  oldImage.style.zIndex="2";stage.append(canvas);stage.classList.add("portrait-revealing");
  const duration=1420;
  const stars=Array.from({length:43},(_,i)=>({
   born:.12+Math.random()*.72,x:(.09+Math.random()*.82)*w,
   drift:(Math.random()-.5)*w*.095,dy:(.025+Math.random()*.075)*h,
   life:.32+Math.random()*.42,size:1.1+Math.random()*3.4,
   cross:i%3===0,seed:Math.random()*Math.PI*2
  }));
  let start=null;
  function tick(now){
   if(!stage.isConnected)return;
   if(start===null)start=now;
   const elapsed=now-start,p=Math.min(1,elapsed/duration),smooth=p*p*(3-2*p);
   // Mask fades from the bottom upward, dissolving through a soft 38% band.
   const edge=119-138*smooth,lo=edge-19,hi=edge+19;
   if(masked){
    const mask="linear-gradient(to bottom, #000 "+lo+"%, transparent "+hi+"%)";
    oldImage.style.maskImage=mask;oldImage.style.webkitMaskImage=mask;
   }else oldImage.style.opacity=String(1-smooth);
   if(p===1)oldImage.style.visibility="hidden";
   ctx.clearRect(0,0,w,h);
   const cy=edge*h/100,light=Math.sin(Math.PI*p);
   if(p<1){
    const gradient=ctx.createRadialGradient(w*.5,cy,0,w*.5,cy,w*.46);
    gradient.addColorStop(0,"rgba(255,229,164,"+(.16*light)+")");
    gradient.addColorStop(.45,"rgba(255,222,148,"+(.065*light)+")");gradient.addColorStop(1,"rgba(255,222,148,0)");
    ctx.save();ctx.translate(0,cy);ctx.scale(1,.36);ctx.translate(0,-cy);
    ctx.fillStyle=gradient;ctx.fillRect(0,cy-w*.5,w,w);ctx.restore();
   }
   for(const s of stars){
    const age=elapsed/1000-s.born*duration/1000;
    if(age<0||age>s.life)continue;
    const q=age/s.life,at=s.born*s.born*(3-2*s.born);
    const x=s.x+s.drift*q,y=(1.19-1.38*at)*h-s.dy*q;
    const fade=Math.sin(Math.PI*q)*(.77+.23*Math.cos(s.seed+q*8));
    const r=s.size*(.5+.8*Math.sin(Math.PI*q));
    ctx.globalAlpha=fade*.65;
    const halo=ctx.createRadialGradient(x,y,0,x,y,r*4.5);halo.addColorStop(0,"#fff2b9");halo.addColorStop(1,"rgba(255,220,140,0)");
    ctx.fillStyle=halo;ctx.fillRect(x-r*4.5,y-r*4.5,r*9,r*9);
    ctx.globalAlpha=fade*.95;ctx.fillStyle="#fffbea";ctx.beginPath();
    if(s.cross){
     ctx.moveTo(x,y-r*2.2);ctx.quadraticCurveTo(x+r*.24,y-r*.24,x+r*1.35,y);
     ctx.quadraticCurveTo(x+r*.24,y+r*.24,x,y+r*2.2);ctx.quadraticCurveTo(x-r*.24,y+r*.24,x-r*1.35,y);ctx.quadraticCurveTo(x-r*.24,y-r*.24,x,y-r*2.2);
    }else ctx.arc(x,y,r*.52,0,Math.PI*2);
    ctx.fill();
   }
   ctx.globalAlpha=1;
   if(elapsed<duration+420)requestAnimationFrame(tick);else finish();
  }
  requestAnimationFrame(tick);
 }catch{
  oldImage.style.zIndex="";oldImage.style.maskImage="";oldImage.style.webkitMaskImage="";oldImage.style.opacity="";oldImage.style.visibility="";
  stage.querySelector(".portrait-burn-canvas")?.remove();stage.classList.remove("portrait-revealing");stage.classList.add("portrait-crossfade");setTimeout(finish,1050);
 }
}

function burnPortrait(stage,oldImage,picture,isFallen){
 const finish=()=>{stage.classList.remove("portrait-revealing","portrait-crossfade");picture.classList.remove("portrait-incoming");oldImage.remove();stage.querySelector(".portrait-burn-canvas")?.remove()};
 const fallback=()=>{stage.querySelector(".portrait-burn-canvas")?.remove();stage.classList.add("portrait-crossfade");setTimeout(finish,1050)};
 try{
  const bounds=stage.getBoundingClientRect();
  if(!bounds.width||!bounds.height){finish();return}
  const canvas=document.createElement("canvas");canvas.className="portrait-burn-canvas";canvas.setAttribute("aria-hidden","true");
  const w=canvas.width=Math.min(540,Math.ceil(bounds.width*1.15)),h=canvas.height=Math.round(w*bounds.height/bounds.width);
  const ctx=canvas.getContext("2d"),source=document.createElement("canvas");source.width=w;source.height=h;
  const sc=source.getContext("2d",{willReadFrequently:true});if(!ctx||!sc){fallback();return}
  const scale=Math.min(w/oldImage.naturalWidth,h/oldImage.naturalHeight);
  const dw=oldImage.naturalWidth*scale,dh=oldImage.naturalHeight*scale;
  sc.drawImage(oldImage,(w-dw)/2,(h-dh)/2,dw,dh);
  const original=sc.getImageData(0,0,w,h),frame=ctx.createImageData(w,h),src=original.data,dst=frame.data;
  const field=new Float32Array(w*h);
  const layers=[{s:44,a:.15},{s:16,a:.065},{s:6,a:.025}].map(({s,a})=>{const cols=Math.ceil(w/s)+2,rows=Math.ceil(h/s)+2;return {s,a,cols,grid:Float32Array.from({length:cols*rows},()=>Math.random())}});
  const smooth=t=>t*t*(3-2*t);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
   let n=0;
   for(const L of layers){const gx=x/L.s,gy=y/L.s,ix=Math.floor(gx),iy=Math.floor(gy),u=smooth(gx-ix),v=smooth(gy-iy),i=iy*L.cols+ix;const a=L.grid[i]*(1-u)+L.grid[i+1]*u,b=L.grid[i+L.cols]*(1-u)+L.grid[i+L.cols+1]*u;n+=(a*(1-v)+b*v-.5)*L.a}
   field[y*w+x]=.78*(1-y/h)+.10*x/w+n+.11;
  }
  const particles=[];
  // A continuous temperature ramp: glowing gold/rose at the consuming edge,
  // through crimson and wine into smoky violet. Blend two ramps across the field.
  const warm=[[255,232,181],[255,151,107],[225,53,67],[109,28,64],[42,19,52]];
  const cool=[[255,213,230],[240,120,173],[173,50,116],[87,34,101],[35,21,56]];
  const palette=new Uint8Array(32*128*3);
  for(let u=0;u<32;u++)for(let k=0;k<128;k++){
   const v=k/127*4,i=Math.min(3,Math.floor(v)),t=smooth(v-i),mix=u/31,j=(u*128+k)*3;
   for(let ch=0;ch<3;ch++)palette[j+ch]=Math.round((warm[i][ch]*(1-t)+warm[i+1][ch]*t)*(1-mix)+(cool[i][ch]*(1-t)+cool[i+1][ch]*t)*mix);
  }
  const hue=new Uint8Array(w*h);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
   const i=y*w+x,variation=.5+.29*Math.sin(x/w*6.1+y/h*3.2)+.15*Math.sin(x/w*12.4-y/h*4.5);
   hue[i]=Math.max(0,Math.min(31,Math.round(31*variation)));
  }
  const emberColors=[[255,224,173],[255,138,109],[240,87,127],[222,124,203],[174,108,233]];
  const emberGlows=["#d67947","#c33153","#ac295f","#a03f9b","#6e3d9a"];
  stage.append(canvas);ctx.putImageData(original,0,0);stage.classList.add("portrait-revealing");oldImage.style.visibility="hidden";
  let begin=0,last=0;const duration=2300;
  function tick(now){
   if(!stage.isConnected)return;
   if(!begin){begin=now;last=now}
   const elapsed=now-begin,dt=Math.min(40,now-last)/1000;last=now;
   const p=Math.min(1,elapsed/duration),threshold=-.12+1.24*(.60*p+.40*p*p*(3-2*p));
   for(let i=0,j=0;i<field.length;i++,j+=4){
    const d=field[i]-threshold,a=Math.max(0,Math.min(1,d/.035));
    if(d<=0){dst[j+3]=0;continue}
    if(d>=.112){dst[j]=src[j];dst[j+1]=src[j+1];dst[j+2]=src[j+2];dst[j+3]=src[j+3];continue}
    const heat=Math.max(0,Math.min(127,Math.round((d-.008)/.104*127)));
    const index=(hue[i]*128+heat)*3;
    const edge=a*(1-smooth(Math.max(0,Math.min(1,(d-.018)/.094))));
    dst[j]=src[j]*(1-edge)+palette[index]*edge;dst[j+1]=src[j+1]*(1-edge)+palette[index+1]*edge;dst[j+2]=src[j+2]*(1-edge)+palette[index+2]*edge;dst[j+3]=src[j+3]*a;
   }
   ctx.putImageData(frame,0,0);
   if(p>.04&&p<.96)for(let k=0;k<100;k++){const i=Math.floor(Math.random()*field.length);if(src[i*4+3]>160&&Math.abs(field[i]-threshold)<.018&&particles.length<85){particles.push({x:i%w,y:Math.floor(i/w),vx:(Math.random()-.5)*45,vy:-22-Math.random()*65,age:0,life:.38+Math.random()*.65,r:.6+Math.random()*1.6,color:Math.floor(Math.random()*emberColors.length)})}}
   ctx.globalCompositeOperation="lighter";
   for(let i=particles.length-1;i>=0;i--){const s=particles[i];s.age+=dt;s.x+=s.vx*dt;s.y+=s.vy*dt;if(s.age>=s.life){particles.splice(i,1);continue}const a=Math.sin(Math.PI*s.age/s.life);ctx.globalAlpha=a*.75;ctx.fillStyle="rgb("+emberColors[s.color].join(",")+")";ctx.shadowColor=emberGlows[s.color];ctx.shadowBlur=6;ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fill()}
   ctx.globalAlpha=1;ctx.shadowBlur=0;ctx.globalCompositeOperation="source-over";
   if(elapsed<duration+700)requestAnimationFrame(tick);else finish();
  }
  requestAnimationFrame(tick);
 }catch(e){oldImage.style.visibility="";stage.classList.remove("portrait-revealing");fallback()}
}

// Touch devices use small, ordinary CSS particles instead of canvas, blend modes,
// animated image filters and masked full-portrait overlays. iPad desktop mode included.
function useMobilePortraitEffects(){
 return window.matchMedia("(max-width: 760px), (hover: none) and (pointer: coarse)").matches||
  /iPad|iPhone|iPod/.test(navigator.userAgent)||
  (navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1);
}
// The burn boundary is shared by both stationary artwork wrappers and the fire.
// Only wrapper visibility changes; the original images keep their full dimensions.
function startBurnSweep(stage,oldImage,picture,duration){
 const oldLayer=document.createElement("div"),newLayer=document.createElement("div");
 oldLayer.className="rich-burn-portrait-layer rich-burn-old";
 newLayer.className="rich-burn-portrait-layer rich-burn-new";
 oldLayer.setAttribute("aria-hidden","true");
 oldLayer.append(oldImage);newLayer.append(picture);
 stage.append(oldLayer);stage.append(newLayer);
 stage.style.setProperty("--burn-edge","104%");
 stage.classList.add("rich-burn-sweep");
 let start=null,finished=false;
 function frame(now){
  if(finished||stage.isConnected===false)return;
  if(start===null)start=now;
  const p=Math.min(1,Math.max(0,(now-start)/duration));
  stage.style.setProperty("--burn-edge", (104-108*p).toFixed(4)+"%");
  if(p<1)requestAnimationFrame(frame);
 }
 requestAnimationFrame(frame);
 return ()=>{
  finished=true;
  stage.append(picture);newLayer.remove();oldLayer.remove();
  stage.classList.remove("rich-burn-sweep");
  stage.style.removeProperty("--burn-edge");
 };
}
function revealMobilePath(stage,oldImage,picture,kind,rich=false){
 // Keep the old image in place until the already-loaded new one dissolves in.
 // Mobile retains its ordinary opacity animations. Rich Fallen Saint instead
 // clips two stationary wrappers along a single synchronized ember boundary.
 const duration=kind==="archsaint"?2400:kind==="mystery"?2250:kind==="fallen"?2400:1850;
 const burnSweep=rich&&kind==="fallen"&&!!oldImage&&typeof requestAnimationFrame==="function"&&(!window.CSS||window.CSS.supports("clip-path","polygon(0 0, 100% 0, 100% 100%)"));
 const layer=document.createElement("div");
 layer.className="portrait-mobile-effect mobile-effect-"+kind+(rich?" portrait-rich-effect":"");
 layer.setAttribute("aria-hidden","true");
 layer.style.setProperty("--reveal-duration",duration+"ms");
 stage.style.setProperty("--reveal-duration",duration+"ms");
 function add(cls,vars={},parent=layer){
  const item=document.createElement("span");item.className=cls;
  for(const [k,v] of Object.entries(vars))item.style.setProperty(k,v);
  parent.append(item);return item;
 }
 add("mobile-reveal-aura");
 if(kind==="archsaint"){
  add("mobile-heaven-halo");
  const rays=rich?9:5;
  for(let i=0;i<rays;i++)add("mobile-heaven-ray",{"--angle":(rich?-32+i*64/(rays-1):-26+i*13)+"deg","--delay":i*.045+"s"});
  if(rich)for(let i=0;i<20;i++)add("rich-feather",{"--px":(8+(i*37.13)%84)+"%","--py":(3+(i*17.51)%38)+"%","--dx":((i%7)-3)*23+"px","--delay":(i%10)*.085+"s","--tilt":(-60+(i*23)%120)+"deg","--size":(9+i%5*3)+"px"});
 }else if(kind==="fallen"){
  if(rich){
   // The moving decorative front shares the stationary wrapper clipping boundary.
   const front=add("rich-burn-front");
   add("rich-burn-smoke",{},front);add("rich-burn-glow",{},front);
   add("rich-burn-rim",{},front);add("rich-burn-core",{},front);
   for(let i=0;i<17;i++)add("rich-burn-tongue",{"--px":(i*6.25)+"%","--size":(27+(i*19)%48)+"%","--lean":(-18+(i*11)%36)+"deg","--delay":(i%5)*-.09+"s","--flame-time":(.35+(i%7)*.07)+"s"},front);
   for(let i=0;i<55;i++)add("rich-burn-spark",{"--px":(5+(i*37.13)%90)+"%","--py":(42+(i*13.37)%28)+"%","--dx":((i%9)-4)*12+"px","--dy":(-32-(i*19)%110)+"px","--size":(2+i%4*1.2)+"px","--delay":.1+(i%15)*.105+"s","--ember-color":["#ffe8ba","#ffac83","#f45e72","#d97cdf","#c9a5ff"][i%5]},front);
  }else for(let i=0;i<5;i++)add("mobile-fire-tongue",{"--px":(8+i*21)+"%","--delay":i*.09+"s"});
 }else if(kind==="mystery"){
  for(let i=0;i<3;i++)add("mobile-mist-wisp",{"--py":(25+i*24)+"%","--delay":i*.12+"s","--dx":(i%2?55:-55)+"px"});
  if(rich)for(let i=0;i<4;i++)add("mobile-mist-wisp",{"--py":(12+i*23)+"%","--delay":(.18+i*.11)+"s","--dx":(i%2?85:-85)+"px"});
 }else{
  add("mobile-base-ring");
  if(rich){const front=add("rich-divine-front");for(let i=0;i<26;i++)add("rich-divine-star",{"--px":(7+(i*37.13)%86)+"%","--size":(3+i%4*2)+"px","--delay":(i%13)*.085+"s","--dx":((i%7)-3)*7+"px"},front)}
 }
 const amount=rich?(kind==="fallen"?30:36):(kind==="fallen"?25:20);
 for(let i=0;i<amount;i++){
  add("mobile-reveal-particle",{
   "--px":(8+(i*37.13)%84)+"%",
   "--py":(kind==="archsaint"?5+(i*23.71)%56:kind==="fallen"?45+(i*23.71)%48:15+(i*23.71)%70)+"%",
   "--dx":((i%7)-3)*16+"px",
   "--dy":((kind==="archsaint"?95:-95)-(i%4)*12)+"px",
   "--delay":((i%9)*.075)+"s",
   "--size":(5+i%4*2)+"px"
  });
 }
 stage.append(layer);
 picture.style.removeProperty("opacity");
 picture.style.removeProperty("filter");
 stage.classList.remove("portrait-revealing","portrait-crossfade");
 const finishBurn=burnSweep?startBurnSweep(stage,oldImage,picture,duration):null;
 if(oldImage&&!burnSweep)stage.classList.add("mobile-portrait-dissolve");
 else if(!burnSweep)picture.classList.remove("portrait-incoming");
 // Clean up even if iOS delays animationend or the visitor switches again.
 setTimeout(()=>{
  if(finishBurn)finishBurn();
  oldImage?.remove();layer.remove();
  picture.classList.remove("portrait-incoming");
  stage.classList.remove("mobile-portrait-dissolve");
  stage.style.removeProperty("--reveal-duration");
 },duration+100);
}
window.MythboundPortraitEffects={revealSpecialPath,revealSaint,burnPortrait,useMobilePortraitEffects,revealMobilePath};
})();
