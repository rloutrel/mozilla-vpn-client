const MozillaVPNMessenger = {
  SERVERS_KEY: 'servers',
  STATUS_KEY: 'status', 

  _isolationKey: 7, 

  async init() {

    if (this.port && this.port.error === null) {
      this.postToApp(MozillaVPNMessenger.STATUS_KEY);
      this.postToApp(MozillaVPNMessenger.SERVERS_KEY);
      return;
    }

    try {
      this.port = await browser.runtime.connectNative('mozillavpn');
      this.port.onMessage.addListener(this.handleClientResponse);
      
      this.postToApp('status');
      this.postToApp(MozillaVPNMessenger.SERVERS_KEY);

      // When the mozillavpn dies or the VPN disconnects, we need to increase
      // the isolation key in order to create new proxy connections. Otherwise
      // we could see random timeout when the browser tries to connect to an
      // invalid proxy connection.
      this.port.onDisconnect.addListener(() => this.increaseIsolationKey());

    } catch (e) {
      console.error(e);
    }
  },

  // Post messages to MozillaVPN client
  postToApp(message) {
    try {
      this.port.postMessage({t: message});
    } catch (e) {
      console.error(e, 'error')
    }
  },

  async getClientStatus() {
    if (MozillaVPNMessenger.status) {
      return await MozillaVPNMessenger.status
    }
    return {};
  },

  async handleClientResponse(response) {
    if (response.servers) {
      const servers = response.servers.countries;
      browser.storage.local.set({[MozillaVPNMessenger.SERVERS_KEY]: servers});
      return;
    }

    if ((response.status && response.status.vpn) || response.t === 'status') {
      if (response.status) {
        MozillaVPNMessenger.status = response.status;
        await browser.storage.local.set({[MozillaVPNMessenger.STATUS_KEY]: response});
      } else if (response.t === 'status') {
        MozillaVPNMessenger.status = response;
        await browser.storage.local.set({[MozillaVPNMessenger.STATUS_KEY]: response});
      }
      // Let's increase the network key isolation at any vpn status change.
      MozillaVPNMessenger.increaseIsolationKey();
    }
  },

  increaseIsolationKey() {
    ++this._isolationKey;
  },
};

MozillaVPNMessenger.init();

setInterval(() => {
  MozillaVPNMessenger.postToApp('status');
}, 1000);