# Türkiye İl İlçe Mahalle Posta Kodu (`turkiye-adres`)

**Türkiye il, ilçe, mahalle, köy ve posta kodu** kütüphanesi: 81 il, 973 ilçe, adres formları için açılır liste (dropdown / select) ve posta kodu
sorgulama. Bağımlılıksız, küçük bir JavaScript kütüphanesi (Node.js ve tarayıcı, TypeScript tipleriyle) ve PTT'nin sayfasından kendi
verinizi üreten betikler. Kod **MIT** lisanslıdır.

> **Önemli: mahalle ve posta kodu verisi bu depoda yok.** PTT'nin Yasal Uyarısı, sitesindeki bilgilerin izinsiz kopyalanmasını ve dağıtılmasını
> yasaklıyor; bu yüzden o liste buraya konmaz. Betikle kendi bilgisayarınızda üretirsiniz (aşağıda "Veri"). 81 il ve 973 ilçe adı depoda hazır gelir.
> Ayrıntı: [THIRD-PARTY.md](THIRD-PARTY.md).

*English: a dependency-free library for Turkish provinces, districts, neighbourhoods/villages and postal codes (Node + browser), plus scripts to build
the neighbourhood/postal-code data yourself from PTT's public lookup page. Code is MIT. The PTT-derived data is deliberately not included
(PTT's legal notice forbids unlicensed copying and redistribution). The 81 provinces / 973 districts ship with the package (TurkiyeAPI, MIT).*

## Ne işe yarar

- Adres formunda **İl → İlçe → Mahalle/Köy** açılır listeleri ve posta kodunu otomatik doldurma.
- Posta koduyla yer bulma.
- Harf duyarsız eşleme: `"ISTANBUL"`, `"istanbul"`, `"İstanbul"`, `34` hepsi aynı ili bulur.

## Hızlı başlangıç (il ve ilçe — veri gerekmez)

```bash
git clone https://github.com/HamzaSarikaya/Turkiye-Il-Ilce-Mahalle-Posta_Kodu.git
cd Turkiye-Il-Ilce-Mahalle-Posta_Kodu
```

```js
import { provinces, districts } from './src/index.js'

provinces()            // [{ plate: '01', name: 'Adana' }, ... 81 il]
districts('istanbul')  // ['Adalar', 'Arnavutköy', ... 39 ilçe]; districts(34) de olur
districts('yok')       // null
```

## Veri (mahalle / köy ve posta kodu)

Mahalle ve posta kodu için kendi verinizi üretirsiniz; iki yol var, ikisi de aynı dosyayı üretir (`data/ham/ptt.json`):

**A) Tarayıcıdan (en kolayı; sertifika sorunu olmaz)**
1. <https://www.ptt.gov.tr/posta-kodu> sayfasını açın, geliştirici konsolunu açın (F12 → Console).
2. [`scripts/fetch-ptt-tarayici.js`](scripts/fetch-ptt-tarayici.js) dosyasının içeriğini yapıştırıp Enter'a basın. Yaklaşık 40 dakika sürer; sekmeyi açık tutun.
3. Biten `ptt.json` dosyasını `data/ham/ptt.json` olarak kaydedin.

**B) Node.js ile**
```bash
npm run fetch      # scripts/fetch-ptt.mjs: 2,5 sn arayla, kaldığı yerden devam eder
```
Bazı bilgisayarlarda Node, PTT'nin sertifika zincirini doğrulayamaz (`UNABLE_TO_VERIFY_LEAF_SIGNATURE`). Sertifika doğrulamasını **kapatmayın**; ara
sertifikayı `.pem` olarak verin (`NODE_EXTRA_CA_CERTS=ara.pem npm run fetch`) ya da yol A'yı kullanın.

Sonra:
```bash
npm run build      # data/ham/ptt.json → data/places/<plaka>.json (81 dosya, yaklaşık 2,5 MB)
npm test
```

**Nazik olun.** Betikler PTT'nin sitesinin kendi kullandığı sorgularla, istekler arasında 2,5 saniye bekleyerek çalışır. Süreyi kısaltmayın: hızlı toplu
sorgular PTT sitesinin "İlçeler yüklenirken hata oluştu" demesine yol açtı.

**Hukuk.** Ürettiğiniz verinin kullanımı ve paylaşımı PTT'nin koşullarına tabidir ve sizin sorumluluğunuzdadır (bu bir hukuki görüş değildir). Üretilen
dosyaları (`data/ham/`, `data/places/`) bu depoya geri göndermeyin; `.gitignore` bunları zaten dışarıda tutar.

## Kullanım

### Node.js

```js
import { provinces, districts, places, findByPostalCode, hasPlaceData } from './src/index.js'

places('Bayburt', 'Aydıntepe')
// [{ name: 'Ahmet Yesevi Mah.', postalCode: '69500' }, { name: 'Akbulut Köyü', postalCode: '69502' }, ...]

findByPostalCode('69500')
// [{ province: 'Bayburt', district: 'Aydıntepe', name: 'Ahmet Yesevi Mah.', postalCode: '69500' }, ...]

hasPlaceData() // mahalle verisi üretilmiş mi?
```

Mahalle verisi üretilmemişse `places()` ve `findByPostalCode()` anlaşılır bir `DataMissingError` fırlatır. Örnek: [`examples/node.mjs`](examples/node.mjs).

### Tarayıcı

`data/` klasörünü kendi sitenizden sunun ve istemciyi kullanın; mahalle dosyası il seçilince bir kez indirilir:

```js
import { createAddressClient } from './src/browser.js'

const address = createAddressClient({ baseUrl: '/data/' })   // /data/provinces.json ve /data/places/34.json
const provinceList = await address.provinces()
const districtList = await address.districts('istanbul')
const placeList = await address.places('istanbul', 'Kadıköy')  // [{ name, postalCode }]
```

Çalışan bir açılır liste örneği: [`examples/tarayici.html`](examples/tarayici.html) (`npx serve .` ile açın).

### TypeScript

`src/index.d.ts` ve `src/browser.d.ts` tipleri hazırdır; derleyici gerekmez.

## Veri biçimi

- `data/provinces.json` — `[{ "plate": "34", "name": "İstanbul", "districts": ["Adalar", ...] }]` (depoda var).
- `data/places/<plaka>.json` — `{ "Kadıköy": [["Caferağa Mah.", "34710"], ["Yer Adı"]] }` (sizin ürettiğiniz). Kod yoksa tek elemanlı dizi.

## Bilmeniz gerekenler

- **Yer adları PTT'nin yazımıdır:** büyük harften ilk harfi büyük yazıma çevrilir ("KALE MAH." → "Kale Mah."). PTT'de köy içi mahalleler de ayrı kayıttır
  ("Merkez / Kılıçkaya Köyü"); toplam yaklaşık 72 bin kayıt.
- **Posta kodu `null` olabilir:** PTT bir mahalleye sokaklara göre birden fazla kod veriyorsa (yaklaşık 250 yer) kod boş bırakılır; bunu kullanıcıya yazdırın.
- **Veri güncel olmayabilir:** yeni kurulan mahalleler için verinizi yılda bir yeniden üretin. Formlarda "Listede yok, kendim yazacağım" seçeneği bırakın.
- İl ve ilçe adları 6 Kasım 2026'da PTT'nin listesiyle karşılaştırıldı: 81 ilin hepsinde aynı (973 ilçe).

## Katkı

Hata düzeltmeleri ve iyileştirmeler memnuniyetle karşılanır. **PTT'den üretilmiş veri içeren dosyalar** (`data/ham/`, `data/places/`) pull request'e eklenmemelidir.

## Lisans

[MIT](LICENSE) © 2026 Hamza Sarıkaya. İl/ilçe adları: TurkiyeAPI (MIT). PTT verisi bu lisansın kapsamında değildir; bkz. [THIRD-PARTY.md](THIRD-PARTY.md).
