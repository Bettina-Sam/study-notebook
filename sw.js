const CACHE='study-notebook-v8';
const CORE=['./','./index.html','./css/common.css','./css/home.css','./assets/icons/favicon.svg'];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)));
  self.skipWaiting();
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET') return;
  let url;
  try{url=new URL(req.url);}catch{return;}
  if(url.protocol!=='http:' && url.protocol!=='https:') return;

  // Navigations (HTML pages): network-first, so visitors always get the latest
  // content when online. Falls back to the cache (offline) or the cached
  // homepage as a last resort.
  if(req.mode==='navigate'){
    event.respondWith(
      fetch(req).then(res=>{
        if(res && res.ok){
          const copy=res.clone();
          caches.open(CACHE).then(cache=>cache.put(req,copy)).catch(()=>{});
        }
        return res;
      }).catch(()=>caches.match(req).then(hit=>hit||caches.match('./index.html')))
    );
    return;
  }

  // Everything else (CSS/JS/images/fonts): stale-while-revalidate — serve the
  // cached copy instantly if there is one, but always refetch in the
  // background and update the cache so the *next* load is current.
  event.respondWith(
    caches.match(req).then(hit=>{
      const network=fetch(req).then(res=>{
        if(res && res.ok && res.type!=='opaque'){
          const copy=res.clone();
          caches.open(CACHE).then(cache=>cache.put(req,copy)).catch(()=>{});
        }
        return res;
      }).catch(()=>hit || Response.error());
      return hit || network;
    })
  );
});
