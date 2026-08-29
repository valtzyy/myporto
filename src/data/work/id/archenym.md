---
title: Archenym
tagline: Melacak lowongan kerja palsu kembali ke penipuan aslinya, untuk deteksi dini TPPO
format: case-study
order: 1
year: '2026'
role: Pengembang full-stack
context: personal
stack:
  - Next.js 14
  - FastAPI
  - PostgreSQL
  - TF-IDF
  - PageRank
  - vis-network
repo: https://github.com/valtzyy/Archenym
facts:
  - value: '93'
    label: berkas kode
  - value: '3'
    label: lapisan analisis
backdrop: ../../../assets/work/shot-network.jpg
backdropAlt: Cahaya kota dari orbit, mewakili jaringan akun yang saling terhubung
---

## Masalahnya

Iklan lowongan kerja palsu adalah salah satu pintu masuk tindak pidana
perdagangan orang di Indonesia. Iklan-iklan itu menyebar di media sosial sebagai
tiruan satu sama lain: janji yang sama, kalimat diubah sedikit, diposting dari
akun berbeda. Membacanya satu per satu nyaris tidak memberi tahu apa pun.
Sinyalnya ada pada bagaimana mereka saling berhubungan.

## Apa yang dikerjakannya

Archenym adalah papan intelijen forensik yang memperlakukan kumpulan lowongan
sebagai jaringan, bukan daftar. Ia menjawab pertanyaan yang tidak bisa dijawab
manusia dengan tangan: mana yang muncul lebih dulu, dan mana yang merupakan
turunannya.

Ada tiga lapisan yang bekerja.

**Prapemrosesan** menormalkan teks dan mengekstrak entitas: nomor telepon,
nomor rekening, nama. Entitas inilah yang menjadi tautan keras antar-posting
yang tidak berbagi satu kata pun tapi berbagi rekening penampung.

**Lineage** mengukur kemiripan lewat tiga cara sekaligus: TF-IDF pada teks,
fuzzy ratio untuk kalimat yang nyaris kembar, dan entity overlap untuk tautan
keras tadi. Ketiganya digabung menjadi bobot antar-posting, lalu clustering
mengubah graf berbobot itu menjadi kandidat jaringan pelaku.

**Arche scoring** mencari sumbernya. PageRank dijalankan pada graf kemiripan,
lalu skor yang seri dipecah secara kronologis, sehingga posting yang paling
banyak diturunkan orang lain, sang *arche*, muncul di puncak klasternya.

## Keputusan yang layak disebut

**Pemeriksa teksnya berjalan sepenuhnya di sisi klien.** Orang yang menempelkan
iklan mencurigakan bisa jadi sedang menjadi korban. Mengirim teks itu ke server
menciptakan catatan tentang situasinya yang sebenarnya tidak perlu ada, jadi
pemeriksaan risiko instan tidak pernah keluar dari peramban. Hanya analisis
korpus besar yang menyentuh backend.

**Kemiripan diukur tiga sinyal, bukan satu.** TF-IDF sendirian meleset pada
posting yang ditulis ulang. Fuzzy matching sendirian meleset pada posting yang
hanya berbagi nomor rekening. Tidak ada yang cukup sendirian, dan mode gagalnya
berbeda-beda, jadi pipeline menghitung ketiganya lalu menggabungkannya.

**PageRank butuh pemecah seri.** Dalam klaster berisi posting yang nyaris
identik, beberapa simpul berskor hampir sama. Kronologi adalah satu-satunya
urutan yang punya arti untuk asal-usul, jadi itulah yang memecah serinya.

## Statusnya sekarang

Ini MVP, dengan unit test pada pipeline dan lapisan database, serta korpus
sintetis untuk demonstrasi. Skornya belum divalidasi terhadap dataset dunia
nyata yang berlabel. Itu batas jujur dari pekerjaan ini sekarang, dan hal
berikutnya yang dibutuhkannya.
