import React, { useState, useEffect, useRef } from 'react';
import './styles/App.css';
import * as Tone from 'tone';
import * as tf from '@tensorflow/tfjs';

interface Instrument {
  name: string;
  type: string;
  sound: string;
}

const instruments: Instrument[] = [
  { name: 'Sitar', type: 'string', sound: 'sitar' },
  { name: 'Tabla', type: 'percussion', sound: 'tabla' },
  { name: 'Flute', type: 'wind', sound: 'flute' },
  { name: 'Tanpura', type: 'string', sound: 'tanpura' },
];

const App: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [selectedInstrument, setSelectedInstrument] = useState<Instrument | null>(null);
  const [recognizedRaga, setRecognizedRaga] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Initialize Tone.js
    Tone.start();
    
    // Initialize TensorFlow.js
    tf.setBackend('webgl');
    
    // Initialize Audio Context
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    return () => {
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await analyzeAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const analyzeAudio = async (audioBlob: Blob) => {
    // Here you would implement the AI model to analyze the audio
    // For now, we'll just simulate the analysis
    setTimeout(() => {
      setRecognizedRaga('Raga Bhairavi');
    }, 1000);
  };

  const generateMusic = async () => {
    if (!selectedInstrument) return;
    
    setIsGenerating(true);
    
    // Create a synth with the selected instrument's characteristics
    const synth = new Tone.Synth().toDestination();
    
    // Generate a simple melody based on the recognized raga
    const notes = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4'];
    const sequence = new Tone.Sequence((time, note) => {
      synth.triggerAttackRelease(note, '8n', time);
    }, notes, '4n');
    
    sequence.start();
    Tone.Transport.start();
    
    // Stop after 8 seconds
    setTimeout(() => {
      Tone.Transport.stop();
      setIsGenerating(false);
    }, 8000);
  };

  return (
    <div className="container">
      <header className="header">
        <h1>RaagAI</h1>
        <p>Indian Classical Music Recognition and Generation</p>
      </header>

      <div className="main-content">
        <div className="card">
          <h2>Music Recognition</h2>
          <div className="audio-controls">
            <button 
              className="btn" 
              onClick={isRecording ? stopRecording : startRecording}
            >
              {isRecording ? 'Stop Recording' : 'Start Recording'}
            </button>
          </div>
          {recognizedRaga && (
            <div className="recognized-raga">
              <h3>Recognized Raga: {recognizedRaga}</h3>
            </div>
          )}
        </div>

        <div className="card">
          <h2>Music Generation</h2>
          <div className="instrument-grid">
            {instruments.map((instrument) => (
              <div
                key={instrument.name}
                className={`instrument-item ${selectedInstrument?.name === instrument.name ? 'selected' : ''}`}
                onClick={() => setSelectedInstrument(instrument)}
              >
                {instrument.name}
              </div>
            ))}
          </div>
          <button
            className="btn"
            onClick={generateMusic}
            disabled={!selectedInstrument || isGenerating}
          >
            {isGenerating ? 'Generating...' : 'Generate Music'}
          </button>
        </div>
      </div>

      <canvas ref={canvasRef} className="visualization-canvas" />
    </div>
  );
};

export default App; 