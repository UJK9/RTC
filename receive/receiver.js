const ipAddress = "192.168.100.75";
const websocket = new WebSocket("ws//" + ipAddress + ":3000");

let videoElement;
let peerConnection;
let isStreamStarted = false;

function initWebRTC() {
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

  peerConnection = new RTCPeerConnection();

  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      websocket.send(JSON.stringify({ type: "candidate", candidate: event.candidate }));
    }
  };

  peerConnection.ontrack = (event) => {
    if (!videoElement.srcObject) {
      videoElement.srcObject = event.streams[0];
      console.log("Video playing");
    }
  };

  websocket.onmessage = (event) => {
    const message = JSON.parse(event.data);

    switch (message.type) {
      case "offer":
        peerConnection
          .setRemoteDescription(message.offer)
          .then(() => peerConnection.createAnswer())
          .then((answer) => peerConnection.setLocalDescription(answer))
          .then(() => {
            websocket.send(JSON.stringify({ type: "answer", answer: peerConnection.localDescription }));
          })
          .catch((error) => console.error("Error creating or setting answer:", error));
        break;
      case "candidate":
        peerConnection
          .addIceCandidate(message.candidate)
          .catch((error) => console.error("Error adding ICE candidate:", error));
        break;
      default:
        console.log("Unknown message type:", message.type);
    }
  };
}

websocket.onopen = () => {
  console.log("WebSocket connection established");
  videoElement = document.getElementById("video");

  document.getElementById("startButton").addEventListener("click", function () {
    if (!isStreamStarted) {
      initWebRTC();
      isStreamStarted = true;
    } else {
      videoElement.play();
    }
  });

  videoElement.addEventListener("loadeddata", function () {
    videoElement.pause();
  });
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
document.getElementById("playButton").addEventListener("click", playVideo);

// Pause button event listener
document.getElementById("pauseButton").addEventListener("click", pauseVideo);

// Mute button event listener
document.getElementById("muteButton").addEventListener("click", muteVideo);

// Unmute button event listener
document.getElementById("unmuteButton").addEventListener("click", unmuteVideo);
