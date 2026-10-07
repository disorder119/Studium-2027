
import {normalizeNumber,trackMany} from "./_track17.js";
export default async function handler(req,res){
  res.setHeader("Cache-Control","no-store");
  res.setHeader("Access-Control-Allow-Origin","*");
  res.setHeader("Access-Control-Allow-Headers","content-type");
  if(req.method==="OPTIONS") return res.status(204).end();
  if(req.method!=="POST") return res.status(405).json({ok:false,error:"POST only"});
  const number=normalizeNumber(req.body&&req.body.number);
  if(!/^[A-Z0-9.]{6,40}$/.test(number)) return res.status(400).json({ok:false,error:"Ungültige Sendungsnummer"});
  try{
    const result=(await trackMany([number]))[0];
    return res.status(result&&result.ok?200:202).json(result||{ok:false,number,error:"Keine Antwort"});
  }catch(e){
    return res.status(503).json({ok:false,number,error:String(e&&e.message||e)});
  }
}
