import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { findDistrict, findProvince, normalize } from '../src/core.js'
import { buildPlaces, display } from '../scripts/build.mjs'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const provinces = JSON.parse(fs.readFileSync(path.join(root, 'data/provinces.json'), 'utf8'))
const ham = JSON.parse(fs.readFileSync(path.join(root, 'tests/fixtures/ham-ornek.json'), 'utf8'))

test('data/provinces.json: 81 il, 973 ilçe, plaka sırası, her ilde ilçe var', () => {
  assert.equal(provinces.length, 81)
  assert.deepEqual(provinces.map((province) => province.plate), Array.from({ length: 81 }, (_, index) => String(index + 1).padStart(2, '0')))
  assert.equal(provinces.flatMap((province) => province.districts).length, 973)
  const counts = Object.fromEntries(provinces.map((province) => [province.name, province.districts.length]))
  assert.deepEqual([counts['İstanbul'], counts['Ankara'], counts['İzmir'], counts['Bayburt'], counts['Kilis']], [39, 25, 30, 3, 4])
})

test('normalize: Türkçe harf ve büyük/küçük harf duyarsız', () => {
  assert.equal(normalize('İSTANBUL'), 'istanbul')
  assert.equal(normalize('Istanbul'), 'istanbul')
  assert.equal(normalize('  ŞANLIURFA  '), 'sanliurfa')
  assert.equal(normalize('Iğdır'), 'igdir')
  assert.equal(normalize('Çanakkale'), normalize('CANAKKALE'))
})

test('findProvince ve findDistrict: plaka, ad, harf duyarsız; bulunamazsa null', () => {
  assert.equal(findProvince(provinces, 34)?.name, 'İstanbul')
  assert.equal(findProvince(provinces, '6')?.name, 'Ankara')
  assert.equal(findProvince(provinces, 'izmir')?.plate, '35')
  assert.equal(findProvince(provinces, 'ığdır')?.name, 'Iğdır')
  assert.equal(findProvince(provinces, 'yok'), null)
  assert.equal(findProvince(provinces, 82), null)
  const bayburt = findProvince(provinces, 'bayburt')
  assert.equal(findDistrict(bayburt, 'AYDINTEPE'), 'Aydıntepe')
  assert.equal(findDistrict(bayburt, 'demirozu'), 'Demirözü')
  assert.equal(findDistrict(bayburt, 'Kadıköy'), null)
})

test('display: PTT yazımı okunur yazıma çevrilir', () => {
  assert.equal(display('KALE MAH.'), 'Kale Mah.')
  assert.equal(display('HACI ALİ EFENDİ MAH.'), 'Hacı Ali Efendi Mah.')
  assert.equal(display('AKBULUT KÖYÜ'), 'Akbulut Köyü')
  assert.equal(display('MERKEZ / KILIÇKAYA KÖYÜ'), 'Merkez / Kılıçkaya Köyü')
  assert.equal(display('YENİ MH.'), 'Yeni Mah.')
  assert.equal(display('ORNEK OSB'), 'Ornek OSB')
  assert.equal(display('II. SANAYİ MAH.'), 'II. Sanayi Mah.')
  assert.equal(display("ALİ'NİN KÖYÜ"), "Ali'nin Köyü")
  assert.equal(display('yok / TEST KÖYÜ'), 'Test Köyü')
  assert.equal(display('BİRİNCİ MH,  / ÜÇÜNCÜ KÖYÜ'), 'Birinci Mah. / Üçüncü Köyü')
  assert.equal(display('KARTAL VE ÇAY MAH.'), 'Kartal ve Çay Mah.')
  assert.equal(display('19 MAYIS MAH.'), '19 Mayıs Mah.')
})

test('buildPlaces: kod tek ise yazılır, birden fazlaysa boş kalır; katı kipte eksik veri hata verir', () => {
  const built = buildPlaces(ham, provinces, { partial: true })
  assert.deepEqual([...built.keys()], ['34', '69'])
  const aydintepe = built.get('69')['Aydıntepe']
  assert.deepEqual(aydintepe.find(([name]) => name === 'Örnek Mah.'), ['Örnek Mah.', '69500'])
  assert.deepEqual(aydintepe.find(([name]) => name === 'Çok Kodlu Mah.'), ['Çok Kodlu Mah.'])
  assert.equal(aydintepe.length, 6)
  assert.deepEqual(built.get('69')['Demirözü'], undefined)
  assert.throws(() => buildPlaces(ham, provinces), /ham dosyada yok/)
  // posta kodu il plakasıyla başlamıyorsa kullanılmaz
  const wrong = buildPlaces({ 69: { AYDINTEPE: { 'X MAH.': ['34500'] } } }, provinces, { partial: true })
  assert.deepEqual(wrong.get('69')['Aydıntepe'], [['X Mah.']])
})

/** Kütüphaneyi, geçici bir veri klasörüyle ayrı bir süreçte çalıştırıp JSON sonucu döndürür. */
function runLibrary(dataDir, code) {
  const script = `import * as lib from ${JSON.stringify(new URL('../src/index.js', import.meta.url).href)}\n${code}`
  const out = execFileSync(process.execPath, ['--input-type=module', '-e', script], { env: { ...process.env, TURKIYE_ADRES_DATA: dataDir }, encoding: 'utf8' })
  return JSON.parse(out)
}

test('kütüphane (Node): il, ilçe, mahalle ve posta koduyla arama; veri yoksa anlaşılır hata', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'turkiye-adres-'))
  try {
    fs.mkdirSync(path.join(dir, 'places'))
    fs.copyFileSync(path.join(root, 'data/provinces.json'), path.join(dir, 'provinces.json'))
    for (const [plate, file] of buildPlaces(ham, provinces, { partial: true })) fs.writeFileSync(path.join(dir, 'places', `${plate}.json`), JSON.stringify(file))

    const result = runLibrary(dir, `
      const attempt = (fn) => { try { return fn() } catch (error) { return { error: error.name, message: error.message } } }
      console.log(JSON.stringify({
        provinceCount: lib.provinces().length,
        first: lib.provinces()[0],
        districts: lib.districts('ISTANBUL').length,
        noProvince: lib.districts('yok'),
        places: lib.places('bayburt', 'aydintepe').map((place) => place.name),
        kale: lib.places(69, 'Aydıntepe').find((place) => place.name === 'Örnek Mah.'),
        multi: lib.places(69, 'Aydıntepe').find((place) => place.name === 'Çok Kodlu Mah.'),
        noDistrict: lib.places('bayburt', 'kadikoy'),
        byCode: lib.findByPostalCode('34710'),
        badCode: lib.findByPostalCode('abc'),
        missing: attempt(() => lib.places('adana', 'seyhan')),
        has: lib.hasPlaceData(),
      }))`)
    assert.equal(result.provinceCount, 81)
    assert.deepEqual(result.first, { plate: '01', name: 'Adana' })
    assert.equal(result.districts, 39)
    assert.equal(result.noProvince, null)
    assert.equal(result.places.length, 6)
    assert.deepEqual(result.kale, { name: 'Örnek Mah.', postalCode: '69500' })
    assert.deepEqual(result.multi, { name: 'Çok Kodlu Mah.', postalCode: null })
    assert.equal(result.noDistrict, null)
    assert.deepEqual(result.byCode.map((match) => `${match.province}/${match.district}/${match.name}`), ['İstanbul/Kadıköy/Birinci Mah.', 'İstanbul/Kadıköy/İkinci Mah.'])
    assert.deepEqual(result.badCode, [])
    assert.equal(result.missing.error, 'DataMissingError')
    assert.match(result.missing.message, /npm run fetch/)
    assert.equal(result.has, true, 'bu klasörde places/34.json var')
  } finally {
    fs.rmSync(dir, { recursive: true, force: true })
  }
})

test('depo PTT verisini içermez: .gitignore data/ham ve data/places dışlar, data/ altında yalnızca provinces.json izlenir', () => {
  const ignore = fs.readFileSync(path.join(root, '.gitignore'), 'utf8')
  assert.match(ignore, /^data\/ham\/$/m)
  assert.match(ignore, /^data\/places\/$/m)
  assert.deepEqual(fs.readdirSync(path.join(root, 'data')).filter((name) => name !== 'ham' && name !== 'places'), ['provinces.json'])
})
