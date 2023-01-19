window.addEventListener("load", async() => {
    // URL Test
    document.getElementById("doc").addEventListener("click", () => {
        window.api.openURL("https://docs.suika2.com/");
    });

    // TODO: Load the config
})

window.addEventListener("beforeunload", async () => {
    // TODO: Save the config
})
