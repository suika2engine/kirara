window.addEventListener("load", async () => {
    var gameList = await window.api.getGameList();
    gameList.forEach(game => {
        var e = document.createElement("li");
        e.textContent = game;
        e.addEventListener("click", async () => {
            await window.api.openGame(event.srcElement.textContent);
            await window.api.openScenario("init.txt");
            window.location.href = "index.html";
        });
        document.getElementById("game-list").appendChild(e);
    });

    document.getElementById("new-game").addEventListener("click", async () => {
        if(! await window.api.createGame("new-game")) {
            alert("ゲームフォルダの作成に失敗しました。");
        }
        window.location.href = "boot.html";
    });
});

