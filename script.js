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
  offsetLeft,
  offsetTop,
  isDragging = false;
let drawScale = 1;
let drawOffsetX = 0;
let drawOffsetY = 0;

// Set a default image if no file is uploaded
const defaultImageSrc = "default-image.png"; // Change this to your actual default image path

function loadDefaultImage() {
  img.src = defaultImageSrc;
  img.onload = function () {
    drawImage();
    canvasContainer.style.display = "block";
    cropBtn.style.display = "none";
  };
}

fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (event) {
      img.src = event.target.result;
      img.onload = function () {
        drawImage();
        canvasContainer.style.display = "block";
        cropBtn.style.display = "inline-block"; // Show crop button
        cropArea.style.left = `${(canvas.width - cropArea.offsetWidth) / 2}px`;
        cropArea.style.top = `${(canvas.height - cropArea.offsetHeight) / 2}px`;
        downloadLink.style.display = "none";
      };
    };
    reader.readAsDataURL(file);
  } else {
    loadDefaultImage(); // Load default image if no file is selected
  }
});

function drawImage() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const canvasAspect = canvas.width / canvas.height;
  const imgAspect = img.width / img.height;

  let drawWidth, drawHeight, offsetX, offsetY;

  if (imgAspect > canvasAspect) {
    drawHeight = canvas.height;
    drawWidth = img.width * (canvas.height / img.height);
    offsetX = (canvas.width - drawWidth) / 2;
    offsetY = 0;
  } else {
    drawWidth = canvas.width;
    drawHeight = img.height * (canvas.width / img.width);
    offsetX = 0;
    offsetY = (canvas.height - drawHeight) / 2;
  }

  drawScale = drawWidth / img.width;
  drawOffsetX = offsetX;
  drawOffsetY = offsetY;

  ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
}

cropArea.addEventListener("mousedown", (e) => {
  isDragging = true;
  startX = e.clientX;
  startY = e.clientY;
  offsetLeft = cropArea.offsetLeft;
  offsetTop = cropArea.offsetTop;
  e.preventDefault();
});

document.addEventListener("mousemove", (e) => {
  if (isDragging) {
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    let newLeft = offsetLeft + dx;
    let newTop = offsetTop + dy;
    newLeft = Math.min(
      Math.max(0, newLeft),
      canvas.width - cropArea.offsetWidth
    );
    newTop = Math.min(
      Math.max(0, newTop),
      canvas.height - cropArea.offsetHeight
    );
    cropArea.style.left = `${newLeft}px`;
    cropArea.style.top = `${newTop}px`;
  }
});

document.addEventListener("mouseup", () => {
  isDragging = false;
});

cropBtn.addEventListener("click", () => {
  const cropLeft =
    (parseInt(cropArea.style.left, 10) - drawOffsetX) / drawScale;
  const cropTop = (parseInt(cropArea.style.top, 10) - drawOffsetY) / drawScale;
  const cropWidth = cropArea.offsetWidth / drawScale;
  const cropHeight = cropArea.offsetHeight / drawScale;

  const clampedCropLeft = Math.max(0, cropLeft);
  const clampedCropTop = Math.max(0, cropTop);
  const clampedCropWidth = Math.min(cropWidth, img.width - clampedCropLeft);
  const clampedCropHeight = Math.min(cropHeight, img.height - clampedCropTop);

  const croppedCanvas = document.createElement("canvas");
  croppedCanvas.width = cropArea.offsetWidth;
  croppedCanvas.height = cropArea.offsetHeight;
  const croppedCtx = croppedCanvas.getContext("2d");

  croppedCtx.drawImage(
    img,
    clampedCropLeft,
    clampedCropTop,
    clampedCropWidth,
    clampedCropHeight,
    0,
    0,
    croppedCanvas.width,
    croppedCanvas.height
  );

  downloadLink.href = croppedCanvas.toDataURL("image/png");
  downloadLink.download = "cropped-profile-picture.png";
  downloadLink.style.display = "inline-block";
  downloadLink.innerText = "Download";
});

window.addEventListener("resize", () => {
  if (img.src) {
    drawImage();
  }
});

// Load default image on page load
loadDefaultImage();
