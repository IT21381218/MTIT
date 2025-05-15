// Camera fix component for AR.js
AFRAME.registerComponent("camera-fix", {
  schema: {
    userHeight: { type: "number", default: 0 },
  },

  init: function () {
    this.originalPosition = new THREE.Vector3()
    this.cameraViewSet = false

    // Store reference to the camera element
    this.cameraEl = this.el

    // Wait for scene to load
    const scene = document.querySelector("a-scene")
    scene.addEventListener("loaded", () => {
      // Set timeout to ensure AR.js has initialized
      setTimeout(() => {
        this.setupCamera()
      }, 1000)
    })

    // Handle orientation changes
    window.addEventListener("orientationchange", () => {
      // Wait for orientation to complete
      setTimeout(() => {
        this.setupCamera()
      }, 200)
    })

    // Log camera setup for debugging
    this.logDebug("Camera fix component initialized")
  },

  setupCamera: function () {
    // Get the AR.js camera system
    const arToolkitContext = this.el.sceneEl.systems.arjs.arToolkitContext

    if (arToolkitContext) {
      // Force camera parameters update
      if (arToolkitContext.arController) {
        // Set camera parameters for better detection
        arToolkitContext.arController.canvas.width = window.innerWidth
        arToolkitContext.arController.canvas.height = window.innerHeight

        // Update projection matrix
        if (this.el.components.camera) {
          this.el.components.camera.updateProjectionMatrix()
        }

        // Reset camera position
        this.el.setAttribute("position", { x: 0, y: this.data.userHeight, z: 0 })

        // Log success
        this.logDebug("Camera parameters updated successfully")

        // Set camera view flag
        this.cameraViewSet = true
      } else {
        this.logDebug("AR Controller not available yet")
      }
    } else {
      this.logDebug("AR.js context not available yet")
    }
  },

  tick: function () {
    // Continuously ensure camera is at the right position
    if (this.cameraViewSet) {
      // Keep camera at the right height but don't change x/z
      const position = this.el.getAttribute("position")
      if (position.y !== this.data.userHeight) {
        position.y = this.data.userHeight
        this.el.setAttribute("position", position)
      }
    }
  },

  logDebug: (message) => {
    const debugInfo = document.getElementById("debug-info")
    if (debugInfo) {
      debugInfo.innerHTML += `<div>${new Date().toLocaleTimeString()}: ${message}</div>`
      // Keep only the last 5 messages
      const messages = debugInfo.querySelectorAll("div")
      if (messages.length > 5) {
        debugInfo.removeChild(messages[0])
      }
    }
    console.log(`[CameraFix] ${message}`)
  },
})

// Register a component to create camera parameter file
AFRAME.registerComponent("ar-camera-param-setter", {
  init: function () {
    // Create a camera parameter file if needed
    this.createCameraParamFile()
  },

  createCameraParamFile: () => {
    // Check if we need to create the directory
    const dir = "data"

    // Create a basic camera parameter file
    // This is a simplified version of the camera_para.dat file
    // In a real application, you would use a proper camera calibration file
    const cameraParamContent = `<?xml version="1.0"?>
<camera_params>
  <camera_matrix>
    <data>1000 0 640 0 1000 360 0 0 1</data>
  </camera_matrix>
  <distortion>
    <data>0 0 0 0 0</data>
  </distortion>
</camera_params>`

    // Log that we're creating the file
    console.log("Creating camera parameter file")

    // In a real application, you would save this file
    // For now, we'll just log it
    console.log(cameraParamContent)
  },
})
