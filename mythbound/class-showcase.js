/* Mythbound class codex: concept stats, not final balance. */
(() => {
"use strict";
const DATA={
breaker:{color:"#de9779",stats:[4,5,2,2,3],difficulty:2,play:"MELEE · TANK / BRAWLER",skills:[
["✊","Iron Palm","Melee","2.5 m","160% ATK damage","6 sec","Strike a foe and briefly stagger them."],
["◇","Unbroken Stance","Defense","Self","35% damage reduction","18 sec","Brace for impact for 4 seconds."],
["➶","Shoulder Break","Melee dash","4 m","125% ATK damage","12 sec","Charge forward and interrupt the first enemy struck."],
["✦","Fighting Spirit","Passive","Self","+12% guard","Passive","Blocking a powerful hit improves your guard."]]},
animar:{color:"#85c4b2",stats:[4,4,4,4,3],difficulty:5,play:"HYBRID · SHAPESHIFTER / EXPERT",skills:[
["◈","Beast Shift","Stance","Self","Change form","8 sec","Switch between protective and offensive animal forms."],
["✦","Feral Rend","Melee","3 m","145% ATK damage","7 sec","Slash a foe with a beast-form claw."],
["❖","Wild Echo","Support","18 m","Heal 120% WIS","14 sec","Channel restorative energy to an ally."],
["⌁","Instinct","Passive","Self","+8% speed","Passive","Gain movement speed after transforming."]]},
herder:{color:"#c3cf95",stats:[2,3,5,3,4],difficulty:3,play:"MOUNTED · COMPANION SUPPORT",skills:[
["♧","Call the Flock","Summon","20 m","Summon 2 sheep","18 sec","Summon protective sheep to intercept attacks."],
["❃","Woolguard","Shield","22 m","Shield 170% WIS","12 sec","Wrap an ally in a protective woolen ward."],
["➵","Shepherd's Signal","Area support","12 m","+15% defense","22 sec","Command companions to bolster nearby allies."],
["✧","Kindred Bond","Passive","Companions","+10% endurance","Passive","Strengthen the resilience of your summons."]]},
elemis:{color:"#adc4ef",stats:[5,2,3,5,4],difficulty:4,play:"RANGED · ELEMENTAL MAGIC",skills:[
["✳","Primal Spark","Ranged","24 m","155% MAG damage","5 sec","Launch concentrated elemental magic."],
["≈","Tide Snare","Area","18 m","90% MAG + slow","14 sec","A small wave slows enemies."],
["✦","Zephyr Step","Movement","Self","Dash 6 m","10 sec","Fly on a quick gust of wind."],
["◌","Elemental Accord","Passive","Self","+8% magic","Passive","Alternating elements strengthens the next cast."]]},
strider:{color:"#c3afe3",stats:[5,2,1,5,4],difficulty:4,play:"MELEE · PRECISION DUELIST",skills:[
["⚔","Twin Arc","Melee","3 m","2 × 100% ATK","5 sec","Two fluid sword strikes."],
["➳","Passing Step","Movement","7 m","70% ATK + evade","11 sec","Dash through a foe while briefly evading."],
["✧","Opening Cut","Melee","3 m","175% ATK damage","14 sec","Strike an exposed target."],
["◇","Duelist's Eye","Passive","Self","+9% precision","Passive","Gain precision against isolated enemies."]]},
saint:{color:"#f3d5a5",stats:[2,4,5,2,3],difficulty:2,play:"RANGED · HEALER / PROTECTOR",skills:[
["✥","Gentle Benediction","Healing","24 m","Heal 190% WIS","6 sec","Restore an injured ally with holy light."],
["✧","Hallowed Veil","Shield","22 m","Shield 140% WIS","12 sec","Protect an ally with a short-lived halo."],
["✦","Judgment Ray","Ranged","20 m","125% MAG damage","9 sec","Send a beam of sacred light at an enemy."],
["♢","Merciful Heart","Passive","Party","+10% emergency heals","Passive","Blessings are stronger on critically wounded allies."]]}
};
const $=id=>document.getElementById(id);
const stats=$("class-stats"),skills=$("class-skills"),detail=$("skill-detail"),preview=$("class-preview");
if(!stats||!skills||!detail||!preview)return;
const statLabels=["Damage","Defense","Support","Mobility","Control"];
let active="saint",gender="female",chosen=0;

function avatarArt(){
 const c=DATA[active],male=gender==="male",size=male?44:37;
 const skin="#e6c5ae",hair=c.color;
 const hairShape=male?"M151 115Q130 52 190 60Q243 62 231 120L207 91L151 115Z":"M145 117Q133 53 190 58Q256 58 231 133Q253 190 255 237Q205 209 207 119Q174 151 126 225Z";
 const lower=active==="elemis"?"<path d='M160 280q-30 27 20 44l35-27M218 276q22 36-14 52' fill='none' stroke='"+hair+"' stroke-width='20' stroke-linecap='round'/>":"<path d='M162 275l-18 99M217 275l20 99' fill='none' stroke='"+hair+"' stroke-width='22' stroke-linecap='round'/>";
 const wings=active==="elemis"?"<path d='M164 173Q45 9 74 131Q96 181 161 202M225 175Q343 11 305 135Q287 180 231 205' fill='#9dcbd5' fill-opacity='.37' stroke='#abc9ee' stroke-width='4'/>":"";
 const sheep=active==="herder"?"<ellipse cx='190' cy='299' rx='112' ry='67' fill='#d6d6c4' stroke='#87928b' stroke-width='5'/><circle cx='108' cy='271' r='34' fill='#e9e7d4'/><path d='M86 245q-29-20-27 10M129 245q30-18 24 11' fill='none' stroke='#a79b72' stroke-width='8'/>":"";
 const aura=active==="saint"?"<circle cx='190' cy='77' r='53' fill='none' stroke='#eddaac' stroke-width='3' stroke-dasharray='14 6'/>":"";
 const fists=active==="breaker"?"<circle cx='113' cy='260' r='24' fill='#985566'/><circle cx='271' cy='259' r='24' fill='#985566'/>":"";
 const blade=active==="strider"?"<path d='M275 62L183 320' fill='none' stroke='#c8d6e5' stroke-width='9'/>":"";
 const tail=active==="animar"?"<path d='M133 260Q47 230 71 153' fill='none' stroke='#8ab6a5' stroke-width='23' stroke-linecap='round'/>":"";
 const dress=active==="saint"?"<path d='M143 257Q104 313 119 365Q191 384 265 359Q263 302 235 260Z' fill='#d9d5d7' stroke='#f5deb7' stroke-width='4'/>":"";
 return "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 380 420' role='img' aria-label='"+gender+" "+active+" concept avatar'><circle cx='190' cy='218' r='167' fill='none' stroke='"+c.color+"' opacity='.35' stroke-dasharray='3 9'/>"+aura+wings+sheep+tail+lower+dress+blade+"<path d='M146 170Q189 143 232 168L247 276Q180 294 132 269Z' fill='"+c.color+"' stroke='#e3e0dc' stroke-width='4'/><path d='M147 176l-32 79M229 176l41 74' fill='none' stroke='"+c.color+"' stroke-width='20' stroke-linecap='round'/>"+fists+"<circle cx='189' cy='110' r='"+size+"' fill='"+skin+"' stroke='#f6dec8' stroke-width='4'/><path d='"+hairShape+"' fill='"+hair+"' stroke='#688295' stroke-width='4'/><path d='M172 119h9m19 0h9' stroke='#635b5b' stroke-width='3' stroke-linecap='round'/><path d='M184 139q7 4 13-1' fill='none' stroke='#936c70' stroke-width='2'/></svg>";
}
function renderPreview(){
 preview.innerHTML=avatarArt();
 preview.style.setProperty("--preview-accent",DATA[active].color);
 preview.setAttribute("aria-label",gender+" "+active+" concept preview");
 $("preview-caption").textContent=gender.toUpperCase()+" · DEFAULT FORM";
 document.querySelectorAll(".gender-option").forEach(b=>{
  const on=b.dataset.gender===gender;
  b.classList.toggle("is-active",on);
  b.setAttribute("aria-pressed",String(on));
 });
}
function renderStats(){
 stats.replaceChildren();
 DATA[active].stats.forEach((value,i)=>{
  const row=document.createElement("div");row.className="class-stat";
  const name=document.createElement("span");name.textContent=statLabels[i];
  const track=document.createElement("div");track.className="stat-track";
  track.setAttribute("role","meter");
  track.setAttribute("aria-label",statLabels[i]);
  track.setAttribute("aria-valuemin","1");track.setAttribute("aria-valuemax","5");track.setAttribute("aria-valuenow",String(value));
  const fill=document.createElement("div");fill.className="stat-fill";fill.style.width=value*20+"%";
  const n=document.createElement("strong");n.textContent=value+" / 5";
  track.append(fill);row.append(name,track,n);stats.append(row);
 });
}
function skillDetail(){
 const s=DATA[active].skills[chosen];
 detail.replaceChildren();
 const head=document.createElement("div");head.className="skill-detail-head";
 const title=document.createElement("strong");title.textContent=s[1];
 const tag=document.createElement("span");tag.textContent=s[2];head.append(title,tag);
 const desc=document.createElement("p");desc.textContent=s[6];
 const grid=document.createElement("div");grid.className="skill-data";
 [["Range",s[3]],["Effect",s[4]],["Cooldown",s[5]]].forEach(([k,v])=>{
  const cell=document.createElement("div"),small=document.createElement("span"),strong=document.createElement("strong");
  small.textContent=k;strong.textContent=v;cell.append(small,strong);grid.append(cell);
 });
 detail.append(head,desc,grid);
}
function renderSkills(){
 skills.replaceChildren();
 DATA[active].skills.forEach((s,i)=>{
  const btn=document.createElement("button");btn.type="button";btn.className="skill-icon"+(i===chosen?" is-current":"");
  btn.setAttribute("aria-label","Inspect "+s[1]);btn.setAttribute("aria-pressed",String(i===chosen));btn.title=s[1];
  const glyph=document.createElement("span");glyph.className="skill-symbol";glyph.textContent=s[0];
  const n=document.createElement("span");n.textContent="0"+(i+1);
  btn.append(glyph,n);btn.addEventListener("click",()=>{chosen=i;renderSkills()});skills.append(btn);
 });
 skillDetail();
}
function draw(){
 const d=DATA[active];
 $("class-index").textContent=String(Object.keys(DATA).indexOf(active)+1).padStart(2,"0")+" / 06";
 $("class-combat").textContent=d.play;
 $("class-difficulty").textContent="DIFFICULTY · "+d.difficulty+" / 5";
 $("class-details").style.setProperty("--class-highlight",d.color);
 renderStats();renderSkills();renderPreview();
}
document.querySelectorAll("[data-class]").forEach(button=>{
 button.addEventListener("click",()=>{
  if(!DATA[button.dataset.class])return;
  active=button.dataset.class;chosen=0;gender="female";draw();
 });
});
document.querySelectorAll(".gender-option").forEach(button=>button.addEventListener("click",()=>{
 gender=button.dataset.gender;renderPreview();
}));
draw();
})();