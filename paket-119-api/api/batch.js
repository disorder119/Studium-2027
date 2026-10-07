
import {normalizeNumber,trackMany} from "./_track17.js";
export default async function handler(req,res){
  res.setHeader("Cache-Control","no-store");
  res.setHeader("Access-Control-Allow-Origin","*");
  res.setHeader("Access-Control-Allow-Headers","content-type");
  if(req.method==="OPTIONS") return res.status(204).end();
  if(req.method!=="POST") return res.status(405).json({ok:false,error:"POST only"});
  const raw=Array.isArray(req.body&&req.body.numbers)?req.body.numbers:[];
  const numbers=[...new Set(raw.map(normalizeNumber).filter(n=>/^[A-Z0-9.]{6,40}$/.test(n)))].slice(0,40);
  if(!numbers.length) return res.status(400).json({ok:false,error:"Keine gültigen Sendungsnummern"});
  try{
    return res.status(200).json({ok:true,items:await trackMany(numbers),checkedAt:new Date().toISOString()});
  }catch(e){
    return res.status(503).json({ok:false,error:String(e&&e.message||e)});
  }
}
