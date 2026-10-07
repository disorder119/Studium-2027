const STORAGE="paket119.inbox.v2";
const OLD_STORAGE="paket119.v1";
const API_SETTING="paket119.apiBase";
const API_DEFAULT=String(window.PAKET119_API_BASE||"");
const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const STATUS_LABEL={angekündigt:"Angekündigt",unterwegs:"Unterwegs",heute:"Kommt heute",abholung:"Abholbereit",problem:"Problem",zugestellt:"Zugestellt",unbekannt:"Unbekannt"};
let filter="active";
let ocrFound=[];
let parcels=load();

function uid(){return crypto.randomUUID?crypto.randomUUID():String(Date.now())+Math.random().toString(16).slice(2)}
function clean(v){return String(v||"").trim().toUpperCase().replace(/[\s-]+/g,"")}
function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]))}
function guessCarrier(n){
  n=clean(n);
  if(/^1Z[A-Z0-9]{16}$/.test(n))return"UPS";
  if(/^H\d{19}$/.test(n))return"Hermes";
  if(/^00340\d{15}$/.test(n)||/^[A-Z]{2}\d{9}DE$/.test(n)||/^JJD/i.test(n))return"DHL";
  if(/^\d{14}$/.test(n))return"DPD / Hermes";
  if(/^\d{11,12}$/.test(n))return"GLS / DHL";
  return"17TRACK";
}
function migrate(old){
  return (Array.isArray(old)?old:[]).map(p=>({
    id:p.id||uid(),number:clean(p.number),name:p.name||"",carrierName:p.carrierName||guessCarrier(p.number),
    status:p.status||"unbekannt",statusText:p.statusText||"",etaDate:p.etaDate||null,etaFrom:p.etaFrom||null,etaTo:p.etaTo||null,
    location:p.location||null,events:Array.isArray(p.events)?p.events:[],checkedAt:p.checkedAt||null,u:p.u||Date.now()
  })).filter(p=>p.number);
}
function load(){
  try{
    const current=JSON.parse(localStorage.getItem(STORAGE)||"null");
    if(Array.isArray(current))return migrate(current);
    const old=JSON.parse(localStorage.getItem(OLD_STORAGE)||"[]");
    const next=migrate(old);if(next.length)localStorage.setItem(STORAGE,JSON.stringify(next));return next;
  }catch{return[]}
}
function save(){localStorage.setItem(STORAGE,JSON.stringify(parcels));render()}
function toast(s){const e=document.createElement("div");e.className="toast";e.textContent=s;document.body.append(e);setTimeout(()=>e.remove(),1800)}
function apiBase(){
  const explicit=(localStorage.getItem(API_SETTING)||API_DEFAULT).trim().replace(/\/$/,"");
  if(explicit)return explicit;
  if(location.hostname.endsWith(".vercel.app"))return "";
  return null;
}
function etaText(p){
  if(p.etaFrom||p.etaTo){
    const a=p.etaFrom?new Date(p.etaFrom):null,b=p.etaTo?new Date(p.etaTo):null;
    const day=a&&!Number.isNaN(+a)?a.toLocaleDateString("de-DE",{weekday:"short",day:"2-digit",month:"2-digit"}):"";
    const from=a&&!Number.isNaN(+a)?a.toLocaleTimeString("de-DE",{hour:"2-digit",minute:"2-digit"}):"";
    const to=b&&!Number.isNaN(+b)?b.toLocaleTimeString("de-DE",{hour:"2-digit",minute:"2-digit"}):"";
    return [day,from&&to?from+"–"+to:from||to].filter(Boolean).join(" · ");
  }
  return p.etaDate?String(p.etaDate):"";
}
function filtered(){
  let q=[...parcels].sort((a,b)=>(b.u||0)-(a.u||0));
  if(filter==="active")q=q.filter(p=>p.status!=="zugestellt");
  if(filter==="today")q=q.filter(p=>p.status==="heute");
  if(filter==="done")q=q.filter(p=>p.status==="zugestellt");
  return q;
}
function render(){
  $("#activeCount").textContent=parcels.filter(p=>p.status!=="zugestellt").length;
  $("#todayCount").textContent=parcels.filter(p=>p.status==="heute").length;
  $("#doneCount").textContent=parcels.filter(p=>p.status==="zugestellt").length;
  const q=filtered();
  $("#empty").hidden=!!q.length;
  $("#list").innerHTML=q.map(p=>{
    const eta=etaText(p);
    const events=(p.events||[]).slice(0,3);
    return '<article class="parcel '+(p.refreshing?"refreshing":"")+'" data-id="'+esc(p.id)+'">'+
      '<div class="parcelTop"><div><div class="carrier">'+esc(p.carrierName||guessCarrier(p.number))+'</div>'+
      '<div class="name">'+esc(p.name||"Ohne Bezeichnung")+'</div><div class="number">'+esc(p.number)+'</div></div>'+
      '<span class="status '+esc(p.status||"unbekannt")+'">'+esc(p.refreshing?"Prüfe…":(STATUS_LABEL[p.status]||"Unbekannt"))+'</span></div>'+
      ((p.statusText||eta||p.location||events.length||p.error)?'<div class="liveBox">'+
        (p.statusText?'<div class="statusText">'+esc(p.statusText)+'</div>':'')+
        (eta?'<div class="eta">Voraussichtlich: '+esc(eta)+'</div>':'')+
        (p.location?'<div class="location">'+esc(p.location)+'</div>':'')+
        (events.length?'<ul class="events">'+events.map(e=>'<li>'+esc(e.text||"")+(e.location?' · '+esc(e.location):'')+'</li>').join("")+'</ul>':'')+
        (p.error?'<div class="checked error">'+esc(p.error)+'</div>':'')+
        (p.checkedAt?'<div class="checked">Aktualisiert '+esc(new Date(p.checkedAt).toLocaleString("de-DE"))+'</div>':'')+
      '</div>':'')+
      '<div class="actions"><button class="refreshOne" data-refresh>↻ Prüfen</button><button class="editBtn" data-edit>Umbenennen</button><button class="removeBtn" data-remove>×</button></div>'+
    '</article>';
  }).join("");
  const base=apiBase();
  $("#syncState").textContent=base===null?"Live-Tracking-Backend noch nicht verbunden · Speicherung & Screenshot-Erkennung funktionieren bereits.":"Live-Tracking aktiv · 17TRACK Batch-Refresh vorbereitet.";
}
function addParcel(number,name=""){
  number=clean(number);
  if(!number)return null;
  const existing=parcels.find(p=>p.number===number);
  if(existing){if(name&&!existing.name)existing.name=name;return existing}
  const p={id:uid(),number,name,carrierName:guessCarrier(number),status:"unbekannt",statusText:"",events:[],checkedAt:null,u:Date.now()};
  parcels.push(p);return p;
}
async function refreshOne(p,{quiet=false}={}){
  const base=apiBase();
  if(base===null){p.error="Live-Tracking wird nach Verbindung des Backends aktiviert.";p.checkedAt=new Date().toISOString();save();if(!quiet)toast("Backend noch nicht verbunden");return}
  p.refreshing=true;p.error=null;render();
  try{
    const r=await fetch(base+"/api/track",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({number:p.number})});
    const d=await r.json();
    if(!r.ok&&r.status!==202)throw new Error(d.error||"Tracking fehlgeschlagen");
    if(d){
      p.carrierName=d.carrierName||p.carrierName||guessCarrier(p.number);
      p.status=d.status||p.status||"unbekannt";
      p.statusText=d.statusText||"";
      p.etaDate=d.etaDate||null;p.etaFrom=d.etaFrom||null;p.etaTo=d.etaTo||null;
      p.location=d.location||null;p.events=Array.isArray(d.events)?d.events:[];
      p.checkedAt=d.checkedAt||new Date().toISOString();
      p.error=d.ok===false?(d.statusText||"Noch keine Trackingdaten"):null;
    }
  }catch(e){p.error=e.message;p.checkedAt=new Date().toISOString()}
  p.refreshing=false;p.u=Date.now();save();
}
async function refreshAll(){
  const active=parcels.filter(p=>p.status!=="zugestellt");
  if(!active.length)return toast("Keine offenen Pakete");
  const base=apiBase();
  if(base===null){toast("Backend noch nicht verbunden");$("#syncState").textContent="Live-Tracking-Backend noch nicht verbunden.";return}
  active.forEach(p=>p.refreshing=true);render();
  try{
    const r=await fetch(base+"/api/batch",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({numbers:active.map(p=>p.number)})});
    const d=await r.json();if(!r.ok||!d.ok)throw new Error(d.error||"Batch-Refresh fehlgeschlagen");
    const by=new Map((d.items||[]).map(x=>[x.number,x]));
    for(const p of active){
      const x=by.get(p.number);p.refreshing=false;
      if(!x){p.error="Keine Antwort";continue}
      p.carrierName=x.carrierName||p.carrierName;p.status=x.status||"unbekannt";p.statusText=x.statusText||"";
      p.etaDate=x.etaDate||null;p.etaFrom=x.etaFrom||null;p.etaTo=x.etaTo||null;p.location=x.location||null;p.events=x.events||[];
      p.checkedAt=x.checkedAt||new Date().toISOString();p.error=x.ok===false?(x.statusText||"Noch keine Trackingdaten"):null;p.u=Date.now();
    }
    save();toast("Alle Pakete aktualisiert");
  }catch(e){active.forEach(p=>{p.refreshing=false;p.error=e.message});save();toast("Refresh fehlgeschlagen")}
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
    /[A-Z]{2}\d{9}DE/g,
    /JJD[A-Z0-9]{10,24}/g,
    /\d{14}/g,
    /\d{11,12}/g
  ]){
    for(const m of joined.matchAll(re))add(m[0]);
  }
  for(const m of compact.matchAll(/(?:\d[\s-]*){11,20}/g))add(m[0]);
  return [...found].filter(n=>{
    if(/^1Z[A-Z0-9]{16}$/.test(n)||/^H\d{19}$/.test(n)||/^00340\d{15}$/.test(n)||/^[A-Z]{2}\d{9}DE$/.test(n)||/^JJD[A-Z0-9]{10,24}$/.test(n))return true;
    return /^\d{11,14}$/.test(n)||/^\d{20}$/.test(n);
  });
}
async function barcodeCandidates(file){
  if(!("BarcodeDetector" in window)||!("createImageBitmap" in window))return[];
  try{
    const formats=await BarcodeDetector.getSupportedFormats();
    const use=["code_128","code_39","ean_13","ean_8","itf"].filter(x=>formats.includes(x));
    if(!use.length)return[];
    const detector=new BarcodeDetector({formats:use});const bmp=await createImageBitmap(file);const codes=await detector.detect(bmp);bmp.close?.();
    return codes.map(x=>clean(x.rawValue)).filter(Boolean);
  }catch{return[]}
}
function renderOcr(){
  const box=$("#ocrCandidates");
  box.innerHTML=ocrFound.map((x,i)=>'<label class="candidate"><input type="checkbox" data-candidate="'+i+'" checked><span class="candidateText"><b>'+esc(x.number)+'</b><small>'+esc(x.carrier)+' · '+esc(x.source)+'</small></span></label>').join("");
  $("#addCandidates").hidden=!ocrFound.length;
}
async function scanScreenshots(files){
  files=[...files];if(!files.length)return;
  $("#ocrBox").hidden=false;$("#ocrCandidates").innerHTML="";$("#addCandidates").hidden=true;ocrFound=[];
  $("#ocrTitle").textContent="Screenshots werden gelesen …";$("#ocrProgress").textContent="0%";$("#ocrBar").style.width="0%";
  const seen=new Map();
  let worker=null;
  try{
    if(!window.Tesseract)throw new Error("OCR-Bibliothek konnte nicht geladen werden");
    worker=await Tesseract.createWorker("eng",1,{logger:m=>{
      if(m.status==="recognizing text"){
        const pct=Math.round(((m.progress||0)*100));
        $("#ocrProgress").textContent=pct+"%";$("#ocrBar").style.width=pct+"%";
      }
    }});
    await worker.setParameters({tessedit_char_whitelist:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789- "});
    for(let i=0;i<files.length;i++){
      $("#ocrTitle").textContent="Bild "+(i+1)+" von "+files.length+" wird gelesen …";
      const bars=await barcodeCandidates(files[i]);
      for(const n of bars)if(!seen.has(n))seen.set(n,{number:n,carrier:guessCarrier(n),source:"Barcode"});
      const result=await worker.recognize(files[i]);
      const nums=extractCandidates(result&&result.data&&result.data.text||"");
      for(const n of nums)if(!seen.has(n))seen.set(n,{number:n,carrier:guessCarrier(n),source:"OCR · Bild "+(i+1)});
    }
    ocrFound=[...seen.values()].filter(x=>!parcels.some(p=>p.number===x.number));
    $("#ocrTitle").textContent=ocrFound.length?ocrFound.length+" mögliche Sendungsnummer"+(ocrFound.length===1?"":"n")+" gefunden":"Keine Sendungsnummer erkannt";
    $("#ocrProgress").textContent=ocrFound.length?"prüfen & speichern":"";
    $("#ocrBar").style.width="100%";renderOcr();
  }catch(e){
    $("#ocrTitle").textContent="Screenshot-Erkennung fehlgeschlagen";
    $("#ocrProgress").textContent="";$("#ocrCandidates").innerHTML='<div class="checked error">'+esc(e.message)+'</div>';
  }finally{try{await worker?.terminate()}catch{}}
}
$("#addForm").addEventListener("submit",async e=>{
  e.preventDefault();const p=addParcel($("#number").value,$("#name").value.trim());if(!p)return;
  e.target.reset();save();await refreshOne(p,{quiet:true});
});
$("#refreshAll").addEventListener("click",refreshAll);
$("#scanBtn").addEventListener("click",()=>$("#screenshots").click());
$("#screenshots").addEventListener("change",e=>scanScreenshots(e.target.files));
$("#addCandidates").addEventListener("click",async()=>{
  const selected=$$("[data-candidate]:checked").map(el=>ocrFound[Number(el.dataset.candidate)]).filter(Boolean);
  const added=[];for(const x of selected){const p=addParcel(x.number);if(p)added.push(p)}
  save();$("#ocrBox").hidden=true;$("#screenshots").value="";toast(added.length+" Paket"+(added.length===1?"":"e")+" gespeichert");
  if(apiBase()!==null&&added.length)await refreshAll();
});
$("#list").addEventListener("click",e=>{
  const card=e.target.closest(".parcel");if(!card)return;const p=parcels.find(x=>x.id===card.dataset.id);if(!p)return;
  if(e.target.closest("[data-refresh]"))refreshOne(p);
  if(e.target.closest("[data-edit]")){$("#editId").value=p.id;$("#editName").value=p.name||"";$("#editNumber").textContent=p.number;$("#editDialog").showModal()}
  if(e.target.closest("[data-remove]")){if(confirm("Paket löschen?")){parcels=parcels.filter(x=>x.id!==p.id);save()}}
});
$("#saveEdit").addEventListener("click",()=>{const p=parcels.find(x=>x.id===$("#editId").value);if(p){p.name=$("#editName").value.trim();p.u=Date.now();save()}$("#editDialog").close()});
$("#deleteParcel").addEventListener("click",()=>{const id=$("#editId").value;if(confirm("Paket wirklich löschen?")){parcels=parcels.filter(x=>x.id!==id);save();$("#editDialog").close()}});
$$(".tab").forEach(b=>b.addEventListener("click",()=>{$$(".tab").forEach(x=>x.classList.remove("on"));b.classList.add("on");filter=b.dataset.filter;render()}));
$("#infoBtn").addEventListener("click",()=>$("#infoDialog").showModal());
$$("[data-close]").forEach(b=>b.addEventListener("click",()=>b.closest("dialog").close()));
if("serviceWorker" in navigator)addEventListener("load",()=>navigator.serviceWorker.register("./sw.js",{scope:"./"}).catch(()=>{}));
render();
setTimeout(()=>{if(apiBase()!==null&&parcels.some(p=>p.status!=="zugestellt"&&(!p.checkedAt||Date.now()-new Date(p.checkedAt).getTime()>15*60*1000)))refreshAll()},700);
