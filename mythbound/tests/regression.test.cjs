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


test("All five path categories and the base class drive the ability inspector accent",()=>{
 const style=read("class-specializations.css");
 for(const theme of ["true","corrupted","twisted","fable","mythical","unrevealed"]){
  assert.ok(style.includes('.path-overview[data-path-theme="'+theme+'"]{--path-tone:'));
 }
 assert.match(style,/\.path-overview\[data-path-theme\]:not\(\[data-path-theme="base"\]\)\{\s*--class-highlight:var\(--path-tone\)/);
 for(const selector of [".ability-detail-heading h4",".ability-mechanic h4",".path-mechanic-table td",".ability-video-caption strong",".ability-group-head h4",".skill-data strong"]){
  assert.ok(style.slice(style.indexOf("/* The selected path owns")).includes(selector));
 }
 assert.match(style,/\.ability-tile\.is-current\{\s*border-color:var\(--path-tone\)/);
 assert.match(style,/\.ability-group-ultimate \.ability-art\{\s*border-color:var\(--path-tone\)/);
});


test("Base class accent inherits the selected class without a CSS custom property cycle",()=>{
 const style=read("class-specializations.css"),code=read("class-showcase.js");
 assert.match(style,/\.path-overview\[data-path-theme="base"\]\{--path-tone:var\(--class-highlight\)/);
 assert.match(code,/host\.style\.setProperty\("--class-highlight",mystery\?"#b8bed8":DATA\[active\]\.color\)/);
 const shared=style.slice(style.indexOf("/* The selected path owns"));
 assert.equal((shared.match(/:not\(\[data-path-theme="base"\]\)/g)||[]).length,1);
 assert.match(shared,/\.path-overview\[data-path-theme\] :is\(/);
 assert.match(shared,/\.path-overview\[data-path-theme\] \.ability-art\{\s*--ability-ink:var\(--path-tone\)/);
 const win={};new Function("window",read("class-data.js"))(win);
 for(const name of ["saint","strider","herder","animar","breaker","elemis"])assert.match(win.MythboundCodexData.DATA[name].color,/^#[0-9a-f]{6}$/i);
});


test("Deeper title accents and ultimate-only emphasis preserve the small-text palette",()=>{
 const style=read("class-specializations.css"),code=read("class-showcase.js");
 const rules=style.slice(style.indexOf("/* Typographic hierarchy:"));
 assert.match(rules,/--title-tone:color-mix\(in srgb,var\(--path-tone\) 66%,#252333\)/);
 assert.match(rules,/--ultimate-tone:color-mix\(in srgb,var\(--path-tone\) 78%,#fff3d8\)/);
 for(const selector of [".showcase-section-title h3",".ability-group-head h4",".ability-detail-heading h4",".ability-mechanic h4"])assert.ok(rules.includes(selector));
 assert.doesNotMatch(rules,/\.skill-data span|\.skill-data strong|\.ability-category-label|\.ability-detail-type/);
 assert.match(rules,/\.ability-group-ultimate \.ability-group-head h4\{\s*font-weight:800/);
 assert.match(rules,/\.skill-detail\[data-ability-group="ultimate"\] \.ability-art\{\s*border:2px solid var\(--ultimate-tone\)/);
 assert.match(code,/if\(entry\)detail\.dataset\.abilityGroup=entry\.group;else delete detail\.dataset\.abilityGroup/);
 assert.match(code,/skills\.hidden=true;detail\.replaceChildren\(\);delete detail\.dataset\.abilityGroup/);
});


test("Titles use visibly deeper dedicated class and path swatches",()=>{
 const css=read("class-specializations.css"),data={};new Function("window",read("class-data.js"))(data);
 const luminance=hex=>{const v=hex.slice(1).match(/../g).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:Math.pow((x+.055)/1.055,2.4));return .2126*v[0]+.7152*v[1]+.0722*v[2]};
 for(const theme of ["true","corrupted","twisted","fable","mythical","unrevealed"]){
  const light=css.match(new RegExp('\\.path-overview\\[data-path-theme="'+theme+'"\\]\\{--path-tone:(#[0-9a-f]{6})'))[1];
  const dark=css.match(new RegExp('\\.path-overview\\[data-path-theme="'+theme+'"\\]\\{--title-tone:(#[0-9a-f]{6})'))[1];
  assert.ok(luminance(dark)<luminance(light)*.81,theme);
 }
 for(const [kind,entry] of Object.entries(data.MythboundCodexData.DATA)){
  const dark=css.match(new RegExp('\\[data-skill-theme="'+kind+'"\\] \\.path-overview\\[data-path-theme="base"\\]\\{--title-tone:(#[0-9a-f]{6})'))[1];
  assert.ok(luminance(dark)<luminance(entry.color)*.81,kind);
 }
});


test("Marked ability headings and category icon share the saturated title color",()=>{
 const style=read("class-specializations.css");
 const block=style.slice(style.indexOf("/* Target the headings explicitly"),style.indexOf("/* The smaller caption"));
 for(const selector of [".subclass-intro h3",".path-category-icon",".path-ability-layout .showcase-section-title h3",".skill-detail .ability-detail-heading h4",".ability-group-head h4"])assert.ok(block.includes(selector));
 assert.match(block,/\{color:var\(--title-tone\)\}/);
 assert.match(style,/\[data-path-theme="true"\]\{--path-tone:#ffe9a6/);
 assert.match(style,/\[data-path-theme="true"\]\{--title-tone:#ffce4e\}/);
 assert.match(style,/\.ability-video-caption strong\{color:var\(--path-tone\)\}/);
 const details=style.slice(style.indexOf("/* The selected path owns"),style.indexOf("/* Typographic hierarchy:"));
 assert.doesNotMatch(details,/\.ability-detail-heading h4|\.showcase-section-title h3/);
});


test("Path and advancement symbols are centered with explicit SVG geometry",()=>{
 const style=read("class-specializations.css");
 assert.match(html,/<span class="path-advancement-symbol" aria-hidden="true"><svg viewBox="0 0 24 24"/);
 assert.match(html,/M12 4Q13\.5 10\.5 20 12Q13\.5 13\.5 12 20Q10\.5 13\.5 4 12Q10\.5 10\.5 12 4Z/);
 assert.match(style,/\.subclass-intro>div\{align-items:center\}/);
 assert.match(style,/\.subclass-intro h3\{margin:0;line-height:1\.25\}/);
 assert.match(style,/\.path-advancement-symbol\{\s*display:grid;place-items:center;box-sizing:border-box;flex:0 0 34px/);
 assert.match(style,/\.path-advancement-symbol svg\{display:block;width:20px;height:20px;margin:0\}/);
});

test("News rotates every five seconds and swipes wrap without opening articles",()=>{
 const code=html.slice(html.indexOf("function swipeDirection"),html.indexOf("showFeatured(0);schedule();"));
 const fn= new Function("card","showFeatured","schedule","openArticle","items","Date","event", "let gesture=null,suppressClickUntil=0,index=0;"+code+";return ()=>index;");
 const handlers={},calls=[],card={addEventListener(n,f){handlers[n]=f}};
 let schedules=0,now=100;
 const index=fn(card,(i,a,d)=>{calls.push([i,a,d])},()=>schedules++,id=>calls.push(id),[{id:"one"},{id:"two"},{id:"three"},{id:"four"}],{now:()=>now});
 function touch(x,y){return {identifier:1,clientX:x,clientY:y}}
 function start(x,y){handlers.touchstart({touches:[touch(x,y)]})}
 function end(x,y){let prevented=false;handlers.touchend({changedTouches:[touch(x,y)],cancelable:true,preventDefault(){prevented=true}});return prevented}
 start(180,60);assert.equal(end(90,62),true);assert.deepEqual(calls.pop(),[1,true,1]);
 let blocked=false;card.onclick({detail:1,preventDefault(){blocked=true}});assert.equal(blocked,true);assert.equal(calls.length,0);
 start(30,80);assert.equal(end(120,83),true);assert.deepEqual(calls.pop(),[3,true,-1]);
 start(100,100);assert.equal(end(95,210),false);assert.equal(calls.length,0);
 start(100,100);assert.equal(end(103,104),false);card.onclick({detail:1,preventDefault(){}});assert.equal(calls.pop(),"one");
 assert.ok(schedules>=8);assert.equal(index(),0);
 assert.match(html,/const interval=5000;/);
 assert.match(read("portal-finishing.css"),/touch-action:pan-y pinch-zoom/);
});


test("Uploaded region cues use their exact filenames, individual mixer trims and clean up on selection",()=>{
 let latest,handler,level=1;
 const page={hidden:false},doc={hidden:false,body:{classList:{contains:()=>false}},getElementById:()=>page,addEventListener:(n,f)=>{if(n==="mythbound:sfx-change")handler=f}};
 const win={MythboundSFX:{volume:()=>level,enabled:()=>true},addEventListener(){}};
 class Audio{constructor(src){this.src=src;latest=this;this.events={}}addEventListener(n,f){this.events[n]=f}play(){return Promise.resolve()}pause(){this.paused=true}removeAttribute(){}load(){}}
 new Function("window","document","Audio","MutationObserver",read("world-region-audio.js"))(win,doc,Audio,class{observe(){}});
 for(const [id,file,trim] of [["heavenly","HeavenlyRealmIntro.mp3",.65],["dunes","WildDunesIntro.mp3",.4],["wondrous","WondrousLandsIntro.mp3",1],["fable","FableWoodsIntro.mp3",1],["greatfields","GreatFieldsIntro.mp3",1],["bloodmoon","BloodMoonshireIntro.mp3",1]]){
  const previous=latest;level=1;win.MythboundRegionAudio.play(id);
  if(previous)assert.equal(previous.paused,true);
  assert.equal(latest.src,"../"+file);assert.equal(latest.volume,trim);
  level=.5;handler();assert.equal(latest.volume,trim*.5);
 }
 latest.events.ended();assert.equal(latest.paused,true);
});

test("Home decorative subtitles are removed, while news titles remain",()=>{
 const home=html.slice(html.indexOf('id="page-home"'),html.indexOf('id="page-news"'));
 for(const label of ["A GLIMPSE BEYOND THE VEIL","LETTERS FROM THE THRESHOLD","BEYOND THE GAME","CHRONICLE I · THE FIRST AWAKENING"])assert.ok(!home.includes(label));
 assert.ok(html.includes("Letters from the Threshold — developer diary"));
});
test("News filters show every matching category and Home deep-links reveal hidden articles",()=>{
 const keys=["cosmetics","patch-notes","announcement","community","developer-diary"];
 const buttons=["all",...keys].map(newsFilter=>({dataset:{newsFilter},classList:{toggle(n,v){this.active=v}},setAttribute(n,v){this[n]=v},addEventListener(n,f){this.click=f}}));
 const articles=keys.map(newsCategory=>({dataset:{newsCategory},hidden:false}));
 const tags=keys.map(newsTag=>({dataset:{newsTag},addEventListener(n,f){this.click=f}}));
 const home={addEventListener(n,f){this.click=f}},status={hidden:true};
 const doc={querySelectorAll(s){return s==="[data-news-filter]"?buttons:s==="#news-list .news-entry"?articles:s==="[data-news-tag]"?tags:s==='#page-home [data-go="news"]'?[home]:[]},getElementById(){return status}};
 const code=html.slice(html.indexOf(" function filterNews(category)"),html.indexOf(" function toggleArticle(id,open)"));
 new Function("document",code)(doc);
 for(let i=0;i<keys.length;i++){
  buttons[i+1].click();assert.equal(articles.filter(a=>!a.hidden).length,1);assert.equal(articles[i].hidden,false);assert.equal(buttons[i+1]["aria-pressed"],"true");assert.equal(status.hidden,true);
  tags[(i+1)%keys.length].click();assert.equal(articles[(i+1)%keys.length].hidden,false);
 }
 buttons[0].click();assert.ok(articles.every(a=>!a.hidden));buttons[1].click();home.click();assert.ok(articles.every(a=>!a.hidden));
 assert.ok(html.includes('function openArticle(id){\n  filterNews("all");'));
 for(const [i,key] of keys.entries()){assert.ok(html.includes('data-news-category="'+key+'"'));assert.ok(html.includes('data-news-tag="'+key+'"'))}
});

test("Home two-line headings have balanced spacing at desktop and mobile widths",()=>{
 const s=read("portal-finishing.css");
 assert.ok(s.includes("--home-class-heading-space:72px;--home-hub-heading-space:52px"));
 assert.ok(s.includes("--home-class-heading-space:36px;--home-hub-heading-space:30px"));
 assert.ok(s.includes("padding-block:var(--home-class-heading-space)"));
 assert.ok(s.includes("#page-home>.preview-classes{padding-top:0}"));
 assert.ok(s.includes("padding-top:var(--home-hub-heading-space)"));
 assert.ok(s.includes("margin:0 0 var(--home-hub-heading-space);padding:0"));
 assert.ok(s.includes("align-items:center;justify-content:center;gap:12px;text-align:center"));
 assert.ok(s.includes("margin:0;line-height:1.25"));
 assert.ok(s.includes("margin:0;line-height:1.6;max-width:65ch"));
 for(const t of ["Choose the legend you become","Latest news","Join the community"])assert.ok(html.includes(t));
});

test("Header portrait optical alignment moves the presence marker with the artwork and stays isolated",()=>{
 const s=read("portal-finishing.css");
 assert.ok(s.includes(".site-header #account-button>.account-sigil.mb-account-portrait{"));
 assert.ok(s.includes("align-self:center;margin:0;transform:translateY(-2.5px)"));
 assert.ok(s.includes("@media(max-width:760px){\n .site-header #account-button>.account-sigil.mb-account-portrait{transform:translateY(-1.5px)}"));
 assert.ok(s.includes(".site-header #account-button:not(.mb-guest-login)"));
 assert.ok(s.includes("width:100%;height:100%;margin:0;"));
 assert.ok(html.includes('id="account-button" class="account-chip"'));
});

test("World encyclopedia replaces disconnected sections without changing map pin interactions",()=>{
 const code=read("world-atlas.js"),style=read("portal-atlas.css");
 assert.ok(!html.includes('id="mw-region-detail"'));
 assert.ok(!html.includes('id="mw-locations"'));
 assert.ok(!html.includes('id="mw-chronicles"'));
 assert.ok(!html.includes('class="mw-jump"'));
 assert.ok(html.includes('id="mw-region-interface"'));
 for(const tab of ["region","locations","inhabitants","journal"])assert.ok(html.includes('data-region-tab="'+tab+'"'));
 assert.ok(code.includes('pin.addEventListener("click",()=>openPreview(r.id,pin,{sound:true}))'));
 assert.ok(code.includes('showTab("region");moveTo($("mw-regions"))'));
 assert.ok(code.includes('if(sound)window.MythboundRegionAudio?.play(id)'));
 assert.ok(code.includes('btn.style.setProperty("--region-accent",r.color)'));
 assert.ok(style.includes(".mw-codex-select"));
});

test("Announced subclass roster has ten released and two upcoming entries, with no invented mechanics",()=>{
 const w={};new Function("window",read("class-data.js"))(w);
 const s=w.MythboundCodexData.SPECIALIZATIONS;
 const expected={"strider":[["Vanguard","TRUE"],["Phantom","TWISTED"],["Djinnblade","MYTHICAL"]],"breaker":[["Grandmaster","TRUE"],["Wrathborn","CORRUPTED"],["Skybreaker","MYTHICAL",true]],"elemis":[["Elementilist","TRUE"],["Trickster","TWISTED"]],"herder":[["Divine Herder","TRUE"],["Wonderherd","FABLE"]],"animar":[["Wildheart","TRUE"],["Mythbeast","MYTHICAL",true]]};
 let released=0,upcoming=0;
 for(const [family,list] of Object.entries(expected)){
  assert.equal(Object.keys(s[family]).length,list.length);
  list.forEach(([name,path,soon],i)=>{const p=s[family][i+1];assert.equal(p.name,name);assert.equal(p.type,path+" PATH");assert.equal(!!p.comingSoon,!!soon);assert.equal(p.pending,true);assert.equal(p.skills.length,0);assert.equal(p.stats,undefined);assert.equal(p.advancement,undefined);if(soon)upcoming++;else released++});
 }
 assert.equal(released,10);assert.equal(upcoming,2);assert.equal(s.saint[3].comingSoon,true);
 const code=read("class-showcase.js");assert.ok(code.includes("isUnrevealed()||isPending()"));assert.ok(code.includes("b.hidden=i!==0&&!SPECIALIZATIONS[active]?.[i]"));
 assert.ok(code.includes("isUnrevealed:hasSaintTeaser,voiceAvailable:()=>!isPending()"));
});

test("Gameplay navigation and guide expose the four announced feature areas",()=>{
 const code=read("app.js"),style=read("gameplay.css");
 assert.match(html,/<button[^>]+data-page="gameplay"[^>]*>Gameplay<\/button>/);
 assert.match(code,/const valid=\[[^\]]*"gameplay"/);
 const page=html.slice(html.indexOf('<section id="page-gameplay"'),html.indexOf('<section id="page-profile"'));
 for(const label of ["Exploration","Explore with Friends","Symbiosis System","Join or Found a Guild","Guild advantages","Class Changes"])assert.ok(page.includes(label));
 assert.match(page,/data-go="discover"/);assert.match(page,/data-go="classes"/);
 assert.match(page,/System details forthcoming/);assert.match(page,/specific benefits forthcoming/);
 assert.doesNotMatch(page,/marriage|housing|\bpets\b/i);
 assert.ok(css.includes("gameplay.css"));assert.ok(style.includes("#page-gameplay"));
});

test("The visitor journey leads from Home to World to Gameplay to Classes",()=>{
 const nav=html.slice(html.indexOf('<nav id="primary-navigation"'),html.indexOf('</nav>',html.indexOf('<nav id="primary-navigation"')));
 assert.deepEqual([...nav.matchAll(/data-page="([^"]+)"/g)].map(m=>m[1]),["home","news","discover","gameplay","classes"]);
 const hero=html.match(/<div class="hero-buttons">([\s\S]*?)<\/div>/)[1];
 assert.equal((hero.match(/<button\b/g)||[]).length,2);
 assert.equal((hero.match(/data-go=/g)||[]).length,1);
 assert.match(hero,/id="home-whats-new"/);
 assert.match(hero,/data-go="discover"/);
 const world=html.slice(html.indexOf('<section id="page-discover"'),html.indexOf('<section id="page-news"'));
 assert.ok(world.indexOf('class="mw-gameplay-invitation"')>world.indexOf('id="mw-codex-panel"'));
 assert.match(world,/<button[^>]+data-go="gameplay"/);
 assert.match(read("app.js"),/navigate\(b.dataset.go\)/);
});

test("Home trailer awaits a real source and release cards target their exact class paths",()=>{
 const home=html.slice(html.indexOf('id="page-home"'),html.indexOf('id="page-discover"'));
 assert.ok(home.indexOf('id="home-trailer-video"')<home.indexOf('class="preview-classes home-class-releases"'));
 assert.match(home,/<video[^>]+data-trailer-src=""[^>]+controls[^>]+hidden/);
 const cards=[...home.matchAll(/data-class="([^"]+)" data-class-path="([^"]+)"/g)].map(m=>[m[1],m[2]]);
 assert.deepEqual(cards,[["animar","0"],["strider","3"]]);
 const w={};new Function("window",read("class-data.js"))(w);
 assert.equal(w.MythboundCodexData.SPECIALIZATIONS.strider[3].name,"Djinnblade");
 assert.match(read("class-showcase.js"),/activePath=Number.isInteger\(requested\)&&SPECIALIZATIONS\[family\]\?\.\[requested\]\?requested:0/);
 assert.match(read("app.js"),/if\(!source\)return;/);
});

test("Home What's new button scrolls to the newsletter without changing routes",()=>{
 const hero=html.match(/<div class="hero-buttons">([\s\S]*?)<\/div>/)[1];
 assert.ok(hero.indexOf('data-go="discover"')<hero.indexOf('id="home-whats-new"'));
 assert.match(hero,/What is new\? <span aria-hidden="true">↓/);
 assert.match(html,/<section id="home-newsletter" class="hub-section newsletter-hub"/);
 const code=read("app.js");
 const start=code.indexOf('document.getElementById("home-whats-new")');
 const end=code.indexOf("\n});",start)+4;
 let click,scroll,focused=false;
 const doc={getElementById:id=>({"home-whats-new":{addEventListener:(k,f)=>{click=f}},"home-newsletter":{getBoundingClientRect:()=>({top:600})},"newsletter-title":{focus:()=>{focused=true}}})[id],querySelector:()=>({getBoundingClientRect:()=>({bottom:80})})};
 const win={scrollY:100,scrollTo:p=>{scroll=p},matchMedia:()=>({matches:false})};
 new Function("document","window",code.slice(start,end))(doc,win);click();
 assert.deepEqual(scroll,{top:608,behavior:"smooth"});assert.ok(focused);
 win.matchMedia=()=>({matches:true});click();assert.equal(scroll.behavior,"instant");
});

test("The nine Whimble Chronicles are upcoming Developer Diary posts, not fake published articles",()=>{
 const entries=[["pinterest","It All Started on Pinterest"],["vision","From Vision to Reality"],["inspirations","A Love Letter to Fantasy"],["two-pixels","The Art of Two Pixels"],["navigation","A Website That Tells a Story"],["many-paths","The Many Paths We Walk"],["voice","Giving Legends a Voice"],["chatgpt","My Unexpected Development Partner"],["dream-game","The Game I Wish Existed"]];
 const cards=[...html.matchAll(/<article class="news-entry diary-upcoming"[^>]*>([\s\S]*?)<\/article>/g)];
 assert.equal(cards.length,9);
 entries.forEach(([id,title],i)=>{
  assert.ok(cards[i][0].includes('id="news-diary-'+id+'"'));
  assert.ok(cards[i][0].includes('data-news-category="developer-diary"'));
  assert.ok(cards[i][0].includes('data-diary-status="planned"'));
  assert.ok(cards[i][0].includes('<h2>'+title+'</h2>'));
  assert.ok(cards[i][0].includes("Coming soon"));
  assert.ok(!cards[i][0].includes("data-news-toggle"));
 });
 assert.ok(html.includes('id="news-devlog"'));
});
