
const url="https://disorder119.github.io/Studium-2027/paket-119/?v=fast-4de686";
let last={};
for(let i=0;i<20;i++){
  try{
    const r=await fetch(url,{headers:{"Cache-Control":"no-cache","User-Agent":"Paket119FastSmoke/1.0"}});
    const body=await r.text();
    last={
      status:r.status,
      len:body.length,
      hasTitle:body.includes("<title>Paket 119</title>"),
      hasFast:body.includes("Vinted-Schnellmodus"),
      hasPreconnect:body.includes("res.17track.net"),
      hasScreenshot:body.includes("Screenshots erkennen")
    };
    console.log("LIVE_FAST_CHECK="+JSON.stringify(last));
    if(r.ok&&last.hasTitle&&last.hasFast&&last.hasPreconnect&&last.hasScreenshot)process.exit(0);
  }catch(e){
    last={error:String(e)};
    console.log("LIVE_FAST_CHECK="+JSON.stringify(last));
  }
  await new Promise(r=>setTimeout(r,5000));
}
console.error("Fast mode not live",last);
process.exit(1);
