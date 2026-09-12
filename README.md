# Aura Health

A bilingual (English and Tamil) health-education site deployed on Netlify. Aura gives plain-language educational context and low-risk next steps; it is not a diagnosis or emergency service.

## What is included

- Gemini runs only in the server-side Netlify Function. The API key is never sent to a browser.
- A privacy confirmation is required before an AI request.
- Basic bot/spend protection: Netlify Function rate limit (10 requests/minute per IP and domain), request timing check, form honeypots, and crawler directives.
- Emergency wording is screened before the AI request. This is a safety aid, not a complete emergency detector.
- Curated NHS/WHO reading links, care guidance, optional non-identifying symptom context, “what to monitor,” clinician discussion prompts, English/Tamil interface, optional voice input/read-aloud, copy/print/private text export, feedback, contact form, privacy notice, and terms.

## Deploy on Netlify

1. Push these files to GitHub.
2. In Netlify: Project configuration → Environment variables, add GEMINI_API_KEY and set its value to your Gemini API key.
3. Enable the Functions scope (Builds is also fine).
4. Go to Deploys → Trigger deploy → Deploy site.
5. Test an ordinary question and an emergency phrase such as “I have chest pressure and cannot breathe.” The latter must show the emergency response without calling Gemini.
6. Check Forms in Netlify after the first deployment to confirm aura-feedback and aura-contact appear.

## Before a public launch

- Buy or use an owned domain and connect it in Project configuration → Domain management.
- Set the final owner email/contact details in contact.html.
- Ask a qualified clinician to review all health content and emergency wording.
- Ask a qualified privacy/legal professional to review privacy.html and terms.html for your country and intended users.
- If abuse becomes a problem, add a managed CAPTCHA provider such as Cloudflare Turnstile. It requires creating an account and adding its site/secret keys; do not place a secret key in index.html.

## Local preview

The static pages can be previewed with a local web server. To exercise the AI function locally, use the Netlify CLI and a local .env file; never commit that file.
