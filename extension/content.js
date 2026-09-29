const MAP={givenName:["given name","givenname","first name","applicant name"],surname:["surname","last name","family name"],dob:["date of birth","dob","birth date"],gender:["gender","sex"],nationality:["nationality"],maritalStatus:["marital status"],passportNo:["passport number","passport no"],passportIssuePlace:["place of issue","passport issue place","issued at"],passportIssueDate:["date of issue","passport issue date"],passportExpiryDate:["date of expiry","passport expiry","expiry date"],previousPassportVisa:["previous visa","previous passport","old passport"],phone:["mobile number","mobile no","phone number","telephone","contact number"],email:["email address","email id","e-mail"],presentAddress:["present address","current address","residential address"],district:["district"],postCode:["pin code","postal code","postcode","zip code"],fatherName:["father name","father's name"],motherName:["mother name","mother's name"],spouseName:["spouse name","husband name","wife name"],profession:["profession","occupation"],employer:["employer","company name","organization","organisation","business"],visaType:["visa type","type of visa"],purpose:["purpose of visit","purpose"],mission:["select a mission","mission"],ivacCenter:["ivac center","ivac centre","visa application center","visa application centre"],stayAddress:["place of stay","hotel name","hotel address","address in india","stay/hotel"],webFileNumber:["web file","webfile number"],indiaRefName:["reference in india","india reference name"],indiaRefAddress:["reference address in india","india reference address"],indiaRefPhone:["reference phone in india","india reference phone","india reference contact"],bdRefName:["reference in bangladesh","bangladesh reference name"],bdRefAddress:["reference address in bangladesh","bangladesh reference address"],bdRefPhone:["reference phone in bangladesh","bangladesh reference phone","bangladesh reference contact"]};
const norm=s=>String(s||"").toLowerCase().replace(/\s+/g," ").trim();
function meta(e){let a=[];if(e.labels)a.push(...[...e.labels].map(x=>x.innerText));let p=e.closest("div,td,li,fieldset");if(p)a.push(p.innerText?.slice(0,180));return norm([e.name,e.id,e.placeholder,e.getAttribute("aria-label"),e.getAttribute("autocomplete"),...a].filter(Boolean).join(" "))}
function find(patterns){return [...document.querySelectorAll("input,textarea,select")].find(e=>patterns.some(p=>meta(e).includes(norm(p))))}
function set(e,v){if(!e||!v)return false;if(e.tagName==="SELECT"){let w=norm(v),o=[...e.options].find(x=>norm(x.value)===w||norm(x.textContent)===w||norm(x.textContent).includes(w));if(!o)return false;e.value=o.value}else{let proto=e.tagName==="TEXTAREA"?HTMLTextAreaElement.prototype:HTMLInputElement.prototype,setter=Object.getOwnPropertyDescriptor(proto,"value")?.set;if(setter)setter.call(e,v);else e.value=v}["input","change","blur"].forEach(x=>e.dispatchEvent(new Event(x,{bubbles:true})));return true}
function clear(e){if(e.disabled||e.readOnly||["hidden","button","submit"].includes(e.type))return false;if(e.type==="checkbox"||e.type==="radio"){if(e.checked)e.click();return false}if(e.tagName==="SELECT")e.selectedIndex=0;else{let proto=e.tagName==="TEXTAREA"?HTMLTextAreaElement.prototype:HTMLInputElement.prototype,setter=Object.getOwnPropertyDescriptor(proto,"value")?.set;if(setter)setter.call(e,"");else e.value=""}e.dispatchEvent(new Event("input",{bubbles:true}));e.dispatchEvent(new Event("change",{bubbles:true}));return true}
function pageText(){return norm(document.body?.innerText||"")}
function looksLikeSlot(){const t=pageText();const preferredCenterPromise=chrome.storage.local.get("preferredCenter");return preferredCenterPromise.then(({preferredCenter})=>{const centerOk=!preferredCenter||t.includes(norm(preferredCenter));const positive=/(available|select date|appointment date|book your appointment|slot available|choose appointment)/i.test(t);const negative=/(no slot|not available|unavailable|fully booked|no appointment|sold out)/i.test(t);const dateInputs=[...document.querySelectorAll('input[type="date"],input[placeholder*="date" i],input[id*="date" i],button')].filter(e=>{const s=norm(e.innerText||e.value||e.getAttribute("aria-label")||"");return /appointment|date|select date/.test(s)});return centerOk&&positive&&!negative&&dateInputs.length>0})}
function prepareBooking(){
  chrome.storage.local.get(["preferredCenter","preferredDateFrom","preferredDateTo"]).then(d=>{
    const center=norm(d.preferredCenter||"");
    if(center){
      const sel=[...document.querySelectorAll("select")].find(e=>/center|centre|ivac/i.test(meta(e)));
      if(sel){
        const opt=[...sel.options].find(o=>norm(o.textContent).includes(center));
        if(opt)set(sel,opt.value);
      }
    }
  });
}
async function checkSlot(){
  const available=await looksLikeSlot();
  if(available){
    prepareBooking();
    chrome.runtime.sendMessage({type:"SLOT_FOUND",message:"Possible appointment slot found. The page was prepared; complete CAPTCHA, payment, and final confirmation yourself."});
  }
  return available;
}
let timer=null;
async function startWatch(){const d=await chrome.storage.local.get(["slotWatch","slotInterval"]);if(timer)clearTimeout(timer);if(!d.slotWatch)return;const available=await checkSlot();if(!available){timer=setTimeout(()=>{location.reload()},Math.max(10,Number(d.slotInterval)||30)*1000)}}
chrome.runtime.onMessage.addListener((m,s,r)=>{if(m?.type==="FILL_FORM"){let n=0;for(let[k,v]of Object.entries(m.data||{}))if(v&&MAP[k]&&set(find(MAP[k]),v))n++;r({message:"Auto Fill: "+n+" field(s) filled."})}if(m?.type==="CLEAR_FORM"){let n=0;document.querySelectorAll("input,textarea,select").forEach(e=>{if(clear(e))n++});r({message:"Clear Form: "+n+" field(s) cleared."})}if(m?.type==="CHECK_SLOT"){checkSlot().then(a=>r({message:a?"Possible slot detected — check the page now.":"No obvious available slot detected on this page.",available:a}));return true}return true});
if(location.hostname==="appointment.ivacbd.com")startWatch();