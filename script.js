// ======================== DATA STORAGE ========================
let participants = [];
let editId = null;

// Load / Save localStorage
function loadFromStorage() {
    const stored = localStorage.getItem("univ_pendaftaran");
    if (stored) {
        participants = JSON.parse(stored);
    } else {
        // Data awal (demo)
        participants = [
            { id: 1, nim: "202411001", nama: "Ahmad Fauzi", kode: "A3", jenisKelamin: "Laki-laki", asalSekolah: "SMA 1 Pamulang", nilaiMat: 85, nilaiBindo: 78, nilaiInggris: 80, rataRata: 81, keterangan: "Lulus" },
            { id: 2, nim: "202411002", nama: "Siti Nurhaliza", kode: "B7", jenisKelamin: "Perempuan", asalSekolah: "SMAN 2 Tangerang", nilaiMat: 65, nilaiBindo: 70, nilaiInggris: 68, rataRata: 67.67, keterangan: "Cadangan" },
            { id: 3, nim: "202411003", nama: "Budi Santoso", kode: "V1", jenisKelamin: "Laki-laki", asalSekolah: "SMA Cendekia", nilaiMat: 45, nilaiBindo: 50, nilaiInggris: 48, rataRata: 47.67, keterangan: "Tidak Lulus" }
        ];
        syncStorage();
    }
    renderStatistik();
    renderTable();
}

function syncStorage() {
    localStorage.setItem("univ_pendaftaran", JSON.stringify(participants));
}

// ========== HITUNG RATA & KETERANGAN ==========
function hitungRataDanKeterangan() {
    let mat = parseFloat(document.getElementById('mat').value) || 0;
    let bindo = parseFloat(document.getElementById('bindo').value) || 0;
    let bing = parseFloat(document.getElementById('binggris').value) || 0;
    mat = Math.min(100, Math.max(0, mat));
    bindo = Math.min(100, Math.max(0, bindo));
    bing = Math.min(100, Math.max(0, bing));
    const rata = ((mat + bindo + bing) / 3).toFixed(2);
    document.getElementById('rata').value = rata;
    let keterangan = "";
    if (rata >= 70) keterangan = "Lulus";
    else if (rata >= 60) keterangan = "Cadangan";
    else keterangan = "Tidak Lulus";
    document.getElementById('keterangan').value = keterangan;
    return { rata: parseFloat(rata), keterangan };
}

// Event listener untuk input nilai
function attachNilaiEvents() {
    ['mat', 'bindo', 'binggris'].forEach(id => {
        document.getElementById(id).addEventListener('input', () => hitungRataDanKeterangan());
    });
}

// ========== KODE PENDAFTARAN ==========
function validasiKode(kode) {
    if (!kode || kode.length !== 2) return { valid: false, message: "Kode harus tepat 2 karakter!" };
    const first = kode[0].toUpperCase();
    const second = kode[1].toUpperCase();
    if (!['A', 'B', 'V'].includes(first)) return { valid: false, message: "Karakter awal harus A, B, atau V!" };
    const bulanValid = ['1','2','3','4','5','6','7','8','9','O','N','D'];
    if (!bulanValid.includes(second)) return { valid: false, message: "Karakter kedua: 1-9 atau O(Oktober), N(November), D(Desember)" };
    return { valid: true, message: "" };
}

function getGedungDanBulan(kode) {
    if (!kode || kode.length !== 2) return { gedung: "?", bulan: "?" };
    const first = kode[0].toUpperCase();
    let gedung = first === 'A' ? 'Gedung A' : (first === 'B' ? 'Gedung B' : 'Viktor');
    const second = kode[1].toUpperCase();
    const bulanMap = {
        '1':'Januari','2':'Februari','3':'Maret','4':'April','5':'Mei','6':'Juni',
        '7':'Juli','8':'Agustus','9':'September','O':'Oktober','N':'November','D':'Desember'
    };
    let bulan = bulanMap[second] || "Bulan?";
    return { gedung, bulan };
}

// ========== FORM RESET ==========
function resetForm() {
    document.getElementById('nim').value = '';
    document.getElementById('nama').value = '';
    document.getElementById('kode').value = '';
    document.getElementById('jk').value = '';
    document.getElementById('asalSekolah').value = '';
    document.getElementById('mat').value = '0';
    document.getElementById('bindo').value = '0';
    document.getElementById('binggris').value = '0';
    hitungRataDanKeterangan();
    editId = null;
}

// ========== SIMPAN / EDIT ==========
function simpanData() {
    const nim = document.getElementById('nim').value.trim();
    const nama = document.getElementById('nama').value.trim();
    const kode = document.getElementById('kode').value.trim().toUpperCase();
    const jk = document.getElementById('jk').value;
    const asal = document.getElementById('asalSekolah').value.trim();
    let mat = parseFloat(document.getElementById('mat').value);
    let bindo = parseFloat(document.getElementById('bindo').value);
    let bing = parseFloat(document.getElementById('binggris').value);

    if (!nim || !nama || !kode || !jk || !asal) {
        Swal.fire("Error", "Semua field harus diisi (NIM, Nama, Kode, JK, Asal Sekolah)!", "error");
        return false;
    }
    if (isNaN(mat) || isNaN(bindo) || isNaN(bing)) {
        Swal.fire("Error", "Nilai harus angka!", "error");
        return false;
    }
    mat = Math.min(100, Math.max(0, mat));
    bindo = Math.min(100, Math.max(0, bindo));
    bing = Math.min(100, Math.max(0, bing));

    const validKode = validasiKode(kode);
    if (!validKode.valid) {
        Swal.fire("Kode tidak valid", validKode.message, "warning");
        return false;
    }

    const rataFix = (mat + bindo + bing) / 3;
    let keteranganFix = "";
    if (rataFix >= 70) keteranganFix = "Lulus";
    else if (rataFix >= 60) keteranganFix = "Cadangan";
    else keteranganFix = "Tidak Lulus";
    const rataRounded = parseFloat(rataFix.toFixed(2));

    if (editId !== null) {
        const index = participants.findIndex(p => p.id === editId);
        if (index !== -1) {
            participants[index] = {
                ...participants[index],
                nim, nama, kode, jenisKelamin: jk, asalSekolah: asal,
                nilaiMat: mat, nilaiBindo: bindo, nilaiInggris: bing,
                rataRata: rataRounded, keterangan: keteranganFix
            };
            Swal.fire("Berhasil!", "Data peserta diperbarui", "success");
        } else {
            Swal.fire("Gagal", "Data tidak ditemukan", "error");
            return false;
        }
    } else {
        const newId = Date.now();
        const newPeserta = {
            id: newId, nim, nama, kode, jenisKelamin: jk, asalSekolah: asal,
            nilaiMat: mat, nilaiBindo: bindo, nilaiInggris: bing,
            rataRata: rataRounded, keterangan: keteranganFix
        };
        participants.push(newPeserta);
        Swal.fire("Tersimpan!", "Pendaftaran berhasil ditambahkan", "success");
    }
    syncStorage();
    resetForm();
    editId = null;
    renderStatistik();
    renderTable();
    return true;
}

function hapusData(id) {
    Swal.fire({
        title: "Konfirmasi Hapus",
        text: "Apakah Anda yakin ingin menghapus pendaftar ini?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        confirmButtonText: "Ya, hapus!"
    }).then((result) => {
        if (result.isConfirmed) {
            participants = participants.filter(p => p.id !== id);
            syncStorage();
            renderStatistik();
            renderTable();
            Swal.fire("Terhapus!", "Data telah dihapus.", "success");
            if (editId === id) resetForm();
        }
    });
}

function editData(id) {
    const peserta = participants.find(p => p.id === id);
    if (!peserta) return;
    editId = id;
    document.getElementById('nim').value = peserta.nim;
    document.getElementById('nama').value = peserta.nama;
    document.getElementById('kode').value = peserta.kode;
    document.getElementById('jk').value = peserta.jenisKelamin;
    document.getElementById('asalSekolah').value = peserta.asalSekolah;
    document.getElementById('mat').value = peserta.nilaiMat;
    document.getElementById('bindo').value = peserta.nilaiBindo;
    document.getElementById('binggris').value = peserta.nilaiInggris;
    hitungRataDanKeterangan();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ========== FILTER & SEARCH ==========
function getFilteredData() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const filterKel = document.getElementById('filterKelulusan').value;
    let filtered = [...participants];
    if (searchTerm) {
        filtered = filtered.filter(p =>
            p.nim.toLowerCase().includes(searchTerm) ||
            p.nama.toLowerCase().includes(searchTerm) ||
            p.asalSekolah.toLowerCase().includes(searchTerm)
        );
    }
    if (filterKel !== "ALL") {
        filtered = filtered.filter(p => p.keterangan === filterKel);
    }
    return filtered;
}

function renderTable() {
    const filtered = getFilteredData();
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = "";
    if (filtered.length === 0) {
        tbody.innerHTML = "<tr><td colspan='13' style='text-align:center'>Tidak ada data pendaftar</td></tr>";
        return;
    }
    filtered.forEach((p, idx) => {
        const { gedung, bulan } = getGedungDanBulan(p.kode);
        const lokasi = `${gedung} (${bulan})`;
        const row = tbody.insertRow();
        row.insertCell(0).innerText = idx + 1;
        row.insertCell(1).innerText = p.nim;
        row.insertCell(2).innerText = p.nama;
        row.insertCell(3).innerText = p.kode;
        row.insertCell(4).innerText = lokasi;
        row.insertCell(5).innerText = p.jenisKelamin;
        row.insertCell(6).innerText = p.asalSekolah;
        row.insertCell(7).innerText = p.nilaiMat;
        row.insertCell(8).innerText = p.nilaiBindo;
        row.insertCell(9).innerText = p.nilaiInggris;
        row.insertCell(10).innerText = p.rataRata;
        let badge = p.keterangan === "Lulus" ? "✅ Lulus" : (p.keterangan === "Cadangan" ? "⚠️ Cadangan" : "❌ Tidak Lulus");
        row.insertCell(11).innerHTML = `<span style="font-weight:500;">${badge}</span>`;
        const actionCell = row.insertCell(12);
        actionCell.className = "action-icons";
        actionCell.innerHTML = `<i class="fas fa-edit" data-id="${p.id}"></i> <i class="fas fa-trash-alt" data-id="${p.id}"></i>`;
    });
    // Event listener untuk tombol edit/hapus
    document.querySelectorAll('.fa-edit').forEach(icon => {
        icon.addEventListener('click', (e) => { const id = parseInt(icon.getAttribute('data-id')); editData(id); });
    });
    document.querySelectorAll('.fa-trash-alt').forEach(icon => {
        icon.addEventListener('click', (e) => { const id = parseInt(icon.getAttribute('data-id')); hapusData(id); });
    });
}

function renderStatistik() {
    const lulus = participants.filter(p => p.keterangan === "Lulus").length;
    const cadangan = participants.filter(p => p.keterangan === "Cadangan").length;
    const tidak = participants.filter(p => p.keterangan === "Tidak Lulus").length;
    document.getElementById('statLulus').innerText = lulus;
    document.getElementById('statCadangan').innerText = cadangan;
    document.getElementById('statTidak').innerText = tidak;
    document.getElementById('statTotal').innerText = participants.length;
}

// ========== DARK MODE ==========
function initDarkMode() {
    const darkToggle = document.getElementById('darkModeToggle');
    const isDark = localStorage.getItem('darkMode') === 'true';
    if (isDark) document.body.classList.add('dark');
    darkToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark');
        localStorage.setItem('darkMode', document.body.classList.contains('dark'));
    });
}

// ========== EVENT LISTENERS & INIT ==========
function setupEventListeners() {
    document.getElementById('btnSimpan').addEventListener('click', () => simpanData());
    document.getElementById('btnReset').addEventListener('click', () => { resetForm(); editId = null; Swal.fire("Reset", "Form telah dikosongkan", "info"); });
    document.getElementById('btnPrint').addEventListener('click', () => window.print());
    document.getElementById('searchInput').addEventListener('input', () => renderTable());
    document.getElementById('filterKelulusan').addEventListener('change', () => renderTable());
}

document.addEventListener('DOMContentLoaded', () => {
    loadFromStorage();
    attachNilaiEvents();
    setupEventListeners();
    initDarkMode();
    hitungRataDanKeterangan();
});