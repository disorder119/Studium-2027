
const url="https://res.17track.net/extcall/js/yq-track-core.min.js?v=43935663be";
const r=await fetch(url,{headers:{"User-Agent":"Mozilla/5.0"}});
const t=await r.text();
console.log("META="+JSON.stringify({status:r.status,len:t.length}));
for(const needle of ["onTrackSuccess","onTrackEnd","TrackingProcess","trackSuccess","trackRet","status","Status"]){
  let pos=0,count=0;
  while((pos=t.indexOf(needle,pos))>=0&&count<20){
    console.log("CTX="+JSON.stringify({needle,pos,ctx:t.slice(Math.max(0,pos-2200),pos+5000)}));
    pos+=needle.length;count++;
  }
}
