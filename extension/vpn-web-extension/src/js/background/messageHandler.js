

const messageHandler = {
  async init() {
    browser.runtime.onMessage.addListener(async (message) => {
      switch (message.message) {
        case "getClientStatus":
          return MozillaVPNMessenger.getClientStatus();
        case "queryServers":
          MozillaVPNMessenger.postToApp("servers");
          return 
        case "queryStatus":
          MozillaVPNMessenger.postToApp("status");
          break;
      }
    });
  }
}

messageHandler.init();