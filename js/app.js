let data;
let qrCode = new QRCode(document.getElementById("qrCode"), "");

function convertCSVtoArray(str) {
    let result = [];
    let tmp = str.split("\n");
 
    for (let i=0; i < tmp.length; ++i) {
        result[i] = tmp[i].split(",");
        for (let j=0; j < result[i].length; ++j) {
            if (result[i][j].endsWith("\r")) {
                result[i][j] = result[i][j].replaceAll('\r', "");
            }
            result[i][j] = result[i][j].slice(1, -1);
        }
    }

    if (result[result.length - 1] == "") {
        console.log("daketed");
        result.pop();
    }

    if (result[0].toString() != ["item_code", "item_code_seq", "tid"].toString()) {
        console.log(result[0]);
        alert("対応していない形式のCSVファイルです");
        return false;
    } else {   
        return result;
    }
}

function inputChange(e) {
    const csvFile = e.target.files[0];

    const reader = new FileReader();
    reader.readAsText(csvFile, "utf-8");
    reader.onload = function() {
        data = convertCSVtoArray(reader.result);
        if (data) {
            document.getElementById("labelText").innerText = csvFile.name;
            data.shift();
            hideError();
            displayTable(data);
        }
    }
}

function findProduct(productId, seq) {
    if (productId == "") {
        return data;
    }

    let result = [];
    if (productId) {
        for (const row of data) {
            if (row[0].toLowerCase().indexOf(productId.toLowerCase()) != -1) {
                if (seq) {
                    if (row[1] == seq) {
                        result.push(row);
                    }
                } else {
                    result.push(row);
                }
            }
        }
    }

    if (result.length == 0) {
        showNotfoundError();
    } else {
        hideError();
    }

    return result;
}

function displayTable(array) {
    const table = document.getElementById("table");
    table.innerHTML = "<tr><th>品番</th><th>枝番</th><th>探索用ID</th><th>QRコード</th></tr>";
    for (const row of array) {
        const tr = document.createElement("tr");
        for (const value of row) {
            const td = document.createElement("td");
            td.innerText = value;
            tr.appendChild(td);
        }
        // QRコード
        const qrCodeElem = document.createElement("td");
        qrCodeElem.innerHTML = '<i class="fa-solid fa-qrcode"></i>クリックして表示';
        tr.appendChild(qrCodeElem);
        tr.dataset.qrstr = row[2];
        tr.dataset.productid = row[0];
        tr.addEventListener("click", showQrCodeModal);
        table.appendChild(tr);
    }
}

function hideError() {
    document.getElementById("errorDialog").style.display = "none";
}

function showNotfoundError() {
    document.getElementById("errorImage").style.display = "block";
    document.getElementById("errorTitle").innerText = "見つかりません！";
    document.getElementById("errorMessage").style.display = "inline";
    document.getElementById("errorDialog").style.display = "flex";
}

function showQrCodeModal(e) {
    const qrStr = e.target.parentNode.dataset.qrstr;
    const productId = e.target.parentNode.dataset.productid;
    qrCode.makeCode(qrStr);
    document.getElementById("modalTitle").innerText = productId;
    document.getElementById("qrModal").showModal();
}

function printQrCodes() {
    
}

function printSingleQrCode(e) {
    e.preventDefault();

    iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";

    document.body.appendChild(iframe);

    const ifdoc  = iframe.contentDocument || iframe.contentWindow.document;
    // Firefox対応用
    ifdoc.open();
    ifdoc.close();

    ifdoc.body.appendChild(document.getElementById("modalTitle").cloneNode(true));
    ifdoc.body.appendChild(document.getElementById("qrCode").cloneNode(true));

    iframe.contentWindow.focus();
    iframe.contentWindow.print();
}

document.getElementById("csvFileSelecter").addEventListener("change", inputChange);
document.getElementById("printButton", printQrCodes);
document.getElementsByTagName("form")[1].addEventListener("input", function() {
    const productId = document.getElementById("productIdSearchBox").value;
    const seq = document.getElementById("seqSearchBox").value;
    const result = findProduct(productId, seq);
    displayTable(result);
});
document.getElementsByTagName("form")[1].addEventListener("reset", function() {
    hideError();
    displayTable(data);
});
document.getElementById("singleQrCodePrint").addEventListener("click", printSingleQrCode);