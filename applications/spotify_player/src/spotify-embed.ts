window.onSpotifyIframeApiReady = (IFrameAPI) => {
  const element = document.querySelector('#embed-iframe');
  const options = {
      uri: 'spotify:track:5NEKjqTQPKiqOiOG8YxLdS'
    };
  const callback = (EmbedController) => {};
  IFrameAPI.createController(element, options, callback);
};
