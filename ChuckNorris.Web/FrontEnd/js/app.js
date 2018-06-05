//Globals
const notificationsIcon = $("#notification-icon");
const indexedDb = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;
const indexedDbName = "ChuckNorris";
const indexedDbVersion = 3;
const dbStores = {
    userSettings: {
        name: "UserSettings",
        keyPath: "name"
    },
    facts: {
        name: "Facts",
        keyPath: "id"
    },
    mostRecentViewedFact: {
        name: "MostRecentViewedFact",
        keyPath: "id"
    },
    factSubmissions: {
        name: "FactSubmissions",
        keyPath: "id"
    }
};

//Functions
const postData = function (url, data) {
    const requestSetup = {
        body: JSON.stringify(data),
        cache: 'no-cache',
        headers: { 'content-type': 'application/json' },
        method: 'POST'
    };

    return fetch(url, requestSetup).then(response => response.json());
};

const getQueryParameterByName = function (name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
};

const highlightPageIcon = function () {
    const urlPath = window.location.pathname.toLowerCase();
    const className = "selected-icon";

    if (urlPath.startsWith("/facts")) {
        $("#icon-home").addClass(className);
    } else if (urlPath.startsWith("/favorites")) {
        $("#icon-favorites").addClass(className);
    } else if (urlPath.startsWith("/bio")) {
        $("#icon-chuck").addClass(className);
    } else if (urlPath.startsWith("/contact")) {
        $("#icon-contact").addClass(className);
    }
};

const highlightNotificationsIcon = function () {
    notificationsIcon.css({ '-webkit-filter': 'grayscale(0)', 'filter': 'grayscale(0)' });
};

const greyOutNotificationsIcon = function () {
    notificationsIcon.css({ '-webkit-filter': 'grayscale(100%)', 'filter': 'grayscale(100%)' });
};

const loadIndexedDb = function () {
    const open = indexedDb.open(indexedDbName, indexedDbVersion);

    open.onsuccess = () => {
        const db = open.result;
        db.close();
    };

    open.onupgradeneeded = () => {
        const db = open.result;
        let isDbUpdated = true;
        isDbUpdated &= ensureDbStoreCreation(db, dbStores.userSettings.name, dbStores.userSettings.keyPath);
        isDbUpdated &= ensureDbStoreCreation(db, dbStores.facts.name, dbStores.facts.keyPath);
        isDbUpdated &= ensureDbStoreCreation(db, dbStores.mostRecentViewedFact.name, dbStores.mostRecentViewedFact.keyPath);
        isDbUpdated &= ensureDbStoreCreation(db, dbStores.factSubmissions.name, dbStores.factSubmissions.keyPath, true);

        isDbUpdated
            ? console.log(`Database updated to version '{${indexedDbVersion}}'`)
            : console.log(`Database loaded with version '{${indexedDbVersion}}', no schema changes applied`);
    };

    open.onerror = (error) => {
        console.error(error);
    };
};

const ensureDbStoreCreation = function (db, storeName, keyPath, autoincrement) {
    if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: keyPath, autoIncrement: autoincrement });
        return true;
    }

    return false;
};

const loadNotificationsIcon = function () {

    // Open (or create) the database
    const open = indexedDb.open(indexedDbName, indexedDbVersion);

    open.onsuccess = function () {
        // Start a new transaction
        const db = open.result;
        const tx = db.transaction(dbStores.userSettings.name, "readwrite");
        const store = tx.objectStore(dbStores.userSettings.name);
        const request = store.get("notifications");

        request.onsuccess = () => {
            if (Notification.permission !== "granted" || !request.result) {
                store.put({ name: "notifications", allowed: false });
                greyOutNotificationsIcon();
            } else {
                request.result.allowed
                    ? highlightNotificationsIcon()
                    : greyOutNotificationsIcon();
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

const toggleNotificationsIcon = function () {
    // Open (or create) the database
    const open = indexedDb.open(indexedDbName, indexedDbVersion);

    open.onsuccess = function () {
        // Start a new transaction
        const db = open.result;
        const tx = db.transaction("UserSettings", "readwrite");
        const store = tx.objectStore("UserSettings");
        const request = store.get("notifications");

        request.onsuccess = () => {
            const isNotificationsAllowed = !request.result.allowed;
            store.put({ name: "notifications", allowed: isNotificationsAllowed }).onsuccess = () => {
                isNotificationsAllowed
                    ? highlightNotificationsIcon()
                    : greyOutNotificationsIcon();
            };
        };

        request.onerror = (error) => {
            console.error(error);
        };

        tx.oncomplete = function () {
            db.close();
        };
    };
};

const setOfflineTheme = function() {
    $("html").addClass("offline");
    $("body").addClass("offline");
    $("#main-nav").addClass("offline");
    $("main").addClass("offline");
    $("#offline-icon").show();
}

const setOnlineTheme = function () {
    $("html").removeClass("offline");
    $("body").removeClass("offline");
    $("#main-nav").removeClass("offline");
    $("main").removeClass("offline");
    $("#offline-icon").hide();
}

$(document).ready(function () {

    if (!navigator.onLine) {
        setOfflineTheme();
    }

    window.addEventListener('online', setOnlineTheme);
    window.addEventListener('offline', setOfflineTheme);
        
    highlightPageIcon();
    loadIndexedDb();

    //Check if browser supports notifications
    if (!Notification) {
        notificationsIcon.hide();
        return;
    }

    //Highlight notifications button to indicate they are allowed
    loadNotificationsIcon();

    notificationsIcon.on("click", function () {
        if (Notification.permission !== "granted") {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    toggleNotificationsIcon();
                }
            });
        } else {
            toggleNotificationsIcon();
        }
    });
});