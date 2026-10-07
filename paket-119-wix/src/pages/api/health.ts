import type { APIRoute } from "astro";

const headers={
  "Content-Type":"application/json",
  "Access-Control-Allow-Origin":"https://disorder119.github.io",
  "Cache-Control":"no-store"
};

export const GET:APIRoute=async()=>new Response(JSON.stringify({ok:true,service:"paket-119",time:new Date().toISOString()}),{status:200,headers});
export const OPTIONS:APIRoute=async()=>new Response(null,{status:204,headers:{...headers,"Access-Control-Allow-Methods":"GET,OPTIONS","Access-Control-Allow-Headers":"content-type"}});
