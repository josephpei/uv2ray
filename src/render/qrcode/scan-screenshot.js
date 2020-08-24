import { desktopCapturer } from 'electron'
import jsQR from 'jsqr'

/**
 * Create a screenshot of the entire screen using the desktopCapturer module of Electron.
 *
 * @param callback {Function} callback receives as first parameter the base64 string of the image
 **/
export default function scanQrcode (callback) {
  // Filter only screen type
  desktopCapturer.getSources({ types: ['screen'] }, (error, sources) => {
    if (error) throw error
    // console.log(sources);
    for (let i = 0; i < sources.length; ++i) {
      // Filter: main screen
      if (sources[i].name === 'Entire Screen') {
        navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            mandatory: {
              chromeMediaSource: 'desktop',
              chromeMediaSourceId: sources[i].id,
              minWidth: 1280,
              maxWidth: 4000,
              minHeight: 720,
              maxHeight: 4000
            }
          }
        })
        .then(stream => handleStream(stream))
        .catch(e => handleError(e))
        return
      }
    }
  })

  function handleStream (stream) {
    // Create hidden video tag
    var video = document.createElement('video')
    video.style.cssText = 'position:absolute;top:-10000px;left:-10000px;'
    // Event connected to stream
    video.onloadedmetadata = function () {
      // Set video ORIGINAL height (screenshot)
      video.style.height = this.videoHeight + 'px' // videoHeight
      video.style.width = this.videoWidth + 'px' // videoWidth
      video.play()

      // Create canvas
      var canvas = document.createElement('canvas')
      canvas.width = this.videoWidth
      canvas.height = this.videoHeight
      var ctx = canvas.getContext('2d')
      // Draw video on canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      if (callback) {
        // Save screenshot to base64
        // var base64 = canvas.toDataURL(imageFormat)
        // console.log(base64)
        const imagedata = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const qrCode = jsQR(imagedata.data, imagedata.width, imagedata.height)
        const result = qrCode.data
        console.log('qrcode process result:', result)
        callback(null, result)
      } else {
        console.log('Need callback!')
      }
      // Remove hidden video tag
      video.remove()
      try {
        // Destroy connect to stream
        stream.getTracks()[0].stop()
      } catch (e) {
        // error
      }
    }
    if ('srcObject' in video) {
      video.srcObject = stream
    } else {
      video.src = window.URL.createObjectURL(stream)
    }
    document.body.appendChild(video)
  }

  function handleError (e) {
    console.log(e)
  }
}
