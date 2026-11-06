// Ham PTT dosyasını (data/ham/ptt.json) kütüphanenin okuduğu data/places/<plaka>.json dosyalarına çevirir.
//
//   node scripts/build.mjs [--in data/ham/ptt.json] [--out data/places] [--partial]
//
// Ham biçim:   { "<plaka>": { "<İLÇE>": { "<YER, PTT YAZIMIYLA>": ["<posta kodu>", ...] } } }
// Çıktı biçimi: { "<İlçe>": [["Kale Mah.", "69500"], ["Akbulut Köyü", "69502"], ["Yer Adı"], ...] }   (kod yoksa tek elemanlı)
//
// Kurallar: PTT büyük harfle yazar; her harf kümesinin ilk harfi büyük kalır, gerisi küçülür (OSB, SB, MZ, TOKİ gibi
// kısaltmalar ve Romen rakamları büyük kalır, "MH"/"MAH" → "Mah.", "VE" → "ve", kesmeden sonrası küçük). Bir yere PTT
// birden fazla posta kodu veriyorsa (sokaklara göre değişir) kod boş bırakılır. Varsayılan kip katıdır: 81 il ve 973
// ilçenin hepsi ham dosyada olmalıdır; --partial eksik il/ilçeye izin verir (testler için).
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const collator = new Intl.Collator('tr')
const upper = (text) => text.toLocaleUpperCase('tr')
const KEEP = new Set(['OSB', 'SB', 'MZ', 'TOKİ', 'DSİ', 'SSK', 'THK', 'TKİ', 'TRT'])
const SMALL = new Set(['VE'])

/** PTT'nin büyük harfli yer adını okunur yazıma çevirir: "KALE MAH." → "Kale Mah.". */
export function display(raw) {
  const text = raw
    .replace(/^yok \/ /i, '')
    .replace(/,\s*\//g, ' /')
    .replace(/\s+/g, ' ')
    .trim()
  return text.replace(/(\p{L}+)(\.?)/gu, (match, word, dot, offset) => {
    const upperWord = upper(word)
    if (KEEP.has(upperWord) || /^[IVX]{2,}$/.test(upperWord)) return upperWord + dot
    if (upperWord === 'MH' || upperWord === 'MAH') return `Mah${dot || '.'}`
    if (SMALL.has(upperWord)) return word.toLocaleLowerCase('tr') + dot
    const afterApostrophe = offset > 0 && text[offset - 1] === "'"
    const lower = word.toLocaleLowerCase('tr')
    return (afterApostrophe ? lower : upper(lower[0]) + lower.slice(1)) + dot
  })
}

/**
 * @param {Record<string, Record<string, Record<string, string[]>>>} ham
 * @param {{plate: string, name: string, districts: string[]}[]} provinces
 * @param {{ partial?: boolean }} [options]
 * @returns {Map<string, Record<string, ([string] | [string, string])[]>>} plaka → ilçe → yerler
 */
export function buildPlaces(ham, provinces, { partial = false } = {}) {
  const result = new Map()
  for (const province of provinces) {
    const fromPtt = ham[province.plate] ?? ham[String(Number(province.plate))]
    if (!fromPtt) {
      if (partial) continue
      throw new Error(`${province.name}: ham dosyada yok`)
    }
    const pttDistricts = new Map(Object.entries(fromPtt).map(([name, places]) => [upper(name), places]))
    const file = {}
    for (const district of province.districts) {
      const places = pttDistricts.get(upper(district))
      if (!places) {
        if (partial) continue
        throw new Error(`${province.name} / ${district}: ham dosyada yok`)
      }
      const byName = new Map()
      for (const [raw, codes] of Object.entries(places)) {
        const name = display(raw)
        const valid = [...new Set(codes.filter((code) => /^\d{5}$/.test(code) && code.startsWith(province.plate)))]
        const code = valid.length === 1 ? valid[0] : ''
        const seen = byName.get(name)
        if (seen === undefined) byName.set(name, code)
        else if (seen !== code) byName.set(name, '')
      }
      if (byName.size === 0 && !partial) throw new Error(`${province.name} / ${district}: hiç yer yok`)
      file[district] = [...byName.entries()].sort((a, b) => collator.compare(a[0], b[0])).map(([name, code]) => (code ? [name, code] : [name]))
    }
    result.set(province.plate, file)
  }
  return result
}

function main() {
  const args = process.argv.slice(2)
  const option = (name, fallback) => {
    const index = args.indexOf(name)
    return index >= 0 ? args[index + 1] : fallback
  }
  const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
  const input = path.resolve(option('--in', path.join(root, 'data/ham/ptt.json')))
  const output = path.resolve(option('--out', path.join(root, 'data/places')))
  if (!fs.existsSync(input)) {
    console.error(`Ham dosya yok: ${input}\nÖnce \`npm run fetch\` (ya da scripts/fetch-ptt-tarayici.js) ile PTT verisini çekin.`)
    process.exit(1)
  }
  const ham = JSON.parse(fs.readFileSync(input, 'utf8'))
  const provinces = JSON.parse(fs.readFileSync(path.join(root, 'data/provinces.json'), 'utf8'))
  const built = buildPlaces(ham, provinces, { partial: args.includes('--partial') })
  fs.mkdirSync(output, { recursive: true })
  let places = 0
  for (const [plate, file] of built) {
    fs.writeFileSync(path.join(output, `${plate}.json`), JSON.stringify(file))
    for (const list of Object.values(file)) places += list.length
  }
  console.log(`${built.size} il, ${places} mahalle/köy yazıldı: ${output}`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) main()
