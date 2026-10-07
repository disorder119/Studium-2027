
const BASE="https://api.17track.net/track/v2.4";
const ALREADY=-18019901;
const STATUS={
  InfoReceived:"angekündigt",
  InTransit:"unterwegs",
  OutForDelivery:"heute",
  AvailableForPickup:"abholung",
  Delivered:"zugestellt",
  DeliveryFailure:"problem",
  Exception:"problem",
  NotFound:"unbekannt",
  Expired:"unbekannt"
};
export function normalizeNumber(v){
  return String(v||"").trim().toUpperCase().replace(/[\s-]+/g,"");
}
export function guessCarrier(n){
  n=normalizeNumber(n);
  if(/^1Z[A-Z0-9]{16}$/.test(n)) return "UPS";
  if(/^H\d{19}$/.test(n)) return "Hermes";
  if(/^00340\d{15}$/.test(n)||/^[A-Z]{2}\d{9}DE$/.test(n)||/^JJD/i.test(n)) return "DHL";
  if(/^\d{14}$/.test(n)) return "DPD / Hermes";
  if(/^\d{11,12}$/.test(n)) return "GLS / DHL";
  return "17TRACK";
}
function toIso(v){
  return typeof v==="string"&&v.trim()?v.trim():null;
}
function parseItem(item){
  const info=item&&item.track_info;
  if(!info||typeof info!=="object") return null;
  const latestStatus=info.latest_status||{};
  const raw=String(latestStatus.status||"");
  const latest=info.latest_event&&typeof info.latest_event==="object"?info.latest_event:{};
  const providers=info.tracking&&Array.isArray(info.tracking.providers)?info.tracking.providers:[];
  const events=[];
  for(const p of providers){
    for(const e of Array.isArray(p&&p.events)?p.events:[]){
      if(!e||!e.description) continue;
      events.push({
        text:String(e.description),
        date:toIso(e.time_iso)||toIso(e.time_utc),
        location:typeof e.location==="string"&&e.location.trim()?e.location.trim():null
      });
    }
  }
  events.sort((a,b)=>String(b.date||"").localeCompare(String(a.date||"")));
  const est=info.time_metrics&&info.time_metrics.estimated_delivery_date||{};
  const from=toIso(est.from),to=toIso(est.to);
  return {
    ok:true,
    number:String(item.number||""),
    carrierCode:Number.isInteger(item.carrier)?item.carrier:null,
    carrierName:guessCarrier(item.number),
    status:STATUS[raw]||"unbekannt",
    rawStatus:raw||null,
    statusText:typeof latest.description==="string"&&latest.description.trim()?latest.description.trim():(raw||"Status verfügbar"),
    location:typeof latest.location==="string"&&latest.location.trim()?latest.location.trim():(events[0]&&events[0].location||null),
    etaFrom:from,
    etaTo:to,
    etaDate:from?from.slice(0,10):null,
    deliveredAt:(STATUS[raw]==="zugestellt")?(toIso(latest.time_iso)||toIso(latest.time_utc)||(events[0]&&events[0].date)||null):null,
    events:events.slice(0,8),
    checkedAt:new Date().toISOString(),
    source:"17TRACK"
  };
}
async function post(endpoint,payload){
  const key=process.env.TRACK17_API_KEY;
  if(!key) throw new Error("TRACK17_API_KEY_MISSING");
  const r=await fetch(BASE+"/"+endpoint,{
    method:"POST",
    headers:{"Content-Type":"application/json","17token":key},
    body:JSON.stringify(payload)
  });
  if(!r.ok) throw new Error("17TRACK_HTTP_"+r.status);
  const body=await r.json();
  if(!body||body.code!==0) throw new Error("17TRACK_CODE_"+String(body&&body.code));
  return body.data||{};
}
export async function trackMany(numbers){
  const uniq=[...new Set(numbers.map(normalizeNumber).filter(Boolean))].slice(0,40);
  if(!uniq.length) return [];
  const reg=await post("register",uniq.map(number=>({number})));
  const carrierByNumber=new Map();
  for(const x of reg.accepted||[]){
    if(x&&x.number) carrierByNumber.set(String(x.number),Number.isInteger(x.carrier)?x.carrier:null);
  }
  for(const x of reg.rejected||[]){
    if(x&&x.number&&x.error&&x.error.code===ALREADY) carrierByNumber.set(String(x.number),null);
  }
  const request=uniq.map(number=>{
    const carrier=carrierByNumber.get(number);
    return carrier?{number,carrier}:{number};
  });
  const info=await post("gettrackinfo",request);
  const by=new Map();
  for(const item of info.accepted||[]){
    const parsed=parseItem(item);
    if(parsed) by.set(parsed.number,parsed);
  }
  const rejected=new Map();
  for(const item of info.rejected||[]){
    if(item&&item.number) rejected.set(String(item.number),item.error||{});
  }
  return uniq.map(number=>{
    if(by.has(number)) return by.get(number);
    const err=rejected.get(number);
    return {
      ok:false,
      number,
      carrierName:guessCarrier(number),
      status:"unbekannt",
      statusText:err&&err.message?String(err.message):"Noch keine Trackingdaten",
      errorCode:err&&err.code!=null?err.code:null,
      checkedAt:new Date().toISOString(),
      source:"17TRACK"
    };
  });
}
