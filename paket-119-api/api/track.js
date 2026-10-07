const TIMEOUT=18000;
const UA="Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Safari/604.1";

function clean(v){return String(v||"").trim().toUpperCase().replace(/[\s-]+/g,"")}
function good(v){return /^[A-Z0-9.]{6,40}$/.test(v)}
function status(v){
  const s=String(v||"").toLowerCase();
  if(/delivered|zugestellt|erfolgreich zugestellt|collected|picked up/.test(s))return"zugestellt";
  if(/out for delivery|in delivery|in zustellung|zustellfahrzeug|delivery tour/.test(s))return"heute";
  if(/pickup|abhol|paketshop|parcelshop|ready for collection/.test(s))return"abholung";
  if(/exception|failure|returned|cancelled|not deliver|problem/.test(s))return"problem";
  if(/pre-transit|preadvice|angekündigt|elektronisch angekündigt/.test(s))return"angekündigt";
  return"unterwegs";
}
function reply(carrier,text,extra){
  return Object.assign({ok:true,carrier:carrier,status:status(text),statusText:text||"Status verfügbar",checkedAt:new Date().toISOString()},extra||{});
}
async function get(url,opt){
  const c=new AbortController();const timer=setTimeout(function(){c.abort()},TIMEOUT);
  try{return await fetch(url,Object.assign({},opt||{},{signal:c.signal}))}finally{clearTimeout(timer)}
}
function span(page,id){
  const token='id="'+id+'"';let p=page.indexOf(token);if(p<0)return null;
  p=page.indexOf(">",p);if(p<0)return null;const q=page.indexOf("<",p+1);if(q<0)return null;
  return page.slice(p+1,q).replace(/&amp;/g,"&").replace(/&nbsp;/g," ").trim();
}
function candidates(n){
  if(/^1Z[A-Z0-9]{16}$/.test(n))return["ups"];
  if(/^H\d{19}$/.test(n))return["hermes"];
  if(/^00340\d{15}$/.test(n)||/^[A-Z]{2}\d{9}DE$/.test(n)||/^JJD/i.test(n))return["dhl"];
  if(/^\d{11,12}$/.test(n))return["gls","dhl"];
  if(/^\d{14}$/.test(n))return["dpd","hermes"];
  return["dhl","dpd","gls","hermes","ups"];
}
async function dhl(n){
  const u=new URL("https://www.dhl.de/int-verfolgen/data/search");
  u.searchParams.set("piececode",n);u.searchParams.set("noRedirect","true");u.searchParams.set("language","de");u.searchParams.set("cid","app");
  const r=await get(u,{headers:{"User-Agent":UA,"Accept":"application/json","Accept-Language":"de-DE,de;q=0.9"}});
  if(!r.ok)throw new Error("NOT_FOUND");
  const d=await r.json();const x=Array.isArray(d.sendungen)?d.sendungen[0]:null;
  const det=x&&x.sendungsdetails;if(!det)throw new Error("NOT_FOUND");
  const flow=det.sendungsverlauf||{};const events=Array.isArray(flow.events)?flow.events:[];
  const latest=events[0]||{};const text=flow.kurzStatus||latest.status||latest.eventStatus||latest.text||det.status||"Status verfügbar";
  const eta=det.produkt&&det.produkt.erwarteteZustellung?det.produkt.erwarteteZustellung:null;
  return reply("dhl",text,{carrierName:"DHL",etaText:eta,events:events.slice(0,8).map(function(e){return{text:e.status||e.eventStatus||e.text||"",date:e.datum||e.timestamp||null,location:e.ort||e.location||null}})});
}
async function dpd(n){
  const u=new URL("https://my.dpd.de/redirect.aspx");u.searchParams.set("action","12");u.searchParams.set("parcelno",n);
  const r=await get(u,{headers:{"User-Agent":UA,"Accept-Language":"de-DE,de;q=0.9"}});if(!r.ok)throw new Error("NOT_FOUND");
  const page=await r.text();if(!span(page,"ContentPlaceHolder1_repParcelList_labParcelNo_0"))throw new Error("NOT_FOUND");
  const txt=span(page,"ContentPlaceHolder1_repParcelList_labDeliveryStatus_0")||"Status verfügbar";
  const stages=[["Start","Paketinfo an DPD übergeben"],["OnTheRoad","Paket unterwegs"],["DeliveryDepot","Im Paketzustellzentrum"],["CarLoad","In Zustellung"],["Delivered","Zugestellt"]];
  const ev=[];for(const s of stages){const d=span(page,"ContentPlaceHolder1_labStatus"+s[0]+"Date");if(d)ev.push({text:s[1],date:d})}
  const last=ev.length?ev[ev.length-1]:null;const text=last&&/Zugestellt|Zustellung/.test(last.text)?last.text:txt;
  return reply("dpd",text,{carrierName:"DPD",events:ev.reverse(),etaText:last&&last.text==="In Zustellung"?"Zustellung heute":null});
}
async function gls(n){
  const number=/^\d{12}$/.test(n)?n.slice(0,11):n;
  const u=new URL("https://gls-group.com/app/service/open/rest/DE/de/rstt029");
  u.searchParams.set("match",number);u.searchParams.set("type","");u.searchParams.set("caller","witt002");u.searchParams.set("millis",String(Date.now()));
  const r=await get(u,{headers:{Accept:"application/json"}});if(!r.ok)throw new Error("NOT_FOUND");
  const d=await r.json();const x=Array.isArray(d.tuStatus)?d.tuStatus[0]:null;if(!x||!x.progressBar)throw new Error("NOT_FOUND");
  const p=x.progressBar;let text=p.statusText||p.statusInfo||"Status verfügbar";
  if(Array.isArray(p.statusBar)){const cur=p.statusBar.find(function(z){return z&&z.imageStatus==="CURRENT"});if(cur&&cur.statusText)text=cur.statusText}
  return reply("gls",text,{carrierName:"GLS",etaText:x.arrivalTime&&x.arrivalTime.value?x.arrivalTime.value:null,events:[]});
}
async function hermes(n){
  const r=await get("https://api.my-deliveries.de/tnt/v2/shipments/search/"+encodeURIComponent(n),{headers:{Accept:"application/json","X-Language":"de"}});
  if(!r.ok)throw new Error("NOT_FOUND");const d=await r.json();const p=Array.isArray(d)?d[0]:null;if(!p)throw new Error("NOT_FOUND");
  const ev=Array.isArray(p.parcelProgress)?p.parcelProgress.filter(function(e){return e&&e.parcelStatus&&e.parcelStatus!=="EDL_BOOKED_DROPOFF"}):[];
  const cur=ev[0]||{};const text=cur.parcelStatus==="DELIVERED_DROPOFF"?"Am Wunschablageort zugestellt":(cur.historyText||cur.parcelStatus||"Status verfügbar");
  return reply("hermes",text,{carrierName:"Hermes",events:ev.slice(0,8).map(function(e){return{text:e.historyText||e.parcelStatus,date:e.timestamp||null}})});
}
let token=null,until=0;
async function ups(n){
  const id=process.env.UPS_CLIENT_ID,secret=process.env.UPS_CLIENT_SECRET;if(!id||!secret)throw new Error("NO_CREDENTIALS");
  if(!token||Date.now()>until){
    const a=await get("https://onlinetools.ups.com/security/v1/oauth/token",{method:"POST",headers:{Authorization:"Basic "+Buffer.from(id+":"+secret).toString("base64"),"Content-Type":"application/x-www-form-urlencoded"},body:"grant_type=client_credentials"});
    if(!a.ok)throw new Error("NO_CREDENTIALS");const j=await a.json();token=j.access_token;until=Date.now()+(Number(j.expires_in||3600)-60)*1000;
  }
  const r=await get("https://onlinetools.ups.com/api/track/v1/details/"+encodeURIComponent(n)+"?locale=de_DE",{headers:{Authorization:"Bearer "+token,transId:crypto.randomUUID(),transactionSrc:"paket119",Accept:"application/json"}});
  if(!r.ok)throw new Error("NOT_FOUND");const d=await r.json();const p=d.trackResponse&&d.trackResponse.shipment&&d.trackResponse.shipment[0]&&d.trackResponse.shipment[0].package&&d.trackResponse.shipment[0].package[0];
  if(!p)throw new Error("NOT_FOUND");const acts=Array.isArray(p.activity)?p.activity:[];const cur=p.currentStatus||(acts[0]&&acts[0].status)||{};const text=cur.description||"Status verfügbar";
  const dates=Array.isArray(p.deliveryDate)?p.deliveryDate:[];const eta=(dates.find(function(x){return x.type==="RDD"})||dates.find(function(x){return x.type==="SDD"})||{}).date||null;
  return reply("ups",text,{carrierName:"UPS",etaText:eta,events:acts.slice(0,8).map(function(e){return{text:e.status&&e.status.description||"",date:(e.date||"")+" "+(e.time||""),location:e.location&&e.location.address&&e.location.address.city||null}})});
}
async function track17(n){
  const key=process.env.TRACK17_API_KEY;if(!key)throw new Error("NO_CREDENTIALS");
  const h={"Content-Type":"application/json","17token":key};const body=JSON.stringify([{number:n}]);
  await get("https://api.17track.net/track/v2.2/register",{method:"POST",headers:h,body:body}).catch(function(){});
  const r=await get("https://api.17track.net/track/v2.2/gettrackinfo",{method:"POST",headers:h,body:body});if(!r.ok)throw new Error("NOT_FOUND");
  const d=await r.json();const x=d.data&&d.data.accepted&&d.data.accepted[0];const info=x&&(x.track_info||x.trackInfo);if(!info)throw new Error("NOT_FOUND");
  const latest=info.latest_event||info.latestEvent||{};const text=latest.description||(info.latest_status&&info.latest_status.status)||"Status verfügbar";
  return reply("track17",text,{carrierName:"17TRACK",events:[]});
}
const handlers={dhl:dhl,dpd:dpd,gls:gls,hermes:hermes,ups:ups};
export default async function handler(req,res){
  res.setHeader("Cache-Control","no-store");res.setHeader("Access-Control-Allow-Origin","*");res.setHeader("Access-Control-Allow-Headers","content-type");
  if(req.method==="OPTIONS")return res.status(204).end();if(req.method!=="POST")return res.status(405).json({ok:false,error:"POST only"});
  const n=clean(req.body&&req.body.number);if(!good(n))return res.status(400).json({ok:false,error:"Ungültige Sendungsnummer"});
  const tried=[];for(const c of candidates(n)){tried.push(c);try{return res.status(200).json(await handlers[c](n))}catch(e){}}
  for(const c of ["dhl","dpd","gls","hermes"]){if(tried.includes(c))continue;tried.push(c);try{return res.status(200).json(await handlers[c](n))}catch(e){}}
  try{return res.status(200).json(await track17(n))}catch(e){return res.status(422).json({ok:false,error:"Kein Live-Status gefunden",tried:tried})}
}