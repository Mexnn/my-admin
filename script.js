// ⚠️ ใส่ Web App URL ของคุณที่นี่
const API_URL = "https://script.google.com/macros/s/AKfycbzdL2DbxQeJ6JCSxKvmNW_I_4aCrZwQQ-JUuB6sqVqD4ki3yIMQpbAjjQbJUq0H4qAL/exec";

let isEditing = false;
let editingRow = null;

window.onload = loadProducts;

// --- ส่วนจัดการรูปภาพ (ใหม่) ---
// ฟังก์ชันแสดงรูปตัวอย่างเมื่อเลือกไฟล์
function previewImage() {
    const fileInput = document.getElementById('pImgFile');
    const preview = document.getElementById('preview-img');
    
    if (fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.src = e.target.result;
            preview.style.display = 'inline-block'; // แสดงรูป
        }
        reader.readAsDataURL(fileInput.files[0]); // แปลงไฟล์เป็น Base64
    }
}

// ฟังก์ชันช่วยแปลงไฟล์เป็น Base64 แบบรอได้ (Promise)
function getBase64(file) {
    return new Promise((resolve, reject) => {
        if(!file) resolve(null); // ถ้าไม่มีไฟล์ให้ออกไปเลย
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}
// ---------------------------


async function loadProducts() {
    // ... (ส่วนนี้เหมือนเดิม 100% ก๊อปปี้จากอันเก่ามาใส่ได้เลยครับ เพื่อความกระชับผมขอละไว้) ...
    // แต่จุดที่ต้องแก้คือ ใน loop ที่สร้างตาราง ให้เอาส่วนแสดง Category ออกครับ
    // html += `... <span style="background:#E8F5E9;..."> ${cat} </span> ...`  <-- บรรทัดนี้ลบทิ้งครับ
     const listDiv = document.getElementById('product-list');
    const loading = document.getElementById('loading');
    
    loading.style.display = 'block';
    listDiv.innerHTML = '';

    try {
        const response = await fetch(API_URL);
        const products = await response.json();

        if (products.length === 0) {
            listDiv.innerHTML = '<p style="text-align:center;">ยังไม่มีสินค้า</p>';
            loading.style.display = 'none';
            return;
        }
        products.reverse();

        let html = '<table style="width:100%; border-collapse: collapse; font-size: 14px;">';
        html += '<thead style="background:#2E7D32; color:white;"><tr><th style="padding:10px;">รูป</th><th>สินค้า</th><th>ราคา/สต็อก</th><th>จัดการ</th></tr></thead><tbody>';

        products.forEach(p => {
            // เอา cat ออกจากตรงนี้
            html += `
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding:10px; text-align:center; vertical-align: top;">
                    <img src="${p.ImageURL}" 
                         style="width:60px; height:60px; object-fit:cover; border-radius:8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" 
                         onerror="this.src='https://placehold.co/60x60?text=No+Img'">
                </td>
                <td style="vertical-align: top; padding-top: 10px;">
                    <div style="font-weight:bold; font-size: 16px; margin-top: 4px;">${p.Name}</div>
                    <div style="color:#7f8c8d; font-size:12px;">${p.Detail || '-'}</div>
                </td>
                <td style="vertical-align: top; padding-top: 10px;">
                    <div style="font-weight:bold; color:#d35400;">${p.Price} บ. / ${p.Unit}</div>
                    <div style="font-size:12px; margin-top:4px;">📦 คงเหลือ: <b>${p.Stock}</b></div>
                </td>
                <td style="text-align:center; vertical-align: middle;">
                    <button onclick="startEdit(${p.row}, '${p.Name}', '${p.Price}', '${p.Unit}', '${p.Weight}', '${p.Stock}', '${p.Detail}', '${p.ImageURL}')" 
                        style="padding:6px 10px; background:#Fbc02d; color:white; border:none; border-radius:6px; cursor:pointer; margin-bottom:5px;">✏️</button>
                    <button onclick="deleteProduct(${p.row})" 
                        style="padding:6px 10px; background:#e74c3c; color:white; border:none; border-radius:6px; cursor:pointer;">🗑️</button>
                </td>
            </tr>`;
        });
        html += '</tbody></table>';
        listDiv.innerHTML = html;
    } catch (error) {
        console.error(error);
        listDiv.innerHTML = '<p style="color:red; text-align:center;">โหลดข้อมูลไม่สำเร็จ</p>';
    } finally {
        loading.style.display = 'none';
    }
}


// 2. ฟังก์ชันบันทึก (อัปเกรด)
async function saveProduct() {
    const btn = document.getElementById('btn-save');
    const status = document.getElementById('status-msg');
    
    const name = document.getElementById('pName').value;
    const price = document.getElementById('pPrice').value;
    // ... (ดึงค่าอื่นๆ เหมือนเดิม ยกเว้น Category) ...
    const unit = document.getElementById('pUnit').value;
    const weight = document.getElementById('pWeight').value;
    const stock = document.getElementById('pStock').value;
    const detail = document.getElementById('pDetail').value;

    // --- ส่วนจัดการรูปภาพ ---
    const fileInput = document.getElementById('pImgFile');
    const oldUrl = document.getElementById('pImgOldUrl').value;
    let imagePayload;

    if (!name || !price) { alert("กรุณากรอกชื่อและราคา"); return; }

    btn.disabled = true;
    btn.innerText = "⏳ กำลังประมวลผลรูปภาพ...";
    status.innerText = "กำลังเตรียมไฟล์...";

    try {
        // ถ้ามีการเลือกไฟล์ใหม่ ให้แปลงเป็น Base64
        if (fileInput.files.length > 0) {
            imagePayload = await getBase64(fileInput.files[0]);
        } else {
            // ถ้าไม่ได้เลือกไฟล์ใหม่ ให้ใช้ URL เดิม (กรณีแก้ไข)
            imagePayload = oldUrl;
        }

        status.innerText = "กำลังส่งข้อมูลและอัปโหลด...";
        
        const payload = {
            action: isEditing ? "editProduct" : "addProduct",
            row: editingRow,
            name: name, price: price, unit: unit, weight: weight, stock: stock,
            // category เอาออกแล้ว
            detail: detail,
            image: imagePayload // ส่งรหัสรูปภาพ (หรือ URL เดิม) ไป
        };
        
        await fetch(API_URL, { method: "POST", mode: "no-cors", body: JSON.stringify(payload) });

        status.innerText = "✅ บันทึกสำเร็จ! (ถ้ามีรูปใหม่อาจใช้เวลาสักครู่)";
        status.style.color = "green";
        
        resetForm();
        setTimeout(() => { status.innerText = ""; loadProducts(); }, 2000); // รอนานขึ้นนิดนึงเผื่ออัปรูป

    } catch (error) {
        status.innerText = "❌ เกิดข้อผิดพลาด: รูปอาจจะใหญ่เกินไป";
        status.style.color = "red";
        console.error(error);
    } finally {
        btn.disabled = false;
        btn.innerText = "+ บันทึกสินค้า";
    }
}

// 3. เริ่มแก้ไข (อัปเดต)
function startEdit(row, name, price, unit, weight, stock, detail, img) { // เอา cat ออกจาก arg
    isEditing = true;
    editingRow = row;
    
    document.getElementById('pName').value = name;
    document.getElementById('pPrice').value = price;
    document.getElementById('pUnit').value = unit;
    document.getElementById('pWeight').value = weight;
    document.getElementById('pStock').value = stock;
    // document.getElementById('pCategory').value = category; // เอาออก
    document.getElementById('pDetail').value = detail === 'undefined' ? '' : detail;
    
    // ตั้งค่ารูปภาพ
    document.getElementById('pImgOldUrl').value = img; // เก็บ URL เดิมไว้
    document.getElementById('preview-img').src = img; // แสดงรูปเดิม
    document.getElementById('preview-img').style.display = 'inline-block';
    document.getElementById('pImgFile').value = ""; // รีเซ็ตช่องเลือกไฟล์

    const btnSave = document.getElementById('btn-save');
    btnSave.innerText = "💾 บันทึกการแก้ไข";
    btnSave.style.background = "#Fbc02d";
    document.getElementById('btn-cancel').style.display = "inline-block";
    
    document.querySelector('.container').scrollIntoView({ behavior: 'smooth' });
}

// 4. ลบสินค้า (เหมือนเดิม)
async function deleteProduct(row) {
    if(!confirm("⚠️ ยืนยันที่จะลบสินค้านี้?")) return;
    document.getElementById('loading').style.display = 'block';
    await fetch(API_URL, { method: "POST", mode: "no-cors", body: JSON.stringify({ action: "deleteProduct", row: row }) });
    setTimeout(() => { alert("ลบเรียบร้อย"); loadProducts(); }, 1000);
}

// 5. ล้างฟอร์ม (อัปเดต)
function resetForm() {
    isEditing = false;
    editingRow = null;
    document.querySelectorAll('input[type=text], input[type=number], textarea').forEach(i => i.value = '');
    document.getElementById('pUnit').selectedIndex = 0;
    // document.getElementById('pCategory').selectedIndex = 0; // เอาออก

    // ล้างค่ารูปภาพ
    document.getElementById('pImgFile').value = "";
    document.getElementById('pImgOldUrl').value = "";
    document.getElementById('preview-img').src = "";
    document.getElementById('preview-img').style.display = "none";

    
    const btnSave = document.getElementById('btn-save');
    btnSave.innerText = "+ บันทึกสินค้า";
    btnSave.style.background = ""; 
    document.getElementById('btn-cancel').style.display = "none";
}