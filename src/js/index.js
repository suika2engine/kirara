/*
 * ゲームの構成
 */

// ベースのURL (末尾に"/"を含む)
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

    // 末尾に"ゲーム終了"のアイテムを挿入する
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
    } else if (command.startsWith("@bgm ") || command.startsWith("@音楽 ")) {
        // @bgm
        var cl = normalizeBgm(command);
        newElem.textContent = "音楽";
        newElem.classList.add("drag-list-item-bgm");

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
        document.getElementById("prop-bg-effect").value = normalizeBgEffect(cl[3]);
        document.getElementById("prop-bg").style.display = "block";
        document.getElementById("thumbnail-picture").src = baseUrl + "bg/" + cl[1];
    } else if(cmd.startsWith("@ch ") || cmd.startsWith("@キャラ ")) {
        // @ch
        var cl = normalizeCh(cmd);
        document.getElementById("prop-ch-position").value = normalizeChPosition(cl[1]);
        document.getElementById("prop-ch-file").value = cl[2];
        document.getElementById("prop-ch-duration").value = cl[3];
        document.getElementById("prop-ch-effect").value = normalizeBgEffect(cl[4]);
        document.getElementById("prop-ch-xshift").value = cl[5];
        document.getElementById("prop-ch-yshift").value = cl[6];
        document.getElementById("prop-ch-alpha").value = cl[7];
        document.getElementById("prop-ch").style.display = "block";
        document.getElementById("thumbnail-picture").src = baseUrl + "ch/" + cl[2];
    } else if(cmd.startsWith("@bgm ") || cmd.startsWith("@音楽 ")) {
        // @bgm
        var cl = normalizeBgm(cmd);
        document.getElementById("prop-bgm-file").value = cl[1];
        document.getElementById("prop-bgm-once").checked = (cl[2] === "once");
        document.getElementById("prop-bgm").style.display = "block";
    } else if(cmd.startsWith("@se ") || cmd.startsWith("@効果音 ")) {
        // @se
        var cl = normalizeSe(cmd);
        document.getElementById("prop-se-file").value = cl[1];
        document.getElementById("prop-se-loop").checked = (cl[2] === "loop");
        document.getElementById("prop-se-voice").checked = (cl[2] === "voice");
        document.getElementById("prop-se").style.display = "block";
    } else if(cmd.startsWith("@vol ") || cmd.startsWith("@音量 ")) {
        // @vol
        var cl = normalizeVol(cmd);
        document.getElementById("prop-vol-track").value = cl[1];
        document.getElementById("prop-vol-volume").value = cl[2];
        document.getElementById("prop-vol-duration").value = cl[3];
        document.getElementById("prop-vol").style.display = "block";
    } else if(cmd.startsWith("@choose ") || cmd.startsWith("@選択肢 ")) {
        // @choose
        var cl = normalizeChoose(cmd);
        for(let i = 1; i <= 8; i++) {
            if(cl.length >= i + 2 + 1) {
                document.getElementById("prop-choose-label" + i).value = cl[i * 2 - 1];
                document.getElementById("prop-choose-text" + i).value = cl[i * 2];
            } else {
                document.getElementById("prop-choose-label" + i).value = "";
                document.getElementById("prop-choose-text" + i).value = "";
            }
        }
        document.getElementById("prop-choose").style.display = "block";
    } else if(cmd.startsWith(":")) {
        // @vol
        var label = cmd.substring(1);
        document.getElementById("prop-label-label").value = label;
        document.getElementById("prop-label").style.display = "block";
    } else if(cmd.startsWith("@cha ") || cmd.startsWith("@キャラ移動 ")) {
        // @cha
        var cl = normalizeCha(cmd);
        document.getElementById("prop-cha-position").value = cl[1];
        document.getElementById("prop-cha-duration").value = cl[2];
        document.getElementById("prop-cha-acceleration").value = cl[3];
        document.getElementById("prop-cha-xoffset").value = cl[4];
        document.getElementById("prop-cha-yoffset").value = cl[5];
        document.getElementById("prop-cha-alpha").value = cl[6];
        document.getElementById("prop-cha").style.display = "block";
    } else if(cmd.startsWith("@chs ") || cmd.startsWith("@場面転換 ")) {
        // @chs
        var cl = normalizeChs(cmd);
        document.getElementById("prop-chs-center").value = cl[1];
        document.getElementById("prop-chs-right").value = cl[2];
        document.getElementById("prop-chs-left").value = cl[3];
        document.getElementById("prop-chs-back").value = cl[4];
        document.getElementById("prop-chs-duration").value = cl[5];
        document.getElementById("prop-chs-background").value = cl[6];
        document.getElementById("prop-chs-effect").value = cl[7];
        document.getElementById("prop-chs").style.display = "block";
    } else if(cmd.startsWith("@shake ") || cmd.startsWith("@振動 ")) {
        // @shake
        var cl = normalizeShake(cmd);
        document.getElementById("prop-shake-direction").value = cl[1];
        document.getElementById("prop-shake-duration").value = cl[2];
        document.getElementById("prop-shake-times").value = cl[3];
        document.getElementById("prop-shake-amplitude").value = cl[4];
        document.getElementById("prop-shake").style.display = "block";
    } else if(cmd.startsWith("@wait ") || cmd.startsWith("@時間待ち ")) {
        // @wait
        var cl = normalizeWait(cmd);
        document.getElementById("prop-wait-duration").value = cl[1];
        document.getElementById("prop-wait").style.display = "block";
    } else if(cmd.startsWith("@skip ") || cmd.startsWith("@スキップ ")) {
        // @skip
        var cl = normalizeSkip(cmd);
        document.getElementById("prop-skip-opt").checked = (cl[1] === "enable") ? true : false;;
        document.getElementById("prop-skip").style.display = "block";
    } else if(cmd.startsWith("@goto ") || cmd.startsWith("@ジャンプ ")) {
        // @goto
        var cl = normalizeGoto(cmd);
        document.getElementById("prop-goto-label").value = cl[1];
        document.getElementById("prop-goto").style.display = "block";
    } else if(cmd.startsWith("@set ") || cmd.startsWith("@フラグをセット ")) {
        // @set
        var cl = normalizeSet(cmd);
        document.getElementById("prop-set-variable").value = cl[1];
        document.getElementById("prop-set-operator").value = cl[2];
        document.getElementById("prop-set-value").value = cl[3];
        document.getElementById("prop-set").style.display = "block";
    } else if(cmd.startsWith("@if ") || cmd.startsWith("@フラグでジャンプ ")) {
        // @set
        var cl = normalizeIf(cmd);
        document.getElementById("prop-if-variable").value = cl[1];
        document.getElementById("prop-if-operator").value = cl[2];
        document.getElementById("prop-if-value").value = cl[3];
        document.getElementById("prop-if-label").value = cl[4];
        document.getElementById("prop-if").style.display = "block";
    } else if(cmd.startsWith("@load ") || cmd.startsWith("@シナリオ ")) {
        // @load
        var cl = normalizeLoad(cmd);
        document.getElementById("prop-load-file").value = cl[1];
        document.getElementById("prop-load").style.display = "block";
    } else if(cmd.startsWith("@chapter ") || cmd.startsWith("@章 ")) {
        // @chapter
        var cl = normalizeChapter(cmd);
        document.getElementById("prop-chapter-title").value = cl[1];
        document.getElementById("prop-chapter").style.display = "block";
    } else if(cmd.startsWith("@wms ") || cmd.startsWith("@スクリプト ")) {
        // @wms
        var cl = normalizeWms(cmd);
        document.getElementById("prop-wms-file").value = cl[1];
        document.getElementById("prop-wms").style.display = "block";
    } else if(cmd.startsWith("@")) {
        // 未対応のコマンド
    } else if(cmd.startsWith(":")) {
        // ラベル
        document.getElementById("prop-label-label").value = cmd.substring(1);
        document.getElementById("prop-label").style.display = "block";
    } else if(cmd.startsWith("#")) {
        // コメント
        document.getElementById("prop-comment-comment").value = cmd.substring(1);
        document.getElementById("prop-comment").style.display = "block";
    } else if(cmd === "") {
        // FIXME: 何もしない
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
        var effect = normalizeBgEffect(document.getElementById("prop-bg-effect").value);
        elementInEdit.cmd = "@bg " + file + " " + duration + " " + effect;
    } else if(cmd.startsWith("@ch ") || cmd.startsWith("@キャラ ")) {
        // @ch
        var position = normalizeChPosition(document.getElementById("prop-ch-position").value);
        var file = document.getElementById("prop-ch-file").value;
        var duration = document.getElementById("prop-ch-duration").value;
        var effect = normalizeBgEffect(document.getElementById("prop-ch-effect").value);
        var xshift = document.getElementById("prop-ch-xshift").value;
        var yshift = document.getElementById("prop-ch-yshift").value;
        var alpha = document.getElementById("prop-ch-alpha").value;
        elementInEdit.cmd = "@ch " + position + " " + file + " " + duration + " " + effect + " " + xshift + " " + yshift + " " + alpha;
    } else if(cmd.startsWith("@bgm ") || cmd.startsWith("@音楽 ")) {
        // @bgm
        var file = document.getElementById("prop-bgm-file").value;
        var once = document.getElementById("prop-bgm-once").checked;
        if(!once) {
            elementInEdit.cmd = "@bgm " + file;
        } else {
            elementInEdit.cmd = "@bgm " + file + " once";
        }
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
 *  - コマンドをトークナイズし、UIで使いやすいように変換して、配列を返す
 *  - コマンド名は英語に変換される
 *  - 引数の名前は省略される
 *  - UIのスライダーで調整される引数が省略された場合、省略可能でも数値に変換する
 *  - 引数として受容できない値が指定されていれば、エラー値かデフォルト値に変換される
 *  - 必須引数が指定されていなければエラー用の値が設定される
 */

const MSG_SPECIFY_FILE = "Specify_file name"; //ファイルを指定してください";
const MSG_SPECIFY_LABEL = "Speify_destination"; //"行き先を指定してください";
const MSG_SPECIFY_OPTION = "Specify_option"; //"選択肢を指定してください";

// @bg
function normalizeBg(command) {
    var op = "@bg";
    var file = "";
    var duration = "";
    var effect = "";

    // トークナイズする
    var tokens = command.split(" ");
    if(tokens.length >= 2) {
        file = normalizeParameter(tokens[1], ["file=", "ファイル="], MSG_SPECIFY_FILE);
    }
    if(tokens.length >= 3) {
        duration = normalizeParameter(tokens[2], ["duration=", "秒="], "0");
    }
    if(tokens.length >= 4) {
        effect = normalizeParameter(tokens[3], ["effect=", "エフェクト="], "normal");
        effect = normalizeBgEffect(effect);
    }

    // バリデーションする
    if(file === "") {
        file = MSG_SPECIFY_FILE;
    }
    if(duration === "") {
        duration = "0.0";
    }
    if(effect === "") {
        effect = "normal";
    }

    return [op, file, duration, effect];
}

//
// 引数を正規化し、引数名の引数名のないフォーマットに変換する
//  - token: 正規化するトークン
//  - names: 受容する引数名の配列
//  - default: 引数名が指定されたが値が空白だった場合にフォールバックする値
//
function normalizeParameter(token, names, def) {
    for(const name of names) {
        var ret = "";
        if(token.startsWith(name)) {
            ret = token.substring(name.length);
            if(ret === "") {
                return def;
            } else {
                return ret;
            }
        } else {
            return token;
        }
    }
    return name;
}

function normalizeBgEffect(effect) {
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

function japanizeBgEffect(effect) {
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

// @ch
function normalizeCh(command) {
    var op = "@ch";
    var position = "";
    var file = "";
    var duration = "";
    var effect = "";
    var xshift = "";
    var yshift = "";
    var alpha = "";

    // トークナイズする
    var tokens = command.split(" ");
    if(tokens.length >= 2) {
        position = normalizeParameter(tokens[1], ["position=", "位置"], "center");
        position = normalizeChPosition(position);
    }
    if(tokens.length >= 3) {
        file = normalizeParameter(tokens[2], ["file=", "ファイル="], "ファイルを指定してください");
    }
    if(tokens.length >= 4) {
        duration = normalizeParameter(tokens[3], ["duration=", "秒="], "1.0");
    }
    if(tokens.length >= 5) {
        effect = normalizeParameter(tokens[4], ["effect=", "エフェクト="], "normal");
        effect = normalizeBgEffect(effect);
    }
    if(tokens.length >= 6) {
        xshift = normalizeParameter(tokens[5], ["right=", "右="], "");
    }
    if(tokens.length >= 7) {
        xshift = normalizeParameter(tokens[6], ["down=", "下="], "");
    }
    if(tokens.length >= 8) {
        alpha = normalizeParameter(tokens[7], ["alpha=", "アルファ="], "");
    }

    // バリデーションする
    if(position === "") {
        position = "center";
    }
    if(file === "") {
        file = MSG_SPECIFY_FILE;
    }
    if(duration === "") {
        duration = "0.0";
    }
    if(effect === "") {
        effect = "normal";
    }
    if(xshift === "") {
        xshift = "0";
    }
    if(yshift === "") {
        yshift = "0";
    }
    if(alpha === "") {
        alpha = "255";
    }

    return [op, position, file, duration, effect, xshift, yshift, alpha];
}

function normalizeChPosition(pos) {
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

// @bgm
function normalizeBgm(command) {
    var op = "@bgm";
    var file = "";
    var opt = "";

	// トークナイズする
    var tokens = command.split(" ");
    if(tokens.length >= 2) {
        file = normalizeParameter(tokens[1], ["file=", "ファイル="], MSG_SPECIFY_FILE);
    }
    if(tokens.length >= 3) {
        if(tokens[2] === "once") {
            opt = "once";
        }
    }

	// バリデーションする
    if(file === "") {
        file = MSG_SPECIFY_FILE;
    }

    return [op, file, once];
}

// @se
function normalizeSe(command) {
    var op = "@se";
    var file = "";
    var opt = "";

	// トークナイズする
    var tokens = command.split(" ");
    if(tokens.length >= 2) {
        file = normalizeParameter(tokens[1], ["file=", "ファイル="], MSG_SPECIFY_FILE);
    }
    if(tokens.length >= 3) {
        if(tokens[2] === "voice") {
            opt = "voice";
        } else if(tokens[2] === "loop") {
			opt = "loop";
		}
    }

	// バリデーションする
    if(file === "") {
        file = "ファイル名を指定してください";
    }

    return [op, file, voice];
}

// @vol
function normalizeVol(command) {
    var op = "@vol";
    var track = "";
    var volume = ""
    var duration = "";

    // トークナイズする
    var tokens = command.split(" ");
    if(tokens.length >= 2) {
        track = normalizeParameter(tokens[1], ["track=", "トラック"], "bgm");
        track = normalizeVolTrack(track);
    }
    if(tokens.length >= 3) {
        volume = normalizeParameter(tokens[2], ["volume=", "ボリューム="], "1.0");
        if(volume < 0)
            volume = 0;
        if(volume > 1)
            volume = 1;
    }
    if(tokens.length >= 4) {
        duration = normalizeParameter(tokens[3], ["duration=", "秒="], "0.0");
    }

	// バリデーションする
    if(track === "") {
        track = "bgm";
    }
    if(volume === "") {
        volume = "1.0";
    }
    if(duration === "") {
        duration = "0.0";
    }

    return [op, track, volume, duration];
}

function normalizeVolTrack(track) {
    switch(track) {
    case "bgm":    return "bgm";
    case "音楽":   return "bgm";
    case "voice":  return "voice";
    case "ボイス": return "voice";
    case "se":     return "se";
    case "効果音": return "se";
    case "BGM":    return "BGM";
    case "VOICE":  return "VOICE";
    case "SE":     return "SE";
    default:
        break;
    }
    return "bgm";
}

// @choose
function normalizeChoose(command) {
    var op = "@choose";
    var label = ["", "", "", "", "", "", "", ""];
    var text = ["", "", "", "", "", "", "", ""];

    var tokens = command.split(" ");
    for(let i = 0; i < 8; i++) {
        if(tokens.length < i * 2 + 2) {
            break;
        }
        label[i] = normalizeParameter(tokens[i * 2 + 1], ["destination" + (i+1) + "=", "行き先" + (i+1) + "="], MSG_SPECIFY_LABEL);
        text[i] = normalizeParameter(tokens[i * 2 + 2], ["option" + (i+1) + "=", "選択肢" + (i+1) + "="], MSG_SPECIFY_OPTION);
    }

    return [op, label[0], text[0], label[1], text[1], label[2], text[2], label[3], text[3], label[4], text[4], label[5], text[5], label[6], text[6], label[7], text[7]];
}

// @cha
function normalizeCha(command) {
    var op = "@cha";
    var position = "";
    var duration = ""
    var acceleration = "";
    var xoffset = "";
    var yoffset = "";
    var alpha = "";

	// トークナイズする
    var tokens = command.split(" ");
    if(tokens.length >= 2) {
        position = normalizeParameter(tokens[1], ["position=", "位置="], "center");
        position = normalizeChPosition(position);
    }
    if(tokens.length >= 3) {
        duration = normalizeParameter(tokens[2], ["duration=", "秒="], "0.0");
    }
    if(tokens.length >= 4) {
        acceleration = normalizeParameter(tokens[3], ["acceleration=", "加速="], "move");
        acceleration = normalizeChaAcceleration(acceleration);
    }
    if(tokens.length >= 5) {
        xoffset = normalizeParameter(tokens[4], ["x="], "0");
    }
    if(tokens.length >= 6) {
        yoffset = normalizeParameter(tokens[5], ["y="], "0");
    }
    if(tokens.length >= 7) {
        alpha = normalizeParameter(tokens[6], ["alpha=", "アルファ="], "255");
    }

	// バリデーションする
    if(position === "") {
        position = "center";
    }
    if(duration === "") {
        duration = "0.0";
    }
    if(acceleration === "") {
        acceleration = "move";
    }
    if(xoffset === "") {
        xoffset = "0";
    }
    if(yoffset === "") {
        yoffset = "0";
    }
    if(alpha === "") {
        alpha = "255";
    }

    return [op, position, duration, acceleration, xoffset, yoffset, alpha];
}

function normalizeChaAcceleration(acc) {
    switch(acc) {
    case "move":    return "move";
    case "なし":    return "move";
    case "accel":   return "accel";
    case "あり":    return "accel";
    case "brake":   return "brake";
    case "減速":    return "brake";
    default:
        break;
    }
    return "move";
}        

// @chs
function normalizeChs(command) {
    var op = "@chs";
    var center = "";
    var right = "";
    var left = "";
    var back = "";
    var duration = "";
    var background = "";
    var effect = "";

	// トークナイズする
    var tokens = command.split(" ");
    if(tokens.length >= 2) {
        center = normalizeParameter(tokens[1], ["center=", "中央="], MSG_SPECIFY_FILE);
        center = normalizeChsFile(center);
    }
    if(tokens.length >= 3) {
        right = normalizeParameter(tokens[2], ["right=", "右="], MSG_SPECIFY_FILE);
        right = normalizeChsFile(right);
    }
    if(tokens.length >= 4) {
        left = normalizeParameter(tokens[3], ["right=", "右="], MSG_SPECIFY_FILE);
        left = normalizeChsFile(left);
    }
    if(tokens.length >= 5) {
        back = normalizeParameter(tokens[4], ["back=", "背面="], MSG_SPECIFY_FILE);
        back = normalizeChsFile(back);
    }
    if(tokens.length >= 6) {
        duration = normalizeParameter(tokens[5], ["duration=", "秒="], "0.0");
    }
    if(tokens.length >= 7) {
        background = normalizeParameter(tokens[6], ["background=", "背景="], "stay");
        background = normalizeChsBackground(background);
    }
    if(tokens.length >= 8) {
        effect = normalizeParameter(tokens[7], ["effect=", "エフェクト="], "normal");
        effect = normalizeBgEffect(effect);
    }

	// バリデーション
    if(center === "") {
        center = "stay";
    }
    if(right === "") {
        right = "stay";
    }
    if(left === "") {
        left = "stay";
    }
    if(back === "") {
        back = "stay";
    }
    if(duration === "") {
        duration = "0.0";
    }
    if(background === "") {
        // nothing to do
    }
    if(effect === "") {
        effect = "normal";
    }

    return [op, center, right, left, back, duration, background, effect];
}

function normalizeChsFile(file) {
    switch(file) {
    case "none":     return "none";
    case "消去":     return "none";
    case "stay":     return "stay";
    case "変更なし": return "stay";
    case "":         return "stay";
    default:
        break;
    }
    return file;
}

function normalizeChsBackground(file) {
    switch(file) {
    case "stay":     return "stay";
    case "変更なし": return "stay";
    case "":         return "stay";
    default:
        break;
    }
    return file;
}

// @shake
function normalizeShake(command) {
    var op = "@shake";
	var direction = "";
	var duration = "";
	var times = "";
	var amplitude = "";

	// トークナイズ
    var tokens = command.split(" ");
    if(tokens.length >= 2) {
        direction = normalizeParameter(tokens[1], ["direction=", "方向="], "horizontal");
        direction = normalizeShakeDirection(direction);
    }
    if(tokens.length >= 3) {
        duration = normalizeParameter(tokens[2], ["duration=", "秒="], "1.0");
    }
    if(tokens.length >= 4) {
        times = normalizeParameter(tokens[3], ["times=", "回数="], "1");
    }
    if(tokens.length >= 5) {
        amplitude = normalizeParameter(tokens[4], ["amplitude=", "大きさ="], "100");
    }

	// バリデーション
    if(direction === "") {
        direction = "horizontal";
    }
    if(duration === "") {
		dration = "1.0";
	}
    if(times === "") {
		times = "1";
	}
    if(amplitude === "") {
		amplitude = "100";
	}

	return [op, direction, duration, times, amplitude];
}

function normalizeShakeDirection(dir) {
	switch(dir) {
	case "horizontal":  return "horizontal";
	case "h":           return "horizontal";
	case "横":          return "horizontal";
	case "vertical":    return "vertical";
	case "v":           return "vertical";
	case "縦":          return "vertical";
	default:
        break;
	}
	return "horizontal";
}

// @wait
function normalizeWait(command) {
    var op = "@wait";
	var duration = "";

    // トークナイズする
    var tokens = command.split(" ");
    if(tokens.length >= 2) {
        duration = normalizeParameter(tokens[1], ["duration=", "秒="], "1.0");
    }

    // バリデーションする
	if(duration === "") {
		duration = "1.0";
	}

	return [op, duration];
}

// @skip
function normalizeSkip(command) {
	var op = "@skip";
	var opt = "";

    // トークナイズする
    var tokens = command.split(" ");
    if(tokens.length >= 2) {
        if(tokens[1] === "enable" || tokens[1] === "許可") {
            opt = "enable";
        } else if(tokens[1] === "disable" || tokens[1] === "不許可") {
			opt = "disable";
        } else {
			opt = "enable";
        }
	}

    // バリデーションする
    if(opt === "") {
        opt = "enable";
    }

	return [op, opt];
}

// @goto
function normalizeGoto(command) {
    var op = "@goto";
    var destination = "";

    // トークナイズする
    var tokens = command.split(" ");
    if(tokens.length >= 2) {
        destination = normalizeParameter(tokens[1], ["destination=", "行き先="], MSG_SPECIFY_LABEL);
    }

    // バリデーションする
    if(destination === "") {
        destination = MSG_SPECIFY_LABEL;
    }

	return [op, destination];
}

// @set
function normalizeSet(command) {
	var op = "@set";
	var variable = "";
	var operator = "";
	var value = "";

    // トークナイズする (引数名はない)
    var tokens = command.split(" ");
    if(tokens.length >= 2) {
		if(variable.startsWith("$") && !variable.substring(1).isNan()) {
			variable = token[1];
		}
	}
    if(tokens.length >= 3) {
		if(operator === "=" || operator === "+=" || operator === "-=" || operator === "*=" || operator === "/=" || operator === "%=") {
			operator = token[2];
		}
	}
    if(tokens.length >= 4) {
		if(!token[3].isNan()) {
			value = token[3];
		}
	}

    // バリデーションする
    if(variable === "") {
        variable = "$0";
    }
    if(operator === "") {
        operator = "=";
    }
    if(value === "") {
        value = "0";
    }

	return [op, variable, operator, value];
}

// @if
function normalizeIf(command) {
	var op = "@if";
	var variable = "";
	var operator = "";
	var value = "";
	var label = "";

    // トークナイズする (引数名はない)
    var tokens = command.split(" ");
    if(tokens.length >= 2) {
		if(variable.startsWith("$") && !variable.substring(1).isNan()) {
			variable = token[1];
		}
	}
    if(tokens.length >= 3) {
		if(operator === "==" || operator === "!=" || operator === ">" || operator === ">=" || operator === "<" || operator === "<=") {
			operator = token[2];
		}
	}
    if(tokens.length >= 4) {
		if(!token[3].isNan()) {
			value = token[3];
		}
	}
    if(tokens.length >= 5) {
		value = token[4];
	}
    if(tokens.length >= 6) {
		label = token[5];
	}

    // バリデーションする
    if(variable === "") {
        variable = "$0";
    }
    if(operator === "") {
        operator = "==";
    }
    if(value === "") {
        value = "0";
    }
    if(label === "") {
        label = MSG_SPECIFY_LABEL;
    }

	return [op, variable, operator, value, label];
}

// @load
function normalizeLoad(command) {
	var op = "@load";
	var file = "";

    // トークナイズする
    if(tokens.length >= 2) {
        file = normalizeParameter(tokens[1], ["file=", "ファイル="], MSG_SPECIFY_FILE);
    }

    // バリデーションする
	if(file === "") {
		file = MSG_SPECIFY_FILE;
	}

	return [op, file];
}

// @chapter
function normalizeChapter(command) {
	var op = "@chapter";
	var title = "";

    // トークナイズする
    if(tokens.length >= 2) {
        title = normalizeParameter(tokens[1], ["title=", "タイトル="], "");
    }

    // titleは""でもよい

    return [op, title];
}

// @wms
function normalizeWms(command) {
	var op = "@wms";
	var file = "";

    // トークナイズする
    if(tokens.length >= 2) {
        file = normalizeParameter(tokens[1], ["file=", "ファイル="], MSG_SPECIFY_FILE);
    }

    // バリデーションする
    if(file === "") {
        file = MSG_SPECIFY_FILE;
    }

    return [op, file];
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
        case "cmd-chs": elem.cmd = "@chs stay stay stay stay 1.0 stay normal"; break;
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
