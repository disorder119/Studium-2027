
const r=await fetch("https://www.17track.net/externalcall.js",{headers:{"User-Agent":"Mozilla/5.0"}});
const t=await r.text();
console.log("EXTERNALCALL_STATUS="+r.status);
console.log("EXTERNALCALL_LEN="+t.length);
console.log("EXTERNALCALL_HEAD="+JSON.stringify(t.slice(0,1800)));
for(const key of ["iframe","postMessage","YQV5","trackSingle","XMLHttpRequest","fetch(","jsonp","callback","extcall"]){
  console.log("HAS_"+key.replace(/\W/g,"_")+"="+t.includes(key));
}
