var config = {};

function getConfigValue(key, defaultValue) {
    if(typeof config[key] === "undefined") {
        return defaultValue;
    }
    return config[key];
}

function intToBool(val) {
    if(val === "0") {
        return false;
    }
    return true;
}

window.addEventListener("load", async() => {
    // Load from config.txt.
    //config = await window.api.loadConfig();

    // Set properties.
    document.getElementById("window-title").value = getConfigValue("window.title", "Suika");
    document.getElementById("window-width").value = getConfigValue("window.width", "1280");
    document.getElementById("window-height").value = getConfigValue("window.height", "720");
    document.getElementById("window-white").checked = intToBool(getConfigValue("window.white", "1"));
    document.getElementById("window-menubar").checked = intToBool(getConfigValue("window.menubar", "0"));
})

window.addEventListener("beforeunload", async () => {
    // Get properties.

    // Validate properties.

    // Store to config.txt.
    //await window.api.storeConfig(config);    
})
