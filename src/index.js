// Node.js için giriş: il, ilçe, mahalle / köy ve posta kodu sorguları. Bağımlılık yok.
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { DataMissingError, findDistrict, findProvince, normalize, toPlace } from './core.js'

export { DataMissingError, normalize }

// Veri klasörü: bu paketin data/ klasörü; TURKIYE_ADRES_DATA ortam değişkeniyle başka bir klasöre yönlendirilebilir (testler böyle yapar).
const dataDir = process.env.TURKIYE_ADRES_DATA
  ? pathToFileURL(path.resolve(process.env.TURKIYE_ADRES_DATA) + path.sep)
  : new URL('../data/', import.meta.url)
const provinceList = JSON.parse(fs.readFileSync(new URL('provinces.json', dataDir), 'utf8'))
const placeCache = new Map()

function readPlaces(plate) {
  let file = placeCache.get(plate)
  if (file === undefined) {
    try {
      file = JSON.parse(fs.readFileSync(new URL(`places/${plate}.json`, dataDir), 'utf8'))
    } catch (error) {
      if (error && error.code === 'ENOENT') throw new DataMissingError(plate)
      throw error
    }
    placeCache.set(plate, file)
  }
  return file
}

/**
 * 81 il, plaka sırasıyla.
 * @returns {{plate: string, name: string}[]}
 */
export function provinces() {
  return provinceList.map(({ plate, name }) => ({ plate, name }))
}

/**
 * Bir ilin ilçeleri (Türkçe alfabe sırasıyla). İl, plaka ("34") ya da ad ("istanbul") olabilir; bulunamazsa null.
 * @param {string | number} province
 * @returns {string[] | null}
 */
export function districts(province) {
  const found = findProvince(provinceList, province)
  return found ? [...found.districts] : null
}

/**
 * Bir ilçenin mahalle ve köyleri, varsa posta koduyla. Posta kodu null ise PTT o yer için birden fazla kod
 * veriyor (sokaklara göre değişiyor) demektir. İl ya da ilçe bulunamazsa null; mahalle verisi üretilmemişse
 * DataMissingError fırlatır.
 * @param {string | number} province
 * @param {string} district
 * @returns {{name: string, postalCode: string | null}[] | null}
 */
export function places(province, district) {
  const found = findProvince(provinceList, province)
  if (!found) return null
  const districtName = findDistrict(found, district)
  if (!districtName) return null
  return (readPlaces(found.plate)[districtName] ?? []).map(toPlace)
}

/** Mahalle verisi bu bilgisayarda üretilmiş mi? */
export function hasPlaceData() {
  return fs.existsSync(new URL('places/34.json', dataDir))
}

let postalIndex = null

/**
 * Bir posta koduna sahip bütün yerler. Veri üretilmemişse DataMissingError fırlatır. İlk çağrıda 81 dosya okunur.
 * @param {string | number} code 5 haneli posta kodu
 * @returns {{province: string, district: string, name: string, postalCode: string}[]}
 */
export function findByPostalCode(code) {
  const wanted = String(code).trim()
  if (!/^\d{5}$/.test(wanted)) return []
  if (postalIndex === null) {
    const index = new Map()
    let loaded = 0
    for (const province of provinceList) {
      let file
      try {
        file = readPlaces(province.plate)
      } catch (error) {
        if (error instanceof DataMissingError) continue // kısmi veri: olan illerle çalış
        throw error
      }
      loaded += 1
      for (const [district, rows] of Object.entries(file)) {
        for (const [name, postalCode] of rows) {
          if (!postalCode) continue
          const list = index.get(postalCode) ?? []
          list.push({ province: province.name, district, name, postalCode })
          index.set(postalCode, list)
        }
      }
    }
    if (loaded === 0) throw new DataMissingError(provinceList[0].plate)
    postalIndex = index
  }
  return postalIndex.get(wanted) ?? []
}
