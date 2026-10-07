
const urls=[
 "https://res.17track.net/extcall/js/yq-track-core.min.js?v=43935663be",
 "https://res.17track.net/extcall/js/api-common.min.js?v=55574afc48",
 "https://res.17track.net/global-v2/merge-js/base/base.min.js?v=89acf16989"
];
for(const url of urls){
  const r=await fetch(url,{headers:{"User-Agent":"Mozilla/5.0"}});
  const t=await r.text();
  for(const needle of ["APITRACK","TRACKAPI","track.17track","api.17track","trackapi","YQ.API","serviceUrl"]){
    let pos=0,count=0;
    while((pos=t.indexOf(needle,pos))>=0&&count<30){
      console.log("FOUND="+JSON.stringify({url,needle,pos,ctx:t.slice(Math.max(0,pos-2200),pos+4200)}));
      pos+=needle.length;count++;
    }
  }
}
