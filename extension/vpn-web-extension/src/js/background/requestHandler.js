const RequestHandler = {
  async init() {

    if (!this.proxiedTabs) {
      this.proxiedTabs = new Map();
    } 

    

    browser.proxy.onRequest.addListener(
        this.requestListener, {urls: ['<all_urls>']});

    // browser.proxy.onError.addListener(error => {
    //   // console.error("Proxy error: ", error);
    //   console.log(error)
    // });

    // browser.webRequest.onBeforeRequest.addListener((options) => {
    //  this.onBeforeRequest(options);
    // },{urls: ["<all_urls>"]}, ["blocking"]);
    browser.webRequest.onBeforeRequest.addListener((options) => {
      this.onBeforeRequest(options);
     },{urls: ["<all_urls>"]});
  },


  onBeforeRequest(options) {
    if (options.tabId == -1) {
    console.log(options)
    }
    // console.log("options")
    // console.log(options)
    // console.log(options)
    // console.log("onreq", options.requestId, options.tabId)
    // const { tabId } = options;
    // if (options.tabId === -1) {
    //   console.warn("blocking ", options);
    //   return {cancel: true};
    // }
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
    // console.log("proxy", req.requestId, req.type, req.tabId)
    // console.log(req)
    // if (!req.url) {
    //   console.log(req)
    // }
    // if (req.url && req.url == "https://mozilla.cloudflare-dns.com/dns-query" ) {
    //   return { type: "direct"}
    // }
    // if (req.tabId == "-1") {
    //   console.log(req)
    // console.log(req)
    // }
    // if (!req.url || req.url !== "https://mozilla.cloudflare-dns.com/dns-query" && req.tabId == -1) {
    //   console.log(req)
    // }
    
    // const {originUrl, tabId, url} = req;

    // if (tabId == -1) {
    //   return null;
    // }

    // if (RequestHandler.proxiedTabs.has(tabId)) {
    //   const proxyConfig = RequestHandler.proxiedTabs.get(tabId);


    //   // return [{
    //   //   ...proxyConfig.proxy,
    //   //   connectionIsolationKey: '' + MozillaVPNMessenger._isolationKey
    //   // }];
    // }


    // const formattedUrl = new URL(url).hostname;
    // let proxyConfig = await ProxyHandler.getProxyConfigForUrl(formattedUrl);
    
    // if (proxyConfig) {
    //   return RequestHandler.proxyConfigWithIsolationKey(proxyConfig);
    // }

    // Format originUrl
    // const formattedOriginHostname = new URL(originUrl).hostname;


    // Get proxy address for origin
    // proxyConfig = await ProxyHandler.getProxyConfigForUrl(formattedOriginHostname);

    // if (!proxyConfig) {
    //   return null;
    // }

    // Add tabID and proxyInfo to proxiedTabs list
    // RequestHandler.proxiedTabs.set(tabId, proxyConfig);

    // Do the damn thing
    // return RequestHandler.proxyConfigWithIsolationKey(proxyConfig);
    // return {type: "direct"}
  },
}

RequestHandler.init();