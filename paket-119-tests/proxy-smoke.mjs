
const samples = {
  DHL: ["00340000000000000000","https://www.dhl.de/de/privatkunden/dhl-sendungsverfolgung.html?piececode=00340000000000000000"],
  DPD: ["00000000000000","https://my.dpd.de/redirect.aspx?action=12&parcelno=00000000000000"],
  GLS: ["00000000000","https://gls-group.com/app/service/open/rest/DE/de/rstt029?match=00000000000&type=&caller=witt002&millis="+Date.now()],
  Hermes: ["H0000000000000000000","https://api.my-deliveries.de/tnt/v2/shipments/search/H0000000000000000000"],
  UPS: ["1Z0000000000000000","https://www.ups.com/track?loc=de_DE&tracknum=1Z0000000000000000&requester=WT/"]
};
const proxies = [
  ["allorigins","https://api.allorigins.win/raw?url="],
  ["corsproxy","https://corsproxy.io/?url="],
  ["jina","https://r.jina.ai/http://r.jina.ai/http://invalid"]
];
for (const [carrier,[num,target]] of Object.entries(samples)) {
  for (const [proxy,base] of proxies.slice(0,2)) {
    try {
      const url=base+encodeURIComponent(target);
      const r=await fetch(url,{headers:{"User-Agent":"Mozilla/5.0"}});
      const body=await r.text();
      console.log("PROXY_TEST="+JSON.stringify({carrier,proxy,status:r.status,len:body.length,contentType:r.headers.get("content-type"),preview:body.slice(0,180).replace(/\s+/g," ")}));
    } catch(e) {
      console.log("PROXY_TEST="+JSON.stringify({carrier,proxy,error:String(e)}));
    }
  }
}
