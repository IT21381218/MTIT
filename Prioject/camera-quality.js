// Camera quality enhancement component for AR.js
AFRAME.registerComponent("camera-quality", {
  schema: {
    quality: { type: "string", default: "medium" }, // low, medium, high
    brightness: { type: "number", default: 100 },
    contrast: { type: "number", default: 100 },
    sensitivity: { type: "number", default: 50 },
  },

  init: function () {
    this.videoEl = null
    this.stream = null
    this.isInitialized = false

    // Wait for scene to load
    this.el.sceneEl.addEventListener("loaded", () => {
      // Set timeout to ensure AR.js has initialized
      setTimeout(() => {
        this.setupHighQualityCamera()
      }, 1000)
    })

    // Log initialization
    console.log("Camera quality component initialized")
  },

  setupHighQualityCamera: function () {
    // Find the video element created by AR.js
    this.videoEl = document.querySelector("#arjs-video")

    if (!this.videoEl) {
      console.warn("AR.js video element not found")
      return
    }

    // Apply initial styles for better display
    this.applyVideoStyles()

    // Set up camera settings UI
    this.setupCameraSettingsUI()

    // Apply initial camera quality
    this.applyQualitySettings(this.data.quality)

    console.log("High quality camera setup complete")
  },

  applyVideoStyles: function () {
    if (!this.videoEl) return

    // Ensure video covers the entire screen properly
    this.videoEl.style.width = "100%"
    this.videoEl.style.height = "100%"
    this.videoEl.style.objectFit = "cover"
    this.videoEl.style.display = "block"

    // Apply initial filters based on schema values
    this.applyFilters()
  },

  applyFilters: function () {
    if (!this.videoEl) return

    // Apply CSS filters for brightness and contrast
    const brightness = this.data.brightness / 100
    const contrast = this.data.contrast / 100

    this.videoEl.style.filter = `brightness(${brightness}) contrast(${contrast})`

    console.log(`Applied filters: brightness(${brightness}), contrast(${contrast})`)
  },

  applyQualitySettings: function (quality) {
    if (!this.videoEl || this.isInitialized) return

    // Define constraints based on quality setting
    const constraints = {
      audio: false,
      video: {},
    }

    // Set video constraints based on quality
    switch (quality) {
      case "high":
        constraints.video = {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          facingMode: "environment",
          frameRate: { ideal: 30 },
        }
        break
      case "medium":
        constraints.video = {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "environment",
          frameRate: { ideal: 30 },
        }
        break
      case "low":
        constraints.video = {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "environment",
          frameRate: { ideal: 30 },
        }
        break
      default:
        constraints.video = {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "environment",
        }
    }

    // Stop current stream if it exists
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop())
    }

    // Get new stream with specified constraints
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((stream) => {
        // Store stream reference
        this.stream = stream

        // Apply stream to video element
        this.videoEl.srcObject = stream

        // Update AR.js source
        const arToolkitSource = this.el.sceneEl.systems.arjs.arToolkitSource
        if (arToolkitSource && arToolkitSource.domElement) {
          // Force AR.js to use our high quality stream
          arToolkitSource.domElement.srcObject = stream

          // Update AR.js processing
          if (this.el.sceneEl.systems.arjs.arToolkitContext) {
            this.el.sceneEl.systems.arjs.arToolkitContext.update()
          }
        }

        console.log(`Applied ${quality} quality camera settings`)

        // Set detection sensitivity based on quality
        this.updateDetectionSensitivity()

        // Mark as initialized
        this.isInitialized = true
      })
      .catch((err) => {
        console.error("Error getting camera stream with high quality:", err)
        // Fall back to default AR.js camera handling
      })
  },

  updateDetectionSensitivity: function () {
    // Get AR.js context
    const arToolkitContext = this.el.sceneEl.systems.arjs.arToolkitContext

    if (arToolkitContext && arToolkitContext.arController) {
      // Convert sensitivity (0-100) to threshold (0-255, inverted)
      const threshold = Math.floor(255 * (1 - this.data.sensitivity / 100))

      // Set detection threshold
      arToolkitContext.arController.threshold = threshold

      console.log(`Set detection threshold to ${threshold} (sensitivity: ${this.data.sensitivity})`)
    }
  },

  setupCameraSettingsUI: function () {
    // Get UI elements
    const cameraSettingsBtn = document.getElementById("camera-settings")
    const cameraSettingsPanel = document.getElementById("camera-settings-panel")
    const closeCameraSettingsBtn = document.getElementById("close-camera-settings")
    const applyCameraSettingsBtn = document.getElementById("apply-camera-settings")
    const qualitySelect = document.getElementById("camera-quality")
    const brightnessSlider = document.getElementById("camera-brightness")
    const contrastSlider = document.getElementById("camera-contrast")
    const sensitivitySlider = document.getElementById("detection-sensitivity")

    if (!cameraSettingsBtn || !cameraSettingsPanel) return

    // Set initial values
    if (qualitySelect) qualitySelect.value = this.data.quality
    if (brightnessSlider) brightnessSlider.value = this.data.brightness
    if (contrastSlider) contrastSlider.value = this.data.contrast
    if (sensitivitySlider) sensitivitySlider.value = this.data.sensitivity

    // Open settings panel
    cameraSettingsBtn.addEventListener("click", () => {
      cameraSettingsPanel.style.display = "flex"
    })

    // Close settings panel
    if (closeCameraSettingsBtn) {
      closeCameraSettingsBtn.addEventListener("click", () => {
        cameraSettingsPanel.style.display = "none"
      })
    }

    // Apply settings
    if (applyCameraSettingsBtn) {
      applyCameraSettingsBtn.addEventListener("click", () => {
        // Get values from UI
        const newQuality = qualitySelect ? qualitySelect.value : this.data.quality
        const newBrightness = brightnessSlider ? Number.parseFloat(brightnessSlider.value) : this.data.brightness
        const newContrast = contrastSlider ? Number.parseFloat(contrastSlider.value) : this.data.contrast
        const newSensitivity = sensitivitySlider ? Number.parseFloat(sensitivitySlider.value) : this.data.sensitivity

        // Update component data
        this.data.quality = newQuality
        this.data.brightness = newBrightness
        this.data.contrast = newContrast
        this.data.sensitivity = newSensitivity

        // Apply new settings
        this.applyQualitySettings(newQuality)
        this.applyFilters()
        this.updateDetectionSensitivity()

        // Close panel
        cameraSettingsPanel.style.display = "none"

        // Show notification
        this.showNotification(`Camera settings updated: ${newQuality} quality`)
      })
    }

    // Real-time filter preview
    if (brightnessSlider) {
      brightnessSlider.addEventListener("input", () => {
        this.data.brightness = Number.parseFloat(brightnessSlider.value)
        this.applyFilters()
      })
    }

    if (contrastSlider) {
      contrastSlider.addEventListener("input", () => {
        this.data.contrast = Number.parseFloat(contrastSlider.value)
        this.applyFilters()
      })
    }
  },

  showNotification: (message) => {
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
  },
})
