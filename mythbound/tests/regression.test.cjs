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
