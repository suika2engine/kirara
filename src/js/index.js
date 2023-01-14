var baseUrl;

/*
 * シナリオビュー
 */

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
    var endElem = document.createElement("li");
    endElem.id = "end-mark";
    endElem.classList.add("drag-list-item");
    endElem.textContent = "ゲーム終了";
    endElem.addEventListener("dragover", onScenarioDragOver);
    endElem.addEventListener("dragleave", onScenarioDragLeave);
    endElem.addEventListener("drop", onScenarioDrop);
    endElem.classList.add("drag-list-item-end");
    endElem.style.cursor = "";
    document.getElementById("scenario").appendChild(endElem);
}

function createCommandElement(command) {
    // 要素を作成する
    var newElem = document.createElement("li");
    newElem.id = makeId();
    newElem.draggable = "true";
    newElem.cmd = command;
    newElem.classList.add("drag-list-item");
    newElem.addEventListener("click", async () => {
        Array.from(document.getElementById("scenario").childNodes).forEach(function (e) {
            if(e.classList != null && e.classList.contains("drag-list-item")) {
                if(e === event.srcElement) {
                    e.classList.add("drag-list-item-sel");
                } else {
                    e.classList.remove("drag-list-item-sel");
                }
            }
        });
        document.getElementById("thumbnail-picture").src = "";
        commitProps();
        changeElement(event.srcElement);
        showProps();
    });
    newElem.addEventListener("dblclick", async () => {
        // 保存する
        saveScenario();

        // デバッグを開始する
        var scenarioArray = [].slice.call(document.querySelectorAll("#scenario li"));
        var lineIndex = scenarioArray.indexOf(elementInEdit);
        window.api.debugGame(lineIndex);
    });

    // コマンドの種類ごとに要素の設定を行う
    if (command.startsWith("@bg ") || command.startsWith("@背景 ")) {
        // @bg
        var cl = normalizeBg(command);
        newElem.textContent = "背景";
        newElem.classList.add("drag-list-item-bg");
        newElem.style.backgroundImage = "url(\"" + baseUrl.replace(/\\/g, "\\\\") + "bg/" + cl[1] + "\")";
        newElem.style.backgroundSize = "cover";
    } else if (command.startsWith("@ch ") || command.startsWith("@キャラ ")) {
        // @ch
        var cl = normalizeCh(command);
        newElem.textContent = "キャラ";
        newElem.classList.add("drag-list-item-ch");
        newElem.style.backgroundImage = "url(\"" + baseUrl.replace(/\\/g, "\\\\") + "ch/" + cl[2] + "\")";
        newElem.style.backgroundRepeat = "no-repeat";
        newElem.style.backgroundSize = "contain";
    //
    // ここに未実装のcommand to elementを書いていく
    //
    } else if(command.startsWith("@")) {
        // Kiraraで未対応のコマンド
        newElem.textContent = command;
        newElem.classList.add("drag-list-item-etc");
    } else if(command.startsWith(":")) {
        // FIXME: ラベル
        newElem.textContent = command;
        newElem.classList.add("drag-list-item-etc"); // etcになっている
    } else if(command.match(/^\*[^\*]+\*[^\*]+$/)) {
        // セリフ(*キャラ名*セリフ)
        var sp = command.split("*");
        newElem.textContent = sp[1] + "「" + sp[2] + "」";
        newElem.classList.add("drag-list-item-serif");
    } else if(command.match(/^\*[^\*]+\*[^\*]+\*[^\*]+$/)) {
        // セリフ(*キャラ名*ボイス*セリフ)
        var sp = command.split("*");
        newElem.textContent = sp[1] + "「" + sp[3] + "」";
        newElem.classList.add("drag-list-item-serif");
    } else if(command.match(/^.+「.*」$/)) {
        // セリフ(「」)
        newElem.textContent = command;
        newElem.classList.add("drag-list-item-serif");
    } else if(command === "") {
        // FIXME: 空行
        newElem.textContent = command;
        newElem.classList.add("drag-list-item-etc"); // etcになっている
    } else {
        // メッセージ
        newElem.textContent = command;
        newElem.classList.add("drag-list-item-msg");
    }
    return newElem;
}

async function saveScenario() {
    var data = [];
    Array.from(document.getElementById("scenario").childNodes).forEach(function (e) {
        if(e.cmd !== undefined && e.cmd != null) {
            data.push(e.cmd);
        }
    });
    await window.api.setScenarioData(data);
}

function onScenarioDragStart(event) {
    event.dataTransfer.setData("text/plain", event.target.id);
    return true;
}

function onScenarioDragOver(event) {
    event.preventDefault();
    this.style.borderTop = "5px solid blue";
    return false;
}

function onScenarioDragLeave(event) {
    this.style.borderTop = "";
}

function onScenarioDrop(event) {
    commitProps();

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

/*
 * プロパティビュー
 */

var elementInEdit = null;

function changeElement(elem) {
    elementInEdit = elem;
}

// 編集を開始する
function showProps() {
    // すべてのプロパティペインを非表示にする
    Array.from(document.getElementById("prop-container").childNodes).forEach(function (e) {
        if(e.style != null) {
            e.style.display = "none";
        }
    });
    if(elementInEdit == null) {
        return;
    }

    // コマンドの種類ごとに、要素に値を入れ、ペインを表示する
    cmd = elementInEdit.cmd;
    if(cmd.startsWith("@bg ") || cmd.startsWith("@背景 ")) {
        // @bg
        var cl = normalizeBg(cmd);
        document.getElementById("prop-bg-file").value = cl[1];
        document.getElementById("prop-bg-duration").value = cl[2];
        document.getElementById("prop-bg-effect").value = normalizeEffect(cl[3]);
        document.getElementById("prop-bg").style.display = "block";
        document.getElementById("thumbnail-picture").src = baseUrl + "bg/" + cl[1];
    } else if(cmd.startsWith("@ch ") || cmd.startsWith("@キャラ ")) {
        // @ch
        var cl = normalizeCh(cmd);
        document.getElementById("prop-ch-position").value = normalizePosition(cl[1]);
        document.getElementById("prop-ch-file").value = cl[2];
        document.getElementById("prop-ch-duration").value = cl[3];
        document.getElementById("prop-ch-effect").value = normalizeEffect(cl[4]);
        document.getElementById("prop-ch-xshift").value = cl[5];
        document.getElementById("prop-ch-yshift").value = cl[6];
        document.getElementById("prop-ch-alpha").value = cl[7];
        document.getElementById("prop-ch").style.display = "block";
        document.getElementById("thumbnail-picture").src = baseUrl + "ch/" + cl[2];
    } else if(cmd.startsWith("@")) {
        // 未対応のコマンド
    } else if(cmd.startsWith(":")) {
        // ラベル
    } else if(cmd.startsWith("#")) {
        // コメント
    } else if(cmd.match(/^\*[^\*]+\*[^\*]+$/)) {
        // セリフ(ボイスなし)
        var sp = cmd.split("*");
        var name = sp[1];
        var text = sp[2];
        document.getElementById("prop-serif-name").value = name;
        document.getElementById("prop-serif-text").value = text;
        document.getElementById("prop-serif-voice").value = "";
        document.getElementById("prop-serif").style.display = "block";
    } else if(cmd.match(/^\*[^\*]+\*[^\*]+\*[^\*]+$/)) {
        // セリフ(ボイスあり)
        var sp = cmd.split("*");
        var name = sp[1];
        var voice = sp[2];
        var text = sp[3];
        document.getElementById("prop-serif-name").value = name;
        document.getElementById("prop-serif-text").value = text;
        document.getElementById("prop-serif-voice").value = voice;
        document.getElementById("prop-serif").style.display = "block";
    } else if(cmd.match(/^.+「.*」$/)) {
        // セリフ(かぎカッコ)
        var name = cmd.split("「")[0];
        var text = cmd.split("「")[1].split("」")[0];
        document.getElementById("prop-serif-name").value = name;
        document.getElementById("prop-serif-text").value = text;
        document.getElementById("prop-serif-voice").value = "";
        document.getElementById("prop-serif").style.display = "block";
    } else if(cmd === "") {
        // FIXME: 何もしない
    } else {
        // メッセージ
        document.getElementById("prop-msg-text").value = cmd;
        document.getElementById("prop-msg").style.display = "block";
    }
}

// 変更を保存する
function commitProps() {
    if(elementInEdit == null) {
        return;
    }

    // コマンドの種類ごとに、要素から値を出し、シナリオ要素に反映する
    cmd = elementInEdit.cmd;
    if(cmd.startsWith("@bg ") || cmd.startsWith("@背景 ")) {
        // @bg
        var file = document.getElementById("prop-bg-file").value;
        var duration = document.getElementById("prop-bg-duration").value;
        var effect = normalizeEffect(document.getElementById("prop-bg-effect").value);
        elementInEdit.cmd = "@bg " + file + " " + duration + " " + effect;
    } else if(cmd.startsWith("@ch ") || cmd.startsWith("@キャラ ")) {
        // @ch
        var position = normalizePosition(document.getElementById("prop-ch-position").value);
        var file = document.getElementById("prop-ch-file").value;
        var duration = document.getElementById("prop-ch-duration").value;
        var effect = normalizeEffect(document.getElementById("prop-ch-effect").value);
        var xshift = document.getElementById("prop-ch-xshift").value;
        var yshift = document.getElementById("prop-ch-yshift").value;
        var alpha = document.getElementById("prop-ch-alpha").value;
        elementInEdit.cmd = "@ch " + position + " " + file + " " + duration + " " + effect + " " + xshift + " " + yshift + " " + alpha;
    //
    // ここに未実装のprop to commandを書いていく
    //
    } else if (cmd.startsWith("@")) {
        // 未対応のコマンド
    } else if (cmd.startsWith(":")) {
        // TODO: ラベル
    } else if(cmd.startsWith("#")) {
        // TODO: コメント
    } else if(cmd.length === 0) {
        // TODO: 空行
    } else if(cmd.match(/^\*[^\*]+\*[^\*]+$/) || cmd.match(/^\*[^\*]+\*[^\*]+\*[^\*]+$/) || cmd.match(/^.+「.*」$/)) {
        // セリフ
        var name = document.getElementById("prop-serif-name").value;
        var text = document.getElementById("prop-serif-text").value;
        var voice = document.getElementById("prop-serif-voice").value;
        if(name === "") {
            name = "名前を入力してください";
        }
        if(text === "") {
            text = "セリフを入力してください"
        }
        if(voice === "") {
            elementInEdit.cmd = "*" + name + "*" + text;
        } else {
            elementInEdit.cmd = "*" + name + "*" + voice + "*" + text;
        }
        elementInEdit.textContent = name + "「" + text + "」";
    } else {
        // メッセージ
        var msg = document.getElementById("prop-msg-text").value;
        if(msg === "") {
            msg = "文章を入力してください";
        }
        msg = msg.replace(/\n/g, "\\n");
        elementInEdit.cmd = msg;
        elementInEdit.textContent = msg;
    }
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
        elem.className = "tab-list-item";
        elem.template = true;
        elem.cmd = "@load " + file;
        elem.addEventListener("click", () => {
            Array.from(document.getElementById("txt-list").childNodes).forEach(function (e) {
                if(e.classList != null && (e.classList.contains("tab-list-item") || e.classList.contains("tab-list-item-sel"))) {
                    if(e === event.srcElement) {
                        e.classList.add("tab-list-item-sel");
                        e.classList.remove("tab-list-item");
                    } else {
                        e.classList.remove("tab-list-item-sel");
                        e.classList.add("tab-list-item");
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
        elem.className = "tab-list-item";
        elem.template = true;
        elem.cmd = "@bg " + file + " 1.0";
        elem.addEventListener("click", async () => {
            Array.from(document.getElementById("bg-list").childNodes).forEach(function (e) {
                if(e.classList != null && (e.classList.contains("tab-list-item") || e.classList.contains("tab-list-item-sel"))) {
                    if(e === event.srcElement) {
                        e.classList.add("tab-list-item-sel");
                        e.classList.remove("tab-list-item");
                    } else {
                        e.classList.remove("tab-list-item-sel");
                        e.classList.add("tab-list-item");
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
        elem.className = "tab-list-item";
        elem.template = true;
        elem.cmd = "@ch center " + file + " 1.0";
        elem.addEventListener("click", async () => {
            Array.from(document.getElementById("ch-list").childNodes).forEach(function (e) {
                if(e.classList != null && (e.classList.contains("tab-list-item") || e.classList.contains("tab-list-item-sel"))) {
                    if(e === event.srcElement) {
                        e.classList.add("tab-list-item-sel");
                        e.classList.remove("tab-list-item");
                    } else {
                        e.classList.remove("tab-list-item-sel");
                        e.classList.add("tab-list-item");
                    }
                }
            });
            document.getElementById("thumbnail-picture").src = baseUrl + "ch/" + file;
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
        elem.className = "tab-list-item";
        elem.template = true;
        elem.cmd = "@bgm " + file;
        elem.addEventListener("click", async () => {
            Array.from(document.getElementById("bgm-list").childNodes).forEach(function (e) {
                if(e.classList != null && (e.classList.contains("tab-list-item") || e.classList.contains("tab-list-item-sel"))) {
                    if(e === event.srcElement) {
                        e.classList.add("tab-list-item-sel");
                        e.classList.remove("tab-list-item");
                    } else {
                        e.classList.remove("tab-list-item-sel");
                        e.classList.add("tab-list-item");
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
        elem.className = "tab-list-item";
        elem.template = true;
        elem.cmd = "@se " + file;
        elem.addEventListener("click", async () => {
            Array.from(document.getElementById("se-list").childNodes).forEach(function (e) {
                if(e.classList != null && (e.classList.contains("tab-list-item") || e.classList.contains("tab-list-item-sel"))) {
                    if(e === event.srcElement) {
                        e.classList.add("tab-list-item-sel");
                        e.classList.remove("tab-list-item");
                    } else {
                        e.classList.remove("tab-list-item-sel");
                        e.classList.add("tab-list-item");
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
 * コマンドの正規化
 */

function normalizeBg(command) {
    var op = "@bg";
    var file = "ファイルを指定してください";
    var duration = "1.0";
    var effect = "標準";

    var tokens = command.split(" ");
    if(tokens.length >= 2) {
        if(tokens[1].startsWith("file:")) {
	    file = tokens[1].substring("file:".length);
        } else if(tokens[1].startsWith("ファイル:")) {
            file = tokens[1].substring("ファイル:".length);
        } else {
            file = tokens[1];
        }
    }
    if(tokens.length >= 3) {
        if(tokens[2].startsWith("duration:")) {
            duration = tokens[2].substring("duration:".length);
        } else if(tokens[2].startsWith("秒:")) {
            duration = tokens[2].substring("秒:".length);
        } else {
            duration = tokens[2];
        }
    }
    if(tokens.length >= 4) {
        if(tokens[3].startsWith("effect:")) {
            effect = tokens[3].substring("effect:".length);
        } else if(tokens[3].startsWith("エフェクト:")) {
            effect = tokens[3].substring("エフェクト:".length);
        } else {
	    effect = tokens[3];
        }
	effect = normalizeEffect(effect);
    }

    return [op, file, duration, effect];
}

function normalizeEffect(effect) {
    switch(effect) {
    case "標準":            return "normal";
    case "normal":          return "normal";
    case "n":               return "normal";
    case "右カーテン":      return "curtain-right";
    case "c":               return "curtain-right";
    case "curtain":         return "curtain-right";
    case "curtain-right":   return "curtain-right";
    case "左カーテン":      return "curtain-left";
    case "curtain-left":    return "curtain-left";
    case "上カーテン":      return "curtain-up";
    case "curtain-up":      return "curtain-up";
    case "下カーテン":      return "curtain-down";
    case "curtain-down":    return "curtain-down";
    default:                break;
    }
    return "normal";
}

function japanizeEffect(effect) {
    switch(effect) {
    case "標準":            return "標準";
    case "normal":          return "標準";
    case "n":               return "標準";
    case "右カーテン":      return "右カーテン";
    case "c":               return "右カーテン";
    case "curtain":         return "右カーテン";
    case "curtain-right":   return "右カーテン";
    case "左カーテン":      return "左カーテン";
    case "curtain-left":    return "左カーテン";
    case "上カーテン":      return "上カーテン";
    case "curtain-up":      return "上カーテン";
    case "下カーテン":      return "下カーテン";
    case "curtain-down":    return "下カーテン";
    default:                break;
    }
    return "標準";
}

function normalizeCh(command) {
    var op = "@ch";
    var position = "中央";
    var file = "ファイルを指定してください";
    var duration = 1.0;
    var effect = "標準";
    var xshift = 0;
    var yshift = 0;
    var alpha = 255;

    var tokens = command.split(" ");
    if(tokens.length >= 2) {
        if(tokens[1].startsWith("position:")) {
            position = tokens[1].substring("position:".length);
        } else if(tokens[1].startsWith("位置:")) {
            position = tokens[1].substring("位置:".length);
        } else {
            position = tokens[1];
        }
    }
    if(tokens.length >= 3) {
        if(tokens[2].startsWith("file:")) {
            file = tokens[2].substring("file:".length);
        } else if(tokens[2].startsWith("ファイル:")) {
            file = tokens[2].substring("ファイル:".length);
        } else {
            file = tokens[2];
        }
    }
    if(tokens.length >= 4) {
        if(tokens[3].startsWith("duration:")) {
            duration = tokens[3].substring("duration:".length);
        } else if(tokens[3].startsWith("秒:")) {
            duration = tokens[3].substring("秒:".length);
        } else {
            duration = tokens[3];
        }
    }
    if(tokens.length >= 5) {
        if(tokens[4].startsWith("effect:")) {
            effect = tokens[4].substring("effect:");
        } else if(tokens[4].startsWith("エフェクト:")) {
            effect = tokens[4].substring("エフェクト:".length);
        } else {
            effect = tokens[4];
        }
        effect = normalizeEffect(effect);
    }
    if(tokens.length >= 6) {
        if(tokens[5].startsWith("right:")) {
            xshift = tokens[5].substring("right:");
        } else if(tokens[5].startsWith("右:")) {
            xshift = tokens[5].substring("右:".length);
        } else {
            xshift = tokens[5];
        }
    }
    if(tokens.length >= 7) {
        if(tokens[6].startsWith("down:")) {
            yshift = tokens[6].substring("down:");
        } else if(tokens[6].startsWith("下:")) {
            yshift = tokens[6].substring("下:".length);
        } else {
            yshift = tokens[6];
        }
    }
    if(tokens.length >= 8) {
        if(tokens[7].startsWith("alpha:")) {
            alpha = tokens[7].substring("alpha:");
        } else if(tokens[7].startsWith("アルファ:")) {
            alpha = tokens[7].substring("アルファ:".length);
        } else {
            alpha = tokens[7];
        }
    }

    return [op, position, file, duration, effect, xshift, yshift, alpha];
}

function normalizePosition(pos) {
    switch(pos) {
    case "中央":            return "center";
    case "center":          return "center";
    case "右":              return "right";
    case "right":           return "right";
    case "左":              return "left";
    case "left":            return "left";
    case "中央背面":        return "back";
    case "back":            return "back";
    case "顔":              return "face";
    case "face":            return "face";
    default:                break;
    }
    return "center";
}

/*
 * ロード時
 */

window.addEventListener('load', async () => {
    //
    // ゲームのベースURLを取得する
    //
    baseUrl = await window.api.getBaseUrl();

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
                if(c.classList != null && (c.classList.contains("palette-list-item") || c.classList.contains("palette-list-item-sel"))) {
                    if(c === event.srcElement) {
                        c.classList.add("palette-list-item-sel");
                        c.classList.remove("palette-list-item");
                    } else {
                        c.classList.remove("palette-list-item-sel");
                        c.classList.add("palette-list-item");
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
    var txtPanel = document.getElementById("tab-panel-txt");
    txtPanel.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        document.getElementById("tab-panel-txt").classList.add('dragover');
    });
    txtPanel.addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
        document.getElementById("tab-panel-txt").classList.remove('dragover');
    });
    txtPanel.addEventListener('drop', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        document.getElementById("tab-panel-txt").classList.remove('dragover');
        for (const file of e.dataTransfer.files) {
            await window.api.addTxtFile(file.path);
        }
        refreshTxt();
    });

    //
    // bgフォルダの中身を取得してリスト要素を追加し、イベントリスナを追加する
    //
    refreshBg();
    var bgPanel = document.getElementById("tab-panel-bg");
    bgPanel.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        document.getElementById("tab-panel-bg").classList.add('dragover');
    });
    bgPanel.addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
        document.getElementById("tab-panel-bg").classList.remove('dragover');
    });
    bgPanel.addEventListener('drop', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        document.getElementById("tab-panel-bg").classList.remove('dragover');
        for (const file of e.dataTransfer.files) {
            await window.api.addBgFile(file.path);
        }
        refreshBg();
    });

    //
    // chフォルダの中身を取得してリスト要素を追加し、イベントリスナを追加する
    //
    refreshCh();
    var chPanel = document.getElementById("tab-panel-ch");
    chPanel.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        document.getElementById("tab-panel-ch").classList.add('dragover');
    });
    chPanel.addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
        document.getElementById("tab-panel-ch").classList.remove('dragover');
    });
    chPanel.addEventListener('drop', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        document.getElementById("tab-panel-ch").classList.remove('dragover');
        for (const file of e.dataTransfer.files) {
            await window.api.addChFile(file.path);
        }
        refreshCh();
    });

    //
    // bgmフォルダの中身を取得してリスト要素を追加し、イベントリスナを追加する
    //
    refreshBgm();
    var bgmPanel = document.getElementById("tab-panel-bgm");
    bgmPanel.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        document.getElementById("tab-panel-bgm").classList.add('dragover');
    });
    bgmPanel.addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
        document.getElementById("tab-panel-bgm").classList.remove('dragover');
    });
    bgmPanel.addEventListener('drop', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        document.getElementById("tab-panel-bgm").classList.remove('dragover');
        for (const file of e.dataTransfer.files) {
            await window.api.addBgmFile(file.path);
        }
        refreshBgm();
    });

    //
    // seフォルダの中身を取得してリスト要素を追加し、イベントリスナを追加する
    //
    refreshSe();
    var sePanel = document.getElementById("tab-panel-se");
    sePanel.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        document.getElementById("tab-panel-se").classList.add('dragover');
    });
    sePanel.addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
        document.getElementById("tab-panel-se").classList.remove('dragover');
    });
    sePanel.addEventListener('drop', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        document.getElementById("tab-panel-se").classList.remove('dragover');
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
