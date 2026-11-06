// Tarayıcı için giriş (bağımlılık yok, derleyici gerekmez): `fetch` ile JSON dosyalarını okur.
// Dosyaları kendi sitenizden sunun (örnek: examples/tarayici.html); mahalle dosyaları il seçilince bir kez indirilir.
import { findDistrict, findProvince, normalize, toPlace } from './core.js'

export { normalize }

/**
 * @param {{ baseUrl: string }} options  data/ klasörünün adresi, örn. "/adres/" ("provinces.json" ve "places/34.json" altında bulunur)
 */
export function createAddressClient({ baseUrl }) {
  const base = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`
  let provincePromise = null
  const placePromises = new Map()

  const getJson = async (path) => {
    const response = await fetch(base + path)
    if (!response.ok) throw new Error(`${base + path}: HTTP ${response.status}`)
    return response.json()
  }
  const loadProvinces = () => (provincePromise ??= getJson('provinces.json').catch((error) => { provincePromise = null; throw error }))
  const loadPlaces = (plate) => {
    let pending = placePromises.get(plate)
    if (!pending) {
      pending = getJson(`places/${plate}.json`).catch((error) => { placePromises.delete(plate); throw error })
      placePromises.set(plate, pending)
    }
    return pending
  }

  return {
    /** @returns {Promise<{plate: string, name: string}[]>} */
    async provinces() {
      return (await loadProvinces()).map(({ plate, name }) => ({ plate, name }))
    },
    /** @returns {Promise<string[] | null>} */
    async districts(province) {
      const found = findProvince(await loadProvinces(), province)
      return found ? [...found.districts] : null
    },
    /** @returns {Promise<{name: string, postalCode: string | null}[] | null>} */
    async places(province, district) {
      const found = findProvince(await loadProvinces(), province)
      if (!found) return null
      const districtName = findDistrict(found, district)
      if (!districtName) return null
      return ((await loadPlaces(found.plate))[districtName] ?? []).map(toPlace)
    },
  }
}
