Make sure to create the wensocket and succesfully connect sender and receiver in it. And add path to the video. 

RECEIVER.JS
In this receiver.js script, a WebSocket connection is created to communicate with the sender. When the WebSocket connection is open, the initWebRTC() function is called to initialize the WebRTC connection.

The WebRTC connection listens for ICE candidates and sends them to the sender via WebSocket. It also handles incoming messages from the sender, including the offer and ICE candidates. When an offer is received, the script sets it as the remote description, creates an answer, sets it as the local description, and sends the answer back to the sender via WebSocket.

In the updated receiver.js file, the ontrack event handler is added to handle incoming video tracks. When a video track is received, it sets the srcObject of the videoElement to display the stream.

Make sure to include this modified receiver.js file in your HTML along with the receiver.html file. When you load the receiver.html in a browser and click the "Start Stream" button, it should establish a WebRTC connection with the sender and display the video stream from the sender in the <video> element.




Also, ensure that the WebSocket server address and port in the receiver.js script matach the address and port where your signaling server is running.

When you open the receiver HTML file in a web browser, it will establish a WebSocket connection with the sender and initiate the WebRTC connection to receive and display the video stream.