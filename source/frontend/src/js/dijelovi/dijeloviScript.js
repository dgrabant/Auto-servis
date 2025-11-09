/*document.getElementById('category-select').addEventListener('change', function() {
    let selectedCategory = this.value; // Dobijanje izabrane kategorije
    let present_pict = document.querySelector(".present_pict");
    let baner = document.querySelector(".baner-txt");
    let filterableProducts = document.querySelectorAll(".product");

    // Preuzimanje slike za odabranu kategoriju pomoću data-name atributa
    let selectedOption = this.options[this.selectedIndex]; // Odabrana opcija
    let selectedImage = selectedOption.getAttribute('data-name'); // Uzima data-name atribut iz odabrane opcije

    // Ako je odabrana opcija "all", postavi default sliku
    if (selectedCategory === "all") {
        present_pict.src = "../../../public/assets/pictures/dijelovi/default_present.jpg";
    } else {
        present_pict.src = `../../../public/assets/pictures/dijelovi/${selectedImage}_present.jpg`; // Postavljanje slike iz foldera pictures
    }

    // Ažuriranje baner teksta
    if (selectedCategory === "all") {
        baner.innerHTML = "Dobar dan, molim vas izaberite nešto iz naše ponude.";
        document.getElementById('selected').innerText = 'Kategorija nije selektirana';
    } else {
        baner.innerHTML = `Dobar dan, molim vas izaberite nešto iz naše ponude: ${this.options[this.selectedIndex].text}`;
        document.getElementById('selected').innerText = this.options[this.selectedIndex].text;
    }

    // Filtriranje proizvoda
    filterableProducts.forEach(product => {
        if (selectedCategory === "all" || product.dataset.name === selectedCategory) {
            product.classList.remove("hide"); // Prikaz proizvoda
        } else {
            product.classList.add("hide"); // Sakrivanje proizvoda
        }
    });
});*/