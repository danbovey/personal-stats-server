# Dan Bovey Personal Site Stats Server

> 🎰 Serverless functions to display metrics about my life

Powered by Cloudflare Workers.

There is an issue with the Spotify playlists feature: Workers have a connection limit of 50 and I neeed to load the follower count for each of my playlists which is causing the function to abort.

To run a worker in development against the production`STATSDB`, turn off local mode using <kbd>[l]</kbd>.

## Refresh Fitbit Tokens

1. Go to https://www.fitbit.com/oauth2/authorize?client_id=<FITBIT_CLIENT_ID>&response_type=code&scope=activity&redirect_uri=https://localhost:8080/api/auth/fitbit&expires_in=31536000
2. Use the token in the /oauth/token endpoint.
3. Copy the response into CloudFlare Workers KV.

```
curl --request POST \
  --url https://api.fitbit.com/oauth2/token \
  --header 'Authorization: Basic <BASE64ENCODE(FITBIT_CLIENT_ID:FITBIT_SECRET_ID)>' \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  --header 'User-Agent: insomnia/8.4.5' \
  --data code=<OAUTH_CODE> \
  --data grant_type=authorization_code \
  --data client_id=<FITBIT_CLIENT_ID> \
  --data redirect_uri=https://localhost:8080/api/auth/fitbit \
  --data expires_in=31536000
```

## Refresh Strava Tokens

1. Go to https://www.strava.com/settings/api
2. Copy the refresh token into CloudFlare Workers KV.
