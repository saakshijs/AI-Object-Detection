export const renderPrediction = (predictions, ctx) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.height);
  
    const font = "16px sans-serif";
    ctx.font = font;
    ctx.textBaseline = "top";
  
    // Group predictions by class
    const classCount = {};
    predictions.forEach((prediction) => {
      const objectClass = prediction["class"];
      if (classCount[objectClass]) {
        classCount[objectClass]++;
      } else {
        classCount[objectClass] = 1;
      }
    });
  
    predictions.forEach((prediction) => {
      const [x, y, width, height] = prediction["bbox"];
      const objectClass = prediction["class"];
      const isPerson = objectClass === "person";
  
      // Handle pluralization
      const objectName = classCount[objectClass] > 1 ? objectClass + "s" : objectClass;
  
      ctx.strokeStyle = isPerson ? "#FF0000" : "#00FFFF";
      ctx.lineWidth = 4;
      ctx.strokeRect(x, y, width, height);
  
      ctx.fillStyle = `rgba(255,0,0,${isPerson ? 0.2 : 0})`;
      ctx.fillRect(x, y, width, height);
  
      ctx.fillStyle = isPerson ? "#FF0000" : "#00FFFF";
  
      const textWidth = ctx.measureText(objectName).width;
      const textHeight = parseInt(font, 10);
      ctx.fillRect(x, y, textWidth + 4, textHeight + 4);
  
      ctx.fillStyle = "#000000";
      ctx.fillText(objectName, x, y);
    });
  };
  