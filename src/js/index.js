function makeId() {
    return new Date().getTime().toString(16) + Math.floor(1000 * Math.random()).toString(16);
}

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
            Array.from(document.getElementById("txt-list").childNodes).forEach(function (a) {
                if(a.className == "left-tab-list-item" || a.className == "left-tab-list-item-sel") {
                    if(a === event.srcElement) {
                        a.className = "left-tab-list-item-sel";
                    } else {
                        a.className = "left-tab-list-item";
                    }
                }
            });
            document.getElementById("thumbnail-picture").src = "";
        });
        elem.ondragstart = (event) => {
            event.dataTransfer.setData("text/plain", event.target.id);
            return true;
        }
        document.getElementById("txt-list").appendChild(elem);
    });
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
            Array.from(document.getElementById("bg-list").childNodes).forEach(function (a) {
                if(a.className == "left-tab-list-item" || a.className == "left-tab-list-item-sel") {
                    if(a === event.srcElement) {
                        a.className = "left-tab-list-item-sel";
                    } else {
                        a.className = "left-tab-list-item";
                    }
                }
            });
            document.getElementById("thumbnail-picture").src = await window.api.getBaseUrl() + "bg/" + file;
        });
        elem.ondragstart = (event) => {
            event.dataTransfer.setData("text/plain", event.target.id);
            return true;
        }
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
            Array.from(document.getElementById("ch-list").childNodes).forEach(function (a) {
                if(a.className == "left-tab-list-item" || a.className == "left-tab-list-item-sel") {
                    if(a === event.srcElement) {
                        a.className = "left-tab-list-item-sel";
                    } else {
                        a.className = "left-tab-list-item";
                    }
                }
            });
            document.getElementById("thumbnail-picture").src = await window.api.getBaseUrl() + "ch/" + file;
        });
        elem.ondragstart = (event) => {
            event.dataTransfer.setData("text/plain", event.target.id);
            return true;
        }
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
            Array.from(document.getElementById("bgm-list").childNodes).forEach(function (a) {
                if(a.className == "left-tab-list-item" || a.className == "left-tab-list-item-sel") {
                    if(a === event.srcElement) {
                        a.className = "left-tab-list-item-sel";
                    } else {
                        a.className = "left-tab-list-item";
                    }
                }
            });
            document.getElementById("thumbnail-picture").src = "";
        });
        elem.ondragstart = (event) => {
            event.dataTransfer.setData("text/plain", event.target.id);
            return true;
        }
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
            Array.from(document.getElementById("se-list").childNodes).forEach(function (a) {
                if(a.className == "left-tab-list-item" || a.className == "left-tab-list-item-sel") {
                    if(a === event.srcElement) {
                        a.className = "left-tab-list-item-sel";
                    } else {
                        a.className = "left-tab-list-item";
                    }
                }
            });
            document.getElementById("thumbnail-picture").src = "";
        });
        elem.ondragstart = (event) => {
            event.dataTransfer.setData("text/plain", event.target.id);
            return true;
        }
        document.getElementById("se-list").appendChild(elem);
    });
}

/*
 * シナリオビュー
 */

function createCommandElement(command) {
    var newElem = document.createElement("li");
    newElem.id = makeId();
    newElem.textContent = elemDrag.cmd;
    newElem.draggable = "true";
    newElem.cmd = elemDrag.cmd;
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
    var newElem = document.createElement("li");
    newElem.id = makeId();
    newElem.textContent = elemDrag.cmd;
    newElem.draggable = "true";
    newElem.cmd = elemDrag.cmd;
    newElem.ondragstart = onScenarioDragStart;
    newElem.ondragover = onScenarioDragOver;
    newElem.ondragleave = onScenarioDragLeave;
    newElem.ondrop = onScenarioDrop;
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
    arr.forEach(function(line) {
        var elem = document.createElement('li');
        elem.id = makeId();
        elem.textContent = line;
        elem.draggable = "true";
        elem.setAttribute("cmd", line);
        elem.ondragstart = onScenarioDragStart;
        elem.ondragover = onScenarioDragOver;
        elem.ondragleave = onScenarioDragLeave;
        elem.ondrop = onScenarioDrop;
        document.getElementById("scenario").appendChild(elem);
    });
}

/*
 * ロード時
 */

window.addEventListener('load', async () => {
    //
    // パレットの要素にイベントリスナを追加する
    //
    Array.from(document.getElementById("palette").childNodes).forEach(function (a) {
        a.addEventListener("click", () => {
            Array.from(document.getElementById("palette").childNodes).forEach(function (b) {
                if(b.className == "left-tab-list-item" || b.className == "left-tab-list-item-sel") {
                    if(b === event.srcElement) {
                        b.className = "left-tab-list-item-sel";
                    } else {
                        b.className = "left-tab-list-item";
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
