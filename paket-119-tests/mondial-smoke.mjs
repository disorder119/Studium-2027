
const u="https://www.mondialrelay.com/en-gb/parcel-tracking/?country=DE&ens=V1FRTODE&exp=33304124&language=EN";
const r=await fetch(u,{redirect:"manual",headers:{"User-Agent":"Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1"}});
const body=await r.text();
console.log("MR_TEST="+JSON.stringify({
  status:r.status,
  location:r.headers.get("location"),
  xFrameOptions:r.headers.get("x-frame-options"),
  csp:r.headers.get("content-security-policy"),
  allowOrigin:r.headers.get("access-control-allow-origin"),
  contentType:r.headers.get("content-type"),
  len:body.length,
  containsNumber:body.includes("33304124"),
  preview:body.slice(0,300).replace(/\s+/g," ")
}));
