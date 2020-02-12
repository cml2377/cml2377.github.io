console.log("Hello from your service worker!");

const FILES_TO_CACHE = [
    "/",
    "/index.html",
    "/assets/css/fontawesome-all.min.css",
    "/assets/css/main.css",
    "/assets/css/noscript.css",
    "/assets/js/breakpoints.min.js",
    "/assets/js/browser.min.js",
    "/assets/js/jquery.min.js",
    "/assets/js/jquery.scrollex.min.js",
    "/assets/js/jquery.scrolly.min.js",
    "/assets/js/main.js",
    "/assets/js/util.js",
    "/assets/images/alice-triquet-HeEJU3nrg_0-unsplash.jpg",
    "/assets/images/Crystal&Anthony.jpg",
    "/assets/images/Dev-Profile-Generator.png",
    "/manifest.webmanifest",
    "/assets/images/favicon.ico",
    "/assets/images/employee-tracker.gif",
    "/assets/images/note-taker.gif",
    "/assets/images/screencapture-cml2377-github-io-2020-01-10-21_31_02.png",
    "/assets/images/screencapture-cml2377-github-io-weather-dashboard-2020-01-10-21_06_26.png",
    "/assets/images/screencapture-kimiinglet-github-io-meanLeanFreakGoat-2020-01-10-20_43_29.png",
    "/assets/images/screencapture-the-pack-is-back-herokuapp-members-2020-02-11-14_00_14.png",
    "/assets/images/screenshot-Capitals-Quiz.png",
    "/assets/images/screenshot-Day-Planner.png",
    "/assets/images/screenshot-Password-Generator.png",
    "/assets/images/sequelize-hw.png",
    "/assets/images/team-generator-screenshot.png",
];

const CACHE_NAME = "static-cache-v2";
const DATA_CACHE_NAME = "data-cache-v1";

// install
self.addEventListener("install", function (evt) {
    evt.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log("Your files were pre-cached successfully!");
            return cache.addAll(FILES_TO_CACHE);
        })
    );

    self.skipWaiting();
});

// activate service worker
self.addEventListener("activate", function (evt) {
    evt.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(
                keyList.map(key => {
                    if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
                        console.log("Removing old cache data", key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );

    self.clients.claim();
});

// fetch
self.addEventListener("fetch", function (evt) {
    if (evt.request.url.includes("/api/")) {
        evt.respondWith(
            caches.open(DATA_CACHE_NAME).then(cache => {
                return fetch(evt.request)
                    .then(response => {
                        // If the response was good, clone it and store it in the cache.
                        if (response.status === 200) {
                            cache.put(evt.request.url, response.clone());
                        }

                        return response;
                    })
                    .catch(err => {
                        // Network request failed, try to get it from the cache.
                        return cache.match(evt.request);

                    });
            }).catch(err => {
                console.log(err)
            })
        );

        return;
    }

    evt.respondWith(
        caches.open(CACHE_NAME).then(cache => {
            return cache.match(evt.request).then(response => {
                return response || fetch(evt.request);
            });
        })
    );
});
