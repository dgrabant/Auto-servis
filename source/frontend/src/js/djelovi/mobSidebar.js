// Funkcija za prebacivanje vidljivosti bočne trake (sidebar) i promjenu teksta na gumbu
document.getElementById('drop').addEventListener('click', (event) => {
    // Dohvati elemente za padajući izbornik (drop) i bočnu traku (sidebar)
    let drop = document.getElementById("drop"); 
    let sidebar = document.getElementById("sidebar");
    console.log("klik: ", sidebar.classList.contains("hide"));
    // Spremi trenutni tekst na gumbu
    let previousText = drop.innerHTML;

    // Provjera trenutnog teksta na gumbu
    if (sidebar.classList.contains("hide")) {
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