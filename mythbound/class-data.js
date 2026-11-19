/* Class catalogue, skill icons and scene configuration. No rendering or side effects. */
(()=>{
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

const statLabels=["Damage","Defense","Support","Mobility","Control"];
const statDescriptions=[
 "How much physical or magical damage a class can deal.",
 "How well a class can withstand attacks and survive incoming damage.",
 "How effectively a class can heal, protect or empower its allies.",
 "How easily a class can move, reposition and evade attacks.",
 "How effectively a class can restrict, disrupt or manipulate enemies."
];

// Add approved specialization content here, grouped by class and path number.
// Each entry may provide name, description, icon, skills (same format as DATA), and signatureMoves.
const SPECIALIZATIONS={
 saint:{
  1:{name:"Archsaint",type:"TRUE PATH",advancement:{quest:"When Heaven Answers",from:"Saint"},artwork:{male:"../ArchsaintMalePortrait.png",female:"../ArchsaintFemalePortrait.png"},
   stats:[4,2,5,4,3],difficulty:4,play:"RANGED · OFFENSIVE SUPPORT / AERIAL CASTER",roles:[["ranged","Ranged"],["healer","Offensive support / aerial healer"]],
   overviewType:"SUPPORT · AERIAL CASTER",overviewDescription:"Chosen by the heavens, Archsaints wield holy magic without a staff, taking flight to strike enemies, heal allies and restore the fallen.",
   description:"Having been chosen by the heavens, Archsaints transcend mortal spellcasting. Channel divine power through your own body, manifest celestial weapons and perform restorative miracles. Magical attack strengthens both damage and healing, at the cost of the Saint's defensive resilience.",
   skills:[
    ["➶","Heaven's Arbiter","Ranged · Piercing","28 m","220% MAG damage","10 sec","Manifest a celestial bow and fire an arrow of concentrated divine energy that pierces enemies in its path."],
    ["✷","Divine Radiance","Area control · Blind","8 m radius","100% MAG damage + 3 sec blind","18 sec","Release an overwhelming burst of heavenly light, damaging nearby enemies and temporarily blinding them."],
    ["✧","Grace of Heaven","Healing · Single target","26 m","Heal 220% MAG","8 sec","Bestow divine grace upon an injured party member. Healing scales with your magical attack rather than Wisdom."],
    ["✥","Heaven's Mercy","Resurrection · Signature","12 m radius","Revive allies · 80–20% HP (1–5 allies)","120 sec","Resurrect defeated party members within range. Every revived ally receives the same HP percentage, which decreases as more allies share the miracle. Choose your position carefully."]
   ],
   mechanics:[
    {icon:"✦",name:"Divine Projection",type:"BASIC ATTACK · WEAPONLESS CASTING",description:"Cast magic directly through your hands. Launch blasts of concentrated holy energy without a staff; basic attacks scale with MAG. Celestial weapons are manifestations of magic, not equipped weapons."},
    {icon:"✧",name:"Celestial Power",type:"SCALING · OFFENSIVE SUPPORT",description:"Invest in magical attack (MAG) to strengthen both offensive spells and healing. Unlike the defensive base Saint, Archsaints sacrifice durability for power and mobility."},
    {icon:"⌁",name:"Heavenly Wings",type:"INHERENT ABILITY · FLIGHT",description:"Fly freely to evade ground-bound melee and certain hazards, but remain exposed to flying enemies and anti-air attacks. Injuries reduce flight speed and maximum altitude.",table:{headers:["Remaining HP","Flight speed","Max. altitude"],rows:[["76–100%","100%","100%"],["51–75%","85%","80%"],["26–50%","65%","50%"],["1–25%","40%","Near ground"]]}},
    {icon:"✥",name:"A Shared Miracle",type:"HEAVEN'S MERCY · RESURRECTION",description:"Divine energy is divided among all defeated party members revived in a single cast. Concentrate the miracle on one ally or save a larger group at reduced health. Positioning and follow-up healing are essential.",table:{headers:["Allies revived","HP per ally"],rows:[["1","80%"],["2","60%"],["3","40%"],["4","25%"],["5","20%"]]},note:"Illustrative scaling for up to five revived allies; larger groups are not yet balanced."}
   ],signatureMoves:[]},
  2:{name:"Fallen Saint",type:"CORRUPTED PATH",advancement:{quest:"When Heaven Remains Silent",from:"Saint"},artwork:{male:"../FallenSaintMalePortrait.png?v=5751506f",female:"../FallenSaintFemalePortrait.png?v=23b20526"},
   stats:[3,4,4,2,5],difficulty:4,play:"RANGED · BLOOD MAGIC / CONTROLLER",roles:[["ranged","Ranged"],["healer","Blood magic / control support"]],
   overviewType:"SUPPORT · BLOOD WEAVER",overviewDescription:"Forsaken by the heavens, Fallen Saints wield the Blood Moon's forbidden magic to mend allies, drain vitality and bend enemies to their will.",
   description:"Feeling betrayed by the Holy Spirit, the Fallen Saints sought answers at the Blood Moonshrine. The Blood Moon answered: in exchange for their blood and souls, its forbidden power flowed into them. Now they weave blood into dark magic, restoring companions through sacrifice and turning the life force of their enemies against them.",
   skills:[
    ["❄","Blood Stillness","Control · Immobilize","20 m","Immobilize and disable · 3 sec","18 sec","Seize the blood flowing through an enemy's body, freezing them in place and briefly preventing them from acting. This is blood manipulation, not ice magic."],
    ["✚","Crimson Covenant","Healing · Single target","24 m","Spend 10% max HP · Heal 150% of HP spent","10 sec","Offer your own blood to restore an injured ally. The sacrifice cannot defeat the caster; sufficient HP is required. This magic cannot revive defeated companions."],
    ["◈","Sanguine Harvest","Ranged · Life drain","20 m","160% MAG damage · Heal 50% of damage dealt","12 sec","Draw blood and vitality from an enemy to replenish your own health. Healing depends on the damage actually dealt."],
    ["✦","Marionette","Signature · Domination","22 m","Control 1–3 foes · 15/10/6 sec","90 sec","Bind up to three eligible enemies to your will and make them attack their own kind. The more enemies you control, the shorter the effect lasts. When released, they retaliate by targeting you."]
   ],
   mechanics:[
    {icon:"☾",name:"The Blood Moon's Pact",type:"ORIGIN · FORBIDDEN BLOOD MAGIC",description:"At the Blood Moonshrine, the Fallen Saint traded blood and soul for an answer the heavens refused to give. Their ranged blood magic manipulates living enemies and channels vitality into restorative spells. Unlike a Saint, they have no resurrection ability."},
    {icon:"✚",name:"The Price of Mercy",type:"HEALING · VITALITY EXCHANGE",description:"Crimson Covenant exchanges a portion of the Fallen Saint's own HP for an ally's recovery. Sanguine Harvest replenishes the caster by damaging enemies. Balance self-sacrifice and life drain to keep both yourself and your party alive.",table:{headers:["Ability","HP exchange"],rows:[["Crimson Covenant","Spend 10% max HP; ally receives 150% of HP spent"],["Sanguine Harvest","Recover 50% of damage dealt"]]},note:"The blood sacrifice requires enough HP to survive. These values are preliminary."},
    {icon:"✦",name:"Threads of Dominion",type:"MARIONETTE · ENEMY CONTROL",description:"Select up to three eligible enemies at once. All selected enemies turn against their own kind for the same duration; spreading your control across multiple enemies shortens the effect for each one. Dominate a powerful foe for longer, or seize a group to disrupt the battlefield.",table:{headers:["Enemies controlled","Duration per enemy"],rows:[["1","15 seconds"],["2","10 seconds"],["3","6 seconds"]]},note:"Proposed balance: ordinary enemies and eligible elites can be controlled; boss immunity and resistance are not yet finalized."},
    {icon:"◇",name:"The Price of Dominion",type:"MARIONETTE · RETALIATION",description:"When the binding breaks, surviving controlled enemies immediately turn their attention toward the Fallen Saint, seeking revenge. Controlling a larger group means more enemies may retaliate at once. Coordinate with your tank, prepare an escape or reserve defensive support before the spell expires."}
   ],signatureMoves:[]},
  3:{name:"Coming soon",type:"UNREVEALED PATH",artwork:{male:"../ComingSoonSaintMalePortrait.png",female:"../ComingSoonSaintFemalePortrait.png"},description:"A new path awaits those who dare to question their sacred calling. More will be revealed in a future chronicle.",skills:[],signatureMoves:[]}
 }
};

// Shared ability inspector. A path may supply media keyed by the exact entry name:
// media: {"Marionette": {video:"../video.mp4",poster:"../poster.png"}}
const SKILL_ART={
 "Gentle Benediction":'<path d="M32 9v46M9 32h46M18 18l28 28M46 18L18 46"/><path class="ink" d="M32 18l5 9 9 5-9 5-5 9-5-9-9-5 9-5Z"/><circle cx="32" cy="32" r="4" />',
 "Hallowed Veil":'<path class="ink" d="M32 9 51 17v16c0 12-11 20-19 24-8-4-19-12-19-24V17Z"/><path d="M32 17v29M22 29h20"/><ellipse cx="32" cy="14" rx="15" ry="5"/>',
 "Judgment Ray":'<path d="m12 51 36-36M21 51l30-30M12 42l30-30"/><path class="ink" d="m46 5 3 9 10 4-10 3-3 10-4-10-9-3 9-4Z"/><path d="M10 54h16"/>',
 "Merciful Heart":'<path class="ink" d="M32 52 12 33C-2 18 22 7 32 23 42 7 66 18 52 33Z"/><path d="M32 27v15m-8-7h16"/>',
 "Divine Projection":'<path d="M8 48 23 34l8 2 7-4m-22 17 10-7 12 1 10-10M15 38l-7 7"/><path class="ink" d="m43 7 4 12 12 4-12 4-4 12-4-12-12-4 12-4Z"/><path d="m22 12 3 6m-12 5 8 2"/>',
 "Celestial Power":'<circle cx="32" cy="32" r="21"/><path class="ink" d="m32 5 6 20 21 7-21 6-6 21-6-21-21-6 21-7Z"/><path d="m17 17 4 4m22 22 4 4m0-30-4 4M21 43l-4 4"/>',
 "Heavenly Wings":'<path class="ink" d="M30 49C13 43 8 26 6 9c11 13 23 11 24 30Zm4 0C51 43 56 26 58 9 47 22 35 20 34 39Z"/><path d="m10 23 16 17m-11-6 13 12m26-23L38 40m11-6L36 46M32 45v12"/>',
 "Heaven's Arbiter":'<path d="M14 10Q57 11 54 50L14 10m0 0 2 42 38-2M10 54 53 11"/><path class="ink" d="m51 5 8 0 0 8-7-3-4 4-4-4 4-4Z"/><path d="m10 45 2 7 7 2"/>',
 "Divine Radiance":'<circle class="ink" cx="32" cy="32" r="11"/><path d="M32 4v12m0 32v12M4 32h12m32 0h12M12 12l9 9m22 22 9 9m0-40-9 9M21 43l-9 9"/><circle cx="32" cy="32" r="4"/>',
 "Grace of Heaven":'<path class="ink" d="M47 7C23 9 10 28 15 46 34 46 53 25 47 7Z"/><path d="M12 56 44 13M22 42l-1-13m9 4V20m-4 18 14-4m-8-7 13-6"/><path d="M52 39v14m-7-7h14"/>',
 "Heaven's Mercy":'<path d="M32 7v37m-9-10 9-11 9 11M11 49h42M18 55h28"/><path class="ink" d="M27 43C10 41 5 23 8 15c9 12 17 10 19 28Zm10 0c17-2 22-20 19-28-9 12-17 10-19 28Z"/><path d="m12 29 12 10m28-10L40 39"/><ellipse cx="32" cy="12" rx="10" ry="4"/>',
 "The Blood Moon's Pact":'<path class="ink" d="M44 9C13-2 1 36 21 51c14 10 31 1 34-11C29 52 16 23 44 9Z"/><path d="M44 16v16m-8-8h16"/><path class="ink" d="M42 38q-11 13 0 16 11-3 0-16Z"/>',
 "The Price of Mercy":'<path class="ink" d="M32 5C26 18 13 29 13 41a19 19 0 0 0 38 0C51 29 38 18 32 5Z"/><path d="M32 26v21m-10-10h20"/>',
 "Blood Stillness":'<path d="M32 9v46M12 20l40 24m0-24L12 44"/><path class="ink" d="M32 22q-17 15 0 21 17-6 0-21Z"/><path d="M25 9h14M25 55h14M8 26l8-12m32 36 8-12M8 38l8 12m32-36 8 12"/>',
 "Crimson Covenant":'<path class="ink" d="M32 9Q18 24 18 31a14 14 0 0 0 28 0Q46 24 32 9Z"/><path d="M6 42q9-5 17 4l9 7 9-7q8-9 17-4M6 49l10 5m42-5-10 5M32 23v17m-8-8h16"/>',
 "Sanguine Harvest":'<path d="M12 19q18-16 38 0l-8 2m8-2-3-8M52 45q-18 16-38 0l8-2m-8 2 3 8"/><path class="ink" d="M32 12Q16 30 16 38a16 16 0 0 0 32 0Q48 30 32 12Z"/><path d="M24 39q2 8 10 8"/>',
 "Marionette":'<path d="M9 9h46M32 5v9M13 10l9 24M51 10l-9 24M32 10v14"/><circle class="ink" cx="32" cy="30" r="6"/><path d="m22 34 10 9 10-9M32 36v11m-9 10 9-10 9 10"/><path class="ink" d="M32 3 36 9 32 15 28 9Z"/>'
};

const SAINT_PATH_ART={1:{name:"Archsaint",emblem:"◇"},2:{name:"FallenSaint",emblem:"✧"}};

const SAINT_SCENES={
 1:{id:"heavenly",src:"../HeavenlyRealmBackground.png"},
 2:{id:"bloodmoon",src:"../BloodMoonshrineBackground.png"},
 3:{id:"judgment",src:"../HallOfJudgmentGrayscaleBackground.png"}
};

const ROLE_ICONS={
 melee:'<path d="m5 19 3-3m-4-2 6 6M8 16 20 4l-2 7L10 19M4 4l5 1 4 4"/>',
 ranged:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 2v4m0 12v4M2 12h4m12 0h4"/>',
 tank:'<path d="M12 3 20 6v6c0 5-8 9-8 9s-8-4-8-9V6z"/>',
 healer:'<path d="M9 4h6v5h5v6h-5v5H9v-5H4V9h5z"/>',
 hybrid:'<path d="M3 7h17l-4-4m4 14H3l4 4M20 7l-4 4M3 17l4-4"/>',
 beast:'<path d="M5 4 8 9l4-2 4 2 3-5 1 10-8 7-8-7zM8 13h1m6 0h1m-6 4h4"/>',
 mounted:'<path d="M5 20v-6l4-5 1-6 4 3 4 1 3 6-4 3-4-3-3 7zM15 10h1"/>',
 companion:'<path d="M7 15c1-3 3-5 5-5s4 2 5 5c2 4-2 6-5 4-3 2-7 0-5-4z"/><circle cx="5" cy="9" r="2"/><circle cx="10" cy="5" r="2"/><circle cx="15" cy="5" r="2"/><circle cx="19" cy="9" r="2"/>',
 magic:'<path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5z"/>',
 duelist:'<path d="m4 20 4-4m-4-3 7 7m-3-4L20 3l-2 8-8 7"/>'
};
const CLASS_ROLES={breaker:[["melee","Melee"],["tank","Tank / brawler"]],animar:[["hybrid","Hybrid"],["beast","Shapeshifter / expert"]],herder:[["mounted","Mounted"],["companion","Companion support"]],elemis:[["ranged","Range"],["magic","Elemental magic"]],strider:[["melee","Melee"],["duelist","Precision duelist"]],saint:[["ranged","Range"],["healer","Healer"]]};
window.MythboundCodexData={DATA,statLabels,statDescriptions,SPECIALIZATIONS,SKILL_ART,SAINT_PATH_ART,SAINT_SCENES,ROLE_ICONS,CLASS_ROLES};
})();
