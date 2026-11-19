const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=f=>fs.readFileSync(path.join(root,f),"utf8");
const html=read("index.html");
const loadList=(pattern)=>JSON.parse(html.match(pattern)[1]);
const scripts=loadList(/for\(const f of (\[[^\n]+?\])\)document.write\('<script/);
const css=loadList(/for\(const f of (\[[^\n]+?\])\)document.write\('<link/);
test("Every entry point parses and loads in documented order",()=>{
 for(const f of scripts)new Function(read(f));
 for(const m of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g))new Function(m[1]);
 for(const f of css)assert.ok(read(f).length);
 for(const f of ["class-data.js","class-voice.js","class-transform-audio.js","class-portrait-effects.js"])assert.ok(scripts.indexOf(f)<scripts.indexOf("class-showcase.js"));
 assert.equal((html.slice(0,html.indexOf("</head>")).match(/<style>/g)||[]).length,1);
});
test("Class data and Saint skill paths remain available",()=>{
 const win={};new Function("window",read("class-data.js"))(win);
 const d=win.MythboundCodexData;
 assert.deepEqual(Object.keys(d.DATA).sort(),["animar","breaker","elemis","herder","saint","strider"]);
 const saint=d.SPECIALIZATIONS.saint;
 assert.equal(saint[1].name,"Archsaint");assert.equal(saint[2].name,"Fallen Saint");assert.equal(saint[3].name,"Coming soon");
 assert.equal(saint[1].skills.at(-1)[1],"Heaven's Mercy");assert.equal(saint[2].skills.at(-1)[1],"Marionette");
 assert.equal(saint[3].skills.length,0);assert.equal(d.DATA.saint.skills.length,4);
});
test("Same portrait coordinate system, centered canvas, no obsolete offset",()=>{
 const style=css.map(read).join("\n"),fx=read("class-portrait-effects.js");
 assert.ok(style.includes("aspect-ratio:1145/1406"));
 assert.ok(style.includes("position:absolute;display:block;inset:0;width:100%;height:100%;max-width:none;max-height:none;object-fit:contain"));
 assert.ok(fx.includes("sc.drawImage(oldImage,(w-dw)/2,(h-dh)/2,dw,dh)"));
 assert.doesNotMatch(style+fx,/translateX\(-0\.35%\)|w\*\.0035/);
});
test("Whimble intro keeps opacity pulse, duration and instant exit",()=>{
 assert.match(html,/50%\{opacity:\.65\}/);
 assert.ok(html.includes("holdTimer=setTimeout(leave,5900)"));
 assert.ok(html.includes("function leave(){unlock()}"));
 assert.ok(html.includes("mb-whimble-intro-v3"));
});
function node(){
 const props={},classes=new Set(["portrait-incoming"]);
 return {props,children:[],style:{setProperty(k,v){props[k]=v},removeProperty(k){delete props[k]}},classList:{add(...n){n.forEach(x=>classes.add(x))},remove(...n){n.forEach(x=>classes.delete(x))},contains(x){return classes.has(x)}},append(n){n.remove();this.children.push(n);n.parent=this},setAttribute(){},remove(){if(this.parent){this.parent.children=this.parent.children.filter(x=>x!==this);this.parent=null}}};
}
test("Each mobile transformation retains and cleans up the portrait",()=>{
 let timer;
 const win={matchMedia:()=>({matches:false})},nav={userAgent:"iPhone",platform:"iPhone",maxTouchPoints:5};
 new Function("window","navigator","document","setTimeout",read("class-portrait-effects.js"))(win,nav,{createElement:node},(fn,ms)=>{timer={fn,ms}});
 const fx=win.MythboundPortraitEffects;assert.equal(fx.useMobilePortraitEffects(),true);
 for(const [kind,duration,element] of [["base",1950,"mobile-base-ring"],["archsaint",2500,"mobile-heaven-ray"],["fallen",2500,"mobile-fire-tongue"],["mystery",2350,"mobile-mist-wisp"]]){
  const stage=node(),old=node(),pic=node();stage.append(old);stage.append(pic);fx.revealMobilePath(stage,old,pic,kind);
  assert.equal(stage.children.length,3);assert.ok(stage.classList.contains("mobile-portrait-dissolve"));
  assert.ok(stage.children[2].children.some(n=>n.className===element));assert.equal(timer.ms,duration);timer.fn();
  assert.deepEqual(stage.children,[pic]);assert.equal(pic.classList.contains("portrait-incoming"),false);
 }
});

test("Skill section headings identify the path without duplicating the class name",()=>{
 const win={};new Function("window",read("class-data.js"))(win);
 const paths=win.MythboundCodexData.SPECIALIZATIONS.saint;
 const code=read("class-showcase.js");
 const title=new Function(code.slice(code.indexOf("function pathSectionTitle("),code.indexOf("function renderPath(){"))+";return pathSectionTitle")();
 assert.equal(title({},true),"Base Class");
 assert.equal(title(paths[1],false),"True Path");
 assert.equal(title(paths[2],false),"Corrupted Path");
 assert.equal(title(paths[3],false),"Unrevealed Path");
 assert.equal(title({},false),"Advanced Path");
 assert.doesNotMatch(html,/id="path-type"/);
});

test("Independent volume preferences and overlapping music ducking preserve the latest volume",()=>{
 const win={},saved=new Map(),music={volume:1};
 const doc={getElementById:id=>id==="mythbound-theme"?music:null,querySelector:()=>null,addEventListener(){},dispatchEvent(){}};
 new Function("window","document","localStorage","Event",read("sound-settings.js"))(win,doc,{getItem:k=>saved.get(k)??null,setItem:(k,v)=>saved.set(k,String(v))},class Event{});
 const mixer=win.MythboundAudio;
 assert.equal(mixer.level("music"),.3);assert.equal(win.MythboundSFX.volume(),1);
 mixer.duck("region",.45);mixer.setLevel("music",.6);assert.ok(Math.abs(music.volume-.27)<.0001);
 mixer.duck("voice",.28);mixer.release("region");assert.ok(Math.abs(music.volume-.168)<.0001);
 mixer.release("voice");assert.equal(music.volume,.6);
 mixer.setLevel("sfx",.4);win.MythboundSFX.setEnabled(false);assert.equal(win.MythboundSFX.volume(),0);
 assert.equal(saved.get("mythbound-sfx-volume"),"0.4");win.MythboundSFX.setEnabled(true);assert.equal(win.MythboundSFX.volume(),.4);
});
test("Path identities use shared categories without revealing the mystery path",()=>{
 const code=read("class-showcase.js"),icon={},panel={dataset:{}},heading={closest:()=>panel};
 const render=new Function("$",code.slice(code.indexOf("function renderPathIdentity("),code.indexOf("function renderPath(){"))+";return renderPathIdentity")(id=>id==="path-detail-title"?heading:icon);
 for(const key of ["base","true","corrupted","twisted","fable","mythical","unrevealed"]){
  render({type:key.toUpperCase()+" PATH"},key==="base");
  assert.equal(panel.dataset.pathTheme,key);assert.match(icon.innerHTML,/<svg/);
 }
});


test("All Saint portrait requests share a fresh revision and explicit centering",()=>{
 const code=read("class-showcase.js"),style=read("class-portrait.css");
 assert.match(code,/sourceURL\.searchParams\.set\("portraitRev","20261119-aligned2"\)/);
 assert.match(style,/object-position:50% 50%/);
 assert.match(style,/justify-self:center;min-width:0/);
});

test("Heavenly Realm recording trim follows the SFX mixer even without Web Audio",()=>{
 let latest,handler,level=1;
 const page={hidden:false},doc={hidden:false,body:{classList:{contains:()=>false}},getElementById:()=>page,addEventListener:(n,f)=>{if(n==="mythbound:sfx-change")handler=f}};
 const win={MythboundSFX:{volume:()=>level,enabled:()=>true},addEventListener(){}};
 class Audio{constructor(src){this.src=src;latest=this}addEventListener(){}play(){return Promise.resolve()}pause(){}removeAttribute(){}load(){}}
 new Function("window","document","Audio","MutationObserver",read("world-region-audio.js"))(win,doc,Audio,class{observe(){}});
 win.MythboundRegionAudio.play("heavenly");assert.equal(latest.volume,.65);
 level=.4;handler();assert.ok(Math.abs(latest.volume-.26)<.0001);
 win.MythboundRegionAudio.stop();
});


test("Desktop and mobile default to the same safe portrait renderer; diagnostics retain legacy and off modes",()=>{
 const code=read("class-showcase.js"),style=read("class-mobile-effects.css");
 assert.match(code,/const safePortraitFx=mobile\|\|fxMode!=="legacy"/);
 assert.match(code,/const animate=fxMode!=="off"&&allowTransformation/);
 assert.match(code,/if\(safePortraitFx\)\{/);
 assert.match(style,/\.saint-portrait-stage\.safe-portrait-fx\.mobile-portrait-dissolve \.portrait-incoming/);
 assert.match(style,/\.saint-portrait-stage\.safe-portrait-fx \.saint-portrait\{filter:none!important/);
});


test("Rich desktop transformations keep original portraits and remove only decorative layers",()=>{
 let timer,raf;
 const win={matchMedia:()=>({matches:false}),CSS:{supports:()=>true}},nav={userAgent:"Desktop",platform:"Win32",maxTouchPoints:0};
 new Function("window","navigator","document","setTimeout","requestAnimationFrame",read("class-portrait-effects.js"))(win,nav,{createElement:tag=>{assert.ok(tag==="span"||tag==="div");return node()}},(fn,ms)=>{timer={fn,ms}},fn=>{raf=fn});
 const fx=win.MythboundPortraitEffects;
 for(const [kind,element] of [["base","rich-divine-front"],["archsaint","rich-feather"],["fallen","rich-burn-front"],["mystery","mobile-mist-wisp"]]){
  const stage=node(),old=node(),pic=node();
  stage.append(old);stage.append(pic);
  fx.revealMobilePath(stage,old,pic,kind,true);
  const layer=stage.children.find(n=>/portrait-rich-effect/.test(n.className||""));
  assert.match(layer.className,/portrait-rich-effect/);
  assert.ok(layer.children.some(n=>n.className===element));
  assert.deepEqual(old.props,{});assert.deepEqual(pic.props,{});
  if(kind==="fallen"){
   const front=layer.children.find(n=>n.className==="rich-burn-front");
   assert.equal(front.children.filter(n=>n.className==="rich-burn-spark").length,55);
   assert.ok(stage.classList.contains("rich-burn-sweep"));
   assert.equal(stage.classList.contains("mobile-portrait-dissolve"),false);
   assert.deepEqual(stage.children.find(n=>n.className==="rich-burn-portrait-layer rich-burn-old").children,[old]);
   assert.deepEqual(stage.children.find(n=>n.className==="rich-burn-portrait-layer rich-burn-new").children,[pic]);
   assert.equal(stage.props["--burn-edge"],"104%");
   raf(100);raf(1300);assert.equal(stage.props["--burn-edge"],"50.0000%");
   raf(2500);assert.equal(stage.props["--burn-edge"],"-4.0000%");
  }
  timer.fn();assert.deepEqual(stage.children,[pic]);assert.equal(stage.classList.contains("mobile-portrait-dissolve"),false);assert.equal(stage.classList.contains("rich-burn-sweep"),false);assert.equal(stage.props["--burn-edge"],undefined);
 }
 const stage=node(),old=node(),pic=node();
 stage.append(old);stage.append(pic);
 fx.revealMobilePath(stage,old,pic,"fallen");
 assert.doesNotMatch(stage.children[2].className,/portrait-rich-effect/);
 assert.ok(stage.children[2].children.some(n=>n.className==="mobile-fire-tongue"));timer.fn();
 assert.deepEqual(stage.children,[pic]);
});


test("Fallen Saint wrapper clipping uses the same jagged boundary as its fire",()=>{
 const style=read("class-mobile-effects.css");
 const old=style.match(/\.rich-burn-old\{\s*z-index:0;clip-path:polygon\(([^;]+)\);/)[1];
 const next=style.match(/\.rich-burn-new\{\s*z-index:1;clip-path:polygon\(([^;]+)\);/)[1];
 assert.deepEqual(old.split(", ").slice(2).reverse(),next.split(", ").slice(0,-2));
 assert.match(style,/top:calc\(var\(--burn-edge\) - 14\.645%\);animation:none/);
 assert.match(style,/rich-burn-portrait-layer\{\s*position:absolute;inset:0/);
});


test("Desktop restores original Base, Archsaint and mystery decorations without legacy Fallen redraw",()=>{
 const code=read("class-showcase.js"),style=read("class-mobile-effects.css"),fx=read("class-portrait-effects.js");
 assert.match(code,/if\(mobile\|\|fxMode==="simple"\|\|isFallen\)\{/);
 assert.match(code,/stage\.classList\.add\("desktop-original-fx"\);\s*if\(special\)revealSpecialPath\(stage,oldImage,picture,special\);\s*else revealSaint\(stage,oldImage,picture\);/);
 assert.match(style,/\.safe-portrait-fx\.desktop-original-fx \.portrait-special-effect\{display:block!important\}/);
 assert.match(style,/\.desktop-base-reveal-layer\{position:absolute;inset:0;z-index:2/);
 const base=fx.slice(fx.indexOf("function revealSaint("),fx.indexOf("function burnPortrait("));
 assert.doesNotMatch(base,/drawImage|getImageData|putImageData/);
 assert.match(base,/maskLayer\.append\(oldImage\);stage\.append\(maskLayer\);maskTarget=maskLayer/);
 assert.match(base,/maskTarget\.style\.maskImage=mask/);
 const special=fx.slice(fx.indexOf("function revealSpecialPath("),fx.indexOf("function revealSaint("));
 assert.match(special,/if\(!stage\.classList\.contains\("safe-portrait-fx"\)\)picture\.style\.filter=/);
});
