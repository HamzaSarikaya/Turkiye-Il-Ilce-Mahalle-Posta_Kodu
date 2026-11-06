# PTT'den izin için e-posta taslağı

> Bu bir taslaktır; göndermeden önce gözden geçirin. PTT'nin güncel resmî iletişim kanalını (ptt.gov.tr İletişim sayfası, kurumsal e-posta ya da
> resmî başvuru yolu) kendiniz doğrulayın; bu depoda bir adres uydurulmadı. Yazılı izin gelirse verinin nasıl ekleneceği en altta.

**Konu:** Posta kodu sorgulama verisinin açık kaynak bir projede kaynak gösterilerek yayımlanması için izin talebi

Sayın yetkili,

Ben Hamza Sarıkaya. Türkiye adres girişini kolaylaştırmak için açık kaynaklı, MIT lisanslı küçük bir kütüphane geliştiriyorum
(`turkiye-adres`; il → ilçe → mahalle/köy açılır listeleri ve posta koduyla arama).

PTT'nin web sitesindeki Yasal Uyarı sayfası, sitedeki bilgilerin önceden izin alınmadan ve kaynak gösterilmeden çoğaltılamayacağını ve
dağıtılamayacağını belirtiyor. Bu nedenle projeye, PTT'nin posta kodu sorgulama sayfasından (https://www.ptt.gov.tr/posta-kodu) elde edilen
il, ilçe, mahalle/köy adı ve posta kodu bilgilerini sizden yazılı izin almadan **koymadım**. Şunları rica ediyorum:

1. İl, ilçe, mahalle/köy adları ve posta kodlarından oluşan bu listenin, PTT kaynak gösterilerek açık kaynak bir depoda (GitHub) herkesin
   kullanımına sunulmasına izin verir misiniz? İzin verirseniz hangi lisans/koşulla (örneğin kaynak gösterme, ticari kullanım, değiştirme)
   yayımlanabileceğini ve istediğiniz kaynak gösterme ifadesini bildirir misiniz?
2. PTT'nin bu veriyi toplu ve güncel biçimde sunan resmî bir veri seti ya da API'si var mı? Varsa kullanım koşullarını öğrenmek isterim; yoksa
   projede verinin kullanıcıların kendisi tarafından PTT sayfasından üretilmesini mi yoksa yukarıdaki izinle birlikte hazır dosya olarak
   sunulmasını mı tercih edersiniz?
3. Verinin ne sıklıkla güncellendiğini ve en güncel sürümün nereden alınacağını paylaşabilir misiniz?

*(İsteğe bağlı, dürüstlük için önerilir:)* Bilginiz olsun: bir e-ticaret sitesinin adres formunda kullanmak üzere, sitenin kendi sorgularıyla,
istekler arasında 2,5 saniye bekleyerek 6 Kasım 2026'da bu listeyi okudum. Sitenin yapısına zarar vermemek için hızlı toplu sorgu yapmadım. Bu
kullanımla ilgili bir itirazınız olursa bildirmenizi rica ederim.

Cevabınız için şimdiden teşekkür ederim.

Saygılarımla,
Hamza Sarıkaya
(GitHub: HamzaSarikaya)

---

## Yazılı izin gelirse

1. İznin (e-posta) tarih ve metnini `docs/izin/` altına kaydedin ve README ile THIRD-PARTY.md'deki "veri bu depoda yok" bölümlerini izne göre güncelleyin.
2. PTT'nin istediği kaynak gösterme ifadesini README'ye ve veri dosyalarının yanına (`data/places/NOTICE.txt`) koyun.
3. `.gitignore` içindeki `data/places/` satırını kaldırın, `npm run build` çıktısını ekleyin; `tests/turkiye-adres.test.mjs` içindeki
   "depo PTT verisini içermez" testini yeni duruma göre değiştirin.
4. Verinin lisansını (PTT'nin koşuluna göre) ayrı belirtin; MIT yalnızca kodunuz için geçerli kalır.
