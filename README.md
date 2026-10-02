# Nord Consult website

Interactive study journey website built with Vite.

## Run locally

```sh
npm ci
cp .env.example .env
```

Set `VITE_LEAD_INBOX` in `.env` to the inbox that should receive enquiries, then run:

```sh
npm run dev
```

## Check and build

```sh
npm test
npm run build
```

The production files are written to `dist/`. The build needs `VITE_LEAD_INBOX` set so the contact forms can send enquiries. The first FormSubmit enquiry may trigger an activation email to that inbox; delivery starts after the activation link is opened.
