// ⚠️ สำคัญ: เอา URL Web App จาก Google Apps Script มาใส่ตรงนี้
const API_URL = "https://script.google.com/macros/s/AKfycbwAAw7DEahdTuP9uwjIJ-OeFSz0mvJkUCM3QE5svLNL0LVLsYbXMlUkRP6k8eoL9mBW/exec";

// ตัวแปรสำหรับเช็กสถานะการแก้ไข
let isEditing = false;
let editingRow = null;

// เมื่อเปิดเว็บขึ้นมา ให้โหลดรายการสินค้าทันที (ถ้าล็อกอินแล้ว)
// แต่เนื่องจากเรามี auth.js มันจะโหลดหลังจาก login ผ่าน
// เราจึงสร้างฟังก์ชันนี้ไว้ให้เรียกใช้
async function loadProducts() {
    const listDiv = document.getElementById('product-list');
    const loading = document.getElementById('loading');
    
    loading.style.display = 'block';
    listDiv.innerHTML = ''; // เคลียร์ของเก่า

    try {
        const response = await fetch(API_URL);
        const products = await response.json();

        if (products.length === 0) {
            listDiv.innerHTML = '<p style="text-align:center;">ยังไม่มีสินค้าในระบบ</p>';
            loading.style.display = 'none';
            return;
        }

        // สร้างตาราง
        let html = '<table style="width:100%; border-collapse: collapse; font-size: 14px;">';
        html += '<thead style="background:#27ae60; color:white;"><tr><th style="padding:10px;">รูป</th><th>ชื่อผัก</th><th>ราคา/สต็อก</th><th>จัดการ</th></tr></thead><tbody>';

        products.forEach(p => {
            html += `
            <tr style="border-bottom: 1px solid #ddd;">
                <td style="padding:10px; text-align:center;">
                    <img src="${p.ImageURL}" style="width:50px; height:50px; object-fit:cover; border-radius:4px;" onerror="this.src='https://placehold.co/50x50?text=No+Img'">
                </td>
                <td>
                    <strong>${p.Name}</strong><br>
                    <span style="color:#7f8c8d; font-size:12px;">${p.Detail || '-'}</span>
                </td>
                <td>
                    <div style="font-weight:bold; color:#27ae60;">${p.Price} บ. / ${p.Unit}</div>
                    <div style="font-size:12px;">คลัง: ${p.Stock}</div>
                </td>
                <td style="text-align:center;">
                    <button onclick="startEdit(${p.row}, '${p.Name}', '${p.Price}', '${p.Unit}', '${p.Weight}', '${p.Stock}', '${p.Detail}', '${p.ImageURL}')" 
                        style="padding:5px 10px; background:#f39c12; color:white; border:none; border-radius:4px; cursor:pointer; margin-bottom:5px;">✏️</button>
                    <button onclick="deleteProduct(${p.row})" 
                        style="padding:5px 10px; background:#c0392b; color:white; border:none; border-radius:4px; cursor:pointer;">🗑️</button>
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

// ฟังก์ชันหลัก: บันทึกสินค้า (ทั้งเพิ่มใหม่ และ แก้ไข)
async function addProduct() {
    const btn = document.getElementById('btn-save');
    const status = document.getElementById('status-msg');
    
    // ดึงค่าจากฟอร์ม
    const name = document.getElementById('pName').value;
    const price = document.getElementById('pPrice').value;
    const unit = document.getElementById('pUnit').value;
    const weight = document.getElementById('pWeight').value;
    const stock = document.getElementById('pStock').value;
    const detail = document.getElementById('pDetail').value;
    const image = document.getElementById('pImg').value;

    if (!name || !price) {
        alert("กรุณากรอกชื่อผักและราคาให้ครบถ้วน");
        return;
    }

    // เตรียมข้อมูลส่ง
    const payload = {
        action: isEditing ? "editProduct" : "addProduct", // ตรวจสอบว่าจะเพิ่มหรือแก้
        row: editingRow, // ส่งเลขบรรทัดไปด้วยถ้าแก้ไข
        name: name,
        price: price,
        unit: unit,
        weight: weight,
        stock: stock,
        detail: detail,
        image: image
    };

    try {
        btn.disabled = true;
        btn.innerText = "กำลังประมวลผล...";
        status.innerText = "⏳ กำลังส่งข้อมูล...";
        status.style.color = "blue";

        await fetch(API_URL, {
            method: "POST",
            mode: "no-cors",
            body: JSON.stringify(payload)
        });

        status.innerText = isEditing ? "✅ แก้ไขข้อมูลเรียบร้อย!" : "✅ ลงสินค้าใหม่เรียบร้อย!";
        status.style.color = "green";
        
        resetForm();     // ล้างฟอร์ม
        
        // รอ 1 วินาทีแล้วโหลดตารางใหม่
        setTimeout(() => {
            status.innerText = "";
            loadProducts(); 
        }, 1000);

    } catch (error) {
        status.innerText = "❌ เกิดข้อผิดพลาด: " + error.message;
        status.style.color = "red";
    } finally {
        btn.disabled = false;
        btn.innerText = isEditing ? "บันทึกการแก้ไข" : "+ ลงสินค้าผัก";
    }
}

// ฟังก์ชันเริ่มแก้ไข (ดึงข้อมูลขึ้นไปบนฟอร์ม)
function startEdit(row, name, price, unit, weight, stock, detail, img) {
    isEditing = true;
    editingRow = row;
    
    // ใส่ข้อมูลกลับเข้าไปในช่อง
    document.getElementById('pName').value = name;
    document.getElementById('pPrice').value = price;
    document.getElementById('pUnit').value = unit;
    document.getElementById('pWeight').value = weight;
    document.getElementById('pStock').value = stock;
    document.getElementById('pDetail').value = detail;
    document.getElementById('pImg').value = img;
    
    // ปรับปุ่ม
    const btnSave = document.getElementById('btn-save');
    btnSave.innerText = "บันทึกการแก้ไข";
    btnSave.style.backgroundColor = "#f39c12"; // สีส้ม
    document.getElementById('btn-cancel').style.display = "inline-block";
    
    // เลื่อนหน้าจอขึ้นไปหาฟอร์ม
    document.querySelector('.container').scrollIntoView({ behavior: 'smooth' });
}

// ฟังก์ชันลบสินค้า
async function deleteProduct(row) {
    if(!confirm("⚠️ ยืนยันที่จะลบรายการนี้ใช่ไหม?")) return;

    // แสดงสถานะว่ากำลังลบ
    const listDiv = document.getElementById('product-list');
    listDiv.style.opacity = "0.5";

    await fetch(API_URL, {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify({ action: "deleteProduct", row: row })
    });
    
    alert("ลบข้อมูลเรียบร้อยแล้ว");
    listDiv.style.opacity = "1";
    loadProducts(); // โหลดตารางใหม่
}

// ฟังก์ชันล้างฟอร์ม / ยกเลิก
function resetForm() {
    isEditing = false;
    editingRow = null;
    
    // ล้างค่าใน input ทุกช่อง
    document.querySelectorAll('input, textarea').forEach(input => input.value = '');
    document.getElementById('pUnit').selectedIndex = 0; // รีเซ็ต Dropdown

    // คืนค่าปุ่ม
    const btnSave = document.getElementById('btn-save');
    btnSave.innerText = "+ ลงสินค้าผัก";
    btnSave.style.backgroundColor = ""; // กลับเป็นสีเดิม (ใน CSS)
    document.getElementById('btn-cancel').style.display = "none";
}