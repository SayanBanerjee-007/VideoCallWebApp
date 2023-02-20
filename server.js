const path = require("path");
const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { v4: uuidV4 } = require("uuid");
const {Server} = require("socket.io");
const io = new Server(server);

const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/", (req, res) => {
  res.redirect(`/${uuidV4()}`);
});

app.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});

server.listen(port, () => {
  console.log(`Server is listening on: http://localhost:${port}`);
});

io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId) => {
    socket.join(roomId);
    socket.broadcast.to(roomId).emit('user-connected', userId);
    socket.on("disconnect", () => {
      socket.broadcast.to(roomId).emit('user-disconnected', userId);    
    });
  });
}); 
