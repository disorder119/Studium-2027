import { chromium } from "playwright";

const url="https://disorder119.github.io/Studium-2027/paket-119/?storage-test=1";
const num="1Z999AA10123456784";
const legacy="00340000000000000000";

const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:390,height:844}});
const page=await context.newPage();

async function open(){
  await page.goto(url,{waitUntil:"domcontentloaded",timeout:60000});
  await page.waitForSelector("#number",{timeout:20000});
}

await open();
await page.evaluate(()=>{
  localStorage.clear();
  indexedDB.deleteDatabase("paket119");
});
await page.reload({waitUntil:"domcontentloaded"});

await page.fill("#number",num);
await page.fill("#name","Persistence Test");
await page.click('#addForm button[type="submit"]');
await page.waitForTimeout(500);

const saved=await page.evaluate(n=>{
  const raw=localStorage.getItem("paket119.data");
  const data=raw?JSON.parse(raw):null;
  return {
    hasStable:!!raw,
    inStorage:!!data?.parcels?.some(p=>p.number===n),
    inUi:document.body.innerText.includes(n)
  };
},num);
console.log("AFTER_SAVE="+JSON.stringify(saved));
if(!saved.hasStable||!saved.inStorage||!saved.inUi)throw new Error("parcel did not save");

await page.reload({waitUntil:"domcontentloaded"});
await page.waitForTimeout(700);
const reloaded=await page.evaluate(n=>{
  const data=JSON.parse(localStorage.getItem("paket119.data")||"null");
  return {
    inStorage:!!data?.parcels?.some(p=>p.number===n),
    inUi:document.body.innerText.includes(n)
  };
},num);
console.log("AFTER_RELOAD="+JSON.stringify(reloaded));
if(!reloaded.inStorage||!reloaded.inUi)throw new Error("parcel disappeared after reload");

page.once("dialog",d=>d.accept());
await page.locator('.parcel').filter({hasText:num}).locator('[data-remove]').click();
await page.waitForTimeout(400);
const deleted=await page.evaluate(n=>{
  const data=JSON.parse(localStorage.getItem("paket119.data")||"null");
  return {
    absent:!data?.parcels?.some(p=>p.number===n),
    tombstone:!!data?.deletedNumbers?.includes(n),
    absentUi:!document.body.innerText.includes(n)
  };
},num);
console.log("AFTER_DELETE="+JSON.stringify(deleted));
if(!deleted.absent||!deleted.tombstone||!deleted.absentUi)throw new Error("parcel delete/tombstone failed");

await page.reload({waitUntil:"domcontentloaded"});
await page.waitForTimeout(500);
const staysDeleted=await page.evaluate(n=>!document.body.innerText.includes(n),num);
console.log("AFTER_DELETE_RELOAD="+JSON.stringify({staysDeleted}));
if(!staysDeleted)throw new Error("deleted parcel resurrected");

await page.evaluate(({legacy})=>{
  localStorage.setItem("paket119.inbox.v3",JSON.stringify([{id:"legacy-1",number:legacy,name:"Legacy Recovery",done:false,u:123456789}]));
},{legacy});
await page.reload({waitUntil:"domcontentloaded"});
await page.waitForTimeout(700);
const recovered=await page.evaluate(n=>{
  const data=JSON.parse(localStorage.getItem("paket119.data")||"null");
  return {
    inStorage:!!data?.parcels?.some(p=>p.number===n),
    inUi:document.body.innerText.includes(n)
  };
},legacy);
console.log("LEGACY_RECOVERY="+JSON.stringify(recovered));
if(!recovered.inStorage||!recovered.inUi)throw new Error("legacy parcel was not recovered");

console.log("PERSISTENCE_TEST=PASS");
await browser.close();
