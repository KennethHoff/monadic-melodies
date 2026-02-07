# Requrements

## React frontend requirements
- [x] Be modern and exiting. With animations.
- [x] Should show the current vide and curent song reccomendation.
- [x] When a new vibe is set in the backend cache, the user should get a prompt to fetch the latest vibe from the backend.
- [x] It should be clear to the end user if the vibe is very old, promting them to write something in the channel to update the vibe
- [x] Use tailwind and daisyUI

## Backend requirements
- [x] Cache the current vibe and song
- [x] Handle the frontend agressively polling for the latest date
- [x] Handle recieving the latest vibe in a post endpoint
- [x] Be able to trigger a webhook that posts back to the vibe if there is no vibe set.
- [x] The cache should never expire
