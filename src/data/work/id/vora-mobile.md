---
title: Vora Mobile
tagline: Menaksir karbon tersimpan sebatang pohon dari video ponsel
format: case-study
order: 3
year: '2026'
role: Pengembang mobile
context: team
stack:
  - React Native
  - Expo SDK 54
  - TypeScript
  - monorepo pnpm
  - FastAPI
repo: https://github.com/valtzyy/vora-mobile
cover: ../../../assets/work/vora-logo-mark.png
coverAlt: Logo Vora
coverFit: contain
facts:
  - value: '4'
    label: paket workspace
  - value: '118'
    label: berkas kode
---

## Masalahnya

Mengukur karbon yang tersimpan pada pohon yang berdiri biasanya berarti turun ke
lapangan dengan meteran dan klinometer, mencatat diameter dan tinggi, lalu
menjalankan persamaan alometrik. Lambat, dan tidak terskala ke jumlah pohon yang
sebenarnya ingin disurvei siapa pun.

## Apa yang dikerjakannya

Vora Mobile mengubah video ponsel sebatang pohon menjadi taksiran karbon. Video
itu menjadi masukan rekonstruksi 3D Gaussian Splatting, dimensinya dipulihkan
dari rekonstruksi menggunakan kalibrasi dua titik yang dilakukan pengguna di
dalam aplikasi, lalu persamaan alometrik mengubah dimensi itu menjadi karbon
tersimpan.

Saya membangun sisi kliennya: pengambilan kamera dan pemilih berkas, alur
kalibrasi, status pemrosesan, dan tampilan hasil.

## Strukturnya

Repositorinya monorepo pnpm, dipecah supaya aplikasi ponsel bukan satu-satunya
yang bisa memakai backend:

- `apps/mobile`, aplikasi React Native dan Expo
- `packages/types`, tipe TypeScript yang mencerminkan skema backend
- `packages/domain`, logika format dan tampilan status, dipakai bersama klien
  web potensial
- `packages/api-client`, klien HTTP bertipe ke backend FastAPI

Menempatkan tipe di paketnya sendiri itulah yang membuat pemecahan ini sepadan
dengan biayanya. Saat skema backend berubah, galat tipe muncul di klien pada
waktu build, bukan sebagai kejutan runtime di tangan seseorang di tengah hutan.

## Keputusan yang layak disebut

**Pemindaian bisa tanpa akun.** Mewajibkan pendaftaran sebelum pengguna sempat
mencoba fitur intinya akan memakan lebih banyak pengguna daripada nilai akun itu
sendiri, jadi autentikasi tetap ada tapi pemindaian anonim adalah jalur kelas
satu.

**Kalibrasi dilakukan manual dan eksplisit.** Pemulihan skala otomatis dari satu
kamera tidak bisa diandalkan, dan hasil ukur yang diam-diam salah lebih buruk
daripada yang pengguna tahu harus ia tetapkan sendiri. Dua titik, ditaruh dengan
tangan, pada jarak yang diketahui.
