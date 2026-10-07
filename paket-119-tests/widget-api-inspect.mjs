
const r=await fetch("https://www.17track.net/externalcall.js",{headers:{"User-Agent":"Mozilla/5.0"}});
const t=await r.text();
const urls=[...t.matchAll(/https?:\\\/\\\/[^"'\\s)]+|https?:\/\/[^"'\\s)]+/g)].map(m=>m[0]).slice(0,200);
console.log("URLS="+JSON.stringify([...new Set(urls)]));
for(const key of ["trackSingle","extcall","YQ_Fc","YQ_Num","iframe","src="]){
  const i=t.indexOf(key);
  if(i>=0) console.log("CTX_"+key.replace(/\W/g,"_")+"="+JSON.stringify(t.slice(Math.max(0,i-2500),i+5000)));
}
