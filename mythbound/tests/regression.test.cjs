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
 return {props,children:[],style:{setProperty(k,v){props[k]=v},removeProperty(k){delete props[k]}},classList:{add(...n){n.forEach(x=>classes.add(x))},remove(...n){n.forEach(x=>classes.delete(x))},contains(x){return classes.has(x)}},append(n){this.children.push(n);n.parent=this},setAttribute(){},remove(){if(this.parent)this.parent.children=this.parent.children.filter(x=>x!==this)}};
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
