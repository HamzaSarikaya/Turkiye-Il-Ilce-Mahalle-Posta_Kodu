// Ortak, bağımlılıksız çekirdek: Türkçe duyarsız eşleme ve il / ilçe bulma. Hem Node'da (index.js) hem tarayıcıda (browser.js) kullanılır.

const TR_MAP = { 'ı': 'i', 'İ': 'i', 'I': 'i', 'ş': 's', 'Ş': 's', 'ğ': 'g', 'Ğ': 'g', 'ü': 'u', 'Ü': 'u', 'ö': 'o', 'Ö': 'o', 'ç': 'c', 'Ç': 'c', 'â': 'a', 'Â': 'a', 'î': 'i', 'Î': 'i', 'û': 'u', 'Û': 'u' }

/**
 * Karşılaştırma için metni sadeleştirir: küçük harf, Türkçe harfler ASCII karşılığına, boşluklar teke iner.
 * "İSTANBUL", "istanbul" ve "Istanbul" aynı sonucu verir.
 * @param {string} text
 * @returns {string}
 */
export function normalize(text) {
  return String(text)
    .replace(/[ıİIşŞğĞüÜöÖçÇâÂîÎûÛ]/g, (letter) => TR_MAP[letter])
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Plaka kodu ("34", "6", 34) ya da il adıyla ili bulur.
 * @param {ReadonlyArray<{plate: string, name: string, districts: readonly string[]}>} provinces
 * @param {string | number} key
 */
export function findProvince(provinces, key) {
  const text = String(key).trim()
  if (/^\d{1,2}$/.test(text)) {
    const plate = text.padStart(2, '0')
    return provinces.find((province) => province.plate === plate) ?? null
  }
  const wanted = normalize(text)
  return provinces.find((province) => normalize(province.name) === wanted) ?? null
}

/**
 * İlçeyi (il içinde, harf duyarsız) bulur ve yazımını döndürür.
 * @param {{districts: readonly string[]}} province
 * @param {string} name
 * @returns {string | null}
 */
export function findDistrict(province, name) {
  const wanted = normalize(name)
  return province.districts.find((district) => normalize(district) === wanted) ?? null
}

/**
 * Mahalle dosyasındaki ham satırı ([ad] ya da [ad, kod]) nesneye çevirir.
 * @param {readonly [string, string?]} row
 * @returns {{name: string, postalCode: string | null}}
 */
export function toPlace(row) {
  return { name: row[0], postalCode: row[1] ?? null }
}

export class DataMissingError extends Error {
  constructor(plate) {
    super(
      `Mahalle verisi bulunamadı (data/places/${plate}.json). Veri bu projeyle birlikte gelmez; ` +
        'önce `npm run fetch` ve `npm run build` ile kendi bilgisayarınızda üretin (README: "Veri").',
    )
    this.name = 'DataMissingError'
    this.plate = plate
  }
}
