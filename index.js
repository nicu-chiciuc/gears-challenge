// using http://www.ambrsoft.com/TrigoCalc/Circles2/Circles2Tangent_.htm

const c = console;
const pow = Math.pow;
const sqrt = Math.sqrt;

var draw;
var redraw;
var dataNow;
var movingBall;

window.onload = () => {
  draw = SVG("thediv").size(800, 800);
  draw.mousemove(evt => {
    if (movingBall) {
      movingBall.attr({ cx: evt.clientX, cy: evt.clientY });
    }
  });

  redraw = function() {
    draw.clear();

    circles.map(setupCircle);

    circles.forEach(c => {
      c.nowSegs = c.side > 0 ? [0, 2] : [1, 3];
      c.prevSegs = c.side > 0 ? [0, 3] : [1, 2];
    });

    circles.forEach((c, i, cs) => {
      getCircleBig(draw, c.x, c.y, c.r, i, c.side > 0 ? "red" : "aqua");
    });

    circles.forEach((c, i, cs) => {
      const next = (i + 1) % cs.length;

      c.oneSeg = c.nowSegs.filter(n => cs[next].prevSegs.includes(n))[0];

      const s = c.segments[c.oneSeg];
      drawLine(s[0], s[1], s[2], s[3], "pink", "green", c.oneSeg);
    });
  };

  redraw();
};

function getCircleBig(draw, cx, cy, r, ind, fill = "black") {
  const retc = draw
    .circle(r * 2)
    .attr({ fill, cx: cx + dispx, cy: cy + dispy });
  const text = draw.text("" + ind);
  text
    .move(cx - 5, cy - 10)
    .font({ fill: "black", family: "Inconsolata", size: 20 });

  retc.moving = false;
  retc.mousedown(() => {
    movingBall = retc;
  });
  retc.mouseup(evt => {
    if (movingBall) {
      movingBall = undefined;
      circles[ind].x = evt.clientX;
      circles[ind].y = evt.clientY;
      redraw();
    }
  });
}

function getCircle(draw, cx, cy, r, fill = "black") {
  return draw.circle(r).attr({ fill, cx: cx + dispx, cy: cy + dispy });
}

function getLine(x0, y0, x1, y1) {
  draw
    .line(dispx + x0, dispy + y0, dispx + x1, dispy + y1)
    .stroke({ width: 1 });
}

function quad(a, b, c) {
  const tri = Math.sqrt(b * b - 4 * a * c);

  return [(-b + tri) / (2 * a), (-b - tri) / (2 * a)];
}

function drawLine(x1, y1, x2, y2, col1, col2, ind) {
  const rad = 9;
  getLine(x1, y1, x2, y2);

  getCircle(draw, x1, y1, rad, col1);
  getCircle(draw, x2, y2, rad, col2);

  draw.text("" + ind).move(x1, y1).font({ fill: "black", size: 8 });
  draw.text("" + ind).move(x2, y2).font({ fill: "black", size: 8 });
}

function setupCircle(cnow, now, circles) {
  const len = circles.length;
  const prev = (now - 1 + len) % len;
  const next = (now + 1) % len;

  const cnext = circles[next];
  const cprev = circles[prev];

  const a = cnow.x,
    b = cnow.y,
    c = cnext.x,
    d = cnext.y,
    r0 = cnow.r,
    r1 = cnext.r;

  const xp_out = (c * r0 - a * r1) / (r0 - r1);
  const yp_out = (d * r0 - b * r1) / (r0 - r1);
  const xp_in = (c * r0 + a * r1) / (r0 + r1);
  const yp_in = (d * r0 + b * r1) / (r0 + r1);

  // Outter tangent points
  const [[xt1out, yt1out], [xt2out, yt2out]] = tangCi(a, b, r0, xp_out, yp_out);
  const [[xt3out, yt3out], [xt4out, yt4out]] = tangCi(c, d, r1, xp_out, yp_out);

  // Inner tangent points
  const [[xt1in, yt1in], [xt2in, yt2in]] = tangCi(a, b, r0, xp_in, yp_in);
  const [[xt3in, yt3in], [xt4in, yt4in]] = tangCi(c, d, r1, xp_in, yp_in);

  // The 1,2 are the outter tangents
  // the 3,4 are the inner tangents
  var segments = [
    [xt1out, yt1out, xt3out, yt3out],
    [xt2out, yt2out, xt4out, yt4out],

    [xt1in, yt1in, xt3in, yt3in],
    [xt2in, yt2in, xt4in, yt4in]
  ];

  // If the next circle is bigger, the segments order will be reversed
  if (r0 < r1) {
    segments = [segments[1], segments[0], segments[2], segments[3]];
  }

  cnow.segments = segments;
  cnow.side = sideOfLine(cprev.x, cprev.y, cnext.x, cnext.y, cnow.x, cnow.y);
}

function tangCi(x, y, r, xp, yp) {
  const xpx = xp - x;
  const ypy = yp - y;

  const xt = sign =>
    (r ** 2 * xpx + sign * r * ypy * sqrt(xpx ** 2 + ypy ** 2 - r ** 2)) /
      (xpx ** 2 + ypy ** 2) +
    x;

  const yt = sign =>
    (r ** 2 * ypy + sign * r * xpx * sqrt(ypy ** 2 + xpx ** 2 - r ** 2)) /
      (ypy ** 2 + xpx ** 2) +
    y;

  return [[xt(1), yt(-1)], [xt(-1), yt(1)]];
}

function sideOfLine(x1, y1, x2, y2, x, y) {
  return (x - x1) * (y2 - y1) - (y - y1) * (x2 - x1);
}

function equal(a, b) {
  const eps = 0.0001;
  return Math.abs(a - b) < eps;
}

const data = [
  [0, 0, 60],
  [44, 140, 17],
  [-204, 140, 16],
  [-160, 0, 61],
  [-112, 188, 12],
  [-190, 300, 31],
  [30, 300, 30],
  [-48, 188, 12]
];

const betData = data.map(([x, y, r]) => [x + 400, y + 100, r]);

const data2 = [[100, 100, 25], [200, 200, 20], [300, 100, 15]];

var circles = betData.map((d, i) => ({
  x: d[0],
  y: d[1],
  r: d[2],
  index: i
}));

const dispx = 0;
const dispy = 0;