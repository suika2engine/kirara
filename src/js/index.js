/*
 * txtビュー
 */

async function refreshTxt() {
    var element = document.getElementById("txt-list");
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }

    const txt = await window.api.getTxtList();
    txt.forEach(function(file) {
        var elem = document.createElement('li');
        elem.id = makeId();
        elem.textContent = file;
        elem.draggable = "true";
        elem.className = "left-tab-list-item";
        elem.template = true;
        elem.cmd = "@load " + file;
        elem.addEventListener("click", () => {
            Array.from(document.getElementById("txt-list").childNodes).forEach(function (e) {
                if(e.className == "left-tab-list-item" || e.className == "left-tab-list-item-sel") {
                    if(e === event.srcElement) {
                        e.className = "left-tab-list-item-sel";
                    } else {
                        e.className = "left-tab-list-item";
                    }
                }
            });
            document.getElementById("thumbnail-picture").src = "";
        });
        elem.addEventListener("dragstart", () => {
            event.dataTransfer.setData("text/plain", event.target.id);
            return true;
        });
        document.getElementById("txt-list").appendChild(elem);
    });
}

function makeId() {
    return new Date().getTime().toString(16) + Math.floor(1000 * Math.random()).toString(16);
}

/*
 * bgビュー
 */

async function refreshBg() {
    var element = document.getElementById("bg-list");
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }

    const bg = await window.api.getBgList();
    bg.forEach(function(file) {
        var elem = document.createElement('li');
        elem.id = makeId();
        elem.textContent = file;
        elem.draggable = "true";
        elem.className = "left-tab-list-item";
        elem.template = true;
        elem.cmd = "@bg " + file + " 1.0";
        elem.addEventListener("click", async () => {
            Array.from(document.getElementById("bg-list").childNodes).forEach(function (e) {
                if(e.className == "left-tab-list-item" || e.className == "left-tab-list-item-sel") {
                    if(e === event.srcElement) {
                        e.className = "left-tab-list-item-sel";
                    } else {
                        e.className = "left-tab-list-item";
                    }
                }
            });
            document.getElementById("thumbnail-picture").src = await window.api.getBaseUrl() + "bg/" + file;
        });
        elem.addEventListener("dragstart", () => {
            event.dataTransfer.setData("text/plain", event.target.id);
            return true;
        });
        document.getElementById("bg-list").appendChild(elem);
    });
}

/*
 * chビュー
 */

async function refreshCh() {
    var element = document.getElementById("ch-list");
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }

    const ch = await window.api.getChList();
    ch.forEach(function(file) {
        var elem = document.createElement('li');
        elem.id = makeId();
        elem.textContent = file;
        elem.draggable = "true";
        elem.className = "left-tab-list-item";
        elem.template = true;
        elem.cmd = "@ch center " + file + " 1.0";
        elem.addEventListener("click", async () => {
            Array.from(document.getElementById("ch-list").childNodes).forEach(function (e) {
                if(e.className == "left-tab-list-item" || e.className == "left-tab-list-item-sel") {
                    if(e === event.srcElement) {
                        e.className = "left-tab-list-item-sel";
                    } else {
                        e.className = "left-tab-list-item";
                    }
                }
            });
            document.getElementById("thumbnail-picture").src = await window.api.getBaseUrl() + "ch/" + file;
        });
        elem.addEventListener("dragstart", () => {
            event.dataTransfer.setData("text/plain", event.target.id);
            return true;
        });
        document.getElementById("ch-list").appendChild(elem);
    });
}

/*
 * bgmビュー
 */

async function refreshBgm() {
    var element = document.getElementById("bgm-list");
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }

    const bgm = await window.api.getBgmList();
    bgm.forEach(function(file) {
        var elem = document.createElement('li');
        elem.id = makeId();
        elem.textContent = file;
        elem.draggable = "true";
        elem.className = "left-tab-list-item";
        elem.template = true;
        elem.cmd = "@bgm " + file;
        elem.addEventListener("click", async () => {
            Array.from(document.getElementById("bgm-list").childNodes).forEach(function (e) {
                if(e.className == "left-tab-list-item" || e.className == "left-tab-list-item-sel") {
                    if(e === event.srcElement) {
                        e.className = "left-tab-list-item-sel";
                    } else {
                        e.className = "left-tab-list-item";
                    }
                }
            });
            document.getElementById("thumbnail-picture").src = "";
        });
        elem.addEventListener("dragstart", () => {
            event.dataTransfer.setData("text/plain", event.target.id);
            return true;
        });
        document.getElementById("bgm-list").appendChild(elem);
    });
}

/*
 * seビュー
 */

async function refreshSe() {
    var element = document.getElementById("se-list");
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }

    const se = await window.api.getSeList();
    se.forEach(function(file) {
        var elem = document.createElement('li');
        elem.id = makeId();
        elem.textContent = file;
        elem.draggable = "true";
        elem.className = "left-tab-list-item";
        elem.template = true;
        elem.cmd = "@se " + file;
        elem.addEventListener("click", async () => {
            Array.from(document.getElementById("se-list").childNodes).forEach(function (e) {
                if(e.className == "left-tab-list-item" || e.className == "left-tab-list-item-sel") {
                    if(e === event.srcElement) {
                        e.className = "left-tab-list-item-sel";
                    } else {
                        e.className = "left-tab-list-item";
                    }
                }
            });
            document.getElementById("thumbnail-picture").src = "";
        });
        elem.addEventListener("dragstart", () => {
            event.dataTransfer.setData("text/plain", event.target.id);
            return true;
        });
        document.getElementById("se-list").appendChild(elem);
    });
}

/*
 * シナリオビュー
 */

function createCommandElement(command) {
    var newElem = document.createElement("li");
    newElem.id = makeId();
    newElem.draggable = "true";
    newElem.cmd = command;
    newElem.classList.add("drag-list-item");
    newElem.addEventListener("click", async () => {
        Array.from(document.getElementById("scenario").childNodes).forEach(function (e) {
            if(e.classList.contains("drag-list-item")) {
                if(e === event.srcElement) {
                    e.classList.add("drag-list-item-sel");
                } else {
                    e.classList.remove("drag-list-item-sel");
                }
            }
        });
        document.getElementById("thumbnail-picture").src = "";
    });
    if (command.match(/^\*.+\*.+$/)) {
        var sp = command.split("*");
        newElem.textContent = sp[0] + "「" + sp[1] + "」";
        newElem.classList.add("drag-list-item-serif");
    } else if(command.match(/^\*.+\*.+\*+.$/)) {
        var sp = command.split("*");
        newElem.textContent = sp[0] + "「" + sp[2] + "」";
        newElem.classList.add("drag-list-item-serif");
    } else if(command.match(/^.+「.*」$/)) {
        newElem.textContent = command;
        newElem.classList.add("drag-list-item-serif");
    } else if (command.startsWith("@bg ") || command.startsWith("@背景 ")) {
        newElem.textContent = "背景";
        newElem.classList.add("drag-list-item-bg");
    } else {
        newElem.textContent = command;
        newElem.classList.add("drag-list-item-etc");
    }
    return newElem;
}

function onScenarioDragStart(event) {
    event.dataTransfer.setData("text/plain", event.target.id);
    return true;
}

function onScenarioDragOver(event) {
    event.preventDefault();
    this.style.borderTop = "2px solid blue";
    return false;
}

function onScenarioDragLeave(event) {
    this.style.borderTop = "";
}

function onScenarioDrop(event) {
    event.preventDefault();
    this.style.borderTop = "";

    var id = event.dataTransfer.getData("text/plain");
    var elemDrag = document.getElementById(id);

    // シナリオ項目の移動
    if(elemDrag.template === undefined) {
        this.parentNode.insertBefore(elemDrag, this);
        return;
    }

    // パレット/素材の挿入
    var newElem = createCommandElement(elemDrag.cmd);
    newElem.addEventListener("dragstart", onScenarioDragStart);
    newElem.addEventListener("dragover", onScenarioDragOver);
    newElem.addEventListener("dragleave", onScenarioDragLeave);
    newElem.addEventListener("drop", onScenarioDrop);
    this.parentNode.insertBefore(newElem, this);
}

// シナリオビューをリフレッシュする
async function refreshScenario() {
    // シナリオビューのアイテムをすべて削除する
    var element = document.getElementById("scenario");
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }

    // シナリオデータを取得してビューに追加する
    var arr = await window.api.getScenarioData();
    arr.forEach(line => {
        var elem = createCommandElement(line);
        elem.addEventListener("dragstart", onScenarioDragStart);
        elem.addEventListener("dragover", onScenarioDragOver);
        elem.addEventListener("dragleave", onScenarioDragLeave);
        elem.addEventListener("drop", onScenarioDrop);
        document.getElementById("scenario").appendChild(elem);
    });
}

/*
 * ロード時
 */

window.addEventListener('load', async () => {
    //
    // パレットの要素をセットアップしてイベントリスナを追加する
    //
    Array.from(document.getElementById("palette").childNodes).forEach(function (elem) {
        if(elem.id === undefined) {
            return;
        }
        switch(elem.id) {
        case "cmd-message":
            switch(Math.floor(Math.random() * 4)) {
            case 0: elem.cmd = "ダブルクリックして文章を入力してください"; break;
            case 1: elem.cmd = "ここに入力した文章がゲーム画面に表示されます"; break;
            case 2: elem.cmd = "あのイーハトーヴォのすきとおった風"; break;
            default: elem.cmd = "文章"; break;
            }
            break;
        case "cmd-serif": elem.cmd = "キャラ「セリフ」"; break;
        case "cmd-choose": elem.cmd = "@choose L1 選択肢1 L2 選択肢2 L3 選択肢3"; break;
        case "cmd-vol": elem.cmd = "@vol bgm 1.0 1.0"; break;
        case "cmd-cha": elem.cmd = "@cha center 1.0 move 100 0 show"; break;
        case "cmd-label": elem.cmd = ":目印"; break;
        case "cmd-goto": elem.cmd = "@goto 行き先"; break;
        case "cmd-set": elem.cmd = "@set $0 = 1"; break;
        case "cmd-chapter": elem.cmd = "@chapter 章のタイトル"; break;
        case "cmd-wait": elem.cmd = "@wait 1000";
        }
        elem.template = true;
        elem.addEventListener("dragstart", () => {
            event.dataTransfer.setData("text/plain", event.target.id);
            return true;
        });
        elem.addEventListener("click", () => {
            Array.from(document.getElementById("palette").childNodes).forEach(function (c) {
                if(c.className == "left-tab-list-item" || c.className == "left-tab-list-item-sel") {
                    if(c === event.srcElement) {
                        c.className = "left-tab-list-item-sel";
                    } else {
                        c.className = "left-tab-list-item";
                    }
                }
            });
            document.getElementById("thumbnail-picture").src = "";
        });
    });

    //
    // txtフォルダの中身を取得してリスト要素を追加し、イベントリスナを追加する
    //
    refreshTxt();
    var txtPanel = document.getElementById("left-tab-panel-txt");
    txtPanel.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        document.getElementById("left-tab-panel-txt").classList.add('dragover');
    });
    txtPanel.addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
        document.getElementById("left-tab-panel-txt").classList.remove('dragover');
    });
    txtPanel.addEventListener('drop', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        document.getElementById("left-tab-panel-txt").classList.remove('dragover');
        for (const file of e.dataTransfer.files) {
            await window.api.addTxtFile(file.path);
        }
        refreshTxt();
    });

    //
    // bgフォルダの中身を取得してリスト要素を追加し、イベントリスナを追加する
    //
    refreshBg();
    var bgPanel = document.getElementById("left-tab-panel-bg");
    bgPanel.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        document.getElementById("left-tab-panel-bg").classList.add('dragover');
    });
    bgPanel.addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
        document.getElementById("left-tab-panel-bg").classList.remove('dragover');
    });
    bgPanel.addEventListener('drop', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        document.getElementById("left-tab-panel-bg").classList.remove('dragover');
        for (const file of e.dataTransfer.files) {
            await window.api.addBgFile(file.path);
        }
        refreshBg();
    });

    //
    // chフォルダの中身を取得してリスト要素を追加し、イベントリスナを追加する
    //
    refreshCh();
    var chPanel = document.getElementById("left-tab-panel-ch");
    chPanel.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        document.getElementById("left-tab-panel-ch").classList.add('dragover');
    });
    chPanel.addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
        document.getElementById("left-tab-panel-ch").classList.remove('dragover');
    });
    chPanel.addEventListener('drop', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        document.getElementById("left-tab-panel-ch").classList.remove('dragover');
        for (const file of e.dataTransfer.files) {
            await window.api.addChFile(file.path);
        }
        refreshCh();
    });

    //
    // bgmフォルダの中身を取得してリスト要素を追加し、イベントリスナを追加する
    //
    refreshBgm();
    var bgmPanel = document.getElementById("left-tab-panel-bgm");
    bgmPanel.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        document.getElementById("left-tab-panel-bgm").classList.add('dragover');
    });
    bgmPanel.addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
        document.getElementById("left-tab-panel-bgm").classList.remove('dragover');
    });
    bgmPanel.addEventListener('drop', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        document.getElementById("left-tab-panel-bgm").classList.remove('dragover');
        for (const file of e.dataTransfer.files) {
            await window.api.addBgmFile(file.path);
        }
        refreshBgm();
    });

    //
    // seフォルダの中身を取得してリスト要素を追加し、イベントリスナを追加する
    //
    refreshSe();
    var sePanel = document.getElementById("left-tab-panel-se");
    sePanel.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        document.getElementById("left-tab-panel-se").classList.add('dragover');
    });
    sePanel.addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
        document.getElementById("left-tab-panel-se").classList.remove('dragover');
    });
    sePanel.addEventListener('drop', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        document.getElementById("left-tab-panel-se").classList.remove('dragover');
        for (const file of e.dataTransfer.files) {
            await window.api.addSeFile(file.path);
        }
        refreshSe();
    });

    //
    // シナリオの要素を追加する
    //
    refreshScenario();
})
