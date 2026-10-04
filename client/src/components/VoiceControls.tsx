import React, { useState } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { useVoice } from '../hooks/useVoice';

interface VoiceControlsProps {
  onSendMessage: (transcript: string) => void;
  lastAssistantMessage?: string;
}

export const VoiceControls: React.FC<VoiceControlsProps> = ({
  onSendMessage,
  lastAssistantMessage,
}) => {
  const [autoSpeak, setAutoSpeak] = useState(true);

  const {
    isListening,
    isSpeaking,
    isSupported,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
  } = useVoice({
    onTranscript: (transcript) => {
      if (transcript.trim()) {
        onSendMessage(transcript);
      }
    },
  });

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      if (isSpeaking) stopSpeaking();
      startListening();
    }
  };

  const toggleSpeechPlayback = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else if (lastAssistantMessage) {
      speak(lastAssistantMessage);
    }
  };

  return (
    <div className="flex items-center gap-3">
      {/* Voice Status Indicator */}
      <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs">
        <span
          className={`w-2 h-2 rounded-full ${
            isListening
              ? 'bg-red-500 animate-ping'
              : isSpeaking
              ? 'bg-cyan-400 animate-pulse'
              : 'bg-emerald-500'
          }`}
        />
        <span className="text-slate-300 font-medium">
          {isListening ? 'Listening to voice...' : isSpeaking ? 'AI Speaking...' : 'Voice Ready'}
        </span>
      </div>

      {/* Main Microphone Action Button */}
      <button
        type="button"
        onClick={toggleListening}
        disabled={!isSupported}
        title={isSupported ? 'Click to speak' : 'Voice input not supported in this browser'}
        className={`relative p-3 rounded-full transition-all flex items-center justify-center ${
          isListening
            ? 'bg-red-600 text-white shadow-lg shadow-red-500/40 ring-4 ring-red-500/20 scale-105'
            : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
        }`}
      >
        {isListening ? (
          <div className="relative">
            <MicOff className="w-5 h-5 animate-pulse" />
            <div className="absolute -top-1 -right-1 flex gap-0.5">
              <span className="w-1 h-3 bg-white rounded-full animate-wave1" />
              <span className="w-1 h-4 bg-white rounded-full animate-wave2" />
              <span className="w-1 h-2 bg-white rounded-full animate-wave3" />
            </div>
          </div>
        ) : (
          <Mic className="w-5 h-5 text-indigo-400" />
        )}
      </button>

      {/* Text-to-Speech playback button */}
      <button
        type="button"
        onClick={toggleSpeechPlayback}
        title={isSpeaking ? 'Mute AI voice' : 'Read aloud last message'}
        className={`p-3 rounded-full transition-colors ${
          isSpeaking
            ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/30'
            : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
        }`}
      >
        {isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 text-cyan-400" />}
      </button>
    </div>
  );
};
