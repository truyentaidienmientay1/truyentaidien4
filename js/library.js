const API_KEY = "AIzaSyDqTM8uhkRNginApTdMI0Wvq3IvmXYS81c";
const ROOT_FOLDER_ID = "1b-vgHsXEETOD5uIROhcH7DI5mzFlMr5M";

let currentFolder = ROOT_FOLDER_ID;
let pathStack = [];

/* =========================
   LOAD THƯ MỤC
========================= */
async function loadFolder(folderId, folderName = "Thư viện", reset = false) {

    // Reset về thư mục gốc
    if (reset) {
        pathStack = [{ id: ROOT_FOLDER_ID, name: "Thư viện" }];
    } else {
        // Tránh push trùng
        const last = pathStack[pathStack.length - 1];
        if (!last || last.id !== folderId) {
            pathStack.push({ id: folderId, name: folderName });
        }
    }

    currentFolder = folderId;

    const url = `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents+and+trashed=false&key=${API_KEY}&fields=files(id,name,mimeType)&orderBy=folder,name`;

    try {
        const res = await fetch(url);
        const data = await res.json();
        renderFiles(data.files || []);
        renderBreadcrumb();
    } catch (err) {
        console.error("Lỗi load folder:", err);
        document.getElementById("library").innerHTML =
            "<p style='padding:20px'>Không tải được dữ liệu.</p>";
    }
}


/* =========================
   HIỂN THỊ FILE
========================= */
function renderFiles(files) {

    const container = document.getElementById("library");
    container.innerHTML = "";

    files.forEach(file => {

        const div = document.createElement("div");

        // ===== FOLDER =====
        if (file.mimeType === "application/vnd.google-apps.folder") {

            div.className = "library-item library-folder";

            div.innerHTML = `
                <div class="library-left">
                    <i class="fas fa-folder" style="color:#f9a825"></i>
                    <span class="folder-name">${file.name}</span>
                </div>
            `;

            div.onclick = () => loadFolder(file.id, file.name);
        }

        // ===== FILE =====
        else {

            div.className = "library-item library-file";

            div.innerHTML = `
                <div class="library-left">
                    <i class="fas fa-file-alt"></i>
                    <span>${file.name}</span>
                </div>

                <a class="download-btn"
                   href="https://drive.google.com/uc?id=${file.id}&export=download"
                   target="_blank">
                   <i class="fas fa-download"></i> Tải về
                </a>
            `;
        }

        container.appendChild(div);
    });
}


/* =========================
   BREADCRUMB
========================= */
function renderBreadcrumb() {

    const breadcrumb = document.getElementById("breadcrumb");
    breadcrumb.innerHTML = "";

    pathStack.forEach((item, index) => {

        const span = document.createElement("span");
        span.innerText = item.name;
        span.style.cursor = "pointer";

        span.onclick = async () => {

            // Cắt stack đúng vị trí
            pathStack = pathStack.slice(0, index + 1);

            currentFolder = item.id;

            const url = `https://www.googleapis.com/drive/v3/files?q='${item.id}'+in+parents+and+trashed=false&key=${API_KEY}&fields=files(id,name,mimeType)&orderBy=folder,name`;

            const res = await fetch(url);
            const data = await res.json();

            renderFiles(data.files || []);
            renderBreadcrumb();
        };

        breadcrumb.appendChild(span);

        if (index < pathStack.length - 1) {
            breadcrumb.appendChild(document.createTextNode(" / "));
        }
    });
}


/* =========================
   RESET KHI MỞ / ĐÓNG POPUP
========================= */
document.addEventListener("DOMContentLoaded", function () {

    const libraryLink = document.querySelector('a[href="#library-popup"]');
    const closeBtn = document.querySelector("#library-popup .tm-close-popup");

    // Khi mở popup → luôn về gốc
    if (libraryLink) {
        libraryLink.addEventListener("click", function () {
            loadFolder(ROOT_FOLDER_ID, "Thư viện", true);
        });
    }

    // Khi đóng popup → reset về gốc
    if (closeBtn) {
        closeBtn.addEventListener("click", function () {
            currentFolder = ROOT_FOLDER_ID;
            pathStack = [{ id: ROOT_FOLDER_ID, name: "Thư viện" }];
        });
    }
});