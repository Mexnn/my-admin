// ⚠️ ตรวจสอบ URL นี้ให้เป็นอันล่าสุดของคุณ
const API_URL = "https://script.google.com/macros/s/AKfycbzdL2DbxQeJ6JCSxKvmNW_I_4aCrZwQQ-JUuB6sqVqD4ki3yIMQpbAjjQbJUq0H4qAL/exec"; 

let allProducts = [];
let isEditing = false;
let editingRow = null;
let confirmCallback = null; 

window.onload = function() {
    loadProducts();
    setupModal(); // เริ่มต้นระบบ Modal
};

// ---------------- ระบบ Modal (Popup) ----------------
function setupModal() {
    // ผูกปุ่มใน Modal ให้ทำงานเมื่อกด
    document.getElementById('btn-modal-cancel').onclick = closeModal;
    document.getElementById('btn-modal-confirm').onclick = () => {
        if (confirmCallback) confirmCallback(); // ถ้ามีคำสั่งที่ฝากไว้ (เช่น ลบ) ให้ทำ
        closeModal();
    };
}

function showModal(title, message, icon, type, callback) {
    // 1. ใส่ข้อความลงใน Modal
    document.getElementById('modal-title').innerText = title;
    document.getElementById('modal-message').innerText = message;
    document.getElementById('modal-icon').innerText = icon;
    
    const confirmBtn = document.getElementById('btn-modal-confirm');
    const cancelBtn = document.getElementById('btn-modal-cancel');
    
    confirmCallback = callback; // จำคำสั่งที่จะให้ทำต่อ

    // 2. ปรับปุ่มตามประเภท (แจ้งเตือน vs ยืนยัน)
    if (type === 'confirm') {
        // แบบถามยืนยัน (เช่น ลบ) -> มีปุ่มยกเลิก
        cancelBtn.style.display = 'inline-block';
        confirmBtn.innerText = 'ยืนยันทำรายการ';
        confirmBtn.className = 'btn-modal btn-confirm-red'; // ปุ่มแดง
    } else {
        // แบบแจ้งเตือนเฉยๆ -> ไม่มีปุ่มยกเลิก
        cancelBtn.style.display = 'none';
        confirmBtn.innerText = 'ตกลง';
        confirmBtn.className = 'btn-modal btn-confirm-green'; // ปุ่มเขียว
    }

    // 3. แสดง Modal ออกมา
    document.getElementById('custom-modal').classList.add('show');
}

function closeModal() {
    document.getElementById('custom-modal').classList.remove('show');
}
// ---------------- จบระบบ Modal ----------------

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
            if(loading) loading.innerText = "โหลดข้อมูลไม่สำเร็จ";
        });
}

function renderTable(products) {
    const listDiv = document.getElementById('product-list');
    listDiv.innerHTML = "";

    products.forEach(item => {
        const card = document.createElement('div');
        card.style = "border:1px solid #eee; padding:15px; margin-bottom:15px; border-radius:12px; display:flex; align-items:center; gap:15px; background:white; box-shadow: 0 4px 6px rgba(0,0,0,0.05);";

        const statusBadge = item.Status === "In Stock" 
            ? `<span class="status-badge status-ok">พร้อมขาย</span>` 
            : `<span class="status-badge status-out">หมดชั่วคราว</span>`;

        const imgDisplay = item.ImageURL 
            ? `<img src="${item.ImageURL}" style="width:70px; height:70px; object-fit:cover; border-radius:8px;">` 
            : `<div style="width:70px; height:70px; background:#f0f0f0; border-radius:8px; display:flex; align-items:center; justify-content:center; color:#ccc; font-size:12px;">No Img</div>`;

        const info = `
            <div style="flex:1;">
                <div style="font-weight:600; font-size:16px; margin-bottom:4px; color:#2c3e50;">${item.Name} ${statusBadge}</div>
                <div style="color:#27ae60; font-size:14px;">ราคา: ${item.Price} บาท / ${item.Unit}</div>
            </div>
        `;

        const actions = `
            <div style="display:flex; gap:8px;">
                <button onclick="editProduct('${item.row}')" style="background:#f39c12; color:white; border:none; padding:8px 12px; border-radius:6px; cursor:pointer; font-size:14px;">✏️</button>
                <button onclick="deleteProduct('${item.row}')" style="background:#e74c3c; color:white; border:none; padding:8px 12px; border-radius:6px; cursor:pointer; font-size:14px;">🗑️</button>
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
    const status = document.getElementById('pStatus').value;
    const detail = document.getElementById('pDetail').value;
    const fileInput = document.getElementById('pImgFile');
    const oldUrl = document.getElementById('pImgOldUrl').value;

    if (!name || !price) {
        // เรียกใช้ Popup แจ้งเตือน
        showModal("ข้อมูลไม่ครบ", "กรุณากรอกชื่อสินค้าและราคาให้ครบถ้วน", "📝", "alert");
        return;
    }

    const saveBtn = document.getElementById('btn-save');
    saveBtn.innerText = "⏳ กำลังบันทึก...";
    saveBtn.disabled = true;

    if (fileInput.files.length > 0) {
        const reader = new FileReader();
        reader.readAsDataURL(fileInput.files[0]);
        reader.onload = function () { sendData(reader.result); };
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
            status: status,
            detail: detail,
            image: imgData
        };

        fetch(API_URL, { method: "POST", body: JSON.stringify(payload) })
        .then(res => res.text())
        .then(() => {
            // เรียกใช้ Popup แจ้งสำเร็จ
            showModal("สำเร็จ!", "บันทึกข้อมูลสินค้าเรียบร้อยแล้ว", "✅", "alert");
            resetForm();
            loadProducts();
        })
        .catch(err => {
            showModal("เกิดข้อผิดพลาด", "ไม่สามารถบันทึกข้อมูลได้: " + err, "❌", "alert");
        })
        .finally(() => {
            saveBtn.innerText = "+ บันทึกสินค้า";
            saveBtn.disabled = false;
        });
    }
}

function deleteProduct(rowId) {
    // จุดสำคัญ: ตรงนี้เรียก showModal แทน window.confirm ของเดิม
    showModal(
        "ยืนยันการลบ", 
        "คุณต้องการลบสินค้านี้ออกจากสต็อกใช่หรือไม่? \n(การกระทำนี้ไม่สามารถย้อนกลับได้)", 
        "🗑️", 
        "confirm", 
        function() {
            // โค้ดในนี้จะทำงานก็ต่อเมื่อกดปุ่ม "ยืนยันทำรายการ" ใน Popup เท่านั้น
            fetch(API_URL, { method: "POST", body: JSON.stringify({ action: "deleteProduct", row: rowId }) })
            .then(() => { 
                loadProducts(); 
                showModal("ลบสำเร็จ", "ลบข้อมูลสินค้าเรียบร้อยแล้ว", "✅", "alert");
            });
        }
    );
}

function editProduct(rowId) {
    const product = allProducts.find(p => p.row == rowId);
    if (!product) return;

    document.getElementById('pName').value = product.Name;
    document.getElementById('pPrice').value = product.Price;
    document.getElementById('pUnit').value = product.Unit;
    document.getElementById('pStatus').value = product.Status || "In Stock";
    document.getElementById('pDetail').value = product.Detail;
    document.getElementById('pImgOldUrl').value = product.ImageURL;

    const preview = document.getElementById('preview-img');
    if (product.ImageURL) { preview.src = product.ImageURL; preview.style.display = "block"; }

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
    document.getElementById('pDetail').value = "";
    document.getElementById('pImgFile').value = "";
    document.getElementById('preview-img').style.display = "none";
    document.getElementById('pStatus').value = "In Stock";
    
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