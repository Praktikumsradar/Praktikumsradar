const { Client, Databases, Query } = Appwrite; // Globale Appwrite-Objekte aus dem Browser-SDK verwenden
const client = new Client(); // Erstellen Sie eine neue Instanz des Client-Objekts

client
    .setEndpoint('https://cloud.appwrite.io/v1') // Für Appwrite Cloud
    .setProject('67f4d87b0029b839d132') // Your project ID
;

const databases = new Databases(client); // Create a new instance of the Databases class

function createHeader(){
    const header = document.createElement('header'); // Create a header element
    header.className = 'header'; // Set the class name
    header.innerHTML = `
        <section>
            <a href="homepage.html" class="logo">
                <img src="images/logo.png" alt="Logo" class="logo-img"> 
                <p>Praktikumsradar</p>
            </a>
        </section>
        <section>
            <nav class="nav">
                <a href = "homepage.html">Startseite |</a>
                <a href = "praktika.html">Praktika |</a>
                <a href = "kontakt.html">Kontakt |</a>
                <a href = "bewerben.html">Bewerben |</a>
                <a href = "impressum.html">Impressum </a>
            </nav>
        </section>
    `; // Set the inner HTML
    return header; // Return the header element
}

function createFooter(){
    const footer = document.createElement('footer'); // Create a footer element
    footer.className = 'footer'; // Set the class name
    footer.innerHTML = `
    <section>
        <p style = "font-size: 10px">Diese Website wurde im Rahmen eines Schulprojektes des <a class = standart href="https://www.siemens-gymnasium-berlin.de/">Werner-von-Siemens Gymnasiums Berlin</a> von einer Schülergruppe entwickelt</p>
    </section>
    `; // Set the inner HTML
    return footer; // Return the footer element
}

function showFilter(){
    const filter = document.createElement('div'); // Create a filter element
    filter.className = 'filter'; // Set the class name
    filter.innerHTML = `
    <section>
        <h2>Filter für verfügbare Praktika</h2>
        <form>
            <label for="name">Unternehmensbezeichnung:</label>
            <input type="text" id="name" name="name">
            <label for="stadt">Stadt:</label>
            <input type="text" id="ort" name="ort">
            <label for="berufsfeld">Berufsfeld:</label>
            <input type="text" id="berufsfeld" name="berufsfeld">
            <label for="Beginn">Beginn:</label>
            <input type="date" id="beginn" name="beginn">
            <label for="Dauer">Dauer (in Tagen):</label>
            <input type="number" id="dauer" name="dauer" min = "1">
            <button type="button" onclick="displayPraktika()">Filter</button>
            <button type="button" onclick="resetForm()">Reset</button>
        </form>
    </section>
    `; // Set the inner HTML
    // Add event listener to form inputs to save the values in sessionStorage
    filter.querySelector('form').addEventListener('input', function(event) {
        const input = event.target;
        sessionStorage.setItem(input.name, input.value); // Save the value in sessionStorage
    });
    // Load the saved values from sessionStorage
    if (sessionStorage) {
        const inputs = filter.querySelectorAll('input');
        inputs.forEach(input => {
            const savedValue = sessionStorage.getItem(input.name); // Get the saved value
            if (savedValue) {
                input.value = savedValue; // Set the input value to the saved value
            }
        });
    }
    // Add event listener to the form input to enable the button
    filter.querySelector('form').addEventListener('keydown', function(event) {
        const input = event.target;
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevent form submission
            displayPraktika(); // Call the displayPraktika function
        }
    });

    return filter; // Return the filter element
}

function resetForm(){
    const inputs = document.querySelectorAll('.filter input'); // Select all input elements in the filter
    inputs.forEach(input => {
        input.value = ''; // Clear the input values
        sessionStorage.clear(); // Remove the saved value from sessionStorage
    });
}

function getFilterData(){
    let name = document.getElementById('name').value; // Get the name value
    let ort = document.getElementById('ort').value; // Get the ort value
    let berufsfeld = document.getElementById('berufsfeld').value; // Get the berufsfeld value
    let beginn = document.getElementById('beginn').value; // Get the beginn value
    let dauer = document.getElementById('dauer').value; // Get the dauer value
    // Check if the fields are empty and set them to null
    if (name === '') name = null;
    if (ort === '') ort = null;
    if (berufsfeld === '') berufsfeld = null;
    if (beginn === '') beginn = null;
    if (dauer === '') dauer = null;
    // Return the filter data
    return { name, ort, berufsfeld, beginn, dauer }; // Return the filter data
}

function getData() {
    let queries = []; // Create a query object
    const filter = getFilterData(); // Get the filter data
    const name = filter.name; // Get the name from the filter
    const ort = filter.ort; // Get the ort from the filter
    const berufsfeld = filter.berufsfeld; // Get the berufsfeld from the filter
    const beginn = filter.beginn; // Get the beginn from the filter
    const dauer = filter.dauer; // Get the dauer from the filter
    
    // Korrigiere die Suche: Stelle sicher, dass der Parameter ein String ist
    if (name) queries.push(Query.search('Name', String(name))); 
    if (ort) queries.push(Query.search('Ort', String(ort))); 
    if (berufsfeld) queries.push(Query.search('Berufsfeld', String(berufsfeld))); 
    
    if (beginn) queries.push(Query.lessThanEqual('Beginn', beginn)); 
    if (dauer) queries.push(Query.lessThanEqual('Dauer', parseInt(dauer)));
    
    queries.push(Query.limit(25)); 
    queries.push(Query.orderDesc('$updatedAt')); 
    
    return databases.listDocuments(
        "67f4d89c002b3b4ebf72", // Your database ID
        "67f4d8ad00252f1c38a7", // Your collection IDs
        queries
    ).then(function (response) {
        console.log(response);
        return response;
    }).catch(function (error) {
        console.error("Fehler bei der Datenabfrage:", error);
        return null;
    });
}

function displayPraktikaEndgueltig(elements){
    const body = document.querySelector('body'); // Select the body element
    body.innerHTML = ''; // Clear the body content
    body.appendChild(createHeader()); // Append the header
    body.appendChild(showFilter()); // Append the filter
    body.appendChild(elements); // Append the praktika content
    body.appendChild(createFooter()); // Append the footer
}

function displayPraktika() {
    // Erzeugte vor dem Anzeigen ein Lade-Element
    const loadingElement = document.createElement('div');
    loadingElement.textContent = 'Daten werden geladen...';

    const body = document.querySelector('body');
    body.innerHTML = '';
    body.appendChild(createHeader());
    body.appendChild(showFilter());
    body.appendChild(loadingElement);
    body.appendChild(createFooter());

    // Daten abrufen und anzeigen
    getData().then(data => {
        if (!data || !data.documents || data.documents.length === 0) {
            loadingElement.textContent = 'Keine Praktika gefunden.';
            return;
        }

        const main = document.createElement('main');
        main.className = 'praktikas';
        main.innerHTML = `
            <h2>Ergebnisse für Praktika</h2>`
        for (let i = 0; i < data.documents.length; i++) {
            const doc = data.documents[i];
            const updatet=doc['$updatedAt'];
            const date = new Date(updatet);
            const formattedDate = date.toLocaleDateString('de-DE', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
            const formattedTime = date.toLocaleTimeString('de-DE', {
                hour: '2-digit',
                minute: '2-digit'
            });
            const formattedDateTime = `${formattedDate} ${formattedTime}`;
            main.innerHTML += `
                <section class = "praktikum">
                    <p style = "text-align: center">Unternehmensname:</p><p style = "color: white"> ${doc.Name}</p>
                    <p style = "color: #66FCF1">| Adresse: </p><p><a style ="color: white" href = "https://www.google.de/maps/place/${doc.Ort}"><u>${doc.Ort || "Nicht angegeben"}</u></a></p>
                    <p style = "color: #66FCF1">| Berufsfeld:</p><p style = "color: white"> ${doc.Berufsfeld || "Nicht angegeben"}</p>
                    <p style = "color: #66FCF1">| Beschreibung der Tätigkeit:</p><p style = "color: white"> ${doc.Beschreibung || "Nicht angegeben"}</p>
                    <p style = "color: #66FCF1">| Email: </p><p><a style = "color: white" href ="mailto:${doc.Email}"><u>${doc.Email || "Nicht angegeben"}</u></a></p>
                    <p style = "color: #66FCF1">| Telefon: </p><p><a style = "color: white" href ="tel:${doc.Tel}"><u>${doc.Tel || "Nicht angegeben"}</u></a></p>
                    <p style = "color: #66FCF1">| Link: </p><p> <a style="color: white" href= "${doc.Link}"><u>${doc.Link || "Nicht angegeben"}</u></a></p>
                    <p style = "color: #66FCF1">| Verfügbare Plätze: </p><p style = "color: white">${doc.AnzahlPlaetze || "Nicht angegeben"}</p>
                    <p style = "color: #66FCF1">| Dauer: </p><p style = "color: white"> ${doc.Dauer || "Nicht angegeben"}</p>    
                    <p style = "color: #66FCF1">| Beginn: </p><p style = "color: white"> ${doc.Beginn || "Nicht angegeben"}</p>
                    <p style = "color: #66FCF1">| Letztes Update: </p><p style = "color: white"> ${formattedDateTime || "Nicht angegeben"}</p>
                </section>
            `;
        }

        // Ersetze den Loading-Text mit den Ergebnissen
        body.removeChild(loadingElement);
        body.insertBefore(main, body.lastChild);
    });
}

function getDataFirst() {
    return databases.listDocuments(
        "67f4d89c002b3b4ebf72", // Your database ID
        "67f4d8ad00252f1c38a7", // Your collection IDs
        [Query.limit(25), Query.orderDesc('$updatedAt')]
    ).then(function (response) {
        console.log(response);
        return response;
    }).catch(function (error) {
        console.error("Fehler bei der Datenabfrage:", error);
        return null;
    });
}

function showPraktikaFirst(){
    const body = document.querySelector('body'); // Select the body element

    // Create loading element
    const loadingElement = document.createElement('div');
    loadingElement.textContent = 'Daten werden geladen...';
    body.appendChild(loadingElement);

    // Get the data and process it asynchronously
    getDataFirst().then(data => {
        if (!data || !data.documents || data.documents.length === 0) {
            loadingElement.textContent = 'Keine Praktika gefunden.';
            return;
        }

        const main = document.createElement('main');
        main.className = 'praktikas';
        main.innerHTML = `
            <h2 style = "text-align: center">Ergebnisse für Praktika</h2>`;

        for (let i = 0; i < data.documents.length; i++) {
            const doc = data.documents[i];
            const updatet = doc['$updatedAt'];
            const date = new Date(updatet);
            const formattedDate = date.toLocaleDateString('de-DE', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
            const formattedTime = date.toLocaleTimeString('de-DE', {
                hour: '2-digit',
                minute: '2-digit'
            });
            const formattedDateTime = `${formattedDate} ${formattedTime}`;
            main.innerHTML += `
                <section class = "praktikum">
                    <p style = "text-align: center">Unternehmensname:</p><p style = "color: white"> ${doc.Name}</p>
                    <p style = "color: #66FCF1">| Adresse: </p><p><a style ="color: white" href = "https://www.google.de/maps/place/${doc.Ort}"><u>${doc.Ort || "Nicht angegeben"}</u></a></p>
                    <p style = "color: #66FCF1">| Berufsfeld:</p><p style = "color: white"> ${doc.Berufsfeld || "Nicht angegeben"}</p>
                    <p style = "color: #66FCF1">| Beschreibung der Tätigkeit:</p><p style = "color: white"> ${doc.Beschreibung || "Nicht angegeben"}</p>
                    <p style = "color: #66FCF1">| Email: </p><p><a style = "color: white" href ="mailto:${doc.Email}"><u>${doc.Email || "Nicht angegeben"}</u></a></p>
                    <p style = "color: #66FCF1">| Telefon: </p><p><a style = "color: white" href ="tel:${doc.Tel}"><u>${doc.Tel || "Nicht angegeben"}</u></a></p>
                    <p style = "color: #66FCF1">| Link: </p><p> <a style="color: white" href= "${doc.Link}"><u>${doc.Link || "Nicht angegeben"}</u></a></p>
                    <p style = "color: #66FCF1">| Verfügbare Plätze: </p><p style = "color: white">${doc.AnzahlPlaetze || "Nicht angegeben"}</p>
                    <p style = "color: #66FCF1">| Dauer: </p><p style = "color: white"> ${doc.Dauer || "Nicht angegeben"}</p>    
                    <p style = "color: #66FCF1">| Beginn: </p><p style = "color: white"> ${doc.Beginn || "Nicht angegeben"}</p>
                    <p style = "color: #66FCF1">| Letztes Update: </p><p style = "color: white"> ${formattedDateTime || "Nicht angegeben"}</p>
                </section>
            `;
        }

        // Replace the loading text with the results
        body.removeChild(loadingElement);
        body.insertBefore(main, body.lastChild);
    }).catch(error => {
        console.error("Fehler beim Anzeigen der Praktika:", error);
        loadingElement.textContent = 'Fehler beim Laden der Daten.';
    });
}


function showPraktika(){
    const body = document.querySelector('body'); // Select the body element
    body.innerHTML = ''; // Clear the body content
    body.appendChild(createHeader()); // Append the header
    body.appendChild(showFilter()); // Append the filter
    showPraktikaFirst(); // Show the praktika
    body.appendChild(createFooter()); // Append the footer
}

function createHome(){ // erstellt die Startseite
    const main = document.createElement('main'); // Create a main element
    main.className = 'home';
    main.innerHTML = `
    <section>
        <h1>Willkommen bei Praktikumsradar – Dein Kompass fürs Praktikum!</h1>
        <p>Du suchst ein spannendes Praktikum, das wirklich zu dir passt?<br> Dann bist du hier genau richtig!<br>
        Praktikumsradar hilft dir dabei, den Überblick zu behalten und gezielt die besten Praktikumsplätze zu finden – ob für Schule, Studium oder den ersten Schritt ins Berufsleben.
        Mit uns entdeckst du nicht nur Möglichkeiten, sondern Chancen.<br>
        Starte jetzt deine Suche und finde dein nächstes Abenteuer!</p>
    </section>
    `; // Set the inner HTML
    return main; // Return the main element
}

function loadHome() { // ladet die Startseite
    const body = document.querySelector('body'); // Select the body element
    body.innerHTML = ''; // Clear the body content
    body.appendChild(createHeader()); // Append the header
    body.appendChild(createHome()); // Append the home content
    body.appendChild(createFooter()); // Append the footer
}

function createKontakt(){ // erstellt die Kontaktseite
    const main = document.createElement('main'); // Create a main element
    main.className = 'kontakt';
    main.innerHTML = `
    <section>
        <h1>Ansprechpartner</h1>
        <p><strong>Koordinator Berufsorientierung Werner von Siemens Gymnasium:</strong> Urs Dudzus </p>
        <p><strong>E-Mail:</strong> <a class = standart href = "mailto:dudzus@berufsorientierung-wvs.de"> dudzus@berufsorientierung-wvs.de</a> </p>
    </section>
    `; // Set the inner HTML
    return main; // Return the main element
}

function loadKontakt() { // ladet die Kontaktseite
    const body = document.querySelector('body'); // Select the body element
    body.innerHTML = ''; // Clear the body content
    body.appendChild(createHeader()); // Append the header
    body.appendChild(createKontakt()); // Append the home content
    body.appendChild(createFooter()); // Append the footer
}

function createBewerben(){ // erstellt die Kontaktseite
    const main = document.createElement('main'); // Create a main element
    main.className = 'bewerben';
    main.innerHTML = `
    <section>
        <h1>Bewerbungsverfahren zum Ausstellen eines Praktikums auf Praktikumsradar</h1>
        <p>Schreiben Sie eine E-Mail an <a class = standart href = "mailto:praktikumsstellenwvsberlin@gmail.com">praktikumsstellenwvsberlin@gmail.com</a> mit folgenden Informationen: </p>
        <ul>
            <li>Name des Unternehmens</li>
            <li>Adresse (Postleitzahl + Stadt, Straße und Hausnummer)</li>
            <li>Berufsfeld</li> 
            <li>Beschreibung der Tätigkeit</li>
            <li>E-Mail</li>
            <li>Telefonnummer</li>
            <li>Linke zur Website (optional)</li>
            <li>Verfügbare Plätze (optional)</li>
            <li>Dauer (optional)</li>
            <li>Beginn (optional)</li>
        </ul>
    </section>
    `; // Set the inner HTML
    return main; // Return the main element
}

function loadBewerben() { // ladet die Bewerbungsseite
    const body = document.querySelector('body'); // Select the body element
    body.innerHTML = ''; // Clear the body content
    body.appendChild(createHeader()); // Append the header
    body.appendChild(createBewerben()); // Append the Bewerbungsseite
    body.appendChild(createFooter()); // Append the footer
}

function createImpressum(){ // erstellt die Kontaktseite
    const main = document.createElement('main'); // Create a main element
    main.className = 'impressum';
    main.innerHTML = `
    <section>
        <ul>
            <li>Name:Andreas Köhler, Urs Dudzus</li>
            <li>Schule: <a class = standart href="https://www.siemens-gymnasium-berlin.de/">Werner-von-Siemens Gymnasiums Berlin</a></li>
            <li>Addresse: a class = standart href = "https://www.google.com/maps/place/Werner-von-Siemens-Gymnasium/@52.4321016,13.2068833,17z/data=!3m1!4b1!4m6!3m5!1s0x47a85974fdb72b27:0xc55e6a1770b8edf2!8m2!3d52.4320984!4d13.2117542!16s%2Fg%2F11dxlg1yr1?entry=ttu&g_ep=EgoyMDI1MDYzMC4wIKXMDSoASAFQAw%3D%3D">Beskidenstraße 1, 14129 Berlin</a></li>
            <li>E-Mail: köhler@siemens-gymnasium-berlin.de oder dudzus@siemens-gymnasium-berlin.de</li>
        </ul>
    </section>
    `; // Set the inner HTML
    return main; // Return the main element
}

function loadImpressum() { // ladet die Bewerbungsseite
    const body = document.querySelector('body'); // Select the body element
    body.innerHTML = ''; // Clear the body content
    body.appendChild(createHeader()); // Append the header
    body.appendChild(createImpressum()); // Append the Bewerbungsseite
    body.appendChild(createFooter()); // Append the footer
}
