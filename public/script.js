const socket = io('/')
const myPeer = new Peer();
const videoGrid = document.getElementById('video-grid')
const myVideo = document.createElement('video')
myVideo.muted = true

var audio_button = document.getElementById("audio_button");
var video_button = document.getElementById("video_button");
var invite= document.getElementById("invite");
invite.onclick = function(){

        var dummy = document.createElement('input'),
          text = window.location.href;
        document.body.appendChild(dummy);
        dummy.value = text;
        dummy.select();
        document.execCommand('copy');
        document.body.removeChild(dummy);
        alert('Invite Link copied to your clipboard send this link to atendies');
}
let mic_switch = true;
let video_switch = true;

const peers = {}
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then((stream) =>{
    addVideoStream(myVideo, stream)
    // Audio Video Toggler
    var localStream=stream //Get stream
    video_button.onclick = function() {
        if(localStream != null && localStream.getVideoTracks().length > 0){
            video_switch = !video_switch;
            if(video_switch){
                document.getElementById("vid").src='./HomePage/img/video_on.png';
            }
            else{
                document.getElementById("vid").src='./HomePage/img/video_off.png';
            }
            localStream.getVideoTracks()[0].enabled = video_switch;
        }
    }
    audio_button.onclick = function() {
        if(localStream != null && localStream.getAudioTracks().length > 0){
            mic_switch = !mic_switch;
            
            if(mic_switch){
                document.getElementById("aud").src='./HomePage/img/contact-icon.png';
            }
            else{
                document.getElementById("aud").src='./HomePage/img/mute.png';
            }
            localStream.getAudioTracks()[0].enabled = mic_switch;
        }
    }


    myPeer.on('call',(call)=>{
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream=>{
            addVideoStream(video,userVideoStream)
        })
    })
    socket.on('user-connected', userId =>{
        connectToNewUser(userId,stream);
    })
}).catch((err)=>{
    console.log("Bhai error yha h :"+err)
})
socket.on('user-disconnected',userId=>{
    if(peers[userId]) {
        peers[userId].close()
    }
})
myPeer.on('open',(id)=>{
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


