// PTT'nin posta kodu sorgulama sayfasının kullandığı isteklerle (https://www.ptt.gov.tr/posta-kodu) 81 ilin 973 ilçesindeki
// mahalle / köy adlarını ve posta kodlarını okur ve data/ham/ptt.json dosyasına yazar. Kendi bilgisayarınızda çalıştırın.
//
//   node scripts/fetch-ptt.mjs
//
// NAZİK OLUN: PTT'nin sitesi tek tek sorgular için tasarlandı. Betik istekler arasında 2,5 sn bekler (yaklaşık 40 dakika sürer),
// hata alırsa giderek uzayan bekleme yapar, durdurulursa kaldığı yerden devam eder. Bekleme süresini kısaltmayın; 5 Kasım 2026'da
// hızlı sorgular PTT sitesinin "İlçeler yüklenirken hata oluştu" demesine yol açtı.
//
// SERTİFİKA: Bazı bilgisayarlarda Node, PTT'nin sertifika zincirini doğrulayamaz (UNABLE_TO_VERIFY_LEAF_SIGNATURE; PTT sunucusu ara
// sertifikayı göndermiyor olabilir). Sertifika doğrulamasını KAPATMAYIN. Çözümler: ara sertifikayı bir .pem dosyasına koyup
// `NODE_EXTRA_CA_CERTS=ara.pem node scripts/fetch-ptt.mjs` çalıştırmak, ya da tarayıcıda çalışan scripts/fetch-ptt-tarayici.js'i kullanmak.
//
// HUKUK: PTT'nin Yasal Uyarısı (https://www.ptt.gov.tr/yasal-uyari) sitedeki bilgilerin izinsiz kopyalanmasını ve dağıtılmasını
// yasaklar. Çektiğiniz veriyi nerede kullanacağınız ve paylaşacağınız sizin sorumluluğunuzdadır; THIRD-PARTY.md'ye bakın.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const API = 'https://www.ptt.gov.tr/api/posta-kodu'
const WAIT_MS = 2500
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const target = path.join(root, 'data/ham/ptt.json')
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function post(body) {
  for (let attempt = 1; attempt <= 6; attempt += 1) {
    try {
      const response = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'User-Agent': 'turkiye-adres (acik kaynak veri araci; nazik, 2.5 sn arayla)' },
        body: JSON.stringify(body),
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      return await response.json()
    } catch (error) {
      const code = error?.cause?.code
      if (code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE' || code === 'CERT_HAS_EXPIRED') {
        console.error(`Sertifika hatası (${code}). Dosyanın başındaki SERTİFİKA notuna bakın; doğrulamayı kapatmayın.`)
        process.exit(1)
      }
      console.error(`  hata (${attempt}/6): ${error.message}; ${20 * attempt} sn beklenecek`)
      await sleep(20_000 * attempt)
    }
  }
  throw new Error('PTT yanıt vermedi; biraz sonra yeniden çalıştırın (kaldığı yerden devam eder).')
}

fs.mkdirSync(path.dirname(target), { recursive: true })
const ham = fs.existsSync(target) ? JSON.parse(fs.readFileSync(target, 'utf8')) : {}
const save = () => fs.writeFileSync(target, JSON.stringify(ham))
let sinceSave = 0

for (let plate = 1; plate <= 81; plate += 1) {
  const key = String(plate).padStart(2, '0')
  const districts = (await post({ action: 'ilceler', il_kodu: String(plate) })).filter((item) => item.kod > 0)
  await sleep(WAIT_MS)
  ham[key] ??= {}
  for (const district of districts) {
    if (ham[key][district.ad]) continue
    const rows = await post({ action: 'postakodu', il_kodu: String(plate), ilce_kodu: String(district.kod) })
    if (!Array.isArray(rows) || rows.length === 0) throw new Error(`${key} / ${district.ad}: boş yanıt`)
    const places = {}
    for (const row of rows) (places[row.mahalleAdi] ??= new Set()).add(row.posta_Kodu)
    ham[key][district.ad] = Object.fromEntries(Object.entries(places).map(([name, codes]) => [name, [...codes]]))
    console.log(`${key} ${district.ad}: ${Object.keys(places).length} yer`)
    if (++sinceSave >= 20) { save(); sinceSave = 0 }
    await sleep(WAIT_MS)
  }
  save()
}
save()
console.log(`Bitti: ${target}\nŞimdi: npm run build`)
