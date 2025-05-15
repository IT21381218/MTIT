// Wait for DOM to load
document.addEventListener("DOMContentLoaded", () => {
  // Check if running on mobile and apply specific fixes
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream

  // Get elements
  const scene = document.querySelector("a-scene")
  const loader = document.querySelector(".arjs-loader")
  const markersCountElement = document.getElementById("markers-count")
  const soundToggle = document.getElementById("sound-toggle")
  const debugToggle = document.getElementById("debug-toggle")
  const debugPanel = document.getElementById("debug-panel")
  const cameraControls = document.getElementById("camera-controls")
  const cameraSwitchBtn = document.getElementById("camera-switch")
  const detectionConfidence = document.getElementById("detection-confidence")
  const ambientSound = document.getElementById("ambient-sound")
  const markerStatus = document.getElementById("marker-status")

  // Debug mode flag
  let debugMode = false

  // Apply mobile-specific adjustments
  if (isMobile) {
    // Show camera controls on mobile
    cameraControls.style.display = "block"

    // Prevent unwanted touch behaviors
    document.addEventListener(
      "touchmove",
      (e) => {
        e.preventDefault()
      },
      { passive: false },
    )

    // Log mobile device info
    logDebug(`Mobile device detected: ${navigator.userAgent}`)

    // iOS-specific fixes
    if (isIOS) {
      logDebug("iOS device detected, applying specific fixes")

      // Force video dimensions for iOS
      const arjsSystem = scene.systems.arjs
      if (arjsSystem && arjsSystem._arSession) {
        arjsSystem._arSession._deviceId = "default"
      }
    }
  }

  // Set initial sound state
  let soundEnabled = true

  // Hide loader when scene is loaded
  scene.addEventListener("loaded", () => {
    loader.style.display = "none"
    logDebug("Scene loaded successfully")

    // Start ambient sound at low volume
    ambientSound.volume = 0.3
    ambientSound.play().catch((e) => {
      logDebug("Audio autoplay was prevented. User interaction needed.")
    })

    // Initialize AR.js with optimal settings
    initializeAR()
  })

  // Initialize AR.js with optimal settings
  function initializeAR() {
    // Get AR.js context
    const arToolkitContext = scene.systems.arjs.arToolkitContext

    if (arToolkitContext && arToolkitContext.arController) {
      // Set detection confidence threshold
      arToolkitContext.arController.setThresholdMode(2) // AUTO_ADAPTIVE
      arToolkitContext.arController.setThreshold(80)

      // Set pattern detection mode for better results
      arToolkitContext.arController.setPatternDetectionMode(2) // AR_TEMPLATE_MATCHING_COLOR

      // Set matrix code type for better detection
      arToolkitContext.arController.setMatrixCodeType(3) // 3x3

      logDebug("AR.js initialized with optimal settings")
    } else {
      logDebug("AR.js context not available yet")
    }
  }

  // Toggle sound button
  soundToggle.addEventListener("click", () => {
    soundEnabled = !soundEnabled

    if (soundEnabled) {
      soundToggle.textContent = "🔊 Sound On"
      ambientSound.play()
      ambientSound.volume = 0.3
    } else {
      soundToggle.textContent = "🔇 Sound Off"
      ambientSound.pause()
    }
  })

  // Toggle debug mode
  debugToggle.addEventListener("click", () => {
    debugMode = !debugMode

    if (debugMode) {
      debugPanel.style.display = "block"
      debugToggle.textContent = "Hide Debug"
      logDebug("Debug mode enabled")
    } else {
      debugPanel.style.display = "none"
      debugToggle.textContent = "Show Debug"
    }
  })

  // Switch camera (front/back)
  cameraSwitchBtn.addEventListener("click", () => {
    // Get current video source
    const video = document.querySelector("#arjs-video")

    if (video) {
      // Toggle between front and back camera
      const constraints = {
        video: {
          facingMode: video.style.transform ? "environment" : "user",
          width: { ideal: 1280 },
          height: { ideal: 960 },
        },
      }

      // Stop current stream
      if (video.srcObject) {
        const tracks = video.srcObject.getTracks()
        tracks.forEach((track) => track.stop())
      }

      // Get new stream
      navigator.mediaDevices
        .getUserMedia(constraints)
        .then((stream) => {
          video.srcObject = stream
          video.style.transform = video.style.transform ? "" : "scaleX(-1)"
          logDebug(`Switched to ${video.style.transform ? "front" : "back"} camera`)
        })
        .catch((err) => {
          logDebug(`Camera switch error: ${err.message}`)
        })
    } else {
      logDebug("Video element not found")
    }
  })

  // Adjust detection confidence
  detectionConfidence.addEventListener("input", () => {
    const value = Number.parseFloat(detectionConfidence.value)

    // Get AR.js context
    const arToolkitContext = scene.systems.arjs.arToolkitContext

    if (arToolkitContext && arToolkitContext.arController) {
      // Convert 0.1-0.9 range to 50-150 threshold range (inverted)
      const threshold = Math.round(150 - value * 100)
      arToolkitContext.arController.setThreshold(threshold)

      logDebug(`Detection sensitivity set to ${value} (threshold: ${threshold})`)
    }
  })

  // Track detected markers
  const detectedMarkers = new Set()

  // Create info popup element
  const infoPopup = document.createElement("div")
  infoPopup.className = "info-popup"
  document.body.appendChild(infoPopup)

  // Model information
  const modelInfo = {
    marker1: {
      title: "Sun",
      description: "The star at the center of our solar system, radiating intense heat and energy.",
      contributor: "Group Member 1",
    },
    marker2: {
      title: "Alien Ship",
      description: "A mysterious spacecraft of unknown origin, hovering silently in space.",
      contributor: "Group Member 2",
    },
    marker3: {
      title: "International Space Station",
      description: "A habitable space laboratory orbiting Earth, home to astronauts from around the world.",
      contributor: "Group Member 3",
    },
    marker4: {
      title: "Astronaut",
      description: "A human explorer equipped with a space suit, floating in zero gravity.",
      contributor: "Group Member 4",
    },
    marker4: {
      title: "Alien",
      description: "An intelligent extraterrestrial being from a distant world.",
      contributor: "Group Member 5",
    },
  }

  // Add marker detection events
  const markers = document.querySelectorAll("a-marker")
  markers.forEach((marker) => {
    marker.addEventListener("markerFound", () => {
      // Add to detected markers set
      detectedMarkers.add(marker.id)
      markersCountElement.textContent = detectedMarkers.size

      // Show info popup
      const info = modelInfo[marker.id]
      infoPopup.innerHTML = `
        <h3>${info.title}</h3>
        <p>${info.description}</p>
        <p><small>Created by: ${info.contributor}</small></p>
      `
      infoPopup.classList.add("visible")

      // Apply entrance animation to model
      const model = marker.querySelector(".model")
      model.setAttribute("animation__scale", {
        property: "scale",
        from: "0 0 0",
        to: "0.5 0.5 0.5",
        dur: 1000,
        easing: "easeOutElastic",
      })

      // Log marker detection
      logDebug(`Marker found: ${marker.id}`)
      updateMarkerStatus(marker.id, true)

      // Check if all markers are found
      if (detectedMarkers.size === 5) {
        // Create celebration effect
        createCelebrationEffect()
      }
    })

    marker.addEventListener("markerLost", () => {
      // Hide info popup
      infoPopup.classList.remove("visible")

      // Log marker lost
      logDebug(`Marker lost: ${marker.id}`)
      updateMarkerStatus(marker.id, false)
    })
  })

  // Update marker status in debug panel
  function updateMarkerStatus(markerId, isDetected) {
    if (!markerStatus) return

    // Create marker status element if it doesn't exist
    let statusEl = document.getElementById(`status-${markerId}`)
    if (!statusEl) {
      statusEl = document.createElement("div")
      statusEl.id = `status-${markerId}`
      markerStatus.appendChild(statusEl)
    }

    // Update status
    statusEl.innerHTML = `Marker ${markerId}: <span style="color: ${isDetected ? "#00ff00" : "#ff0000"}">${isDetected ? "DETECTED" : "NOT DETECTED"}</span>`
  }

  // Log debug message
  function logDebug(message) {
    const debugInfo = document.getElementById("debug-info")
    if (debugInfo) {
      const timestamp = new Date().toLocaleTimeString()
      debugInfo.innerHTML += `<div>${timestamp}: ${message}</div>`

      // Keep only the last 10 messages
      const messages = debugInfo.querySelectorAll("div")
      if (messages.length > 10) {
        debugInfo.removeChild(messages[0])
      }

      // Auto-scroll to bottom
      debugInfo.scrollTop = debugInfo.scrollHeight
    }
    console.log(`[AR Debug] ${message}`)
  }

  // Celebration effect when all markers are found
  function createCelebrationEffect() {
    // Create a full-screen overlay with a congratulatory message
    const celebration = document.createElement("div")
    celebration.style.position = "absolute"
    celebration.style.top = "0"
    celebration.style.left = "0"
    celebration.style.width = "100%"
    celebration.style.height = "100%"
    celebration.style.backgroundColor = "rgba(0, 0, 0, 0.7)"
    celebration.style.color = "white"
    celebration.style.display = "flex"
    celebration.style.justifyContent = "center"
    celebration.style.alignItems = "center"
    celebration.style.zIndex = "2000"
    celebration.style.fontSize = "24px"
    celebration.style.textAlign = "center"
    celebration.style.padding = "20px"
    celebration.innerHTML = `
      <div>
        <h2>Congratulations!</h2>
        <p>You've found all space items!</p>
        <button id="close-celebration" style="background: #0088ff; border: none; color: white; padding: 10px 20px; border-radius: 5px; margin-top: 20px; cursor: pointer;">Continue Exploring</button>
      </div>
    `

    document.body.appendChild(celebration)

    // Close button
    document.getElementById("close-celebration").addEventListener("click", () => {
      document.body.removeChild(celebration)
    })

    // Log celebration
    logDebug("All markers found! Celebration triggered.")
  }

  // Register custom A-Frame components

  // Particle system component (simplified version)
  AFRAME.registerComponent("particle-system", {
    schema: {
      preset: { default: "default" },
      color: { default: "#FFFFFF" },
      particleCount: { default: 100 },
      opacity: { default: 1.0 },
      size: { default: 0.1 },
    },

    init: function () {
      const el = this.el
      const data = this.data

      // Only create particles when marker is found
      const parentMarker = el.closest("a-marker")
      if (parentMarker) {
        parentMarker.addEventListener("markerFound", () => {
          this.createParticles()
        })

        parentMarker.addEventListener("markerLost", () => {
          this.removeParticles()
        })
      }
    },

    createParticles: function () {
      const el = this.el
      const data = this.data

      // Clear any existing particles
      this.removeParticles()

      // Create particles based on preset
      this.particles = []

      // Reduce particle count on mobile for better performance
      const particleCount = isMobile ? Math.floor(data.particleCount / 2) : data.particleCount

      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement("a-sphere")
        particle.setAttribute("radius", data.size)
        particle.setAttribute("color", data.color)
        particle.setAttribute("opacity", data.opacity)
        particle.setAttribute("position", "0 0 0")

        // Different animation based on preset
        if (data.preset === "snow") {
          // Snow-like falling particles
          const xPos = (Math.random() - 0.5) * 2
          const yPos = Math.random() * 2 + 1
          const zPos = (Math.random() - 0.5) * 2

          particle.setAttribute("animation", {
            property: "position",
            from: `${xPos} ${yPos} ${zPos}`,
            to: `${xPos} ${-0.5} ${zPos}`,
            dur: 2000 + Math.random() * 3000,
            easing: "linear",
            loop: true,
          })
        } else {
          // Default particles that expand outward
          const xPos = (Math.random() - 0.5) * 2
          const yPos = Math.random() * 1
          const zPos = (Math.random() - 0.5) * 2

          particle.setAttribute("animation", {
            property: "position",
            to: `${xPos} ${yPos} ${zPos}`,
            dur: 1000 + Math.random() * 1000,
            easing: "easeOutQuad",
            loop: true,
            dir: "alternate",
          })
        }

        el.appendChild(particle)
        this.particles.push(particle)
      }
    },

    removeParticles: function () {
      if (this.particles) {
        this.particles.forEach((particle) => {
          if (particle.parentNode) {
            particle.parentNode.removeChild(particle)
          }
        })
        this.particles = []
      }
    },

    remove: function () {
      this.removeParticles()
    },
  })

  // Add a click event to reset the AR experience if needed
  document.addEventListener("keydown", (e) => {
    if (e.key === "r" || e.key === "R") {
      logDebug("Manual reset triggered")
      window.location.reload()
    }
  })

  // Log initial setup complete
  logDebug("AR Space Experience initialization complete")
})
