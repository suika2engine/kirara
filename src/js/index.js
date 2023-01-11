window.addEventListener('load', async () => {
    const txt = await window.api.getTxtList();
    const bg = await window.api.getBgList();
    const ch = await window.api.getChList();
    const bgm = await window.api.getBgmList();
    const se = await window.api.getSeList();

    txt.forEach(function(file) {
        var elem = document.createElement('li');
        elem.textContent = file;
        elem.draggable = "true";
        elem.className = "left-tab-list-item";
        elem.addEventListener("click", onClickTxt);
        document.getElementById("txt-list").appendChild(elem);
    });
    bg.forEach(function(file) {
        var elem = document.createElement('li');
        elem.textContent = file;
        elem.draggable = "true";
        elem.className = "left-tab-list-item";
        elem.addEventListener("click", onClickBg);
        document.getElementById("bg-list").appendChild(elem);
    });
    ch.forEach(function(file) {
        var elem = document.createElement('li');
        elem.textContent = file;
        elem.draggable = "true";
        elem.className = "left-tab-list-item";
        elem.addEventListener("click", onClickCh);
        document.getElementById("ch-list").appendChild(elem);
    });
    bgm.forEach(function(file) {
        var elem = document.createElement('li');
        elem.textContent = file;
        elem.draggable = "true";
        elem.className = "left-tab-list-item";
        elem.addEventListener("click", onClickBgm);
        document.getElementById("bgm-list").appendChild(elem);
    });
    se.forEach(function(file) {
        var elem = document.createElement('li');
        elem.textContent = file;
        elem.draggable = "true";
        elem.className = "left-tab-list-item";
        elem.addEventListener("click", onClickSe);
        document.getElementById("se-list").appendChild(elem);
    });
})

function onClickTxt() {
    Array.from(document.getElementById("txt-list").childNodes).forEach(function (a) {
        if(a.className == "left-tab-list-item" || a.className == "left-tab-list-item-sel") {
            if(a === event.srcElement) {
                a.className = "left-tab-list-item-sel";
            } else {
                a.className = "left-tab-list-item";
            }
        }
    });
    loadPicture(null, null);
}

function onClickBg() {
    Array.from(document.getElementById("bg-list").childNodes).forEach(function (a) {
        if(a.className == "left-tab-list-item" || a.className == "left-tab-list-item-sel") {
            if(a === event.srcElement) {
                a.className = "left-tab-list-item-sel";
            } else {
                a.className = "left-tab-list-item";
            }
        }
    });
    loadPicture("bg", event.srcElement.textContent);
}

function onClickCh() {
    Array.from(document.getElementById("ch-list").childNodes).forEach(function (a) {
        if(a.className == "left-tab-list-item" || a.className == "left-tab-list-item-sel") {
            if(a === event.srcElement) {
                a.className = "left-tab-list-item-sel";
            } else {
                a.className = "left-tab-list-item";
            }
        }
    });
    loadPicture("ch", event.srcElement.textContent);
}

function onClickBgm(elem) {
    Array.from(document.getElementById("bgm-list").childNodes).forEach(function (a) {
        if(a.className == "left-tab-list-item" || a.className == "left-tab-list-item-sel") {
            if(a === event.srcElement) {
                a.className = "left-tab-list-item-sel";
            } else {
                a.className = "left-tab-list-item";
            }
        }
    });
    loadPicture(null, null);
}

function onClickSe(elem) {
    Array.from(document.getElementById("se-list").childNodes).forEach(function (a) {
        if(a.className == "left-tab-list-item" || a.className == "left-tab-list-item-sel") {
            if(a === event.srcElement) {
                a.className = "left-tab-list-item-sel";
            } else {
                a.className = "left-tab-list-item";
            }
        }
    });
    loadPicture(null, null);
}

async function loadPicture(dir, file) {
    var url = "";
    if(dir != null && file != null) {
        url = await window.api.getBaseUrl() + dir + "/" + file;
    }
    document.getElementById("thumbnail-picture").src = url;
}





document.querySelectorAll('.drag-list li').forEach (elm => {
    elm.ondragstart = function () {
        event.dataTransfer.setData('text/plain', event.target.id);
    };
    elm.ondragover = function () {
        event.preventDefault();
        this.style.borderTop = '2px solid blue';
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
