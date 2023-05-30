const ipAddress = '192.168.100.75';
const websocket = new WebSocket("ws://" + ipAddress + ":3000");

let videoElement;
let peerConnection;

// Function to initialize the WebRTC connection
function initWebRTC() {
  videoElement = document.getElementById('video');

  // Create a new RTCPeerConnection
  const configuration = {
    iceServers: [
      {
        urls: [
          "stun:stun.l.google.com:19302",
          "stun:stun1.l.google.com:19302",
          "stun:stun2.l.google.com:19302"
        ]
      }
    ]
  };
  peerConnection = new RTCPeerConnection(configuration);

  // Event handler for ICE candidate
  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      // Send the ICE candidate to the clients via WebSocket
      websocket.send(JSON.stringify({ type: 'candidate', candidate: event.candidate.candidate }));
    }
  };

  // Get the video track from the video element
  const videoTrack = videoElement.srcObject.getVideoTracks()[0];

  // Add the video track to the MediaStream
  peerConnection.addTrack(videoTrack);

  // Create an offer and set it as the local description
  peerConnection
    .createOffer()
    .then((offer) => peerConnection.setLocalDescription(offer))
    .then(() => {
      // Send the offer to the clients via WebSocket
      websocket.send(JSON.stringify({ type: 'offer', offer: peerConnection.localDescription.sdp }));
    })
    .catch((error) => console.error('Error creating offer:', error));
}

// WebSocket open event
websocket.onopen = () => {
  console.log('WebSocket connection established');
};

// WebSocket message event
websocket.onmessage = (event) => {
  const message = JSON.parse(event.data);

  switch (message.type) {
    case 'answer':
      // Set the received answer as the remote description
      peerConnection
        .setRemoteDescription(message.answer)
        .then(() => console.log('Remote description set successfully'))
        .catch((error) => console.error('Error setting remote description:', error));
      break;
    case 'candidate':
      // Add the received ICE candidate to the connection
      peerConnection
        .addIceCandidate(message.candidate)
        .then(() => console.log('ICE candidate added successfully'))
        .catch((error) => console.error('Error adding ICE candidate:', error));
      break;
    default:
      console.log('Unknown message type:', message.type);
  }
};

function playVideo() {
  videoElement.play();
}

function pauseVideo() {
  videoElement.pause();
}

function muteVideo() {
  videoElement.muted = true;
}

function unmuteVideo() {
  videoElement.muted = false;
}

// Play button event listener
document.getElementById("playButton").addEventListener("click", function() {
  // Play the video
  playVideo();
});

// Pause button event listener
document.getElementById("pauseButton").addEventListener("click", function() {
  // Pause the video
  pauseVideo();
});

// Mute button event listener
document.getElementById("muteButton").addEventListener("click", function() {
  // Mute the video
  muteVideo();
});

// Unmute button event listener
document.getElementById("unmuteButton").addEventListener("click", function() {
  // Unmute the video
  unmuteVideo();
});

// Initialize WebRTC when page loads
document.addEventListener('DOMContentLoaded', initWebRTC);
