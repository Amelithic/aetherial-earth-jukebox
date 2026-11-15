<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as THREE from 'three'

const props = defineProps<{ textureUrl: string }>()

const container = ref<HTMLDivElement | null>(null)

defineExpose({
  getCanvas: () => renderer?.domElement ?? null,
  getContainer: () => container.value,
})

let renderer: THREE.WebGLRenderer | null = null
let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let sphere: THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial> | null = null
let frameId = 0
let resizeObserver: ResizeObserver | null = null

let isDragging = false
let lastX = 0
let lastY = 0
let velocityX = 0
let velocityY = 0

function loadTexture(url: string): void {
  if (!sphere) return

  new THREE.TextureLoader().load(url, (texture) => {
    if (!sphere) return

    texture.colorSpace = THREE.SRGBColorSpace
    const previous = sphere.material.map
    sphere.material.map = texture
    sphere.material.needsUpdate = true
    previous?.dispose()
  })
}

function resize(): void {
  if (!container.value || !renderer || !camera) return

  const width = container.value.clientWidth || 320
  const height = container.value.clientHeight || 320
  renderer.setSize(width, height)
  camera.aspect = width / height
  camera.updateProjectionMatrix()
}

function animate(): void {
  frameId = requestAnimationFrame(animate)

  if (sphere && !isDragging) {
    sphere.rotation.y -= 0.0018 + velocityX
    sphere.rotation.x += velocityY
    velocityX *= 0.94
    velocityY *= 0.94
  }

  if (renderer && scene && camera) renderer.render(scene, camera)
}

function onPointerDown(event: PointerEvent): void {
  isDragging = true
  lastX = event.clientX
  lastY = event.clientY
  container.value?.setPointerCapture(event.pointerId)
}

function onPointerMove(event: PointerEvent): void {
  if (!isDragging || !sphere) return

  const deltaX = event.clientX - lastX
  const deltaY = event.clientY - lastY
  lastX = event.clientX
  lastY = event.clientY

  sphere.rotation.y += deltaX * 0.005
  sphere.rotation.x = Math.max(
    -Math.PI / 2,
    Math.min(Math.PI / 2, sphere.rotation.x + deltaY * 0.005),
  )
  velocityX = deltaX * 0.0004
  velocityY = deltaY * 0.0004
}

function onPointerUp(event: PointerEvent): void {
  isDragging = false
  if (container.value?.hasPointerCapture(event.pointerId)) {
    container.value.releasePointerCapture(event.pointerId)
  }
}

onMounted(() => {
  if (!container.value) return

  const width = container.value.clientWidth || 320
  const height = container.value.clientHeight || 320

  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100)
  camera.position.z = 3

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  container.value.appendChild(renderer.domElement)

  sphere = new THREE.Mesh(
    new THREE.SphereGeometry(1, 64, 48),
    new THREE.MeshBasicMaterial(),
  )
  scene.add(sphere)

  loadTexture(props.textureUrl)
  animate()

  resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(container.value)
})

watch(
  () => props.textureUrl,
  (url) => {
    if (url) loadTexture(url)
  },
)

onBeforeUnmount(() => {
  cancelAnimationFrame(frameId)
  resizeObserver?.disconnect()

  if (sphere) {
    sphere.geometry.dispose()
    sphere.material.map?.dispose()
    sphere.material.dispose()
  }

  if (renderer) {
    renderer.dispose()
    renderer.domElement.remove()
  }
})
</script>

<template>
  <div
    ref="container"
    class="visualiser"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointerleave="onPointerUp"
  ></div>
</template>
