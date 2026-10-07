const UA="Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Safari/604.1";
const samples={
  DHL:"00340000000000000000",
  DPD:"00000000000000",
  GLS:"00000000000",
  Hermes:"H0000000000000000000",
  UPS:"1Z0000000000000000"
};
function detect(n){
  if(/^1Z[A-Z0-9]{16}$/.test(n))return["UPS"];
  if(/^H\d{19}$/.test(n))return["Hermes"];
  if(/^00340\d{15}$/.test(n)||/^[A-Z]{2}\d{9}DE$/.test(n)||/^JJD/i.test(n))return["DHL"];
  if(/^\d{11,12}$/.test(n))return["GLS","DHL"];
  if(/^\d{14}$/.test(n))return["DPD","Hermes"];
  return["unknown"];
}
function mapStatus(v){
  const s=String(v||"").toLowerCase();
  if(/delivered|zugestellt|erfolgreich zugestellt|collected|picked up/.test(s))return"zugestellt";
  if(/out for delivery|in delivery|in zustellung|zustellfahrzeug|delivery tour/.test(s))return"heute";
  if(/pickup|abhol|paketshop|parcelshop|ready for collection/.test(s))return"abholung";
  if(/exception|failure|returned|cancelled|not deliver|problem/.test(s))return"problem";
  if(/pre-transit|preadvice|angekündigt|elektronisch angekündigt/.test(s))return"angekündigt";
  return"unterwegs";
}
async function test(name,number){
  const base={carrier:name,number,detected:detect(number)};
  try{
    let r, body="";
    if(name==="DHL"){
      const u=new URL("https://www.dhl.de/int-verfolgen/data/search");
      u.searchParams.set("piececode",number);u.searchParams.set("noRedirect","true");u.searchParams.set("language","de");u.searchParams.set("cid","app");
      r=await fetch(u,{headers:{"User-Agent":UA,"Accept":"application/json","Accept-Language":"de-DE,de;q=0.9"}});
      body=await r.text();
      let parsed=null;try{parsed=JSON.parse(body)}catch{}
      const shipments=parsed?.sendungen||parsed?.shipments||[];
      return {...base,http:r.status,contentType:r.headers.get("content-type"),hasShipment:Array.isArray(shipments)&&shipments.length>0,preview:body.slice(0,220).replace(/\s+/g," ")};
    }
    if(name==="DPD"){
      const u=new URL("https://my.dpd.de/redirect.aspx");u.searchParams.set("action","12");u.searchParams.set("parcelno",number);
      r=await fetch(u,{redirect:"follow",headers:{"User-Agent":UA,"Accept-Language":"de-DE,de;q=0.9"}});
      body=await r.text();
      return {...base,http:r.status,finalUrl:r.url,hasParcelId:body.includes("ContentPlaceHolder1_repParcelList_labParcelNo_0"),preview:body.slice(0,180).replace(/\s+/g," ")};
    }
    if(name==="GLS"){
      const u=new URL("https://gls-group.com/app/service/open/rest/DE/de/rstt029");
      u.searchParams.set("match",number);u.searchParams.set("type","");u.searchParams.set("caller","witt002");u.searchParams.set("millis",String(Date.now()));
      r=await fetch(u,{headers:{Accept:"application/json"}});body=await r.text();
      let parsed=null;try{parsed=JSON.parse(body)}catch{}
      const x=Array.isArray(parsed?.tuStatus)?parsed.tuStatus[0]:null;
      return {...base,http:r.status,lastError:x?.lastError?.errorCode||parsed?.lastError?.errorCode||null,hasProgress:!!x?.progressBar,eventCount:Array.isArray(x?.history)?x.history.length:null,preview:body.slice(0,220).replace(/\s+/g," ")};
    }
    if(name==="Hermes"){
      r=await fetch("https://api.my-deliveries.de/tnt/v2/shipments/search/"+encodeURIComponent(number),{headers:{Accept:"application/json","X-Language":"de"}});
      body=await r.text();let parsed=null;try{parsed=JSON.parse(body)}catch{}
      return {...base,http:r.status,count:Array.isArray(parsed)?parsed.length:null,preview:body.slice(0,220).replace(/\s+/g," ")};
    }
    if(name==="UPS"){
      return {...base,http:null,note:"Live API correctly requires UPS OAuth credentials; format detection still testable."};
    }
  }catch(e){return {...base,error:String(e)}}
}
const results=[];
for(const [name,n] of Object.entries(samples))results.push(await test(name,n));
console.log("NETWORK_RESULTS="+JSON.stringify(results));
const statusCases=["Elektronisch angekündigt","Paket ist unterwegs","In Zustellung","Zur Abholung bereit","Zugestellt","Delivery exception"];
console.log("STATUS_MAPPING="+JSON.stringify(statusCases.map(x=>({input:x,normalized:mapStatus(x)}))));
