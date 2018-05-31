const populateChuckFacts = function(facts) {
    $("#num-of-facts").text(facts.length);

    const area = $("#chuck-facts-area");
    for (let fact of facts) {
        area.append(
            `<section class='chuck-fact' data-factid='${fact.id}' data-description='${fact.description}'>
                 <p>${fact.description}</p>
            </section>`
        );
    }

    $("#chuck-facts-area .chuck-fact").on("click",
        function() {
            const clickedElement = $(this);
            const className = "chuck-fact-selected";
            const isAlreadySelected = clickedElement.hasClass(className);
            const factId = clickedElement.data("factid");
            const factdescription = clickedElement.data("description");
            const indexedDB = window.indexedDB ||
                window.mozIndexedDB ||
                window.webkitIndexedDB ||
                window.msIndexedDB ||
                window.shimIndexedDB;

            // Open (or create) the database
            let open = indexedDB.open("Chuck", 1);

            // Create the schema
            open.onupgradeneeded = function() {
                let db = open.result;
                db.createObjectStore("FavoriteFacts", { keyPath: "id" });
            };

            open.onsuccess = function() {
                // Start a new transaction
                const db = open.result;
                const tx = db.transaction("FavoriteFacts", "readwrite");
                const store = tx.objectStore("FavoriteFacts");

                if (isAlreadySelected) {
                    store.delete(factId).onsuccess = () => {
                        clickedElement.removeClass(className);
                    };
                } else {
                    store.put({ id: factId, description: factdescription }).onsuccess = () => {
                        clickedElement.addClass(className);
                    };

                    // Close the db when the transaction is done
                    tx.oncomplete = function() {
                        db.close();
                    };
                }
            };
        });
};

const loadChuckFacts = function() {
    $.get(`${chuckNorrisAppSettings.apiBaseUrl}/facts`)
        .done(populateChuckFacts)
        .fail(function(jqXHR, textStatus, errorThrown) {
            console.error(errorThrown);
        })
        .always(() => {
            $("#loader").hide();
        });
};


$(document).ready(function () {
    loadChuckFacts();

    $("#refresh-icon").on("click", loadChuckFacts);
});