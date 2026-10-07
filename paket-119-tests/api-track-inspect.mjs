
const url="https://res.17track.net/extcall/js/api-track.min.js?v=dca7ec990c";
const r=await fetch(url,{headers:{"User-Agent":"Mozilla/5.0"}});
const t=await r.text();
console.log("META="+JSON.stringify({status:r.status,len:t.length,ct:r.headers.get("content-type")}));
for(const needle of ["YQAjaxExt","api/call","trackapi","GetTrack","Track","gettrack","GetCarrier","Detect","Register","method:","sourcetype","/track/","api.17track"]){
  let pos=0,count=0;
  while((pos=t.indexOf(needle,pos))>=0&&count<12){
    console.log("CTX="+JSON.stringify({needle,pos,ctx:t.slice(Math.max(0,pos-1000),pos+2600)}));
    pos+=needle.length;count++;
  }
}
