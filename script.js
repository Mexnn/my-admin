// ใส่ URL ของคุณตรงนี้
const API_URL = "https://script.google.com/macros/s/AKfycbwAAw7DEahdTuP9uwjIJ-OeFSz0mvJkUCM3QE5svLNL0LVLsYbXMlUkRP6k8eoL9mBW/exec";

async function addProduct() {
    const btn = document.getElementById('btn-save');
    const status = document.getElementById('status-msg');
    
    // ดึงค่าทั้งหมดจากฟอร์ม
    const name = document.getElementById('pName').value;
    const price = document.getElementById('pPrice').value;
    const stock = document.getElementById('pStock').value;
    const weight = document.getElementById('pWeight').value;
    const category = document.getElementById('pCategory').value;
    const detail = document.getElementById('pDetail').value;
    const image = document.getElementById('pImg').value;

    // เช็คว่ากรอกครบไหม (บังคับชื่อ, ราคา, สต็อก)
    if (!name || !price || !stock) {
        status.style.color = "red";
        status.innerText = "กรุณากรอกชื่อ, ราคา และจำนวนสต็อกให้ครบถ้วน";
        return;
    }

    const payload = {
        action: "addProduct",
        name: name,
        price: price,
        stock: stock,
        weight: weight,
        category: category,
        detail: detail,
        image: image
    };

    try {
        btn.disabled = true;
        btn.innerText = "กำลังบันทึก...";
        status.style.color = "blue";
        status.innerText = "กำลังส่งข้อมูล...";

        const response = await fetch(API_URL, {
            method: "POST",
            mode: "no-cors",
            body: JSON.stringify(payload)
        });

        status.style.color = "green";
        status.innerText = "✅ บันทึกสำเร็จเรียบร้อย!";
        
        // เคลียร์ค่าในฟอร์มให้ว่าง พร้อมกรอกตัวต่อไป
        document.getElementById('pName').value = "";
        document.getElementById('pPrice').value = "";
        document.getElementById('pStock').value = "";
        document.getElementById('pWeight').value = "";
        document.getElementById('pDetail').value = "";
        document.getElementById('pImg').value = "";
        
    } catch (error) {
        status.style.color = "red";
        status.innerText = "เกิดข้อผิดพลาด: " + error.message;
    } finally {
        btn.disabled = false;
        btn.innerText = "+ บันทึกสินค้าลงระบบ";
    }
}