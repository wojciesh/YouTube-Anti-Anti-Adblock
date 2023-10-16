// Name: YouTube Anti Anti-Adblock
// Version: 0.9
// Author: Wojciech Warpechowski (https://github.com/wojciesh)
// Source: https://github.com/wojciesh/YouTube-Anti-Anti-Adblock
// License: MIT
// Description:
//  Simple Chrome Extension to remove anti-adblock on YouTube.
//  Currently (16/10/2023) if YouTube finds an adblock, it shows a popup and pauses the video.
//  This script removes the popup and resumes the video.


const isDebug = true;   // print logs to console or not

const doc = document;
if (!doc) throw new Error('Document not found');

// Set up a MutationObserver to detect changes
const observer = new MutationObserver(() => {
  // detect popup container
  const popupContainer = doc.querySelector('ytd-popup-container');
  if (popupContainer && popupContainer.style.display !== 'none') {
    if (isAdblockPopup(popupContainer)) {
      log('Adblock popup found, removing it');
      removePopupAndPlayVideo(popupContainer);  
    } else {
      log('Popup found, but it is not Adblock popup');
    }
  }
});

// Observe changes to the document
observer.observe(doc, {
  childList: true,
  subtree: true 
});

function isAdblockPopup(popupContainer) {
  return popupContainer?.classList.contains('ytd-app') &&
          popupContainer.classList.contains('style-scope') &&
          !!(popupContainer.querySelector('ytd-enforcement-message-view-model'));
}

function removePopupAndPlayVideo(popupContainer) {
  popupContainer.remove();
  log('Removed popup container');

  const video = document.querySelector('video');
  if (video?.paused) {
    video.play();
    log('Video resumed');
  } else {
    log('No paused video found');
  }
}

function log(message) {
  if (isDebug) console.log(`[YouTube Anti Anti-Adblock] ${message}`);
}
