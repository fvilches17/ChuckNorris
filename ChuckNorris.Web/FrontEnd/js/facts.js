let selectedFactId = undefined;
let selectedFactDescription = undefined;
let touchStartPositionX = undefined;
let currentFactOnScreen = undefined;
let originalScreenOffsetForFact = undefined;
let readyToLoadPrevFact = false;
let readyToLoadNextFact = false;

const populateChuckFact = function (fact) {
    const favorite = fact.markedAsFavorite ? "chuck-fact-selected" : "";
    const factId = fact.id;
    const description = fact.description;
    const chuckFact =
        `<section class='chuck-fact ${favorite}' 
            onclick='addRemoveFavoriteFact(this)' 
            ontouchstart="handleTouchStart(event)"
            ontouchmove="handleTouchMove(event)"
            ontouchend="handleTouchEnd(event)">

            <p>${description}</p>
            <div class="fact-nav-icons">
                <img height="100" src="./images/icon-arrow-prev.png" alt="Previous" onclick="event.stopPropagation(); loadChuckFact(${factId - 1}); return false;"/>
                <img height="100" src="./images/icon-arrow-next.png" alt="Next" onclick="event.stopPropagation(); loadChuckFact(${factId + 1}); return false;"/>
            </div>
            <small>${factId}</small>
        </section>`;

    const chuckFactElement = $(".chuck-fact");

    if (chuckFactElement.length === 1) {
        chuckFactElement.replaceWith(chuckFact);
    } else {
        $("#chuck-facts-area").append(
            chuckFact
        );
    }

    selectedFactId = factId;
    selectedFactDescription = description;
    currentFactOnScreen = $(".chuck-fact");
    markMostRecentlyViewedFact(factId);
};

let lastMove = null;

const handleTouchStart = function (event) {
    originalScreenOffsetForFact = currentFactOnScreen.offset().left;
    readyToLoadPrevFact = false;
    readyToLoadNextFact = false;
    currentFactOnScreen.css({ "transition-duration": "0s" });
    lastMove = event;
};

const handleTouchMove = function (event) {
    const currentLeftOffset = currentFactOnScreen.offset().left;

    const isLandscape = window.innerWidth > window.innerHeight;
    const leftBorderThreshold = isLandscape ? 100 : 10;
    const leftBorderReeached = currentLeftOffset <= leftBorderThreshold;
    const rightBorderReeached = currentLeftOffset >= $(window).width() - currentFactOnScreen.width() - 45;

    if (leftBorderReeached || rightBorderReeached) {
        currentFactOnScreen.css({ opacity: 0.5 });
        readyToLoadNextFact = leftBorderReeached;
        readyToLoadPrevFact = rightBorderReeached;
        return;
    }

    const change = lastMove.touches[0].clientX - event.touches[0].clientX;
    lastMove = event;

    currentFactOnScreen.offset({ left: currentLeftOffset - change });
};


const handleTouchEnd = function () {

    if (readyToLoadPrevFact) {
        loadChuckFact(selectedFactId - 1);
        return;
    }

    if (readyToLoadNextFact) {
        loadChuckFact(selectedFactId + 1);
        return;
    }

    currentFactOnScreen.offset({ left: originalScreenOffsetForFact });
    currentFactOnScreen.css({ "transition-duration": "0.5s", opacity: 1.0 });
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
                if (!navigator.onLine) {
                    loadChuckFact(1);
                } else {
                    loadFactFromApi(factId);
                }
            } else {
                $("#loader").hide();
                populateChuckFact(fact);
            }
        };

        request.onerror = (error) => {
            console.log(error);
            $("#loader").hide();
            loadErrorMessage();
        };

        tx.oncomplete = function () {
            db.close();
        };
    };

    open.onerror = function (error) {
        console.error(error);
        $("#loader").hide();
        loadErrorMessage();
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
                $("#loader").hide();
            }

            loadChuckFact(factId || 1 /*default*/);
        };

        request.onerror = (error) => {
            console.log(error);
            $("#loader").hide();
        };

        tx.oncomplete = function () {
            db.close();
        };
    };

    open.onerror = function (error) {
        console.error(error);
        $("#loader").hide();
    };

};

const loadMostRecentFact = function () {
    const open = indexedDb.open(indexedDbName, indexedDbVersion);

    open.onsuccess = () => {
        const db = open.result;
        const tableName = dbStores.facts.name;
        const tx = db.transaction(tableName, "readwrite");
        const store = tx.objectStore(tableName);
        const countRequest = store.count();
        countRequest.onsuccess = () => {
            loadChuckFact(countRequest.result);
        };
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
};

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
    if (currentFactOnScreen) currentFactOnScreen.hide();
    $("#loader").show();

    if (factId === 0) loadMostRecentFact(); //means we've reched 1, and tried for previous fact
    else getFactFromIndexedDb(factId);
};


$(document).ready(function () {
    //try load fact requested from query string
    const factId = parseInt(getQueryParameterByName("id"));
    if (factId) {
        loadChuckFact(factId);
    } else {
        getMostRecentlyViewedFactId();
    }

    window.addEventListener("orientationchange", function () {
        if (currentFactOnScreen) {
            //center fact
            const screenWidth = window.innerWidth;
            const isLandscape = screenWidth > window.innerHeight;
            const factWidth = currentFactOnScreen.width();
            const offset = (screenWidth / 2) - (factWidth / 2);
            currentFactOnScreen.offset({ left: isLandscape ? offset + 10: offset });
        }
    });
});