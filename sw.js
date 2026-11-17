// MF Gestão: avisos no celular. O aviso chega vazio; o aparelho busca o texto no servidor com o endereço da própria inscrição.
const API='https://mf-gestao-realtime.andrenmreal.workers.dev';
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
async function unread(d){const c=await caches.open('mf-badge');const r=await c.match('n');let n=r?(+(await r.text())||0):0;n=d===null?0:n+d;await c.put('n',new Response(String(n)));return n}
self.addEventListener('push',e=>e.waitUntil((async()=>{
  let title='MF Gestão',body='Você tem um aviso novo.',url='#dashboard',tag='mf';
  try{const s=await self.registration.pushManager.getSubscription();if(s){const r=await fetch(API+'/api/push/msg',{method:'POST',headers:{'content-type':'text/plain'},body:JSON.stringify({endpoint:s.endpoint}),cache:'no-store'});const j=r.ok?(await r.json()).data:null;if(j&&j.title){title=j.title;body=j.body||'';url=j.url||url;tag='m'+(j.ts||'')}}}catch(err){}
  try{const n=await unread(1);if(self.navigator.setAppBadge)await self.navigator.setAppBadge(n)}catch(err){}
  try{const cl=await self.clients.matchAll({type:'window',includeUncontrolled:true});for(const c of cl)c.postMessage({type:'mf-push',title,body,url})}catch(err){}
  await self.registration.showNotification(title,{body,icon:'icon-192.png',badge:'icon-192.png',tag,renotify:true,data:{url}});
})()));
self.addEventListener('notificationclick',e=>{e.notification.close();const u=(e.notification.data||{}).url||'';e.waitUntil((async()=>{
  const l=await self.clients.matchAll({type:'window',includeUncontrolled:true});
  for(const c of l){if('focus' in c){await c.focus();try{c.postMessage({type:'mf-open',url:u})}catch(err){}return}}
  return self.clients.openWindow(self.registration.scope+u);
})())});
self.addEventListener('message',e=>{if(e.data&&e.data.type==='mf-badge-clear')e.waitUntil((async()=>{await unread(null);try{if(self.navigator.clearAppBadge)await self.navigator.clearAppBadge()}catch(err){}})())});
