# Oichel menu integrations

Oichel is discovery-only. No checkout or ordering is performed.

## Square
Set `SQUARE_ACCESS_TOKEN` as a **server-side** Vercel environment variable, using a merchant-authorized OAuth token with catalog read scope. The sample endpoint `/api/menu?provider=square&locationId=LOCATION_ID` reads catalog items and price variations. Production use should store per-merchant OAuth tokens securely, paginate catalog results, filter availability correctly, and map catalog images. Do not share one merchant's token across other merchants.

## Toast
Set `TOAST_CLIENT_ID` and `TOAST_CLIENT_SECRET` after obtaining approved Toast integration access. The Toast route deliberately returns a configuration error until the partner-specific authentication and menu endpoint have been implemented. No live Toast data is available yet.

## DoorDash
DoorDash Marketplace access is partner-restricted; it is not a general public restaurant menu API. No DoorDash credentials or unsupported scraping are used. Integrate only after approval.

## Directory mapping
The frontend must map each restaurant to its authorized provider and location/restaurant ID. Until then, restaurant cards continue showing their existing historical samples and external links. Never invent prices or photos.

## Security
Keep API keys in Vercel server-side environment variables. Never place tokens in index.html or commit secrets to GitHub.
