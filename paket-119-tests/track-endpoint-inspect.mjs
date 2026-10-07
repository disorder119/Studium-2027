
const pageUrl="https://extcall.17track.net/de/track?timestamp="+Date.now()+"#apitype=1&uheight=300&nums=00000000000&fc=100005&iframeId=test";
const r=await fetch(pageUrl,{headers:{"User-Agent":"Mozilla/5.0"}});
const html=await r.text();
for(const needle of ["APITRACK","apiTrack","trackapi","serviceUrl","initialFingerprinterPromise","Last-Event-Sign"]){
  let pos=0,count=0;
  while((pos=html.indexOf(needle,pos))>=0&&count<20){
    console.log("HTMLCTX="+JSON.stringify({needle,pos,ctx:html.slice(Math.max(0,pos-1800),pos+3200)}));
    pos+=needle.length;count++;
  }
}
const scripts=[...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)].map(m=>m[1]).filter(Boolean);
for(const [i,t] of scripts.entries()){
  if(/APITRACK|trackapi|serviceUrl|initialFingerprinterPromise/.test(t)){
    console.log("INLINE="+JSON.stringify({i,len:t.length,content:t.slice(0,12000)}));
  }
}
