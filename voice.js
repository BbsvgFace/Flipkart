/* Browser microphone capture. Audio stays in memory; transcription uses the browser service. */
(function(root){
  'use strict';
  let session=null,clip='',state='idle';
  const notify=(s,value)=>{if(session===s)s.change(value)};
  const api={
    get active(){return !!session},
    get state(){return state},
    get clip(){return clip},
    clear(){if(clip)URL.revokeObjectURL(clip);clip=''},
    async start(options){
      if(session)return;
      api.clear();
      const s={...options,stream:null,recorder:null,speech:null,context:null,frame:0,chunks:[],stopping:false,ended:false};
      s.change=value=>{state=value;options.onState(value)};
      session=s;notify(s,'requesting');
      if(!root.isSecureContext||!navigator.mediaDevices?.getUserMedia){session=null;state='idle';options.onError('secure');options.onState('idle');return}
      try{
        const stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true},video:false});
        // A permission prompt may outlive navigation or cancellation.
        if(session!==s){stream.getTracks().forEach(t=>t.stop());return}
        s.stream=stream;s.started=performance.now();
        stream.getAudioTracks().forEach(t=>t.addEventListener('ended',()=>api.stop()));
        try{
          const AC=root.AudioContext||root.webkitAudioContext;
          if(AC){s.context=new AC();await s.context.resume();if(session!==s)return;const analyser=s.context.createAnalyser();analyser.fftSize=256;analyser.smoothingTimeConstant=.78;s.context.createMediaStreamSource(stream).connect(analyser);const samples=new Uint8Array(analyser.fftSize),bands=new Uint8Array(analyser.frequencyBinCount);
            const frame=()=>{if(session!==s||s.stopping)return;analyser.getByteTimeDomainData(samples);analyser.getByteFrequencyData(bands);let energy=0;for(const v of samples)energy+=((v-128)/128)**2;options.onLevel(Math.min(1,Math.sqrt(energy/samples.length)*5),bands,(performance.now()-s.started)/1000);s.frame=requestAnimationFrame(frame)};frame();
          }
        }catch(_){options.onError('meter')}
        if(session!==s)return;
        if(root.MediaRecorder)try{
          s.recorder=new MediaRecorder(stream);
          s.recorder.ondataavailable=e=>{if(e.data.size)s.chunks.push(e.data)};
          s.recorder.onstop=()=>{if(s.discard||session&&session!==s)return;if(s.chunks.length){api.clear();clip=URL.createObjectURL(new Blob(s.chunks,{type:s.recorder.mimeType||s.chunks[0].type}));options.onClip(clip)}};
          s.recorder.start();
        }catch(_){options.onError('playback')}
        const SR=root.SpeechRecognition||root.webkitSpeechRecognition;
        if(SR){
          const speech=s.speech=new SR();speech.lang=options.lang;speech.continuous=true;speech.interimResults=true;
          speech.onresult=e=>{if(session!==s||s.speechFailed)return;const final=[],interim=[];for(const r of e.results)(r.isFinal?final:interim).push(r[0].transcript);options.onTranscript(final.join(' '),interim.join(' '))};
          speech.onerror=e=>{if(session!==s||s.stopping)return;if(e.error==='aborted')return;s.speechFailed=true;options.onError(e.error);notify(s,'audio-only')};
          speech.onend=()=>{s.ended=true;if(session!==s)return;if(s.stopping)finish(s);else if(!s.speechFailed){options.onError('speech-ended');notify(s,'audio-only')}};
          try{speech.start();notify(s,'listening')}catch(_){options.onError('speech-unavailable');notify(s,'audio-only')}
        }else{options.onError('unsupported');notify(s,'audio-only')}
        s.limit=setTimeout(()=>{if(session===s){options.onError('limit');api.stop()}},120000);
      }catch(e){if(session!==s)return;release(s);session=null;state='idle';options.onError(e.name||'unavailable');options.onState('idle')}
    },
    stop(discard=false){
      const s=session;if(!s)return;
      s.discard=discard;s.stopping=true;clearTimeout(s.limit);cancelAnimationFrame(s.frame);
      if(s.recorder?.state==='recording')s.recorder.stop();
      if(discard||!s.speech||s.ended){if(s.speech)try{s.speech.abort()}catch(_){}finish(s);return}
      notify(s,'finishing');
      // stop() allows the last recognition result to arrive; abort() would lose it.
      try{s.speech.stop()}catch(_){finish(s)}
      s.finishTimer=setTimeout(()=>finish(s),1800);
      if(discard)api.clear();
    }
  };
  function release(s){clearTimeout(s.limit);clearTimeout(s.finishTimer);cancelAnimationFrame(s.frame);s.stream?.getTracks().forEach(t=>t.stop());if(s.context&&s.context.state!=='closed')s.context.close().catch(()=>{})}
  function finish(s){release(s);if(session!==s)return;if(s.speech){s.speech.onresult=null;s.speech.onend=null;s.speech.onerror=null;try{s.speech.abort()}catch(_){}}session=null;state='idle';s.onState('idle')}
  root.SaathVoice=api;
})(window);
