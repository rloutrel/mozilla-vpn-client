const ProxyHandler = {

  async getOriginAndSetProxy(proxy) {
    const currentTab = await Utils.getCurrentTab();
    const currentUrl = currentTab[0].url;
    const formattedUrl = new URL(currentUrl).hostname
    this.setProxyForOrigin(formattedUrl, proxy);
  },

  pickProxyBasedOnWeight(serverList) {
    const filteredServerList = serverList.filter(server => typeof(server.socksName) !== "undefined" && server.socksName !== "");
  
    const sumWeight = filteredServerList.reduce((sum, { weight }) => sum + weight, 0);
    let randomInteger = this.getRandomInteger(0, sumWeight);
  
    let nextServer = {};
    for (const server of filteredServerList) {
      if (server.weight >= randomInteger) {
        return nextServer = server;
      }
      randomInteger = (randomInteger - server.weight);
    }
    return nextServer;
  },
  
  makeProxyString(socksName) {
    return `socks://${socksName}.mullvad.net:1080`;
  },
  
  getRandomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },
  
  
  getProxy(countryCode, cityName, servers) {
    const selectedServerCountry = servers.find(({code}) => code === countryCode);
    const selectedServerCity = selectedServerCountry.cities.find(({name}) => name === cityName);
    const proxyServer = this.pickProxyBasedOnWeight(selectedServerCity.servers);
    return this.parseProxy(
      this.makeProxyString(proxyServer.socksName),
      {
        countryCode: countryCode,
        cityName: cityName,
      } 
    );
  },

  async getProxiedOriginsMap() {
    const proxiedOriginsMap = await browser.storage.local.get('proxiedOrigins');
    if (!proxiedOriginsMap || !proxiedOriginsMap['proxiedOrigins']) {

      return null;
    }
    return proxiedOriginsMap['proxiedOrigins'];
  },

  async getProxyConfigForUrl(origin) {
    const proxiedOrigins = await this.getProxiedOriginsMap();
    if (!proxiedOrigins || !proxiedOrigins.has(origin)) {
      return null;
    }

    return proxiedOrigins.get(origin);
  },

  getMozillaProxyInfoObj() {
    return {
      countryCode: undefined,
      cityName: undefined,
      mozProxyEnabled: undefined
    };
  },

  parseProxy(proxy_str, mozillaVpnData) {
    const proxyRegexp = /(?<type>(https?)|(socks4?)):\/\/(\b(?<username>[\w-]+):(?<password>[\w-]+)@)?(?<host>((?:\d{1,3}\.){3}\d{1,3}\b)|(\b([\w.-]+)+))(:(?<port>\d+))?/;
    const matches = proxyRegexp.exec(proxy_str);
    if (!matches) {
      return false;
    }
  
    if (!mozillaVpnData) {
      mozillaVpnData = this.getMozillaProxyInfoObj();
    }
  
    return {...matches.groups,...mozillaVpnData,...{ proxyDNS: true}};
  },

  async setProxyForOrigin(origin, proxy) {
    let proxiedOriginsList = await this.getProxiedOriginsMap();
    if (!proxiedOriginsList) proxiedOriginsList = new Map();
  
    proxiedOriginsList.set(origin, {
      proxy: proxy
    });
  
    await browser.storage.local.set({
      "proxiedOrigins": proxiedOriginsList
    });
  },
};

window.ProxyHandler = ProxyHandler;