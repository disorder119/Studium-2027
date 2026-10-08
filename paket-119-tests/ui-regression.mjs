import { chromium } from "playwright";
import { spawn } from "node:child_process";
const port=8788;
const server=spawn("python3",["-m","http.server",String(port),"--bind","127.0.0.1"],{stdio:"ignore"});
const base="http://127.0.0.1:"+port+"/paket-119/";
const errors=[];
async function ready(){
  for(let i=0;i<30;i++){
    try{const r=await fetch(base);if(r.ok)return}catch{}
    await new Promise(r=>setTimeout(r,250));
  }
  throw Error("local server failed");
}
let browser;
try{
  await ready();
  browser=await chromium.launch({headless:true});
  const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:"block"});
  const page=await context.newPage();
  page.on("pageerror",error=>errors.push(error.message));
  await page.addInitScript(()=>{
    window.YQV5={trackSingle:function(o){
      const el=document.getElementById(o.YQ_ContainerId);
      if(el)el.textContent="TRACKER MOCK "+o.YQ_Num;
      if(o.onLoaded)o.onLoaded();
    }};
    window.Tesseract={createWorker:async function(){
      return {setParameters:async()=>{},
        recognize:async()=>({data:{text:"DHL Sendungsnummer: 00340000000000000000"}}),
        terminate:async()=>{}};
    }};
  });
  await page.route("**/externalcall.js",r=>r.fulfill({
    status:200,contentType:"application/javascript",
    body:"window.YQV5={trackSingle:function(o){let e=document.getElementById(o.YQ_ContainerId);if(e)e.textContent='TRACKER MOCK '+o.YQ_Num;if(o.onLoaded)o.onLoaded();}};"
  }));
  await page.route("**/tesseract.min.js",r=>r.fulfill({
    status:200,contentType:"application/javascript",
    body:"window.Tesseract={createWorker:async function(){return{setParameters:async()=>{},recognize:async()=>({data:{text:'DHL Sendungsnummer: 00340000000000000000'}}),terminate:async()=>{}}}};"
  }));
  await page.goto(base,{waitUntil:"domcontentloaded"});
  await page.waitForSelector("#number");
  const ups="1Z999AA10123456784";
  await page.fill("#number",ups);
  await page.fill("#name","Schuhe");
  await page.locator('#addForm button[type="submit"]').click();
  await page.locator(".parcel").filter({hasText:ups}).waitFor();
  await page.locator(".parcel").filter({hasText:ups}).locator("[data-toggle-track]").click();
  await page.waitForTimeout(1000);
  const diag=await page.evaluate(()=>({host:document.querySelector(".trackerHost")?.outerHTML||null,widget:typeof window.YQV5?.trackSingle,expanded:document.querySelector("[data-toggle-track]")?.outerHTML||null}));
  console.log("TRACKER_DIAG="+JSON.stringify(diag));
  if(!diag.host?.includes("TRACKER MOCK "+ups))throw Error("tracking widget not mounted "+JSON.stringify(diag));
  console.log("TRACKER_MOUNT=PASS");
  await page.locator(".parcel").filter({hasText:ups}).locator("[data-edit]").click();
  await page.fill("#editName","Prada Schuhe");
  await page.locator("#saveEdit").click();
  await page.getByText("Prada Schuhe").waitFor();
  console.log("RENAME=PASS");
  const dpd="00000000000000";
  await page.locator("details.bulkBox > summary").click();
  await page.locator("#bulkInput").fill(dpd+"\n20261008");
  await page.locator("#addBulk").click();
  const data=await page.evaluate(n=>{
    const j=JSON.parse(localStorage.getItem("paket119.data")||"{}");
    return {carrier:j.parcels?.find(p=>p.number===n)?.carrierCode,includesDate:j.parcels?.some(p=>p.number==="20261008")};
  },dpd);
  if(data.carrier!==0||data.includesDate)throw Error("ambiguous carrier or date validation wrong "+JSON.stringify(data));
  console.log("BULK_VALIDATION=PASS");
  const png="iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9WN8FboAAAAASUVORK5CYII=";
  await page.locator("#screenshots").setInputFiles({name:"dhl.png",mimeType:"image/png",buffer:Buffer.from(png,"base64")});
  await page.locator("#ocrCandidates .candidate").first().waitFor({timeout:15000});
  const candidateCount=await page.locator("#ocrCandidates .candidate").count();
  if(candidateCount!==1)throw Error("OCR created false fragments: "+candidateCount);
  console.log("OCR_FRAGMENT_FILTER=PASS");
  await page.locator("#addCandidates").click();
  const dhl="00340000000000000000";
  const ocr=await page.evaluate(n=>{
    const raw=localStorage.getItem("paket119.data")||"";
    const j=JSON.parse(raw);
    const p=j.parcels?.find(p=>p.number===n);
    return {exists:!!p,excessText:raw.includes("DHL Sendungsnummer:"),hint:p?.carrierHint||""};
  },dhl);
  if(!ocr.exists||ocr.excessText)throw Error("OCR or privacy failed "+JSON.stringify(ocr));
  console.log("SCREENSHOT_OCR=PASS");
  await page.reload({waitUntil:"domcontentloaded"});
  await page.getByText("Prada Schuhe").waitFor();
  const saved=await page.evaluate(n=>JSON.parse(localStorage.getItem("paket119.data")||"{}").parcels?.some(p=>p.number===n),dhl);
  if(!saved)throw Error("reload lost screenshot parcel");
  console.log("PERSISTENCE=PASS");
  if(errors.length)throw Error("Browser page errors "+JSON.stringify(errors));
  console.log("UI_REGRESSION=PASS");
}finally{await browser?.close();server.kill();}
