const ADMIN_PASSWORD = "1234"; // เปลี่ยนรหัสผ่านตรงนี้!

function checkAuth() {
    const inputPass = document.getElementById('admin-pass').value;
    if (inputPass === ADMIN_PASSWORD) {
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('admin-section').style.display = 'block';
    } else {
        alert("รหัสผ่านไม่ถูกต้อง!");
    }
}