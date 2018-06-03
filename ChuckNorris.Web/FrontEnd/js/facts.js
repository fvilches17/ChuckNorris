﻿let selectedFactId = undefined;
let selectedFactDescription = undefined;

const populateChuckFact = function (fact) {
    const favorite = fact.markedAsFavorite ? "chuck-fact-selected" : "";
    const factId = fact.id;
    const description = fact.description;

    $("#chuck-facts-area").html(
        `<section class='chuck-fact ${favorite}' onclick='addRemoveFavoriteFact(this)'>
            <p>${description}</p>
            <div class="fact-nav-icons">
                <img height="100" src="./images/icon-arrow-prev.png" alt="Previous" onclick="event.stopPropagation(); loadChuckFact(${factId - 1}); return false;"/>
                <img height="100" src="./images/icon-arrow-next.png" alt="Next" onclick="event.stopPropagation(); loadChuckFact(${factId + 1}); return false;"/>
            </div>
            <small>${factId}</small>

        </section>`
    );

    selectedFactId = factId;
    selectedFactDescription = description;
    markMostRecentlyViewedFact(factId);
};

const markMostRecentlyViewedFact = function (factId) {
    // Open the database
    const open = indexedDb.open(indexedDbName, indexedDbVersion);

    open.onsuccess = () => {
        const db = open.result;
        const tableName = dbStores.mostRecentViewedFact.name;
        const tx = db.transaction(tableName, "readwrite");
        const store = tx.objectStore(tableName);

        store.put({ id: 0, factId: factId });

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

const addFactToDb = function (fact) {

    // Open the database
    const open = indexedDb.open(indexedDbName, indexedDbVersion);

    open.onsuccess = () => {
        const db = open.result;
        const tableName = dbStores.facts.name;
        const tx = db.transaction(tableName, "readwrite");
        const store = tx.objectStore(tableName);

        store.add({ id: fact.id, description: fact.description, markedAsFavorite: false }).onsuccess = () => {
            console.log(`Added new fact to db: ${fact.id}. ${fact.description}`);
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

const addRemoveFavoriteFact = function (target) {
    // Open the database
    const open = indexedDb.open(indexedDbName, indexedDbVersion);

    open.onsuccess = () => {
        const clickedElement = $(target);
        const db = open.result;
        const tableName = dbStores.facts.name;
        const tx = db.transaction(tableName, "readwrite");
        const store = tx.objectStore(tableName);
        const className = "chuck-fact-selected";
        const markAsFavorite = !clickedElement.hasClass(className);
        store.put({ id: selectedFactId, description: selectedFactDescription, markedAsFavorite: markAsFavorite }).onsuccess = () => {
            markAsFavorite ? clickedElement.addClass(className) : clickedElement.removeClass(className);
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

const getFactFromIndexedDb = function (factId) {

    // Open (or create) the database
    const open = indexedDb.open(indexedDbName, indexedDbVersion);

    open.onsuccess = function () {
        // Start a new transaction
        const db = open.result;
        const tx = db.transaction(dbStores.facts.name, "readwrite");
        const store = tx.objectStore(dbStores.facts.name);
        const request = store.get(factId);

        request.onsuccess = () => {
            const fact = request.result;
            if (!fact) {
                if (navigator.onLine) {
                    loadFactFromApi(factId);
                } else {
                    loadChuckFact(1);
                }
            } else {
                populateChuckFact(fact);
            }
        };

        request.onerror = (error) => {
            console.log(error);
        };

        tx.oncomplete = function () {
            db.close();
        };
    };

    open.onerror = function (error) {
        console.error(error);
    };
};

const getMostRecentlyViewedFactId = function () {

    let factId = undefined;

    // Open (or create) the database
    const open = indexedDb.open(indexedDbName, indexedDbVersion);

    open.onsuccess = function () {
        // Start a new transaction
        const db = open.result;
        const tx = db.transaction(dbStores.mostRecentViewedFact.name, "readwrite");
        const store = tx.objectStore(dbStores.mostRecentViewedFact.name);
        const request = store.get(0);

        request.onsuccess = () => {
            if (request.result) {
                factId = request.result.factId;
            }

            loadChuckFact(factId || 1 /*default*/);
        };

        request.onerror = (error) => {
            console.log(error);
        };

        tx.oncomplete = function () {
            db.close();
        };
    };

    open.onerror = function (error) {
        console.error(error);
    };

};

const loadErrorMessage = function (errorThrown) {
    console.log(`Failed to load Chuck Fact. Error: ${errorThrown}`);
    $("#chuck-facts-area").html(
        `<section class='chuck-fact'>
            <p>Something went wrong... Try again</p>
            <div class="fact-nav-icons">
                <img height="50" src="./images/icon-reload.png" alt="Previous" onclick="location.reload();"/>
            </div>
        </section>`
    );
}

const loadFactFromApi = function (factId) {
    $.get(`${chuckNorrisAppSettings.apiBaseUrl}/facts/${factId || 1}`)
        .done(function (fact) {
            addFactToDb(fact);
            populateChuckFact(fact);
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
            if (jqXHR.status === 404) {
                loadChuckFact(1);
            } else {
                console.error(errorThrown);
                loadErrorMessage();
            }
        })
        .always(() => { $("#loader").hide(); });
};

const loadChuckFact = function (factId) {
    getFactFromIndexedDb(factId);
};

$(document).ready(function () {
    //load fact requested from query string
    let factId = parseInt(getQueryParameterByName("id"));

    if (factId) {
        loadChuckFact(factId);
    } else {
        getMostRecentlyViewedFactId();
    }
});