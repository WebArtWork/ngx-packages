import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';

/**
 * RtcService handles WebRTC peer connections and local media stream setup.
 * It provides functionality to initialize the user's camera/microphone,
 * manage multiple peer connections, and handle offer/answer negotiation.
 */
@Injectable({ providedIn: 'root' })
export class RtcService {
	private readonly _isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
	private _peers = new Map<string, RTCPeerConnection>();
	private _localStream: MediaStream | null = null;

	async initLocalStream(): Promise<MediaStream> {
		if (!this._isBrowser) {
			throw new Error('RTC is not available during SSR.');
		}

		if (!this._localStream) {
			this._localStream = await navigator.mediaDevices.getUserMedia({
				video: true,
				audio: true,
			});
		}

		return this._localStream;
	}

	async createPeer(id: string): Promise<RTCPeerConnection> {
		if (!this._isBrowser) {
			throw new Error('RTC is not available during SSR.');
		}

		const peer = new RTCPeerConnection();

		this._localStream?.getTracks().forEach(track => peer.addTrack(track, this._localStream!));

		this._peers.set(id, peer);

		return peer;
	}

	getPeer(id: string): RTCPeerConnection | undefined {
		return this._peers.get(id);
	}

	async createOffer(id: string): Promise<RTCSessionDescriptionInit> {
		if (!this._isBrowser) {
			throw new Error('RTC is not available during SSR.');
		}

		const peer = this._peers.get(id);

		if (!peer) {
			throw new Error('Peer not found');
		}

		const offer = await peer.createOffer();

		await peer.setLocalDescription(offer);

		return offer;
	}

	async createAnswer(
		id: string,
		offer: RTCSessionDescriptionInit,
	): Promise<RTCSessionDescriptionInit> {
		if (!this._isBrowser) {
			throw new Error('RTC is not available during SSR.');
		}

		const peer = this._peers.get(id);

		if (!peer) {
			throw new Error('Peer not found');
		}

		await peer.setRemoteDescription(new RTCSessionDescription(offer));

		const answer = await peer.createAnswer();

		await peer.setLocalDescription(answer);

		return answer;
	}

	async setRemoteAnswer(id: string, answer: RTCSessionDescriptionInit): Promise<void> {
		if (!this._isBrowser) {
			throw new Error('RTC is not available during SSR.');
		}

		const peer = this._peers.get(id);

		if (!peer) {
			throw new Error('Peer not found');
		}

		await peer.setRemoteDescription(new RTCSessionDescription(answer));
	}

	addIceCandidate(id: string, candidate: RTCIceCandidateInit): void {
		if (!this._isBrowser) {
			return;
		}

		const peer = this._peers.get(id);

		if (peer) {
			void peer.addIceCandidate(new RTCIceCandidate(candidate));
		}
	}

	getLocalStream(): MediaStream | null {
		return this._localStream;
	}

	closePeer(id: string): void {
		const peer = this._peers.get(id);

		if (!peer) {
			return;
		}

		peer.close();
		this._peers.delete(id);
	}

	closeAll(): void {
		this._peers.forEach(peer => peer.close());
		this._peers.clear();
		this._localStream?.getTracks().forEach(track => track.stop());
		this._localStream = null;
	}
}
