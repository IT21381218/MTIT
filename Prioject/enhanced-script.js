// Enhanced script for AR.js with model loading and error handling
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

  // Model loading status
  const modelStatus = {
    "sun": false,
    "ship": false,
    "station": false,
    "astronaut": false,
    "alien": false,
  }

  // Hide loader when scene is loaded
  const scene = document.querySelector("a-scene")
  scene.addEventListener("loaded", () => {
    loader.style.display = "none"
    console.log("AR scene loaded")

    // Check if models are loaded
    checkModelsLoaded()
  })

  // Check if 3D models are loaded
  function checkModelsLoaded() {
    const assets = document.querySelector("a-assets")

    assets.addEventListener("loaded", () => {
      console.log("All assets loaded successfully")
    })

    // Add error handlers for each model
    const models = document.querySelectorAll("a-asset-item")
    models.forEach((model) => {
      model.addEventListener("error", (event) => {
        console.error(`Error loading model: ${model.id}`, event)

        // Show fallback for this model
        showFallbackForModel(model.id)
      })
    })
  }

  // Show fallback shape if model fails to load
  function showFallbackForModel(modelId) {
    // Map model ID to marker ID
    const markerMap = {
      "sun": "marker1",
      "ship": "marker2",
      "station": "marker3",
      "astronaut": "marker4",
      "alien": "marker5",
    }

    const markerId = markerMap[modelId]
    if (markerId) {
      const marker = document.getElementById(markerId)
      if (marker) {
        // Hide the model
        const model = marker.querySelector(".model")
        if (model) {
          model.setAttribute("visible", "false")
        }

        // Show the fallback
        const fallback = marker.querySelector(".fallback")
        if (fallback) {
          fallback.setAttribute("scale", "1 1 1")
        }

        console.log(`Using fallback for ${modelId} on ${markerId}`)
      }
    }
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
      console.log("Marker found:", marker.id)

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
      }

      // Also animate the fallback if needed
      const fallback = marker.querySelector(".fallback")
      if (fallback && fallback.getAttribute("scale").x > 0) {
        fallback.setAttribute("animation", {
          property: "scale",
          from: "0 0 0",
          to: "1 1 1",
          dur: 300,
          easing: "easeOutQuad",
        })
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
      console.log("Marker lost:", marker.id)

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

      // Also animate the fallback if needed
      const fallback = marker.querySelector(".fallback")
      if (fallback && fallback.getAttribute("scale").x > 0) {
        fallback.setAttribute("animation", {
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
      console.log("Hiro marker found - this is a test marker")
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

  // Handle orientation changes
  window.addEventListener("orientationchange", () => {
    // Wait for orientation to complete
    setTimeout(() => {
      console.log("Orientation changed")

      // Force resize
      window.dispatchEvent(new Event("resize"))
    }, 200)
  })

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
  console.log("AR Space Experience initialized")
})
