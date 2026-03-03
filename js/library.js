const API_KEY = "AIzaSyDqTM8uhkRNginApTdMI0Wvq3IvmXYS81c";
const ROOT_FOLDER_ID = "1b-vgHsXEETOD5uIROhcH7DI5mzFlMr5M";

let currentFolder = ROOT_FOLDER_ID;
let pathStack = [];

/* ================= LOAD FOLDER ================= */
async function loadFolder(folderId, folderName = "Thư viện", reset = false) {

    if (reset) {
        pathStack = [{ id: ROOT_FOLDER_ID, name: "Thư viện" }];
    } else {
        const last = pathStack[pathStack.length - 1];
        if (!last || last.id !== folderId) {
            pathStack.push({ id: folderId, name: folderName });
        }
    }

    currentFolder = folderId;

    const url =
        `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents+and+trashed=false` +
        `&key=${API_KEY}&fields=files(id,name,mimeType)&orderBy=folder,name`;

    try {
        const res = await fetch(url);
        const data = await res.json();
        renderFiles(data.files || []);
        renderBreadcrumb();
    } catch (err) {
        document.getElementById("library").innerHTML =
            "<p style='padding:20px'>Không tải được dữ liệu.</p>";
    }
}


/* ================= RENDER FILES ================= */
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
                    <i class="fas fa-folder folder-icon"></i>
                    <span class="folder-name">${file.name}</span>
                </div>
            `;

            div.onclick = () => loadFolder(file.id, file.name);
        }

        // ===== FILE =====
        else {

            div.className = "library-item library-file";

            const icon = getFileIcon(file.name);

            div.innerHTML = `
                <div class="library-left">
                    <i class="fas ${icon} file-icon"></i>
                    <span>${file.name}</span>
                </div>

                <div class="library-actions">
                    <button class="view-btn"
                        onclick="openPreview('${file.id}')">
                        <i class="fas fa-eye"></i> Xem
                    </button>

                    <a class="download-btn"
                       href="https://drive.google.com/uc?id=${file.id}&export=download"
                       target="_blank">
                       <i class="fas fa-download"></i> Tải
                    </a>
                </div>
            `;
        }

        container.appendChild(div);
    });
}


/* ================= ICON THEO FILE ================= */
function getFileIcon(name) {

    const ext = name.split(".").pop().toLowerCase();

    if (["jpg", "jpeg", "png", "gif"].includes(ext)) return "fa-file-image";
    if (["pdf"].includes(ext)) return "fa-file-pdf";
    if (["doc", "docx"].includes(ext)) return "fa-file-word";
    if (["xls", "xlsx"].includes(ext)) return "fa-file-excel";
    if (["ppt", "pptx"].includes(ext)) return "fa-file-powerpoint";

    return "fa-file-alt";
}


/* ================= BREADCRUMB ================= */
function renderBreadcrumb() {

    const breadcrumb = document.getElementById("breadcrumb");
    breadcrumb.innerHTML = "";

    pathStack.forEach((item, index) => {

        const span = document.createElement("span");
        span.innerText = item.name;
        span.className = "breadcrumb-item";

        span.onclick = async () => {

            pathStack = pathStack.slice(0, index + 1);
            currentFolder = item.id;

            const url =
                `https://www.googleapis.com/drive/v3/files?q='${item.id}'+in+parents+and+trashed=false` +
                `&key=${API_KEY}&fields=files(id,name,mimeType)&orderBy=folder,name`;

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


/* ================= PREVIEW MODAL ================= */
function openPreview(fileId) {

    const modal = document.getElementById("previewModal");
    const frame = document.getElementById("previewFrame");

    frame.src = `https://drive.google.com/file/d/${fileId}/preview`;
    modal.style.display = "flex";
}

function closePreview() {
    document.getElementById("previewModal").style.display = "none";
    document.getElementById("previewFrame").src = "";
}


/* ================= RESET POPUP ================= */
document.addEventListener("DOMContentLoaded", function () {

    const libraryLink = document.querySelector('a[href="#library-popup"]');
    const closeBtn = document.querySelector("#library-popup .tm-close-popup");

    if (libraryLink) {
        libraryLink.addEventListener("click", function () {
            loadFolder(ROOT_FOLDER_ID, "Thư viện", true);
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener("click", function () {
            currentFolder = ROOT_FOLDER_ID;
            pathStack = [{ id: ROOT_FOLDER_ID, name: "Thư viện" }];
        });
    }
});