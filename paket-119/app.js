const STORAGE="paket119.inbox.v4";
const PREVIOUS=["paket119.inbox.v3","paket119.inbox.v2","paket119.v1"];
const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
let filter="open";
let searchQuery="";
let ocrFound=[];
let parcels=load();
let widgetPromise=null;
let trackObserver=null;

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
  if(/^\d{14}$/.test(n))return {...CARRIERS.dpdDe,confidence:"high",reason:"Nummernmuster"};
  if(/^\d{11}$/.test(n))return {...CARRIERS.gls,confidence:"medium",reason:"wahrscheinliches GLS-Muster"};
  if(/^100\d{9}$/.test(n))return {...CARRIERS.vintedGo,confidence:"medium",reason:"mögliches Vinted-Go-Muster"};
  return {name:"Carrier automatisch",code:0,country:"",confidence:"low",reason:"17TRACK Fallback"};
}

function nativeUrl(p){
  const n=encodeURIComponent(p.number);
  switch(p.carrierCode){
    case 7041:return "https://www.dhl.de/de/privatkunden/pakete-empfangen/verfolgen.html?piececode="+n+"&lang=de";
    case 100007:return "https://my.dpd.de/redirect.aspx?action=12&parcelno="+n;
    case 100072:return "https://www.dpd.com/fr/fr/suivre-mon-colis/";
    case 100002:return "https://www.ups.com/track?loc=de_DE&tracknum="+n+"&requester=WT/";
    case 100001:return "https://www.dhl.de/de/privatkunden/dhl-sendungsverfolgung.html?piececode="+n;
    case 100304:return "https://www.mondialrelay.fr/r";
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
    const shouldUpgrade=!keepCode||!p.carrierName||/^Auto|Carrier automatisch/.test(p.carrierName);
    return {
      id:p.id||uid(),
      number,
      name:p.name||"",
      carrierName:shouldUpgrade?auto.name:p.carrierName,
      carrierCode:shouldUpgrade?auto.code:keepCode,
      carrierCountry:shouldUpgrade?auto.country:(p.carrierCountry||auto.country),
      carrierConfidence:shouldUpgrade?auto.confidence:(p.carrierConfidence||auto.confidence),
      carrierReason:shouldUpgrade?auto.reason:(p.carrierReason||auto.reason),
      carrierHint:p.carrierHint||"",
      done:Boolean(p.done||p.status==="zugestellt"),
      createdAt:p.createdAt||p.u||Date.now(),
      updatedAt:p.updatedAt||p.u||Date.now()
    };
  }).filter(p=>p.number);
}
function load(){
  try{
    const own=JSON.parse(localStorage.getItem(STORAGE)||"null");
    if(Array.isArray(own))return migrate(own);
    for(const key of PREVIOUS){
      const old=JSON.parse(localStorage.getItem(key)||"null");
      if(Array.isArray(old)){
        const next=migrate(old);
        localStorage.setItem(STORAGE,JSON.stringify(next));
        return next;
      }
    }
  }catch{}
  return[];
}
function persist(){localStorage.setItem(STORAGE,JSON.stringify(parcels))}
function toast(s){const e=document.createElement("div");e.className="toast";e.textContent=s;document.body.append(e);setTimeout(()=>e.remove(),1800)}
function hostId(p){return"trk_"+String(p.id).replace(/[^a-zA-Z0-9_-]/g,"_")}
function filtered(){
  let q=[...parcels].sort((a,b)=>(b.updatedAt||0)-(a.updatedAt||0));
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
  box.innerHTML='<iframe class="nativeTracker" title="Poste Italiane Tracking" loading="eager" referrerpolicy="no-referrer" src="'+esc(nativeUrl(p))+'"></iframe>';
}

async function mountOne(p){
  if(p.done)return;
  const box=document.getElementById(hostId(p));
  if(!box||box.dataset.mounted==="1")return;
  box.dataset.mounted="1";
  box.innerHTML='<div class="trackerLoading">'+esc(p.carrierName)+" wird geprüft …</div>";

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
  const hosts=$$(".trackerHost");
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

function render(){
  $("#allCount").textContent=parcels.length;
  $("#openCount").textContent=parcels.filter(p=>!p.done).length;
  $("#doneCount").textContent=parcels.filter(p=>p.done).length;
  const q=filtered();
  $("#empty").hidden=!!q.length;
  $("#list").innerHTML=q.map(p=>{
    const original=nativeUrl(p);
    const fast=p.carrierConfidence==="high"&&p.carrierCode;
    return '<article class="parcel" data-id="'+esc(p.id)+'">'+
      '<div class="parcelTop">'+
        '<div><div class="carrier">'+esc(p.carrierName)+(p.carrierCountry?' · '+esc(p.carrierCountry):'')+'</div>'+
        '<div class="name">'+esc(p.name||"Ohne Bezeichnung")+'</div>'+
        '<button class="number copyNumber" data-copy title="Sendungsnummer kopieren">'+esc(p.number)+'</button>'+
        '<div class="fastMeta">'+(fast?'Direkt erkannt · Schnellmodus':'Carrier wird automatisch ermittelt')+'</div></div>'+
        '<span class="liveBadge '+(p.done?"doneBadge":"")+'" data-live-badge>'+(p.done?"ERLEDIGT":(fast?"FAST":"LIVE"))+'</span>'+
      '</div>'+
      (!p.done?'<div class="trackerWrap"><div class="trackerTitle"><b>'+esc(p.carrierCode===9071&&p.carrierConfidence==="high"?"Original-Status":"Live-Status")+'</b><span>'+(fast?esc(p.carrierName):"17TRACK Fallback")+'</span></div><div class="trackerHost" data-track-id="'+esc(p.id)+'" id="'+hostId(p)+'"><div class="trackerLoading">Wird beim Anzeigen geladen …</div></div></div>':'')+
      '<div class="actions">'+
        (!p.done?'<button class="refreshOne" data-refresh>↻ Prüfen</button>':'')+
        (original?'<button class="nativeBtn" data-native>Original</button>':'')+
        '<button class="editBtn" data-edit>Umbenennen</button>'+
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
  const existing=parcels.find(p=>p.number===number);
  const prof=carrierProfile(number,hint);
  if(existing){
    if(name&&!existing.name)existing.name=name;
    if(hint&&prof.confidence==="high"){
      existing.carrierName=prof.name;existing.carrierCode=prof.code;existing.carrierCountry=prof.country;
      existing.carrierConfidence=prof.confidence;existing.carrierReason=prof.reason;existing.carrierHint=hint;
    }
    existing.done=false;existing.updatedAt=Date.now();return existing;
  }
  const p={
    id:uid(),number,name,carrierName:prof.name,carrierCode:prof.code,carrierCountry:prof.country,
    carrierConfidence:prof.confidence,carrierReason:prof.reason,carrierHint:hint,
    done:false,createdAt:Date.now(),updatedAt:Date.now()
  };
  parcels.push(p);return p;
}
async function refreshOne(p){
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

function extractCandidates(text){
  const raw=String(text||"").toUpperCase().replace(/[–—]/g,"-");
  const compact=raw.replace(/[\s-]+/g," ");
  const joined=raw.replace(/[\s-]+/g,"");
  const found=new Set();
  const add=m=>{const n=clean(m);if(n.length>=8&&n.length<=40)found.add(n)};
  for(const re of [
    /1Z[A-Z0-9]{16}/g,
    /H\d{19}/g,
    /00340\d{15}/g,
    /[A-Z]{2}\d{9}(?:DE|FR|IT|AT)/g,
    /JJD[A-Z0-9]{10,24}/g,
    /\d{14}/g,
    /\d{11,12}/g
  ])for(const m of joined.matchAll(re))add(m[0]);
  for(const m of compact.matchAll(/(?:\d[\s-]*){11,20}/g))add(m[0]);
  return [...found].filter(n=>{
    if(/^1Z[A-Z0-9]{16}$/.test(n)||/^H\d{19}$/.test(n)||/^00340\d{15}$/.test(n)||/^[A-Z]{2}\d{9}(?:DE|FR|IT|AT)$/.test(n)||/^JJD[A-Z0-9]{10,24}$/.test(n))return true;
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
        const item={number:n,carrier:prof.name,carrierCode:prof.code,country:prof.country,confidence:prof.confidence,hint:text,source:(bars.includes(n)?"Barcode + ":"")+"OCR"+(retried?" 2×":"")+" · Bild "+(i+1)};
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
  $(".tab").forEach(x=>x.classList.toggle("on",x.dataset.filter==="open"));
  render();
  $("#bulkHint").textContent=added+" gespeichert"+(dupes?" · "+dupes+" Duplikat(e) übersprungen":"");
  toast(added+" Paket"+(added===1?"":"e")+" gespeichert");
});
$("#searchInput").addEventListener("input",e=>{searchQuery=e.target.value;render()});
$("#clearDone").addEventListener("click",()=>{
  const count=parcels.filter(p=>p.done).length;
  if(!count)return toast("Keine erledigten Pakete");
  if(confirm(count+" erledigte Paket"+(count===1?"":"e")+" löschen?")){
    parcels=parcels.filter(p=>!p.done);persist();render();toast(count+" gelöscht");
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
  if(e.target.closest("[data-refresh]"))refreshOne(p);
  if(e.target.closest("[data-native]")){const u=nativeUrl(p);if(u)window.open(u,"_blank","noopener,noreferrer")}
  if(e.target.closest("[data-edit]")){
    $("#editId").value=p.id;$("#editName").value=p.name||"";$("#editNumber").textContent=p.number;$("#editDialog").showModal();
  }
  if(e.target.closest("[data-done]")){
    p.done=!p.done;p.updatedAt=Date.now();persist();render();toast(p.done?"Als erledigt markiert":"Wieder geöffnet");
  }
  if(e.target.closest("[data-remove]")){
    if(confirm("Paket löschen?")){parcels=parcels.filter(x=>x.id!==p.id);persist();render()}
  }
});
$("#saveEdit").addEventListener("click",()=>{
  const p=parcels.find(x=>x.id===$("#editId").value);
  if(p){p.name=$("#editName").value.trim();p.updatedAt=Date.now();persist();render()}
  $("#editDialog").close();
});
$("#deleteParcel").addEventListener("click",()=>{
  const id=$("#editId").value;
  if(confirm("Paket wirklich löschen?")){parcels=parcels.filter(x=>x.id!==id);persist();render();$("#editDialog").close()}
});
$$(".tab").forEach(b=>b.addEventListener("click",()=>{
  $$(".tab").forEach(x=>x.classList.remove("on"));b.classList.add("on");filter=b.dataset.filter;render();
}));
$("#infoBtn").addEventListener("click",()=>$("#infoDialog").showModal());
$$("[data-close]").forEach(b=>b.addEventListener("click",()=>b.closest("dialog").close()));
if("serviceWorker" in navigator)addEventListener("load",()=>navigator.serviceWorker.register("./sw.js",{scope:"./"}).catch(()=>{}));

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
ensureWidget().catch(()=>{});
updateNetworkState();
render();
setInterval(()=>{if(document.visibilityState==="visible"&&navigator.onLine)refreshAll({quiet:true})},15*60*1000);
