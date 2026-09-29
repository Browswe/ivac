chrome.runtime.onMessage.addListener((m)=>{
  if(m?.type==="SLOT_FOUND"){
    chrome.notifications.create("ivac-slot-"+Date.now(),{
      type:"basic",
      iconUrl:"icon.png",
      title:"IVAC Slot Available",
      message:m.message||"An appointment date may be available. Check the IVAC page now.",
      priority:2
    });
  }
});