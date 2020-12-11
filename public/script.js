const socket = io("/");
const videoGrid = document.getElementById("video__grid");
const myVideo = document.createElement("video");
myVideo.muted = true;

let peer = new Peer(undefined, {
  path: "/peerjs",
  host: "/",
  port: "3030",
});

let myVideoStream;
navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    peer.on("call", (call) => {
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });

    socket.on("user-connected", (userId) => connectToNewUser(userId, stream));

    // Message logic

    let text = $("input");
    // console.log(text);

    $("html").keydown((e) => {
      if (e.which == 13 && text.val().length !== 0) {
        socket.emit("message", text.val());
        text.val("");
      }
    });
    socket.on("createMessage", (msg) => {
      $(".messages").append(`<li class="message"><b>user</b><br/>${msg}</li>`);
      scrollToBottom();
    });
  });

peer.on("open", (id) => socket.emit("join-room", ROOM_ID, id));

const connectToNewUser = (userId, stream) => {
  const call = peer.call(userId, stream),
    video = document.createElement("video");
  call.on("stream", (userVideoStream) =>
    addVideoStream(video, userVideoStream)
  );
};

const addVideoStream = (video, stream) => {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => video.play());
  videoGrid.append(video);
};

const scrollToBottom = () => {
  let d = $(".main__chatWindow");
  d.scrollTop(d.prop("scrollHeight"));
};

// Mute video
const muteControl = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  const muteSwitch = (func, bool) => {
    myVideoStream.getAudioTracks()[0].enabled = bool;
    func();
  };

  enabled
    ? muteSwitch(setUnmuteButton, false)
    : muteSwitch(setMuteButton, true);
};

const setMuteButton = () => {
  const html = `
  <i class="fal fa-microphone-alt"></i>

    <span>Mute</span>
  `;
  document.querySelector(".main__muteButton").innerHTML = html;
};

const setUnmuteButton = () => {
  const html = `
  <i class="unmute fal fa-microphone-alt-slash"></i>
    <span>Unmute</span>
  `;
  document.querySelector(".main__muteButton").innerHTML = html;
};

const playStop = () => {
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  const playStopSwitch = (func, bool) => {
    myVideoStream.getVideoTracks()[0].enabled = bool;
    func();
  };
  enabled
    ? playStopSwitch(setPlayVideo, false)
    : playStopSwitch(setStopVideo, true);
};

const setStopVideo = () => {
  const html = `
  <i class="fad fa-video"></i>

    <span>Stop Video</span>
  `;
  document.querySelector(".main__videoButton").innerHTML = html;
};

const setPlayVideo = () => {
  const html = `
  <i class="stop fad fa-video-slash"></i>
    <span>Play Video</span>
  `;
  document.querySelector(".main__videoButton").innerHTML = html;
};
