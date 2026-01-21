let sveRadnjeCache = [];
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

//Doznaj tko je trenutni korisnik
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

//--------------------- VALIDACIJA GODINE VOZILA ------------------//

// Postavi max godinu čim se stranica učita
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
        console.warn("Greška u komunikaciji s bazom prilikom dohvacanja termina.", err);
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

//--------ODABRANE STAVKE I UKUPNA CIJENA

function osvjeziPrikazOdabranih() {
    const listaUI = document.getElementById('popis-za-popravak');
    const skriveniInput = document.getElementById('finalni-popis-input');
    
    const aktivneStavke = document.querySelectorAll('.stavka-ponude.active');
    
    if (aktivneStavke.length === 0) {
        listaUI.innerHTML = '<li>Odaberite usluge i dijelove za prikaz na popisu</li>';
        skriveniInput.value = "";
        azurirajPrikazUkupneCijene(0);
        return;
    }

    listaUI.innerHTML = ""; 
    let imenaUsluga = [];
    let ukupnaCijena = 0;

    aktivneStavke.forEach(stavka => {
        const naziv = stavka.querySelector('.stavka-naziv').textContent;
        const cijena = parseFloat(stavka.dataset.cijena || 0);
        
        // Dodaj cijenu u ukupno
        ukupnaCijena += cijena;
        
        // Formatiraj stavku sa cijenom za prikaz i spremanje
        const stavkaFormatirana = `${naziv} (${cijena.toFixed(2)} €)`;
        imenaUsluga.push(stavkaFormatirana);

        const li = document.createElement('li');
        li.innerHTML = `<i class="fas fa-check-circle" style="margin-right: 8px;"></i> ${stavkaFormatirana}`;
        
        li.onclick = function() {
            stavka.classList.remove('active');
            osvjeziPrikazOdabranih();
        };
        listaUI.appendChild(li);
    });
    
    skriveniInput.value = imenaUsluga.join(", ");
    azurirajPrikazUkupneCijene(ukupnaCijena);
}


function azurirajPrikazUkupneCijene(cijena) {
    let cijenaDiv = document.getElementById('ukupna-cijena-prikaz');
    
    if (!cijenaDiv) {
        // Kreiraj div za prikaz cijene ako ne postoji
        const rezimeKontejner = document.querySelector('.rezime-kontejner');
        if (rezimeKontejner) {
            cijenaDiv = document.createElement('div');
            cijenaDiv.id = 'ukupna-cijena-prikaz';
            cijenaDiv.style.cssText = 'margin-top: 15px; padding: 10px; background: #2a2a2a; border-radius: 5px; text-align: right;';
            rezimeKontejner.appendChild(cijenaDiv);
        }
    }
    
    if (cijenaDiv) {
        cijenaDiv.innerHTML = `
            <span style="color: #ccc; font-size: 0.9rem;">Ukupna cijena:</span>
            <span style="color: #2ecc71; font-weight: bold; font-size: 1.2rem; margin-left: 10px;">
                ${cijena.toFixed(2)} €
            </span>
        `;
    }
}
//-----------------REGSTRACIJA
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

//---------------FORMA ZA PRIJAVU VOZILA
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
        const odabraneStavke = document.getElementById('finalni-popis-input').value;
        
        if (!odabraneStavke || odabraneStavke === '') {
            alert("Molimo odaberite barem jednu uslugu ili dio!");
            return;
        }

        //Samo refresh stranice i rijeseno
        const idKorisnika = await dohvatiIdLogiranogKorisnika();
        if (!idKorisnika) {
            alert("Niste prijavljeni ili je sesija istekla.");
            return;
        }

        const serijskiBrojInput = document.getElementById('serijski-broj');
        const serijskiBrojValue = serijskiBrojInput ? serijskiBrojInput.value : null;

        const payloadVozilo = {
            idKorisnik: idKorisnika,
            idVrsta: parseInt(modelSelect.value),
            regOznaka: regValue,
            godinaProizvodnje: document.getElementById('godina-vozila').value ? 
                parseInt(document.getElementById('godina-vozila').value) : null,
            jeZamjensko: document.getElementById('zamjensko').checked 
        };
        
        // Dodaj serijskiBroj samo ako ima vrijednost
        if (serijskiBrojValue && serijskiBrojValue.trim() !== '') {
            payloadVozilo.serijskiBroj = serijskiBrojValue.trim();
        }

        try {
            console.log("Šaljem vozilo:", payloadVozilo);
            
            // 1. Spremi vozilo
            const resV = await fetch(`${API_BASE}/vozilo`, {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify(payloadVozilo)
            });

            if (!resV.ok) {
                const errorText = await resV.text();
                console.error("Greška od servera:", errorText);
                throw new Error("Greška kod spremanja vozila: " + resV.status);
            }
            
            const novoVozilo = await resV.json();
            console.log("Vozilo spremljeno:", novoVozilo);

            const odabraneStavke = document.getElementById('finalni-popis-input').value; 
            const detaljanOpisKvara = document.getElementById('opis-kvara').value; 
            const zamjenskoCheck = document.getElementById('zamjensko').checked ? "DA" : "NE";

            //OVO JE OPIS U BAZI
            const puniOpisZaBazu = `STAVKE: ${odabraneStavke} | OPIS: ${detaljanOpisKvara || 'Nema dodatnog opisa'} | ZAMJENSKO: ${zamjenskoCheck}`;

            const payloadPopravak = {
                idVozila: novoVozilo.idVozila, 
                idTermin: parseInt(document.getElementById('termin').value),
                stanje: 'u pripremi',
                opis: puniOpisZaBazu,      
                opisStavki: odabraneStavke
            };

            console.log("Šaljem podatke popravka:", payloadPopravak);

            const resPopravak = await fetch(`${API_BASE}/popravak`, {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify(payloadPopravak)
            });
            if (!resPopravak.ok) {
                const errorText = await resPopravak.text();
                console.error("Greška od servera:", errorText);
                throw new Error("Greška kod kreiranja popravka: " + resPopravak.status);
            }

            const noviPopravak = await resPopravak.json();
            console.log("Popravak uspješno kreiran:", noviPopravak);

            alert("Prijava uspješno spremljena!");
            
            await ucitajMojePopravke();
            
            //RESET FORME
            e.target.reset(); 
            document.querySelectorAll('.stavka-ponude.active').forEach(el => {
                el.classList.remove('active');
            });
            const popisLista = document.getElementById('popis-za-popravak');
            if (popisLista) {
                popisLista.innerHTML = '<li>Nije odabrana nijedna stavka</li>';
            }
            azurirajPrikazUkupneCijene(0);

        } catch (err) {
            console.error("Greška u procesu:", err);
            alert("Neuspješno slanje: " + err.message);
        }
    });
}



function nacrtajStatusKarticu(podaci) {
    const kontejner = document.getElementById('status-vozila-kontenjer');
    
    // Određivanje boje progress bara
    let progres = podaci.progres || 0;
    let bojaStatus = '#2ecc71';
    let progresBoja = '#38bff8'; // Plava
    if (progres === 100) progresBoja = '#2ecc71'; // Zelena (Završeno)
    else if (progres > 60) progresBoja = '#f39c12'; // Narančasta
    else if (podaci.stanje == 'ODBIJENO'){
        progresBoja = '#ff0000ff';
        progres = 100;
        bojaStatus = '#ff2f2fff';
    } 

    const datumZavrsetkaPrikaz = podaci.datumZavrsetka || 'Nije definirano';
    const btnId = `pdf-btn-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    // Prikaži progress bar samo ako postoji datum završetka
    const displayProgressBar = (podaci.rawDatumZavrsetka) ? 'block' : 'none';

    // Tekst statusa iznad trake
    let statusTrakeTekst = `${progres}%`;
    if (progres === 100) statusTrakeTekst = "100%";

    const html = `
        <div class="kartica-statusa">
            <div class="info-vozilo" style="margin-bottom: 10px;">
                <span style="font-weight: bold; font-size: 1.1rem; color:white;">${podaci.model} <span style="color:#aaa; font-size:0.9rem;">[${podaci.reg}]</span></span>
                <span class="status-badge" style="color: ${bojaStatus}; float: right;">${podaci.stanje}</span>
            </div>

            <div style="display: ${displayProgressBar}; margin: 15px 0;">
                <div style="display: flex; justify-content: space-between; font-size: 0.85rem; color: #ccc; margin-bottom: 5px;">
                    <span>Procjena stanja (postoji šansa komplikacije)</span>
                    <span style="font-weight: bold; color: ${progresBoja};">${statusTrakeTekst}</span>
                </div>
                <div class="progress-bar-pozadina">
                    <div class="progress-bar-popuna" style="width: ${progres}%; background: ${progresBoja}; box-shadow: 0 0 10px ${progresBoja};">
                        ${progres > 10 ? progres + '%' : ''} 
                    </div>
                </div>
                <p style="font-size:0.75rem; color:#888; text-align:right; margin-top:2px;">
                    ${progres === 100 ? 'Predviđeno vrijeme servisa je završilo.' : 'Prikaz vremena od termina do predviđenog kraja.'}
                </p>
            </div>
            
            <div style="font-size: 0.9rem; color: #ccc; border-top: 1px solid #38bff844; padding-top: 10px;">
                <strong style="color:#38bff8;">Radovi:</strong><br>
                <div style="margin-left: 15px; margin-top: 5px; margin-bottom:10px;">
                    ${podaci.lista.map(stavka => `• ${stavka}`).join('<br>')}
                </div>
                
                <div style="background: rgba(0,0,0,0.2); padding: 10px; border-radius: 10px;">
                    <div style="display:flex; justify-content:space-between;">
                        <span>📥 Termin prijema:</span>
                        <span style="color:white;">${podaci.termin}</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; margin-top:5px;">
                        <span>🏁 Predviđen kraj:</span>
                        <span style="color:${podaci.datumZavrsetka ? '#fff' : '#888'}; font-weight:bold;">${datumZavrsetkaPrikaz}</span>
                    </div>
                    <div style="border-top: 1px solid #444; margin-top:8px; padding-top:8px; display:flex; justify-content:space-between; align-items:center;">
                        <span>Ukupna cijena:</span>
                        <span style="color: #2ecc71; font-weight:bold; font-size: 1.2rem;">${podaci.cijena.toFixed(2)} €</span>
                    </div>
                </div>
            </div>

            <button id="${btnId}" class="btn-pdf">
                <i class="fas fa-file-pdf"></i> PREUZMI RAČUN / PONUDU
            </button>
        </div>
    `;

    kontejner.insertAdjacentHTML('beforeend', html);

    document.getElementById(btnId).onclick = () => {
        exportVehiclePDF(podaci);
    };
}
function izracunajProgres(startDatum, endDatum) {
    // Ako nema datuma početka ili kraja, progres je 0
    if (!startDatum || !endDatum) return 0;

    const start = new Date(startDatum).getTime();
    const end = new Date(endDatum).getTime();
    const now = new Date().getTime();

    // 1. Ako je trenutno vrijeme prošlo datum završetka -> 100%
    if (now >= end) return 100;

    // 2. Ako termin još nije ni počeo -> 0%
    if (now <= start) return 0;

    // 3. Računanje postotka proteklog vremena
    const ukupnoTrajanje = end - start;
    const proteklo = now - start;

    // Zaštita od dijeljenja s nulom (ako su start i end isti)
    if (ukupnoTrajanje <= 0) return 100;

    const postotak = (proteklo / ukupnoTrajanje) * 100;
    
    // Vraća zaokružen broj (npr. 45)
    return Math.min(Math.round(postotak), 100);
}

// PDF za POJEDINAČNO vozilo
function exportVehiclePDF(data) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFillColor(41, 128, 185);
    doc.rect(0, 0, 210, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text("AUTO SERVIS - RADNI NALOG / RAČUN", 14, 13);

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

    const tableBody = [];

    let cisteStavke = data.stavkeOpis;
    if (cisteStavke.includes("|")) {
        cisteStavke = cisteStavke.split("|")[0].replace("STAVKE:", "").trim();
    }

    const stavkeNiz = cisteStavke.split(', ');
    
    stavkeNiz.forEach(stavka => {
        // Regex
        const match = stavka.match(/(.*)\s\((\d+\.?\d*)\s*€\)/);
        
        if (match) {
            const naziv = match[1].trim();
            const cijena = parseFloat(match[2]).toFixed(2) + " €";
            tableBody.push([naziv, cijena]);
        } else {
            tableBody.push([stavka, "-"]);
        }
    });

    // Za zamjensko vozilo
    if (data.stavkeOpis.includes("|")) {
        const dijelovi = data.stavkeOpis.split("|");
        const napomena = dijelovi[1] ? dijelovi[1].replace("OPIS:", "").trim() : "";
        const zamjensko = dijelovi[2] ? dijelovi[2].replace("ZAMJENSKO:", "").trim() : "";

        if (napomena && napomena !== "Nema dodatnog opisa") {
            tableBody.push([{ content: `Napomena: ${napomena}`, colSpan: 2, styles: { fontStyle: 'italic', textColor: [100, 100, 100] } }]);
        }
        if (zamjensko === "DA") {
            tableBody.push([{ content: `Potrebno zamjensko vozilo: DA`, colSpan: 2, styles: { textColor: [231, 76, 60], fontStyle: 'bold' } }]);
        }
    }

    tableBody.push([
        { content: 'UKUPNO:', styles: { halign: 'right', fontStyle: 'bold' } }, 
        { content: data.cijena.toFixed(2) + ' €', styles: { fontStyle: 'bold', fillColor: [230, 255, 230] } }
    ]);

    doc.autoTable({
        startY: yStart + 25,
        head: [["Opis stavke / Usluge", "Iznos (€)"]],
        body: tableBody,
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        columnStyles: { 0: { cellWidth: 140 }, 1: { cellWidth: 40, halign: 'right' } },
        theme: 'grid'
    });

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
        <div style="margin-bottom: 20px; text-align: center;">
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
    const doc = new jsPDF('l'); 

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
        // --- PROMJENA: Šaljemo cache radnji u funkciju ---
        const info = analizirajTroskove(p, sveRadnjeCache);
        
        const vozilo = p.vozilo || {};
        const vrsta = vozilo.vrstaVozila || {};

        return [
            vrsta.nazivModela || "N/A",
            vozilo.regOznaka || "-",
            vozilo.serijskiBroj || "-", 
            vozilo.godinaProizvodnje || "-", 
            p.termin ? new Date(p.termin.datumVrijeme).toLocaleDateString() : "-",
            (p.stanje || "").toUpperCase(),
            info.ukupnaCijena.toFixed(2) // Sada prikazuje točnu cijenu
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
            5: { cellWidth: 80 }, 
            7: { halign: 'right', fontStyle: 'bold' } 
        } 
    });

    doc.save(`Svi_Popravci_Izvjestaj.pdf`);
}

async function ucitajMojePopravke() {
    try {
        const trenutniKorisnikId = await dohvatiIdLogiranogKorisnika();
        if (!trenutniKorisnikId) return;

        const token = localStorage.getItem("authToken");
        
        // --- PROMJENA: Dohvaćamo i popravke i radnje odjednom ---
        const [resPopravci, resRadnje] = await Promise.all([
            fetch(`${API_BASE}/popravak`, { headers: { "Authorization": `Bearer ${token}` } }),
            fetch(`${API_BASE}/radnja`, { headers: { "Authorization": `Bearer ${token}` } })
        ]);
        
        if (!resPopravci.ok || !resRadnje.ok) throw new Error("Neuspješno dohvaćanje podataka s servera");
        
        const sviPopravci = await resPopravci.json();
        const sveRadnje = await resRadnje.json(); // Dohvaćene radnje

        // Spremamo u globalne varijable za kasnije (PDF)
        sveRadnjeCache = sveRadnje;

        const kontejner = document.getElementById('status-vozila-kontenjer');
        kontejner.innerHTML = ""; 
        
        // Filtriramo samo popravke logiranog korisnika
        const mojiPopravci = sviPopravci.filter(p => 
            p.vozilo && p.vozilo.korisnik && p.vozilo.korisnik.idKorisnik === trenutniKorisnikId
        );

        mojiPopravciCache = mojiPopravci;
        dodajGumbZaSvePDF();
        
        const gumbExport = document.getElementById('btn-export-all');
        if (gumbExport) gumbExport.style.display = mojiPopravci.length > 0 ? 'inline-block' : 'none';

        if (mojiPopravci.length === 0) {
            kontejner.innerHTML = '<p style="color:white; text-align:center;">Nemate prijavljenih popravaka.</p>';
            return;
        }

        mojiPopravci.forEach(p => {
            const vozilo = p.vozilo;
            const reg = vozilo.regOznaka || "Nema reg.";
            const model = vozilo.vrstaVozila?.nazivModela || "Vozilo";
            const status = (p.stanje || "U PRIPREMI").toUpperCase();
            
            const vin = vozilo.serijskiBroj || "-";
            const godina = vozilo.godinaProizvodnje || "-";
            const vlasnik = vozilo.korisnik ? `${vozilo.korisnik.ime} ${vozilo.korisnik.prezime}` : "Nepoznato";
            
            const options = { day: 'numeric', month: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' };
            
            const rawTermin = p.termin ? p.termin.datumVrijeme : null;
            const rawKraj = p.datumVrijeme; 

            const datumTermina = rawTermin ? new Date(rawTermin).toLocaleString('hr-HR', options) : "Nije definirano";
            const datumZavrsetka = rawKraj ? new Date(rawKraj).toLocaleString('hr-HR', options) : null;

            const postotakGotovo = izracunajProgres(rawTermin, rawKraj);

            // --- PROMJENA: Sada šaljemo i 'sveRadnje' u funkciju ---
            const info = analizirajTroskove(p, sveRadnje);

            nacrtajStatusKarticu({
                model: model,
                reg: reg,
                stanje: status,
                stavkeOpis: info.opis,
                cijena: info.ukupnaCijena, // Ovo će sada biti ispravno izračunato
                lista: info.lista,
                vin: vin,
                godina: godina,
                vlasnik: vlasnik,
                termin: datumTermina,
                datumZavrsetka: datumZavrsetka,
                rawDatumZavrsetka: rawKraj,
                progres: postotakGotovo
            });
        });

    } catch (err) {
        console.error("Greška kod učitavanja popravaka:", err);
    }
}


/*async function spremiSamoUOpisStavki(idPopravka) {
    // Izračunaj stavke sa cijenama
    const aktivneStavke = document.querySelectorAll('.stavka-ponude.active');
    let opisStavki = [];
    
    aktivneStavke.forEach(stavka => {
        const naziv = stavka.querySelector('.stavka-naziv').textContent;
        const cijena = stavka.dataset.cijena;
        opisStavki.push(`${naziv} (${parseFloat(cijena).toFixed(2)} €)`);
    });
    
    // Ažuriraj popravak sa detaljnim opisom
    const updatePayload = {
        opisStavki: opisStavki.join(", ")
    };
    
    try {
        const res = await fetch(`${API_BASE}/popravak/${idPopravka}`, {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify(updatePayload)
        });
        
        if (res.ok) {
            console.log("Opis stavki ažuriran");
        }
    } catch (err) {
        console.error("Greška pri ažuriranju:", err);
    }
}*/

document.addEventListener('DOMContentLoaded', () => {
    console.log("Stranica učitana, pokrećem skripte...");
    if (typeof dohvatiPodatkeZaServis === 'function') {
        dohvatiPodatkeZaServis();
    }
    // Malo veća odgoda da budemo sigurni da je token učitan ako se koristi iz nekog drugog izvora
    setTimeout(ucitajMojePopravke, 300);
});

// --- FUNKCIJA ZA DETALJE I CIJENU ---
function analizirajTroskove(popravak, sveRadnje = []) {
    let ukupno = 0;
    let stavkeTekst = [];
    let pronadeneRadnje = [];
    console.log("Dobiveno iz tablice ",popravak, sveRadnje)

    // --- 1. PRIMARNA METODA: Pretraga po ID-u u listi radnji ---
    // Provjeravamo postoji li lista 'sveRadnje' i filtriramo one koje pripadaju ovom popravku
    if (Array.isArray(sveRadnje) && sveRadnje.length > 0) {
        pronadeneRadnje = sveRadnje.filter(r => {
            // Provjera poveznice: r.popravak može biti objekt ili ID
            const rPopravakId = (r.popravak && r.popravak.idPopravak) 
                                ? r.popravak.idPopravak 
                                : r.idPopravak;
            
            return rPopravakId === popravak.idPopravak;
        });
    } 
    // Fallback: Ako je backend vratio radnje unutar samog objekta popravak
    else if (popravak.radnje && Array.isArray(popravak.radnje)) {
        pronadeneRadnje = popravak.radnje;
    }

    // Ako smo našli strukturne podatke, računamo sumu
    if (pronadeneRadnje.length > 0) {
        pronadeneRadnje.forEach(radnja => {
            // Računamo samo ako je stanje 'potvrđeno' ili 'završeno'
            // Ignoriramo 'nepotvrđeno' ili 'odbijeno'
            const stanje = radnja.stanje ? radnja.stanje.toLowerCase() : "";
            if (stanje === 'potvrđeno' || stanje === 'završeno') {
                
                // Dohvat cijene iz objekta dijeloviusluge
                if (radnja.dijeloviusluge && radnja.dijeloviusluge.cijena) {
                    let cijena = parseFloat(radnja.dijeloviusluge.cijena);
                    let naziv = radnja.dijeloviusluge.naziv || "Stavka";
                    
                    ukupno += cijena;
                    stavkeTekst.push(`${naziv} (${cijena.toFixed(2)} €)`);
                }
            }
        });

        if (ukupno > 0 || stavkeTekst.length > 0) {
            return {
                ukupnaCijena: parseFloat(ukupno.toFixed(2)),
                opis: stavkeTekst.length > 0 ? "Stavke iz sustava: " + stavkeTekst.join(", ") : popravak.opis,
                lista: stavkeTekst,
                metoda: "Baza podataka"
            };
        }
    }

    // --- 2. FALLBACK METODA: Parsiranje teksta (Regex) ---
    // Koristi se samo ako nema povezanih radnji u bazi, a cijena je upisana ručno u opis
    const izvorTeksta = popravak.opis || "";
    
    if (ukupno === 0 && izvorTeksta) {
        // Regex hvata formate: (100 €), (100.50 €), (1.200,00 €)
        const regexCijena = /\(([\d.,]+)\s*€\)/g;
        let match;
        
        while ((match = regexCijena.exec(izvorTeksta)) !== null) {
            let brojString = match[1];

            // HR format detekcija (ako ima zarez, on je decimala)
            if (brojString.includes(',')) {
                // 1.200,50 -> 1200.50
                brojString = brojString.replace(/\./g, '').replace(',', '.');
            } 
            // Ako nema zareza, pretpostavljamo standardni JS format ili cijeli broj
            
            const iznos = parseFloat(brojString);
            if (!isNaN(iznos)) {
                ukupno += iznos;
            }
        }
        
        // Pokušaj izvući popis stavki ako su odvojene zarezom
        if (ukupno > 0 && stavkeTekst.length === 0) {
            stavkeTekst = izvorTeksta.split(',').map(s => s.trim());
        }
    }

    return {
        ukupnaCijena: parseFloat(ukupno.toFixed(2)),
        opis: izvorTeksta,
        lista: stavkeTekst,
        metoda: ukupno > 0 && pronadeneRadnje.length === 0 ? "Parsiranje opisa" : "Nema troškova"
    };
}