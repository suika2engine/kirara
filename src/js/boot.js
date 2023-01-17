window.addEventListener("load", async () => {
    var gameList = await window.api.getGameList();
    gameList.forEach(game => {
        var e = document.createElement("li");
        e.textContent = game;
        e.classList.add("game-list-item");
        e.addEventListener("click", async () => {
            await window.api.openGame(event.srcElement.textContent);
            await window.api.openScenario("init.txt");
            window.location.href = "index.html";
        });
        document.getElementById("game-list").appendChild(e);
    });

    document.getElementById("new-game").addEventListener("click", async () => {
        var elem = document.getElementById("game-name");
        var gameName = elem.value;
        if(gameName.indexOf(" ") !== -1) {
            alert("名前にスペースを含められません。");
            return;
        }

        if(! await window.api.createGame(gameName)) {
            alert("ゲームフォルダの作成に失敗しました。");
            return;
        }

        await window.api.openGame(gameName);
        await window.api.openScenario("init.txt");
        window.location.href = "index.html";
    });
});

