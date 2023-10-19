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

function tryToResumeVideo() {
  resumeVideo();  // try to resume video immediately
  // Every 50ms until 500ms check if video is paused and try to resume it
  let loops = 0;
  const limit = 20;
  const interval = 100;
  const timer = setInterval(async () => {
    log(`Is video paused? (${++loops})`);
    resumeVideo();
    // const video = document.querySelector('video');    
    // if (!video) {
    //   log('Bad video!');
    // } else if (video.paused === true) {
    //   log(`Video is paused, trying resuming again...`);
    //   await resumeVideo();
    // } else {
    //   log('Video is not paused');
    // }
    if (loops >= limit) {
      clearInterval(timer);
    }
  }, interval);

  function resumeVideo() {
    log('Trying to resume video .......');
    const video = document.querySelector('video');
    try {
      // if (video?.paused === true) {

        const playPromise = video.play();

        if (playPromise !== undefined) {
          playPromise.then(_ => {
            log('Video resumed successfully');
          })
          .catch(error => {
            log('NEW Error resuming video');
            log(error.message);
            console.error(error);
          });
        } else {
          log('No play promise!');
        }

        return video;
      // } else {
      //   log('No paused video found');
      // }
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
