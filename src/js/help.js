//
// リンク | Links
//

window.addEventListener("load", async() => {
    document.getElementById("web-doc").addEventListener("click", () => {
      window.api.openURL("https://github.com/suika2engine/suika2/wiki");
    });

    document.getElementById("discord-link").addEventListener("click", () => {
        window.api.openURL("https://discord.gg/ZmvXxE8GFg");
    });

    document.getElementById("wiki-s2s").addEventListener("click", () => {
        window.api.openURL("https://github.com/suika2engine/suika2/wiki/3.-Suika2Script-and-Commands");
    });
})

//
// ドキュメント | Document
//

// Jump to 'welcome' (Documentation Home) page when opened or refreshed.
document.location.hash = "#welcome";
