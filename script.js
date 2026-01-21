const API_URL = "https://script.google.com/macros/s/AKfycbwAAw7DEahdTuP9uwjIJ-OeFSz0mvJkUCM3QE5svLNL0LVLsYbXMlUkRP6k8eoL9mBW/exec"; //

async function addProduct() {
    const btn = document.getElementById('btn-save');
    const status = document.getElementById('status-msg');
    
    const payload = {
        action: "addProduct",
        name: document.getElementById('pName').value,
        price: document.getElementById('pPrice').value,
        unit: document.getElementById('pUnit').value,
        weight: document.getElementById('pWeight').value,
        stock: document.getElementById('pStock').value,
        detail: document.getElementById('pDetail').value,
        image: document.getElementById('pImg').value
    };

    if (!payload.name || !payload.price) {
        alert("กรุณาระบุชื่อและราคาผักด้วยครับ");
        return;
    }

    try {
        btn.disabled = true;
        btn.innerText = "กำลังบันทึก...";
        
        await fetch(API_URL, {
            method: "POST",
            mode: "no-cors",
            body: JSON.stringify(payload)
        });

        status.innerText = "✅ บันทึกผักใหม่ลงสต็อกแล้ว!";
        status.style.color = "green";
        // ล้างข้อมูลในฟอร์ม...
    } catch (e) {
        status.innerText = "❌ ผิดพลาด: " + e;
    } finally {
        btn.disabled = false;
        btn.innerText = "+ ลงสินค้าผัก";
    }
}