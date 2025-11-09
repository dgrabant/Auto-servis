// main.js

// Učitavanje podataka iz data.js
// Ovdje pretpostavljamo da je data.js ispravno učitan na stranici

// Generiranje navigacije u sidebar-u
let sidebar = document.getElementById("sidebar");
let nav = document.createElement("nav");

// Kreiraj oznaku za kategorije
let categoryLabel = document.createElement("h4");
categoryLabel.className = "oda_kat";
categoryLabel.textContent = "Odaberite kategoriju:";

// Kreiraj select element za odabir kategorije
let categorySelect = document.createElement("select");
categorySelect.id = "category-select";
categorySelect.className = "select";
categorySelect.hidden = true;

// Dodavanje "Sve kategorije" opcije
let allOption = document.createElement("option");
allOption.value = "all";
allOption.textContent = "Sve kategorije";
allOption.setAttribute("data-name", "all");  // Dodavanje data-name za default kategoriju
allOption.selected = true;
categorySelect.appendChild(allOption);

// Dodavanje dinamičkih kategorija
data.categories.forEach(category => {
    let option = document.createElement("option");
    option.value = category.name.toLowerCase().replace(/\s+/g, "_"); // Zamjena razmaka sa "_"
    option.textContent = category.name;
    option.setAttribute("data-name", category.image);  // Dodavanje data-name atributa sa imenom slike
    categorySelect.appendChild(option);
});

// Dodavanje navigacije u sidebar
nav.appendChild(categoryLabel);
nav.appendChild(categorySelect);
sidebar.appendChild(nav);

// Generiranje proizvoda
let container = document.getElementById("product-container"); // Osiguraj da postoji element s ovim ID-em
let idCounter = 0;

data.categories.forEach(category => {
    category.products.forEach(product => {
        let productDiv = document.createElement("div");
        productDiv.className = "product";
        productDiv.setAttribute("data-name", category.name.toLowerCase().replace(/\s+/g, "_")); // Kategorija bez razmaka

        let imageDiv = document.createElement("div");
        imageDiv.className = "image";

        let img = document.createElement("img");
        img.className = "slika";
        img.src = `/assets/pictures/dijelovi/${product.image}`;
        img.alt = product.name;
        
        // --- DODAVANJE CIJENE (price) ---
        let priceTag = document.createElement("span");
        priceTag.className = "price-tag";
        priceTag.textContent = product.price + " €"; // Dohvaća cijenu iz 'data'

        let spanCount = document.createElement("span");
        spanCount.className = "proi-count";
        spanCount.id = idCounter;

        imageDiv.appendChild(img);
        imageDiv.appendChild(priceTag); // Dodaj cijenu u 'image' div
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
        productName.textContent = product.name;
        let productClass = document.createElement("h4");
        productClass.textContent = category.name_disp;
        
        // --- DODAVANJE OPISA (description) ---
        let descriptionP = document.createElement("p");
        descriptionP.className = "description";
        descriptionP.textContent = product.description; // Dohvaća opis iz 'data'

        productDiv.appendChild(imageDiv);
        productDiv.appendChild(addToCart);
        productDiv.appendChild(productName);
        productDiv.appendChild(productClass);
        productDiv.appendChild(descriptionP); // Dodaj opis
        
        container.appendChild(productDiv);
        idCounter++;
    });
});
// Filtriranje proizvoda po kategoriji

document.getElementById("category-select").addEventListener("change", function() {
    let selectedCategory = this.value;
    let present_pict = document.querySelector(".present_pict");
    let selectedOption = this.options[this.selectedIndex]; // Odabrana opcija
    let selectedImage = selectedOption.getAttribute('data-name'); // Uzima data-name atribut iz odabrane opcije

    // Postavljanje slike za kategoriju prema odabranoj opciji
    if (selectedCategory === "all") {
        present_pict.src = "/assets/pictures/dijelovi/audi.jpg"; // Slika za "Sve kategorije"
    } else {
        present_pict.src = `/assets/pictures/dijelovi/${selectedImage}`; // Slika za odabranu kategoriju
    }

    document.querySelectorAll(".product").forEach(product => {
        if (selectedCategory === "all" || product.getAttribute("data-name") === selectedCategory) {
            product.classList.remove("hide");
        } else {
            product.classList.add("hide");
        }
    });

    let baner = document.querySelector(".baner-txt");
    // Ažuriranje baner teksta
    if (selectedCategory === "all") {
        baner.innerHTML = "Dobar dan, molim vas izaberite nešto iz naše ponude.";
        //document.getElementById('selected').innerText = 'Kategorija nije selektirana';
    } else {
        baner.innerHTML = `Dobar dan, lista usluga za kategoriju: ${this.options[this.selectedIndex].text}`;
        //document.getElementById('selected').innerText = this.options[this.selectedIndex].text;
    }
});