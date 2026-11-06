export interface Province {
  /** İki haneli plaka kodu, örn. "34". */
  plate: string
  name: string
}

export interface Place {
  /** Mahalle ya da köy, PTT'nin adıyla ama ilk harfleri büyük: "Kale Mah.", "Akbulut Köyü". */
  name: string
  /** 5 haneli posta kodu; PTT o yer için birden fazla kod veriyorsa null. */
  postalCode: string | null
}

export interface PostalMatch {
  province: string
  district: string
  name: string
  postalCode: string
}

/** Mahalle verisi bu bilgisayarda üretilmemişse fırlatılır (README: "Veri"). */
export class DataMissingError extends Error {
  plate: string
}

/** Türkçe harf ve büyük/küçük harf duyarsız karşılaştırma için sadeleştirir: "İSTANBUL" → "istanbul". */
export function normalize(text: string): string

/** 81 il, plaka sırasıyla. */
export function provinces(): Province[]

/** Bir ilin ilçeleri (Türkçe alfabe sırası). İl: plaka ("34", 34) ya da ad ("istanbul"). Bulunamazsa null. */
export function districts(province: string | number): string[] | null

/** Bir ilçenin mahalle/köyleri. İl ya da ilçe bulunamazsa null; veri üretilmemişse DataMissingError. */
export function places(province: string | number, district: string): Place[] | null

/** Mahalle verisi üretilmiş mi? */
export function hasPlaceData(): boolean

/** Bir posta koduna sahip bütün yerler (5 hane değilse boş dizi). Veri üretilmemişse DataMissingError. */
export function findByPostalCode(code: string | number): PostalMatch[]
