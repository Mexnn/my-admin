// รหัสผ่านที่เข้ารหัสแล้ว (Hash ของ "1234")
// ถ้าอยากเปลี่ยนรหัส ให้เข้าเว็บ "SHA256 Online" พิมพ์รหัสที่ต้องการ แล้วเอาโค้ดยาวๆ มาใส่ตรงนี้
const SECURE_HASH = "03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4"; 

function checkAuth() {
    const inputPass = document.getElementById('admin-pass').value;
    const errorMsg = document.getElementById('login-error');
    
    // แปลงรหัสที่พิมพ์มา เป็น Hash เพื่อเทียบกับตัวจริง
    hashString(inputPass).then(hash => {
        if (hash === SECURE_HASH) {
            // ถ้ารหัสถูก
            document.getElementById('login-section').style.display = 'none'; // ซ่อนหน้า Login
            document.getElementById('admin-content').style.display = 'block'; // โชว์หน้าแอดมิน
            
            // เริ่มโหลดข้อมูลสินค้า (เรียกฟังก์ชันจาก script.js)
            if (typeof loadProducts === "function") {
                loadProducts();
            }
        } else {
            // ถ้ารหัสผิด (แสดงตัวหนังสือแดงๆ ไม่ใช้ Alert แล้ว!)
            errorMsg.style.display = 'block';
            document.getElementById('admin-pass').value = '';
            document.getElementById('admin-pass').focus();
        }
    });
}

// ฟังก์ชันช่วยเข้ารหัส (ไม่ต้องแก้ตรงนี้)
async function hashString(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}