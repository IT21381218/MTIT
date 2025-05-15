// Fixed script for AR.js with proper model loading
document.addEventListener("DOMContentLoaded", () => {
  // Get UI elements
  const markersCountElement = document.getElementById("markers-count")
  const reloadBtn = document.getElementById("reload-btn")
  const helpBtn = document.getElementById("help-btn")
  const helpPanel = document.getElementById("help-panel")
  const closeHelpBtn = document.getElementById("close-help")
  const loader = document.querySelector(".arjs-loader")

  // Set up detected markers tracking
  const detectedMarkers = new Set()

  // Debug flag - set to true to see console logs
  const DEBUG = true

  // Log function that only works when DEBUG is true
  function log(message) {
    if (DEBUG) {
      console.log(`[AR Debug] ${message}`)
    }
  }

  // Hide loader when scene is loaded
  const scene = document.querySelector("a-scene")
  scene.addEventListener("loaded", () => {
    loader.style.display = "none"
    log("AR scene loaded")
  })

  // Set timeout to hide loader even if scene doesn't load properly
  setTimeout(() => {
    if (loader.style.display !== "none") {
      loader.style.display = "none"
      log("Loader timeout - forcing hide")
    }
  }, 8000)

  // Check if assets are loaded
  const assets = document.querySelector("a-assets")
  if (assets) {
    assets.addEventListener("loaded", () => {
      log("All assets loaded successfully")
    })

    assets.addEventListener("timeout", () => {
      log("Asset loading timed out - some models may not appear")
      showAllFallbacks()
    })
  }

  // Show fallbacks for all models in case of loading issues
  function showAllFallbacks() {
    const fallbacks = document.querySelectorAll(".fallback")
    fallbacks.forEach((fallback) => {
      fallback.setAttribute("scale", "1 1 1")
      log(`Showing fallback: ${fallback.parentNode.id}`)
    })
  }

  // Reload button
  reloadBtn.addEventListener("click", () => {
    window.location.reload()
  })

  // Help panel
  helpBtn.addEventListener("click", () => {
    helpPanel.style.display = "flex"
  })

  closeHelpBtn.addEventListener("click", () => {
    helpPanel.style.display = "none"
  })

  // Set up marker detection events
  const markers = document.querySelectorAll("a-marker")
  markers.forEach((marker) => {
    // When marker is found
    marker.addEventListener("markerFound", () => {
      log(`Marker found: ${marker.id}`)

      // Add to detected markers set
      detectedMarkers.add(marker.id)
      markersCountElement.textContent = detectedMarkers.size

      // Show the 3D model with animation
      const model = marker.querySelector(".model")
      if (model) {
        // Apply scale animation
        model.setAttribute("animation", {
          property: "scale",
          from: "0 0 0",
          to: "0.5 0.5 0.5",
          dur: 300,
          easing: "easeOutQuad",
        })

        // Make sure model is visible
        model.setAttribute("visible", "true")

        // Log model info
        log(`Model for ${marker.id}: ${model.getAttribute("gltf-model")}`)
      } else {
        log(`No model found for ${marker.id}`)
      }

      // Hide the fallback shape
      const fallback = marker.querySelector(".fallback")
      if (fallback) {
        fallback.setAttribute("scale", "0 0 0")
      }

      // Vibrate device for feedback (mobile only)
      if (navigator.vibrate) {
        navigator.vibrate(100)
      }

      // Show notification
      showNotification(`${marker.id} detected!`)
    })

    // When marker is lost
    marker.addEventListener("markerLost", () => {
      log(`Marker lost: ${marker.id}`)

      // Scale down the model
      const model = marker.querySelector(".model")
      if (model) {
        model.setAttribute("animation", {
          property: "scale",
          to: "0 0 0",
          dur: 300,
          easing: "easeInQuad",
        })
      }
    })
  })

  // Add a special handler for the Hiro marker (for testing)
  const hiroMarker = document.getElementById("hiro-marker")
  if (hiroMarker) {
    hiroMarker.addEventListener("markerFound", () => {
      log("Hiro marker found - this is a test marker")
      showNotification("Test marker detected! Your camera is working correctly.")
    })
  }

  // Show notification
  function showNotification(message) {
    // Create notification element if it doesn't exist
    let notification = document.querySelector(".notification")

    if (!notification) {
      notification = document.createElement("div")
      notification.className = "notification"
      document.body.appendChild(notification)
    }

    // Set message and show
    notification.textContent = message
    notification.classList.add("visible")

    // Hide after 3 seconds
    setTimeout(() => {
      notification.classList.remove("visible")
    }, 3000)
  }

  // Add notification styles
  const style = document.createElement("style")
  style.textContent = `
    .notification {
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background-color: rgba(0, 136, 255, 0.9);
      color: white;
      padding: 10px 20px;
      border-radius: 50px;
      font-size: 14px;
      z-index: 2000;
      text-align: center;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
      opacity: 0;
      transition: opacity 0.3s, transform 0.3s;
    }
    
    .notification.visible {
      opacity: 1;
      transform: translate(-50%, 0);
    }
  `
  document.head.appendChild(style)

  // Log initialization
  log("AR space Experience initialization complete")
})
