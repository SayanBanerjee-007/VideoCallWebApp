// Socket & Peer connections
const socket = io();
const myPeer = new Peer(undefined, {
  host: location.hostname,
  secure: false,
  port: 3001,
});

// Global variables
const getUserMedia =
  navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia;
const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");
myVideo.muted = true;

// Gloval functions
function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoGrid.append(video);
}

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
    video.id = userId;
  });
  // call.on("close", () => {
  //   video.remove();
  // });
  // peers[userId] = call;
}

// Real work begins here -------------------------------------------------------

myPeer.on("open", (id) => {
  navigator.mediaDevices
    .getUserMedia({
      video: true,
      audio: true,
    })
    .then((stream) => {
      addVideoStream(myVideo, stream);
      socket.on("user-connected", (userId) => {
        connectToNewUser(userId, stream);
      });
    });
  socket.emit("join-room", ROOM_ID, id);
});

myPeer.on("call", function (call) {
  getUserMedia(
    { video: true, audio: true },
    function (stream) {
      const video = document.createElement("video");
      call.answer(stream);
      call.on("stream", function (remoteStream) {
        addVideoStream(video, remoteStream);
        video.id = call.peer;
      });
    },
    function (err) {
      console.log("Failed to get local stream", err);
    }
  );
});

socket.on("user-disconnected", (userId) => {
  // if (peers[userId]) peers[userId].close();
  document.getElementById(userId).remove();
});
