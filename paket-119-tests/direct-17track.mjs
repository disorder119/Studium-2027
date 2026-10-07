
const endpoint="https://t.17track.net/track/restapi";
const origin="https://disorder119.github.io";
try{
  const pre=await fetch(endpoint,{
    method:"OPTIONS",
    headers:{
      "Origin":origin,
      "Access-Control-Request-Method":"POST",
      "Access-Control-Request-Headers":"content-type,extrefer"
    }
  });
  console.log("CORS="+JSON.stringify({
    status:pre.status,
    allowOrigin:pre.headers.get("access-control-allow-origin"),
    allowMethods:pre.headers.get("access-control-allow-methods"),
    allowHeaders:pre.headers.get("access-control-allow-headers"),
    allowCredentials:pre.headers.get("access-control-allow-credentials")
  }));
}catch(e){console.log("CORS="+JSON.stringify({error:String(e)}))}
for(const item of [
  {num:"00000000000",fc:100005,sc:0,name:"GLS fake"},
  {num:"00000000000000",fc:100007,sc:0,name:"DPD fake"},
  {num:"1Z0000000000000000",fc:100002,sc:0,name:"UPS fake"}
]){
  try{
    const r=await fetch(endpoint,{
      method:"POST",
      headers:{
        "Content-Type":"application/json",
        "Origin":origin,
        "Referer":"https://extcall.17track.net/de/track",
        "extrefer":origin+"/Studium-2027/paket-119/"
      },
      body:JSON.stringify({data:[{num:item.num,fc:item.fc,sc:item.sc}],guid:""})
    });
    const body=await r.text();
    console.log("POST="+JSON.stringify({
      name:item.name,status:r.status,
      allowOrigin:r.headers.get("access-control-allow-origin"),
      contentType:r.headers.get("content-type"),
      len:body.length,preview:body.slice(0,1600)
    }));
  }catch(e){console.log("POST="+JSON.stringify({name:item.name,error:String(e)}))}
}
