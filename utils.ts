
import { PERSONA_INSTRUCTIONS } from './constants';
import { Blob as GenAIBlob } from '@google/genai';

export const formatCurrency = (amount: number) => {
    if (amount >= 100000000000) { // If > 11 digits (100 Billion)
        return amount.toExponential(2).replace('+', '');
    }
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
};

export const formatNumberInput = (value: string | number) => {
    const numString = String(value).replace(/[^0-9]/g, '');
    if (numString === '') return '';
    return new Intl.NumberFormat('id-ID').format(Number(numString));
};

export const getRawNumber = (value: string) => Number(value.replace(/[^0-9]/g, ''));

export const fileToBase64 = (file: File | Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = error => reject(error);
    });
};

export const getApiKey = (): string => {
    let key = '';
    try {
        if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
            key = process.env.API_KEY;
        }
    } catch (e) {}

    if (!key) {
        try {
            // @ts-ignore
            if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_KEY) {
                // @ts-ignore
                key = import.meta.env.VITE_API_KEY;
            }
        } catch (e) {}
    }
    return key;
};

export const getSystemInstruction = (personaId?: string): string => {
    const base = PERSONA_INSTRUCTIONS[personaId || 'default'] || PERSONA_INSTRUCTIONS['default'];
    return `${base} Jawablah selalu dalam Bahasa Indonesia.`;
};

// --- Audio Utility functions ---
export function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function createBlob(data: Float32Array): GenAIBlob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

// --- Encryption Utilities ---
const SECRET_SALT = "ANGGARAN_SECURE_KEY_X9"; 

export const encryptData = (data: any): string => {
    try {
        const jsonStr = JSON.stringify(data);
        // Encode to URI component to handle Unicode/Emoji correctly
        const uriEncoded = encodeURIComponent(jsonStr);
        
        let result = '';
        for (let i = 0; i < uriEncoded.length; i++) {
            result += String.fromCharCode(uriEncoded.charCodeAt(i) ^ SECRET_SALT.charCodeAt(i % SECRET_SALT.length));
        }
        return btoa(result);
    } catch (e) {
        console.error("Encryption failed", e);
        throw new Error("Gagal mengenkripsi data");
    }
};

export const decryptData = (cipherText: string): any => {
    try {
        const decoded = atob(cipherText);
        let result = '';
        for (let i = 0; i < decoded.length; i++) {
            result += String.fromCharCode(decoded.charCodeAt(i) ^ SECRET_SALT.charCodeAt(i % SECRET_SALT.length));
        }
        // Decode back from URI component
        const jsonStr = decodeURIComponent(result);
        return JSON.parse(jsonStr);
    } catch (e) {
        console.error("Decryption failed", e);
        throw new Error("File data rusak atau tidak valid.");
    }
};
