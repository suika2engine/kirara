async function refreshTxt() {
    var element = document.getElementById("txt-list");
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }

    const txt = await window.api.getTxtList();
    txt.forEach(function(file) {
        var elem = document.createElement('li');
        elem.textContent = file;
        elem.draggable = "true";
        elem.className = "left-tab-list-item";
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
        document.getElementById("txt-list").appendChild(elem);
    });
}

async function refreshBg() {
    var element = document.getElementById("bg-list");
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }

    const bg = await window.api.getBgList();
    bg.forEach(function(file) {
        var elem = document.createElement('li');
        elem.textContent = file;
        elem.draggable = "true";
        elem.className = "left-tab-list-item";
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
        document.getElementById("bg-list").appendChild(elem);
    });
}

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
    // chフォルダの中身を取得してリスト要素を追加する
    //
    const ch = await window.api.getChList();
    ch.forEach(function(file) {
        var elem = document.createElement('li');
        elem.textContent = file;
        elem.draggable = "true";
        elem.className = "left-tab-list-item";
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
        document.getElementById("ch-list").appendChild(elem);
    });

    //
    // bgmフォルダの中身を取得してリスト要素を追加する
    //
    const bgm = await window.api.getBgmList();
    bgm.forEach(function(file) {
        var elem = document.createElement('li');
        elem.textContent = file;
        elem.draggable = "true";
        elem.className = "left-tab-list-item";
        elem.addEventListener("click", () => {
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
        document.getElementById("bgm-list").appendChild(elem);
    });

    //
    // seフォルダの中身を取得してリスト要素を追加する
    //
    const se = await window.api.getSeList();
    se.forEach(function(file) {
        var elem = document.createElement('li');
        elem.textContent = file;
        elem.draggable = "true";
        elem.className = "left-tab-list-item";
        elem.addEventListener("click", () => {
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
        document.getElementById("se-list").appendChild(elem);
    });

    //
    // メインリストビューのドラッグアンドドロップ動作を設定する
    //
    document.querySelectorAll('.drag-list li').forEach (elm => {
        elm.ondragstart = function () {
            event.dataTransfer.setData('text/plain', event.target.id);
            return true;
        };
        elm.ondragover = function () {
            if(event.srcElement == document.getElementById("start-item")) {
                return true;
            }
            event.preventDefault();
            this.style.borderTop = '2px solid blue';
            return false;
        };
        elm.ondragleave = function () {
            this.style.borderTop = '';
        };
        elm.ondrop = function () {
            event.preventDefault();
            let id = event.dataTransfer.getData('text/plain');
            let elm_drag = document.getElementById(id);
            this.parentNode.insertBefore(elm_drag, this);
            this.style.borderTop = '';
        };
    });
})
