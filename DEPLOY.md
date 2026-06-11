# Deploy na VPS (Ubuntu + Node.js 22 + Bun + PM2 + Nginx)

Cilj: pokrenuti aplikaciju kao Node.js server (TanStack Start SSR) iza Nginx reverse proxy-a, s Supabase backendom preko environment varijabli.

Domena: **parkandfly.ba**

---

## 1. Priprema servera (jednokratno)

SSH na server kao `root` ili sudo korisnik.

### 1.1. Sistem update + osnovni alati
```bash
apt update && apt upgrade -y
apt install -y curl git ufw nginx
```

### 1.2. Node.js 22 (NodeSource)
```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs
node -v   # v22.x
```

### 1.3. Bun
```bash
curl -fsSL https://bun.sh/install | bash
# dodaj u PATH (već radi za trenutnog korisnika nakon re-login):
echo 'export BUN_INSTALL="$HOME/.bun"' >> ~/.bashrc
echo 'export PATH="$BUN_INSTALL/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
bun -v
```

### 1.4. PM2 (globalno)
```bash
npm install -g pm2
pm2 -v
```

### 1.5. Firewall
```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
```

---

## 2. Klonaj projekat

Predloženo: `/var/www/parkandfly`

```bash
mkdir -p /var/www && cd /var/www
git clone <GIT_REPO_URL> parkandfly
cd parkandfly
```

---

## 3. Environment varijable

Kopiraj template i popuni stvarne vrijednosti:

```bash
cp .env.example .env
nano .env
```

Bitno:
- `VITE_*` ulaze u **build** (frontend bundle).
- `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY` čita **Node runtime** (server functions, admin operacije).
- `SUPABASE_SERVICE_ROLE_KEY` je tajna — nikad ne smije završiti u `VITE_` varijabli.

---

## 4. Install + build (Node preset)

```bash
bun install
bun run build:node
```

Output ide u `.output/server/index.mjs` (Node Nitro server) + `.output/public/` (statički assets, servira ih sam Node).

> Kontrolna provjera: `ls .output/server/index.mjs && node -e "console.log('ok')"`

---

## 5. PM2 — pokretanje servisa

Iz root foldera projekta:

```bash
mkdir -p logs
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup systemd -u $USER --hp $HOME   # pokreni komandu koju ispiše
```

Korisne komande:
```bash
pm2 status
pm2 logs parkandfly
pm2 restart parkandfly
pm2 stop parkandfly
```

Server sluša na `127.0.0.1:3000` (vidi `ecosystem.config.cjs`).

---

## 6. Nginx reverse proxy

Kreiraj `/etc/nginx/sites-available/parkandfly.ba`:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name parkandfly.ba www.parkandfly.ba;

    # Certbot će ovo proširiti na HTTPS.

    client_max_body_size 10M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade           $http_upgrade;
        proxy_set_header Connection        "upgrade";
        proxy_read_timeout 60s;
    }
}
```

Aktiviraj:
```bash
ln -s /etc/nginx/sites-available/parkandfly.ba /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

### 6.1. HTTPS (Let's Encrypt)
```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d parkandfly.ba -d www.parkandfly.ba
```

Auto-renewal je već postavljen kroz systemd timer (`systemctl status certbot.timer`).

---

## 7. DNS

Na registratoru postavi A record:
- `parkandfly.ba` → IP servera
- `www.parkandfly.ba` → IP servera (ili CNAME na `parkandfly.ba`)

Sačekaj propagaciju prije Certbot koraka.

---

## 8. Update workflow (svaki put kad pushuješ na git)

Iz `/var/www/parkandfly`:

```bash
git pull
bun install
bun run build:node
pm2 restart parkandfly
```

Frontend i Supabase server functions su u istom Node procesu — `pm2 restart` osvježi sve.

---

## 9. Supabase u produkciji

Sve radi out-of-the-box ako su env varijable iz koraka 3 popunjene:
- **Admin dashboard** (`/admin/*`) — TanStack `createServerFn` poziva čitaju `SUPABASE_URL` + `SUPABASE_PUBLISHABLE_KEY` na serveru.
- **Rezervacije / cijene / postavke** — kombinacija RLS preko user tokena i admin operacija kroz `SUPABASE_SERVICE_ROLE_KEY`.
- **Auth** — browser klijent čita `VITE_SUPABASE_*` iz builda, session se čuva u `localStorage`.

Ako se admin panel ne učitava ili API vrati 500, prvo provjeri:
```bash
pm2 logs parkandfly --lines 100
```
Tipična greška: `Missing Supabase environment variable(s)` → `.env` nije popunjen ili PM2 nije restartovan nakon izmjene.

---

## 10. Troubleshooting

| Problem | Rješenje |
|---|---|
| 502 Bad Gateway | `pm2 status` — proces je možda pao. `pm2 logs parkandfly`. |
| Promjene u `.env` ne vrijede | `pm2 restart parkandfly --update-env` |
| Port 3000 zauzet | Promijeni `PORT` u `ecosystem.config.cjs` i u Nginx `proxy_pass`. |
| Build greška "out of memory" | `NODE_OPTIONS=--max-old-space-size=2048 bun run build:node` |
