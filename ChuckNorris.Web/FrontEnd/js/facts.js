const populateChuckFact = function (fact) {

    const factId = fact.id;
    const factDescription = fact.description;

    $("#chuck-facts-area").html(
        `<section class='chuck-fact' data-factid='${factId}' data-description='${factDescription}'>
            <p>${fact.description}</p>
            <div class="fact-nav-icons">
                <img height="100" src="./images/icon-arrow-prev.png" alt="Previous" onclick="loadChuckFact(${factId - 1}); return false;"/>
                <img height="100" src="./images/icon-arrow-next.png" alt="Next" onclick="loadChuckFact(${factId + 1}); return false;"/>
            </div>
        </section>`
    );

    $("#chuck-facts-area .chuck-fact").on("click", function () {
        const clickedElement = $(this);
        const className = "chuck-fact-selected";
        const isAlreadySelected = clickedElement.hasClass(className);
        const factId = clickedElement.data("factid");
        const factdescription = clickedElement.data("description");
        const indexedDb = window.indexedDB
            || window.mozIndexedDB
            || window.webkitIndexedDB
            || window.msIndexedDB
            || window.shimIndexedDB;

        // Open (or create) the database
        let open = indexedDb.open("ChuckNorris", 1);

        // Create the schema
        open.onupgradeneeded = function () {
            let db = open.result;
            db.createObjectStore("FavoriteFacts", { keyPath: "id" });
        };

        open.onsuccess = function () {
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
                tx.oncomplete = function () {
                    db.close();
                };
            }
        };
    });
};

const loadChuckFact = function (factId) {
    $.get(`${chuckNorrisAppSettings.apiBaseUrl}/facts/${factId || 1}`)
        .done(populateChuckFact)
        .fail(function (jqXhr, textStatus, errorThrown) {
            console.log(`Failed to load Chuck Fact. Error: ${errorThrown}`);
            $("#chuck-facts-area").html(
                `<section class='chuck-fact'>
                    <p>Something went wrong... Try again</p>
                    <div class="fact-nav-icons">
                        <img height="50" src="./images/icon-reload.png" alt="Previous" onclick="location.reload();"/>
                    </div>
                </section>`
            );
        })
        .always(() => {
            $("#loader").hide();
        });
};

$(document).ready(function () {
    loadChuckFact();
});