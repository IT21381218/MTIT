// This script helps test if 3D models can be loaded
document.addEventListener("DOMContentLoaded", () => {
  // Get all asset items
  const assetItems = document.querySelectorAll("a-asset-item")

  // Log asset loading status
  console.log(`Found ${assetItems.length} 3D models to load`)

  // Check each asset
  assetItems.forEach((asset) => {
    console.log(`Testing model: ${asset.id} - Source: ${asset.getAttribute("src")}`)

    // Add load event listener
    asset.addEventListener("loaded", () => {
      console.log(`✅ Model loaded successfully: ${asset.id}`)
    })

    // Add error event listener
    asset.addEventListener("error", (event) => {
      console.error(`❌ Error loading model: ${asset.id}`, event)
    })
  })

  // Check if assets container loaded
  const assets = document.querySelector("a-assets")
  assets.addEventListener("loaded", () => {
    console.log("All assets loaded successfully")
  })

  assets.addEventListener("timeout", () => {
    console.log("Asset loading timed out")
  })
})
