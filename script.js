// Name: YouTube Anti Anti-Adblock
// Version: 0.9.1
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
  // detect visible popup container
  const popupContainer = doc.querySelector('ytd-popup-container');
  if (popupContainer && popupContainer.style.display !== 'none') {
    if (isAdblockPopup(popupContainer)) {
      log('Adblock popup found, removing it');
      removePopup(popupContainer);
      tryToResumeVideo();
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

function removePopup(popupContainer) {
  popupContainer.remove();
  log('Removed popup container');
}

// Try to resume video in increasing intervals until it is resumed or limit is reached.
async function tryToResumeVideo(tryIndex = 0) {
  const video = await resumeVideo();
  if (!video || video.paused) {
    const intervals = [10, 100, 200, 300, 400, 500];
    let intervalIndex = tryIndex || 0;
    log(`Video is still paused, trying again in ${intervals[intervalIndex]}ms`);
    
    setTimeout(async () => {
      const video = document.querySelector('video');
      if (!video || video.paused) {
        tryToResumeVideo(intervalIndex + 1);
      } else {
        log('Video already resumed');
      }
    }, intervals[intervalIndex]);
  }

  async function resumeVideo() {
    const video = document.querySelector('video');
    try {
      if (video?.paused) {
        await video.play();
        log('Video resumed');
        return video;
      } else {
        log('No paused video found');
      }
    } catch (err) {
      log('Error resuming video');
      log(err.message);
      console.error(err);
    }
    return null;
  }  
}

function log(message) {
  if (isDebug) console.log(`[YouTube Anti Anti-Adblock] ${message}`);
}
