(function(){
  function postFeedback({ apiKey, rating, comment, path, metadata }) {
    var meta = Object.assign({}, metadata || {}, {
      path: path || (typeof location !== 'undefined' ? location.pathname : null),
      user_agent: (typeof navigator !== 'undefined' ? navigator.userAgent : null)
    });
    return fetch('/api/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Project-Key': apiKey
      },
      body: JSON.stringify({
        rating: rating ?? null,
        comment: comment ?? null,
        metadata: meta
      }),
      credentials: 'omit',
      mode: 'cors'
    }).then(r => r.json());
  }
  window.Vamoot = { postFeedback };
})();
