// Çalıştırma (veri üretildikten sonra; README "Veri"):  node examples/node.mjs
import { districts, findByPostalCode, hasPlaceData, places, provinces } from '../src/index.js'

console.log('İl sayısı:', provinces().length) // 81
console.log('İstanbul ilçeleri:', districts('istanbul')?.length) // 39 (plaka da olur: districts(34))

if (!hasPlaceData()) {
  console.log('Mahalle verisi henüz üretilmemiş: önce `npm run fetch` ve `npm run build` (README: "Veri").')
} else {
  const list = places('Bayburt', 'Aydıntepe')
  console.log(list?.slice(0, 3)) // [{ name: 'Ahmet Yesevi Mah.', postalCode: '69500' }, ...]
  console.log(findByPostalCode('69500').slice(0, 3)) // [{ province: 'Bayburt', district: 'Aydıntepe', name: ..., postalCode: '69500' }, ...]
}
