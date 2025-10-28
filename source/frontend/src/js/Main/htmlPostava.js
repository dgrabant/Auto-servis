// Generiranje navigacije u sidebar-u
    let sidebar = document.getElementById("sidebar");

    //Naslov i neki pozdravni tekst
    let infoBox = document.createElement("div");
    infoBox.className = "sidebar-info";
    infoBox.innerHTML = `<h3> Autoservis Harlemova kočija </h3>
      <p>Certificirani Autoservis Audi vozila</p>
    `;
    sidebar.appendChild(infoBox);

    let nav = document.createElement("nav");
    //nav.className = "hidden";
    nav.id = "navDjelovi";
    nav.hidden = true;

    let categoryLabel = document.createElement("h4");
    categoryLabel.textContent = "Odaberite kategoriju:";
    nav.appendChild(categoryLabel);


    let categorySelect = document.createElement("select");
    categorySelect.className = "select";
    

    // Dodavanje "Sve kategorije" opcije
    let allOption = document.createElement("option");
    allOption.value = "Sve";
    allOption.textContent = "Sve kategorije";
    allOption.selected = true;
    categorySelect.appendChild(allOption);

    // Dodavanje dinamičkih kategorija
    data.categories.forEach(cat=>{
      let opt = document.createElement("option");
      opt.value = cat.name.toLowerCase();
      opt.textContent = cat.name_disp;
      opt.setAttribute("data-image", cat.image);
      categorySelect.appendChild(opt);
    });
    nav.appendChild(categorySelect);
    sidebar.appendChild(nav);

    let hours = document.createElement("div");
    hours.className = "sidebar-hours";
    hours.innerHTML = `
      <h4>Radno vrijeme</h4>
      <ul>
        <li>Pon – Pet: 08:00 – 16:00</li>
        <li>Subota: 08:00 – 14:00</li>
        <li>Nedjelja: Zatvoreno</li>
      </ul>
    `;
    sidebar.appendChild(hours);

    //Kontakt podaci
    let contact = document.createElement("div");
    contact.className = "sidebar-contact";
    contact.innerHTML = `
      <h4>Kontakt</h4>
      <p>Unska 3, 10000 Zagreb</p>
      <!--<p>harlemova.kocija@gmail.com</p>>
    `;
    sidebar.appendChild(contact);

    //Generiranje proizvoda
    let container = document.getElementById("product-container");

    function buildProducts(){
      container.innerHTML = "";
      data.categories.forEach(cat=>{
        cat.products.forEach(prod=>{
          let div = document.createElement("div");
          div.className = "product";
          div.setAttribute("data-category", cat.name.toLowerCase());

          let imgDiv = document.createElement("div");
          imgDiv.className = "image";
          let img = document.createElement("img");
          img.src = prod.image;
          img.alt = prod.name;

          let priceTag = document.createElement("span");
          priceTag.className = "price-tag";
          priceTag.textContent = prod.price;

          imgDiv.appendChild(img);
          imgDiv.appendChild(priceTag);
          div.appendChild(imgDiv);

          let h3 = document.createElement("h3");
          h3.textContent = prod.name;
          div.appendChild(h3);

          let h4 = document.createElement("h4");
          h4.textContent = cat.name_disp;
          div.appendChild(h4);

          let desc = document.createElement("p");
          desc.className= "description";
          desc.textContent = prod.description || "";
          div.appendChild(desc);

          container.appendChild(div);
        });
      });
    }
    buildProducts();

    // Filtriranje proizvoda po kategoriji
    categorySelect.addEventListener("change", function(){
      let val = this.value;
      let selectedOption = this.options[this.selectedIndex];
      let banner = document.querySelector(".baner-txt");
      let imgBanner = document.querySelector(".present_pict");

      if(val==="Sve"){
        banner.innerHTML = "Dobrodošli!";
        imgBanner.src = "./src/assets/pictures/audi.jpg";
        document.getElementById("selected").innerText = "Molimo odaberite kategoriju";
      } else{
        banner.innerHTML = "Odabrana kategorija: " + selectedOption.text;
        imgBanner.src = selectedOption.getAttribute("data-image");
        document.getElementById("selected").innerText = selectedOption.text;
      }

      document.querySelectorAll(".product").forEach(prod=>{
        if(val==="Sve" || prod.getAttribute("data-category")===val){
          prod.classList.remove("hide");
        } else{
          prod.classList.add("hide");
        }
      });
    });