const CACHE_NAME = 'ortho-kutir-sp-v3.7';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// ইনস্টল এবং ক্যাশ সেভ করা
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// পুরনো ক্যাশ ডিলিট করে নতুন ক্যাশ আপডেট করা
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// ফেচ এবং ক্যাশ ফার্স্ট স্ট্র্যাটেজি (ক্যাশ আপডেট সুবিধা সহ)
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cachedResponse => {
      const fetchPromise = fetch(e.request).then(networkResponse => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(e.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => cachedResponse);
      
      return cachedResponse || fetchPromise;
    })
  );
});
