# Auto servis Web App

# Opis projekta
Ovaj projekt je rezultat timskog rada u sklopu projeknog zadatka kolegija [Programsko inženjerstvo](https://www.fer.unizg.hr/predmet/proinz) na Fakultetu elektrotehnike i računarstva Sveučilišta u Zagrebu. 

Cilj je ovoga projekta razviti aplikaciju koja olakšava i prati rad auto servisa. Omogućava korisnicima da zakažu termin u auto servisu, da prate rad i status njihovog vozila te pruža mogućnost komunikacije sa servisom. Osim toga, olakšava preraspodjelu rada serviserima, pruža im detaljan uvid u svako vozilo kao i mogućnost vođenja detaljne evidencije vezane uz svako vozilo. Vlasniku auto servisa pruža mogućnost dubinskog razumijevanja i pregled rada auto servisa te njegovo vođenje. Sustav olakšava u promjene određenih značajki auto servisa te uvidom u statistiku pruža koristan pregled svih informacija i pruža alat za planiranje i kontinuiran razvoj i napredak auto servisa.
> Razvojem ovog projekta, tim je ostvario bolje razumijevanje stvarnoga svijeta, kao i napredak svojih inženjerskih sposobnosti.

# Funkcijski zahtjevi
Sustav mora omogućiti registraciju i prijavu korisnika putem vanjskog OAuth2 servisa (npr. Google, Microsoft), bez potrebe za lokalnom lozinkom.

Registrirani korisnik mora moći unijeti osnovne podatke o vozilu, uključujući marku, model, godinu, registraciju i opis problema.

Korisnik mora moći pregledati slobodne termine za servis, rezervirati termin i po potrebi zamjensko vozilo, uz automatsko slanje potvrde e-mailom.

Sustav mora automatski generirati PDF obrazac prilikom predaje i preuzimanja vozila, koji sadrži potpise korisnika i servisera.

Sustav mora omogućiti pregled statistike o radu servisa (broj zaprimljenih vozila, trajanje popravaka, zauzeće zamjenskih vozila) te izvoz podataka u PDF, XML i XLSX formatu.

Aplikacija mora imati responzivan dizajn prilagođen različitim uređajima (računalo, tablet, mobitel) i prikazivati lokaciju servisa putem Google Maps servisa.


# Tehnologije

Node.JS za pokretanje front enda ( + three.js)

Docker, Spring Boot (Java) za pokretanje back enda

Render.com poslužitelj servisa

Postgres baza podataka (SQL)

OAuth2 servis za autorizaciju

VS Code za razvoj front enda

IntelliJ IDEA za razvoj back enda

Blender, Three.js - za 3D modele


# Članovi tima
[Grabant	David](https://github.com/dgrabant) <br>
[Nell	Dora](https://github.com/Doraa10) <br>
[Šantak	Antonio](https://github.com/antonio-santak) <br>
[Car	Mihael](https://github.com/MihaelCar) <br>
[Žlender	Luka](https://github.com/LukaZlender) <br>
[Ivelić	Luka](https://github.com/LukaIvelic-fer) <br>


# 📝 Kodeks ponašanja [![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](CODE_OF_CONDUCT.md)
Kao studenti sigurno ste upoznati s minimumom prihvatljivog ponašanja definiran u [KODEKS PONAŠANJA STUDENATA FAKULTETA ELEKTROTEHNIKE I RAČUNARSTVA SVEUČILIŠTA U ZAGREBU](https://www.fer.unizg.hr/images/50021552/Kodeks_ponasanja_studenata_FER-a.pdf), te dodatnim naputcima za timski rad na predmetu [Programsko inženjerstvo](https://wwww.fer.hr).
Očekujemo da ćete poštovati [etički kodeks IEEE-a](https://www.ieee.org/about/corporate/governance/p7-8.html) koji ima važnu obrazovnu funkciju sa svrhom postavljanja najviših standarda integriteta, odgovornog ponašanja i etičkog ponašanja u profesionalnim aktivnosti. Time profesionalna zajednica programskih inženjera definira opća načela koja definiranju  moralni karakter, donošenje važnih poslovnih odluka i uspostavljanje jasnih moralnih očekivanja za sve pripadnike zajenice.

Kodeks ponašanja skup je provedivih pravila koja služe za jasnu komunikaciju očekivanja i zahtjeva za rad zajednice/tima. Njime se jasno definiraju obaveze, prava, neprihvatljiva ponašanja te  odgovarajuće posljedice (za razliku od etičkog kodeksa). U ovom repozitoriju dan je jedan od široko prihvačenih kodeks ponašanja za rad u zajednici otvorenog koda.
>### Poboljšajte funkcioniranje tima:
>* definirajte načina na koji će rad biti podijeljen među članovima grupe
>* dogovorite kako će grupa međusobno komunicirati.
>* ne gubite vrijeme na dogovore na koji će grupa rješavati sporove primjenite standarde!
>* implicitno podrazmijevamo da će svi članovi grupe slijediti kodeks ponašanja.
 
>###  Prijava problema
>Najgore što se može dogoditi je da netko šuti kad postoje problemi. Postoji nekoliko stvari koje možete učiniti kako biste najbolje riješili sukobe i probleme:
>* Obratite mi se izravno [e-pošta](mailto:vlado.sruk@fer.hr) i  učinit ćemo sve što je u našoj moći da u punom povjerenju saznamo koje korake trebamo poduzeti kako bismo riješili problem.
>* Razgovarajte s vašim asistentom jer ima najbolji uvid u dinamiku tima. Zajedno ćete saznati kako riješiti sukob i kako izbjeći daljnje utjecanje u vašem radu.
>* Ako se osjećate ugodno neposredno razgovarajte o problemu. Manje incidente trebalo bi rješavati izravno. Odvojite vrijeme i privatno razgovarajte s pogođenim članom tima te vjerujte u iskrenost.

# 📝 Licenca
Važeča (1)
[![CC BY-NC-SA 4.0][cc-by-nc-sa-shield]][cc-by-nc-sa]

Ovaj repozitorij sadrži otvoreni obrazovni sadržaji (eng. Open Educational Resources)  i licenciran je prema pravilima Creative Commons licencije koja omogućava da preuzmete djelo, podijelite ga s drugima uz 
uvjet da navođenja autora, ne upotrebljavate ga u komercijalne svrhe te dijelite pod istim uvjetima [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License HR][cc-by-nc-sa].
>
> ### Napomena:
>
> Svi paketi distribuiraju se pod vlastitim licencama.
> Svi upotrijebleni materijali  (slike, modeli, animacije, ...) distribuiraju se pod vlastitim licencama.

[![CC BY-NC-SA 4.0][cc-by-nc-sa-image]][cc-by-nc-sa]

[cc-by-nc-sa]: https://creativecommons.org/licenses/by-nc/4.0/deed.hr 
[cc-by-nc-sa-image]: https://licensebuttons.net/l/by-nc-sa/4.0/88x31.png
[cc-by-nc-sa-shield]: https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg

Orginal [![cc0-1.0][cc0-1.0-shield]][cc0-1.0]
>
>COPYING: All the content within this repository is dedicated to the public domain under the CC0 1.0 Universal (CC0 1.0) Public Domain Dedication.
>
[![CC0-1.0][cc0-1.0-image]][cc0-1.0]

[cc0-1.0]: https://creativecommons.org/licenses/by/1.0/deed.en
[cc0-1.0-image]: https://licensebuttons.net/l/by/1.0/88x31.png
[cc0-1.0-shield]: https://img.shields.io/badge/License-CC0--1.0-lightgrey.svg

### Reference na licenciranje repozitorija
