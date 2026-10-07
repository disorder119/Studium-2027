
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
