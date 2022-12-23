# Youtube Credentials
## Getting credentials
1. Create a google acount
2. Login
3. Go to here https://console.cloud.google.com/apis/credentials
4. Create OAuth Client ID
5. Set Authorized redirect URI https://developers.google.com/oauthplayground
6. Click save
7. Go to here https://developers.google.com/oauthplayground
8. Open configuration panel at the right top
9. Check the "Use your own OAuth credentials" box
10. Fill the Client ID and the secret area with credentials you got from google console
11. From the left panel select all the YouTube Data API v3 scopes
- https://www.googleapis.com/auth/youtube
- https://www.googleapis.com/auth/youtube.force-ssl
- https://www.googleapis.com/auth/youtube.readonly
- https://www.googleapis.com/auth/youtubepartner-channel-audit
12. Click Authorize APIs
13. Copy the Refresh token you got
14. Set the environment variables google values (ClientId,Secret and Refresh Token)


## Important Note: Youtube Channel Id is not Channel Name!!!
### Get the channel id from here https://commentpicker.com/youtube-channel-id.php
