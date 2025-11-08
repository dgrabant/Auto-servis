// Funkcija za prebacivanje vidljivosti bočne trake (sidebar) i promjenu teksta na gumbu
document.getElementById('drop').addEventListener('click', (event) => {
    // Dohvati elemente za padajući izbornik (drop) i bočnu traku (sidebar)
    let drop = document.getElementById("drop"); 
    let sidebar = document.getElementById("sidebar");
    console.log("klik: ", sidebar.classList.contains("hide"));
    // Spremi trenutni tekst na gumbu
    let previousText = drop.innerHTML;

    // Provjera trenutnog teksta na gumbu
    if (!(sidebar.classList.contains("hide"))) {
        // Ako je tekst "Otvori izbornik", promijeni ga na "Zatvori izbornik"
        drop.innerHTML = "Zatvori izbornik";
        
        // Ukloni klasu 'hide' sa sidebar-a, čineći ga vidljivim
        sidebar.classList.remove("hide");
    } else {
        // Ako je tekst već "Zatvori izbornik", promijeni ga natrag na "Otvori izbornik"
        drop.innerHTML = "Otvori izbornik";
        
        // Dodaj klasu 'hide' na sidebar, čineći ga nevidljivim
        sidebar.classList.add("hide");
    }
    });
const kontaktHTML = document.getElementById('kontakt');
const vrijemeHTML = document.getElementById('vrijeme');
const miHTML = document.getElementById('mi');
let scrollHeight = document.body.scrollHeight;



document.getElementById('kontakt').addEventListener('click', (event) => {
    console.log("klik: ", kontaktHTML, vrijemeHTML, miHTML);
    
    scrollHeight = document.body.scrollHeight
    kontaktHTML.hidden = !(kontaktHTML.hidden);
    if (!(vrijemeHTML.hidden)) {
        vrijemeHTML.hidden = true;
    }
    if (!(miHTML.hidden)) {
        miHTML.hidden = true;
    }
    window.scrollTo({
        top: scrollHeight,
        // Dodajemo "smooth" ponašanje za glatku animaciju
        behavior: 'smooth' 
    });
});
document.getElementById('vrijeme').addEventListener("click", (event) => {
    console.log("klik: ", kontaktHTML, vrijemeHTML, miHTML);
    scrollHeight = document.body.scrollHeight
    vrijemeHTML.hidden = !(vrijemeHTML.hidden);
    if (!(kontaktHTML.hidden)) {
        kontaktHTML.hidden = true;
    }
    if (!(miHTML.hidden)) {
        miHTML.hidden = true;
    }
    window.scrollTo({
        top: scrollHeight,
        // Dodajemo "smooth" ponašanje za glatku animaciju
        behavior: 'smooth' 
    });
});

document.getElementById('mi').addEventListener("click", (event) => {
    console.log("klik: ", kontaktHTML, vrijemeHTML, miHTML);
    scrollHeight = document.body.scrollHeight
    miHTML.hidden = !(miHTML.hidden);
    if (!(vrijemeHTML.hidden)) {
        vrijemeHTML.hidden = true;
    }
    if (!(kontaktHTML.hidden)) {
        kontaktHTML.hidden = true;
    }
    window.scrollTo({
        top: scrollHeight,
        // Dodajemo "smooth" ponašanje za glatku animaciju
        behavior: 'smooth' 
    });
});