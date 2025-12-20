
let sidebar = document.getElementById("sidebar");
let nav = document.createElement("nav");

let categoryLabel = document.createElement("h4");
categoryLabel.className = "oda_kat";
categoryLabel.textContent = "Odaberite kategoriju:";

let categorySelect = document.createElement("select");
categorySelect.id = "category-select";
categorySelect.className = "select";
categorySelect.hidden = true; 

let allOption = document.createElement("option");
allOption.value = "all";
allOption.textContent = "Sve kategorije";
allOption.setAttribute("data-name", "all");
allOption.selected = true;
categorySelect.appendChild(allOption);

data.categories.forEach(category => {
    let option = document.createElement("option");
    option.value = category.name.toLowerCase().replace(/\s+/g, "_");
    option.textContent = category.name;
    option.setAttribute("data-name", category.image);
    categorySelect.appendChild(option);
});
nav.appendChild(categoryLabel);
nav.appendChild(categorySelect);
sidebar.appendChild(nav);

// --- Funkcija za generiranje proizvoda i postavljanje filtera ---
// Sav kod koji ovisi o 'data.products' stavljamo u ovu funkciju
function initializeProductListAndFilters() {
    
    // Generiranje proizvoda
    let container = document.getElementById("product-container");
    let idCounter = 0;

    data.categories.forEach(category => {
        // Provjeravamo ima li proizvoda; 'products' sada ne bi trebao biti null/undefined
        if (category.products && Array.isArray(category.products)) {
            category.products.forEach(product => {

                let productDiv = document.createElement("div");
                productDiv.className = "product";
                productDiv.setAttribute("data-name", category.name.toLowerCase().replace(/\s+/g, "_"));

                let imageDiv = document.createElement("div");
                imageDiv.className = "image";

                let img = document.createElement("img");
                img.className = "slika";
                // Prilagodite putanju ako je potrebno, npr. ako API ne vraća punu putanju
                img.src = product.slikaUrl.startsWith('http') ? product.slikaUrl : `/assets/pictures/dijelovi/${product.slikaUrl}`;
                img.alt = product.naziv;
                
                let priceTag = document.createElement("span");
                priceTag.className = "price-tag";
                priceTag.textContent = product.cijena + " €";

                let spanCount = document.createElement("span");
                spanCount.className = "proi-count";
                spanCount.id = idCounter;

                imageDiv.appendChild(img);
                imageDiv.appendChild(priceTag);
                imageDiv.appendChild(spanCount);
                
                let addToCart = document.createElement("span");
                addToCart.className = "add-to-cart";

                let cartImg = document.createElement("img");
                cartImg.src = "/assets/pictures/dijelovi/cart_proi.png";
                cartImg.id = idCounter;
                cartImg.alt = "Dodaj u košaricu";
                cartImg.className = "cart_picture_2";

                addToCart.appendChild(cartImg);

                let productName = document.createElement("h3");
                productName.textContent = product.naziv;
                let productClass = document.createElement("h4");
                productClass.textContent = category.name_disp;
                
                let descriptionP = document.createElement("p");
                descriptionP.className = "description";
                descriptionP.textContent = product.opis;

                productDiv.appendChild(imageDiv);
                productDiv.appendChild(addToCart);
                productDiv.appendChild(productName);
                productDiv.appendChild(productClass);
                productDiv.appendChild(descriptionP);
                
                container.appendChild(productDiv);

                idCounter++;
            });
        }
    });

    // Filtriranje proizvoda po kategoriji
    // Ovaj listener postavljamo tek NAKON što su proizvodi generirani
    document.getElementById("category-select").addEventListener("change", function() {
        let selectedCategory = this.value;
        let present_pict = document.querySelector(".present_pict");
        let selectedOption = this.options[this.selectedIndex];
        let selectedImage = selectedOption.getAttribute('data-name');

        if (selectedCategory === "all") {
            present_pict.src = "/assets/pictures/dijelovi/audi.jpg";
        } else {
            present_pict.src = `/assets/pictures/dijelovi/${selectedImage}`;
        }

        document.querySelectorAll(".product").forEach(product => {
            if (selectedCategory === "all" || product.getAttribute("data-name") === selectedCategory) {
                product.classList.remove("hide");
            } else {
                product.classList.add("hide");
            }
        });

        let baner = document.querySelector(".baner-txt");
        if (selectedCategory === "all") {
            baner.innerHTML = "Dobar dan, molim vas izaberite nešto iz naše ponude.";
        } else {
            baner.innerHTML = `Dobar dan, lista usluga za kategoriju: ${this.options[this.selectedIndex].text}`;
        }
    });

    // Pokaži select polje sada kada je sve spremno
    categorySelect.hidden = false;
}

// --- Dohvaćanje podataka s API-ja ---

// Pomoćna funkcija za fetch
async function fetchData(url) {
    return fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + localStorage.getItem("authToken")
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status} for URL: ${url}`);
        }
        return response.json();
    });
}

// Koristimo Promise.all da dohvatimo oba seta podataka paralelno
Promise.all([
    await fetchData("https://auto-servis.onrender.com/api/usluga"),  // Podaci za "Usluge"
    await fetchData("https://auto-servis.onrender.com/api/dijelovi") // Podaci za "Dijelovi"
])
.then(([uslugeData, dijeloviData]) => {
    // Podaci su stigli
    console.log("Dohvaćene usluge:", uslugeData);
    console.log("Dohvaćeni dijelovi:", dijeloviData);

    // 1. Nađi kategoriju "Usluge" u 'data' objektu i popuni 'products'
    const uslugeCategory = data.categories.find(cat => cat.name === "Usluge");
    if (uslugeCategory) {
        uslugeCategory.products = uslugeData;
    } else {
        console.error("Kategorija 'Usluge' nije pronađena u data.js");
    }

    // 2. Nađi kategoriju "Dijelovi" u 'data' objektu i popuni 'products'
    const dijeloviCategory = data.categories.find(cat => cat.name === "Dijelovi");
    if (dijeloviCategory) {
        dijeloviCategory.products = dijeloviData;
    } else {
        console.error("Kategorija 'Dijelovi' nije pronađena u data.js");
    }

    // 3. Sada kada je 'data.products' popunjen, pozovi funkciju za generiranje
    initializeProductListAndFilters();

})
.catch(error => {
    // Uhvati greške iz *bilo kojeg* fetch poziva
    console.error("Fetch error:", error);
    // Ovdje možete prikazati poruku korisniku
    let container = document.getElementById("product-container");
    if (container) {
        container.innerHTML = "<p style='color: red;'>Greška pri učitavanju proizvoda. Molimo pokušajte kasnije.</p>";
    }
});