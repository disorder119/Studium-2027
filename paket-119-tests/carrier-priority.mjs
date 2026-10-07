
const origin="https://disorder119.github.io";
const probes=[
  ["DHL_DE_JSON","https://www.dhl.de/int-verfolgen/data/search?piececode=00340000000000000000&noRedirect=true&language=de&cid=app"],
  ["DPD_DE","https://my.dpd.de/redirect.aspx?action=12&parcelno=00000000000000"],
  ["GLS_DE_JSON","https://gls-group.com/app/service/open/rest/DE/de/rstt029?match=00000000000&type=&caller=witt002&millis="+Date.now()],
  ["HERMES_DE_JSON","https://api.my-deliveries.de/tnt/v2/shipments/search/H0000000000000000000"],
  ["MONDIAL_RELAY","https://www.mondialrelay.fr/suivi-de-colis/"],
  ["CHRONOPOST","https://www.chronopost.fr/tracking-no-cms/suivi-page?listeNumerosLT=XY000000000FR"],
  ["COLISSIMO","https://www.laposte.fr/outils/suivre-vos-envois?code=CC000000000FR"],
  ["VINTED_GO","https://tracking.vintedgo.com/"],
  ["INPOST_IT","https://inpost.it/it/track-parcel"],
  ["POSTE_IT","https://www.poste.it/cerca/index.html#/risultati-spedizioni/CC000000000IT"],
  ["BRT_IT","https://www.brt.it/it/tracking/"],
  ["POST_AT","https://www.post.at/s/sendungsdetails?snr=CC000000000AT"],
  ["DPD_AT","https://my.dpd.at/redirect.aspx?action=12&parcelno=00000000000000"],
  ["GLS_AT","https://gls-group.com/AT/de/paketverfolgung?match=00000000000"]
];
for(const [name,url] of probes){
  try{
    const r=await fetch(url,{redirect:"manual",headers:{
      "Origin":origin,
      "User-Agent":"Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Safari/604.1",
      "Accept":"*/*"
    }});
    const body=await r.text();
    console.log("CARRIER_PROBE="+JSON.stringify({
      name,status:r.status,
      location:r.headers.get("location"),
      acao:r.headers.get("access-control-allow-origin"),
      xfo:r.headers.get("x-frame-options"),
      csp:r.headers.get("content-security-policy"),
      ct:r.headers.get("content-type"),
      len:body.length,
      preview:body.slice(0,140).replace(/\s+/g," ")
    }));
  }catch(e){
    console.log("CARRIER_PROBE="+JSON.stringify({name,error:String(e)}));
  }
}
try{
  const r=await fetch("https://res.17track.net/asset/carrier/info/apicarrier.all.json");
  const list=await r.json();
  const wanted=["DHL","DPD","GLS","Hermes","Mondial Relay","Chronopost","Colissimo","La Poste","Vinted Go","InPost","Poste Italiane","BRT","Bartolini","Austrian Post","Österreichische Post"];
  const arr=Array.isArray(list)?list:(list&&Array.isArray(list.data)?list.data:[]);
  const matches=arr.filter(x=>{
    const s=JSON.stringify(x).toLowerCase();
    return wanted.some(w=>s.includes(w.toLowerCase()));
  }).map(x=>x);
  console.log("CARRIER_CODES="+JSON.stringify(matches.slice(0,200)));
}catch(e){
  console.log("CARRIER_CODES_ERROR="+String(e));
}
