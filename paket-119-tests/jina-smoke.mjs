
const nums={
  DHL:"00340000000000000000",
  DPD:"00000000000000",
  GLS:"00000000000",
  Hermes:"H0000000000000000000",
  UPS:"1Z0000000000000000"
};
const urls={
  DHL:n=>"https://www.dhl.de/de/privatkunden/dhl-sendungsverfolgung.html?piececode="+encodeURIComponent(n),
  DPD:n=>"https://my.dpd.de/redirect.aspx?action=12&parcelno="+encodeURIComponent(n),
  GLS:n=>"https://www.gls-pakete.de/sendungsverfolgung?match="+encodeURIComponent(n),
  Hermes:n=>"https://www.myhermes.de/empfangen/sendungsverfolgung/sendungsinformation/#"+encodeURIComponent(n),
  UPS:n=>"https://www.ups.com/track?loc=de_DE&tracknum="+encodeURIComponent(n)+"&requester=WT/"
};
for(const [carrier,n] of Object.entries(nums)){
  for(const [kind,target] of [
    ["carrier",urls[carrier](n)],
    ["parcelsapp","https://parcelsapp.com/en/tracking/"+encodeURIComponent(n)]
  ]){
    try{
      const u="https://r.jina.ai/https://"+target.replace(/^https:\/\//,"");
      const r=await fetch(u,{headers:{"Accept":"text/plain","User-Agent":"Mozilla/5.0"}});
      const body=await r.text();
      console.log("JINA_TEST="+JSON.stringify({
        carrier,kind,status:r.status,len:body.length,
        allowOrigin:r.headers.get("access-control-allow-origin"),
        contentType:r.headers.get("content-type"),
        preview:body.slice(0,400).replace(/\s+/g," ")
      }));
    }catch(e){
      console.log("JINA_TEST="+JSON.stringify({carrier,kind,error:String(e)}));
    }
  }
}
