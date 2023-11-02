const DebugView = {
  async init() { 
    this.currentTab = await Utils.getCurrentTab();
    this.clientStatus = await browser.runtime.sendMessage({ message: "getClientStatus" });
    this.proxyConfigs = await ProxyHandler.getProxiedOriginsMap();

    // Set client status
    const clientStatusEl = document.querySelector("#client-status");
    clientStatusEl.innerHTML = this.clientStatus.vpn;
  
    // Set client location
    const clientLocationEl = document.querySelector("#client-location");
    clientLocationEl.innerHTML = this.clientStatus.location.exit_city_name;

    // Set Firefox connectivity status
    const firefoxStatusSwitch = document.querySelector("#firefox-connectivity");
    firefoxStatusSwitch.checked = this.clientStatus.vpn === "StateOn"
  
    // Set current tab origin url and favicon
    const tabOriginUrl= await Utils.getCurrentOrigin();
    const tabOriginEl = document.querySelector("#origin-url");
    tabOriginEl.textContent = tabOriginUrl;

    const faviconEl = document.querySelector("#favicon");
    faviconEl.src = this.currentTab[0].favIconUrl;

    const proxyConfig = this.proxyConfigs? this.proxyConfigs.get(tabOriginUrl) : null;
    const tabLocationEl = document.querySelector("#tab-location");
    tabLocationEl.textContent = proxyConfig ? proxyConfig.proxy.cityName : this.clientStatus.location.exit_city_name;
  
    document.querySelectorAll(".change-location").forEach(el => {
      Utils.addEnterAndClickHandler(el, async(e) => {
        requestView("server-list");
      });
    });

    const removeProxyConfigsBtn = document.querySelector("#remove-proxy-configs");

    removeProxyConfigsBtn.querySelector("#num-proxies").textContent = this.proxyConfigs ? `( ${this.proxyConfigs.size} )` : "(0)";
    Utils.addEnterAndClickHandler((removeProxyConfigsBtn), async(e) =>{
      browser.storage.local.remove('proxiedOrigins');
    }); 
  }
};

DebugView.init();


const ServerList = {
  
  toggleCityListVisibility(listItem) {
    const citiesList = listItem.querySelector("ul");
    listItem.classList.toggle("expanded");
    if (listItem.classList.contains("expanded")) {
      // Expand city list
      citiesList.style.height = citiesList.childElementCount * 48 + "px";
    } else {
      // Collapse city list
      citiesList.style.height = 0;
    }
    return;
  },

  async init() {
    const { servers } = await browser.storage.local.get('servers');
    const listWrapper = document.getElementById("moz-vpn-server-list");
    const currentTab = await Utils.getCurrentTab();
  
    servers.forEach((serverCountry) => {
      const listItemTemplate = document.getElementById("server-list-item");
      const templateClone = listItemTemplate.content.cloneNode(true);
      const serverListItem = templateClone.querySelector(".server-list-item");
      serverListItem.dataset.countryCode = serverCountry.code;
  
      // Country name
      const serverCountryName = templateClone.querySelector(".server-country-name");
      serverCountryName.textContent = serverCountry.name;
  
      // Flag
      const serverCountryFlagImage = templateClone.querySelector(".server-country-flag");
      serverCountryFlagImage.src = `../assets/img/flags/${serverCountry.code.toUpperCase()}.png`;
  
      const cityListVisibilityButton = templateClone.querySelector("button");
  
      cityListVisibilityButton.addEventListener("click", (e) => {
        const listItem = e.target.parentElement;
        this.toggleCityListVisibility(listItem);
      });
  
      // Make server city list
      const cityList = templateClone.querySelector("ul");
      const cityListTemplate = document.getElementById("server-city-list-items");
  
      serverCountry.cities.forEach(city => {
        const cityTemplateClone = cityListTemplate.content.cloneNode(true);
  
        const cityName = cityTemplateClone.querySelector(".server-city-name");
  
        // Server city radio inputs
        const radioBtn = cityTemplateClone.querySelector("input");
        radioBtn.dataset.countryCode = serverCountry.code;
        radioBtn.dataset.cityName = city.name;
        radioBtn.name = "server-city";
  
        const cityListItem = cityTemplateClone.querySelector(".server-city-list-item");
        Utils.addEnterAndClickHandler((cityListItem), async(e) => {
          if (e.key === "Enter") {
            radioBtn.checked = true;
          }
          const proxy = ProxyHandler.getProxy(
            radioBtn.dataset.countryCode,
            radioBtn.dataset.cityName,
            servers
          );
          if (radioBtn.checked) {
            ProxyHandler.getOriginAndSetProxy(proxy);
          }
          browser.tabs.reload(currentTab.id)
        });
  
        // Set city name
        cityName.textContent = city.name;
        cityList.appendChild(cityTemplateClone);
      });
      listWrapper.appendChild(templateClone);
    });
  },
}

ServerList.init();
