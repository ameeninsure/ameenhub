// Service Worker for Push Notifications
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(clients.claim());
});

// Listen for push events
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);

  let data = {};
  
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = {
      title: 'Notification',
      body: event.data ? event.data.text() : 'You have a new notification',
    };
  }

  const title = data.title || 'Ameen Hub';
  const options = {
    body: data.body || 'You have a new notification',
    icon: data.icon || '/icon-192x192.png',
    badge: data.badge || '/badge-72x72.png',
    tag: data.tag || 'notification',
    data: data.data || {},
    requireInteraction: false,
    vibrate: [200, 100, 200],
  };

  // Notify all open clients to refresh notifications
  event.waitUntil(
    Promise.all([
      self.registration.showNotification(title, options),
      // Broadcast to all clients to refresh their notification list
      self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'NEW_NOTIFICATION',
            title: title,
            body: options.body,
            data: data
          });
        });
      })
    ])
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/panel';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window open
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      
      // If not, open a new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event);
});
