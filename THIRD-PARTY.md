# Üçüncü taraf kaynaklar ve bildirimler

## İl ve ilçe adları — TurkiyeAPI (MIT)

`data/provinces.json` içindeki il (81) ve ilçe (973) adları [TurkiyeAPI](https://github.com/ubeydeozdmr/turkiye-api) veri setlerinden
(`https://api.turkiyeapi.dev/v2/datasets/provinces.json` ve `districts.json`) alınmıştır; yalnızca il/ilçe adları ve plaka kodları kullanılmıştır.
TurkiyeAPI MIT lisanslıdır:

> MIT License. Copyright (c) 2022-2026 Ubeyde Emir Özdemir. Permission is hereby granted, free of charge, to any person obtaining a copy of this
> software and associated documentation files, to deal in the software without restriction, subject to the inclusion of the copyright notice
> and permission notice in all copies. The software is provided "as is", without warranty of any kind.
> (Tam metin: TurkiyeAPI deposundaki LICENSE dosyası.)

Bu adların PTT'nin il/ilçe listesiyle 6 Kasım 2026'da 81 ilin hepsinde birebir aynı olduğu kontrol edilmiştir (aşağıya bakın).

## Mahalle, köy ve posta kodu — PTT (bu depoda YOK)

Mahalle/köy adları ve posta kodları T.C. Posta ve Telgraf Teşkilatı A.Ş.'nin (PTT) posta kodu sorgulama sayfasından
(<https://www.ptt.gov.tr/posta-kodu>) gelir. PTT'nin Yasal Uyarı sayfası (<https://www.ptt.gov.tr/yasal-uyari>, 6 Kasım 2026'da okundu),
sitedeki bilgilerin önceden izin alınmadan ve kaynak gösterilmeden kopyalanamayacağını, çoğaltılamayacağını, yeniden yayımlanamayacağını ve
dağıtılamayacağını belirtir. Bu yüzden **bu depo PTT verisini içermez ve MIT lisansı PTT verisi için bir hak vermez**. MIT yalnızca bu
deponun kendi kodu ve il/ilçe adları listesi (yukarıdaki TurkiyeAPI notuyla) içindir. `scripts/` altındaki araçlar verinin sizin
bilgisayarınızda üretilmesi içindir; ürettiğiniz verinin kullanımı ve paylaşımı PTT'nin koşullarına tabidir ve sizin sorumluluğunuzdadır.
Bu bir hukuki görüş değildir.
