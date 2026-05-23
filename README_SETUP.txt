CLOUDFLARE RESUME PORTFOLIO - SETUP

WHAT THIS PACKAGE CONTAINS
- index.html: the website page
- styles.css: design styling
- script.js: visitor tracking/map rendering code
- assets/: included original SVG imagery for the hero image, video poster, and USA map
- media/: put your resume, PDF samples, DOCX samples, MP4, MP3 here
- functions/api/: optional Cloudflare Pages Functions for visitor counting and state/region aggregation

STEP 1 - REPLACE TEXT
Open index.html in Notepad.
Replace:
- Your Name
- Cybersecurity Engineer / headline text
- professional summary
- email address
- LinkedIn URL

STEP 2 - ADD YOUR FILES
Put your real media files in the media folder.
Use these exact names to avoid editing links:
- resume.pdf
- resume.docx
- detection-engineering-sample.pdf
- splunk-architecture-sample.pdf
- runbook-sample.docx
- portfolio-demo.mp4
- audio-overview.mp3

If you do not have all of those files yet, you can still upload the site, but links to missing files will not work until you add them.

STEP 3 - UPLOAD TO CLOUDFLARE PAGES
In Cloudflare:
Workers & Pages > your Pages project > Deployments > Create new deployment.
Upload the contents of this folder.

STEP 4 - ENABLE LIVE COUNTS AND MAP PINS
The page can display analytics only after you add a Cloudflare KV namespace binding.

In Cloudflare:
1. Go to Storage & Databases > KV.
2. Create a KV namespace. Example name: portfolio_visitors.
3. Go back to Workers & Pages > your Pages project.
4. Go to Settings > Bindings.
5. Add a KV namespace binding.
6. Variable name MUST be: VISITOR_KV
7. Select the KV namespace you created.
8. Save.
9. Redeploy the site.

STEP 5 - TEST
Open your .pages.dev URL.
Refresh once or twice.
The visitor count should increase.
If Cloudflare can determine the visitor region, the state list and map pins will populate.

PRIVACY NOTE
This package does not display raw IP addresses. It aggregates by state/region/country using Cloudflare request metadata.
If you collect or display more detailed visitor data, add a privacy notice and confirm that it is acceptable for your intended audience.

LIMITATION
Cloudflare KV is eventually consistent and is not an exact analytics database. It is good enough for a low-traffic portfolio counter. For precise enterprise-grade analytics, use Cloudflare Web Analytics, Google Analytics, or a dedicated logging pipeline.
