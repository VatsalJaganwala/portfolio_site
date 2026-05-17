/**
 * qr.js — WhatsApp QR code renderer using qr-code-styling.
 *
 * Called after Jaspr hydrates the DOM. Finds the #wa-qr-canvas element,
 * reads the WhatsApp URL from its data-wa-url attribute, and renders a
 * styled SVG QR code with the WhatsApp logo embedded in the centre.
 *
 * Designed to be idempotent: safe to call multiple times (e.g. after
 * Jaspr re-renders). Clears the container before re-rendering.
 */

(function () {
  "use strict";

  /** Render (or re-render) the QR code into #wa-qr-canvas. */
  function renderWaQr() {
    const container = document.getElementById("wa-qr-canvas");
    if (!container) return; // desktop card not in DOM (mobile view) — skip

    const waUrl = container.getAttribute("data-wa-url");
    if (!waUrl) return;

    // Guard: QRCodeStyling must be loaded before we try to use it.
    if (typeof QRCodeStyling === "undefined") return;

    // Clear any previous render to avoid duplicates on re-hydration.
    container.innerHTML = "";

    const qr = new QRCodeStyling({
      width: 120,
      height: 120,
      type: "svg",
      data: waUrl,

      // ── Dot style ──────────────────────────────────────────────────────
      dotsOptions: {
        color: "#f0f0f0",   // --text-primary from the site's design system
        type: "square",
      },

      // ── Corner squares ─────────────────────────────────────────────────
      cornersSquareOptions: {
        color: "#f0f0f0",   // --accent-green
        type: "square",
      },

      // ── Corner dots ────────────────────────────────────────────────────
      cornersDotOptions: {
        color: "#f0f0f0",   // --accent-green
        type: "dot",
      },

      // ── Background ─────────────────────────────────────────────────────
      backgroundOptions: {
        color: "#1a1a1a",   // --bg-elevated
      },

      // ── Centre image — WhatsApp logo ───────────────────────────────────
      image: "/assets/whatsapp.svg",
      imageOptions: {
        crossOrigin: "anonymous",
        margin: 4,          // quiet zone around the logo inside the QR
        imageSize: 0.28,    // 28 % of QR width — keeps enough modules readable
        hideBackgroundDots: true,
      },

      // ── QR error correction (H = 30 % — needed for centre logo) ────────
      qrOptions: {
        errorCorrectionLevel: "H",
      },
    });

    qr.append(container);
  }

  /**
   * Bootstrap: run once the DOM is ready, then watch for Jaspr hydration
   * (Jaspr may replace DOM nodes after the initial static render).
   */
  function bootstrap() {
    renderWaQr();

    // Re-run if Jaspr hydration adds/replaces the canvas node.
    const mo = new MutationObserver(function (mutations) {
      for (const m of mutations) {
        for (const node of m.addedNodes) {
          if (node.nodeType !== 1) continue; // element nodes only
          // Check if the added node IS the canvas or CONTAINS it.
          if (
            node.id === "wa-qr-canvas" ||
            (node.querySelector && node.querySelector("#wa-qr-canvas"))
          ) {
            renderWaQr();
            return;
          }
        }
      }
    });

    mo.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootstrap);
  } else {
    bootstrap();
  }
})();
