//povezivanje s bazom podataka
const API_BASE = "https://auto-servis.onrender.com/api";

function getAuthHeaders() {
      const token = localStorage.getItem("authToken");
         return {
           "Content-Type": "application/json",
           "Authorization": "Bearer " + token
         };
}

//Ovo radi tako da se moze upisat pogresna godina, ali ce se onda prilikom predaje forme javit greska
// Postavi maksimalnu godinu čim se stranica učita
const inputGodina = document.getElementById('godina-vozila');
const trenutnaGodina = new Date().getFullYear();
inputGodina.max = trenutnaGodina;

// Funkcija koja provjerava unos odma
window.validacijaGodine = function(input) {
    const errorSpan = document.getElementById('godina-error');
    
    if (input.value > trenutnaGodina) {
        input.value = trenutnaGodina; // Automatski vraća na max ako korisnik pretjera
        errorSpan.style.display = 'block';
    } else {
        errorSpan.style.display = 'none';
    }
};

async function popuniTermineIzBaze() {
    const token = localStorage.getItem("authToken"); // Koristimo isti ključ kao za usluge
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
            console.log("Uspjesno smo dohvatili termine iz baze: ", termini);

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
        } else {
            console.error("Server vratio grešku za termine:", response.status);
        }
    } catch (err) {
        console.warn("Greška u komunikaciji s bazom.", err);
        // Fallback termini ako baza ne radi
        // selectTermin.innerHTML = `
        //     <option value="" disabled selected>Odaberite termin (Baza nedostupna)</option>
        //     <option value="1">Sutra u 08:00</option>
        //     <option value="2">Sutra u 12:00</option>
        // `;
    }
}

export async function dohvatiPodatkeZaServis() {
    console.log("Pokusaj dohvacanja podataka iz baze");

    //ako se pojavi error bit ce uhvacen, ispisan u konzoli
    popuniModeleAuta();
    popuniTermineIzBaze();
    
    //ispravljeno ovo U od usluga
    fetch(`${API_BASE}/dijeloviusluge`, { headers: getAuthHeaders() })
        .then(res => {
            if (!res.ok) throw new Error("Status: " + res.status);
            return res.json();
        })
        .then(data => {
            let items = Array.isArray(data) ? data : (data.dijelovi || data.usluge || []);

            console.log("Primljeni podaci:", items);

            //ispis u dva razlicita bloka zbog preglednosti
            const samoUsluge = items.filter(item => item.vrsta === 'usluga');
            const samoDijelovi = items.filter(item => item.vrsta === 'dio');

            prikaziStavke(samoUsluge, 'usluge-popis');
            prikaziStavke(samoDijelovi, 'dijelovi-popis');

        })
        .catch(err => {
            console.error("Greska kod dohvacanja dijelova i usluga!" + err);
            // prikaziFallbackPodatke(); 
        });
}

async function popuniModeleAuta() {
    const token = localStorage.getItem("authToken");
    const select = document.getElementById('marka-model');
    
    if (!select) return;

    try {
        const response = await fetch(`${API_BASE}/vrstavozila`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            }
        });

        //za debug
        if (!response.ok) throw new Error("Status: " + response.status);

        const modeli = await response.json();
        console.log("Modeli auta dohvaceni iz baze!", modeli);

        // Resetiramo dropdown na početno stanje
        select.innerHTML = '<option value="" disabled selected>Odaberite vozilo</option>';
        
        modeli.forEach(model => {
            const opt = document.createElement('option');
            opt.value = model.idVrsta; 
            opt.innerText = model.nazivModela; 
            select.appendChild(opt);
        });

    } catch (err) {
        console.warn("Greska kod dohvacanja modela auta iz baze!", err);
        // Testni primjeri ako baza ne reagira
        // select.innerHTML = `
        //     <option value="" disabled selected>Odaberite vozilo: </option>
        //     <option value="1">Audi A1</option>
        //     <option value="2">Audi A3</option>
        //     <option value="3">Audi A4</option>
        // `;
    }
}

function prikaziStavke(lista, kontejnerId) {
    const kontejner = document.getElementById(kontejnerId);
    
    //baza je popunjena tako da ovo mozemo preskocit sad
    if (!kontejner) {
        console.error("Ne postoji element s ID-om: " + kontejnerId);
        return;
    }

    kontejner.innerHTML = '';

    if (lista.length === 0) {
        kontejner.innerHTML = '<p style="color: gray;">Nema podataka za prikaz.</p>';
        return;
    }

    lista.forEach(stavka => {
        const div = document.createElement('div');
        div.className = 'stavka-ponude'; 
        
        //iddijelaUsluge!!!
        div.innerText = stavka.naziv || "Bez naziva"; 
        div.dataset.id = stavka.idDijelaUsluge;

        div.onclick = function() {
            this.classList.toggle('active');
            if (typeof osvjeziPrikazOdabranih === 'function') osvjeziPrikazOdabranih();
        };

        kontejner.appendChild(div);
    });
    
    //za konzolu
    console.log(`Broj stavki je: ${lista.length}`);
}

//Ovo treba za popis odabranih stavki, bez toga se one samo istaknu malo
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


//NA OVOME JOS RADIM
if (inputReg) {
    inputReg.addEventListener('input', function(e) {
        // Uzmi samo slova i brojke, pretvori u velika slova
        let v = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        let formatirano = "";

        if (v.length > 0) formatirano += v.substring(0, 2);
        if (v.length > 2) formatirano += "-" + v.substring(2, 6);
        if (v.length > 6) formatirano += "-" + v.substring(6, 8);

        e.target.value = formatirano;
    });
}

document.getElementById('form-prijava-vozila').addEventListener('submit', async function(e) {

    const regValue = document.getElementById('reg').value;
    const regRegex = /^[A-Z]{2}-\d{4}-[A-Z]{2}$/;

    if (!regRegex.test(regValue)) {
        e.preventDefault();
        alert("Registracija mora biti u formatu XX-1111-XX (npr. ZG-1234-AA)!");
        return; 
    }

    e.preventDefault(); 
    
    const trenutniKorisnikId = localStorage.getItem("authToken");

    const payloadVozilo = {
        idKorisnik: trenutniKorisnikId ? parseInt(trenutniKorisnikId) : null,
        idVrsta: parseInt(document.getElementById('marka-model').value), // ID iz baze
        regOznaka: document.getElementById('reg').value,
        godinaProizvodnje: document.getElementById('godina-vozila').value ? parseInt(document.getElementById('godina-vozila').value) : null,
        jeZamjensko: document.getElementById('zamjensko').checked // Boolean
    };

    console.log("Šaljem vozilo:", payloadVozilo);

    try {
        const res = await fetch(`${API_BASE}/vozilo`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify(payloadVozilo)
        });

        if (!res.ok) throw new Error("Status: " + res.status);
        
        const novoVozilo = await res.json();
        console.log("Vozilo spremljeno:", novoVozilo);

        const payloadPopravak = {
            idVozila: novoVozilo.idVozila, 
            idTermin: parseInt(document.getElementById('termin').value),
            stanje: 'u pripremi'
        };

        const resPopravak = await fetch(`${API_BASE}/popravak`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify(payloadPopravak)
        });

        if (resPopravak.ok) {
            alert("Prijava uspješno spremljena!");
            nacrtajStatusKarticu(payloadVozilo.regOznaka, "U PRIPREMI");
        } else {
            throw new Error("Greška kod kreiranja popravka: " + resPopravak.status);
        }

    } catch (err) {
        console.error("Greška:", err);
        alert("Neuspješno slanje: " + err.message);
    }
});

function nacrtajStatusKarticu(registracija, stanje) {
    const kontejner = document.getElementById('status-vozila-kontenjer');
    const modelSelect = document.getElementById('marka-model');
    const modelTekst = modelSelect.options[modelSelect.selectedIndex].text;
    const datumZavrsetka = izracunajDatumZavrsetka();

    //ovo je proforme tu, treba popravit
    const html = `
        <div class="kartica-statusa" style="border-left: 5px solid #00d4ff; margin-bottom: 15px;">
            <div class="info-vozilo">
                <span class="vozilo-naziv">${modelTekst} (${registracija})</span>
                <span class="status-badge" style="background: #222; color: #00d4ff; border: 1px solid #00d4ff;">${stanje}</span>
            </div>
            
            <div class="procjena-datuma" style="margin: 10px 0; font-size: 0.9rem; color: #ccc;">
                <i class="fas fa-calendar-alt"></i> Procijenjeni završetak: <strong>${datumZavrsetka}</strong>
            </div>

            <div class="progress-bar-pozadina">
                <div class="progress-bar-popuna" style="width: 10%;">10%</div>
            </div>
            
            <div class="napomene-servisera">
                <p>Vaša prijava je uspješno poslana. Čekamo potvrdu termina.</p>
            </div>
        </div>
    `;
    kontejner.innerHTML = html + kontejner.innerHTML;
}

function izracunajDatumZavrsetka() {
    const danas = new Date();
    // Dodajemo 3 dana na današnji datum
    danas.setDate(danas.getDate() + 3);
    
    return danas.toLocaleDateString('hr-HR');
}

document.addEventListener('DOMContentLoaded', () => {
    dohvatiPodatkeZaServis();
});