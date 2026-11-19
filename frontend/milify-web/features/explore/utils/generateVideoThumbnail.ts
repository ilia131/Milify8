export function generateVideoThumbnail(videoUrl: string): Promise<string> {
  if (!videoUrl) return Promise.resolve("");

  return new Promise((resolve) => {
    const video = document.createElement("video");
    const timeout = window.setTimeout(() => finish(""), 8_000);
    const finish = (image: string) => {
      window.clearTimeout(timeout);
      video.onloadeddata = null;
      video.onerror = null;
      video.removeAttribute("src");
      video.load();
      resolve(image);
    };

    video.preload = "auto";
    video.crossOrigin = "anonymous";
    video.onerror = () => finish("");
    video.onloadeddata = () => {
      if (!video.videoWidth || !video.videoHeight) return finish("");
      const canvas = document.createElement("canvas");
      const scale = Math.min(320 / video.videoWidth, 320 / video.videoHeight, 1);
      canvas.width = Math.max(1, Math.round(video.videoWidth * scale));
      canvas.height = Math.max(1, Math.round(video.videoHeight * scale));

      try {
        canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height);
        finish(canvas.toDataURL("image/jpeg", 0.75));
      } catch {
        finish("");
      }
    };
    video.src = videoUrl;
  });
}
