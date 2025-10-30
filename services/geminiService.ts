
import { GoogleGenAI, Type } from "@google/genai";
import { Employee } from "../types";
import { getEmployeeBoxInfo, performanceMap, potentialMap, getPerformanceScale, getPotentialScale, categoryMap } from "../utils/talentUtils";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export async function generateJobDescription(title: string, unitKerja: string): Promise<string> {
    const prompt = `
    Buat deskripsi pekerjaan (Uraian Jabatan) yang profesional dan ringkas untuk jabatan "${title}" di unit kerja (SKPD) "${unitKerja}" di lingkungan Pemerintah Kabupaten Aceh Barat.
    Pertimbangkan signifikansi strategis jabatan ini bagi pencapaian tujuan SKPD dan pemerintah daerah.
    Deskripsi harus dalam Bahasa Indonesia.
    Fokus pada poin-poin berikut:
    1.  **Ikhtisar Jabatan**: Ringkasan singkat tentang peran dan kedudukan jabatan dalam struktur organisasi.
    2.  **Tugas Pokok**: Daftar tugas-tugas utama yang menjadi tanggung jawab jabatan (gunakan daftar berpoin).
    3.  **Kualifikasi Jabatan**: Persyaratan kompetensi, pendidikan, dan pangkat/golongan yang dibutuhkan (gunakan daftar berpoin).
    
    Pastikan bahasa yang digunakan formal, sesuai untuk analisis jabatan dan tata naskah dinas di lingkungan pemerintahan Indonesia.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                temperature: 0.5,
                topP: 0.95,
            }
        });

        return response.text;
    } catch (error) {
        console.error("Error generating content from Gemini:", error);
        if (error instanceof Error) {
            return `Gagal menghasilkan konten: ${error.message}`;
        }
        return "Terjadi kesalahan yang tidak diketahui saat memanggil API Gemini.";
    }
}

export async function generateDevelopmentPlan(employee: Employee): Promise<string> {
    const { boxNumber, category, recommendation } = getEmployeeBoxInfo(employee);
    const performanceScale = getPerformanceScale(employee.performance);
    const potentialScale = getPotentialScale(employee.potential);

    const prompt = `
    Anda adalah seorang Asesor SDM Aparatur Ahli senior di BKPSDM Kabupaten Aceh Barat, yang bertugas menyusun Rencana Pengembangan Individu (Individual Development Plan - IDP) yang strategis.
    Gunakan "Buku Saku Implementasi Manajemen Talenta ASN (LAN RI & Tanoto Foundation)" sebagai referensi utama untuk memastikan rencana ini sesuai dengan praktik terbaik.

    Data Pegawai:
    - Nama: ${employee.name}
    - NIP: ${employee.nip}
    - Jabatan Saat Ini: ${employee.jabatan}
    - Pangkat/Golongan: ${employee.pangkatGolongan}
    - Pendidikan: ${employee.pendidikan} - ${employee.jurusan}
    - Eselon: ${employee.eselon}
    - SKPD: ${employee.unitKerja}
    - Kinerja: ${performanceMap[performanceScale]} (Skor: ${employee.performance}/100)
    - Potensi: ${potentialMap[potentialScale]} (Skor: ${employee.potential}/100)
    - Kompetensi: ${employee.competency ?? 'Belum dinilai'}/100
    - Keterampilan: ${employee.skills.join(', ') || 'Belum terdata'}
    - Jabatan Lowong/Kritikal Target: ${employee.criticalPosition || 'Belum terdata'}

    Analisis Posisi:
    Pegawai ini berada di **Kotak ${boxNumber} (${category})** pada 9-Box Matrix.
    Rekomendasi umum sesuai Permenpan RB No. 3 Tahun 2020 adalah: **"${recommendation}"**

    Instruksi:
    Buat IDP dalam format HTML yang terstruktur, profesional, dan dapat ditindaklanjuti.
    Gunakan heading (<h3>), list (<ul>, <li>), dan bold (<strong>).
    Rencana harus menerjemahkan rekomendasi umum menjadi aksi-aksi konkret yang terinspirasi dari "Buku Saku", dengan struktur sebagai berikut:

    1.  <strong>Ringkasan Profil & Arah Pengembangan</strong>:
        - Analisis singkat posisi pegawai di Kotak ${boxNumber}. Hubungkan posisinya dengan Jabatan Lowong/Kritikal Target dan potensi kontribusinya bagi organisasi.

    2.  <strong>Fokus Pengembangan (Berdasarkan Kategori Program)</strong>:
        - Berdasarkan rekomendasi untuk Kotak ${boxNumber}, jabarkan rencana aksi dalam 2-3 kategori relevan berikut ini (pilih yang paling sesuai):
        - **a. Pengembangan Kompetensi (Wajib & Non-Wajib)**:
            - Sarankan pelatihan *mandatory* (wajib) yang relevan (contoh: Diklat PIM jika sesuai, Diklat Fungsional).
            - Sarankan pelatihan *non-mandatory* (berdasarkan minat & kebutuhan) seperti seminar, workshop, atau *online course* spesifik yang dapat menutup *gap* kompetensi.
        - **b. Manajemen Karir & Retensi Talenta**:
            - Jika relevan (terutama untuk Kotak 7, 8, 9), usulkan strategi dari buku saku: **Rotasi Jabatan** (jelaskan jenis rotasi yang cocok), **Pengayaan Jabatan (Job Enrichment)** (beri contoh tugas tambahan yang strategis), atau **Perluasan Jabatan (Job Enlargement)**.
            - Untuk talenta potensial, sebutkan kemungkinan diusulkan untuk **Tugas Belajar/Pendidikan Lanjutan**.
        - **c. Pembinaan & Peningkatan Kinerja**:
            - Jika relevan (terutama untuk kotak yang kinerjanya rendah/sesuai), sarankan **Bimbingan Kinerja** atau **Sesi Coaching/Mentoring** terjadwal dengan atasan langsung atau mentor yang ditunjuk. Untuk kinerja rendah, sebutkan perlunya **Konseling Kinerja**.

    3.  <strong>Target & Prioritas Jangka Pendek (6 Bulan)</strong>:
        - Sebutkan 2-3 langkah paling prioritas yang harus segera dieksekusi. Buat target ini SMART (Specific, Measurable, Achievable, Relevant, Time-bound).

    Pastikan outputnya adalah string HTML yang siap pakai. Jangan sertakan \`\`\`html di awal atau akhir. Nada tulisan harus konstruktif dan selaras dengan semangat pengembangan SDM Unggul.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                temperature: 0.6,
                topP: 0.95,
            }
        });

        return response.text;
    } catch (error) {
        console.error("Error generating development plan from Gemini:", error);
        if (error instanceof Error) {
            return `<h3>Gagal Menghasilkan Rencana</h3><p>Terjadi kesalahan saat berkomunikasi dengan AI: ${error.message}</p>`;
        }
        return "<h3>Gagal Menghasilkan Rencana</h3><p>Terjadi kesalahan yang tidak diketahui saat memanggil API Gemini.</p>";
    }
}

export async function generateTalentPoolAnalysis(employees: Employee[]): Promise<string> {
    const boxSummary: { [key: number]: { count: number; employees: {name: string, jabatan: string}[] } } = {};
    for (let i = 1; i <= 9; i++) {
        boxSummary[i] = { count: 0, employees: [] };
    }

    employees.forEach(e => {
        const { boxNumber } = getEmployeeBoxInfo(e);
        if (boxSummary[boxNumber]) {
            boxSummary[boxNumber].count++;
            boxSummary[boxNumber].employees.push({ name: e.name, jabatan: e.jabatan });
        }
    });
    
    // String for top talents (Box 7, 8, 9)
    const topTalentString = [9, 8, 7].map(boxNum => {
        const data = boxSummary[boxNum];
        if (data.count === 0) return `Kotak ${boxNum}: Tidak ada pegawai.`;
        const employeeNames = data.employees.map(e => `${e.name} (${e.jabatan})`).join(', ');
        return `Kotak ${boxNum} (${categoryMap[boxNum]}): ${data.count} pegawai. Mereka adalah: ${employeeNames}.`;
    }).join('\n');

    // String for core employees (Box 2, 4, 5)
    const coreEmployeeString = [5, 4, 2].map(boxNum => {
        const data = boxSummary[boxNum];
        if (data.count === 0) return `Kotak ${boxNum}: Tidak ada pegawai.`;
        return `Kotak ${boxNum} (${categoryMap[boxNum]}): ${data.count} pegawai.`;
    }).join('\n');

    // String for at-risk employees (Box 1, 3, 6)
    const atRiskEmployeeString = [1, 3, 6].map(boxNum => {
        const data = boxSummary[boxNum];
        if (data.count === 0) return `Kotak ${boxNum}: Tidak ada pegawai.`;
        const employeeNames = data.employees.map(e => `${e.name} (${e.jabatan})`).join(', ');
        return `Kotak ${boxNum} (${categoryMap[boxNum]}): ${data.count} pegawai. Mereka adalah: ${employeeNames}.`;
    }).join('\n');


    const prompt = `
    Anda adalah Kepala BKPSDM Kabupaten Aceh Barat. Anda diminta untuk menyajikan Laporan Analisis Talent Pool kepada Tim Komite Talenta dan Komite Suksesi.
    Laporan ini harus strategis, tajam, dan berdasarkan "Buku Saku Implementasi Manajemen Talenta ASN", menggunakan data 9-Box Matrix sesuai "Permenpan RB No. 3 Tahun 2020".

    Data Ringkas Pegawai ASN berdasarkan Kotak 9-Box:
    
    KELOMPOK TALENTA UNGGULAN (CALON KRS):
    ${topTalentString}

    KELOMPOK TULANG PUNGGUNG ORGANISASI:
    ${coreEmployeeString}

    KELOMPOK BERISIKO & BUTUH INTERVENSI:
    ${atRiskEmployeeString}

    Instruksi:
    Hasilkan laporan dalam format HTML yang rapi untuk dipresentasikan. Jangan sertakan tag \`<html>\`, \`<body>\`, atau \`\`\`html.
    Struktur laporan harus mengikuti kerangka berikut untuk membantu Komite Suksesi dalam mengambil keputusan:

    1.  <h3>Ringkasan Eksekutif: Peta Talent Pool Pemerintah Kabupaten Aceh Barat</h3>
        - Analisis distribusi talenta pada 9 Kotak berdasarkan data ringkas di atas. Identifikasi konsentrasi (misal, "mayoritas pegawai adalah 'solid citizen' di Kotak 5") dan kekosongan kritis (misal, "kurangnya calon suksesor di Kotak 9").
        - Berikan gambaran umum mengenai kekuatan dan area risiko dari sebaran talenta saat ini.

    2.  <h3>Identifikasi Kelompok Rencana Suksesi (KRS) & Prioritas Manajemen</h3>
        - Berdasarkan buku saku, kelompokkan talenta untuk ditindaklanjuti.
        - <strong>Calon Anggota Talent Pool/KRS (Kotak 7, 8, 9)</strong>:
            - Sebutkan kembali nama-nama pegawai di kategori ini berdasarkan data yang diberikan.
            - Jelaskan mengapa mereka adalah aset paling berharga dan prioritas utama untuk mengisi jabatan-jabatan kritikal. Tekankan urgensi untuk mempertahankan dan mengakselerasi mereka.
        - <strong>Pegawai Tulang Punggung (Kotak 2, 4, 5)</strong>:
            - Analisis peran vital kelompok ini dalam menjaga stabilitas operasional.
            - Sarankan strategi untuk menjaga produktivitas dan motivasi mereka, serta mengidentifikasi potensi tersembunyi.
        - <strong>Talenta Berisiko & Membutuhkan Intervensi (Kotak 1, 3, 6)</strong>:
            - Identifikasi pegawai di kategori ini dan sebutkan nama mereka jika data tersedia.
            - Jelaskan potensi dampaknya terhadap kinerja unit dan sarankan perlunya intervensi yang terukur.

    3.  <h3>Rekomendasi Strategis untuk Komite Talenta & Suksesi</h3>
        - Berikan rekomendasi kebijakan yang konkret dan dapat dieksekusi oleh Komite.
        - <strong>Strategi Akselerasi & Retensi (Untuk KRS)</strong>: Sarankan pembentukan program 'Talent Mobility' untuk menempatkan mereka pada Jabatan Target, program 'Job Enrichment' dengan tugas strategis, dan prioritas beasiswa/tugas belajar.
        - <strong>Strategi Pengembangan Kapasitas (Untuk Pegawai Tulang Punggung)</strong>: Rekomendasikan program 'upskilling' dan 'reskilling' yang terstruktur, serta 'cross-functional assignment' untuk memperluas wawasan.
        - <strong>Strategi Intervensi Kinerja</strong>: Usulkan implementasi 'Performance Improvement Plan (PIP)' yang terstandar, program 'Coaching & Konseling Kinerja', dan evaluasi 'job-fit' untuk kemungkinan rotasi yang lebih sesuai.

    Gunakan tag HTML seperti <h3>, <p>, <ul>, <li>, dan <strong>. Laporan harus berwibawa, berorientasi pada data, dan memberikan panduan yang jelas bagi pimpinan.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                temperature: 0.7,
                topP: 0.95,
            }
        });

        return response.text;
    } catch (error) {
        console.error("Error generating talent pool analysis from Gemini:", error);
        if (error instanceof Error) {
            return `<h3>Gagal Menghasilkan Analisis</h3><p>Terjadi kesalahan saat berkomunikasi dengan AI: ${error.message}</p>`;
        }
        return "<h3>Gagal Menghasilkan Analisis</h3><p>Terjadi kesalahan yang tidak diketahui saat memanggil API Gemini.</p>";
    }
}

export async function generateEmployeeData(jabatan: string, unitKerja: string): Promise<Partial<Employee>> {
    const prompt = `
    Anda adalah Asisten Personalia AI yang sangat kreatif untuk Pemerintah Kabupaten Aceh Barat.
    Tugas Anda adalah membuat data profil untuk seorang Aparatur Sipil Negara (ASN) fiktif yang baru untuk posisi **${jabatan}** di **${unitKerja}**.

    Buat data yang realistis, unik, dan sesuai dengan konteks pemerintahan daerah di Indonesia. Sertakan pendidikan dan jurusan yang sesuai, NIP yang valid, dan eselon yang relevan. Pastikan NIP mengikuti format yang masuk akal (Tahun Lahir, Bulan Lahir, Tanggal Lahir, Tahun Pengangkatan, Bulan Pengangkatan, Jenis Kelamin, Nomor Urut).

    Hasilkan data dalam format JSON sesuai dengan skema yang diberikan.
    `;

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING, description: "Nama lengkap Indonesia yang umum, terdiri dari 2 kata." },
            nip: { type: Type.STRING, description: "Nomor Induk Pegawai (NIP) 18 digit yang realistis. Format: YYYYMMDD YYYYMM C NNN. C adalah 1 untuk pria, 2 untuk wanita." },
            pangkatGolongan: { type: Type.STRING, description: "Pangkat dan golongan yang sesuai untuk jabatan tersebut. Contoh: Penata Muda, III/a" },
            pendidikan: { type: Type.STRING, description: "Tingkat pendidikan terakhir yang sesuai. Contoh: S1, S2." },
            jurusan: { type: Type.STRING, description: "Jurusan pendidikan yang relevan. Contoh: Akuntansi, Manajemen SDM." },
            email: { type: Type.STRING, description: "Alamat email fiktif berdasarkan nama. Contoh: nama.singkat@example.com" },
            phone: { type: Type.STRING, description: "Nomor telepon Indonesia 12-13 digit yang fiktif, diawali dengan 08." },
            eselon: { type: Type.STRING, description: "Tingkat eselon jabatan. Contoh: 'Administrator (Eselon III)', 'JPT Pratama (Eselon II)', 'Fungsional Ahli Muda', 'Staf'." },
            skills: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "3-5 keterampilan (kompetensi) yang relevan dengan jabatan tersebut."
            },
            criticalPosition: { type: Type.STRING, description: "Jabatan Lowong/Kritikal Target yang realistis yang bisa menjadi target suksesi untuk ASN di posisi ini. Contoh: Kepala Dinas Pendidikan" },
        },
        required: ["name", "nip", "pangkatGolongan", "pendidikan", "jurusan", "phone", "eselon", "skills", "criticalPosition"]
    };

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.9,
            }
        });
        
        const jsonText = response.text.trim();
        const generatedData = JSON.parse(jsonText);
        
        if (typeof generatedData.skills === 'string') {
            generatedData.skills = generatedData.skills.split(',').map((s: string) => s.trim());
        }

        return generatedData;

    } catch (error) {
        console.error("Error generating employee data from Gemini:", error);
        if (error instanceof Error) {
            throw new Error(`Gagal menghasilkan data: ${error.message}`);
        }
        throw new Error("Terjadi kesalahan yang tidak diketahui saat memanggil API Gemini.");
    }
}