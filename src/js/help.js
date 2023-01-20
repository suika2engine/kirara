window.addEventListener("load", async() => {
    document.getElementById("discord-link").addEventListener("click", () => {
        window.api.openURL("https://discord.gg/ZmvXxE8GFg");
    });

    document.getElementById("wiki-s2s").addEventListener("click", () => {
        window.api.openURL("https://github.com/suika2engine/suika2/wiki/3.-Suika2Script-and-Commands");
    });
})
