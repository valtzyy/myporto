---
title: Dealer Management Information System
tagline: Platform dealer yang berdiri di atas framework PHP yang ditulis dari nol
format: case-study
order: 2
year: '2026'
role: Ketua tim backend
context: coursework
stack:
  - PHP 8
  - MySQL
  - PDO
  - Cloudinary
  - DomPDF
  - Vercel
repo: https://github.com/valtzyy/RBPL-Project-SI-E
live: https://rbpl-project-si-e.vercel.app/login
liveStatus: down
liveNote: Ter-deploy, tapi databasenya dipegang pemilik project dan sedang mati
facts:
  - value: '37'
    label: migrasi
  - value: '30'
    label: controller
  - value: '40+'
    label: model
backdrop: ../../../assets/work/shot-dealership.jpg
backdropAlt: Kendaraan dilihat dari atas di halaman dealer
---

## Masalahnya

Dealer kendaraan bukan satu sistem. Pengadaan, inventori, penjualan, pengajuan
kredit, pembayaran kasir, servis bengkel, suku cadang, penjadwalan pengiriman,
dan pelaporan semuanya menyentuh kendaraan dan pelanggan yang sama, dan tiap
divisi melihat irisan yang berbeda. Kalau dimodelkan asal, setiap modul akan
berakhir merogoh isi modul lainnya.

## Peran saya

Saya memimpin pengembangan backend untuk tim multidisiplin. Saya memegang skema
database, arsitektur backend, dan permukaan API-nya; merancang sistem
autentikasi dan otorisasi; menjalankan migrasi; serta mengoordinasikan
integrasi dengan orang-orang yang membangun di atasnya.

## Framework di bawahnya

Batasannya adalah PHP tanpa Composer, jadi fondasinya harus ditulis lebih dulu.
Itu berubah menjadi framework MVC kecil: router dengan parameter URL, lapisan
autentikasi, abstraksi model di atas PDO, koneksi database yang dikonfigurasi
dari `.env`, dan penjalan migrasi berbasis CLI.

Membangun framework sebelum produknya adalah urutan yang tepat di sini, tapi
alasannya perlu dijelaskan: alternatifnya adalah tiga puluh controller yang
masing-masing membuka koneksinya sendiri dan mengurai rutenya sendiri.
Framework itu ada supaya skema menjadi satu-satunya hal yang perlu dipikirkan
siapa pun.

## Skema dan kontrol akses

Tiga puluh tujuh migrasi menggambarkan domainnya: pengguna dan peran,
pelanggan, kendaraan, suku cadang, transaksi, pembayaran, faktur, pengajuan dan
keputusan kredit, booking dan penagihan servis, pengadaan, jadwal pengiriman.

Role-based access control berjalan lintas beberapa jenis pengguna, dan
ditegakkan di lapisan otorisasi, bukan di tiap controller. Kasir, staf
penjualan, teknisi bengkel, dan administrator melihat sistem yang benar-benar
berbeda, dibangun dari tabel yang sama.

## Statusnya sekarang

Aplikasinya masih ter-deploy, tapi instance MySQL terkelola di belakangnya
dipegang pemilik project, bukan saya, dan sedang mati. URL langsungnya
mengembalikan galat koneksi database. Skema, migrasi, dan seeder semuanya ada
di repositori, dan sistemnya berjalan secara lokal di atas MySQL 8 mana pun.
