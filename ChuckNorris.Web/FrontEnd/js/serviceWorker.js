const version = "v16";
const resourcesToCache = [
    //VIEWS
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

    //FAVICONS
    "/favicon-16x16.png",
    "/favicon-32x32.png",
    "/favicon-96x96.png"
];

const addCachedResources = function (cache) {
    return cache.addAll(resourcesToCache);
};

const processInstallEvent = function (event) {
    console.log(`SW v${version} installed @ ${new Date().toLocaleTimeString()}`);
    self.skipWaiting();

    event.waitUntil(caches
        .open(version)
        .then(addCachedResources)
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

                return fetch(event.request);
            })
    );
};

// ReSharper disable once Html.EventNotResolved
self.addEventListener("install", processInstallEvent);
self.addEventListener("activate", processActivateEvent);
// ReSharper disable once Html.EventNotResolved
self.addEventListener("fetch", processFetchEvent);