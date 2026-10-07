const STORAGE="paket119.inbox.v3";
const PREVIOUS=["paket119.inbox.v2","paket119.v1"];
const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
let filter="open";
let ocrFound=[];
let parcels=load();
let widgetPromise=null;

function uid(){return crypto.randomUUID?crypto.randomUUID():String(Date.now())+Math.random().toString(16).slice(2)}
function clean(v){return String(v||"").trim().toUpperCase().replace(/[\s-]+/g,"")}
function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]))}
function guessCarrier(n){
  n=clean(n);
  if(/^1Z[A-Z0-9]{16}$/.test(n))return"UPS";
  if(/^H\d{19}$/.test(n))return"Hermes";
  if(/^00340\d{15}$/.test(n)||/^[A-Z]{2}\d{9}DE$/.test(n)||/^JJD/i.test(n))return"DHL";
  if(/^\d{14}$/.test(n))return"Auto · DPD/Hermes";
  if(/^\d{11,12}$/.test(n))return"Auto · GLS/DHL";
  return"Auto · 17TRACK";
}
function migrate(arr){
  return (Array.isArray(arr)?arr:[]).map(p=>({
    id:p.id||uid(),
    number:clean(p.number),
    name:p.name||"",
    carrierName:p.carrierName||guessCarrier(p.number),
    done:Boolean(p.done||p.status==="zugestellt"),
    createdAt:p.createdAt||p.u||Date.now(),
    updatedAt:p.updatedAt||p.u||Date.now()
  })).filter(p=>p.number);
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
function save(){persist();render()}
function toast(s){const e=document.createElement("div");e.className="toast";e.textContent=s;document.body.append(e);setTimeout(()=>e.remove(),1800)}
function hostId(p){return"trk_"+String(p.id).replace(/[^a-zA-Z0-9_-]/g,"_")}
function filtered(){
  let q=[...parcels].sort((a,b)=>(b.updatedAt||0)-(a.updatedAt||0));
  if(filter==="open")q=q.filter(p=>!p.done);
  if(filter==="done")q=q.filter(p=>p.done);
  return q;
}

function ensureWidget(){
  if(window.YQV5&&typeof window.YQV5.trackSingle==="function")return Promise.resolve(window.YQV5);
  if(widgetPromise)return widgetPromise;
  widgetPromise=new Promise((resolve,reject)=>{
    const existing=document.querySelector('script[data-paket119-17track]');
    if(existing){
      const poll=setInterval(()=>{
        if(window.YQV5&&typeof window.YQV5.trackSingle==="function"){clearInterval(poll);resolve(window.YQV5)}
      },100);
      setTimeout(()=>{clearInterval(poll);if(window.YQV5)resolve(window.YQV5);else reject(new Error("17TRACK konnte nicht geladen werden"))},10000);
      return;
    }
    const s=document.createElement("script");
    s.src="https://www.17track.net/externalcall.js";
    s.async=true;
    s.dataset.paket11917track="1";
    s.onload=()=>window.YQV5?resolve(window.YQV5):reject(new Error("17TRACK nicht verfügbar"));
    s.onerror=()=>reject(new Error("17TRACK konnte nicht geladen werden"));
    document.head.appendChild(s);
  });
  return widgetPromise;
}

async function mountOne(p){
  if(p.done)return;
  const box=document.getElementById(hostId(p));
  if(!box)return;
  box.innerHTML='<div class="trackerLoading">Live-Status wird geladen …</div>';
  try{
    const yq=await ensureWidget();
    if(!document.getElementById(hostId(p)))return;
    box.innerHTML="";
    yq.trackSingle({
      YQ_ContainerId:hostId(p),
      YQ_Height:360,
      YQ_Fc:"0",
      YQ_Lang:"de",
      YQ_Num:p.number
    });
  }catch(e){
    box.innerHTML='<div class="trackerError">'+esc(e.message)+'<br>Tippe oben auf ↻ und versuche es erneut.</div>';
  }
}
async function mountVisible(){
  const open=filtered().filter(p=>!p.done);
  if(!open.length)return;
  try{await ensureWidget()}catch{}
  for(const p of open){
    mountOne(p);
    await new Promise(r=>setTimeout(r,120));
  }
}
function render(){
  $("#allCount").textContent=parcels.length;
  $("#openCount").textContent=parcels.filter(p=>!p.done).length;
  $("#doneCount").textContent=parcels.filter(p=>p.done).length;
  const q=filtered();
  $("#empty").hidden=!!q.length;
  $("#list").innerHTML=q.map(p=>
    '<article class="parcel" data-id="'+esc(p.id)+'">'+
      '<div class="parcelTop">'+
        '<div><div class="carrier">'+esc(p.carrierName||guessCarrier(p.number))+'</div>'+
        '<div class="name">'+esc(p.name||"Ohne Bezeichnung")+'</div>'+
        '<div class="number">'+esc(p.number)+'</div></div>'+
        '<span class="liveBadge '+(p.done?"doneBadge":"")+'">'+(p.done?"ERLEDIGT":"LIVE")+'</span>'+
      '</div>'+
      (!p.done?'<div class="trackerWrap"><div class="trackerTitle"><b>17TRACK Live-Status</b><span>automatisch</span></div><div class="trackerHost" id="'+hostId(p)+'"><div class="trackerLoading">Live-Status wird geladen …</div></div></div>':'')+
      '<div class="actions">'+
        (!p.done?'<button class="refreshOne" data-refresh>↻ Prüfen</button>':'')+
        '<button class="editBtn" data-edit>Umbenennen</button>'+
        '<button class="doneBtn '+(p.done?"undo":"")+'" data-done>'+(p.done?"Zurück":"Erledigt")+'</button>'+
        '<button class="removeBtn" data-remove>×</button>'+
      '</div>'+
    '</article>'
  ).join("");
  requestAnimationFrame(()=>mountVisible());
}
function addParcel(number,name=""){
  number=clean(number);
  if(!number)return null;
  const existing=parcels.find(p=>p.number===number);
  if(existing){
    if(name&&!existing.name)existing.name=name;
    existing.done=false;
    existing.updatedAt=Date.now();
    return existing;
  }
  const p={id:uid(),number,name,carrierName:guessCarrier(number),done:false,createdAt:Date.now(),updatedAt:Date.now()};
  parcels.push(p);
  return p;
}
async function refreshOne(p){
  const box=document.getElementById(hostId(p));
  if(box)box.innerHTML='<div class="trackerLoading">Live-Status wird neu geladen …</div>';
  widgetPromise=null;
  const old=document.querySelector('script[data-paket119-17track]');
  if(old)old.remove();
  await mountOne(p);
  toast("Live-Status aktualisiert");
}
async function refreshAll({quiet=false}={}){
  const open=parcels.filter(p=>!p.done);
  if(!open.length){if(!quiet)toast("Keine offenen Pakete");return}
  widgetPromise=null;
  const old=document.querySelector('script[data-paket119-17track]');
  if(old)old.remove();
  for(const p of open){
    const box=document.getElementById(hostId(p));
    if(box)box.innerHTML='<div class="trackerLoading">Live-Status wird neu geladen …</div>';
  }
  await mountVisible();
  if(!quiet)toast("Alle Live-Status aktualisiert");
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
    await worker.setParameters({tessedit_char_whitelist:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789- "});
    for(let i=0;i<files.length;i++){
      $("#ocrTitle").textContent="Bild "+(i+1)+" von "+files.length+" wird gelesen …";
      const bars=await barcodeCandidates(files[i]);
      for(const n of bars)if(!seen.has(n))seen.set(n,{number:n,carrier:guessCarrier(n),source:"Barcode"});
      const result=await worker.recognize(files[i]);
      for(const n of extractCandidates(result&&result.data&&result.data.text||"")){
        if(!seen.has(n))seen.set(n,{number:n,carrier:guessCarrier(n),source:"OCR · Bild "+(i+1)});
      }
    }
    ocrFound=[...seen.values()].filter(x=>!parcels.some(p=>p.number===x.number));
    $("#ocrTitle").textContent=ocrFound.length?ocrFound.length+" mögliche Sendungsnummer"+(ocrFound.length===1?"":"n")+" gefunden":"Keine Sendungsnummer erkannt";
    $("#ocrProgress").textContent=ocrFound.length?"prüfen & speichern":"";
    $("#ocrBar").style.width="100%";
    renderOcr();
  }catch(e){
    $("#ocrTitle").textContent="Screenshot-Erkennung fehlgeschlagen";
    $("#ocrProgress").textContent="";
    $("#ocrCandidates").innerHTML='<div class="trackerError">'+esc(e.message)+'</div>';
  }finally{try{if(worker)await worker.terminate()}catch{}}
}

$("#addForm").addEventListener("submit",e=>{
  e.preventDefault();
  const p=addParcel($("#number").value,$("#name").value.trim());
  if(!p)return;
  e.target.reset();
  persist();
  filter="open";
  $$(".tab").forEach(x=>x.classList.toggle("on",x.dataset.filter==="open"));
  render();
  toast("Paket gespeichert");
});
$("#refreshAll").addEventListener("click",()=>refreshAll());
$("#scanBtn").addEventListener("click",()=>$("#screenshots").click());
$("#screenshots").addEventListener("change",e=>scanScreenshots(e.target.files));
$("#addCandidates").addEventListener("click",()=>{
  const selected=$$("[data-candidate]:checked").map(el=>ocrFound[Number(el.dataset.candidate)]).filter(Boolean);
  let count=0;
  for(const x of selected){const before=parcels.length;addParcel(x.number);if(parcels.length>before)count++}
  persist();
  $("#ocrBox").hidden=true;
  $("#screenshots").value="";
  filter="open";
  $$(".tab").forEach(x=>x.classList.toggle("on",x.dataset.filter==="open"));
  render();
  toast(count+" Paket"+(count===1?"":"e")+" gespeichert");
});
$("#list").addEventListener("click",e=>{
  const card=e.target.closest(".parcel");if(!card)return;
  const p=parcels.find(x=>x.id===card.dataset.id);if(!p)return;
  if(e.target.closest("[data-refresh]"))refreshOne(p);
  if(e.target.closest("[data-edit]")){
    $("#editId").value=p.id;$("#editName").value=p.name||"";$("#editNumber").textContent=p.number;$("#editDialog").showModal();
  }
  if(e.target.closest("[data-done]")){
    p.done=!p.done;p.updatedAt=Date.now();persist();render();toast(p.done?"Als erledigt markiert":"Wieder geöffnet");
  }
  if(e.target.closest("[data-remove]")){
    if(confirm("Paket löschen?")){parcels=parcels.filter(x=>x.id!==p.id);save()}
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
render();
setInterval(()=>{if(document.visibilityState==="visible")refreshAll({quiet:true})},15*60*1000);
