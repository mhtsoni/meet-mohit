const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer(undefined, {
    host: '/',
    secure:true,
    port: '443'
})
const myVideo = document.createElement('video')
myVideo.muted = true

var audio_button = document.getElementById("audio_button");
var video_button = document.getElementById("video_button");
let mic_switch = true;
let video_switch = true;

const peers = {}
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream =>{
    addVideoStream(myVideo, stream)
    // Audio Video Toggler
    var localStream=stream //Get stream
    video_button.onclick = function() {
        console.log("Muge click kiua")
        if(localStream != null && localStream.getVideoTracks().length > 0){
            video_switch = !video_switch;
            if(video_switch){
                document.getElementById('video-icon-on').style.display='inline-block'
                document.getElementById('video-icon-off').style.display='none'
            }
            else{
                document.getElementById('video-icon-on').style.display='none'
                document.getElementById('video-icon-off').style.display='inline-block'
            }
            localStream.getVideoTracks()[0].enabled = video_switch;
        }
    }
    audio_button.onclick = function() {
        if(localStream != null && localStream.getAudioTracks().length > 0){
            mic_switch = !mic_switch;
            
            if(mic_switch){
                document.getElementById('audio-icon-on').style.display='inline-block'
                document.getElementById('audio-icon-off').style.display='none'
            }
            else{
                document.getElementById('audio-icon-on').style.display='none'
                document.getElementById('audio-icon-off').style.display='inline-block'
            }
            localStream.getAudioTracks()[0].enabled = mic_switch;
        }
    }


    myPeer.on('call',call=>{
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream=>{
            addVideoStream(video,userVideoStream)
        })
    })
    socket.on('user-connected', userId =>{
        connectToNewUser(userId,stream);
    })
})
socket.on('user-disconnected',userId=>{
    if(peers[userId]) {
        peers[userId].close()
    }
})
myPeer.on('open',id=>{
    socket.emit('join-room', ROOM_ID, id)
})
function connectToNewUser(userId,stream){
    const call = myPeer.call(userId,stream)
    const video = document.createElement('video')
    call.on('stream',userVideoStream=>{
        addVideoStream(video,userVideoStream)
    })
    call.on('close', ()=>{
        video.remove();
    })
    peers[userId] = call;
}

function addVideoStream(video,stream){
    video.srcObject = stream
    video.addEventListener('loadedmetadata' , ()=>{
        video.play();
    })
    videoGrid.append(video)
}


