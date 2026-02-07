# Requrements

## React frontend requirements
- Be modern and exiting. With animations.
- Should show the current vide and curent song reccomendation.
- When a new vibe is set in the backend cache, the user should get a prompt to fetch the latest vibe from the backend.
- It should be clear to the end user if the vibe is very old, promting them to write something in the channel to update the vibe

## Backend requirements
- Cache the current vibe and song
- Handle the frontend agressively polling for the latest date
- Handle recieving the latest vibe in a post endpoint
- Be able to trigger a webhook that posts back to the vibe if there is no vibe set.
- The cache should never expire
