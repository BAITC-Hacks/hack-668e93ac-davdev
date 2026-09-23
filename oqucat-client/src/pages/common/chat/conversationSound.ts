let chatAudioContext: AudioContext | undefined

const playConversationSound = (type: 'sent' | 'received') => {
  try {
    let audioContext = chatAudioContext
    if (!audioContext) {
      audioContext = new AudioContext()
      chatAudioContext = audioContext
    }
    const oscillator = audioContext.createOscillator()
    const gain = audioContext.createGain()
    const now = audioContext.currentTime
    const frequency = type === 'sent' ? 700 : 520

    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(frequency, now)
    oscillator.frequency.exponentialRampToValueAtTime(
      frequency * 1.25,
      now + 0.08
    )
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(0.08, now + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1)
    oscillator.connect(gain).connect(audioContext.destination)
    oscillator.start(now)
    oscillator.stop(now + 0.1)

    if (audioContext.state === 'suspended') {
      void audioContext.resume()
    }
  } catch {
    // Audio is optional and may be unavailable or blocked by the browser.
  }
}

export { playConversationSound }
