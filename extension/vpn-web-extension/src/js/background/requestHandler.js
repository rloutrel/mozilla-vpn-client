const RequestHandler = {
  async init() {

    if (!this.proxiedTabs) {
      this.proxiedTabs = new Map();
    } 

    

    browser.proxy.onRequest.addListener(
        this.requestListener, {urls: ['<all_urls>']});

    browser.proxy.onError.addListener(error => {
      console.error("Proxy error: ", error);
    });

    browser.webRequest.onBeforeRequest.addListener((options) => {
      return this.onBeforeRequest(options);
    },{urls: ["<all_urls>"]}, ["blocking"]);
  },


  onBeforeRequest(options) {
    const { tabId } = options;
    if (tabId == -1) {
      console.warn("blocking ", options);
      return {};
    }
  },


  proxyConfigWithIsolationKey(proxyConfig) {
    console.log("adding site isolation key")
    // proxyConfig.proxy.proxyDNS = true;
    console.log("whole proxy config", proxyConfig)
    return [{
      ...proxyConfig.proxy,
      connectionIsolationKey: '' + MozillaVPNMessenger._isolationKey
    }];
  },

  async requestListener(req) {
    
    const {originUrl, tabId, url} = req;

    if (tabId == -1) {
      return null;
    }

    // if (RequestHandler.proxiedTabs.has(tabId)) {
    //   const proxyConfig = RequestHandler.proxiedTabs.get(tabId);


    //   // return [{
    //   //   ...proxyConfig.proxy,
    //   //   connectionIsolationKey: '' + MozillaVPNMessenger._isolationKey
    //   // }];
    // }


    const formattedUrl = new URL(url).hostname;
    let proxyConfig = await ProxyHandler.getProxyConfigForUrl(formattedUrl);
    
    if (proxyConfig) {
      return RequestHandler.proxyConfigWithIsolationKey(proxyConfig);
    }

    // Format originUrl
    const formattedOriginHostname = new URL(originUrl).hostname;


    // Get proxy address for origin
    proxyConfig = await ProxyHandler.getProxyConfigForUrl(formattedOriginHostname);

    if (!proxyConfig) {
      return null;
    }

    // Add tabID and proxyInfo to proxiedTabs list
    // RequestHandler.proxiedTabs.set(tabId, proxyConfig);

    // Do the damn thing
    return RequestHandler.proxyConfigWithIsolationKey(proxyConfig);
  },
}

RequestHandler.init();