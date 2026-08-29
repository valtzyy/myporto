export const languages = {
  en: 'English',
  id: 'Bahasa Indonesia',
} as const;

export type Lang = keyof typeof languages;

export const defaultLang: Lang = 'en';

export const ui = {
  en: {
    'nav.skip': 'Skip to content',
    'nav.language': 'Language',

    'hero.index': 'index',
    'hero.cohort': 'Cohort',
    'hero.seeWork': 'See the work',
    'hero.cv': 'Download CV',
    'hero.scroll': 'Scroll',

    'section.summary': 'summary',
    'section.summaryTitle': 'What I actually do',
    'section.experience': 'experience',
    'section.experienceTitle': 'Where I have done it',
    'section.work': 'work',
    'section.workTitle': 'Selected work',
    'section.stack': 'stack',
    'section.stackTitle': 'What I build with',
    'section.achievements': 'achievements',
    'section.achievementsTitle': 'Competitions and certification',
    'section.contact': 'contact',
    'section.contactTitle': 'Get in touch',

    'summary.education':
      'Information systems undergraduate at {institution}, cohort {cohort}, carrying a {gpa} GPA.',
    'summary.thread':
      'The thread through my work is not a language or a framework. It is that I tend to end up designing the layer everyone else builds on, and then helping them build on it.',
    'summary.outside':
      'Outside that: national-level Taekwondo, which is where the discipline comes from, and {language} for {reason}.',

    'thread.lead': 'Backend team lead',
    'thread.leadDetail': 'Owned the schema',
    'thread.mentor': 'Backend mentor',
    'thread.mentorDetail': 'Taught the layer',
    'thread.builder': 'Full-stack',
    'thread.builderDetail': 'Built the pipeline',

    'kind.technical': 'technical',
    'kind.organisational': 'organisational',

    'work.read': 'Read the case study',
    'work.source': 'Source',
    'work.live': 'Live site',
    'work.demo': 'Demo',
    'work.offline': 'Demo offline',
    'work.smaller': 'Smaller work',
    'work.allWork': 'All work',
    'work.role': 'Role',
    'work.year': 'Year',
    'work.context': 'Context',
    'work.sourceCode': 'Source code',
    'work.noShot': 'Illustration, not a screenshot. This project has no reachable deployment.',

    'context.coursework': 'coursework',
    'context.team': 'team',
    'context.personal': 'personal',
    'context.competition': 'competition',

    'stack.learning': 'Currently learning',
    'stack.learningLine': 'For {reason}.',

    'contact.pitch':
      'Looking for an internship or entry-level role where the data model matters. Based in {location}, open to remote.',
    'contact.email': 'Email',
    'contact.phone': 'Phone',

    'footer.built': 'Built with Astro · No tracking',
  },

  id: {
    'nav.skip': 'Lompat ke konten',
    'nav.language': 'Bahasa',

    'hero.index': 'indeks',
    'hero.cohort': 'Angkatan',
    'hero.seeWork': 'Lihat karya',
    'hero.cv': 'Unduh CV',
    'hero.scroll': 'Gulir',

    'section.summary': 'ringkasan',
    'section.summaryTitle': 'Apa yang sebenarnya saya kerjakan',
    'section.experience': 'pengalaman',
    'section.experienceTitle': 'Di mana saya mengerjakannya',
    'section.work': 'karya',
    'section.workTitle': 'Karya pilihan',
    'section.stack': 'teknologi',
    'section.stackTitle': 'Yang saya pakai membangun',
    'section.achievements': 'pencapaian',
    'section.achievementsTitle': 'Kompetisi dan sertifikasi',
    'section.contact': 'kontak',
    'section.contactTitle': 'Hubungi saya',

    'summary.education':
      'Mahasiswa S1 Sistem Informasi di {institution}, angkatan {cohort}, dengan IPK {gpa}.',
    'summary.thread':
      'Benang merah pekerjaan saya bukan bahasa atau framework tertentu. Saya cenderung berakhir merancang lapisan yang dibangun orang lain di atasnya, lalu membantu mereka membangunnya.',
    'summary.outside':
      'Di luar itu: Taekwondo tingkat nasional, dari sanalah disiplin saya datang, dan {language} untuk {reason}.',

    'thread.lead': 'Ketua tim backend',
    'thread.leadDetail': 'Memegang skema',
    'thread.mentor': 'Mentor backend',
    'thread.mentorDetail': 'Mengajarkan lapisannya',
    'thread.builder': 'Full-stack',
    'thread.builderDetail': 'Membangun pipeline',

    'kind.technical': 'teknis',
    'kind.organisational': 'organisasi',

    'work.read': 'Baca studi kasusnya',
    'work.source': 'Kode',
    'work.live': 'Situs langsung',
    'work.demo': 'Demo',
    'work.offline': 'Demo mati',
    'work.smaller': 'Karya lain',
    'work.allWork': 'Semua karya',
    'work.role': 'Peran',
    'work.year': 'Tahun',
    'work.context': 'Konteks',
    'work.sourceCode': 'Kode sumber',
    'work.noShot': 'Ilustrasi, bukan tangkapan layar. Project ini tidak punya deployment yang bisa diakses.',

    'context.coursework': 'tugas kuliah',
    'context.team': 'tim',
    'context.personal': 'pribadi',
    'context.competition': 'kompetisi',

    'stack.learning': 'Sedang dipelajari',
    'stack.learningLine': 'Untuk {reason}.',

    'contact.pitch':
      'Sedang mencari magang atau posisi entry-level yang menuntut model data yang benar. Berdomisili di {location}, terbuka untuk remote.',
    'contact.email': 'Surel',
    'contact.phone': 'Telepon',

    'footer.built': 'Dibangun dengan Astro · Tanpa pelacakan',
  },
} as const;

export type UIKey = keyof (typeof ui)['en'];
