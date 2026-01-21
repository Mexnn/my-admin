// นำ Web App URL ที่ได้จากขั้นตอนที่ 1.3 มาใส่ที่นี่
const API_URL = "https://script.google.com/macros/s/AKfycbwAAw7DEahdTuP9uwjIJ-OeFSz0mvJkUCM3QE5svLNL0LVLsYbXMlUkRP6k8eoL9mBW/exec"; 

async function addProduct() {
    const btn = document.getElementById('btn-save');
    const status = document.getElementById('status-msg');
    
    // ดึงค่าจากฟอร์ม
    const name = document.getElementById('pName').value;
    const price = document.getElementById('pPrice').value;
    const detail = document.getElementById('pDetail').value;
    const image = document.getElementById('pImg').value;

    // Validation เบื้องต้นเพื่อประสิทธิภาพ (ไม่ต้องส่งค่าว่างไปหา Server)
    if (!name || !price) {
        status.style.color = "red";
        status.innerText = "กรุณากรอกชื่อและราคาสินค้า";
        return;
    }

    const payload = {
        action: "addProduct",
        name: name,
        price: price,
        detail: detail,
        image: image
    };

    try {
        btn.disabled = true; // ป้องกันการกดซ้ำ (Performance & Data Integrity)
        status.style.color = "blue";
        status.innerText = "กำลังบันทึกข้อมูล...";

        const response = await fetch(API_URL, {
            method: "POST",
            mode: "no-cors", // จำเป็นสำหรับการคุยกับ Google Apps Script
            body: JSON.stringify(payload)
        });

        status.style.color = "green";
        status.innerText = "บันทึกสินค้าเรียบร้อยแล้ว!";
        
        // ล้างฟอร์ม
        document.getElementById('pName').value = "";
        document.getElementById('pPrice').value = "";
        document.getElementById('pDetail').value = "";
        document.getElementById('pImg').value = "";

    } catch (error) {
        status.style.color = "red";
        status.innerText = "เกิดข้อผิดพลาด: " + error.message;
    } finally {
        btn.disabled = false;
    }
}