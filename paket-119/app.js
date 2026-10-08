const STORAGE="paket119.data";
const BACKUP_STORAGE="paket119.data.backup";
const LEGACY_STORAGE_KEYS=[
  "paket119.inbox.v4",
  "paket119.inbox.v3",
  "paket119.inbox.v2",
  "paket119.live.v1",
  "paket119.parcels.v1",
  "paket119.v1"
];
const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
let filter="open";
let searchQuery="";
let ocrFound=[];
let parcels=[];
let deletedNumbers=new Set();
let widgetPromise=null;
let trackObserver=null;
const expandedTrackers=new Set();

const CARRIERS={
  dhl:{name:"DHL Paket",code:7041,country:"DE"},
  dhlExpress:{name:"DHL Express",code:100001,country:"EU"},
  dpdDe:{name:"DPD",code:100007,country:"DE"},
  dpdAt:{name:"DPD",code:100556,country:"AT"},
  dpdFr:{name:"DPD",code:100072,country:"FR"},
  gls:{name:"GLS",code:100005,country:"EU"},
  glsDe:{name:"GLS",code:101070,country:"DE"},
  glsIt:{name:"GLS",code:100024,country:"IT"},
  glsFr:{name:"GLS",code:101272,country:"FR"},
  hermes:{name:"Hermes",code:100018,country:"EU"},
  hermesDe:{name:"Hermes",code:100031,country:"DE"},
  mondial:{name:"Mondial Relay",code:100304,country:"FR"},
  chrono:{name:"Chronopost",code:100273,country:"FR"},
  colissimo:{name:"Colissimo / La Poste",code:6051,country:"FR"},
  vintedGo:{name:"Vinted Go",code:101020,country:"FR"},
  posteIt:{name:"Poste Italiane",code:9071,country:"IT",direct:"posteIt"},
  inpostIt:{name:"InPost",code:100469,country:"IT"},
  brt:{name:"BRT / Bartolini",code:100026,country:"IT"},
  postAt:{name:"Österreichische Post",code:1161,country:"AT"},
  ups:{name:"UPS",code:100002,country:"EU"}
};

function uid(){return crypto.randomUUID?crypto.randomUUID():String(Date.now())+Math.random().toString(16).slice(2)}
function clean(v){return String(v||"").trim().toUpperCase().replace(/[\s-]+/g,"")}
function norm(v){return String(v||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toUpperCase()}
function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]))}

function explicitCarrier(text){
  const t=norm(text);
  if(!t)return null;
  if(/VINTED\s*GO/.test(t))return {...CARRIERS.vintedGo,confidence:"high",reason:"Screenshot"};
  if(/MONDIAL\s*RELAY|MONDIALRELAY/.test(t))return {...CARRIERS.mondial,confidence:"high",reason:"Screenshot"};
  if(/CHRONOPOST/.test(t))return {...CARRIERS.chrono,confidence:"high",reason:"Screenshot"};
  if(/POSTE\s*ITALIANE/.test(t))return {...CARRIERS.posteIt,confidence:"high",reason:"Screenshot"};
  if(/\bINPOST\b/.test(t))return {...CARRIERS.inpostIt,confidence:"high",reason:"Screenshot"};
  if(/\bBRT\b|BARTOLINI/.test(t))return {...CARRIERS.brt,confidence:"high",reason:"Screenshot"};
  if(/COLISSIMO|LA\s*POSTE/.test(t))return {...CARRIERS.colissimo,confidence:"high",reason:"Screenshot"};
  if(/OSTERREICHISCHE\s*POST|AUSTRIAN\s*POST/.test(t))return {...CARRIERS.postAt,confidence:"high",reason:"Screenshot"};
  if(/DHL\s*EXPRESS/.test(t))return {...CARRIERS.dhlExpress,confidence:"high",reason:"Screenshot"};
  if(/\bDPD\b/.test(t)){
    if(/OSTERREICH|AUSTRIA|\bAT\b/.test(t))return {...CARRIERS.dpdAt,confidence:"high",reason:"Screenshot"};
    if(/FRANCE|\bFR\b/.test(t))return {...CARRIERS.dpdFr,confidence:"high",reason:"Screenshot"};
    return {...CARRIERS.dpdDe,confidence:"high",reason:"Screenshot"};
  }
  if(/\bGLS\b/.test(t)){
    if(/ITALIA|ITALY|\bIT\b/.test(t))return {...CARRIERS.glsIt,confidence:"high",reason:"Screenshot"};
    if(/FRANCE|\bFR\b/.test(t))return {...CARRIERS.glsFr,confidence:"high",reason:"Screenshot"};
    if(/DEUTSCHLAND|GERMANY|\bDE\b/.test(t))return {...CARRIERS.glsDe,confidence:"high",reason:"Screenshot"};
    return {...CARRIERS.gls,confidence:"high",reason:"Screenshot"};
  }
  if(/\bHERMES\b/.test(t)){
    if(/OSTERREICH|AUSTRIA|\bAT\b/.test(t))return {...CARRIERS.hermes,confidence:"high",reason:"Screenshot"};
    return {...CARRIERS.hermesDe,confidence:"high",reason:"Screenshot"};
  }
  if(/\bDHL\b|DEUTSCHE\s*POST/.test(t))return {...CARRIERS.dhl,confidence:"high",reason:"Screenshot"};
  if(/\bUPS\b/.test(t))return {...CARRIERS.ups,confidence:"high",reason:"Screenshot"};
  return null;
}

function carrierProfile(number,hint=""){
  const n=clean(number);
  const explicit=explicitCarrier(hint);
  if(explicit)return explicit;

  if(/^1Z[A-Z0-9]{16}$/.test(n))return {...CARRIERS.ups,confidence:"high",reason:"Nummer"};
  if(/^H\d{19}$/.test(n))return {...CARRIERS.hermesDe,confidence:"high",reason:"Nummer"};
  if(/^00340\d{15}$/.test(n))return {...CARRIERS.dhl,confidence:"high",reason:"Nummer"};
  if(/^JJD[A-Z0-9]{10,24}$/i.test(n))return {...CARRIERS.dhl,confidence:"high",reason:"Nummer"};
  if(/^[A-Z]{2}\d{9}DE$/.test(n))return {...CARRIERS.dhl,confidence:"high",reason:"Ländercode DE"};
  if(/^[A-Z]{2}\d{9}IT$/.test(n))return {...CARRIERS.posteIt,confidence:"high",reason:"Ländercode IT"};
  if(/^[A-Z]{2}\d{9}AT$/.test(n))return {...CARRIERS.postAt,confidence:"high",reason:"Ländercode AT"};
  if(/^[A-Z]{2}\d{9}FR$/.test(n))return {...CARRIERS.colissimo,confidence:"high",reason:"Ländercode FR"};
  if(/^\d{14}$/.test(n))return {name:"DPD / Hermes möglich",code:0,country:"DE",confidence:"low",reason:"Mehrdeutige Nummer – automatische Prüfung"};
  if(/^\d{11}$/.test(n))return {...CARRIERS.gls,confidence:"medium",reason:"wahrscheinliches GLS-Muster"};
  if(/^100\d{9}$/.test(n))return {...CARRIERS.vintedGo,confidence:"medium",reason:"mögliches Vinted-Go-Muster"};
  if(/^\d{8}$/.test(n))return {name:"Mondial Relay möglich",code:0,country:"",confidence:"low",reason:"Acht Ziffern sind nicht eindeutig"};
  return {name:"Carrier automatisch",code:0,country:"",confidence:"low",reason:"17TRACK Fallback"};
}

function carrierKeyFor(p){
  if(!p||!p.carrierCode)return"auto";
  for(const [key,value] of Object.entries(CARRIERS)){
    if(Number(value.code)===Number(p.carrierCode))return key;
  }
  return"auto";
}

function nativeUrl(p){
  const n=encodeURIComponent(p.number);
  switch(p.carrierCode){
    case 7041:return "https://www.dhl.de/de/privatkunden/pakete-empfangen/verfolgen.html?piececode="+n+"&lang=de";
    case 100007:return "https://my.dpd.de/redirect.aspx?action=12&parcelno="+n;
    case 100072:return "https://www.dpd.com/fr/fr/suivre-mon-colis/";
    case 100002:return "https://www.ups.com/track?loc=de_DE&tracknum="+n+"&requester=WT/";
    case 100001:return "https://www.dhl.de/de/privatkunden/dhl-sendungsverfolgung.html?piececode="+n;
    case 100304:return "https://www.mondialrelay.com/en-gb/parcel-tracking/?country=DE&ens=V1FRTODE&exp="+n+"&language=EN";
    case 101070:
    case 100005:return "https://www.gls-pakete.de/sendungsverfolgung?match="+n;
    case 101272:return "https://www.gls-france.com/";
    case 100024:return "https://www.gls-italy.com/";
    case 100031:
    case 100018:return "https://www.myhermes.de/empfangen/sendungsverfolgung/sendungsinformation/#"+n;
    case 100273:return "https://www.chronopost.fr/tracking-no-cms/suivi-page?listeNumerosLT="+n;
    case 6051:return "https://www.laposte.fr/outils/suivre-vos-envois?code="+n;
    case 101020:return "https://www.vintedgo.com/en/tracking/routes";
    case 9071:return "https://www.poste.it/cerca/index.html#/risultati-spedizioni/"+n;
    case 100469:return "https://inpost.it/it/track-parcel";
    case 100026:return "https://www.brt.it/it/tracking/";
    case 1161:return "https://www.post.at/s/sendungsdetails?snr="+n;
    case 100556:return "https://www.mydpd.at/";
    default:return "";
  }
}

function migrate(arr){
  return (Array.isArray(arr)?arr:[]).map(p=>{
    const number=clean(p.number);
    const auto=carrierProfile(number,p.carrierHint||"");
    const keepCode=Number(p.carrierCode)||0;
    const shouldUpgrade=!keepCode||!p.carrierName||/^Auto|Carrier automatisch/.test(p.carrierName)||(/^\d{8}$/.test(number)&&keepCode!==100304);
    return {
      id:p.id||uid(),
      number,
      name:p.name||"",
      carrierName:shouldUpgrade?auto.name:p.carrierName,
      carrierCode:shouldUpgrade?auto.code:keepCode,
      carrierCountry:shouldUpgrade?auto.country:(p.carrierCountry||auto.country),
      carrierConfidence:shouldUpgrade?auto.confidence:(p.carrierConfidence||auto.confidence),
      carrierReason:shouldUpgrade?auto.reason:(p.carrierReason||auto.reason),
      carrierHint:explicitCarrier(p.carrierHint||"")?.name||"",
      done:Boolean(p.done||p.status==="zugestellt"),
      liveStatus:p.liveStatus||"",
      liveStatusLabel:p.liveStatusLabel||"",
      liveStatusText:p.liveStatusText||"",
      liveCheckedAt:p.liveCheckedAt||0,
      pinned:Boolean(p.pinned),
      createdAt:p.createdAt||p.u||Date.now(),
      updatedAt:p.updatedAt||p.u||Date.now()
    };
  }).filter(p=>p.number);
}
function parseStored(raw){
  if(!raw)return{parcels:[],deletedNumbers:[],updatedAt:0};
  try{
    const value=JSON.parse(raw);
    if(Array.isArray(value))return{parcels:migrate(value),deletedNumbers:[],updatedAt:0};
    if(value&&typeof value==="object"){
      return{
        parcels:migrate(Array.isArray(value.parcels)?value.parcels:[]),
        deletedNumbers:Array.isArray(value.deletedNumbers)?value.deletedNumbers.map(clean).filter(Boolean):[],
        updatedAt:Number(value.updatedAt)||0
      };
    }
  }catch{}
  return{parcels:[],deletedNumbers:[],updatedAt:0};
}
function mergeParcelLists(lists,deleted){
  const byNumber=new Map();
  for(const list of lists){
    for(const p of migrate(list)){
      if(!p.number||deleted.has(p.number))continue;
      const old=byNumber.get(p.number);
      if(!old){byNumber.set(p.number,p);continue}
      const oldTime=Number(old.updatedAt)||0;
      const newTime=Number(p.updatedAt)||0;
      const newer=newTime>=oldTime?p:old;
      const older=newTime>=oldTime?old:p;
      byNumber.set(p.number,{
        ...older,
        ...newer,
        id:newer.id||older.id||uid(),
        name:newer.name||older.name||"",
        carrierName:newer.carrierName||older.carrierName,
        carrierCode:newer.carrierCode||older.carrierCode||0,
        carrierCountry:newer.carrierCountry||older.carrierCountry||"",
        carrierConfidence:newer.carrierConfidence||older.carrierConfidence||"low",
        carrierReason:newer.carrierReason||older.carrierReason||"",
        carrierHint:newer.carrierHint||older.carrierHint||"",
        liveStatus:newer.liveStatus||older.liveStatus||"",
        liveStatusLabel:newer.liveStatusLabel||older.liveStatusLabel||"",
        liveStatusText:newer.liveStatusText||older.liveStatusText||"",
        liveCheckedAt:Math.max(Number(newer.liveCheckedAt)||0,Number(older.liveCheckedAt)||0),
        pinned:Boolean(newer.pinned||older.pinned),
        createdAt:Math.min(Number(newer.createdAt)||Date.now(),Number(older.createdAt)||Date.now()),
        updatedAt:Math.max(oldTime,newTime)
      });
    }
  }
  return [...byNumber.values()];
}
function load(){
  const stable=parseStored(localStorage.getItem(STORAGE));
  const backup=parseStored(localStorage.getItem(BACKUP_STORAGE));
  const deleted=new Set([...stable.deletedNumbers,...backup.deletedNumbers].map(clean).filter(Boolean));
  const lists=[stable.parcels,backup.parcels];
  for(const key of LEGACY_STORAGE_KEYS){
    const parsed=parseStored(localStorage.getItem(key));
    lists.push(parsed.parcels);
  }
  const merged=mergeParcelLists(lists,deleted);
  const snapshot={schema:1,parcels:merged,deletedNumbers:[...deleted],updatedAt:Date.now()};
  try{localStorage.setItem(STORAGE,JSON.stringify(snapshot))}catch{}
  return{parcels:merged,deletedNumbers:[...deleted]};
}
const INITIAL_DATA=load();
parcels=INITIAL_DATA.parcels;
deletedNumbers=new Set(INITIAL_DATA.deletedNumbers);

function snapshot(){
  return{schema:1,parcels,deletedNumbers:[...deletedNumbers],updatedAt:Date.now()};
}
function persist(){
  const next=snapshot();
  try{
    const current=localStorage.getItem(STORAGE);
    if(current)localStorage.setItem(BACKUP_STORAGE,current);
    localStorage.setItem(STORAGE,JSON.stringify(next));
  }catch{}
  writeIndexedBackup(next).catch(()=>{});
}
function openParcelDb(){
  return new Promise((resolve,reject)=>{
    if(!("indexedDB" in window))return reject(new Error("IndexedDB unavailable"));
    const req=indexedDB.open("paket119",1);
    req.onupgradeneeded=()=>{
      const db=req.result;
      if(!db.objectStoreNames.contains("state"))db.createObjectStore("state");
    };
    req.onsuccess=()=>resolve(req.result);
    req.onerror=()=>reject(req.error);
  });
}
async function writeIndexedBackup(data){
  const db=await openParcelDb();
  await new Promise((resolve,reject)=>{
    const tx=db.transaction("state","readwrite");
    tx.objectStore("state").put(data,"latest");
    tx.oncomplete=resolve;
    tx.onerror=()=>reject(tx.error);
  });
  db.close();
}
async function readIndexedBackup(){
  const db=await openParcelDb();
  const value=await new Promise((resolve,reject)=>{
    const tx=db.transaction("state","readonly");
    const req=tx.objectStore("state").get("latest");
    req.onsuccess=()=>resolve(req.result||null);
    req.onerror=()=>reject(req.error);
  });
  db.close();
  return value;
}
async function restoreIndexedBackup(){
  try{
    const saved=await readIndexedBackup();
    if(!saved||!Array.isArray(saved.parcels))return;
    const restoredDeleted=new Set([...(saved.deletedNumbers||[]),...deletedNumbers].map(clean).filter(Boolean));
    const merged=mergeParcelLists([parcels,saved.parcels],restoredDeleted);
    const changed=merged.length!==parcels.length||merged.some((p,i)=>p.number!==parcels[i]?.number||p.updatedAt!==parcels[i]?.updatedAt);
    deletedNumbers=restoredDeleted;
    if(changed){
      parcels=merged;
      persist();
      render();
      toast("Gespeicherte Pakete wiederhergestellt");
    }else{
      writeIndexedBackup(snapshot()).catch(()=>{});
    }
  }catch{}
}
function toast(s){const e=document.createElement("div");e.className="toast";e.textContent=s;document.body.append(e);setTimeout(()=>e.remove(),1800)}
function hostId(p){return"trk_"+String(p.id).replace(/[^a-zA-Z0-9_-]/g,"_")}
function filtered(){
  let q=[...parcels].sort((a,b)=>(Number(b.pinned)-Number(a.pinned))||((b.updatedAt||0)-(a.updatedAt||0)));
  if(filter==="open")q=q.filter(p=>!p.done);
  if(filter==="done")q=q.filter(p=>p.done);
  const needle=norm(searchQuery).replace(/\s+/g,"");
  if(needle)q=q.filter(p=>{
    const hay=norm([p.name,p.number,p.carrierName,p.carrierCountry].filter(Boolean).join(" ")).replace(/\s+/g,"");
    return hay.includes(needle);
  });
  return q;
}

function ensureWidget(){
  if(window.YQV5&&typeof window.YQV5.trackSingle==="function")return Promise.resolve(window.YQV5);
  if(widgetPromise)return widgetPromise;
  widgetPromise=new Promise((resolve,reject)=>{
    let waited=0;
    const poll=setInterval(()=>{
      waited+=50;
      if(window.YQV5&&typeof window.YQV5.trackSingle==="function"){
        clearInterval(poll);resolve(window.YQV5);
      }else if(waited>=8000){
        clearInterval(poll);
        const existing=document.querySelector('script[data-paket119-17track],script[src*="externalcall.js"]');
        if(!existing){
          const s=document.createElement("script");
          s.src="https://www.17track.net/externalcall.js";
          s.async=true;
          s.dataset.paket11917track="1";
          s.onload=()=>window.YQV5?resolve(window.YQV5):reject(new Error("17TRACK nicht verfügbar"));
          s.onerror=()=>reject(new Error("17TRACK konnte nicht geladen werden"));
          document.head.appendChild(s);
        }else reject(new Error("17TRACK lädt ungewöhnlich lange"));
      }
    },50);
  });
  return widgetPromise;
}

function directPosteItaliane(p,box){
  const url=nativeUrl(p);
  if(!url)throw new Error("Kein direkter Tracking-Link");
  box.innerHTML='<iframe class="nativeTracker" title="'+esc(p.carrierName)+' Tracking" loading="eager" referrerpolicy="no-referrer" src="'+esc(url)+'"></iframe>';
}

function mondialStage(text){
  const t=String(text||"").toLowerCase();
  if(/delivered parcel|parcel delivered to recipient/.test(t))return{key:"zugestellt",label:"Zugestellt"};
  if(/point relais|pickup point/.test(t))return{key:"abholung",label:"Abholbereit"};
  if(/delivery agency|distribution|sorting|agency/.test(t))return{key:"zentrum",label:"Im Verteilzentrum"};
  if(/delivered to mondial relay|shipped|taken over|in transit/.test(t))return{key:"unterwegs",label:"Unterwegs"};
  if(/preparation|sender/.test(t))return{key:"angekündigt",label:"Vorbereitet"};
  return{key:"unterwegs",label:text||"Unterwegs"};
}

async function mountMondialRelay(p,box){
  const target=nativeUrl(p);
  const proxy="https://api.allorigins.win/raw?url="+encodeURIComponent(target)+"&ts="+Date.now();
  box.innerHTML='<div class="trackerLoading">Mondial Relay wird direkt abgefragt …</div>';
  try{
    const r=await fetch(proxy,{cache:"no-store"});
    if(!r.ok)throw new Error("Mondial Relay antwortet gerade nicht");
    const html=await r.text();
    const doc=new DOMParser().parseFromString(html,"text/html");
    const known=[
      /parcel in preparation at the sender/i,
      /parcel delivered to mondial relay/i,
      /parcel available in the delivery agency/i,
      /parcel available at the point relais|pickup point/i,
      /delivered parcel/i
    ];
    const steps=[...doc.querySelectorAll("li")].map(li=>({
      text:(li.textContent||"").replace(/\s+/g," ").trim(),
      active:li.classList.contains("validate")
    })).filter(x=>known.some(re=>re.test(x.text)));
    const active=steps.filter(x=>x.active);
    const current=active[active.length-1]||steps[0];
    if(!current)throw new Error("Trackingdaten konnten nicht gelesen werden");
    const st=mondialStage(current.text);
    p.liveStatus=st.key;
    p.liveStatusLabel=st.label;
    p.liveStatusText=current.text;
    p.liveCheckedAt=Date.now();
    p.carrierName="Mondial Relay";
    p.carrierCode=100304;
    p.carrierConfidence="high";
    persist();

    const card=document.querySelector('.parcel[data-id="'+CSS.escape(String(p.id))+'"]');
    if(card){
      const badge=card.querySelector("[data-live-badge]");
      if(badge){
        badge.textContent=st.label.toUpperCase();
        badge.classList.add("loaded");
        badge.dataset.state=st.key;
      }
      const meta=card.querySelector(".trackerTitle span");
      if(meta)meta.textContent="Mondial Relay · "+new Date().toLocaleTimeString("de-DE",{hour:"2-digit",minute:"2-digit"});
    }

    box.innerHTML=
      '<div class="mrStatus">'+
        '<div class="mrCurrent"><small>Aktueller Status</small><b>'+esc(st.label)+'</b><span>'+esc(current.text)+'</span></div>'+
        '<div class="mrSteps">'+steps.map(x=>'<div class="mrStep '+(x.active?"ok":"pending")+'"><i>'+(x.active?"✓":"")+'</i><span>'+esc(x.text)+'</span></div>').join("")+'</div>'+
        '<a class="mrLink" href="'+esc(target)+'" target="_blank" rel="noopener noreferrer">Mondial Relay Original öffnen ↗</a>'+
      '</div>';
  }catch(e){
    box.innerHTML='<div class="trackerError">'+esc(e.message)+'<br><a href="'+esc(target)+'" target="_blank" rel="noopener noreferrer">Mondial Relay direkt öffnen ↗</a></div>';
  }
}

async function mountOne(p){
  if(p.done)return;
  const box=document.getElementById(hostId(p));
  if(!box||box.dataset.mounted==="1")return;
  box.dataset.mounted="1";
  box.innerHTML='<div class="trackerLoading">'+esc(p.carrierName)+" wird geprüft …</div>";

  if(p.carrierCode===100304&&p.carrierConfidence==="high"){
    await mountMondialRelay(p,box);
    return;
  }
  if(p.carrierCode===9071&&p.carrierConfidence==="high"){
    directPosteItaliane(p,box);
    return;
  }

  try{
    const yq=await ensureWidget();
    if(!document.getElementById(hostId(p)))return;
    box.innerHTML="";
    const fastCode=p.carrierConfidence==="high"&&p.carrierCode?String(p.carrierCode):"0";
    yq.trackSingle({
      YQ_ContainerId:hostId(p),
      YQ_Height:300,
      YQ_Fc:fastCode,
      YQ_Lang:"de",
      YQ_Num:p.number,
      onLoaded:()=>{
        const card=document.querySelector('.parcel[data-id="'+CSS.escape(String(p.id))+'"]');
        if(!card)return;
        const badge=card.querySelector("[data-live-badge]");
        const meta=card.querySelector(".trackerTitle span");
        p.liveCheckedAt=Date.now();
        persist();
        if(badge){badge.textContent="LIVE ✓";badge.classList.add("loaded")}
        if(meta)meta.textContent=(p.carrierName||"17TRACK")+" · geladen "+new Date().toLocaleTimeString("de-DE",{hour:"2-digit",minute:"2-digit"});
      }
    });
  }catch(e){
    box.innerHTML='<div class="trackerError">'+esc(e.message)+'<br>Tippe auf „Original“, um direkt beim Versanddienst nachzusehen.</div>';
  }
}

function observeTrackers(){
  if(trackObserver)trackObserver.disconnect();
  const hosts=$$(".trackerHost[data-expanded='1']");
  if(!hosts.length)return;
  if(!("IntersectionObserver" in window)){
    hosts.forEach(el=>{const p=parcels.find(x=>x.id===el.dataset.trackId);if(p)mountOne(p)});
    return;
  }
  trackObserver=new IntersectionObserver(entries=>{
    for(const entry of entries){
      if(!entry.isIntersecting)continue;
      const p=parcels.find(x=>x.id===entry.target.dataset.trackId);
      if(p)mountOne(p);
      trackObserver.unobserve(entry.target);
    }
  },{rootMargin:"320px 0px"});
  hosts.forEach(el=>trackObserver.observe(el));
}

function relativeTime(ts){
  if(!ts)return"";
  const mins=Math.max(0,Math.round((Date.now()-Number(ts))/60000));
  if(mins<1)return"gerade eben";
  if(mins<60)return"vor "+mins+" Min.";
  const h=Math.round(mins/60);
  if(h<24)return"vor "+h+" Std.";
  return"vor "+Math.round(h/24)+" T.";
}
function render(){
  $("#allCount").textContent=parcels.length;
  $("#openCount").textContent=parcels.filter(p=>!p.done).length;
  $("#doneCount").textContent=parcels.filter(p=>p.done).length;
  const q=filtered();
  $("#empty").hidden=!!q.length;
  $("#list").innerHTML=q.map(p=>{
    const original=nativeUrl(p);
    const fast=p.carrierConfidence==="high"&&p.carrierCode;
    const expanded=expandedTrackers.has(p.id);
    const checked=p.liveCheckedAt?relativeTime(p.liveCheckedAt):"";
    return '<article class="parcel '+(p.pinned?"pinned":"")+'" data-id="'+esc(p.id)+'">'+
      '<div class="parcelTop">'+
        '<div class="parcelIdentity"><div class="carrier">'+esc(p.carrierName)+(p.carrierCountry?' · '+esc(p.carrierCountry):'')+'</div>'+
        '<div class="name">'+esc(p.name||"Ohne Bezeichnung")+'</div>'+
        '<button class="number copyNumber" data-copy title="Sendungsnummer kopieren">'+esc(p.number)+'</button>'+
        '<div class="fastMeta">'+(checked?'Tracking geöffnet '+esc(checked):(fast?'Direkt erkannt · Schnellmodus':'Carrier wird automatisch ermittelt'))+'</div></div>'+
        '<div class="parcelBadges"><button class="pinBtn '+(p.pinned?"on":"")+'" data-pin title="Oben anheften">'+(p.pinned?"★":"☆")+'</button>'+
        '<span class="liveBadge '+(p.done?"doneBadge":"")+'" data-live-badge data-state="'+esc(p.liveStatus||"")+'">'+(p.done?"ERLEDIGT":(p.liveStatusLabel?esc(p.liveStatusLabel.toUpperCase()):(fast?"FAST":"LIVE")))+'</span></div>'+
      '</div>'+
      (!p.done?'<button class="trackerToggle '+(expanded?"open":"")+'" data-toggle-track><span>'+(expanded?"Status einklappen":"Live-Status anzeigen")+'</span><b>'+(expanded?"⌃":"⌄")+'</b></button>':'')+
      (!p.done&&expanded?'<div class="trackerWrap"><div class="trackerTitle"><b>'+esc((p.carrierCode===9071||p.carrierCode===100304)&&p.carrierConfidence==="high"?"Original-Status":"Live-Status")+'</b><span>'+((p.carrierCode===9071||p.carrierCode===100304)&&p.carrierConfidence==="high"?esc(p.carrierName):(fast?esc(p.carrierName):"17TRACK Fallback"))+'</span></div><div class="trackerHost" data-expanded="1" data-track-id="'+esc(p.id)+'" id="'+hostId(p)+'"><div class="trackerLoading">Wird geladen …</div></div></div>':'')+
      '<div class="actions">'+
        (!p.done?'<button class="refreshOne" data-refresh>↻ Prüfen</button>':'')+
        (original?'<button class="nativeBtn" data-native>Original</button>':'')+
        '<button class="editBtn" data-edit>Bearbeiten</button>'+
        '<button class="doneBtn '+(p.done?"undo":"")+'" data-done>'+(p.done?"Zurück":"Erledigt")+'</button>'+
        '<button class="removeBtn" data-remove>×</button>'+
      '</div>'+
    '</article>';
  }).join("");
  requestAnimationFrame(observeTrackers);
}
function addParcel(number,name="",hint=""){
  number=clean(number);
  if(!number)return null;
  deletedNumbers.delete(number);
  const existing=parcels.find(p=>p.number===number);
  const prof=carrierProfile(number,hint);
  if(existing){
    if(name&&!existing.name)existing.name=name;
    if(hint&&prof.confidence==="high"){
      existing.carrierName=prof.name;existing.carrierCode=prof.code;existing.carrierCountry=prof.country;
      existing.carrierConfidence=prof.confidence;existing.carrierReason=prof.reason;existing.carrierHint=prof.reason==="Screenshot"?prof.name:"";
    }
    existing.done=false;existing.updatedAt=Date.now();return existing;
  }
  const p={
    id:uid(),number,name,carrierName:prof.name,carrierCode:prof.code,carrierCountry:prof.country,
    carrierConfidence:prof.confidence,carrierReason:prof.reason,carrierHint:prof.reason==="Screenshot"?prof.name:"",
    liveStatus:"",liveStatusLabel:"",liveStatusText:"",liveCheckedAt:0,pinned:false,
    done:false,createdAt:Date.now(),updatedAt:Date.now()
  };
  parcels.push(p);return p;
}
async function refreshOne(p){
  expandedTrackers.add(p.id);
  render();
  await new Promise(r=>requestAnimationFrame(r));
  const box=document.getElementById(hostId(p));
  if(box){
    box.dataset.mounted="0";
    box.innerHTML='<div class="trackerLoading">'+esc(p.carrierName)+" wird neu geprüft …</div>";
  }
  await mountOne(p);
  toast("Status aktualisiert");
}
async function refreshAll({quiet=false}={}){
  const visible=$$(".trackerHost");
  if(!visible.length){if(!quiet)toast("Keine offenen Pakete");return}
  visible.forEach(box=>{
    box.dataset.mounted="0";
    box.innerHTML='<div class="trackerLoading">Wird aktualisiert …</div>';
  });
  observeTrackers();
  if(!quiet)toast("Sichtbare Pakete werden aktualisiert");
}

function extractManyFromText(text){
  const found=new Set(extractCandidates(text));
  const lines=String(text||"").split(/[\n,;]+/);
  for(const line of lines){
    for(const token of line.toUpperCase().match(/[A-Z0-9][A-Z0-9 -]{6,42}[A-Z0-9]/g)||[]){
      const n=clean(token);
      if(n.length<8||n.length>40)continue;
      if(!/\d{6}/.test(n))continue;
      if(/^(HTTP|HTTPS|WWW)/.test(n))continue;
      if(/^[A-Z0-9]+$/.test(n))found.add(n);
    }
  }
  return [...found];
}

async function preprocessForOcr(file){
  const bmp=await createImageBitmap(file);
  const scale=Math.min(2.2,Math.max(1.4,1800/Math.max(bmp.width,bmp.height)));
  const c=document.createElement("canvas");
  c.width=Math.round(bmp.width*scale);c.height=Math.round(bmp.height*scale);
  const ctx=c.getContext("2d",{willReadFrequently:true});
  ctx.drawImage(bmp,0,0,c.width,c.height);
  const img=ctx.getImageData(0,0,c.width,c.height);
  const d=img.data;
  for(let i=0;i<d.length;i+=4){
    const y=.299*d[i]+.587*d[i+1]+.114*d[i+2];
    const v=y>170?255:y<85?0:Math.max(0,Math.min(255,(y-128)*1.7+128));
    d[i]=d[i+1]=d[i+2]=v;
  }
  ctx.putImageData(img,0,0);
  if(bmp.close)bmp.close();
  return c;
}

function looksLikeDate8(n){
  if(!/^\d{8}$/.test(n))return false;
  const d=Number(n.slice(0,2)),m=Number(n.slice(2,4)),y=Number(n.slice(4));
  if(d>=1&&d<=31&&m>=1&&m<=12&&y>=2000&&y<=2099)return true;
  const y2=Number(n.slice(0,4)),m2=Number(n.slice(4,6)),d2=Number(n.slice(6,8));
  return y2>=2000&&y2<=2099&&m2>=1&&m2<=12&&d2>=1&&d2<=31;
}
function labeledCandidates(text){
  const t=String(text||"").toUpperCase().replace(/[–—]/g,"-");
  const out=[];
  for(const re of [
    /SENDUNGSNUMMER\s*[:#-]?\s*([A-Z0-9 -]{6,32})/g,
    /TRACKING\s*(?:NUMBER|NO\.?|NR\.?)\s*[:#-]?\s*([A-Z0-9 -]{6,32})/g,
    /NUM[EÉ]RO\s+(?:DE\s+)?(?:COLIS|SUIVI|EXP[EÉ]DITION)\s*[:#-]?\s*([A-Z0-9 -]{6,32})/g,
    /NUMERO\s+(?:DI\s+)?(?:SPEDIZIONE|TRACKING)\s*[:#-]?\s*([A-Z0-9 -]{6,32})/g
  ]){
    for(const m of t.matchAll(re)){
      const n=clean(m[1].split(/\s{2,}|\n/)[0]);
      if(n.length>=8&&n.length<=30&&!looksLikeDate8(n))out.push(n);
    }
  }
  return [...new Set(out)];
}
function extractCandidates(text){
  const raw=String(text||"").toUpperCase().replace(/[–—]/g,"-");
  const compact=raw.replace(/[\s-]+/g," ");
  const joined=raw.replace(/[\s-]+/g,"");
  const found=new Set(labeledCandidates(raw));
  const add=m=>{const n=clean(m);if(n.length>=8&&n.length<=40)found.add(n)};
  for(const re of [
    /1Z[A-Z0-9]{16}/g,
    /H\d{19}/g,
    /00340\d{15}/g,
    /[A-Z]{2}\d{9}(?:DE|FR|IT|AT)/g,
    /JJD[A-Z0-9]{10,24}/g,
    /\d{14}/g,
    /\d{11,12}/g,
    /\b\d{8}\b/g
  ])for(const m of joined.matchAll(re))add(m[0]);
  for(const m of compact.matchAll(/(?:\d[\s-]*){11,20}/g))add(m[0]);
  return [...found].filter(n=>{
    if(/^1Z[A-Z0-9]{16}$/.test(n)||/^H\d{19}$/.test(n)||/^00340\d{15}$/.test(n)||/^[A-Z]{2}\d{9}(?:DE|FR|IT|AT)$/.test(n)||/^JJD[A-Z0-9]{10,24}$/.test(n))return true;
    if(/^\d{8}$/.test(n))return !looksLikeDate8(n);
    return /^\d{11,14}$/.test(n)||/^\d{20}$/.test(n);
  });
}
async function barcodeCandidates(file){
  if(!("BarcodeDetector" in window)||!("createImageBitmap" in window))return[];
  try{
    const formats=await BarcodeDetector.getSupportedFormats();
    const use=["code_128","code_39","ean_13","ean_8","itf"].filter(x=>formats.includes(x));
    if(!use.length)return[];
    const detector=new BarcodeDetector({formats:use});
    const bmp=await createImageBitmap(file);
    const codes=await detector.detect(bmp);
    if(bmp.close)bmp.close();
    return codes.map(x=>clean(x.rawValue)).filter(Boolean);
  }catch{return[]}
}
function renderOcr(){
  $("#ocrCandidates").innerHTML=ocrFound.map((x,i)=>
    '<label class="candidate"><input type="checkbox" data-candidate="'+i+'" checked><span class="candidateText"><b>'+esc(x.number)+'</b><small>'+esc(x.carrier)+' · '+esc(x.source)+'</small></span></label>'
  ).join("");
  $("#addCandidates").hidden=!ocrFound.length;
}
async function scanScreenshots(files){
  files=[...files];if(!files.length)return;
  $("#ocrBox").hidden=false;$("#ocrCandidates").innerHTML="";$("#addCandidates").hidden=true;ocrFound=[];
  $("#ocrTitle").textContent="Screenshots werden gelesen …";$("#ocrProgress").textContent="0%";$("#ocrBar").style.width="0%";
  const seen=new Map();let worker=null;
  try{
    if(!window.Tesseract)throw new Error("OCR-Bibliothek konnte nicht geladen werden");
    worker=await Tesseract.createWorker("eng",1,{logger:m=>{
      if(m.status==="recognizing text"){
        const pct=Math.round((m.progress||0)*100);
        $("#ocrProgress").textContent=pct+"%";$("#ocrBar").style.width=pct+"%";
      }
    }});
    await worker.setParameters({tessedit_char_whitelist:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789- ÄÖÜäöü"});
    for(let i=0;i<files.length;i++){
      $("#ocrTitle").textContent="Bild "+(i+1)+" von "+files.length+" wird gelesen …";
      const result=await worker.recognize(files[i]);
      let text=result&&result.data&&result.data.text||"";
      const bars=await barcodeCandidates(files[i]);
      let numbers=[...new Set([...bars,...extractCandidates(text)])];
      let retried=false;
      if(!numbers.length){
        $("#ocrTitle").textContent="Bild "+(i+1)+" wird kontrastverstärkt erneut gelesen …";
        const processed=await preprocessForOcr(files[i]);
        const second=await worker.recognize(processed);
        const secondText=second&&second.data&&second.data.text||"";
        text+="\n"+secondText;
        numbers=[...new Set([...bars,...extractCandidates(text)])];
        retried=true;
      }
      for(const n of numbers){
        const prof=carrierProfile(n,text);
        const item={number:n,carrier:prof.name,carrierCode:prof.code,country:prof.country,confidence:prof.confidence,hint:prof.reason==="Screenshot"?prof.name:"",source:(bars.includes(n)?"Barcode + ":"")+"OCR"+(retried?" 2×":"")+" · Bild "+(i+1)};
        const previous=seen.get(n);
        if(!previous||prof.confidence==="high")seen.set(n,item);
      }
    }
    ocrFound=[...seen.values()].filter(x=>!parcels.some(p=>p.number===x.number));
    $("#ocrTitle").textContent=ocrFound.length?ocrFound.length+" mögliche Sendungsnummer"+(ocrFound.length===1?"":"n")+" gefunden":"Keine Sendungsnummer erkannt";
    $("#ocrProgress").textContent=ocrFound.length?"Carrier wurde mitgelesen":"";
    $("#ocrBar").style.width="100%";renderOcr();
  }catch(e){
    $("#ocrTitle").textContent="Screenshot-Erkennung fehlgeschlagen";$("#ocrProgress").textContent="";
    $("#ocrCandidates").innerHTML='<div class="trackerError">'+esc(e.message)+'</div>';
  }finally{try{if(worker)await worker.terminate()}catch{}}
}

$("#pasteClipboard").addEventListener("click",async()=>{
  try{
    const t=await navigator.clipboard.readText();
    $("#bulkInput").value=t;
    $("#bulkHint").textContent=extractManyFromText(t).length+" mögliche Sendungsnummer(n) erkannt.";
  }catch{
    $("#bulkHint").textContent="Zwischenablage konnte nicht direkt gelesen werden – Text einfach ins Feld einfügen.";
  }
});
$("#bulkInput").addEventListener("input",e=>{
  $("#bulkHint").textContent=extractManyFromText(e.target.value).length+" mögliche Sendungsnummer(n) erkannt · Duplikate werden übersprungen.";
});
$("#addBulk").addEventListener("click",()=>{
  const numbers=extractManyFromText($("#bulkInput").value);
  if(!numbers.length)return toast("Keine Sendungsnummer erkannt");
  let added=0,dupes=0;
  for(const n of numbers){
    const before=parcels.length;
    addParcel(n);
    if(parcels.length>before)added++;else dupes++;
  }
  persist();$("#bulkInput").value="";filter="open";
  $$(".tab").forEach(x=>x.classList.toggle("on",x.dataset.filter==="open"));
  render();
  $("#bulkHint").textContent=added+" gespeichert"+(dupes?" · "+dupes+" Duplikat(e) übersprungen":"");
  toast(added+" Paket"+(added===1?"":"e")+" gespeichert");
});
$("#searchInput").addEventListener("input",e=>{searchQuery=e.target.value;render()});
$("#clearDone").addEventListener("click",()=>{
  const count=parcels.filter(p=>p.done).length;
  if(!count)return toast("Keine erledigten Pakete");
  if(confirm(count+" erledigte Paket"+(count===1?"":"e")+" löschen?")){
    for(const p of parcels.filter(p=>p.done))deletedNumbers.add(p.number);
    parcels=parcels.filter(p=>!p.done);
    persist();
    render();
    toast(count+" gelöscht");
  }
});

$("#addForm").addEventListener("submit",e=>{
  e.preventDefault();
  const raw=$("#number").value;
  const existed=parcels.some(x=>x.number===clean(raw));
  const p=addParcel(raw,$("#name").value.trim());
  if(!p)return;
  e.target.reset();persist();filter="open";
  $$(".tab").forEach(x=>x.classList.toggle("on",x.dataset.filter==="open"));
  render();toast(existed?"Schon gespeichert · nach oben geholt":(p.carrierConfidence==="high"?p.carrierName+" erkannt":"Paket gespeichert"));
});
$("#refreshAll").addEventListener("click",()=>refreshAll());
$("#scanBtn").addEventListener("click",()=>$("#screenshots").click());
$("#screenshots").addEventListener("change",e=>scanScreenshots(e.target.files));
$("#cameraBtn").addEventListener("click",()=>$("#cameraScan").click());
$("#cameraScan").addEventListener("change",e=>{
  scanScreenshots(e.target.files);
  e.target.value="";
});
$("#addCandidates").addEventListener("click",()=>{
  const selected=$$("[data-candidate]:checked").map(el=>ocrFound[Number(el.dataset.candidate)]).filter(Boolean);
  let count=0;
  for(const x of selected){const before=parcels.length;addParcel(x.number,"",x.hint);if(parcels.length>before)count++}
  persist();$("#ocrBox").hidden=true;$("#screenshots").value="";filter="open";
  $$(".tab").forEach(x=>x.classList.toggle("on",x.dataset.filter==="open"));
  render();toast(count+" Paket"+(count===1?"":"e")+" gespeichert");
});
$("#list").addEventListener("click",e=>{
  const card=e.target.closest(".parcel");if(!card)return;
  const p=parcels.find(x=>x.id===card.dataset.id);if(!p)return;
  if(e.target.closest("[data-copy]")){
    const value=p.number;
    if(navigator.clipboard&&navigator.clipboard.writeText){
      navigator.clipboard.writeText(value).then(()=>toast("Sendungsnummer kopiert")).catch(()=>{});
    }
  }
  if(e.target.closest("[data-pin]")){
    p.pinned=!p.pinned;p.updatedAt=Date.now();persist();render();toast(p.pinned?"Oben angeheftet":"Anheftung entfernt");return;
  }
  if(e.target.closest("[data-toggle-track]")){
    if(expandedTrackers.has(p.id))expandedTrackers.delete(p.id);else expandedTrackers.add(p.id);
    render();return;
  }
  if(e.target.closest("[data-refresh]")){refreshOne(p);return;}
  if(e.target.closest("[data-native]")){const u=nativeUrl(p);if(u)window.open(u,"_blank","noopener,noreferrer")}
  if(e.target.closest("[data-edit]")){
    $("#editId").value=p.id;
    $("#editName").value=p.name||"";
    $("#editNumber").value=p.number;
    $("#editCarrier").value=carrierKeyFor(p);
    $("#editDialog").showModal();
  }
  if(e.target.closest("[data-done]")){
    p.done=!p.done;if(p.done)expandedTrackers.delete(p.id);p.updatedAt=Date.now();persist();render();toast(p.done?"Als erledigt markiert":"Wieder geöffnet");
  }
  if(e.target.closest("[data-remove]")){
    if(confirm("Paket löschen?")){
      deletedNumbers.add(p.number);
      expandedTrackers.delete(p.id);
      parcels=parcels.filter(x=>x.id!==p.id);
      persist();
      render();
      toast("Paket gelöscht");
    }
  }
});
$("#saveEdit").addEventListener("click",()=>{
  const p=parcels.find(x=>x.id===$("#editId").value);
  if(!p)return $("#editDialog").close();
  const newNumber=clean($("#editNumber").value);
  if(!newNumber)return toast("Sendungsnummer fehlt");
  const duplicate=parcels.find(x=>x.id!==p.id&&x.number===newNumber);
  if(duplicate)return toast("Diese Sendungsnummer ist schon gespeichert");

  const selected=$("#editCarrier").value;
  p.name=$("#editName").value.trim();
  p.number=newNumber;
  deletedNumbers.delete(newNumber);
  if(selected==="auto"){
    const prof=carrierProfile(newNumber);
    p.carrierName=prof.name;p.carrierCode=prof.code;p.carrierCountry=prof.country;
    p.carrierConfidence=prof.confidence;p.carrierReason=prof.reason;p.carrierHint="";
  }else{
    const prof=CARRIERS[selected];
    if(prof){
      p.carrierName=prof.name;p.carrierCode=prof.code;p.carrierCountry=prof.country;
      p.carrierConfidence="high";p.carrierReason="Manuell";p.carrierHint="";
    }
  }
  p.liveStatus="";p.liveStatusLabel="";p.liveStatusText="";p.liveCheckedAt=0;
  p.updatedAt=Date.now();
  persist();render();$("#editDialog").close();toast("Paket aktualisiert");
});
$("#deleteParcel").addEventListener("click",()=>{
  const id=$("#editId").value;
  const p=parcels.find(x=>x.id===id);
  if(confirm("Paket wirklich löschen?")){
    if(p)deletedNumbers.add(p.number);
    parcels=parcels.filter(x=>x.id!==id);
    persist();
    render();
    $("#editDialog").close();
    toast("Paket gelöscht");
  }
});
$$(".tab").forEach(b=>b.addEventListener("click",()=>{
  $$(".tab").forEach(x=>x.classList.remove("on"));b.classList.add("on");filter=b.dataset.filter;render();
}));
$("#exportBackup").addEventListener("click",()=>{
  const payload={app:"Paket 119",version:1,exportedAt:new Date().toISOString(),parcels};
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");
  a.href=url;a.download="paket-119-backup-"+new Date().toISOString().slice(0,10)+".json";
  document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  toast("Backup exportiert");
});
$("#importBackup").addEventListener("click",()=>$("#importBackupFile").click());
$("#importBackupFile").addEventListener("change",async e=>{
  const file=e.target.files&&e.target.files[0];if(!file)return;
  try{
    const data=JSON.parse(await file.text());
    const incoming=Array.isArray(data)?data:(Array.isArray(data.parcels)?data.parcels:[]);
    if(!incoming.length)throw new Error("Keine Pakete im Backup");
    const migrated=migrate(incoming);
    const map=new Map(parcels.map(p=>[p.number,p]));
    for(const p of migrated){
      deletedNumbers.delete(p.number);
      map.set(p.number,{...map.get(p.number),...p});
    }
    parcels=[...map.values()];
    persist();render();toast(migrated.length+" Paket"+(migrated.length===1?"":"e")+" importiert");
  }catch(err){toast("Backup ungültig")}
  e.target.value="";
});
$("#infoBtn").addEventListener("click",()=>$("#infoDialog").showModal());
$$("[data-close]").forEach(b=>b.addEventListener("click",()=>b.closest("dialog").close()));
if("serviceWorker" in navigator){
  addEventListener("load",async()=>{
    try{
      const hadController=!!navigator.serviceWorker.controller;
      let reloading=false;
      if(hadController){
        navigator.serviceWorker.addEventListener("controllerchange",()=>{
          if(reloading)return;
          reloading=true;
          location.reload();
        },{once:true});
      }
      const reg=await navigator.serviceWorker.register("./sw.js",{scope:"./",updateViaCache:"none"});
      await reg.update();
    }catch{}
  });
}

function updateNetworkState(){
  const s=$("#syncState");
  if(!navigator.onLine){
    s.textContent="Offline · gespeicherte Pakete bleiben sichtbar; Live-Tracking lädt wieder, sobald Internet da ist.";
    s.classList.add("offline");
  }else{
    s.textContent="Vinted-Schnellmodus: Carrier zuerst erkennen · direkter Anbieter wo möglich · 17TRACK nur als Fallback.";
    s.classList.remove("offline");
  }
}
addEventListener("online",()=>{updateNetworkState();refreshAll({quiet:true})});
addEventListener("offline",updateNetworkState);
document.addEventListener("visibilitychange",()=>{
  if(document.visibilityState==="visible"&&navigator.onLine)refreshAll({quiet:true});
});
updateNetworkState();
render();
restoreIndexedBackup().finally(()=>persist());
addEventListener("pagehide",persist);
setInterval(()=>{if(document.visibilityState==="visible"&&navigator.onLine)refreshAll({quiet:true})},15*60*1000);
