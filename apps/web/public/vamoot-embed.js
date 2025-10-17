(function(){
  function postFeedback({ apiKey, rating, comment, path }) {
    return fetch('/api/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Project-Key': apiKey
      },
      body: JSON.stringify({
        rating: rating ?? null,
        comment: comment ?? null,
        path: path || (typeof location !== 'undefined' ? location.pathname : null),
      }),
      credentials: 'omit', // ensure no cookies cross sites
      mode: 'cors'
    }).then(r => r.json())
  }
  // expose global
  window.Vamoot = { postFeedback }
})();
