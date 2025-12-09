# Configuração de Produção - Fut7Pro

## Variáveis de Ambiente Necessárias no Vercel

Configure as seguintes variáveis no painel do Vercel (Settings → Environment Variables):

### NextAuth Configuration

```
NEXTAUTH_URL=https://app.fut7pro.com.br
NEXTAUTH_SECRET=your_nextauth_secret_here_64_chars_minimum
```

### Revalidate (Vercel)

```
PUBLIC_REVALIDATE_TOKEN=defina_um_token_forte_aqui
APP_URL=https://app.fut7pro.com.br
```

### Google OAuth

```
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

### API Configuration

```
NEXT_PUBLIC_APP_URL=https://app.fut7pro.com.br
NEXT_PUBLIC_API_URL=https://api.fut7pro.com.br
BACKEND_URL=https://api.fut7pro.com.br
API_URL=https://api.fut7pro.com.br
```

### Environment

```
NODE_ENV=production
```

### Opcional - Next.js Telemetry

```
NEXT_TELEMETRY_DISABLED=1
```

### Opcional - Sentry

```
SENTRY_DSN=your_sentry_dsn_here
```

## Google Cloud Console - URIs de Callback

Adicione os seguintes URIs no Google Cloud Console:

### Authorized JavaScript origins:

- `https://app.fut7pro.com.br`
- `https://fut7pro-web.vercel.app`

### Redirect URIs:

- `https://app.fut7pro.com.br/api/auth/callback/google`
- `https://fut7pro-web.vercel.app/api/auth/callback/google`

## Backend CORS

Certifique-se de que o backend (Railway) tenha CORS configurado para:

- `https://app.fut7pro.com.br`
- `https://fut7pro-web.vercel.app`
- `https://*.vercel.app` (para previews)
