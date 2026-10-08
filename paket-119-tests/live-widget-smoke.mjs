
const base="https://disorder119.github.io/Studium-2027/paket-119/";
let last={};
for(let i=0;i<24;i++){
  try{
    const [pageRes,appRes]=await Promise.all([
      fetch(base+"?v=compact-v15",{headers:{"Cache-Control":"no-cache","User-Agent":"Paket119CompactSmoke/1.0"}}),
      fetch(base+"app.js?v=compact-v15",{headers:{"Cache-Control":"no-cache","User-Agent":"Paket119CompactSmoke/1.0"}})
    ]);
    const [body,app]=await Promise.all([pageRes.text(),appRes.text()]);
    last={
      pageStatus:pageRes.status,
      appStatus:appRes.status,
      hasTitle:body.includes("<title>Paket 119</title>"),
      hasCamera:body.includes("Label scannen")&&body.includes('id="cameraScan"'),
      hasBulk:body.includes("Mehrere Nummern auf einmal einfügen"),
      hasSearch:body.includes("Pakete durchsuchen"),
      eager17track:body.includes('<script defer src="https://www.17track.net/externalcall.js"></script>'),
      hasLazy17track:app.includes('s.src="https://www.17track.net/externalcall.js"'),
      hasPins:app.includes("expandedTrackers")&&app.includes("data-pin"),
      hasCollapse:app.includes("Live-Status anzeigen")&&app.includes("data-toggle-track")
    };
    console.log("LIVE_COMPACT_CHECK="+JSON.stringify(last));
    if(pageRes.ok&&appRes.ok&&last.hasTitle&&last.hasCamera&&last.hasBulk&&last.hasSearch&&!last.eager17track&&last.hasLazy17track&&last.hasPins&&last.hasCollapse)process.exit(0);
  }catch(e){
    last={error:String(e)};
    console.log("LIVE_COMPACT_CHECK="+JSON.stringify(last));
  }
  await new Promise(r=>setTimeout(r,5000));
}
console.error("Compact Paket 119 build not live",last);
process.exit(1);
