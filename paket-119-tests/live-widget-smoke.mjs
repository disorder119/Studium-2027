
const url="https://disorder119.github.io/Studium-2027/paket-119/";
let last={};
for(let i=0;i<20;i++){
  try{
    const r=await fetch(url,{headers:{"Cache-Control":"no-cache","User-Agent":"Paket119Smoke/1.0"}});
    const body=await r.text();
    last={status:r.status,len:body.length,hasTitle:body.includes("<title>Paket 119</title>"),hasLive:body.includes("Live-Status wird direkt über 17TRACK"),hasScreenshot:body.includes("Screenshots erkennen")};
    console.log("LIVE_CHECK="+JSON.stringify(last));
    if(r.ok&&last.hasTitle&&last.hasLive&&last.hasScreenshot)process.exit(0);
  }catch(e){
    last={error:String(e)};
    console.log("LIVE_CHECK="+JSON.stringify(last));
  }
  await new Promise(r=>setTimeout(r,5000));
}
console.error("Live page did not expose the expected current Paket 119 build",last);
process.exit(1);
