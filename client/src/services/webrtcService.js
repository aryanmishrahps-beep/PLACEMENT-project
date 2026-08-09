/**
 * WebRTC + Firebase Realtime DB Signaling Service
 * Real P2P live streaming: Faculty (broadcaster) → Students (viewers)
 */
import { realtimeDb } from '../firebase/config';
import { ref, set, onValue, onChildAdded, push, remove, off, get } from 'firebase/database';

// ICE servers: STUN (free) + TURN relay (for cross-network/production)
const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    // Open Relay free TURN servers – enables NAT traversal for production
    { urls: 'turn:openrelay.metered.ca:80', username: 'openrelayproject', credential: 'openrelayproject' },
    { urls: 'turn:openrelay.metered.ca:443', username: 'openrelayproject', credential: 'openrelayproject' },
    { urls: 'turn:openrelay.metered.ca:443?transport=tcp', username: 'openrelayproject', credential: 'openrelayproject' },
  ],
};

// ─── CHAT ─────────────────────────────────────────────────────────────────────

export const sendFirebaseMessage = async (roomId, sender, role, text) => {
  const msgRef = ref(realtimeDb, `rooms/${roomId}/chat`);
  await push(msgRef, {
    sender,
    role,
    text,
    time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    timestamp: Date.now(),
  });
};

export const subscribeToChat = (roomId, callback) => {
  const msgRef = ref(realtimeDb, `rooms/${roomId}/chat`);
  const handler = onValue(msgRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const messages = Object.entries(data)
        .map(([id, msg]) => ({ id, ...msg }))
        .sort((a, b) => a.timestamp - b.timestamp);
      callback(messages);
    } else {
      callback([]);
    }
  });
  return () => off(msgRef);
};

// ─── STREAM PRESENCE ──────────────────────────────────────────────────────────

export const setStreamLive = async (roomId, streamInfo) => {
  await set(ref(realtimeDb, `rooms/${roomId}/stream`), {
    ...streamInfo,
    isLive: true,
    startedAt: Date.now(),
  });
};

export const setStreamOffline = async (roomId) => {
  await set(ref(realtimeDb, `rooms/${roomId}/stream`), { isLive: false });
  await remove(ref(realtimeDb, `rooms/${roomId}/signaling`));
};

export const subscribeToStream = (roomId, callback) => {
  const streamRef = ref(realtimeDb, `rooms/${roomId}/stream`);
  onValue(streamRef, (snap) => callback(snap.val()));
  return () => off(streamRef);
};

export const addViewer = async (roomId) => {
  const vRef = push(ref(realtimeDb, `rooms/${roomId}/viewers`));
  await set(vRef, true);
  return vRef.key;
};

export const removeViewer = async (roomId, viewerKey) => {
  if (viewerKey) await remove(ref(realtimeDb, `rooms/${roomId}/viewers/${viewerKey}`));
};

export const subscribeToViewerCount = (roomId, callback) => {
  const vRef = ref(realtimeDb, `rooms/${roomId}/viewers`);
  onValue(vRef, (snap) => {
    callback(snap.val() ? Object.keys(snap.val()).length : 0);
  });
  return () => off(vRef);
};

// ─── WebRTC BROADCASTER (Faculty) ─────────────────────────────────────────────

export class WebRTCBroadcaster {
  constructor(roomId) {
    this.roomId = roomId;
    this.peers = {};      // viewerId -> RTCPeerConnection
    this.localStream = null;
    this._cleanups = [];
  }

  /** Start real webcam + microphone */
  async startCamera(constraints = { video: { width: 1280, height: 720 }, audio: true }) {
    this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
    return this.localStream;
  }

  /** Replace video track with screen share */
  async startScreenShare() {
    const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
    const newVideoTrack = screenStream.getVideoTracks()[0];

    // Replace in all existing peer connections
    for (const pc of Object.values(this.peers)) {
      const sender = pc.getSenders().find(s => s.track?.kind === 'video');
      if (sender) await sender.replaceTrack(newVideoTrack);
    }

    // Replace in local stream (for local preview)
    const oldTrack = this.localStream?.getVideoTracks()[0];
    if (oldTrack) {
      this.localStream.removeTrack(oldTrack);
      oldTrack.stop();
    }
    this.localStream?.addTrack(newVideoTrack);

    // Auto-switch back when user stops sharing
    newVideoTrack.onended = () => this.stopScreenShare();

    return this.localStream;
  }

  async stopScreenShare() {
    try {
      const camStream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } });
      const newVideoTrack = camStream.getVideoTracks()[0];
      for (const pc of Object.values(this.peers)) {
        const sender = pc.getSenders().find(s => s.track?.kind === 'video');
        if (sender) await sender.replaceTrack(newVideoTrack);
      }
      const oldTrack = this.localStream?.getVideoTracks()[0];
      if (oldTrack) { this.localStream.removeTrack(oldTrack); oldTrack.stop(); }
      this.localStream?.addTrack(newVideoTrack);
    } catch (err) {
      console.error('Error switching back to camera:', err);
    }
  }

  /** Listen for new viewer offers and respond with answers */
  listenForViewers() {
    const offersRef = ref(realtimeDb, `rooms/${this.roomId}/signaling/offers`);

    // Use onChildAdded so we only process each offer ONCE
    const unsub = onChildAdded(offersRef, async (snap) => {
      const viewerId = snap.key;
      const offer = snap.val();
      if (!offer || this.peers[viewerId]) return;

      console.log('Broadcaster: new viewer offer from', viewerId);
      await this._createAnswerForViewer(viewerId, offer);
    });

    this._cleanups.push(() => off(offersRef));
  }

  async _createAnswerForViewer(viewerId, offer) {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    this.peers[viewerId] = pc;

    // Add all local tracks to this peer connection
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        pc.addTrack(track, this.localStream);
      });
    }

    // Forward ICE candidates to this viewer's bucket in Firebase
    pc.onicecandidate = async (event) => {
      if (event.candidate) {
        await push(
          ref(realtimeDb, `rooms/${this.roomId}/signaling/broadcaster_ice/${viewerId}`),
          event.candidate.toJSON()
        );
      }
    };

    pc.onconnectionstatechange = () => {
      console.log(`Viewer ${viewerId} connection: ${pc.connectionState}`);
      if (pc.connectionState === 'failed') {
        pc.restartIce();
      }
    };

    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    // Write answer to Firebase for this viewer to pick up
    await set(
      ref(realtimeDb, `rooms/${this.roomId}/signaling/answers/${viewerId}`),
      { type: answer.type, sdp: answer.sdp }
    );

    // Listen for this viewer's ICE candidates
    const viewerIceRef = ref(realtimeDb, `rooms/${this.roomId}/signaling/viewer_ice/${viewerId}`);
    onChildAdded(viewerIceRef, (snap) => {
      const candidate = snap.val();
      if (candidate) {
        pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(err =>
          console.warn('Broadcaster addIceCandidate error:', err)
        );
      }
    });
  }

  toggleMute(muted) {
    this.localStream?.getAudioTracks().forEach(t => { t.enabled = !muted; });
  }

  toggleCamera(off) {
    this.localStream?.getVideoTracks().forEach(t => { t.enabled = !off; });
  }

  destroy() {
    this._cleanups.forEach(fn => fn());
    Object.values(this.peers).forEach(pc => pc.close());
    this.localStream?.getTracks().forEach(t => t.stop());
    this.localStream = null;
    this.peers = {};
  }
}

// ─── WebRTC VIEWER (Student) ──────────────────────────────────────────────────

export class WebRTCViewer {
  constructor(roomId, viewerId) {
    this.roomId = roomId;
    this.viewerId = viewerId;
    this.pc = null;
    this.onRemoteStream = null; // callback(stream) set by component
  }

  async connect() {
    this.pc = new RTCPeerConnection(ICE_SERVERS);

    // KEY FIX: Assign the real stream directly when tracks arrive
    this.pc.ontrack = (event) => {
      console.log('Viewer: got remote track', event.track.kind);
      if (event.streams && event.streams[0]) {
        // Call back into the component to set the video srcObject
        this.onRemoteStream?.(event.streams[0]);
      }
    };

    this.pc.oniceconnectionstatechange = () => {
      console.log('Viewer ICE state:', this.pc.iceConnectionState);
    };

    this.pc.onconnectionstatechange = () => {
      console.log('Viewer connection state:', this.pc.connectionState);
    };

    // Send ICE candidates to broadcaster
    this.pc.onicecandidate = async (event) => {
      if (event.candidate) {
        await push(
          ref(realtimeDb, `rooms/${this.roomId}/signaling/viewer_ice/${this.viewerId}`),
          event.candidate.toJSON()
        );
      }
    };

    // Create offer requesting both audio+video from broadcaster
    const offer = await this.pc.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
    });
    await this.pc.setLocalDescription(offer);

    // Write offer to Firebase
    await set(
      ref(realtimeDb, `rooms/${this.roomId}/signaling/offers/${this.viewerId}`),
      { type: offer.type, sdp: offer.sdp }
    );

    // Wait for broadcaster's answer
    const answerRef = ref(realtimeDb, `rooms/${this.roomId}/signaling/answers/${this.viewerId}`);
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Broadcaster did not answer in time. Make sure faculty is live.')), 15000);

      const unsub = onValue(answerRef, async (snap) => {
        const answer = snap.val();
        if (!answer) return;
        off(answerRef);
        clearTimeout(timeout);

        try {
          if (this.pc.signalingState !== 'have-local-offer') return;
          await this.pc.setRemoteDescription(new RTCSessionDescription(answer));

          // Listen for broadcaster ICE candidates
          const bcastIceRef = ref(realtimeDb, `rooms/${this.roomId}/signaling/broadcaster_ice/${this.viewerId}`);
          onChildAdded(bcastIceRef, (snap) => {
            const candidate = snap.val();
            if (candidate) {
              this.pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(err =>
                console.warn('Viewer addIceCandidate error:', err)
              );
            }
          });

          resolve();
        } catch (err) {
          reject(err);
        }
      });
    });
  }

  destroy() {
    this.pc?.close();
    this.pc = null;
  }
}
