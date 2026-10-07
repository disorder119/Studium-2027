
const urls=[
 "https://res.17track.net/extcall/js/api-common.min.js?v=55574afc48",
 "https://res.17track.net/extcall/js/yq-track-core.min.js?v=43935663be",
 "https://res.17track.net/global-v2/merge-js/base-vendor/base-vendor.min.js?v=2487b7933d",
 "https://res.17track.net/i18n/merge-i18n/base-site/base-site.de.js?v=c2578a7bae"
];
for(const url of urls){
  const r=await fetch(url,{headers:{"User-Agent":"Mozilla/5.0"}});
  const t=await r.text();
  for(const needle of ["-14","Last-Event-Sign","fingerprinter","getFingerprint","initialFingerprinterPromise","x-csrf-token"]){
    let pos=0,count=0;
    while((pos=t.indexOf(needle,pos))>=0&&count<20){
      console.log("FOUND="+JSON.stringify({url,needle,pos,ctx:t.slice(Math.max(0,pos-1800),pos+3600)}));
      pos+=needle.length;count++;
    }
  }
}
