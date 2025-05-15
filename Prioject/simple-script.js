// Simple script for AR.js with basic functionality
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

  // Hide loader when scene is loaded
  const scene = document.querySelector("a-scene")
  scene.addEventListener("loaded", () => {
    loader.style.display = "none"
    console.log("AR scene loaded")
  })

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

      // Make the 3D object visible with animation
      const object = marker.querySelector("*")
      if (object) {
        // Apply scale animation
        object.setAttribute("animation", {
          property: "scale",
          from: "0 0 0",
          to: "1 1 1",
          dur: 300,
          easing: "easeOutQuad",
        })
      }
    })

    // When marker is lost
    marker.addEventListener("markerLost", () => {
      console.log("Marker lost:", marker.id)
    })
  })

  // Add a special handler for the Hiro marker (for testing)
  const hiroMarker = document.getElementById("hiro-marker")
  if (hiroMarker) {
    hiroMarker.addEventListener("markerFound", () => {
      console.log("Hiro marker found - this is a test marker")
      alert("Test marker detected! Your camera is working correctly.")
    })
  }

  // Handle orientation changes
  window.addEventListener("orientationchange", () => {
    // Wait for orientation to complete
    setTimeout(() => {
      console.log("Orientation changed")
    }, 200)
  })

  // Log initialization
  console.log("AR Space Experience initialized")
})
