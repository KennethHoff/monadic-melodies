# Requrements

# Tasks
- [x] Triggering webhooks from this app is a legacy concept that should be removed completely. All data flow is triggered from Zapier.
- [x] If there is no vibe set, the frontend should prompt te user to post a message to trigger the data flow.

## React frontend requirements
- [x] Be modern and exiting. With animations.
- [x] Should show the current vide and curent song reccomendation.
- [x] When a new vibe is set in the backend cache, the user should get a prompt to fetch the latest vibe from the backend.
- [x] It should be clear to the end user if the vibe is very old, promting them to write something in the channel to update the vibe
- [x] Use tailwind and daisyUI
- [x] The frontend should show a list of previous vibes
- [x] The styling libraries should be tailwind and daisyUi, preferably installed and not loaded trough a cdn.
- [x] The UI should be inspired byr retrowave hacker vibes. This app is for a hackathon and the visuals should reflect that

## Backend requirements
- [x] Cache the current vibe and song
- [x] Handle the frontend agressively polling for the latest date
- [x] Handle recieving the latest vibe in a post endpoint
- [x] Be able to trigger a webhook that posts back to the vibe if there is no vibe set.
- [x] The cache should never expire
- [x] The backend should not call the webhook to update the local state unless there is no vibe or song set. This is the responibility of Zapier, who posts to our app.
- [x] The endpoint that recieves the new vibe as well as the song and artist to use for spotify search is /hooks/spotify/set-track
