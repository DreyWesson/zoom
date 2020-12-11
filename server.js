const express = require("express");
const app = express();
const server = require("http").Server(app);
const { v4: uuidv4 } = require("uuid");

// app config
const port = process.env.PORT || 3030,
  io = require("socket.io")(server);

// PEER js
const { ExpressPeerServer } = require("peer"),
  peerServer = ExpressPeerServer(server, {
    debug: true,
  });

// middlewares
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use("/peerjs", peerServer);

// DB config

// api routes
app.get("/", (req, res) => res.redirect(`/${uuidv4()}`));
app.get("/:room", (req, res) =>
  res.render("room", { roomId: req.params.room })
);

io.on("connection", (socket) =>
  socket.on("join-room", (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).broadcast.emit("user-connected", userId);
    socket.on("message", (msg) => io.to(roomId).emit("createMessage", msg));
  })
);
// Listener
server.listen(port, () => console.log(`listening on http://localhost:${port}`));
