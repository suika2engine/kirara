document.getElementById("open").addEventListener('click', async ()=>{
    const ret = await window.api.openModel('C:\\Users\\tabata\\Documents\\game');
    if(!ret) {
        alert('有効なプロジェクトではありません。');
    } else {
        window.location.href = 'index.html';
    }
})
