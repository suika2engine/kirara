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
    } else if(command.startsWith("@ch ") || command.startsWith("@キャラ ")) {
        // @ch
        var cl = normalizeCh(command);
        newElem.textContent = "キャラ";
        newElem.classList.add("drag-list-item-ch");
        newElem.style.backgroundImage = "url(\"" + baseUrl.replace(/\\/g, "\\\\") + "ch/" + cl[2] + "\")";
        newElem.style.backgroundRepeat = "no-repeat";
        newElem.style.backgroundSize = "contain";
    } else if(command.startsWith("@bgm ") || command.startsWith("@音楽 ")) {
        // @bgm
        var cl = normalizeBgm(command);
        newElem.textContent = "音楽 " + cl[1];
        newElem.classList.add("drag-list-item-bgm");
    } else if(command.startsWith("@se ") || command.startsWith("@効果音 ")) {
        // @se
        var cl = normalizeSe(command);
        newElem.textContent = "効果音 " + cl[1];
        newElem.classList.add("drag-list-item-se");
    } else if(command.startsWith("@vol ") || command.startsWith("@音量 ")) {
        // @vol
        newElem.textContent = "音量";
        newElem.classList.add("drag-list-item-vol");
    } else if(command.startsWith("@choose ") || command.startsWith("@選択肢 ")) {
        // @choose
        newElem.textContent = "選択肢";
        newElem.classList.add("drag-list-item-choose");
    } else if(command.startsWith("@cha ") || command.startsWith("@キャラ移動 ")) {
        // @cha
        var cl = normalizeCha(command);
        newElem.textContent = "キャラ移動 " + japanizeChPosition(cl[1]);
        newElem.classList.add("drag-list-item-cha");
    } else if(command.startsWith("@chs ") || command.startsWith("@場面転換 ")) {
        // @chs
        var cl = normalizeChs(command);
        newElem.textContent = "場面転換";
        newElem.classList.add("drag-list-item-chs");
    } else if(command.startsWith("@shake ") || command.startsWith("@振動 ")) {
        // @shake
        var cl = normalizeShake(command);
        newElem.textContent = "画面を揺らす";
        newElem.classList.add("drag-list-item-shake");
    } else if(command.startsWith("@click ") || command.startsWith("@クリック ")) {
        // @click
        newElem.textContent = "クリックを待つ";
        newElem.classList.add("drag-list-item-click");
    } else if(command.startsWith("@wait ") || command.startsWith("@時間待ち ")) {
        // @wait
        var cl = normalizeWait(command);
        newElem.textContent = "一定時間待つ " + cl[1] + "秒";
        newElem.classList.add("drag-list-item-wait");
    } else if(command.startsWith("@skip ") || command.startsWith("@スキップ ")) {
        // @skip
        var cl = normalizeSkip(command);
        newElem.textContent = "スキップ" + (cl[1] === "enable" ? "許可" : "禁止");
        newElem.classList.add("drag-list-item-skip");
    } else if(command.startsWith("@goto ") || command.startsWith("@ジャンプ ")) {
        // @goto
        var cl = normalizeGoto(command);
        newElem.textContent = "ジャンプ \"" + cl[1] + "\"へ";
        newElem.classList.add("drag-list-item-goto");
    } else if(command.startsWith("@set ") || command.startsWith("@フラグをセット ")) {
        // @set
        var cl = normalizeSet(command);
        newElem.textContent = "フラグをセット";
        newElem.classList.add("drag-list-item-set");
    } else if(command.startsWith("@if ") || command.startsWith("@フラグでジャンプ ")) {
        // @if
        var cl = normalizeIf(command);
        newElem.textContent = "フラグでジャンプ";
        newElem.classList.add("drag-list-item-if");
    } else if(command.startsWith("@load ") || command.startsWith("@シナリオ ")) {
        // @load
        var cl = normalizeLoad(command);
        newElem.textContent = "シナリオへジャンプ";
        newElem.classList.add("drag-list-item-load");
    } else if(command.startsWith("@chapter ") || command.startsWith("@章 ")) {
        // @chapter
        var cl = normalizeChapter(command);
        newElem.textContent = "章のタイトル " + cl[1];
        newElem.classList.add("drag-list-item-chapter");
    } else if(command.startsWith("@wms ") || command.startsWith("@スクリプト ")) {
        // @wms
        var cl = normalizeWms(command);
        newElem.textContent = "高機能スクリプトを呼び出す";
        newElem.classList.add("drag-list-item-wms");
    } else if(command.startsWith("@gui ") || command.startsWith("@メニュー ")) {
        // @gui
        var cl = normalizeGui(command);
        newElem.textContent = "高機能メニューを呼び出す";
        newElem.classList.add("drag-list-item-gui");
    } else if(command.startsWith("@video ") || command.startsWith("@動画 ")) {
        // @video
        var cl = normalizeVideo(command);
        newElem.textContent = "動画";
        newElem.classList.add("drag-list-item-video");
    } else if(command.startsWith("@")) {
        // Kiraraで未対応のコマンド
        newElem.textContent = command;
        newElem.classList.add("drag-list-item-etc");
    } else if(command.startsWith(":")) {
        newElem.textContent = "目印 " + command.substring(1);
        newElem.classList.add("drag-list-item-label");
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
        // 空行はコメントに置き換える
        newElem.cmd = "#";
        newElem.textContent = "";
        newElem.classList.add("drag-list-item-comment");
    } else if(command.startsWith("#")) {
        // コメント
        newElem.textContent = command.substring(1);
        newElem.classList.add("drag-list-item-comment");
    } else {
        // 上記に該当しなければメッセージ
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
        // @bg編集開始
        var cl = normalizeBg(cmd);
        document.getElementById("prop-bg-file").value = cl[1];
        document.getElementById("prop-bg-duration").value = cl[2];
        document.getElementById("prop-bg-effect").value = normalizeBgEffect(cl[3]);
        document.getElementById("prop-bg").style.display = "block";
        document.getElementById("thumbnail-picture").src = baseUrl + "bg/" + cl[1];
    } else if(cmd.startsWith("@ch ") || cmd.startsWith("@キャラ ")) {
        // @ch編集開始
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
        // @bgm編集開始
        var cl = normalizeBgm(cmd);
        document.getElementById("prop-bgm-file").value = cl[1];
        document.getElementById("prop-bgm-once").checked = (cl[2] === "once");
        document.getElementById("prop-bgm").style.display = "block";
    } else if(cmd.startsWith("@se ") || cmd.startsWith("@効果音 ")) {
        // @se編集開始
        var cl = normalizeSe(cmd);
        document.getElementById("prop-se-file").value = cl[1];
        document.getElementById("prop-se-loop").checked = (cl[2] === "loop");
        document.getElementById("prop-se-voice").checked = (cl[2] === "voice");
        document.getElementById("prop-se").style.display = "block";
    } else if(cmd.startsWith("@vol ") || cmd.startsWith("@音量 ")) {
        // @vol編集開始
        var cl = normalizeVol(cmd);
        document.getElementById("prop-vol-track").value = cl[1];
        document.getElementById("prop-vol-volume").value = cl[2];
        document.getElementById("prop-vol-duration").value = cl[3];
        document.getElementById("prop-vol").style.display = "block";
    } else if(cmd.startsWith("@choose ") || cmd.startsWith("@選択肢 ")) {
        // @choose編集開始
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
        // @vol編集開始
        var label = cmd.substring(1);
        document.getElementById("prop-label-name").value = label;
        document.getElementById("prop-label").style.display = "block";
    } else if(cmd.startsWith("@cha ") || cmd.startsWith("@キャラ移動 ")) {
        // @cha編集開始
        var cl = normalizeCha(cmd);
        document.getElementById("prop-cha-position").value = cl[1];
        document.getElementById("prop-cha-duration").value = cl[2];
        document.getElementById("prop-cha-acceleration").value = cl[3];
        document.getElementById("prop-cha-xoffset").value = cl[4];
        document.getElementById("prop-cha-yoffset").value = cl[5];
        document.getElementById("prop-cha-alpha").value = cl[6];
        document.getElementById("prop-cha").style.display = "block";
    } else if(cmd.startsWith("@chs ") || cmd.startsWith("@場面転換 ")) {
        // @chs編集開始
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
        // @shake編集開始
        var cl = normalizeShake(cmd);
        document.getElementById("prop-shake-direction").value = cl[1];
        document.getElementById("prop-shake-duration").value = cl[2];
        document.getElementById("prop-shake-times").value = cl[3];
        document.getElementById("prop-shake-amplitude").value = cl[4];
        document.getElementById("prop-shake").style.display = "block";
    } else if(cmd.startsWith("@wait ") || cmd.startsWith("@時間待ち ")) {
        // @wait編集開始
        var cl = normalizeWait(cmd);
        document.getElementById("prop-wait-duration").value = cl[1];
        document.getElementById("prop-wait").style.display = "block";
    } else if(cmd.startsWith("@skip ") || cmd.startsWith("@スキップ ")) {
        // @skip編集開始
        var cl = normalizeSkip(cmd);
        document.getElementById("prop-skip-opt").checked = (cl[1] === "disable") ? true : false;
        document.getElementById("prop-skip").style.display = "block";
    } else if(cmd.startsWith("@goto ") || cmd.startsWith("@ジャンプ ")) {
        // 選択肢を作成する
        createLabelOptions("prop-goto-label");

        // @goto編集開始
        var cl = normalizeGoto(cmd);
        document.getElementById("prop-goto-label").value = cl[1];
        document.getElementById("prop-goto").style.display = "block";
    } else if(cmd.startsWith("@set ") || cmd.startsWith("@フラグをセット ")) {
        // @set編集開始
        var cl = normalizeSet(cmd);
        document.getElementById("prop-set-variable").value = cl[1];
        document.getElementById("prop-set-operator").value = cl[2];
        document.getElementById("prop-set-value").value = cl[3];
        document.getElementById("prop-set").style.display = "block";
    } else if(cmd.startsWith("@if ") || cmd.startsWith("@フラグでジャンプ ")) {
        // 選択肢を作成する
        createLabelOptions("prop-if-label");

        // @if編集開始
        var cl = normalizeIf(cmd);
        document.getElementById("prop-if-variable").value = cl[1];
        document.getElementById("prop-if-operator").value = cl[2];
        document.getElementById("prop-if-value").value = cl[3];
        document.getElementById("prop-if-label").value = cl[4];
        document.getElementById("prop-if").style.display = "block";
    } else if(cmd.startsWith("@load ") || cmd.startsWith("@シナリオ ")) {
        // @load編集開始
        var cl = normalizeLoad(cmd);
        document.getElementById("prop-load-file").value = cl[1];
        document.getElementById("prop-load").style.display = "block";
    } else if(cmd.startsWith("@chapter ") || cmd.startsWith("@章 ")) {
        // @chapter編集開始
        var cl = normalizeChapter(cmd);
        document.getElementById("prop-chapter-title").value = cl[1];
        document.getElementById("prop-chapter").style.display = "block";
    } else if(cmd.startsWith("@wms ") || cmd.startsWith("@スクリプト ")) {
        // @wms編集開始
        var cl = normalizeWms(cmd);
        document.getElementById("prop-wms-file").value = cl[1];
        document.getElementById("prop-wms").style.display = "block";
    } else if(cmd.startsWith("@gui ") || cmd.startsWith("@メニュー ")) {
        // @gui編集開始
        var cl = normalizeGui(cmd);
        document.getElementById("prop-gui-file").value = cl[1];
        document.getElementById("prop-gui").style.display = "block";
    } else if(cmd.startsWith("@video ") || cmd.startsWith("@動画 ")) {
        // @video編集開始
        var cl = normalizeVideo(cmd);
        document.getElementById("prop-video-file").value = cl[1];
        document.getElementById("prop-video").style.display = "block";
    } else if(cmd.startsWith("@")) {
        // 未対応のコマンド編集開始
    } else if(cmd.startsWith(":")) {
        // ラベル編集開始
        document.getElementById("prop-label-name").value = cmd.substring(1);
        document.getElementById("prop-label").style.display = "block";
    } else if(cmd.startsWith("#")) {
        // コメント編集開始
        document.getElementById("prop-comment-text").value = cmd.substring(1);
        document.getElementById("prop-comment").style.display = "block";
    } else if(cmd === "") {
        // 空行編集開始(FIXME:なにもしない)
    } else if(cmd.match(/^\*[^\*]+\*[^\*]+$/)) {
        // セリフ(ボイスなし)編集開始
        var sp = cmd.split("*");
        var name = sp[1];
        var text = sp[2];
        document.getElementById("prop-serif-name").value = name;
        document.getElementById("prop-serif-text").value = text;
        document.getElementById("prop-serif-voice").value = "";
        document.getElementById("prop-serif").style.display = "block";
    } else if(cmd.match(/^\*[^\*]+\*[^\*]+\*[^\*]+$/)) {
        // セリフ(ボイスあり)編集開始
        var sp = cmd.split("*");
        var name = sp[1];
        var voice = sp[2];
        var text = sp[3];
        document.getElementById("prop-serif-name").value = name;
        document.getElementById("prop-serif-text").value = text;
        document.getElementById("prop-serif-voice").value = voice;
        document.getElementById("prop-serif").style.display = "block";
    } else if(cmd.match(/^.+「.*」$/)) {
        // セリフ(かぎカッコ)編集開始
        var name = cmd.split("「")[0];
        var text = cmd.split("「")[1].split("」")[0];
        document.getElementById("prop-serif-name").value = name;
        document.getElementById("prop-serif-text").value = text;
        document.getElementById("prop-serif-voice").value = "";
        document.getElementById("prop-serif").style.display = "block";
    } else {
        // メッセージ編集開始
        document.getElementById("prop-msg-text").value = cmd;
        document.getElementById("prop-msg").style.display = "block";
    }
}

function createLabelOptions(selectId) {
    // 一度子要素を削除する
    var parent = document.getElementById(selectId);
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }

    // シナリオからラベルを集めてoptionにする
    Array.from(document.getElementById("scenario").childNodes).forEach(function (e) {
        if(e.cmd !== undefined && e.cmd != null && e.cmd.startsWith(":")) {
            var option = document.createElement("option");
            option.value = e.cmd.substring(1);
            option.textContent = option.value;
            document.getElementById(selectId).appendChild(option);
        }
    });
}

// 変更を保存する
function commitProps() {
    if(elementInEdit == null) {
        return;
    }

    // コマンドの種類ごとに、要素から値を出し、シナリオ要素に反映する
    cmd = elementInEdit.cmd;
    if(cmd.startsWith("@bg ") || cmd.startsWith("@背景 ")) {
        // @bg保存
        var file = document.getElementById("prop-bg-file").value;
        var duration = document.getElementById("prop-bg-duration").value;
        var effect = normalizeBgEffect(document.getElementById("prop-bg-effect").value);
        elementInEdit.cmd = "@bg " + file + " " + duration + " " + effect;
    } else if(cmd.startsWith("@ch ") || cmd.startsWith("@キャラ ")) {
        // @ch保存
        var position = normalizeChPosition(document.getElementById("prop-ch-position").value);
        var file = document.getElementById("prop-ch-file").value;
        var duration = document.getElementById("prop-ch-duration").value;
        var effect = normalizeBgEffect(document.getElementById("prop-ch-effect").value);
        var xshift = document.getElementById("prop-ch-xshift").value;
        var yshift = document.getElementById("prop-ch-yshift").value;
        var alpha = document.getElementById("prop-ch-alpha").value;
        elementInEdit.cmd = "@ch " + position + " " + file + " " + duration + " " + effect + " " + xshift + " " + yshift + " " + alpha;
    } else if(cmd.startsWith("@bgm ") || cmd.startsWith("@音楽 ")) {
        // @bgm保存
        var file = document.getElementById("prop-bgm-file").value;
        var once = document.getElementById("prop-bgm-once").checked;
        if(!once) {
            elementInEdit.cmd = "@bgm " + file;
        } else {
            elementInEdit.cmd = "@bgm " + file + " once";
        }
    } else if(cmd.startsWith("@se ") || cmd.startsWith("@効果音 ")) {
        // @se保存
        var file = document.getElementById("prop-se-file").value;
        var loop = document.getElementById("prop-se-loop").checked;
        var voice = document.getElementById("prop-se-voice").checked;
        if(!loop && !voice) {
            elementInEdit.cmd = "@se " + file;
        } else if(loop) {
            elementInEdit.cmd = "@se " + file + " loop";
        } else if(voice) {
            elementInEdit.cmd = "@se " + file + " voice";
        }
    } else if(cmd.startsWith("@vol ") || cmd.startsWith("@音量 ")) {
        // @vol保存
        var track = document.getElementById("prop-vol-track").value;
        var volume = document.getElementById("prop-vol-volume").value;
        var duration = document.getElementById("prop-vol-duration").value;
        elementInEdit.cmd = "@vol " + track + " " + volume + " " + duration;
    } else if(cmd.startsWith("@choose ") || cmd.startsWith("@選択肢 ")) {
        // @choose保存
        var label = [];
        var text = [];
        for(let i = 0; i < 8; i++) {
            label[i] = document.getElementById("prop-choose-label" + (i+1)).value;
            text[i] = document.getElementById("prop-choose-text" + (i+1)).value;
        }
        var c = "@choose";
        for(let i = 0; i < 8; i++) {
            if(label[i] === "" || text[i] === "") {
                break;
            }
            c = c + " " + label[i] + " " + text[i];
        }
        elementInEdit.cmd = c;
    } else if(cmd.startsWith("@cha ") || cmd.startsWith("@キャラ移動 ")) {
        // @cha保存
        var position = document.getElementById("prop-cha-position").value;
        var duration = document.getElementById("prop-cha-duration").value;
        var acceleration = document.getElementById("prop-cha-acceleration").value;
        var xoffset = document.getElementById("prop-cha-xoffset").value;
        var yoffset = document.getElementById("prop-cha-yoffset").value;
        var alpha = document.getElementById("prop-cha-alpha").value;
        elementInEdit.cmd = "@cha " + position + " " + duration + " " + acceleration + " " + xoffset + " " + yoffset + " " + alpha;
    } else if(cmd.startsWith("@chs ") || cmd.startsWith("@場面転換 ")) {
        // @chs保存
        var center = document.getElementById("prop-chs-center").value;
        var right = document.getElementById("prop-chs-right").value;
        var left = document.getElementById("prop-chs-left").value;
        var back = document.getElementById("prop-chs-back").value;
        var duration = document.getElementById("prop-chs-duration").value;
        var background = document.getElementById("prop-chs-background").value;
        var effect = document.getElementById("prop-chs-effect").value;
        elementInEdit.cmd = "@chs " + center + " " + right + " " + left + " " + back + " " + duration + " " + background + " " + effect;
    } else if(cmd.startsWith("@shake ") || cmd.startsWith("@振動 ")) {
        // @shake保存
        var direction = document.getElementById("prop-shake-direction").value;
        var duration = document.getElementById("prop-shake-duration").value;
        var times = document.getElementById("prop-shake-times").value;
        var amplitude = document.getElementById("prop-shake-amplitude").value;
        elementInEdit.cmd = "@shake " + direction + " " + duration + " " + times + " " + amplitude;
    } else if(cmd.startsWith("@wait ") || cmd.startsWith("@時間待ち ")) {
        // @wait保存
        var duration = document.getElementById("prop-wait-duration").value;
        elementInEdit.cmd = "@wait " + duration;
        elementInEdit.textContent = "一定時間待つ " + duration + "秒";
    } else if(cmd.startsWith("@skip ") || cmd.startsWith("@スキップ ")) {
        // @skip保存
        var opt = document.getElementById("prop-skip-opt").checked ? "disable" : "enable";
        elementInEdit.cmd = "@skip " + opt;
        elementInEdit.textContent = "スキップ" + (opt === "disable" ? "禁止" : "許可");
    } else if(cmd.startsWith("@goto ") || cmd.startsWith("@ジャンプ ")) {
        // @goto保存
        var label = document.getElementById("prop-goto-label").value;
        elementInEdit.cmd = "@goto " + label;
        elementInEdit.textContent = "ジャンプ \"" + label + "\"へ";
    } else if(cmd.startsWith("@set ") || cmd.startsWith("@フラグをセット ")) {
        // @set保存
        var variable = document.getElementById("prop-set-variable").value;
        var operator = document.getElementById("prop-set-operator").value;
        var value = document.getElementById("prop-set-value").value;
        elementInEdit.cmd = "@set " + variable + " " + operator + " " + value;
    } else if(cmd.startsWith("@if ") || cmd.startsWith("@フラグでジャンプ ")) {
        // @if保存
        var variable = document.getElementById("prop-if-variable").value;
        var operator = document.getElementById("prop-if-operator").value;
        var value = document.getElementById("prop-if-value").value;
        var label = document.getElementById("prop-if-label").value;
        elementInEdit.cmd = "@if " + variable + " " + operator + " " + value + " " + label;
    } else if(cmd.startsWith("@load ") || cmd.startsWith("@シナリオ ")) {
        // @load保存
        var file = document.getElementById("prop-load-file").value;
        elementInEdit.cmd = "@load " + file;
    } else if(cmd.startsWith("@chapter ") || cmd.startsWith("@章 ")) {
        // @chapter保存
        var title = document.getElementById("prop-chapter-title").value;
        elementInEdit.cmd = "@chapter " + title;
        elementInEdit.textContent = "章のタイトル " + title;
    } else if(cmd.startsWith("@wms ") || cmd.startsWith("@スクリプト ")) {
        // @wms保存
        var file = document.getElementById("prop-wms-file").value;
        elementInEdit.cmd = "@wms " + file;
    } else if(cmd.startsWith("@gui ") || cmd.startsWith("@メニュー ")) {
        // @gui保存
        var file = document.getElementById("prop-gui-file").value;
        elementInEdit.cmd = "@gui " + file;
    } else if(cmd.startsWith("@video ") || cmd.startsWith("@動画 ")) {
        // @video保存
        var file = document.getElementById("prop-video-file").value;
        elementInEdit.cmd = "@video " + file;
    } else if (cmd.startsWith("@")) {
        // 未対応のコマンド保存
    } else if (cmd.startsWith(":")) {
        // ラベル保存
        var label = document.getElementById("prop-label-name").value;
        elementInEdit.cmd = ":" + label;
        elementInEdit.textContent = "目印 " + label;
    } else if(cmd.startsWith("#")) {
        // コメント保存
        var comment = document.getElementById("prop-comment-text").value;
        elementInEdit.cmd = "#" + comment;
        elementInEdit.textContent = comment;
    } else if(cmd.length === 0) {
        // FIXME:ここには空行はこないはず
        elementInEdit.cmd = "#";
    } else if(cmd.match(/^\*[^\*]+\*[^\*]+$/) || cmd.match(/^\*[^\*]+\*[^\*]+\*[^\*]+$/) || cmd.match(/^.+「.*」$/)) {
        // セリフ保存
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
        // メッセージ保存
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
 * パレットビュー
 */

function setupPalette() {
    Array.from(document.getElementById("palette").childNodes).forEach(function (elem) {
        if(elem.id === undefined) {
            return;
        }
        switch(elem.id) {
        case "cmd-message": elem.cmd = "ここに文章を入力してください。"; break;
        case "cmd-serif": elem.cmd = "キャラ名「セリフを入力してください」"; break;
        case "cmd-choose": elem.cmd = "@choose 目印1 学校へ行く 目印2 海へ行く 目印3 公園へ行く"; break;
        case "cmd-chs": elem.cmd = "@chs stay stay stay stay 1.0 stay normal"; break;
        case "cmd-vol": elem.cmd = "@vol bgm 1.0 1.0"; break;
        case "cmd-cha": elem.cmd = "@cha center 1.0 move 100 0 show"; break;
        case "cmd-label": elem.cmd = ":名前をつけてください"; break;
        case "cmd-goto": elem.cmd = "@goto 目印を選んでください"; break;
        case "cmd-set": elem.cmd = "@set $0 = 1"; break;
        case "cmd-if": elem.cmd = "@if $0 == 1 目印を選んでください"; break;
        case "cmd-chapter": elem.cmd = "@chapter 章のタイトル"; break;
        case "cmd-click": elem.cmd = "@click"; break;
        case "cmd-wait": elem.cmd = "@wait 1.0"; break;
        case "cmd-shake": elem.cmd = "@shake horizontal 3 3 100"; break;
        case "cmd-skip": elem.cmd = "@skip enable"; break;
        case "cmd-wms": elem.cmd = "@wms ファイルを指定してください"; break;
        case "cmd-comment": elem.cmd = "#ここにメモを記入してください"; break;
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

function setupTxt() {
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

function setupBg() {
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

function setupCh() {
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

function setupBgm() {
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

function setupSe() {
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
}

/*
 * movビュー
 */

async function refreshMov() {
    var element = document.getElementById("mov-list");
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }

    const se = await window.api.getMovList();
    se.forEach(function(file) {
        var elem = document.createElement('li');
        elem.id = makeId();
        elem.textContent = file;
        elem.draggable = "true";
        elem.className = "tab-list-item";
        elem.template = true;
        elem.cmd = "@video " + file;
        elem.addEventListener("click", async () => {
            Array.from(document.getElementById("mov-list").childNodes).forEach(function (e) {
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
        document.getElementById("mov-list").appendChild(elem);
    });
}

function setupMov() {
    var movPanel = document.getElementById("tab-panel-mov");
    movPanel.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        document.getElementById("tab-panel-mov").classList.add('dragover');
    });
    movPanel.addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
        document.getElementById("tab-panel-mov").classList.remove('dragover');
    });
    movPanel.addEventListener('drop', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        document.getElementById("tab-panel-mov").classList.remove('dragover');
        for (const file of e.dataTransfer.files) {
            await window.api.addMovFile(file.path);
        }
        refreshMov();
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

const MSG_SPECIFY_FILE = "ファイルを指定してください";
const MSG_SPECIFY_LABEL = "行き先を指定してください";
const MSG_SPECIFY_OPTION = "選択肢を指定してください";

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
        yshift = normalizeParameter(tokens[6], ["down=", "下="], "");
    }
    if(tokens.length >= 8) {
        alpha = normalizeParameter(tokens[7], ["alpha=", "アルファ="], "");
        alpha = normalizeChAlpha(alpha);
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

function japanizeChPosition(pos) {
    switch(pos) {
    case "中央":            return "中央";
    case "center":          return "中央";
    case "右":              return "右";
    case "right":           return "右";
    case "左":              return "左";
    case "left":            return "左";
    case "中央背面":        return "背面";
    case "back":            return "背面";
    case "顔":              return "顔";
    case "face":            return "顔";
    default:                break;
    }
    return "中央";
}

function normalizeChAlpha(alpha) {
    if(alpha === "hide") {
        return 0;
    }
    if(alpha === "show") {
        return 255;
    }
    if(alpha < 0) {
        return 0;
    }
    if(alpha > 255) {
        return 255;
    }
    return alpha;
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

    return [op, file, opt];
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
        alpha = normalizeChAlpha(alpha);
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
		if(tokens[1].startsWith("$") && !isNaN(tokens[1].substring(1))) {
			variable = tokens[1];
		}
	}
    if(tokens.length >= 3) {
		if(tokens[2] === "=" || tokens[2] === "+=" || tokens[2] === "-=" || tokens[2] === "*=" || tokens[2] === "/=" || tokens[2] === "%=") {
			operator = tokens[2];
		}
	}
    if(tokens.length >= 4) {
		if(!isNaN(tokens[3])) {
			value = tokens[3];
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
		if(variable.startsWith("$") && !isNaN(variable.substring(1))) {
			variable = tokens[1];
		}
	}
    if(tokens.length >= 3) {
		if(operator === "==" || operator === "!=" || operator === ">" || operator === ">=" || operator === "<" || operator === "<=") {
			operator = tokens[2];
		}
	}
    if(tokens.length >= 4) {
		if(!isNaN(tokens[3])) {
			value = tokens[3];
		}
	}
    if(tokens.length >= 5) {
		label = tokens[4];
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
    var tokens = command.split(" ");
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
    var tokens = command.split(" ");
    if(tokens.length >= 2) {
        title = normalizeParameter(tokens[1], ["title=", "タイトル="], "");
    }

    // titleは""でもよい

    return [op, title];
}

// @gui
function normalizeGui(command) {
	var op = "@gui";
	var file = "";

    // トークナイズする
    var tokens = command.split(" ");
    if(tokens.length >= 2) {
        file = normalizeParameter(tokens[1], ["file=", "ファイル="], MSG_SPECIFY_FILE);
    }

    // バリデーションする
    if(file === "") {
        file = MSG_SPECIFY_FILE;
    }

    return [op, file];
}

// @video
function normalizeVideo(command) {
	var op = "@video";
	var file = "";

    // トークナイズする
    var tokens = command.split(" ");
    if(tokens.length >= 2) {
        file = normalizeParameter(tokens[1], ["file=", "ファイル="], MSG_SPECIFY_FILE);
    }

    // バリデーションする
    if(file === "") {
        file = MSG_SPECIFY_FILE;
    }

    return [op, file];
}

// @wms
function normalizeWms(command) {
	var op = "@wms";
	var file = "";

    // トークナイズする
    var tokens = command.split(" ");
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
    // ゲームのベースURLを取得する
    baseUrl = await window.api.getBaseUrl();

    // パレットの要素をセットアップする
    setupPalette();

    // シナリオの要素をセットアップする
    refreshScenario();

    // txtタブの要素をセットアップする
    refreshTxt();
    setupTxt();

    // bgタブの要素をセットアップする
    refreshBg();
    setupBg();

    // chタブの要素をセットアップする
    refreshCh();
    setupCh();

    // bgmタブの要素をセットアップする
    refreshBgm();
    setupBgm();

    // seタブの要素をセットアップする
    refreshSe();
    setupSe();

    // movタブの要素をセットアップする
    refreshMov();
    setupMov();
})
