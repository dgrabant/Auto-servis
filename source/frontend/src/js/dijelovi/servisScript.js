//povezivanje s bazom podataka
const API_BASE = "https://auto-servis.onrender.com/api";
// Globalna varijabla za spremanje filtriranih popravaka (za PDF)
let mojiPopravciCache = [];

function getAuthHeaders() {
    const token = localStorage.getItem("authToken");
    return {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
    };
}

// Helper funkcija za dohvat trenutnog korisnika neovisno o submitu forme
async function dohvatiIdLogiranogKorisnika() {
    try {
        const responseKorisnik = await fetch(`${API_BASE}/korisnik/about`, {
            method: "GET",
            headers: getAuthHeaders()
        });
        if (!responseKorisnik.ok) return null;
        const data = await responseKorisnik.json();
        return data.idKorisnik;
    } catch (error) {
        console.error("Greška pri dohvatu korisnika:", error);
        return null;
    }
}

// Postavi maksimalnu godinu čim se stranica učita
const inputGodina = document.getElementById('godina-vozila');
const trenutnaGodina = new Date().getFullYear();
if (inputGodina) inputGodina.max = trenutnaGodina;

// Funkcija koja provjerava unos odma
window.validacijaGodine = function(input) {
    const errorSpan = document.getElementById('godina-error');
    if (input.value > trenutnaGodina) {
        input.value = trenutnaGodina;
        errorSpan.style.display = 'block';
    } else {
        errorSpan.style.display = 'none';
    }
};

async function popuniTermineIzBaze() {
    const token = localStorage.getItem("authToken");
    const selectTermin = document.getElementById('termin');
    
    if (!selectTermin) return;

    try {
        const response = await fetch(`${API_BASE}/termin`, {
            method: "GET",
            headers: { 
                "Authorization": "Bearer " + token,
                "Content-Type": "application/json"
            }
        });

        if (response.ok) {
            const termini = await response.json();
            selectTermin.innerHTML = '<option value="" disabled selected>Odaberite termin</option>';
            
            termini.forEach(t => {
                const opt = document.createElement('option');
                opt.value = t.idTermin;
                const datum = new Date(t.datumVrijeme);
                const formatiranDatum = datum.toLocaleString('hr-HR', { 
                    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' 
                });
                opt.innerText = formatiranDatum;
                selectTermin.appendChild(opt);
            });
        }
    } catch (err) {
        console.warn("Greška u komunikaciji s bazom.", err);
    }
}

export async function dohvatiPodatkeZaServis() {
    console.log("Pokusaj dohvacanja podataka iz baze");
    popuniModeleAuta();
    popuniTermineIzBaze();
    
    fetch(`${API_BASE}/dijeloviusluge`, { headers: getAuthHeaders() })
        .then(res => {
            if (!res.ok) throw new Error("Status: " + res.status);
            return res.json();
        })
        .then(data => {
            let items = Array.isArray(data) ? data : (data.dijelovi || data.usluge || []);
            const samoUsluge = items.filter(item => item.vrsta === 'usluga');
            const samoDijelovi = items.filter(item => item.vrsta === 'dio');

            prikaziStavke(samoUsluge, 'usluge-popis');
            prikaziStavke(samoDijelovi, 'dijelovi-popis');
        })
        .catch(err => {
            console.error("Greska kod dohvacanja dijelova i usluga!" + err);
        });
}

async function popuniModeleAuta() {
    const select = document.getElementById('marka-model');
    if (!select) return;

    try {
        const response = await fetch(`${API_BASE}/vrstavozila`, {
            method: "GET",
            headers: getAuthHeaders()
        });

        if (!response.ok) throw new Error("Status: " + response.status);
        const modeli = await response.json();

        select.innerHTML = '<option value="" disabled selected>Odaberite vozilo</option>';
        modeli.forEach(model => {
            const opt = document.createElement('option');
            opt.value = model.idVrsta; 
            opt.innerText = model.nazivModela; 
            select.appendChild(opt);
        });

    } catch (err) {
        console.warn("Greska kod dohvacanja modela auta iz baze!", err);
    }
}

function prikaziStavke(lista, kontejnerId) {
    const kontejner = document.getElementById(kontejnerId);
    if (!kontejner) return;

    kontejner.innerHTML = '';
    if (lista.length === 0) {
        kontejner.innerHTML = '<p style="color: gray;">Nema podataka za prikaz.</p>';
        return;
    }

    lista.forEach(stavka => {
        const div = document.createElement('div');
        div.className = 'stavka-ponude'; 
        
        const naziv = stavka.naziv || "Bez naziva";
        const cijena = stavka.cijena ? `${stavka.cijena} €` : "0 €";

        div.innerHTML = `
            <span class="stavka-naziv">${naziv}</span>
            <span class="stavka-cijena">${cijena}</span>
        `;
        
        div.dataset.id = stavka.idDijelaUsluge;
        div.dataset.cijena = stavka.cijena || 0;

        div.onclick = function() {
            this.classList.toggle('active');
            if (typeof osvjeziPrikazOdabranih === 'function') osvjeziPrikazOdabranih();
        };

        kontejner.appendChild(div);
    });
}

function osvjeziPrikazOdabranih() {
    const listaUI = document.getElementById('popis-za-popravak');
    const skriveniInput = document.getElementById('finalni-popis-input');
    
    const aktivneStavke = document.querySelectorAll('.stavka-ponude.active');
    
    if (aktivneStavke.length === 0) {
        listaUI.innerHTML = '<li>Odaberite usluge i dijelove za prikaz na popisu</li>';
        skriveniInput.value = "";
        return;
    }

    listaUI.innerHTML = ""; 
    let imenaUsluga = [];

    aktivneStavke.forEach(stavka => {
        const ime = stavka.innerText;
        imenaUsluga.push(ime);

        const li = document.createElement('li');
        li.innerHTML = `<i class="fas fa-check-circle" style="margin-right: 8px;"></i> ${ime}`;
        
        li.onclick = function() {
            stavka.classList.remove('active');
            osvjeziPrikazOdabranih();
        };
        listaUI.appendChild(li);
    });
    skriveniInput.value = imenaUsluga.join(", ");
}

const inputReg = document.getElementById('reg');
if (inputReg) {
    inputReg.addEventListener('input', function(e) {
        let v = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        let formatirano = "";
        if (v.length > 0) formatirano += v.substring(0, 2);
        if (v.length > 2) formatirano += "-" + v.substring(2, 6);
        if (v.length > 6) formatirano += "-" + v.substring(6, 8);
        e.target.value = formatirano;
    });
}

const formPrijava = document.getElementById('form-prijava-vozila');
if (formPrijava) {
    formPrijava.addEventListener('submit', async function(e) {
        e.preventDefault();

        const regValue = document.getElementById('reg').value;
        const regRegex = /^[A-Z]{2}-\d{4}-[A-Z]{2}$/;

        if (!regRegex.test(regValue)) {
            alert("Registracija mora biti u formatu XX-1111-XX (npr. ZG-1234-AA)!");
            return; 
        }

        const modelSelect = document.getElementById('marka-model');
        const modelTekst = modelSelect.options[modelSelect.selectedIndex].text;
        const odabraneStavke = document.getElementById('finalni-popis-input').value;

        let ukupnaCijena = 0;
        document.querySelectorAll('.stavka-ponude.active').forEach(el => {
            ukupnaCijena += parseFloat(el.dataset.cijena || 0);
        });

        const idKorisnika = await dohvatiIdLogiranogKorisnika();
        if (!idKorisnika) {
            alert("Niste prijavljeni ili je sesija istekla.");
            return;
        }

        const payloadVozilo = {
            idKorisnik: idKorisnika,
            idVrsta: parseInt(modelSelect.value),
            regOznaka: regValue,
            godinaProizvodnje: document.getElementById('godina-vozila').value ? parseInt(document.getElementById('godina-vozila').value) : null,
            serijskiBroj: null, 
            jeZamjensko: document.getElementById('zamjensko').checked 
        };

        try {
            const resV = await fetch(`${API_BASE}/vozilo`, {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify(payloadVozilo)
            });

            if (!resV.ok) throw new Error("Greška kod spremanja vozila: " + resV.status);
            const novoVozilo = await resV.json();

            const payloadPopravak = {
                idVozila: novoVozilo.idVozila, 
                idTermin: parseInt(document.getElementById('termin').value),
                stanje: 'u pripremi',
                opisStavki: odabraneStavke 
            };

            const resPopravak = await fetch(`${API_BASE}/popravak`, {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify(payloadPopravak)
            });

            if (resPopravak.ok) {
                alert("Prijava uspješno spremljena!");
                
                // Osvježi listu popravaka
                await ucitajMojePopravke();
                
                e.target.reset(); 
                const popisLista = document.getElementById('popis-za-popravak');
                if (popisLista) popisLista.innerHTML = '<li>Nije odabrana nijedna stavka</li>';
            } else {
                throw new Error("Greška kod kreiranja popravka: " + resPopravak.status);
            }

        } catch (err) {
            console.error("Greška u procesu:", err);
            alert("Neuspješno slanje: " + err.message);
        }
    });
}

function nacrtajStatusKarticu(podaci) {
    const kontejner = document.getElementById('status-vozila-kontenjer');
    // Ako nema izračuna datuma završetka, stavi +3 dana
    const datumZavrsetka = typeof izracunajDatumZavrsetka === 'function' ? izracunajDatumZavrsetka() : new Date(Date.now() + 259200000).toLocaleDateString('hr-HR');
    const btnId = `pdf-btn-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    const html = `
        <div class="kartica-statusa" style="border-left: 5px solid #00d4ff; background: #1a1a1a; padding: 20px; border-radius: 10px; margin-bottom: 15px; color: white;">
            <div class="info-vozilo" style="margin-bottom: 10px;">
                <span style="font-weight: bold; font-size: 1.1rem;">${podaci.model} [${podaci.reg}]</span>
                <span style="float: right; color: #00d4ff; border: 1px solid #00d4ff; padding: 2px 8px; border-radius: 15px;">${podaci.stanje}</span>
            </div>
            
            <div style="font-size: 0.9rem; color: #ccc; border-top: 1px solid #333; padding-top: 10px;">
                <strong>Radovi:</strong> ${podaci.stavkeOpis}<br>
                <strong>Termin:</strong> ${podaci.termin} <br>
                <strong>Ukupna cijena:</strong> <span style="color: #2ecc71; font-weight:bold;">${podaci.cijena.toFixed(2)} €</span>
            </div>

            <p style="font-size: 0.8rem; color: #888; margin-top: 10px;">Predviđen završetak: ${datumZavrsetka}</p>

            <button id="${btnId}" style="margin-top: 15px; cursor: pointer; background: #e74c3c; color: white; border: none; padding: 10px; border-radius: 5px; width: 100%; font-weight: bold;">
                <i class="fas fa-file-pdf"></i> PREUZMI RAČUN / PONUDU
            </button>
        </div>
    `;

    kontejner.insertAdjacentHTML('beforeend', html);

    document.getElementById(btnId).onclick = () => {
        // Dodajemo datum završetka u podatke prije slanja u PDF
        podaci.datumZavrsetka = datumZavrsetka;
        exportVehiclePDF(podaci);
    };
}

function izracunajDatumZavrsetka() {
    const danas = new Date();
    danas.setDate(danas.getDate() + 3);
    return danas.toLocaleDateString('hr-HR');
}

// PDF za POJEDINAČNO vozilo
function exportVehiclePDF(data) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Zaglavlje
    doc.setFillColor(41, 128, 185);
    doc.rect(0, 0, 210, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text("AUTO SERVIS - RADNI NALOG / RAČUN", 14, 13);

    // Podaci o klijentu i vozilu
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    
    const yStart = 30;
    doc.text(`Vlasnik: ${data.vlasnik || 'N/A'}`, 14, yStart);
    doc.text(`Datum izdavanja: ${new Date().toLocaleString('hr-HR')}`, 14, yStart + 5);
    doc.text(`Status naloga: ${data.stanje}`, 14, yStart + 10);

    doc.text(`Vozilo: ${data.model}`, 120, yStart);
    doc.text(`Registracija: ${data.reg}`, 120, yStart + 5);
    doc.text(`VIN (Šasija): ${data.vin}`, 120, yStart + 10);
    doc.text(`Godina: ${data.godina}`, 120, yStart + 15);

    doc.setLineWidth(0.5);
    doc.line(14, yStart + 20, 196, yStart + 20);

    // Tablica stavki
    const tableBody = [
        ["Opis stavke / Usluge", "Iznos (€)"]
    ];

    // Ako je opis dugačak string (stari format), stavi ga u jedan red
    // Ako bismo imali array u data, mogli bismo iterirati. 
    // Ovdje koristimo data.stavkeOpis koji je string.
    // Razdvajamo ga po zarezu ako je moguće radi ljepšeg prikaza
    const stavkeNiz = data.stavkeOpis.split(', ');
    stavkeNiz.forEach(stavka => {
        // Pokušaj izvući cijenu iz stringa "Naziv (50.00 €)" za potrebe tablice ako treba, 
        // ili samo ispiši cijeli string u lijevi stupac
        tableBody.push([stavka, "-"]);
    });

    // Dodaj red za ukupno
    tableBody.push([{content: 'UKUPNO:', styles: {halign: 'right', fontStyle: 'bold'}}, {content: data.cijena.toFixed(2) + ' €', styles: {fontStyle: 'bold', fillColor: [230, 255, 230]}}]);

    doc.autoTable({
        startY: yStart + 25,
        head: [tableBody[0]],
        body: tableBody.slice(1),
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        columnStyles: { 0: { cellWidth: 140 }, 1: { cellWidth: 40, halign: 'right' } },
        theme: 'grid'
    });

    // Footer
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(8);
    doc.text("Hvala na povjerenju. PDV je uključen u cijenu (ako je primjenjivo).", 14, finalY);

    doc.save(`Racun_${data.reg}_${Date.now()}.pdf`);
}

// ---------------- NOVE FUNKCIJE ZA PDF SVIH POPRAVAKA ----------------

function dodajGumbZaSvePDF() {
    const kontejner = document.getElementById('status-vozila-kontenjer');
    
    // Provjeri postoji li već gumb da ga ne dupliciramo
    if(document.getElementById('btn-export-all')) return;
    
    // Ubacujemo gumb PRIJE kontejnera s karticama
    const gumbHTML = `
        <div style="margin-bottom: 20px; text-align: right;">
             <button id="btn-export-all">
                <i class="fas fa-file-pdf"></i> PREUZMI IZVJEŠTAJ ZA SVE MOJE POPRAVKE
            </button>
        </div>
    `;
    
    // Ubacujemo prije samog containera kartica
    kontejner.insertAdjacentHTML('beforebegin', gumbHTML);

    document.getElementById('btn-export-all').addEventListener('click', generirajMasovniPDF);
}

function generirajMasovniPDF() {
    if (mojiPopravciCache.length === 0) {
        alert("Nema popravaka za izvoz.");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('l'); // Landscape orijentacija jer imamo puno stupaca

    doc.setFontSize(18);
    doc.setTextColor(41, 128, 185);
    doc.text("EVIDENCIJA SVIH POPRAVAKA", 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Korisnik: ${mojiPopravciCache[0]?.vozilo?.korisnik?.ime || ''} ${mojiPopravciCache[0]?.vozilo?.korisnik?.prezime || ''}`, 14, 30);
    doc.text(`Datum generiranja: ${new Date().toLocaleString('hr-HR')}`, 14, 35);

    const tableHead = [[
        "Vozilo", 
        "Registracija", 
        "VIN",
        "Godina",
        "Datum Termina",
        "Status", 
        "Cijena (€)"
    ]];
    
    const tableBody = mojiPopravciCache.map(p => {
        // Koristimo helper funkciju za izračun
        const info = analizirajTroskove(p);
        
        const vozilo = p.vozilo || {};
        const vrsta = vozilo.vrstaVozila || {};

        return [
            vrsta.nazivModela || "N/A",
            vozilo.regOznaka || "-",
            vozilo.serijskiBroj || "-", // NOVO
            vozilo.godinaProizvodnje || "-", // NOVO
            p.termin ? new Date(p.termin.datumVrijeme).toLocaleDateString() : "-",
            //info.opis, // Točan opis iz baze
            (p.stanje || "").toUpperCase(),
            info.ukupnaCijena.toFixed(2)
        ];
    });

    doc.autoTable({
        startY: 45,
        head: tableHead,
        body: tableBody,
        headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 8, overflow: 'linebreak' },
        columnStyles: { 
            0: { cellWidth: 30 }, 
            5: { cellWidth: 80 }, // Širi stupac za opis
            7: { halign: 'right', fontStyle: 'bold' } 
        } 
    });

    doc.save(`Svi_Popravci_Izvjestaj.pdf`);style=""
}

async function ucitajMojePopravke() {
    try {
        const trenutniKorisnikId = await dohvatiIdLogiranogKorisnika();
        if (!trenutniKorisnikId) return;

        const token = localStorage.getItem("authToken");
        const res = await fetch(`${API_BASE}/popravak`, { 
            headers: { "Authorization": "Bearer " + token } 
        });
        
        if (!res.ok) throw new Error("Neuspješno dohvaćanje popravaka");
        
        const sviPopravci = await res.json();
        const kontejner = document.getElementById('status-vozila-kontenjer');
        kontejner.innerHTML = ""; 
        
        // Filtriranje za trenutnog korisnika
        const mojiPopravci = sviPopravci.filter(p => 
            p.vozilo && p.vozilo.korisnik && p.vozilo.korisnik.idKorisnik === trenutniKorisnikId
        );

        // Spremanje u globalni cache za masovni PDF export
        mojiPopravciCache = mojiPopravci;

        dodajGumbZaSvePDF();
        const gumbExport = document.getElementById('btn-export-all');
        if (gumbExport) gumbExport.style.display = mojiPopravci.length > 0 ? 'inline-block' : 'none';

        if (mojiPopravci.length === 0) {
            kontejner.innerHTML = '<p style="color:white; text-align:center;">Nemate prijavljenih popravaka.</p>';
            return;
        }

        mojiPopravci.forEach(p => {
            // Dohvat podataka prema strukturi iz admin.htmlstyle=""
            const vozilo = p.vozilo;
            const reg = vozilo.regOznaka || "Nema reg.";
            const model = vozilo.vrstaVozila?.nazivModela || "Vozilo";
            const status = (p.stanje || "U PRIPREMI").toUpperCase();
            
            // Dodatni podaci za PDF (iz admin strukture)
            const vin = vozilo.serijskiBroj || "-";
            const godina = vozilo.godinaProizvodnje || "-";
            const vlasnik = vozilo.korisnik ? `${vozilo.korisnik.ime} ${vozilo.korisnik.prezime}` : "Nepoznato";
            const datumTermina = p.termin ? new Date(p.termin.datumVrijeme).toLocaleDateString('hr-HR') : "Nije definirano";

            // Izračun cijene i stavki
            console.log()
            const info = analizirajTroskove(p);

            // Poziv funkcije za crtanje kartice s proširenim objektom podataka
            nacrtajStatusKarticu({
                model: model,
                reg: reg,
                stanje: status,
                stavkeOpis: info.opis,
                cijena: info.ukupnaCijena,
                vin: vin,
                godina: godina,
                vlasnik: vlasnik,
                termin: datumTermina
            });
        });

    } catch (err) {
        console.error("Greška kod učitavanja popravaka:", err);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log("Stranica učitana, pokrećem skripte...");
    if (typeof dohvatiPodatkeZaServis === 'function') {
        dohvatiPodatkeZaServis();
    }
    // Malo veća odgoda da budemo sigurni da je token učitan ako se koristi iz nekog drugog izvora
    setTimeout(ucitajMojePopravke, 300);
});

// --- FUNKCIJA ZA DETALJE I CIJENU ---
function analizirajTroskove(popravak) {
    let ukupno = 0;
    let stavkeTekst = [];
    
    //IZRACUN CIJENE

    return {
        ukupnaCijena: ukupno,
        opis: stavkeTekst.join(", "),
        lista: stavkeTekst // Vraća niz za ljepši ispis u PDF-u
    };
}