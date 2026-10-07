
const target="https://www.mondialrelay.com/en-gb/parcel-tracking/?country=DE&ens=V1FRTODE&exp=33304124&language=EN";
const u="https://api.allorigins.win/raw?url="+encodeURIComponent(target);
const r=await fetch(u,{headers:{Origin:"https://disorder119.github.io","User-Agent":"Mozilla/5.0"}});
const body=await r.text();
const hits=[];
for(const re of [/distribution centre/ig,/delivered/ig,/shipped/ig,/09 October/ig,/13 October/ig,/33304124/g,/ISAACKLEID/ig,/V1FRTODE/g]){
  const m=re.exec(body);if(m)hits.push({term:m[0],context:body.slice(Math.max(0,m.index-220),m.index+500).replace(/\s+/g," ")});
}
console.log("MR_PROXY="+JSON.stringify({
  status:r.status,
  allowOrigin:r.headers.get("access-control-allow-origin"),
  contentType:r.headers.get("content-type"),
  len:body.length,
  hits
}));

const target2="https://www.mondialrelay.com/en-gb/parcel-tracking/?country=DE&ens=V1FRTODE&exp=33304124&language=EN";
const r2=await fetch("https://api.allorigins.win/raw?url="+encodeURIComponent(target2),{headers:{Origin:"https://disorder119.github.io","User-Agent":"Mozilla/5.0"}});
const h=await r2.text();
const statusBlock=(h.match(/<ul[^>]*class="[^"]*(?:step|tracking|timeline|progress)[^"]*"[^>]*>[\s\S]{0,12000}?<\/ul>/i)||[])[0]||"";
console.log("MR_LI="+JSON.stringify([...h.matchAll(/<li([^>]*)>\s*<p[^>]*>([\s\S]*?)<\/p>\s*<\/li>/gi)].slice(0,30).map(m=>({attrs:m[1],text:m[2].replace(/<[^>]+>/g," ").replace(/&[^;]+;/g," ").replace(/\s+/g," ").trim()}))));
for(const term of ["Parcel in preparation at the sender","Parcel delivered to Mondial Relay","Parcel available in the delivery agency","tracking-result","tracking","History","Date","07/10","07 October","2026"]){
 const i=h.toLowerCase().indexOf(term.toLowerCase());
 if(i>=0) console.log("MR_CTX_"+term.replace(/\W+/g,"_")+"="+JSON.stringify(h.slice(Math.max(0,i-1200),i+3500).replace(/\s+/g," ")));
}
