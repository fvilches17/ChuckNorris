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

const notificationsIcon = $("#notification-icon");

const highlightNotificationsIcon = function() {
    notificationsIcon.css({ '-webkit-filter': 'grayscale(0)', 'filter': 'grayscale(0)' });
};

const greyOutNotificationsIcon = function() {
    notificationsIcon.css({ '-webkit-filter': 'grayscale(100%)', 'filter': 'grayscale(100%)' });
};

const indexedDb = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;
const indexedDbName = "ChuckNorris";
const indexedDbVersion = 1;

const loadNotificationsIcon = function () {

    // Open (or create) the database
    const open = indexedDb.open(indexedDbName, indexedDbVersion);

    // Create the schema
    open.onupgradeneeded = function () {
        const db = open.result;
        db.createObjectStore("UserSettings", { keyPath: "name" });
    };

    open.onsuccess = function () {
        // Start a new transaction
        const db = open.result;
        const tx = db.transaction("UserSettings", "readwrite");
        const store = tx.objectStore("UserSettings");
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

    // Create the schema
    open.onupgradeneeded = function () {
        const db = open.result;
        db.createObjectStore("UserSettings", { keyPath: "name" });
    };

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

    open.onerror = function (error) {
        console.error(error);
    };
};

$(document).ready(function () {
    highlightPageIcon();

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