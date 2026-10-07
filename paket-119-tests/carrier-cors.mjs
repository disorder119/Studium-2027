
const origin="https://disorder119.github.io";
const tests=[
  {name:"GLS",url:"https://gls-group.com/app/service/open/rest/DE/de/rstt029?match=00000000000&type=&caller=witt002&millis="+Date.now(),method:"GET",headers:{Accept:"application/json"}},
  {name:"Hermes",url:"https://api.my-deliveries.de/tnt/v2/shipments/search/H0000000000000000000",method:"GET",headers:{Accept:"application/json","X-Language":"de"}},
  {name:"DHL",url:"https://www.dhl.de/int-verfolgen/data/search?piececode=00340000000000000000&noRedirect=true&language=de&cid=app",method:"GET",headers:{Accept:"application/json"}},
  {name:"DPD",url:"https://my.dpd.de/redirect.aspx?action=12&parcelno=00000000000000",method:"GET",headers:{Accept:"text/html"}}
];
for(const t of tests){
  try{
    const pre=await fetch(t.url,{method:"OPTIONS",headers:{
      Origin:origin,
      "Access-Control-Request-Method":t.method,
      "Access-Control-Request-Headers":Object.keys(t.headers).join(",")
    }});
    console.log("PRE="+JSON.stringify({name:t.name,status:pre.status,ao:pre.headers.get("access-control-allow-origin"),ah:pre.headers.get("access-control-allow-headers"),am:pre.headers.get("access-control-allow-methods")}));
  }catch(e){console.log("PRE="+JSON.stringify({name:t.name,error:String(e)}))}
  try{
    const r=await fetch(t.url,{method:t.method,headers:{...t.headers,Origin:origin},redirect:"follow"});
    const body=await r.text();
    console.log("GET="+JSON.stringify({name:t.name,status:r.status,ao:r.headers.get("access-control-allow-origin"),ct:r.headers.get("content-type"),len:body.length,preview:body.slice(0,500).replace(/\s+/g," ")}));
  }catch(e){console.log("GET="+JSON.stringify({name:t.name,error:String(e)}))}
}
