'use client'

import { useEffect, useRef, useState } from "react";
import SparklesIcon from "./icons/sparkles";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { transcriptionItemsToSrt } from "@/lib/aws-transcription-helpers";
import roboto from './../fonts/Roboto-Regular.ttf';
import robotoBold from './../fonts/Roboto-Bold.ttf';

const ResultVideo = ({ filename,transcriptionItems }: any) => {
    const videoUrl = "https://captionizer-432.s3.amazonaws.com/" + filename;
    const [loaded, setLoaded] = useState(false);
    const [primaryColor, setPrimaryColor] = useState('#FFFFFF');
    const [outlineColor, setOutlineColor] = useState('#000000');
    const [progress, setProgress] = useState(1);

    const ffmpegRef = useRef(new FFmpeg());
    const videoRef = useRef(null);

    useEffect(() => {
        //@ts-ignore
        videoRef.current.src = videoUrl;
         load()
      }, []);

      const load = async () => {
        const ffmpeg = ffmpegRef.current;
        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.2/dist/umd'
        await ffmpeg.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        });
        await ffmpeg.writeFile('/tmp/Roboto.ttf', await fetchFile(roboto));
        await ffmpeg.writeFile('/tmp/Roboto-Bold.ttf', await fetchFile(robotoBold));
        setLoaded(true);
      }
    
      // CHANGE TEXT COLOR
      function toFFmpegColor(rgb: any) {
        const bgr = rgb.slice(5,7) + rgb.slice(3,5) + rgb.slice(1,3);
        return '&H' + bgr + '&';
      }
    
      const transcode = async () => {
        const ffmpeg = ffmpegRef.current;
        const srt = transcriptionItemsToSrt(transcriptionItems);
        await ffmpeg.writeFile(filename, await fetchFile(videoUrl));
        await ffmpeg.writeFile('subs.srt', srt);
        //@ts-ignore
        videoRef.current.src = videoUrl;
        await new Promise((resolve, reject) => {
            //@ts-ignore
          videoRef.current.onloadedmetadata = resolve;
        });
        //@ts-ignore
        const duration = videoRef.current.duration;
        ffmpeg.on('log', ({ message }) => {
          const regexResult = /time=([0-9:.]+)/.exec(message);
          if (regexResult && regexResult?.[1]) {
            const howMuchIsDone = regexResult?.[1];
            const [hours,minutes,seconds] = howMuchIsDone.split(':');
            //@ts-ignore
            const doneTotalSeconds = hours * 3600 + minutes * 60 + seconds;
            //@ts-ignore
            const videoProgress = doneTotalSeconds / duration;
            setProgress(videoProgress);
          }
        });
        await ffmpeg.exec([
          '-i', filename,
          '-preset', 'ultrafast',
          '-vf', `subtitles=subs.srt:fontsdir=/tmp:force_style='Fontname=Roboto Bold,FontSize=30,MarginV=70,PrimaryColour=${toFFmpegColor(primaryColor)},OutlineColour=${toFFmpegColor(outlineColor)}'`,
          'output.mp4'
        ]);
        const data = await ffmpeg.readFile('output.mp4');
        //@ts-ignore
        videoRef.current.src = URL.createObjectURL(new Blob([data.buffer], {type: 'video/mp4'}));
        setProgress(1);
      }

  return (
    <>
      <div className="mb-4">
          <button onClick={transcode}
           className="bg-indigo-500 text-white py-2 px-4 rounded-md inline-flex gap-2 cursor-pointer">
            <SparklesIcon/>
             Add captions
          </button>
      </div>
      <div>
        primary color:
        <input type="color" value={primaryColor} onChange={ev => setPrimaryColor(ev.target.value)}/>
        <br />
        outline color:
        <input type="color" value={outlineColor} onChange={ev => setOutlineColor(ev.target.value)}/>
      </div>
      <div className="rounded-xl overflow-hidden relative">
        {progress && progress < 1 && (
          <div className="absolute inset-0 bg-black/80 flex items-center">
            <div className="w-full text-center">
              <div className="bg-bg-gradient-from/50 mx-8 rounded-lg overflow-hidden relative">
                <div className="bg-bg-gradient-from h-8"
                     style={{width:progress * 100+'%'}}>
                  <h3 className="text-white text-xl absolute inset-0 py-1">
                    {/* @ts-ignore */}
                    {parseInt(progress * 100)}%
                  </h3>
                </div>
              </div>
            </div>
          </div>
        )}
        <video data-video={0} ref={videoRef} controls/>
      </div>
    </>
  )
}

export default ResultVideo