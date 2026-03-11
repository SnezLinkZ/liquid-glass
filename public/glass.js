// made by SnezLinkZ

"use strict";
// old attempt, doesnt work
/*function vectorAt(x, y, width, height, r) {
  const n2 = 2;
  const d = 50;
  const h = Math.sqrt(r*r - Math.pow(r - x, 2) - Math.pow(r - y, 2));
  const t = Math.atan(Math.asin(h) + (Math.PI / 2));
  const disp = (h - r + d) * (Math.tan((- Math.sin(t)/n2) + t));
  const theta = Math.atan(y/x);
  const dx = Math.cos(theta) * disp;
  const dy = Math.sin(theta) * disp;
  return [dx, dy];
}*/

class LiquidGlass {
  static colorCoeff = 128;
  static smoothCoefficient = 0.2;
  static padding = 0;
  static depth = 40;
  static ids = [];
  static generateDisplacementMap(width, height, radius, depth, scale) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    const cx = width / 2;
    const cy = height / 2;
    const r = Math.max(radius, 1);
    for (let x = 0; x < canvas.width; x ++) {
      for (let y = 0; y < canvas.height; y ++) {
        const xt = x; //(x - canvas.width / 2) / 96;
        const yt = y; //(y - canvas.height / 2) / 96;
        const vector = LiquidGlass.vectorAt(xt, yt, width, height, radius, depth, scale);
        LiquidGlass.setPixel(ctx, x, y, {r: vector[0] * LiquidGlass.colorCoeff + 128, g: vector[1] * LiquidGlass.colorCoeff + 128, b: 128});
      }
    }
    return canvas;
  }

  static generateSVG(w, h, disp, id, frost = 0, scale = 20) {
    const svg = `<svg width="${w + LiquidGlass.padding}" height="${h + LiquidGlass.padding}">
    <filter id="disp-svg-${id}">
      <feImage
        id="dispMap"
        href="${disp}"
        x="0"
        y="0"
        width="${w + LiquidGlass.padding}"
        height="${h + LiquidGlass.padding}"
        result="map"
      />
      <feGaussianBlur in="SourceGraphic" result="blurred" stdDeviation="${frost}" />
      <feDisplacementMap
        in="blurred"
        in2="map"
        scale="${scale}"
        xChannelSelector="R"
        yChannelSelector="G"
      />
    </filter>
  </svg>`
    return svg;
  }
  static easing(x, y, s = LiquidGlass.smoothCoefficient * 20) {
    return (Math.sin(Math.PI * (Math.sqrt(x*x + y*y) / s - 0.5)) + 1) / 2;
  }
  static vectorAtSphere(x, y, d = 40, n2 = 2) {
    if (x * x + y * y > 1) {
      return [0, 0];
    }
    const isNeg = x <= 0 && y <= 0;
    const isNegCoeff = isNeg ? -1 : 1;
    const xt = isNegCoeff * x;
    const yt = isNegCoeff * y;
    const dist = Math.sqrt(xt*xt + yt*yt);
    if (dist === 0) {
      return [0, 0];
    }
    const eased = LiquidGlass.easing(xt, yt);
    const h = eased; // Math.sqrt(1 - xt ** 2 - yt ** 2) *easing(x, y);
    const disp = eased; // (h / dist);
    const a = (h - 1 + d);
    const dispX = disp * xt * a * isNegCoeff;
    const dispY = disp * yt * a * isNegCoeff;
    return [dispX, dispY];
  }
  static vectorAt(x, y, w, h, r, d) {
    let disp = [0, 0];
    let dist = 0;
    if (x <= r && y <= r) {
      // top-left
      disp = LiquidGlass.vectorAtSphere((x - r) / r, (y - r) / r, d);
    } else if (x <= r && h - y <= r) {
      // bottom-left
      disp = LiquidGlass.vectorAtSphere((x - r) / r, -(h - y - r) / r, d);
    } else if (w - x <= r && y <= r) {
      // top-right
      disp = LiquidGlass.vectorAtSphere(-(w - x - r) / r, (y - r) / r, d);
    } else if (w - x <= r && h - y <= r) {
      // bottom-right
      disp = LiquidGlass.vectorAtSphere(-(w - x - r) / r, -(h - y - r) / r, d);
    } else if ((x >= r && x <= w - r) && (y >= r && y <= h - r)) {
      // center
      disp = [0, 0];
    } else if ((x >= r && y <= r)) {
      // top edge
      disp = LiquidGlass.vectorAtSphere(0, (y - r) / r, d);
    } else if ((x >= r && y >= h - r)) {
      // bottom edge
      disp = LiquidGlass.vectorAtSphere(0, - (h - y - r) / r, d);
    } else if ((x <= r) && (y >= r && y <= h - r)) {
      // left edge
      disp = LiquidGlass.vectorAtSphere((x - r) / r, 0, d);
    } else if ((w - x <= r) && (y >= r && y <= h - r)) {
    // right edge
      disp = LiquidGlass.vectorAtSphere(-(w - x - r) / r, 0, d);
  }
    return disp;
  }
  static setPixel(ctx, x, y, color) {
    ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b})`;
    ctx.fillRect(x, y, 1, 1);
  }

  static mapElements() {
    let filterContainer = document.getElementById("glass-filters");
    if (!filterContainer) {
      filterContainer = document.createElement("div");
      filterContainer.id = "glass-filters";
      document.body.appendChild(filterContainer);
    }
    filterContainer.replaceChildren();
    const glassElements = document.getElementsByClassName("liquid-glass");
    LiquidGlass.ids = [];
    for (let i = 0; i < glassElements.length; i++) {
      
      const elem = glassElements[i];
      const { width, height } = elem.getBoundingClientRect();
      let frostStyle = getComputedStyle(elem).getPropertyValue("--glass-frost");
      if (!frostStyle) frostStyle = 0;
      const frost = parseInt(frostStyle, 10);
      let depthStyle = getComputedStyle(elem).getPropertyValue("--glass-depth");
      if (!depthStyle) depthStyle = 0;
      const depth = parseInt(depthStyle, 10);
      let scaleStyle = getComputedStyle(elem).getPropertyValue("--glass-strength");
      if (!scaleStyle) scaleStyle = 0;
      const scale = parseInt(scaleStyle, 10);
      const radius = Math.min(height / 2, width / 2, parseInt(getComputedStyle(elem).borderRadius, 10));
      //console.log(radius);
      let id = `glass-w${width}-h${height}-r${radius}-f${frost}-d${depth}-s${scale}`;
      elem.style.setProperty("backdrop-filter", `url("#disp-svg-${id}")`, "important");
      
      if (LiquidGlass.ids.includes(id)) {
        return;
      }
      LiquidGlass.ids.push(id);
      //console.log(LiquidGlass.ids);
      //console.log(id);
      const canvas = LiquidGlass.generateDisplacementMap(width, height, radius, depth, scale);
      //elem.appendChild(canvas);
      const svg = LiquidGlass.generateSVG(width, height, canvas.toDataURL(), id, frost, scale);
      filterContainer.insertAdjacentHTML("beforeend", svg);
    }
  }
  static start() {
    requestAnimationFrame(LiquidGlass.loop);
  }
}