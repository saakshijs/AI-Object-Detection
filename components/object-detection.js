"use client";
import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { load as cocossdload } from "@tensorflow-models/coco-ssd";
import * as tf from "@tensorflow/tfjs";
import { renderPrediction } from "@/utils/render-predictions";

const ObjectDetection = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isVideoFile, setIsVideoFile] = useState(false);
  const [videoSrc, setVideoSrc] = useState(null);
  const [net, setNet] = useState(null);
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const videoRef = useRef(null);

  let detectInterval;

  // Load the model
  const loadModel = async () => {
    setIsLoading(true);
    const loadedNet = await cocossdload();
    setNet(loadedNet);
    setIsLoading(false);
  };

  // Start object detection
  const startObjectDetection = async () => {
    const videoElement = isVideoFile ? videoRef.current : webcamRef.current?.video;

    if (!videoElement || !canvasRef.current) {
      return; // Exit if video element or canvas is not ready
    }

    // Ensure video is ready to be used
    if (videoElement.readyState === 4) {
      // Set canvas dimensions
      canvasRef.current.width = videoElement.videoWidth;
      canvasRef.current.height = videoElement.videoHeight;

      // Perform object detection
      const detectedObjects = await net.detect(videoElement);
      const context = canvasRef.current.getContext("2d");
      renderPrediction(detectedObjects, context);
    }
  };

  // Handle video file upload
  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const videoURL = URL.createObjectURL(file);
      setVideoSrc(videoURL);
      setIsVideoFile(true);
    }
  };

  // Handle video play event
  const handleVideoPlay = () => {
    if (detectInterval) clearInterval(detectInterval);
    startObjectDetection();
    detectInterval = setInterval(() => startObjectDetection(), 100); // Run detection every 100ms
  };

  // Handle video pause/stop
  const handleVideoPause = () => {
    if (detectInterval) clearInterval(detectInterval);
    const context = canvasRef.current.getContext("2d");
    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  // Clean up the intervals when component unmounts
  useEffect(() => {
    return () => {
      if (detectInterval) clearInterval(detectInterval);
    };
  }, []);

  // Load the COCO-SSD model when component mounts
  useEffect(() => {
    loadModel();
  }, []);

  // Start detection for webcam if video file is not used and net is loaded
  useEffect(() => {
    if (!isVideoFile && net && webcamRef.current) {
      detectInterval = setInterval(() => startObjectDetection(), 100);
    }
    return () => clearInterval(detectInterval); // Cleanup interval on unmount or change
  }, [isVideoFile, net]);

  return (
    <div className="mt-8">
      {isLoading ? (
        <div className="gradient-text">LOADING AI MODEL....</div>
      ) : (
        <>
          <div className="relative flex justify-center gradient p-1.5 rounded-md">
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 z-99999 w-full lg:h-[720px]"
            />
            {!isVideoFile ? (
              <Webcam ref={webcamRef} className="rounded-md w-full lg:h-[720px]" />
            ) : (
              <video
                ref={videoRef}
                controls
                src={videoSrc}
                className="rounded-md w-full lg:h-[720px]"
                onPlay={handleVideoPlay}
                onPause={handleVideoPause}
                onEnded={handleVideoPause}
              />
            )}
          </div>
          <input type="file" accept="video/*" onChange={handleVideoUpload} />
        </>
      )}
    </div>
  );
};

export default ObjectDetection;
