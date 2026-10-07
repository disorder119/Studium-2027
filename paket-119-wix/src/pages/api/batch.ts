import type { APIRoute } from "astro";
import { trackNumber, cleanNumber } from "../../lib/tracker";

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
    const raw=Array.isArray(obj.numbers)?obj.numbers:[];
    const numbers=[...new Set(raw.map(cleanNumber).filter(n=>/^[A-Z0-9.]{6,40}$/.test(n)))].slice(0,40);
    if(!numbers.length){
      return new Response(JSON.stringify({ok:false,error:"Keine gültigen Sendungsnummern"}),{status:400,statusText:"Bad Request",headers:cors});
    }
    const items=[];
    const concurrency=5;
    for(let i=0;i<numbers.length;i+=concurrency){
      items.push(...await Promise.all(numbers.slice(i,i+concurrency).map(trackNumber)));
    }
    return new Response(JSON.stringify({ok:true,items,checkedAt:new Date().toISOString()}),{status:200,headers:cors});
  }catch(error){
    console.error("batch endpoint error",error);
    return new Response(JSON.stringify({ok:false,error:"Batch-Abfrage fehlgeschlagen"}),{status:500,statusText:"Internal Server Error",headers:cors});
  }
};
