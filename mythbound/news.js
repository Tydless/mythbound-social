document.addEventListener("DOMContentLoaded",()=>{
 const items=[{"id":"next-paths-confirmed","title":"Three Paths Yet Unwritten","category":"ANNOUNCEMENT","image":null,"symbol":"✧"},{"id":"patch-09","title":"Patch Notes IX — Preparing the Next Chapter","category":"PATCH NOTES","image":null,"symbol":"⚙"},{"id":"wardrobe","title":"Saint wardrobe spotlight","category":"COSMETICS","image":"../BannerSaint.png","symbol":"✧"},{"id":"patch","title":"Update 1.4.2 — The companion situation","category":"PATCH NOTES","image":null,"symbol":"✧"}];
 let index=0,timer=0,slideTimer=0,outgoing=null;
 const art=document.getElementById("featured-news-art"),dots=document.getElementById("featured-news-dots"),card=document.getElementById("featured-news-open"),pause=document.getElementById("featured-news-pause"),home=document.getElementById("page-home"),slide=document.getElementById("featured-news-slide");
 const reduced=window.matchMedia("(prefers-reduced-motion: reduce)");
 let paused=false,gesture=null,suppressClickUntil=0;
 const interval=5000;
 function reducedMotion(){return window.MythboundPreferences?.reduced()??reduced.matches}
 function canRotate(){return !paused&&!gesture&&!document.hidden&&!home.hidden&&!reducedMotion()}
 function schedule(){
  clearTimeout(timer);timer=0;
  if(canRotate())timer=setTimeout(()=>{timer=0;if(canRotate())showFeatured((index+1)%items.length,true,1);schedule()},interval);
 }
 function finishSlide(){
  clearTimeout(slideTimer);slideTimer=0;
  if(outgoing){outgoing.remove();outgoing=null}
  slide.classList.remove("is-incoming");
  card.classList.remove("is-sliding-back");
 }
 function showFeatured(i,animate=false,direction=i>index?1:-1){
  if(i===index&&animate)return;
  finishSlide();
  const moving=animate&&!reducedMotion();
  if(moving){
   // Preserve the old artwork and caption until the new page has slid into place.
   outgoing=slide.cloneNode(true);
   outgoing.removeAttribute("id");
   outgoing.querySelectorAll("[id]").forEach(n=>n.removeAttribute("id"));
   outgoing.setAttribute("aria-hidden","true");
   outgoing.classList.add("is-outgoing");
   card.classList.toggle("is-sliding-back",direction<0);
   card.append(outgoing);
  }
  index=i;const a=items[i];art.replaceChildren();
  if(a.image){const im=new Image();im.alt="";im.onerror=()=>{if(im.parentNode!==art)return;im.remove();art.textContent=a.symbol};art.append(im);im.src=a.image}else{art.textContent=a.symbol}
  document.getElementById("featured-news-title").textContent=a.title;
  document.getElementById("featured-news-category").textContent=a.category;
  dots.querySelectorAll("button").forEach((b,j)=>{b.setAttribute("aria-pressed",String(i===j));b.classList.toggle("is-active",i===j)});
  if(moving){
   void slide.offsetWidth;slide.classList.add("is-incoming");
   slideTimer=setTimeout(finishSlide,820);
  }
 }
 function updatePause(){
  const label=paused?"Resume automatic news rotation":"Pause automatic news rotation";
  pause.textContent=paused?"▶":"Ⅱ";pause.title=label;pause.setAttribute("aria-label",label);
 }
 items.forEach((a,i)=>{const b=document.createElement("button");b.type="button";b.setAttribute("aria-label",a.title);b.onclick=()=>{showFeatured(i,true);schedule()};dots.append(b);if(a.image){const preload=new Image();preload.src=a.image}});
 pause.addEventListener("click",()=>{paused=!paused;updatePause();schedule()});
 // Only deliberately pausing, leaving Home or hiding the browser tab stops rotation.
 // Hover and retained button focus must not stall the slideshow.
 document.addEventListener("visibilitychange",schedule);
 document.addEventListener("mythbound:preferences-change",e=>{if(e.detail?.key==="motion"){finishSlide();schedule()}});
 new MutationObserver(schedule).observe(home,{attributes:true,attributeFilter:["hidden"]});
 updatePause();
 const newsList=document.getElementById("news-list");
 const newsArchive=document.getElementById("news-archive");
 const newsEntries=[...newsList.querySelectorAll(".news-entry"),...newsArchive.content.querySelectorAll(".news-entry")];
 const filters=[...document.querySelectorAll("[data-news-filter]")];
 const pagination=document.getElementById("news-pagination"),more=document.getElementById("news-load-more"),pageCount=document.getElementById("news-pagination-count");
 const batchSize=10;let newsCategory="all",displayLimit=batchSize;
 function matchingNews(){return newsEntries.filter(article=>newsCategory==="all"||article.dataset.newsCategory===newsCategory)}
 function renderNews(){
  const matching=matchingNews(),visible=matching.slice(0,displayLimit);
  // Keep existing nodes, handlers and expanded article state; mount only the current batch.
  const wanted=new Set(visible);
  for(const article of [...newsList.children])if(!wanted.has(article))article.remove();
  for(const [i,article] of visible.entries())if(newsList.children[i]!==article)newsList.insertBefore(article,newsList.children[i]||null);
  filters.forEach(b=>{const active=b.dataset.newsFilter===newsCategory;b.classList.toggle("is-active",active);b.setAttribute("aria-pressed",String(active))});
  document.getElementById("news-filter-status").hidden=matching.length!==0;
  pagination.hidden=matching.length===0;
  pageCount.textContent="Showing "+visible.length+" of "+matching.length+" news entries";
  more.hidden=visible.length>=matching.length;
 }
 function filterNews(category){
  newsCategory=filters.some(b=>b.dataset.newsFilter===category)?category:"all";
  displayLimit=batchSize;renderNews();
 }
 more.addEventListener("click",()=>{
  const next=matchingNews()[displayLimit];displayLimit+=batchSize;renderNews();
  if(more.hidden&&next){next.tabIndex=-1;next.focus({preventScroll:true})}
 });
 filters.forEach(b=>b.addEventListener("click",()=>filterNews(b.dataset.newsFilter)));
 newsEntries.forEach(article=>article.querySelectorAll("[data-news-tag]").forEach(b=>b.addEventListener("click",()=>filterNews(b.dataset.newsTag))));
 document.querySelectorAll('#page-home [data-go="news"]').forEach(b=>b.addEventListener("click",()=>filterNews("all")));
 renderNews();
 function toggleArticle(id,open){
  const b=document.querySelector('[data-news-toggle="'+id+'"]'),body=document.getElementById("article-"+id);
  if(!b||!body)return;body.hidden=!open;b.setAttribute("aria-expanded",String(open));b.textContent=open?"Show less ↑":"Read more →";
 }
 function openArticle(id){
  filterNews("all");
  const index=newsEntries.findIndex(article=>article.id==="news-"+id);
  if(index>=displayLimit){displayLimit=Math.ceil((index+1)/batchSize)*batchSize;renderNews()}
  document.querySelector('.main-nav [data-page="news"]').click();
  toggleArticle(id,true);requestAnimationFrame(()=>document.getElementById("news-"+id)?.scrollIntoView({block:"start",behavior:"smooth"}));
 }
 document.querySelectorAll("[data-news-open]").forEach(b=>b.onclick=()=>openArticle(b.dataset.newsOpen));
 newsEntries.forEach(article=>article.querySelectorAll("[data-news-toggle]").forEach(b=>b.onclick=()=>toggleArticle(b.dataset.newsToggle,b.getAttribute("aria-expanded")!=="true")));
 // Swipe the news card without interfering with vertical page scrolling or taps.
 function swipeDirection(dx,dy){return Math.abs(dx)>=45&&Math.abs(dx)>Math.abs(dy)*1.35?(dx<0?1:-1):0}
 card.addEventListener("touchstart",event=>{
  suppressClickUntil=0;
  if(event.touches.length!==1){gesture=null;schedule();return}
  const t=event.touches[0];gesture={id:t.identifier,x:t.clientX,y:t.clientY};schedule();
 },{passive:true});
 card.addEventListener("touchmove",event=>{
  if(!gesture||event.touches.length!==1)return;
  const t=event.touches[0];if(t.identifier!==gesture.id)return;
  const dx=t.clientX-gesture.x,dy=t.clientY-gesture.y;
  if(Math.abs(dx)>12&&Math.abs(dx)>Math.abs(dy)*1.35&&event.cancelable)event.preventDefault();
 },{passive:false});
 card.addEventListener("touchend",event=>{
  if(!gesture)return;
  const t=Array.from(event.changedTouches).find(t=>t.identifier===gesture.id);if(!t)return;
  const direction=swipeDirection(t.clientX-gesture.x,t.clientY-gesture.y);gesture=null;
  if(direction){
   if(event.cancelable)event.preventDefault();
   suppressClickUntil=Date.now()+700;
   showFeatured((index+direction+items.length)%items.length,true,direction);
  }
  schedule();
 },{passive:false});
 card.addEventListener("touchcancel",()=>{gesture=null;schedule()},{passive:true});
 card.onclick=event=>{if(event.detail!==0&&Date.now()<suppressClickUntil){event.preventDefault();return}openArticle(items[index].id)};
 showFeatured(0);schedule();
});
