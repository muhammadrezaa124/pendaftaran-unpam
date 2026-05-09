// ======================== DATA STORAGE ========================
let participants = [];
let editId = null;

function loadFromStorage() {
    const stored = localStorage.getItem("univ_pendaftaran");
    if (stored) {
        try {
            let data = JSON.parse(stored);
            if (Array.isArray(data) && data.length > 0 && data[0].hasOwnProperty('kodePendaftaran')) {
                participants = data;
            } else {
                participants = [];
                syncStorage();
            }
        } catch(e) {
            participants = [];
            syncStorage();
        }
    } else {
        participants = [];
        syncStorage();
    }
    renderStatistik();
    renderTable();
}

function syncStorage() {
    localStorage.setItem("univ_pendaftaran", JSON.stringify(participants));
}

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

function attachNilaiEvents() {
    const fields = ['mat', 'bindo', 'binggris', 'nama', 'kodePendaftaran', 'tempatLahir', 'tglLahir',
                    'gedung', 'bulan', 'jk', 'asalSekolah', 'pekerjaanOrtu'];
    fields.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', () => {
            hitungRataDanKeterangan();
            updatePreview();
        });
    });
}

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

function formatTanggal(tgl) {
    if (!tgl) return '-';
    const date = new Date(tgl);
    return date.toLocaleDateString('id-ID');
}

function updatePreview() {
    const nama = document.getElementById('nama').value.trim() || "-";
    const tempat = document.getElementById('tempatLahir').value.trim() || "-";
    const tgl = document.getElementById('tglLahir').value;
    const tglFormatted = tgl ? formatTanggal(tgl) : "-";
    const ttl = `${tempat}, ${tglFormatted}`;
    const kode = document.getElementById('kodePendaftaran').value.trim() || "-";
    const gedung = document.getElementById('gedung').value;
    const bulan = document.getElementById('bulan').value;
    const jk = document.getElementById('jk').value;
    const asal = document.getElementById('asalSekolah').value.trim() || "-";
    const pekerjaan = document.getElementById('pekerjaanOrtu').value.trim() || "-";
    const mat = document.getElementById('mat').value || 0;
    const bindo = document.getElementById('bindo').value || 0;
    const bing = document.getElementById('binggris').value || 0;
    const rata = document.getElementById('rata').value || "0";
    const keterangan = document.getElementById('keterangan').value || "-";

    const gedungMap = { 'A': 'Gedung A', 'B': 'Gedung B', 'V': 'Gedung Viktor' };
    const bulanMap = { '1':'Jan','2':'Feb','3':'Mar','4':'Apr','5':'Mei','6':'Jun','7':'Jul','8':'Ags','9':'Sep','O':'Okt','N':'Nov','D':'Des' };
    const gedungTeks = gedungMap[gedung] || '-';
    const bulanTeks = bulanMap[bulan] || '-';
    const lokasi = `${gedungTeks} (${bulanTeks})`;

    document.getElementById('previewNama').innerText = nama;
    document.getElementById('previewTtl').innerText = ttl;
    document.getElementById('previewKode').innerText = kode;
    document.getElementById('previewGedungBulan').innerText = lokasi;
    document.getElementById('previewJK').innerText = jk || "-";
    document.getElementById('previewAsal').innerText = asal;
    document.getElementById('previewPekerjaan').innerText = pekerjaan;
    document.getElementById('previewNilai').innerText = `${mat} / ${bindo} / ${bing}`;
    document.getElementById('previewRata').innerText = rata;
    const statusSpan = document.getElementById('previewStatus');
    statusSpan.innerText = keterangan;
    if (keterangan === "Lulus") statusSpan.style.background = "#10b981";
    else if (keterangan === "Cadangan") statusSpan.style.background = "#f59e0b";
    else statusSpan.style.background = "#ef4444";

    const avatarIcon = document.querySelector('#avatarPreview i');
    if (jk === "Laki-laki") {
        avatarIcon.className = "fas fa-user-graduate";
    } else if (jk === "Perempuan") {
        avatarIcon.className = "fas fa-user-tie";
    } else {
        avatarIcon.className = "fas fa-user-circle";
    }
}

function resetForm() {
    document.getElementById('kodePendaftaran').value = '';
    document.getElementById('nama').value = '';
    document.getElementById('tempatLahir').value = '';
    document.getElementById('tglLahir').value = '';
    document.getElementById('gedung').value = '';
    document.getElementById('bulan').value = '';
    document.getElementById('jk').value = '';
    document.getElementById('asalSekolah').value = '';
    document.getElementById('pekerjaanOrtu').value = '';
    document.getElementById('mat').value = '0';
    document.getElementById('bindo').value = '0';
    document.getElementById('binggris').value = '0';
    hitungRataDanKeterangan();
    updatePreview();
    editId = null;
}

function simpanData() {
    const kodePendaftaran = document.getElementById('kodePendaftaran').value.trim();
    const nama = document.getElementById('nama').value.trim();
    const tempatLahir = document.getElementById('tempatLahir').value.trim();
    const tglLahir = document.getElementById('tglLahir').value;
    const gedung = document.getElementById('gedung').value;
    const bulan = document.getElementById('bulan').value;
    const jk = document.getElementById('jk').value;
    const asal = document.getElementById('asalSekolah').value.trim();
    const pekerjaanOrtu = document.getElementById('pekerjaanOrtu').value.trim();
    let mat = parseFloat(document.getElementById('mat').value);
    let bindo = parseFloat(document.getElementById('bindo').value);
    let bing = parseFloat(document.getElementById('binggris').value);

    if (!kodePendaftaran || !nama || !tempatLahir || !tglLahir || !gedung || !bulan || !jk || !asal || !pekerjaanOrtu) {
        Swal.fire("Error", "Semua field harus diisi!", "error");
        return false;
    }
    if (isNaN(mat) || isNaN(bindo) || isNaN(bing)) {
        Swal.fire("Error", "Nilai harus angka!", "error");
        return false;
    }
    mat = Math.min(100, Math.max(0, mat));
    bindo = Math.min(100, Math.max(0, bindo));
    bing = Math.min(100, Math.max(0, bing));

    const existing = participants.find(p => p.kodePendaftaran === kodePendaftaran && (editId === null || p.id !== editId));
    if (existing) {
        Swal.fire("Error", "Kode Pendaftaran sudah digunakan!", "error");
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
            participants[index] = { ...participants[index], kodePendaftaran, nama, tempatLahir, tglLahir, gedung, bulan, jenisKelamin: jk, asalSekolah: asal, pekerjaanOrtu, nilaiMat: mat, nilaiBindo: bindo, nilaiInggris: bing, rataRata: rataRounded, keterangan: keteranganFix };
            Swal.fire("Berhasil!", "Data diperbarui", "success");
        } else {
            Swal.fire("Gagal", "Data tidak ditemukan", "error");
            return false;
        }
    } else {
        const newId = Date.now();
        participants.push({ id: newId, kodePendaftaran, nama, tempatLahir, tglLahir, gedung, bulan, jenisKelamin: jk, asalSekolah: asal, pekerjaanOrtu, nilaiMat: mat, nilaiBindo: bindo, nilaiInggris: bing, rataRata: rataRounded, keterangan: keteranganFix });
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
        text: "Yakin ingin menghapus?",
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
    document.getElementById('tempatLahir').value = peserta.tempatLahir || '';
    document.getElementById('tglLahir').value = peserta.tglLahir || '';
    document.getElementById('gedung').value = peserta.gedung;
    document.getElementById('bulan').value = peserta.bulan;
    document.getElementById('jk').value = peserta.jenisKelamin;
    document.getElementById('asalSekolah').value = peserta.asalSekolah;
    document.getElementById('pekerjaanOrtu').value = peserta.pekerjaanOrtu;
    document.getElementById('mat').value = peserta.nilaiMat;
    document.getElementById('bindo').value = peserta.nilaiBindo;
    document.getElementById('binggris').value = peserta.nilaiInggris;
    hitungRataDanKeterangan();
    updatePreview();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function getFilteredData() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const filterKel = document.getElementById('filterKelulusan').value;
    let filtered = [...participants];
    if (searchTerm) {
        filtered = filtered.filter(p => p.kodePendaftaran.toLowerCase().includes(searchTerm) || p.nama.toLowerCase().includes(searchTerm) || p.asalSekolah.toLowerCase().includes(searchTerm));
    }
    if (filterKel !== "ALL") filtered = filtered.filter(p => p.keterangan === filterKel);
    return filtered;
}

function renderTable() {
    const filtered = getFilteredData();
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = "";
    if (filtered.length === 0) {
        tbody.innerHTML = "<tr><td colspan='15' style='text-align:center'>Tidak ada data pendaftar</td></tr>";
        return;
    }
    filtered.forEach((p, idx) => {
        const lokasi = getGedungDanBulan(p.gedung, p.bulan);
        const row = tbody.insertRow();
        row.insertCell(0).innerText = idx + 1;
        row.insertCell(1).innerText = p.kodePendaftaran;
        row.insertCell(2).innerText = p.nama;
        row.insertCell(3).innerText = p.tempatLahir || '-';
        row.insertCell(4).innerText = p.tglLahir ? formatTanggal(p.tglLahir) : '-';
        row.insertCell(5).innerText = lokasi;
        row.insertCell(6).innerText = p.jenisKelamin;
        row.insertCell(7).innerText = p.asalSekolah;
        row.insertCell(8).innerText = p.pekerjaanOrtu;
        row.insertCell(9).innerText = p.nilaiMat;
        row.insertCell(10).innerText = p.nilaiBindo;
        row.insertCell(11).innerText = p.nilaiInggris;
        row.insertCell(12).innerText = p.rataRata;
        let badge = p.keterangan === "Lulus" ? "✅ Lulus" : (p.keterangan === "Cadangan" ? "⚠️ Cadangan" : "❌ Tidak Lulus");
        row.insertCell(13).innerHTML = `<span style="font-weight:500;">${badge}</span>`;
        const actionCell = row.insertCell(14);
        actionCell.className = "action-icons";
        actionCell.innerHTML = `<i class="fas fa-edit" data-id="${p.id}"></i> <i class="fas fa-trash-alt" data-id="${p.id}"></i>`;
    });
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

function initDarkMode() {
    const darkToggle = document.getElementById('darkModeToggle');
    const isDark = localStorage.getItem('darkMode') === 'true';
    if (isDark) document.body.classList.add('dark');
    darkToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark');
        localStorage.setItem('darkMode', document.body.classList.contains('dark'));
    });
}

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
    updatePreview();
});