
const url="https://extcall.17track.net/de/track?timestamp="+Date.now()+"#apitype=1&uheight=300&nums=00000000000&fc=100005&iframeId=test";
const r=await fetch(url,{headers:{"User-Agent":"Mozilla/5.0","Accept":"text/html"}});
const html=await r.text();
console.log("PAGE="+JSON.stringify({status:r.status,len:html.length,ct:r.headers.get("content-type"),head:html.slice(0,1200)}));
const srcs=[...html.matchAll(/<script[^>]+src=["']([^"']+)["']/gi)].map(m=>m[1]);
console.log("SCRIPTS="+JSON.stringify(srcs));
for(const src of srcs.slice(0,20)){
  try{
    const abs=new URL(src,url).href;
    const rr=await fetch(abs,{headers:{"User-Agent":"Mozilla/5.0"}});
    const t=await rr.text();
    const hits=[...new Set([...t.matchAll(/https?:\/\/[^"'\\s)]+|\/api\/[^"'\\s)]+|\/track\/[^"'\\s)]+/g)].map(m=>m[0]))].slice(0,100);
    if(hits.length||/ajax|fetch\(|axios|XMLHttpRequest|trackinfo|tracking/i.test(t)){
      console.log("SCRIPT="+JSON.stringify({url:abs,status:rr.status,len:t.length,hits,ctx:t.match(/.{0,600}(?:ajax|fetch\(|axios|XMLHttpRequest|trackinfo|tracking).{0,1200}/i)?.[0]||""}));
    }
  }catch(e){console.log("ERR="+String(e))}
}
