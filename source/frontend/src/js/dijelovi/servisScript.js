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

//Nisan sigurna jel radi kako bi trebalo, pogledaj opet
async function spremiRadnjeUBazu(idPopravka, idKorisnika) {
    const aktivneStavke = document.querySelectorAll('.stavka-ponude.active');
    
    if (aktivneStavke.length === 0) {
        console.log("Nema odabranih stavki za spremanje");
        return;
    }

    console.log("Spremanje radnji za popravak:", idPopravka, "korisnik:", idKorisnika);
    console.log("Broj odabranih stavki:", aktivneStavke.length);

    const promises = [];

    aktivneStavke.forEach(stavka => {
        const idDijelaUsluge = parseInt(stavka.dataset.id);
        
        const radnjaPayload = {
            idPopravak: idPopravka,
            idKorisnik: idKorisnika,
            idDijelausluge: idDijelaUsluge,  //pogledaj ovo sa idDijelUsluge (veliko ili malo u)??
            stanje: 'nepotvrđeno',
            napomena: null
        };

        console.log("Payload za radnju:", radnjaPayload);

        const promise = fetch(`${API_BASE}/radnja`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify(radnjaPayload)
        }).then(async (res) => {
            if (!res.ok) {
                const errorText = await res.text();
                console.error(`Greška ${res.status} za stavku ${idDijelaUsluge}:`, errorText);
                return { success: false, status: res.status, error: errorText };
            }
            const data = await res.json();
            console.log("Uspješno spremljena radnja:", data); //nema ovoga u konzoli tako da triba to popravit
            return { success: true, data };
        });

        promises.push(promise);
    });

    try {
        const results = await Promise.all(promises);
        const failedRequests = results.filter(r => !r.success);
        
        if (failedRequests.length > 0) {
            console.error(`${failedRequests.length} radnji nije uspješno spremljeno:`, failedRequests);
            console.warn("NAPOMENA: Radnje mogu spremati samo serviseri, upravitelji ili admini.");
            console.warn("Cijena je i dalje sačuvana u opisStavki.");
        } else {
            console.log(`Uspješno spremljeno ${results.length} radnji`);
        }
    } catch (err) {
        console.error("Greška pri spremanju radnji:", err);
    }
}

function nacrtajStatusKarticu(podaci) {
    const kontejner = document.getElementById('status-vozila-kontenjer');
    
    const progres = podaci.datumZavrsetka ? izracunajProgres(podaci.termin, podaci.datumZavrsetka) : 0;
    const progresBarva = progres < 50 ? '#3498db' : progres < 80 ? '#f39c12' : '#2ecc71';
    
    const datumZavrsetka = podaci.datumZavrsetka || 'Nije definirano';
    const btnId = `pdf-btn-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    const html = `
        <div class="kartica-statusa" style="border-left: 5px solid #00d4ff; background: #1a1a1a; padding: 20px; border-radius: 10px; margin-bottom: 15px; color: white;">
            <div class="info-vozilo" style="margin-bottom: 10px;">
                <span style="font-weight: bold; font-size: 1.1rem;">${podaci.model} [${podaci.reg}]</span>
                <span style="float: right; color: #00d4ff; border: 1px solid #00d4ff; padding: 2px 8px; border-radius: 15px;">${podaci.stanje}</span>
            </div>
            ${progres > 0 ? `
            <!-- Progress Bar -->
            <div style="margin: 15px 0;">
                <div style="display: flex; justify-content: space-between; font-size: 0.85rem; color: #ccc; margin-bottom: 5px;">
                    <span>Progres popravka</span>
                    <span style="font-weight: bold; color: ${progresBarva};">${progres}%</span>
                </div>
                <div style="background: #333; height: 8px; border-radius: 10px; overflow: hidden;">
                    <div style="background: ${progresBarva}; width: ${progres}%; height: 100%; transition: width 0.3s ease;"></div>
                </div>
            </div>
            ` : ''}
            
            <div style="font-size: 0.9rem; color: #ccc; border-top: 1px solid #333; padding-top: 10px;">
                <strong>Radovi:</strong><br>
                <div style="margin-left: 15px; margin-top: 5px;">
                    ${podaci.lista.map(stavka => `• ${stavka}`).join('<br>')}
                </div>
                <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #333;">
                    <strong>Termin prijema:</strong> ${podaci.termin}<br>
                    <strong>Predviđen završetak:</strong> ${datumZavrsetka}<br>
                    <strong>Ukupna cijena:</strong> 
                    <span style="color: #2ecc71; font-weight:bold; font-size: 1.2rem;">
                        ${podaci.cijena.toFixed(2)} €
                    </span>
                </div>
            </div>

            <button id="${btnId}" style="margin-top: 15px; cursor: pointer; background: #e74c3c; color: white; border: none; padding: 10px; border-radius: 5px; width: 100%; font-weight: bold;">
                <i class="fas fa-file-pdf"></i> PREUZMI RAČUN / PONUDU
            </button>
        </div>
    `;

    kontejner.insertAdjacentHTML('beforeend', html);

    document.getElementById(btnId).onclick = () => {
        podaci.datumZavrsetka = datumZavrsetka;
        exportVehiclePDF(podaci);
    };
}

/*function izracunajProgres(datumTermina, datumZavrsetka) {
    if (!datumTermina || !datumZavrsetka) return 0;
    
    const pocetak = new Date(datumTermina);
    const zavrsetak = new Date(datumZavrsetka);
    const sada = new Date();
    
    const ukupnoVrijeme = zavrsetak - pocetak;
    const protekloVrijeme = sada - pocetak;
    
    const postotak = Math.min(100, Math.max(0, (protekloVrijeme / ukupnoVrijeme) * 100));
    
    return Math.round(postotak);
}*/

/*function izracunajDatumZavrsetka() {
    const danas = new Date();
    danas.setDate(danas.getDate() + 3);
    return danas.toLocaleDateString('hr-HR');
}*/

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
            headers: { "Authorization": `Bearer ${token}` } 
        });
        
        if (!res.ok) throw new Error("Neuspješno dohvaćanje popravaka");
        
        const sviPopravci = await res.json();
        const kontejner = document.getElementById('status-vozila-kontenjer');
        kontejner.innerHTML = ""; 
        
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
            const vlasnik = vozilo.korisnik ? 
                `${vozilo.korisnik.ime} ${vozilo.korisnik.prezime}` : "Nepoznato";
            const datumTermina = p.termin ? 
                new Date(p.termin.datumVrijeme).toLocaleDateString('hr-HR') : "Nije definirano";
            
            // Dohvat datuma završetka iz baze (ako postoji)
            const datumZavrsetka = p.datumZavrsetka ? 
                new Date(p.datumZavrsetka).toLocaleDateString('hr-HR') : null;

            // Izračun cijene iz opisStavki
            const info = analizirajTroskove(p);

            nacrtajStatusKarticu({
                model: model,
                reg: reg,
                stanje: status,
                stavkeOpis: info.opis,
                cijena: info.ukupnaCijena,
                lista: info.lista,
                vin: vin,
                godina: godina,
                vlasnik: vlasnik,
                termin: datumTermina,
                datumZavrsetka: datumZavrsetka
            });
        });

    } catch (err) {
        console.error("Greška kod učitavanja popravaka:", err);
    }
}


async function spremiSamoUOpisStavki(idPopravka) {
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
        const res = await fetch(`${API_BASE}/popravak/${idPopravak}`, {
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
    
    // Provjeravamo i 'opis' i 'opisStavki' (za svaki slučaj)
    const izvorTeksta = popravak.opis || popravak.opisStavki || "";
    
    if (izvorTeksta) {
        // Regex koji traži sve što je u zagradama s oznakom € (npr. 75.00 €)
        const regexCijena = /\((\d+\.?\d*)\s*€\)/g;
        let match;
        
        while ((match = regexCijena.exec(izvorTeksta)) !== null) {
            ukupno += parseFloat(match[1]);
        }

        // Za prikaz na kartici, uzimamo samo dio sa stavkama ako postoji
        if (izvorTeksta.includes("STAVKE:")) {
            const samoStavke = izvorTeksta.split("|")[0].replace("STAVKE:", "").trim();
            stavkeTekst = samoStavke.split(", ");
        } else {
            stavkeTekst = izvorTeksta.split(", ");
        }
    }

    return {
        ukupnaCijena: ukupno,
        opis: izvorTeksta,
        lista: stavkeTekst
    };
}