// ======================== DATA STORAGE ========================
let participants = [];
let editId = null;

// Load / Save localStorage
function loadFromStorage() {
    const stored = localStorage.getItem("univ_pendaftaran");
    if (stored) {
        participants = JSON.parse(stored);
    } else {
        // Data awal (demo) dengan struktur baru
        participants = [
            { id: 1, kodePendaftaran: "A2-101-9", nama: "Ahmad Fauzi", gedung: "A", bulan: "2", jenisKelamin: "Laki-laki", asalSekolah: "SMA 1 Pamulang", pekerjaanOrtu: "PNS", nilaiMat: 85, nilaiBindo: 78, nilaiInggris: 80, rataRata: 81, keterangan: "Lulus" },
            { id: 2, kodePendaftaran: "B7-202-1", nama: "Siti Nurhaliza", gedung: "B", bulan: "7", jenisKelamin: "Perempuan", asalSekolah: "SMAN 2 Tangerang", pekerjaanOrtu: "Wiraswasta", nilaiMat: 65, nilaiBindo: 70, nilaiInggris: 68, rataRata: 67.67, keterangan: "Cadangan" },
            { id: 3, kodePendaftaran: "V1-303-2", nama: "Budi Santoso", gedung: "V", bulan: "1", jenisKelamin: "Laki-laki", asalSekolah: "SMA Cendekia", pekerjaanOrtu: "Petani", nilaiMat: 45, nilaiBindo: 50, nilaiInggris: 48, rataRata: 47.67, keterangan: "Tidak Lulus" }
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

// ========== KONVERSI GEDUNG & BULAN ==========
function getGedungDanBulan(gedungCode, bulanCode) {
    const gedungMap = { 'A': 'Gedung A', 'B': 'Gedung B', 'V': 'Gedung Viktor' };
    const gedung = gedungMap[gedungCode] || '?';
    const bulanMap = {
        '1':'Januari','2':'Februari','3':'Maret','4':'April','5':'Mei','6':'Juni',
        '7':'Juli','8':'Agustus','9':'September','O':'Oktober','N':'November','D':'Desember'
    };
    const bulan = bulanMap[bulanCode] || 'Bulan?';
    return `${gedung} (${bulan})`;
}

// ========== FORM RESET ==========
function resetForm() {
    document.getElementById('kodePendaftaran').value = '';
    document.getElementById('nama').value = '';
    document.getElementById('gedung').value = '';
    document.getElementById('bulan').value = '';
    document.getElementById('jk').value = '';
    document.getElementById('asalSekolah').value = '';
    document.getElementById('pekerjaanOrtu').value = '';
    document.getElementById('mat').value = '0';
    document.getElementById('bindo').value = '0';
    document.getElementById('binggris').value = '0';
    hitungRataDanKeterangan();
    editId = null;
}

// ========== SIMPAN / EDIT ==========
function simpanData() {
    const kodePendaftaran = document.getElementById('kodePendaftaran').value.trim();
    const nama = document.getElementById('nama').value.trim();
    const gedung = document.getElementById('gedung').value;
    const bulan = document.getElementById('bulan').value;
    const jk = document.getElementById('jk').value;
    const asal = document.getElementById('asalSekolah').value.trim();
    const pekerjaanOrtu = document.getElementById('pekerjaanOrtu').value.trim();
    let mat = parseFloat(document.getElementById('mat').value);
    let bindo = parseFloat(document.getElementById('bindo').value);
    let bing = parseFloat(document.getElementById('binggris').value);

    if (!kodePendaftaran || !nama || !gedung || !bulan || !jk || !asal || !pekerjaanOrtu) {
        Swal.fire("Error", "Semua field harus diisi (Kode Pendaftaran, Nama, Gedung, Bulan, JK, Asal Sekolah, Pekerjaan Orang Tua)!", "error");
        return false;
    }
    if (isNaN(mat) || isNaN(bindo) || isNaN(bing)) {
        Swal.fire("Error", "Nilai harus angka!", "error");
        return false;
    }
    mat = Math.min(100, Math.max(0, mat));
    bindo = Math.min(100, Math.max(0, bindo));
    bing = Math.min(100, Math.max(0, bing));

    // Cek unik kode pendaftaran (kecuali sedang edit data yang sama)
    const existing = participants.find(p => p.kodePendaftaran === kodePendaftaran && (editId === null || p.id !== editId));
    if (existing) {
        Swal.fire("Error", "Kode Pendaftaran sudah digunakan! Masukkan kode yang berbeda.", "error");
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
                kodePendaftaran, nama, gedung, bulan, jenisKelamin: jk, asalSekolah: asal, pekerjaanOrtu,
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
            id: newId, kodePendaftaran, nama, gedung, bulan, jenisKelamin: jk, asalSekolah: asal, pekerjaanOrtu,
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
    document.getElementById('kodePendaftaran').value = peserta.kodePendaftaran;
    document.getElementById('nama').value = peserta.nama;
    document.getElementById('gedung').value = peserta.gedung;
    document.getElementById('bulan').value = peserta.bulan;
    document.getElementById('jk').value = peserta.jenisKelamin;
    document.getElementById('asalSekolah').value = peserta.asalSekolah;
    document.getElementById('pekerjaanOrtu').value = peserta.pekerjaanOrtu;
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
            p.kodePendaftaran.toLowerCase().includes(searchTerm) ||
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
        const lokasi = getGedungDanBulan(p.gedung, p.bulan);
        const row = tbody.insertRow();
        row.insertCell(0).innerText = idx + 1;
        row.insertCell(1).innerText = p.kodePendaftaran;
        row.insertCell(2).innerText = p.nama;
        row.insertCell(3).innerText = lokasi;
        row.insertCell(4).innerText = p.jenisKelamin;
        row.insertCell(5).innerText = p.asalSekolah;
        row.insertCell(6).innerText = p.pekerjaanOrtu;
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