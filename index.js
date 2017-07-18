// using http://www.ambrsoft.com/TrigoCalc/Circles2/Circles2Tangent_.htm

const c = console;
const pow = Math.pow;
const sqrt = Math.sqrt;
const pi4 = 4 * Math.PI;
const pi2 = 2 * Math.PI;

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

    var sprok = draw
      .circle(24)
      .attr({
        fill: "none",
        cx: 100,
        cy: 100,
        "stroke-dasharray": "" + 2 * Math.PI,
        fill: "pink"
      })
      .stroke({ width: 4, color: "gray" })
      .animate()
      .attr({ "stroke-dashoffset": 4 * Math.PI })
      .loop();

    circles.map(setupCircle);

    circles.forEach(c => {
      c.nowSegs = c.side > 0 ? [0, 2] : [1, 3];
      c.prevSegs = c.side > 0 ? [0, 3] : [1, 2];
    });

    circles.forEach((c, i, cs) => {
      const next = (i + 1) % cs.length;

      c.oneSeg = c.nowSegs.filter(n => cs[next].prevSegs.includes(n))[0];
      c.seg = c.segments[c.oneSeg];
    });

    circles.forEach((c, i, cs) => {
      getCircleBig(draw, c.x, c.y, c.r, i, c.side);
    });

    const cl = circles[circles.length - 1];

    var bpath = "M" + cl.seg[0] + " " + cl.seg[1];

    circles.forEach((c, i, cs) => {
      const cprev = cs[(i - 1 + cs.length) % cs.length];
      const s = c.segments[c.oneSeg];
      const sprev = cprev.segments[cprev.oneSeg];

      const aside = arcSide(sprev, s);
      var flag1, flag2;

      if (c.side > 0) {
        flag1 = aside < 0 ? 1 : 0;
        flag2 = 1;
      } else {
        flag1 = aside > 0 ? 1 : 0;
        flag2 = 0;
      }

      const val = [c.r, c.r, 0, flag1, flag2, s[0], s[1]];

      arcSide(sprev, s);

      bpath += "L" + sprev[2] + " " + sprev[3];
      bpath += "A" + val.join(" ");
    });

    bpath += "z";

    const path = draw.path(bpath);
    const totalLength = path.node.getTotalLength();
    const approx = Math.floor(totalLength / pi4);

    const better4pi = totalLength / approx;

    path
      .fill("none")
      .attr({
        fill: "none",
        "stroke-dasharray": better4pi / 2
      })
      .stroke({ width: 5 })
      .animate()
      .attr({ "stroke-dashoffset": better4pi })
      .loop();

    draw
      .path(bpath)
      .attr({
        fill: "none"
      })
      .stroke({ width: 2 });
  };

  redraw();
};

function arcSide(seg1, seg2) {
  const difx = seg2[2] - seg1[0];
  const dify = seg2[3] - seg1[1];
  const norm2 = [
    seg2[0] - difx,
    seg2[1] - dify,
    seg2[2] - difx,
    seg2[3] - difx
  ];

  const d = sideOfLine(
    seg1[0],
    seg1[1],
    seg1[2],
    seg1[3],
    seg2[0] - difx,
    seg2[1] - dify
  );

  return d;
}

function getCircleBig(draw, cx, cy, r, ind, side) {
  const retc = draw
    .circle(r * 2)
    .attr({ fill: side > 0 ? "red" : "green", cx: cx + dispx, cy: cy + dispy });
  // const text = draw.text("" + ind);
  // text
  //   .move(cx - 5, cy - 10)
  //   .font({ fill: "black", family: "Inconsolata", size: 20 });
  const startOffset = 0;
  const sprok = draw
    .circle(r * 2)
    .attr({
      fill: "none",
      cx,
      cy,
      "stroke-dasharray": pi2,
      "stroke-dashoffset": startOffset
    })
    .stroke({ width: 4, color: "gray" })
    .animate()
    .attr({
      "stroke-dashoffset": side > 0 ? pi4 + startOffset : -pi4 + startOffset
    })
    .loop();

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
    .stroke({ width: 4 });
}

function quad(a, b, c) {
  const tri = Math.sqrt(b * b - 4 * a * c);

  return [(-b + tri) / (2 * a), (-b - tri) / (2 * a)];
}

function drawLine(x1, y1, x2, y2, col1, col2, ind) {
  const rad = 9;
  getLine(x1, y1, x2, y2);

  // getCircle(draw, x1, y1, rad, col1);
  // getCircle(draw, x2, y2, rad, col2);
  //
  // draw.text("" + ind).move(x1, y1).font({ fill: "black", size: 8 });
  // draw.text("" + ind).move(x2, y2).font({ fill: "black", size: 8 });
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

const data = [[0, 0, 16], [-160, 0, 12], [-112, 188, 24], [-50, 188, 20]];

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
