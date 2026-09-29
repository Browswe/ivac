function setValue(input, value) {
  if (!input || !value) return;
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
  if (setter) setter.call(input, value); else input.value = value;
  input.dispatchEvent(new Event("input", {bubbles:true}));
  input.dispatchEvent(new Event("change", {bubbles:true}));
}

function findField(patterns) {
  const fields = [...document.querySelectorAll("input, textarea")];
  return fields.find(el => {
    const text = [
      el.name, el.id, el.placeholder, el.getAttribute("aria-label")
    ].filter(Boolean).join(" ").toLowerCase();
    return patterns.some(p => text.includes(p));
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type !== "FILL_FORM") return;
  const d = message.data || {};
  setValue(findField(["full name","applicant name","name"]), d.name);
  setValue(findField(["passport","passport no","passport number"]), d.passport);
  setValue(findField(["mobile","phone","contact"]), d.phone);
  sendResponse?.({ok:true});
  return true;
});