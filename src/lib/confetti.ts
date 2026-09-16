import confetti from 'canvas-confetti'

export function fireConfetti() {
  const colors = ['#2dd4bf', '#5eead4', '#a7f3d0', '#fbbf24']
  confetti({
    particleCount: 90,
    spread: 75,
    startVelocity: 35,
    origin: { y: 0.7 },
    colors,
    scalar: 0.9,
    ticks: 200,
  })
}
