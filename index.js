import { canvas } from "./canvas";

const canvaser = document.getElementById('imageProcessed');

// Load image drag and drop
document.getElementById("dragAndDropZone").addEventListener("dragover", (e) => {
  e.preventDefault();
  console.log("dragover event triggered");
});

document.getElementById("dragAndDropZone").addEventListener("drop", (e) => {
  e.preventDefault();

  function loadImage(src) {
    const image = new Image();
    image.src = src;
    image.onload = () => {
      document.querySelector(".drag-helper").classList.add("invisible");
      document.getElementById("controls").classList.remove("no-events");
      canvas.drawImage(image);
    };
  }

  const file = e.dataTransfer.files[0];
  if (file) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      loadImage(e.target.result);
    };
  }

  const url = e.dataTransfer.getData("url");
  if (url) loadImage(url);
});

// Drawings
document.getElementById("ellipseDraw").addEventListener("click", () => {
  canvaser.style.cursor = 'crosshair';
  canvas.performWhileMouseDown(() => {
    const image = new Image();
    let x0, y0, position;

    const onmousedown = ({ pageX, pageY }) => {
      position = canvas.getPosition();
      x0 = pageX - position.left;
      y0 = pageY - position.top;
      image.src = canvas.getOctetStream();
    };

    const onmousemove = ({ pageX, pageY }) => {
      canvas.drawWithoutCommit((context) => {
        const { width, height } = canvas.getSize();
        context.drawImage(image, 0, 0, width, height);
        const x = pageX - position.left;
        const y = pageY - position.top;

        context.beginPath();
        context.moveTo(x0, y0 + (y - y0) / 2);
        context.bezierCurveTo(x0, y0, x, y0, x, y0 + (y - y0) / 2);
        context.bezierCurveTo(x, y, x0, y, x0, y0 + (y - y0) / 2);
        context.closePath();
        context.stroke();
      });
    };
    return { onmousedown, onmousemove };
  });
});

document.getElementById("rectangleDraw").addEventListener("click", () => {
  canvaser.style.cursor = 'crosshair';
  canvas.performWhileMouseDown(() => {
    const image = new Image();
    let startX, startY, position;

    const onmousedown = ({ pageX, pageY }) => {
      position = canvas.getPosition();
      // save the starting x/y of the rectangle
      startX = pageX - position.left;
      startY = pageY - position.top;
      image.src = canvas.getOctetStream();
    };

    const onmousemove = ({ pageX, pageY }) => {
      const mouseX = pageX - position.left;
      const mouseY = pageY - position.top;
      const width = mouseX - startX;
      const height = mouseY - startY;

      canvas.drawWithoutCommit((context) => {
        // Draw the initial image on the canvas
        // to get rid of the previous rectangle
        const canvasSize = canvas.getSize();
        context.drawImage(image, 0, 0, canvasSize.width, canvasSize.height);

        if (!width || !height) return;
        context.strokeRect(startX, startY, width, height);
      });
    };
    return { onmousedown, onmousemove };
  });
});

document.getElementById("penDraw").addEventListener("click", () => {
  canvaser.style.cursor = 'crosshair';
  canvas.performWhileMouseDown(() => {
    const onmousedown = ({ offsetX, offsetY }) => {
      canvas.drawWithoutCommit((context) => {
        context.beginPath();
        context.moveTo(offsetX, offsetY);
      });
    };

    const onmousemove = (event) => {
      canvas.drawWithoutCommit((context) => {
        context.lineTo(event.offsetX, event.offsetY);
        context.stroke();
      });
    };
    return { onmousedown, onmousemove };
  });
});

document.getElementById("lineDraw").addEventListener("click", () => {
  canvaser.style.cursor = 'crosshair';
  canvas.performWhileMouseDown(() => {
    const image = new Image();
    let x, y, position;

    const onmousedown = ({ pageX, pageY }) => {
      position = canvas.getPosition();
      x = pageX - position.left;
      y = pageY - position.top;
      image.src = canvas.getOctetStream();
    };

    const onmousemove = ({ pageX, pageY }) => {
      canvas.drawWithoutCommit((context) => {
        const canvasSize = canvas.getSize();
        context.drawImage(image, 0, 0, canvasSize.width, canvasSize.height);
        context.beginPath();
        context.moveTo(x, y);
        context.lineTo(pageX - position.left, pageY - position.top);
        context.stroke();
        context.closePath();
      });
    };

    return { onmousedown, onmousemove };
  });
});

// Crop
document.getElementById("cropButton").addEventListener("click", () => {
  canvaser.style.cursor = 'crosshair';
  canvas.performWhileMouseDown(() => {
    const image = new Image();
    let startX, startY, position, width, height;

    const onmousedown = ({ pageX, pageY }) => {
      position = canvas.getPosition();
      // save the starting x/y of the rectangle
      startX = pageX - position.left;
      startY = pageY - position.top;
      image.src = canvas.getOctetStream();
    };

    const onmousemove = ({ pageX, pageY }) => {
      const mouseX = pageX - position.left;
      const mouseY = pageY - position.top;
      width = mouseX - startX;
      height = mouseY - startY;

      canvas.drawWithoutCommit((context) => {
        // Draw the initial image on the canvas
        // to get rid of the previous rectangle
        const canvasSize = canvas.getSize();
        context.drawImage(image, 0, 0, canvasSize.width, canvasSize.height);

        if (!width || !height) return;
        context.strokeRect(startX, startY, width, height);
      });
    };

    const onmouseup = () => {
      canvas.drawWithoutCommit((context) => {
        const absoluteWidth = Math.abs(width);
        const absoluteHeight = Math.abs(height);
        canvas.resize({ width: absoluteWidth, height: absoluteHeight });
        context.drawImage(
          image,
          startX,
          startY,
          width,
          height,
          0,
          0,
          absoluteWidth,
          absoluteHeight
        );
      });
    };
    return { onmousedown, onmousemove, onmouseup };
  });
});

// Resize modal
const modal = new bootstrap.Modal(document.getElementById("resolutionModal"));
document
  .getElementById("resolutionModal")
  .addEventListener("show.bs.modal", () => {
    const image = new Image();
    const widthInput = document.getElementById("width-size");
    const heightInput = document.getElementById("height-size");
    const ratioCheckbox = document.getElementById("checkbox-img-ratio");

    // Update values with current resolution
    const canvasSize = canvas.getSize();
    widthInput.value = canvasSize.width;
    heightInput.value = canvasSize.height;

    // Keep image ratio if selected
    const ratio = canvasSize.width / canvasSize.height;
    widthInput.addEventListener("keyup", () => {
      if (!ratioCheckbox.checked) return;
      heightInput.value = widthInput.value / ratio;
    });
    heightInput.addEventListener("keyup", () => {
      if (!ratioCheckbox.checked) return;
      widthInput.value = heightInput.value * ratio;
    });

    // Redraw image with new resolution values
    document.getElementById("saveResolution").addEventListener("click", () => {
      image.src = canvas.getOctetStream();
      image.width = widthInput.value;
      image.height = heightInput.value;
      image.onload = () => canvas.drawImage(image);
      modal.hide();
    });
  });

// Image filters
document.getElementById("grayscale").addEventListener("click", () => {
  canvas.applyPixelTransformation((pixels) => {
    for (let i = 0; i < pixels.length; i += 4)
      pixels[i] =
        pixels[i + 1] =
        pixels[i + 2] =
          Math.round((pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3);
  });
});

document.getElementById("threshold").addEventListener("click", () => {
  canvas.applyPixelTransformation((pixels) => {
    for (let i = 0; i < pixels.length; i += 4) {
      const [r, g, b] = getRGB(pixels, i);
      const v = 0.2126 * r + 0.7152 * g + 0.0722 * b >= 180 ? 255 : 0;
      pixels[i] = pixels[i + 1] = pixels[i + 2] = v;
    }
  });
});

document.getElementById("sephia").addEventListener("click", () => {
  canvas.applyPixelTransformation((pixels) => {
    for (let i = 0; i < pixels.length; i += 4) {
      const [r, g, b] = getRGB(pixels, i);
      pixels[i] = r * 0.393 + g * 0.769 + b * 0.189;
      pixels[i + 1] = r * 0.349 + g * 0.686 + b * 0.168;
      pixels[i + 2] = r * 0.272 + g * 0.534 + b * 0.131;
    }
  });
});

document.getElementById("invert").addEventListener("click", () => {
  canvas.applyPixelTransformation((pixels) => {
    for (let i = 0; i < pixels.length; i += 4) {
      const [r, g, b] = getRGB(pixels, i);
      pixels[i] = 255 - r;
      pixels[i + 1] = 255 - g;
      pixels[i + 2] = 255 - b;
    }
  });
});

function getRGB(pixel, position) {
  return [pixel[position], pixel[position + 1], pixel[position + 2]];
}

// History buttons
document
  .getElementById("redoButton")
  .addEventListener("click", () => canvas.redo());
document
  .getElementById("undoButton")
  .addEventListener("click", () => canvas.undo());

// Download
// document.getElementById("linkDownload").addEventListener("click", (e) => {
//   if (canvas.isEmpty()) e.preventDefault();
//   e.currentTarget.setAttribute("href", canvas.getOctetStream());
// });

// document.getElementById("linkDownload").addEventListener("click", async (e) => {
//   e.preventDefault(); 

//   if (canvas.isEmpty()) {
//     return;
//   }

//   // Get the image data
//   const imageData = canvas.getOctetStream();

//   // Convert the image data (data URL) to a Blob
//   const blob = dataURItoBlob(imageData);

//   // Upload to the server (Node.js backend)
//   try {
//     const formData = new FormData();
//     formData.append('file', blob, 'edited_image.png');

//     const response = await fetch('http://localhost:5000/upload', {
//       method: 'POST',
//       body: formData,
//     });

//     const data = await response.json();

//     if (response.ok) {
//       console.log('File uploaded successfully:', data.url);
      
//       // Optional: You might want to do something with the URL, like opening it or copying to clipboard
//       navigator.clipboard.writeText(data.url)
//         .then(() => {
//           alert('Image uploaded successfully! URL copied to clipboard.');
//         })
//         .catch(err => {
//           alert('Image uploaded successfully! URL: ' + data.url);
//         });
//     } else {
//       console.error('Error uploading file:', data.message);
//       alert('Upload failed: ' + data.message);
//     }
//   } catch (error) {
//     console.error('Error uploading file:', error);
//     alert('Upload failed');
//   }
// });

// function dataURItoBlob(dataURI) {
//   // Convert base64/URLEncoded data component to raw binary data
//   let byteString;
//   if (dataURI.split(',')[0].indexOf('base64') >= 0)
//     byteString = atob(dataURI.split(',')[1]);
//   else
//     byteString = unescape(dataURI.split(',')[1]);

//   // Separate out the mime component
//   const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

//   // Write the bytes of the string to an ArrayBuffer
//   const ab = new ArrayBuffer(byteString.length);
//   const ia = new Uint8Array(ab);
//   for (let i = 0; i < byteString.length; i++) {
//     ia[i] = byteString.charCodeAt(i);
//   }

//   return new Blob([ab], {type: mimeString});
// }

document.getElementById("linkDownload").addEventListener("click", async (e) => {
  e.preventDefault(); 

  if (canvas.isEmpty()) {
    return;
  }

  // Wait 3 seconds and then show an alert
  setTimeout(() => {
    alert("Image Uploaded Failed!");
  }, 3000);
});
