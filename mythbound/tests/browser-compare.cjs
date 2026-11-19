const {chromium,webkit}=require("playwright");
const assert=require("node:assert/strict");
const {execFileSync}=require("node:child_process");
const fs=require("node:fs");
const os=require("node:os");
const path=require("node:path");
const http=require("node:http");
const root=path.resolve(__dirname,"../..");
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),"mythbound-check-"));
const baseline=path.join(tmp,"baseline");
const mime={".html":"text/html; charset=utf-8",".css":"text/css; charset=utf-8",".js":"text/javascript; charset=utf-8",".png":"image/png",".webp":"image/webp",".jpg":"image/jpeg",".svg":"image/svg+xml",".mp3":"audio/mpeg",".wav":"audio/wav"};
async function serve(dir){
 const server=http.createServer((req,res)=>{
  try{
   let p=path.resolve(dir,"."+decodeURIComponent(new URL(req.url,"http://localhost").pathname));
   if(p!==dir&&!p.startsWith(dir+path.sep)){res.writeHead(403).end();return}
   if(fs.statSync(p).isDirectory())p=path.join(p,"index.html");
   res.writeHead(200,{"Content-Type":mime[path.extname(p)]||"application/octet-stream"});
   fs.createReadStream(p).pipe(res);
  }catch{res.writeHead(404).end()}
 });
 await new Promise(r=>server.listen(0,"127.0.0.1",r));
 return {server,url:"http://127.0.0.1:"+server.address().port+"/mythbound/"};
}
async function visit(browser,url,mobile,tag){
 const ctx=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1440,height:1000},hasTouch:mobile,isMobile:mobile,reducedMotion:"reduce"});
 // Block external resources consistently; local artwork is loaded normally.
 await ctx.route("**/*",r=>r.request().url().startsWith("http://127.0.0.1:")?r.continue():r.abort());
 const page=await ctx.newPage(),errors=[];
 page.on("pageerror",e=>errors.push(e.message));
 await page.goto(url);
 await page.locator("#mb-studio-intro").click({timeout:10000});
 await page.locator("#player-nickname").fill("RegressionTraveler");
 await page.locator("#avatar-choices button").first().click();
 await page.locator("#player-login-button").click();
 await page.locator("#mythbound-login").waitFor({state:"hidden"});
 async function navigate(name){
  if(mobile)await page.locator("#mobile-menu-toggle").click();
  await page.locator("#primary-navigation [data-page="+name+"]").click();
 }
 const snapshots=[];
 async function snap(label,selectors){
  await page.evaluate(()=>document.fonts.ready);
  const data=await page.evaluate(selectors=>selectors.map(sel=>{
   const n=document.querySelector(sel);if(!n)return null;
   const r=n.getBoundingClientRect(),s=getComputedStyle(n);
   return {sel,text:n.innerText||"",x:Math.round(r.x*10)/10,y:Math.round((r.y+window.scrollY)*10)/10,w:Math.round(r.width*10)/10,h:Math.round(r.height*10)/10,display:s.display,position:s.position,color:s.color,background:s.background,border:s.border,transform:s.transform,objectFit:s.objectFit,opacity:s.opacity};
  }),selectors);
  snapshots.push({label,data});
  await page.screenshot({path:path.join(tmp,tag+"-"+label+".png"),animations:"disabled"});
 }
 await snap("home",[".site-header","#featured-news-open",".site-footer",".footer-whimble-logo"]);
 await navigate("classes");
 await page.locator(".class-grid [data-class=saint]").click();
 for(const [i,name] of [[0,"Saint"],[1,"Archsaint"],[2,"Fallen Saint"],[3,"Coming soon"]]){
  await page.locator("#class-paths [data-path='"+i+"']").click();
  await page.waitForFunction(n=>document.querySelector("#class-name").textContent===n,name);
  await page.waitForFunction(()=>{const im=document.querySelector(".saint-portrait-stage img");return im?.complete&&im.naturalWidth>0});
  await snap("path-"+i,["#class-name",".showcase-info","#class-stats",".saint-portrait-stage",".saint-portrait-stage img","#class-paths",".path-overview","#class-skills","#skill-detail"]);
  if(i<3){await page.locator(".ability-tile").last().click();await snap("skill-"+i,["#skill-detail",".path-overview"])}
  await page.locator(".gender-option[data-gender=female]").click();
  await page.waitForFunction(()=>{const im=document.querySelector(".saint-portrait-stage img");return im?.complete&&im.naturalWidth>0&&im.alt.startsWith("Female")});
  await snap("female-"+i,[".saint-portrait-stage img","#class-paths"]);
  await page.locator(".gender-option[data-gender=male]").click();
 }
 await navigate("discover");
 await page.locator("#mw-region-directory button").first().click();
 await snap("world",["#mw-interactive-map","#mw-region-detail","#mw-region-directory"]);
 assert.deepEqual(errors,[],tag+" uncaught page errors");
 await ctx.close();return snapshots;
}
(async()=>{
 let a,b;
 try{
  execFileSync("git",["worktree","add","--detach",baseline,"27cfb88559f8358e620d0d7193651a808f37b7e8"],{cwd:root,stdio:"ignore"});
  a=await serve(baseline);b=await serve(root);
  for(const [name,type] of [["chromium",chromium],["webkit",webkit]]){
   const browser=await type.launch();
   try{for(const mobile of [false,true]){
    const key=name+(mobile?"-mobile":"-desktop");
    const before=await visit(browser,a.url,mobile,key+"-before"),after=await visit(browser,b.url,mobile,key+"-after");
    assert.deepEqual(after,before,key+" layout / calculated style / content mismatch");
    console.log(key+": layout and interaction comparison passed");
   }}finally{await browser.close()}
  }
 }finally{
  a?.server.close();b?.server.close();
  try{execFileSync("git",["worktree","remove","--force",baseline],{cwd:root,stdio:"ignore"})}catch{}
  console.log("Comparison screenshots: "+tmp);
 }
})().catch(e=>{console.error(e);process.exitCode=1});
