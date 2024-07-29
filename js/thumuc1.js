
function goBack() {
    window.location.href = "index.html";
}

function search() {
    const input = document.getElementById('searchInput').value.toLowerCase();
    const folders = document.getElementsByClassName('folder');
    for (let i = 0; i < folders.length; i++) {
        const folderName = folders[i].getElementsByTagName('p')[0].textContent.toLowerCase();
        if (folderName.includes(input)) {
            folders[i].style.display = "";
        } else {
            folders[i].style.display = "none";
        }
    }
}

function openFolder(folderName) {
    const folderContent = document.getElementById('folderContent');
    folderContent.innerHTML = `<h2>Nội dung của ${folderName}</h2><p>Đây là nội dung của ${folderName}</p>`;
}
function goBack() {
window.history.back();
}

