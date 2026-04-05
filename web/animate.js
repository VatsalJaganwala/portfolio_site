document.addEventListener("DOMContentLoaded", function () {
  const observerOptions = {
    root: null,
    rootMargin: "0px",
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  function observeElements() {
    const hiddenElements = document.querySelectorAll(".section-animate");
    hiddenElements.forEach(el => observer.observe(el));
  }

  // Initial observation
  observeElements();

  // If Jaspr updates the DOM (e.g. hydration or routing), observe new elements
  const mutationObserver = new MutationObserver((mutations) => {
    let added = false;
    for (let mutation of mutations) {
      if (mutation.addedNodes.length > 0) {
        added = true;
        break;
      }
    }
    if (added) {
      observeElements();
    }
  });

  mutationObserver.observe(document.body, { childList: true, subtree: true });
});
