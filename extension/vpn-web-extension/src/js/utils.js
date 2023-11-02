const Utils = {
  async getCurrentTab() {
    return await browser.tabs.query({
      currentWindow: true,
      active: true
    });
  },
  
  async getCurrentOrigin() {
    const currentTab = await this.getCurrentTab();
    const currentOriginURL = new URL(currentTab[0].url);
    return currentOriginURL.hostname;
  },

  // Util for adding on click and Enter event handling
  addEnterAndClickHandler(element, handler) {
    element.addEventListener("click", (e) => {
      handler(e);
    });
    element.addEventListener("keydown", (e) => {
      if (e.keyCode === 13) {
        e.preventDefault();
        handler(e);
      }
    });
  }
};

window.Utils = Utils;