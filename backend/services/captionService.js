const { AssemblyAI } = require('assemblyai');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');

const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY
});

// Extract audio from video
const extractAudio = (videoPath) => {
  return new Promise((resolve, reject) => {
    const audioPath = videoPath.replace(/\.(mp4|mov|avi|mkv)$/i, '.mp3');
    
    console.log('🎵 Extracting audio from:', videoPath);
    
    ffmpeg(videoPath)
      .output(audioPath)
      .audioCodec('libmp3lame')
      .on('start', (cmd) => {
        console.log('▶️ FFmpeg command:', cmd);
      })
      .on('progress', (progress) => {
        console.log(`⏳ Processing: ${progress.percent?.toFixed(2)}%`);
      })
      .on('end', () => {
        console.log('✅ Audio extracted successfully:', audioPath);
        resolve(audioPath);
      })
      .on('error', (err) => {
        console.error('❌ Audio extraction error:', err.message);
        reject(err);
      })
      .run();
  });
};

// Generate captions using AssemblyAI
const generateCaptions = async (videoPath) => {
  try {
    console.log('\n🎬 Starting caption generation for:', videoPath);
    console.log('⏰ Time:', new Date().toLocaleString());

    // Step 1: Extract audio from video
    console.log('\n📝 Step 1: Extracting audio...');
    const audioPath = await extractAudio(videoPath);

    // Step 2: Upload audio to AssemblyAI and transcribe
    console.log('\n☁️ Step 2: Uploading to AssemblyAI and transcribing...');
    const transcript = await client.transcripts.transcribe({
      audio: audioPath,
      speaker_labels: false,
      language_code: 'en', // Change if needed (hi, es, fr, etc.)
    });

    if (transcript.status === 'error') {
      throw new Error(`Transcription failed: ${transcript.error}`);
    }

    console.log('✅ Transcription completed!');
    console.log(`📊 Confidence: ${(transcript.confidence * 100).toFixed(2)}%`);
    console.log(`🔤 Words transcribed: ${transcript.words?.length || 0}`);

    // Step 3: Convert to SRT format (subtitle format)
    console.log('\n💬 Step 3: Converting to SRT format...');
    const srtContent = convertToSRT(transcript.words);

    // Step 4: Save SRT file
    const srtPath = videoPath.replace(/\.(mp4|mov|avi|mkv)$/i, '.srt');
    fs.writeFileSync(srtPath, srtContent, 'utf8');
    console.log('✅ Captions saved:', srtPath);

    // Step 5: Also save VTT format (for HTML5 video)
    const vttPath = videoPath.replace(/\.(mp4|mov|avi|mkv)$/i, '.vtt');
    const vttContent = convertToVTT(transcript.words);
    fs.writeFileSync(vttPath, vttContent, 'utf8');
    console.log('✅ VTT captions saved:', vttPath);

    // Step 6: Clean up temporary audio file
    if (fs.existsSync(audioPath)) {
      fs.unlinkSync(audioPath);
      console.log('🗑️ Temporary audio file deleted');
    }

    console.log('\n🎉 Caption generation completed successfully!\n');

    return {
      success: true,
      srtPath,
      vttPath,
      transcript: transcript.text,
      confidence: transcript.confidence,
      wordCount: transcript.words?.length || 0
    };
  } catch (error) {
    console.error('\n❌ Caption generation error:', error.message);
    console.error('Stack:', error.stack);
    throw error;
  }
};

// Convert AssemblyAI words to SRT format
const convertToSRT = (words) => {
  if (!words || words.length === 0) {
    return '';
  }

  let srtContent = '';
  let captionIndex = 1;
  let currentCaption = [];
  let currentStart = null;
  let currentEnd = null;
  const maxWordsPerCaption = 8; // Words per subtitle line
  const maxCharsPerCaption = 42; // Max characters per line

  words.forEach((word, index) => {
    if (currentCaption.length === 0) {
      currentStart = word.start;
    }

    currentCaption.push(word.text);
    currentEnd = word.end;

    const captionText = currentCaption.join(' ');

    // Create new caption if limit reached or end of words
    if (
      currentCaption.length >= maxWordsPerCaption || 
      captionText.length >= maxCharsPerCaption || 
      index === words.length - 1
    ) {
      const startTime = formatSRTTime(currentStart);
      const endTime = formatSRTTime(currentEnd);

      srtContent += `${captionIndex}\n`;
      srtContent += `${startTime} --> ${endTime}\n`;
      srtContent += `${captionText}\n\n`;

      captionIndex++;
      currentCaption = [];
    }
  });

  return srtContent;
};

// Convert AssemblyAI words to VTT format (for HTML5 video)
const convertToVTT = (words) => {
  if (!words || words.length === 0) {
    return 'WEBVTT\n\n';
  }

  let vttContent = 'WEBVTT\n\n';
  let currentCaption = [];
  let currentStart = null;
  let currentEnd = null;
  const maxWordsPerCaption = 8;
  const maxCharsPerCaption = 42;

  words.forEach((word, index) => {
    if (currentCaption.length === 0) {
      currentStart = word.start;
    }

    currentCaption.push(word.text);
    currentEnd = word.end;

    const captionText = currentCaption.join(' ');

    if (
      currentCaption.length >= maxWordsPerCaption || 
      captionText.length >= maxCharsPerCaption || 
      index === words.length - 1
    ) {
      const startTime = formatVTTTime(currentStart);
      const endTime = formatVTTTime(currentEnd);

      vttContent += `${startTime} --> ${endTime}\n`;
      vttContent += `${captionText}\n\n`;

      currentCaption = [];
    }
  });

  return vttContent;
};

// Format time for SRT (HH:MM:SS,mmm)
const formatSRTTime = (milliseconds) => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const ms = milliseconds % 1000;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')},${String(ms).padStart(3, '0')}`;
};

// Format time for VTT (HH:MM:SS.mmm)
const formatVTTTime = (milliseconds) => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const ms = milliseconds % 1000;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(ms).padStart(3, '0')}`;
};

module.exports = {
  generateCaptions
};
