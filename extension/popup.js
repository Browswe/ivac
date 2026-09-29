const $ = id => document.getElementById(id);
const status = msg => $("status").textContent = msg;

chrome.storage.local.get(["name","passport","phone"], data => {
  $("name").value = data.name || "";
  $("passport").value = data.passport || "";
  $("phone").value = data.phone || "";
});

$("save").addEventListener("click", async () => {
  await chrome.storage.local.set({
    name: $("name").value.trim(),
    passport: $("passport").value.trim(),
    phone: $("phone").value.trim()
  });
  status("Saved.");
});

$("fill").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({active:true,currentWindow:true});
  if (!tab?.id) return status("No active tab.");
  try {
    const data = await chrome.storage.local.get(["name","passport","phone"]);
    await chrome.tabs.sendMessage(tab.id, {type:"FILL_FORM", data});
    status("Form fields filled where detected.");
  } catch {
    status("Open an IVAC page first.");
  }
});

$("open").addEventListener("click", () => {
  chrome.tabs.create({url:"https://www.ivacbd.com/"});
});