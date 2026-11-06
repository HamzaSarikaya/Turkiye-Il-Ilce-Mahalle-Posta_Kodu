// TARAYICI KONSOLU BETİĞİ: https://www.ptt.gov.tr/posta-kodu sayfası açıkken geliştirici konsoluna (F12 > Console) yapıştırın.
// Sayfa kendi sertifikasını tarayıcıyla doğruladığı için Node'daki sertifika sorunu olmaz. 973 ilçeyi 2,5 sn arayla okur
// (yaklaşık 40 dakika, sekmeyi açık tutun) ve bitince `ptt.json` dosyasını indirir; indirileni data/ham/ptt.json olarak kaydedip
// `npm run build` çalıştırın. İlerleme tarayıcının yerel depolamasına yazılır; sayfa yenilenirse betiği yeniden yapıştırın, kaldığı yerden devam eder.
//
// NAZİK OLUN: bekleme süresini kısaltmayın (hızlı sorgular PTT sitesinin "İlçeler yüklenirken hata oluştu" demesine yol açtı).
// HUKUK: PTT'nin Yasal Uyarısı (https://www.ptt.gov.tr/yasal-uyari) izinsiz kopyalama ve dağıtımı yasaklar; THIRD-PARTY.md'ye bakın.
(async () => {
  const WAIT = 2500
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
  const KEY = 'turkiye-adres-ham'
  const post = async (body) => {
    for (let attempt = 1; attempt <= 6; attempt += 1) {
      try {
        const response = await fetch('/api/posta-kodu', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        if (!response.ok) throw new Error('HTTP ' + response.status)
        return await response.json()
      } catch (error) {
        console.warn(`hata (${attempt}/6): ${error.message}; ${20 * attempt} sn beklenecek`)
        await sleep(20000 * attempt)
      }
    }
    throw new Error('PTT yanıt vermedi; biraz sonra betiği yeniden yapıştırın.')
  }
  let ham = {}
  try { ham = JSON.parse(localStorage.getItem(KEY) || '{}') } catch { ham = {} }
  for (let plate = 1; plate <= 81; plate += 1) {
    const key = String(plate).padStart(2, '0')
    const districts = (await post({ action: 'ilceler', il_kodu: String(plate) })).filter((item) => item.kod > 0)
    await sleep(WAIT)
    ham[key] = ham[key] || {}
    for (const district of districts) {
      if (ham[key][district.ad]) continue
      const rows = await post({ action: 'postakodu', il_kodu: String(plate), ilce_kodu: String(district.kod) })
      if (!Array.isArray(rows) || rows.length === 0) throw new Error(key + ' / ' + district.ad + ': boş yanıt')
      const places = {}
      for (const row of rows) (places[row.mahalleAdi] = places[row.mahalleAdi] || new Set()).add(row.posta_Kodu)
      ham[key][district.ad] = Object.fromEntries(Object.entries(places).map(([name, codes]) => [name, [...codes]]))
      localStorage.setItem(KEY, JSON.stringify(ham))
      console.log(key, district.ad, Object.keys(places).length, 'yer')
      await sleep(WAIT)
    }
  }
  const link = document.createElement('a')
  link.href = URL.createObjectURL(new Blob([JSON.stringify(ham)], { type: 'application/json' }))
  link.download = 'ptt.json'
  link.click()
  console.log('Bitti: ptt.json indirildi. data/ham/ptt.json olarak kaydedip `npm run build` çalıştırın.')
})()
