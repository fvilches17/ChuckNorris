let selectedFactId = undefined;
let selectedDescription = undefined;
let factsOnScreen = 0;

const populateChuckFacts = function (facts) {
    if (!facts || facts.length === 0) {
        showNoResultsMessage();
        return;
    }

    const area = $("#chuck-facts-area");
    for (let fact of facts) {
        area.append(
            `<section class='chuck-fact chuck-fact-selected' onclick="removeFavoriteFact(this);">
                <p>${fact.description}</p>
                <small>${fact.id}</small>
            </section>`
        );
    }
};

const removeFavoriteFact = function (target) {
    // Open the database
    const open = indexedDb.open(indexedDbName, indexedDbVersion);

    open.onsuccess = () => {
        const db = open.result;
        const tableName = dbStores.facts.name;
        const tx = db.transaction(tableName, "readwrite");
        const store = tx.objectStore(tableName);
        const clickedElement = $(target);
        const factId = parseInt(clickedElement.find("small").text());
        const description = clickedElement.find("p").text();

        store.put({ id: factId, description: description, markedAsFavorite: false }).onsuccess = () => {
            clickedElement.fadeOut("slow", () => {
                clickedElement.remove();
                factsOnScreen--;
                if (factsOnScreen === 0) showNoResultsMessage();
            });
            
        };

        tx.oncomplete = () => {
            db.close();
        };

        tx.onerror = (error) => {
            console.error(error);
        };
    };

    open.onerror = (error) => {
        console.error(error);
    };
};

const getFavoriteFacts = function () {
    // Open (or create) the database
    const open = indexedDb.open(indexedDbName, indexedDbVersion);

    open.onsuccess = function () {
        // Start a new transaction
        const db = open.result;
        const tx = db.transaction(dbStores.facts.name, "readwrite");
        const store = tx.objectStore(dbStores.facts.name);
        const cursor = store.openCursor();

        const facts = [];
        cursor.onsuccess = (event) => {
            const cursor = event.target.result;
            if (cursor) {
                if (cursor.value.markedAsFavorite) {
                    const fact = {
                        id: cursor.value.id,
                        description: cursor.value.description
                    };
                    facts.push(fact);
                }

                cursor.continue();
            } else {
                factsOnScreen = facts.length;
                populateChuckFacts(facts);
                $("#loader").hide();
            }
        };

        cursor.error = (error) => {
            $("#loader").hide();
            console.error(error);
        };
    };

    open.onerror = function (error) {
        console.error(error);
        $("#loader").hide();
    };

};

const showNoResultsMessage = function () {
    $("#chuck-facts-area").append(
        `<section class='chuck-fact'">
            <p>Nothing to see here</p>
            <img height="100" src="./images/icon-arrow-prev.png" alt="Back" onclick="window.history.back();"/>
        </section>`
    );
};

$(document).ready(function () {
    getFavoriteFacts();
});