import type { Place, Province } from './index.js'

export function normalize(text: string): string

export interface AddressClient {
  provinces(): Promise<Province[]>
  districts(province: string | number): Promise<string[] | null>
  places(province: string | number, district: string): Promise<Place[] | null>
}

/** `baseUrl`: data/ klasörünün adresi; altında provinces.json ve places/<plaka>.json bulunmalıdır. */
export function createAddressClient(options: { baseUrl: string }): AddressClient
