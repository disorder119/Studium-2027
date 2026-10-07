
export type Status = "angekündigt"|"unterwegs"|"heute"|"abholung"|"problem"|"zugestellt"|"unbekannt";
export type TrackingEvent = { text:string; date:string|null; location:string|null };
export type TrackResult = {
  ok:boolean;
  number:string;
  carrier:string;
  carrierName:string;
  status:Status;
  statusText:string;
  etaText:string|null;
  location:string|null;
  events:TrackingEvent[];
  checkedAt:string;
  error?:string;
};

const UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36";
const TIMEOUT=16000;

export function cleanNumber(value:unknown):string {
  return String(value??"").trim().toUpperCase().replace(/[\s-]+/g,"");
}

function normalizeStatus(value:string):Status {
  const s=value.toLowerCase();
  if(/delivered|zugestellt|erfolgreich zugestellt|picked up by recipient|collected/.test(s)) return "zugestellt";
  if(/out for delivery|in delivery|in zustellung|zustellfahrzeug|carload/.test(s)) return "heute";
  if(/ready for pickup|available for pickup|abholbereit|paketshop|parcelshop|access point/.test(s)) return "abholung";
  if(/exception|failure|returned|return to sender|cancelled|not deliver|problem|delay|delayed|action required/.test(s)) return "problem";
  if(/label created|pre.?transit|preadvice|angekündigt|elektronisch angekündigt|shipment ready/.test(s)) return "angekündigt";
  if(/transit|unterwegs|transport|arrived|departed|processing|customs|clearance|on the way|we have your package/.test(s)) return "unterwegs";
  return "unbekannt";
}

function result(number:string,carrier:string,carrierName:string,statusText:string,extra:Partial<TrackResult>={}):TrackResult {
  return {
    ok:true,number,carrier,carrierName,
    status:normalizeStatus(statusText),
    statusText:statusText||"Status verfügbar",
    etaText:null,location:null,events:[],
    checkedAt:new Date().toISOString(),
    ...extra
  };
}

async function fetchTimed(url:string,init:RequestInit={}):Promise<Response>{
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),TIMEOUT);
  try {
    return await fetch(url,{...init,signal:controller.signal});
  } finally {
    clearTimeout(timer);
  }
}

function htmlText(v:string):string {
  return v.replace(/&amp;/g,"&").replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&nbsp;/g," ").trim();
}
function span(page:string,id:string):string|null {
  const token='id="'+id+'"';
  let start=page.indexOf(token);
  if(start<0)return null;
  start=page.indexOf(">",start);
  if(start<0)return null;
  const end=page.indexOf("<",start+1);
  return end<0?null:htmlText(page.slice(start+1,end));
}

function candidates(n:string):string[] {
  if(/^1Z[A-Z0-9]{16}$/.test(n))return["ups"];
  if(/^H\d{19}$/.test(n))return["hermes"];
  if(/^00340\d{15}$/.test(n)||/^[A-Z]{2}\d{9}DE$/.test(n)||/^JJD[A-Z0-9]+$/.test(n))return["dhl"];
  if(/^\d{11,12}$/.test(n))return["gls","dhl"];
  if(/^\d{14}$/.test(n))return["dpd","hermes"];
  if(/^\d{20}$/.test(n))return["dhl","hermes"];
  return["dhl","dpd","gls","hermes","ups"];
}

function asObject(v:unknown):Record<string,unknown>|null {
  return v!==null&&typeof v==="object"&&!Array.isArray(v)?v as Record<string,unknown>:null;
}
function asArray(v:unknown):unknown[] { return Array.isArray(v)?v:[]; }
function str(v:unknown):string { return typeof v==="string"?v:""; }

async function trackDhl(number:string):Promise<TrackResult> {
  const url=new URL("https://www.dhl.com/utapi");
  url.searchParams.set("trackingNumber",number);
  url.searchParams.set("language","en");
  url.searchParams.set("requesterCountryCode","DE");
  url.searchParams.set("source","tt");
  const response=await fetchTimed(url.toString(),{headers:{"User-Agent":UA,Accept:"application/json","Accept-Language":"de-DE,de;q=0.9,en;q=0.7"}});
  if(!response.ok)throw new Error("DHL_HTTP_"+response.status);
  const type=response.headers.get("content-type")||"";
  if(!type.includes("json"))throw new Error("DHL_NON_JSON");
  const data:unknown=await response.json();
  const root=asObject(data);
  const shipments=asArray(root?.shipments);
  const shipment=asObject(shipments[0]) ?? asObject(root?.shipment) ?? root;
  if(!shipment)throw new Error("NOT_FOUND");

  const current=asObject(shipment.status) ?? asObject(shipment.currentStatus) ?? {};
  let statusText=str(current.description)||str(current.status)||str(shipment.statusDescription)||str(shipment.status);
  const rawEvents=asArray(shipment.events ?? shipment.checkpoints ?? shipment.history);
  const events:TrackingEvent[]=rawEvents.slice(0,8).map((raw)=>{
    const e=asObject(raw)??{};
    const loc=asObject(e.location);
    const address=asObject(loc?.address);
    return {
      text:str(e.description)||str(e.status)||str(e.remark),
      date:str(e.timestamp)||str(e.date)||null,
      location:str(address?.addressLocality)||str(loc?.name)||str(e.location)||null
    };
  }).filter(e=>e.text);
  if(!statusText&&events[0])statusText=events[0].text;
  if(!statusText)throw new Error("NOT_FOUND");
  const frame=asObject(shipment.estimatedDeliveryTimeFrame)??{};
  const eta=str(shipment.estimatedTimeOfDelivery)||str(frame.estimatedThrough)||null;
  return result(number,"dhl","DHL",statusText,{etaText:eta,events,location:events[0]?.location??null});
}

async function trackDpd(number:string):Promise<TrackResult> {
  const url=new URL("https://my.dpd.de/redirect.aspx");
  url.searchParams.set("action","12");
  url.searchParams.set("parcelno",number);
  const response=await fetchTimed(url.toString(),{headers:{"User-Agent":UA,"Accept-Language":"de-DE,de;q=0.9"}});
  if(!response.ok)throw new Error("DPD_HTTP_"+response.status);
  const page=await response.text();
  if(!span(page,"ContentPlaceHolder1_repParcelList_labParcelNo_0"))throw new Error("NOT_FOUND");
  const pageStatus=span(page,"ContentPlaceHolder1_repParcelList_labDeliveryStatus_0")||"";
  const stages:[string,string][]=[
    ["Start","Paketinfo an DPD übergeben"],
    ["OnTheRoad","Paket unterwegs"],
    ["DeliveryDepot","Im Paketzustellzentrum"],
    ["CarLoad","In Zustellung"],
    ["Delivered","Zugestellt"]
  ];
  const events:TrackingEvent[]=[];
  for(const [key,text] of stages){
    const date=span(page,"ContentPlaceHolder1_labStatus"+key+"Date");
    if(date)events.push({text,date,location:null});
  }
  const latest=events.at(-1);
  const statusText=latest?.text||pageStatus||"Status verfügbar";
  return result(number,"dpd","DPD",statusText,{events:[...events].reverse(),etaText:statusText==="In Zustellung"?"Zustellung heute":null});
}

async function trackGls(number:string):Promise<TrackResult> {
  const lookup=/^\d{12}$/.test(number)?number.slice(0,11):number;
  const url=new URL("https://gls-group.com/app/service/open/rest/DE/de/rstt029");
  url.searchParams.set("match",lookup);
  url.searchParams.set("type","");
  url.searchParams.set("caller","witt002");
  url.searchParams.set("millis",String(Date.now()));
  const response=await fetchTimed(url.toString(),{headers:{Accept:"application/json","User-Agent":UA}});
  if(!response.ok)throw new Error("NOT_FOUND");
  const data:unknown=await response.json();
  const root=asObject(data);
  const item=asObject(asArray(root?.tuStatus)[0]);
  const progress=asObject(item?.progressBar);
  if(!item||!progress)throw new Error("NOT_FOUND");
  let statusText=str(progress.statusText)||str(progress.statusInfo);
  for(const raw of asArray(progress.statusBar)){
    const step=asObject(raw);
    if(step&&step.imageStatus==="CURRENT"&&str(step.statusText)){statusText=str(step.statusText);break}
  }
  if(!statusText)throw new Error("NOT_FOUND");
  const arrival=asObject(item.arrivalTime);
  return result(number,"gls","GLS",statusText,{etaText:str(arrival?.value)||null});
}

async function trackHermes(number:string):Promise<TrackResult> {
  const response=await fetchTimed("https://api.my-deliveries.de/tnt/v2/shipments/search/"+encodeURIComponent(number),{
    headers:{Accept:"application/json","X-Language":"de","User-Agent":UA}
  });
  if(!response.ok)throw new Error("HERMES_HTTP_"+response.status);
  const data:unknown=await response.json();
  const parcel=asObject(asArray(data)[0]);
  if(!parcel)throw new Error("NOT_FOUND");
  const raw=asArray(parcel.parcelProgress).map(asObject).filter((x):x is Record<string,unknown>=>x!==null);
  const usable=raw.filter(e=>str(e.parcelStatus)!=="EDL_BOOKED_DROPOFF");
  const current=usable[0]??{};
  const code=str(current.parcelStatus);
  const statusText=code==="DELIVERED_DROPOFF"?"Am Wunschablageort zugestellt":(str(current.historyText)||code||"Status verfügbar");
  const events:TrackingEvent[]=usable.slice(0,8).map(e=>({
    text:str(e.historyText)||str(e.parcelStatus),
    date:str(e.timestamp)||null,
    location:null
  }));
  return result(number,"hermes","Hermes",statusText,{events});
}

function parseCookies(response:Response):{cookie:string;csrf:string|null}{
  const h=response.headers as Headers & {getSetCookie?:()=>string[]};
  const raw=typeof h.getSetCookie==="function"?h.getSetCookie():[];
  const pieces=raw.map(v=>v.split(";")[0]).filter(Boolean);
  const csrfPair=pieces.find(v=>v.startsWith("X-XSRF-TOKEN-ST="));
  const csrf=csrfPair?decodeURIComponent(csrfPair.slice("X-XSRF-TOKEN-ST=".length)):null;
  return {cookie:pieces.join("; "),csrf};
}
function findUpsShipment(data:unknown):Record<string,unknown>|null{
  const root=asObject(data);
  const trackDetails=asArray(root?.trackDetails);
  if(trackDetails[0])return asObject(trackDetails[0]);
  const shipment=asArray(root?.shipment);
  if(shipment[0])return asObject(shipment[0]);
  return root;
}
async function trackUps(number:string):Promise<TrackResult> {
  const landing=await fetchTimed("https://www.ups.com/track?loc=de_DE&tracknum="+encodeURIComponent(number)+"&requester=ST/trackdetails",{
    headers:{"User-Agent":UA,"Accept-Language":"de-DE,de;q=0.9"}
  });
  const session=parseCookies(landing);
  const headers:Record<string,string>={
    "User-Agent":UA,
    "Content-Type":"application/json",
    Accept:"application/json",
    "Accept-Language":"de-DE,de;q=0.9",
    Referer:"https://www.ups.com/"
  };
  if(session.cookie)headers.Cookie=session.cookie;
  if(session.csrf)headers["X-XSRF-TOKEN"]=session.csrf;
  const response=await fetchTimed("https://www.ups.com/track/api/Track/GetStatus?loc=de_DE",{
    method:"POST",headers,
    body:JSON.stringify({Locale:"de_DE",TrackingNumber:[number]})
  });
  if(!response.ok)throw new Error("UPS_HTTP_"+response.status);
  const type=response.headers.get("content-type")||"";
  if(!type.includes("json"))throw new Error("UPS_NON_JSON");
  const data:unknown=await response.json();
  const shipment=findUpsShipment(data);
  if(!shipment)throw new Error("NOT_FOUND");
  const packageStatus=asObject(shipment.packageStatus)??asObject(shipment.currentStatus)??{};
  let statusText=str(packageStatus.description)||str(packageStatus.status)||str(shipment.statusText)||str(shipment.status);
  const rawEvents=asArray(shipment.events ?? shipment.activity ?? shipment.progressActivities);
  const events:TrackingEvent[]=rawEvents.slice(0,8).map(raw=>{
    const e=asObject(raw)??{};
    const st=asObject(e.status)??{};
    const loc=asObject(e.location)??{};
    const addr=asObject(loc.address)??{};
    return{
      text:str(e.description)||str(st.description)||str(e.status),
      date:str(e.timestamp)||[str(e.date),str(e.time)].filter(Boolean).join(" ")||null,
      location:str(addr.city)||str(e.location)||null
    };
  }).filter(e=>e.text);
  if(!statusText&&events[0])statusText=events[0].text;
  if(!statusText)throw new Error("NOT_FOUND");
  return result(number,"ups","UPS",statusText,{events,location:events[0]?.location??null});
}

const handlers:Record<string,(number:string)=>Promise<TrackResult>>={
  dhl:trackDhl,dpd:trackDpd,gls:trackGls,hermes:trackHermes,ups:trackUps
};

export async function trackNumber(input:unknown):Promise<TrackResult>{
  const number=cleanNumber(input);
  if(!/^[A-Z0-9.]{6,40}$/.test(number)){
    return {ok:false,number,carrier:"unknown",carrierName:"Unbekannt",status:"unbekannt",statusText:"Ungültige Sendungsnummer",etaText:null,location:null,events:[],checkedAt:new Date().toISOString(),error:"Ungültige Sendungsnummer"};
  }
  const tried:string[]=[];
  for(const carrier of candidates(number)){
    if(tried.includes(carrier))continue;
    tried.push(carrier);
    try{
      const hit=await handlers[carrier]?.(number);
      if(hit)return hit;
    }catch{}
  }
  return {
    ok:false,number,carrier:"unknown",carrierName:"Automatisch",status:"unbekannt",
    statusText:"Noch keine Trackingdaten gefunden",etaText:null,location:null,events:[],
    checkedAt:new Date().toISOString(),error:"Keiner der unterstützten Paketdienste lieferte Daten."
  };
}
