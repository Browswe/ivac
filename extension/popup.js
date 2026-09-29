const F=["profileName","givenName","surname","dob","gender","nationality","maritalStatus","passportNo","passportIssuePlace","passportIssueDate","passportExpiryDate","previousPassportVisa","phone","email","presentAddress","district","postCode","fatherName","motherName","spouseName","profession","employer","visaType","purpose","mission","ivacCenter","stayAddress","webFileNumber","indiaRefName","indiaRefAddress","indiaRefPhone","bdRefName","bdRefAddress","bdRefPhone"];
const $=id=>document.getElementById(id);let P={},A="";
function read(){let p={};F.forEach(x=>p[x]=$(x).value.trim());return p}
function write(p={}){F.forEach(x=>$(x).value=p[x]||"")}
function msg(x,cls=""){const e=$("status");e.textContent=x;e.className="status "+cls}
function refresh(){let s=$("profile");s.innerHTML="";Object.entries(P).forEach(([id,p])=>{let o=document.createElement("option");o.value=id;o.textContent=p.profileName||"Unnamed";s.appendChild(o)});if(A)s.value=A}
async function load(){let d=await chrome.storage.local.get(["ivacProfiles","ivacActiveProfile","slotWatch","slotInterval","preferredCenter"]);P=d.ivacProfiles||{};A=d.ivacActiveProfile||Object.keys(P)[0]||"";refresh();write(P[A]);$("interval").value=d.slotInterval||30;$("preferredCenter").value=d.preferredCenter||"";setWatch(!!d.slotWatch)}
function setWatch(on){$("watch").textContent=on?"ON":"OFF";$("watch").style.background=on?"#12b76a":"#e8eefc";$("watch").style.color=on?"white":"#173b7a"}
$("profile").onchange=async e=>{A=e.target.value;write(P[A]);await chrome.storage.local.set({ivacActiveProfile:A})};
$("new").onclick=()=>{A="";write({});$("profileName").focus();msg("Enter details and Save Profile.")};
$("save").onclick=async()=>{let p=read();if(!p.profileName)return msg("Enter a profile name.","warn");if(!A)A=crypto.randomUUID();P[A]=p;await chrome.storage.local.set({ivacProfiles:P,ivacActiveProfile:A});refresh();msg("Profile saved locally.","ok")};
$("fill").onclick=async()=>{let[t]=await chrome.tabs.query({active:true,currentWindow:true});try{let r=await chrome.tabs.sendMessage(t.id,{type:"FILL_FORM",data:read()});msg(r.message,"ok")}catch(e){msg("Open the IVAC/Indian Visa page first.","warn")}};
$("clear").onclick=async()=>{let[t]=await chrome.tabs.query({active:true,currentWindow:true});try{let r=await chrome.tabs.sendMessage(t.id,{type:"CLEAR_FORM"});msg(r.message)}catch(e){msg("Open the application page first.","warn")}};
$("del").onclick=async()=>{if(!A||!P[A])return msg("No profile selected.");if(!confirm("Delete this profile?"))return;delete P[A];A=Object.keys(P)[0]||"";await chrome.storage.local.set({ivacProfiles:P,ivacActiveProfile:A});refresh();write(P[A]);msg("Profile deleted.")};
$("clearProfiles").onclick=async()=>{if(!confirm("Delete ALL saved profiles?"))return;P={};A="";await chrome.storage.local.remove(["ivacProfiles","ivacActiveProfile"]);refresh();write({});msg("All profiles deleted.")};
$("watch").onclick=async()=>{let d=await chrome.storage.local.get("slotWatch");let on=!d.slotWatch;await chrome.storage.local.set({slotWatch:on,slotInterval:Math.max(10,Math.min(300,Number($("interval").value)||30)),preferredCenter:$("preferredCenter").value.trim()});setWatch(on);msg(on?"Slot Watch enabled. Keep the appointment page open.":"Slot Watch disabled.",on?"ok":"")};
$("interval").onchange=async()=>await chrome.storage.local.set({slotInterval:Math.max(10,Math.min(300,Number($("interval").value)||30))});
$("preferredCenter").onchange=async()=>await chrome.storage.local.set({preferredCenter:$("preferredCenter").value.trim()});
$("check").onclick=async()=>{let[t]=await chrome.tabs.query({active:true,currentWindow:true});try{let r=await chrome.tabs.sendMessage(t.id,{type:"CHECK_SLOT"});msg(r.message,r.available?"ok":"warn")}catch(e){msg("Open appointment.ivacbd.com first.","warn")}};
$("open").onclick=()=>chrome.tabs.create({url:"https://appointment.ivacbd.com/"});
$("openVisa").onclick=()=>chrome.tabs.create({url:"https://www.indianvisa-bangladesh.nic.in/visa/"});
load();