﻿const isLocalHost = self.location.origin.includes("localhost");
const chuckApiBaseUrl = isLocalHost ? "https://localhost:44312/api" : "http://chucknorris-api.azurewebsites.net/api";
const version = "v7.6";
const resourcesToCache = [
    //VIEWS
    "/",
    "/Facts",
    "/Favorites",
    "/Bio",
    "/Submissions",
    "/Offline",

    //CSS
    "/css/app.min.css",
    "/css/bio.min.css",
    "/css/facts.min.css",
    "/css/favorites.min.css",
    "/css/offline.min.css",
    "/css/submissions.min.css",

    //FONTS
    "fonts/raleway_thin-webfont.eot",
    "fonts/Tajawal-Regular.ttf",

    //JS
    "/js/app.min.js",
    "/js/bio.min.js",
    "/js/facts.min.js",
    "/js/favorites.min.js",
    "/js/submissions.min.js",
    "/vendor/js/jquery-3.3.1.min.js",

    //IMG
    "/images/chuck-norris-cartoon.png",
    "/images/chuck-norris-soldier.png",
    "/images/icon-arrow-next.png",
    "/images/icon-arrow-prev.png",
    "/images/icon-bell.png",
    "/images/icon-chuck.png",
    "/images/icon-contact.png",
    "/images/icon-favorites.png",
    "/images/icon-favorites-small.png",
    "/images/icon-home.png",
    "/images/icon-lightbulb.png",
    "/images/icon-offline.png",
    "/images/icon-reload.png",
    "/images/loader.gif",
    "/images/offline-dinosaur.gif",

    //MANIFEST
    "/android-chrome-192x192.png",
    "/android-chrome-512x512.png",
    "/apple-touch-icon.png",
    "/browserconfig.xml",
    "/favicon.ico",
    "/favicon-16x16.png",
    "/favicon-32x32.png",
    "/mstile-150x150.png",
    "/safari-pinned-tab.svg",
    "/site.manifest",

];

const addCachedResources = function (cache) {
    return cache.addAll(resourcesToCache);
};

const processInstallEvent = function (event) {
    console.log(`SW ${version} installed @ ${new Date().toLocaleTimeString()}`);
    self.skipWaiting();

    event.waitUntil(caches
        .open(version)
        .then(addCachedResources).catch(err => { console.log(err); })
    );
};

const deleteOldCaches = function (keys) {
    return Promise.all(keys.filter((key) => {
        return key !== version;
    }).map((key) => {
        return caches.delete(key);
    }));
};

const processActivateEvent = function (event) {
    console.log(`SW ${version} activated @ ${new Date().toLocaleTimeString()}`);

    event.waitUntil(caches
        .keys()
        .then(deleteOldCaches)
    );
};

const processFetchEvent = function (event) {
    event.respondWith(
        caches
            .match(event.request)
            .then((response) => {
                if (response) return response;

                if (!navigator.onLine) {
                    return caches.match(new Request("/Offline"));
                }

                return fetch(event.request).catch(err => { return err });
            }).catch(err => { return err })
    );
};

const processPushNotifications = function (event) {
    const payload = event.data.json();

    console.log("payload: ", payload);

    const options = {
        body: payload.newfact,
        icon: "/android-chrome-192x192.png",
        badge: "/android-chrome-192x192.png",
        data: payload,
        actions: [
            { action: "View", title: "Check it out", icon: "/android-chrome-192x192.png" }
        ]
    };

    event.waitUntil(self.registration.showNotification("New Chuck Fact", options));
};

const processNotificationClick = function (event) {
    event.notification.close();
    console.log("notif event: ", event);
    const factId = event.notification.data.factid;
    event.waitUntil(clients.openWindow(`${event.target.location.origin}/facts?id=${factId}`));
};

const openDatabase = function (name, version) {
    return new Promise((resolve, reject) => {
        const idb = indexedDB.open(name, version);
        idb.onsuccess = resolve;
        idb.onerror = reject;
    });
};

const postData = function (url, data) {
    const requestSetup = {
        body: JSON.stringify(data),
        cache: 'no-cache',
        headers: { 'content-type': 'application/json' },
        method: 'POST'
    };
    return fetch(url, requestSetup);
};

const processSyncEvents = function (event) {
    if (event.tag === "sync-factSubmissions") {
        event.waitUntil(
            openDatabase("ChuckNorris", 3).then(event => {
                const db = event.target.result;
                const store = db.transaction("FactSubmissions", "readwrite").objectStore("FactSubmissions");
                const cursor = store.openCursor();
                const facts = [];

                cursor.onsuccess = (ev) => {
                    const cursor = ev.target.result;
                    if (cursor) {
                        if (!cursor.value.synched) {
                            const fact = { description: cursor.value.description };
                            facts.push(fact);

                            const synchedFact = cursor.value;
                            synchedFact.synched = true;
                            cursor.update(synchedFact);
                        }

                        cursor.continue();
                    } else {
                        for (let fact of facts) {
                            postData(`${chuckApiBaseUrl}/facts`, fact.description);
                        }
                    }
                };
            })
        );
    }
};

self.addEventListener("install", processInstallEvent);
self.addEventListener("activate", processActivateEvent);
self.addEventListener("fetch", processFetchEvent);
self.addEventListener("push", processPushNotifications);
self.addEventListener("notificationclick", processNotificationClick);
self.addEventListener("sync", processSyncEvents);