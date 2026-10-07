import type { APIRoute } from "astro";
import { trackNumber } from "../../lib/tracker";

const cors={
  "Content-Type":"application/json",
  "Access-Control-Allow-Origin":"https://disorder119.github.io",
  "Access-Control-Allow-Headers":"content-type",
  "Access-Control-Allow-Methods":"POST,OPTIONS",
  "Cache-Control":"no-store"
};

export const OPTIONS:APIRoute=async()=>new Response(null,{status:204,headers:cors});

export const POST:APIRoute=async({request})=>{
  try{
    const body:unknown=await request.json();
    const obj=body!==null&&typeof body==="object"?body as Record<string,unknown>:{};
    const result=await trackNumber(obj.number);
    return new Response(JSON.stringify(result),{status:result.ok?200:202,headers:cors});
  }catch(error){
    console.error("track endpoint error",error);
    return new Response(JSON.stringify({ok:false,error:"Tracking-Abfrage fehlgeschlagen"}),{status:500,statusText:"Internal Server Error",headers:cors});
  }
};
