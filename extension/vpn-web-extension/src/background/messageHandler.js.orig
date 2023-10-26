

const messageHandler = {
  async init() {
    browser.runtime.onMessage.addListener(async (message) => {
      let response;

      switch (message.method) {
        case "getClientStatus":
          response = MozillaVPNMessenger.getConnectionStatus();
          break;
        case "queryServers":
          await MozillaVPNMessenger.postToApp("servers");
          break;
        case "queryStatus":
          await MozillaVPNMessenger.postToApp("status");
          break;
      }
    });
  }
}

messageHandler.init();