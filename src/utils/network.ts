import {
  RTCIceCandidate,
  RTCSessionDescription,
  RTCPeerConnection,
} from "react-native-webrtc";

export const URL = "ws://8.131.233.47:8080";

export const ws = new WebSocket(URL);

export const rtc = new RTCPeerConnection({
  iceServers: [
    {
      url: "stun:stun.l.google.com:19302",
    },
  ],
});

type MessageType = "offerOrAnswer" | "candidate" | "rotation";

export const sendMessage = (type: MessageType, msg: any) => {
  try {
    ws.send(JSON.stringify({ type, msg }));
  } catch {}
};

ws.onmessage = ({ data }: MessageEvent<string>) => {
  const { type, msg } = JSON.parse(data) as { type: MessageType; msg: any };

  if (type === "offerOrAnswer") {
    console.log("msg");
    rtc.setRemoteDescription(new RTCSessionDescription(msg));
  } else if (type === "candidate") {
    rtc.addIceCandidate(new RTCIceCandidate(msg));
  }
};

rtc.onicecandidate = ({ candidate }) => {
  if (candidate) {
    sendMessage("candidate", candidate);
  }
};

export const createOffer = async () => {
  try {
    const sessionDescription = await rtc.createOffer({
      offerToReceiveVideo: true,
    });
    rtc.setLocalDescription(sessionDescription);

    sendMessage("offerOrAnswer", sessionDescription);
  } catch {}
};

export const createAnswer = async () => {
  try {
    const sessionDescription = await rtc.createAnswer();
    rtc.setLocalDescription(sessionDescription);

    sendMessage("offerOrAnswer", sessionDescription);
  } catch {}
};
