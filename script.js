const fileInput = document.getElementById("file-input");
const canvasContainer = document.getElementById("canvas-container");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const cropArea = document.getElementById("crop-area");
const cropBtn = document.getElementById("crop-btn");
const downloadLink = document.getElementById("download-link");

let img = new Image();
let startX,
  startY,
  offsetX,
  offsetY,
  isDragging = false;

fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (event) {
      img.src = event.target.result;
      img.onload = function () {
        drawImage();
        canvasContainer.style.display = "block";
        // Center the crop area on the image
        cropArea.style.left = "50px"; // Center position (300 - 200) / 2
        cropArea.style.top = "50px"; // Center position (300 - 200) / 2
      };
    };
    reader.readAsDataURL(file);
  }
});

function drawImage() {
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Calculate aspect ratios
  const canvasAspectRatio = canvas.width / canvas.height;
  const imageAspectRatio = img.width / img.height;

  let sx, sy, sWidth, sHeight;

  // Determine cropping dimensions to simulate object-fit: cover
  if (imageAspectRatio > canvasAspectRatio) {
    // Image is wider than canvas
    sHeight = img.height;
    sWidth = img.height * canvasAspectRatio;
    sx = (img.width - sWidth) / 2;
    sy = 0;
  } else {
    // Image is taller than canvas
    sWidth = img.width;
    sHeight = img.width / canvasAspectRatio;
    sx = 0;
    sy = (img.height - sHeight) / 2;
  }

  // Draw the image with calculated cropping
  ctx.drawImage(
    img,
    sx,
    sy,
    sWidth,
    sHeight,
    0,
    0,
    canvas.width,
    canvas.height
  );
}

// Crop area drag functionality
cropArea.addEventListener("mousedown", (e) => {
  isDragging = true;
  startX = e.clientX;
  startY = e.clientY;
  offsetX = cropArea.offsetLeft;
  offsetY = cropArea.offsetTop;
});

document.addEventListener("mousemove", (e) => {
  if (isDragging) {
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    // Constrain crop area within the 300x300px image boundaries
    const newLeft = Math.min(Math.max(0, offsetX + dx), 300 - 200);
    const newTop = Math.min(Math.max(0, offsetY + dy), 300 - 200);

    cropArea.style.left = `${newLeft}px`;
    cropArea.style.top = `${newTop}px`;
  }
});

document.addEventListener("mouseup", () => {
  isDragging = false;
});

cropBtn.addEventListener("click", () => {
  const cropX = cropArea.offsetLeft * (img.width / 300);
  const cropY = cropArea.offsetTop * (img.height / 300);
  const cropWidth = 200 * (img.width / 300);
  const cropHeight = 200 * (img.height / 300);

  const croppedCanvas = document.createElement("canvas");
  croppedCanvas.width = 200;
  croppedCanvas.height = 200;
  const croppedCtx = croppedCanvas.getContext("2d");

  croppedCtx.drawImage(
    img,
    cropX,
    cropY,
    cropWidth,
    cropHeight,
    0,
    0,
    200,
    200
  );

  downloadLink.href = croppedCanvas.toDataURL("image/png");
  downloadLink.download = "cropped-profile-picture.png";
  downloadLink.style.display = "inline-block";
  downloadLink.innerText = "Download Cropped Image";
});
