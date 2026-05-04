class ImageAsciiSource {
  constructor(src, options = {}) {
    this.src = src;
    this.charset = options.charset || "wholetamdis";
    this.invert = options.invert || false;
    this.cache = new Map();
    this.failed = false;
    this.ready = false;
    this.onchange = null;
    this.canvas = document.createElement("canvas");
    this.context = this.canvas.getContext("2d", { willReadFrequently: true });
    this.image = new Image();
    this.image.decoding = "async";

    this.image.addEventListener("load", () => {
      this.ready = true;
      this.failed = false;
      this.cache.clear();
      if (this.onchange) this.onchange();
    });

    this.image.addEventListener("error", () => {
      this.failed = true;
      if (this.onchange) this.onchange();
    });

    this.image.src = src;
  }

  getRows(bounds) {
    if (!this.ready || this.failed || !this.context) return null;

    const key = `${bounds.cols}x${bounds.rows}`;
    if (!this.cache.has(key)) {
      this.cache.set(key, this.convert(bounds));
    }

    return this.cache.get(key);
  }

  sourceCrop(bounds) {
    const imageAspect = this.image.naturalWidth / this.image.naturalHeight;
    const gridAspect = (bounds.cols * bounds.cellW) / (bounds.rows * bounds.cellH);
    let sx = 0;
    let sy = 0;
    let sw = this.image.naturalWidth;
    let sh = this.image.naturalHeight;

    if (imageAspect > gridAspect) {
      sw = sh * gridAspect;
      sx = (this.image.naturalWidth - sw) / 2;
    } else {
      sh = sw / gridAspect;
      sy = (this.image.naturalHeight - sh) / 2;
    }

    return { sx, sy, sw, sh };
  }

  convert(bounds) {
    const cols = bounds.cols;
    const rows = bounds.rows;
    const crop = this.sourceCrop(bounds);
    this.canvas.width = cols;
    this.canvas.height = rows;
    this.context.clearRect(0, 0, cols, rows);
    this.context.drawImage(
      this.image,
      crop.sx,
      crop.sy,
      crop.sw,
      crop.sh,
      0,
      0,
      cols,
      rows
    );

    const pixels = this.context.getImageData(0, 0, cols, rows).data;
    const output = [];

    for (let y = 0; y < rows; y += 1) {
      let line = "";

      for (let x = 0; x < cols; x += 1) {
        const index = (y * cols + x) * 4;
        const alpha = pixels[index + 3] / 255;
        const luminance =
          (0.2126 * pixels[index] +
            0.7152 * pixels[index + 1] +
            0.0722 * pixels[index + 2]) /
          255;
        const value = this.invert ? 1 - luminance : luminance;
        const adjusted = Math.max(0, Math.min(1, value * alpha));
        const charIndex = Math.round(adjusted * (this.charset.length - 1));
        line += this.charset[charIndex];
      }

      output.push(line);
    }

    return output;
  }
}

window.ImageAsciiSource = ImageAsciiSource;
