const WebSocket = require("ws");
const http = require("http");
const fs = require("fs");
const path = require("path");

const server = http.createServer((req, res) => {
  // Enable CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );

  // Check if the request is for the video stream
  if (req.url === "/videostream") {
    // Get the video file path from the request query parameters
    const url = new URL(req.url, `http://${req.headers.host}`);
    const filePath = url.searchParams.get("filePath");

    if (!filePath) {
      res.writeHead(400);
      res.end("Bad Request: No file path provided");
      return;
    }

    const videoPath = path.join(__dirname, filePath);

    // Check if the video file exists
    if (!fs.existsSync(videoPath)) {
      res.writeHead(404);
      res.end("Not Found: Video file not found");
      return;
    }

    // Get the video file's size
    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;

    // Set the headers for streaming the entire video
    res.writeHead(200, {
      "Content-Length": fileSize,
      "Content-Type": "video/mp4",
    });

    // Create a readable stream from the video file and pipe it to the response
    const videoStream = fs.createReadStream(videoPath);
    videoStream.pipe(res);
  } else {
    // If the request is for any other resource, return a 404 error
    res.writeHead(404);
    res.end("Not Found");
  }
});

const wss = new WebSocket.Server({ server });

wss.on("listening", () => {
  console.log("WebSocket server listening on http://192.168.100.75:3000...");
});

// Store the connected clients
const clients = new Set();

// Function to handle WebSocket messages
function handleWebSocketMessage(message, client) {
  const parsedMessage = JSON.parse(message);

  switch (parsedMessage.type) {
    case "start":
      const filePath = parsedMessage.filePath || "video.mp4"; 
      startStreaming(client, filePath);
      break;
    default:
      console.log("Unknown message type:", parsedMessage.type);
  }
}

// Function to handle video streaming
function startStreaming(client, filePath) {
  
  
  // Send a "start" message to the client
  const message = JSON.stringify({ type: "start" });
  client.send(message);

  // Update the video path based on the received file path
  const videoPath = path.join(__dirname, filePath);

  //Create a readable stream from the video file
  const videoStream = fs.createReadStream(videoPath);

  
  //Get he video file's size
  const stat= fs.statSync(videoPath);
  const fileSize= stat.size;
  //Set headers for streaming the entire video
  client.send(
    JSON.stringify({
      type: "video-info",
      fileSize,
    })
  );

  //Stream the video to the client 
  videoStream.on("data", (chunk)=> {
    client.send(chunk);
  });

  

  videoStream.on("end", () => {
    client.send(null);
  });
}

wss.on("connection", (client) => {
  console.log("WebSocket client connected");
  clients.add(client);

  client.on("message", (message) => {
    handleWebSocketMessage(message, client);
  });

  client.on("close", () => {
    console.log("WebSocket client disconnected");
    clients.delete(client);
  });
});

// Start the server
const port = 3000;
const host = "192.168.100.75";
server.listen(port, host, () => {
  console.log(`HTTP server listening on http://${host}:${port}...`);
});
