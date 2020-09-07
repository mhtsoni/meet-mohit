const socket = io('/')//Passing path of static files to be served
const myPeer = new Peer();//creating a new peer for each user
const videoGrid = document.getElementById('video-grid') //Video Grid Object to render all videos
const myVideo = document.createElement('video')//Video object to render users own video
myVideo.muted = true// The user must not hear his own voice

var audio_button = document.getElementById("audio_button");//Audio ON-OFF button
var video_button = document.getElementById("video_button");//Video ON-OFF button
var invite= document.getElementById("invite");//Invite Link Button

//Function to copy invite link onClick
invite.onclick = function(){
        var dummy = document.createElement('input');//Create Input Element
        text = window.location.href;//Set text variable
        document.body.appendChild(dummy);//Adding dummy Input to body
        dummy.value = text;//Setting the dummy input value
        dummy.select();//Select the dummy input
        document.execCommand('copy');//Execute copy command
        document.body.removeChild(dummy);//Remove dummy input
        alert('Invite Link copied to your clipboard send this link to atendies');//Give alert to user
}
let mic_switch = true;//Initially mic is on
let video_switch = true;// Initially Video of user is on

const peers = {} //Peers object to store which users have already joined

//get audio and video of user
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then((stream) =>{
    addVideoStream(myVideo, stream)
    // Audio Video Toggler
    var localStream=stream //Get stream into a variable

    //Video Controls
    video_button.onclick = function() {
        if(localStream != null && localStream.getVideoTracks().length > 0){//If video exists
            video_switch = !video_switch;//Toggle video of user
            
            //Toggle Video Button Icon
            if(video_switch){
                document.getElementById("vid").src='./HomePage/img/video_on.png';
            }
            else{
                document.getElementById("vid").src='./HomePage/img/video_off.png';
            }
            localStream.getVideoTracks()[0].enabled = video_switch;
        }
    }
    //Audio Controls
    audio_button.onclick = function() {

        if(localStream != null && localStream.getAudioTracks().length > 0){
            mic_switch = !mic_switch;//Toggle Mic
            
            //Toggle Audio Button Icon
            if(mic_switch){
                document.getElementById("aud").src='./HomePage/img/contact-icon.png';
            }
            else{
                document.getElementById("aud").src='./HomePage/img/mute.png';
            }
            localStream.getAudioTracks()[0].enabled = mic_switch;
        }
    }

    //On execution of call event
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


