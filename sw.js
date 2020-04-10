const staticCacheName = "site-static"; //bowser-cathc sotage --name
const dynamicCacheName = "site-dynamic-v1";
const assets = [
  //TODO: all staic file that is save to offline that is
  "/",
  "/index.html",
  "/js/app.js",
  "/js/ui.js",
  "/js/materialize.min.js",
  "/css/styles.css",
  "/css/materialize.min.css",
  "/img/dish.png",
  "https://fonts.googleapis.com/icon?family=Material+Icons",
  "https://fonts.gstatic.com/s/materialicons/v47/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2",
  "/pages/fallback.html"
];

//!-->LIMIT FOR CHACH-STOGE {{|}} HOW:==> OLD DELETE AND NEW ADD
const limitCacheSize = (name, size) => {
  caches.open(name).then(cache => {
    cache.keys().then(keys => {
      if (keys.length > size) {
        cache.delete(keys[0]).then(limitCacheSize(name, size));
      }
    });
  });
};

//! install serive worker
self.addEventListener("install", evt => {
  console.log("service worker installed");

  //TODO:  offline system--which file need to save it
  evt.waitUntil(
    caches.open(staticCacheName).then(cache => {
      console.log("caching shell assets");
      cache.addAll(assets);
    })
  );
});

//! activate event
self.addEventListener("activate", evt => {
  //console.log('service worker activated');

  //TODO: statick file chage==> old chache-staong offline save that is delete
  evt.waitUntil(
    caches.keys().then(keys => {
      //console.log(keys);
      return Promise.all(
        keys
          .filter(key => key !== staticCacheName && key !== dynamicCacheName)
          .map(key => caches.delete(key))
      );
    })
  );
});

//! fetch events
self.addEventListener("fetch", evt => {
  //console.log('fetch event', evt);

  if (evt.request.url.indexOf("firestore.googleapis.com") === -1) { //! offline use === firebase with not effect=== to chech-store date //TODO: firebase not use not apply it
    //TODO: selected offlie file==go-to==chache-storage  //and offlie supprt done..BOOMMMM
    evt.respondWith(
      caches
        .match(evt.request)
        .then(cacheRes => {
          return (
            cacheRes ||
            fetch(evt.request).then(fetchRes => {
              //TODO: contac page/about page===> offlie save it==dynamic offlice supprot==>anoter page save it as well
              return caches.open(dynamicCacheName).then(cache => {
                cache.put(evt.request.url, fetchRes.clone());
                //!limit== check cached items size {{|}} 15 MEAN  15 item save chach-stoge {{you can chage it if you want--10/20/26/etc..}}
                limitCacheSize(dynamicCacheName, 15);
                return fetchRes;
              });
            })
          );
        })
        .catch(() => {
          //TODO: somePAGE not save to cache-storge //--see this fallback page;
          if (evt.request.url.indexOf(".html") > -1) {
            return caches.match("/pages/fallback.html");
          }
        })
    );
  }
});
