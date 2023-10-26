await browser.runtime.sendMessage({ message: "queryStatus" });
await browser.runtime.sendMessage({ message: "queryServers" });




const ProxyHandler = {
  async getEspeciallyProxiedOriginList() {
    const originList = await browser.storage.local.get("proxiedOrigins");
    
    if(!originList || !originList["proxiedOrigins"]) {
      return null;
    }

    return originList["proxiedOrigins"];
  },

  async getProxyForOrigin(origin) {
    const proxyList = await this.getEspeciallyProxiedOriginList();
    if(!proxyList) {
      return null;
    }

    return proxyList.find(o => origin === origin);
  },

  getMozillaProxyInfoObj() {
    return {
      countryCode: undefined,
      cityName: undefined,
      mozProxyEnabled: undefined
    };
  },
};

(async () => {
  const clientStatus = await browser.storage.local.get('status');
  console.log(clientStatus.status);

  // Set client status
  const clientStatusEl = document.querySelector("#client-status");
  clientStatusEl.innerHTML = clientStatus.status.vpn;

  // Set client location
  const clientLocationEl = document.querySelector("#client-location");
  clientLocationEl.innerHTML = clientStatus.status.location.exit_city_name;

  // Set tab location
  const tabLocation = await getCurrentOrigin();
  const tabProxyLocation = await ProxyHandler.getProxyForOrigin(tabLocation);
  const tabLocationEl = document.querySelector('#tab-location');

  console.log(tabProxyLocation);
  // tabLocation.innerHTML = tabProxyLocation

  document.querySelectorAll(".change-location").forEach(el => {
    addEnterAndClickHandler(el, async(e) => {
      requestView("server-list");
    });
  });


  // Set 
})();

// Util for adding on click and Enter event handling

function addEnterAndClickHandler(element, handler) {
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

async function getOriginAndSetProxy(proxy) {
  console.log(proxy, "proxy")
  const currentOrigin = await getCurrentOrigin();
  setProxyForOrigin(currentOrigin, proxy);
}

function pickProxyBasedOnWeight(serverList) {
  const filteredServerList = serverList.filter(server => typeof(server.socksName) !== "undefined" && server.socksName !== "");

  const sumWeight = filteredServerList.reduce((sum, { weight }) => sum + weight, 0);
  let randomInteger = getRandomInteger(0, sumWeight);

  let nextServer = {};
  for (const server of filteredServerList) {
    if (server.weight >= randomInteger) {
      return nextServer = server;
    }
    randomInteger = (randomInteger - server.weight);
  }
  return nextServer;
}

function makeProxyString(socksName) {
  return `socks://${socksName}.mullvad.net:1080`;
}

function getRandomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}


function getProxy(countryCode, cityName, servers) {
  const selectedServerCountry = servers.find(({code}) => code === countryCode);
  const selectedServerCity = selectedServerCountry.cities.find(({name}) => name === cityName);
  const proxyServer = pickProxyBasedOnWeight(selectedServerCity.servers);
  return parseProxy(
    makeProxyString(proxyServer.socksName),
    {
      countryCode: countryCode,
      cityName: cityName,
    }
  );
}

function parseProxy(proxy_str, mozillaVPNData) {
  const proxyRegexp = /(?<type>(https?)|(socks4?)):\/\/(\b(?<username>[\w-]+):(?<password>[\w-]+)@)?(?<host>((?:\d{1,3}\.){3}\d{1,3}\b)|(\b([\w.-]+)+))(:(?<port>\d+))?/;
  const matches = proxyRegexp.exec(proxy_str);
  if (!matches) {
    return false;
  }

  console.log("matches", matches)


  if (!mozillaVpnData) {
    mozillaVpnData = ProxyHandler.getMozillaProxyInfoObj();
  }

  return {...matches.groups,...mozillaVpnData};
}


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
        addEnterAndClickHandler((cityListItem), async(e) => {
          if (e.key === "Enter") {
            radioBtn.checked = true;
          }
          const proxy = getProxy(
            radioBtn.dataset.countryCode,
            radioBtn.dataset.cityName,
            servers
          );
          getOriginAndSetProxy(proxy);
        });
  
        // Set city name
        cityName.textContent = city.name;
        cityList.appendChild(cityTemplateClone);
      });
      listWrapper.appendChild(templateClone);
    });
  },
}

// ServerList.init();

async function getCurrentTab() {
  return await browser.tabs.query({
    currentWindow: true,
    active: true
  });
};

async function getCurrentOrigin() {
  const currentTab = await getCurrentTab();
  const currentOriginURL = new URL(currentTab[0].url);
  return currentOriginURL.hostname;
}

async function getProxiedOriginsList() {
  const originList = await browser.storage.local.get("proxiedOrigins");
  if(!originList || !originList["proxiedOrigins"]) {
    return null;
  }

  return originList["proxiedOrigins"];
}

async function setProxyForOrigin(origin, proxy) {
  let proxiedOriginsList = await getProxiedOriginsList();
  if (!proxiedOriginsList) proxiedOriginsList = [];

  const index = proxiedOriginsList.findIndex(i => i.origin === origin);
  if (index === -1) {
    proxiedOriginsList.push({
      origin: origin,
      proxy: proxy
    });
  } else {
    proxiedOriginsList[index] = {
      origin: origin,
      proxy: proxy
    };
  }

  await browser.storage.local.set({
    "proxiedOrigins": proxiedOriginsList
  });
}