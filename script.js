const API_URL = "https://script.google.com/macros/s/AKfycbzdL2DbxQeJ6JCSxKvmNW_I_4aCrZwQQ-JUuB6sqVqD4ki3yIMQpbAjjQbJUq0H4qAL/exec"; 

let allProducts = [];
let isEditing = false;
let editingRow = null;

window.onload = function() {
    loadProducts();
};

function loadProducts() {
    const loading = document.getElementById('loading');
    if(loading) loading.style.display = 'block';
    
    fetch(API_URL)
        .then(res => res.json())
        .then(data => {
            allProducts = data;
            renderTable(data);
            if(loading) loading.style.display = 'none';
        })
        .catch(err => {
            console.error(err);
            if(loading) loading.innerText = "❌ ไม่สามารถโหลดข้อมูลได้";
        });
}

function renderTable(products) {
    const listDiv = document.getElementById('product-list');
    listDiv.innerHTML = "";

    products.forEach(item => {
        const card = document.createElement('div');
        card.style = "border:1px solid #ddd; padding:15px; margin-bottom:10px; border-radius:8px; display:flex; align-items:center; gap:15px; background:white;";

        const imgDisplay = item.ImageURL ? `<img src="${item.ImageURL}" style="width:60px; height:60px; object-fit:cover; border-radius:5px;">` : `<div style="width:60px; height:60px; background:#eee; border-radius:5px;"></div>`;

        const info = `
            <div style="flex:1;">
                <div style="font-weight:bold; font-size:16px;">${item.Name}</div>
                <div style="color:#27ae60;">${item.Price} บาท / ${item.Unit}</div>
                <div style="font-size:12px; color:#7f8c8d;">หนัก: ${item.Weight}g | สต็อก: ${item.Stock}</div>
            </div>
        `;

        const actions = `
            <div>
                <button class="btn-edit" onclick="editProduct('${item.row}')" style="background:#f1c40f; border:none; padding:5px 8px; border-radius:4px; cursor:pointer;">✏️</button>
                <button class="btn-delete" onclick="deleteProduct('${item.row}')" style="background:#ff6b6b; border:none; padding:5px 8px; border-radius:4px; cursor:pointer; margin-left:5px;">🗑️</button>
            </div>
        `;

        card.innerHTML = imgDisplay + info + actions;
        listDiv.appendChild(card);
    });
}

function saveProduct() {
    const name = document.getElementById('pName').value;
    const price = document.getElementById('pPrice').value;
    const unit = document.getElementById('pUnit').value;
    const weight = document.getElementById('pWeight').value;
    const stock = document.getElementById('pStock').value;
    const detail = document.getElementById('pDetail').value;
    const fileInput = document.getElementById('pImgFile');
    const oldUrl = document.getElementById('pImgOldUrl').value;

    if (!name || !price || !unit) {
        alert("กรุณากรอกข้อมูลให้ครบถ้วน (ชื่อ, ราคา, หน่วยขาย)");
        return;
    }

    const saveBtn = document.getElementById('btn-save');
    saveBtn.innerText = "⏳ กำลังบันทึก...";
    saveBtn.disabled = true;

    if (fileInput.files.length > 0) {
        const reader = new FileReader();
        reader.readAsDataURL(fileInput.files[0]);
        reader.onload = function () {
            sendData(reader.result);
        };
    } else {
        sendData(isEditing ? oldUrl : "");
    }

    function sendData(imgData) {
        const payload = {
            action: isEditing ? "editProduct" : "addProduct",
            row: isEditing ? editingRow : null,
            name: name,
            price: price,
            unit: unit,
            weight: weight,
            stock: stock,
            detail: detail,
            image: imgData
        };

        fetch(API_URL, {
            method: "POST",
            body: JSON.stringify(payload)
        })
        .then(res => res.text())
        .then(result => {
            alert("✅ บันทึกข้อมูลสำเร็จ");
            resetForm();
            loadProducts();
        })
        .catch(err => alert("❌ ผิดพลาด: " + err))
        .finally(() => {
            saveBtn.innerText = "+ บันทึกสินค้า";
            saveBtn.disabled = false;
        });
    }
}

function deleteProduct(rowId) {
    if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบสินค้านี้?")) return;

    fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({ action: "deleteProduct", row: rowId })
    })
    .then(res => res.text())
    .then(result => {
        alert("🗑️ ลบข้อมูลเรียบร้อย");
        loadProducts();
    })
    .catch(err => alert("❌ ลบไม่สำเร็จ: " + err));
}

function editProduct(rowId) {
    const product = allProducts.find(p => p.row == rowId);
    if (!product) return;

    document.getElementById('pName').value = product.Name;
    document.getElementById('pPrice').value = product.Price;
    document.getElementById('pUnit').value = product.Unit;
    document.getElementById('pWeight').value = product.Weight;
    document.getElementById('pStock').value = product.Stock;
    document.getElementById('pDetail').value = product.Detail;
    document.getElementById('pImgOldUrl').value = product.ImageURL;

    const preview = document.getElementById('preview-img');
    if (product.ImageURL) {
        preview.src = product.ImageURL;
        preview.style.display = "block";
    }

    isEditing = true;
    editingRow = rowId;
    document.getElementById('btn-save').innerText = "💾 บันทึกการแก้ไข";
    document.getElementById('btn-cancel').style.display = "inline-block";
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetForm() {
    document.getElementById('pName').value = "";
    document.getElementById('pPrice').value = "";
    document.getElementById('pUnit').value = "";
    document.getElementById('pWeight').value = "";
    document.getElementById('pStock').value = "";
    document.getElementById('pDetail').value = "";
    document.getElementById('pImgFile').value = "";
    document.getElementById('preview-img').style.display = "none";
    isEditing = false;
    editingRow = null;
    document.getElementById('btn-save').innerText = "+ บันทึกสินค้า";
    document.getElementById('btn-cancel').style.display = "none";
}

function previewImage() {
    const file = document.getElementById('pImgFile').files[0];
    const preview = document.getElementById('preview-img');
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => { preview.src = e.target.result; preview.style.display = "block"; }
        reader.readAsDataURL(file);
    }
}