// "Passa di qua" in salita: il cielo e le montagne in fondo, le colline coi pini (una striscia
// che si ripete, per scorrere più piano della strada) e i cartelli della salita. La strada e le
// bici si disegnano nella scena, a ogni fotogramma (seguono la pendenza).
import { tela, CONT, tratto, ellisse, rrect, poli, gradL, gradR, scuro, chiaro, alfa, casuale } from './base.js';

// il fondo fisso (480x270): cielo del mattino, il sole, due catene di montagne con la neve, le nuvole
function sfondoMontagna(c) {
  c.fillStyle = gradL(c, 0, 0, 0, 270, [[0, '#5aa6e8'], [0.55, '#a8d8f4'], [1, '#e8f4f0']]); c.fillRect(0, 0, 480, 270);
  ellisse(c, 400, 46, 30, 30); c.fillStyle = 'rgba(255,248,210,0.35)'; c.fill();
  ellisse(c, 400, 46, 16, 16); c.fillStyle = '#fff6c8'; c.fill();
  const r = casuale(8848);
  for (const [x, y, w] of [[60, 40, 70], [210, 26, 54], [330, 70, 60]]) {
    for (let k = 0; k < 5; k++) { ellisse(c, x + k * w * 0.2, y - Math.sin(k) * 5, w * 0.22, 9); c.fillStyle = 'rgba(255,255,255,0.85)'; c.fill(); }
  }
  // le montagne lontane (azzurrine) e quelle davanti (più scure), con le cime innevate
  const catena = (cime, base, col, neve) => {
    c.beginPath(); c.moveTo(0, base);
    for (const [x, y] of cime) c.lineTo(x, y);
    c.lineTo(480, base); c.lineTo(480, 270); c.lineTo(0, 270); c.closePath();
    c.fillStyle = col; c.fill();
    for (const [x, y] of cime) {
      if (y > base - 40) continue;
      c.beginPath(); c.moveTo(x - 16, y + 18); c.lineTo(x, y); c.lineTo(x + 15, y + 17); c.lineTo(x + 7, y + 13); c.lineTo(x + 1, y + 19); c.lineTo(x - 7, y + 14); c.closePath();
      c.fillStyle = neve; c.fill();
    }
  };
  catena([[0, 150], [40, 104], [80, 132], [130, 74], [180, 126], [230, 92], [280, 140], [330, 70], [380, 120], [430, 96], [480, 130]], 170, '#9fb6d2', '#f4f8ff');
  catena([[0, 180], [50, 140], [100, 168], [160, 118], [210, 160], [270, 128], [320, 172], [380, 132], [440, 168], [480, 150]], 200, '#6f8fae', '#eef4fb');
  for (let i = 0; i < 40; i++) { c.fillStyle = 'rgba(255,255,255,0.06)'; c.fillRect(r() * 480, 120 + r() * 80, 1, 6 + r() * 10); }
}

// la striscia delle colline coi pini (960x110: si ripete, il bordo destro combacia col sinistro)
function colline(c) {
  const W = 960, H = 110, alto = (x) => 42 + Math.sin((x / W) * Math.PI * 4) * 12 + Math.sin((x / W) * Math.PI * 10 + 1) * 6;
  c.beginPath(); c.moveTo(0, H);
  for (let x = 0; x <= W; x += 8) c.lineTo(x, alto(x));
  c.lineTo(W, H); c.closePath();
  c.fillStyle = gradL(c, 0, 20, 0, H, [[0, '#6aa85a'], [1, '#3f7a3e']]); c.fill();
  const r = casuale(1955);
  for (let i = 0; i < 70; i++) {
    const x = (i / 70) * W + r() * 8, y = alto(x) + 4 + r() * 30, h = 12 + r() * 10;
    poli(c, [[x, y - h], [x - h * 0.38, y], [x + h * 0.38, y]]); c.fillStyle = r() < 0.5 ? '#2d5e34' : '#36703c'; c.fill();
    c.fillStyle = '#5a3a20'; c.fillRect(x - 0.8, y, 1.6, 3);
  }
  // una baita col tetto rosso
  for (const x of [300, 780]) {
    const y = alto(x) + 10;
    rrect(c, x - 9, y - 9, 18, 10, 1); c.fillStyle = '#c89a62'; c.fill(); tratto(c, CONT, 0.8);
    poli(c, [[x - 12, y - 8], [x, y - 17], [x + 12, y - 8]]); c.fillStyle = '#b8402e'; c.fill(); tratto(c, CONT, 0.8);
  }
}

// i cartelli (26x32): triangolo bianco col bordo rosso sul palo, col disegno dentro
function cartello(c, tipo) {
  c.fillStyle = '#8a8e96'; c.fillRect(12, 18, 2.2, 14);
  const tri = (m) => { c.beginPath(); c.moveTo(13, 1 + m); c.lineTo(25 - m, 21 - m * 0.6); c.lineTo(1 + m, 21 - m * 0.6); c.closePath(); };
  c.lineJoin = 'round';
  tri(0); c.fillStyle = '#e02626'; c.fill(); tratto(c, CONT, 1.6);
  tri(3.4); c.fillStyle = '#ffffff'; c.fill();
  c.lineCap = 'round';
  if (tipo === 'tornante') {
    // la curva a gomito: sale, gira e torna indietro
    c.beginPath(); c.moveTo(9, 18); c.lineTo(9, 11); c.quadraticCurveTo(9, 7, 13, 7); c.quadraticCurveTo(17, 7, 17, 11); c.lineTo(17, 15); tratto(c, '#1c1c22', 1.8);
    poli(c, [[15, 14], [19, 14], [17, 18]]); c.fillStyle = '#1c1c22'; c.fill();
  } else if (tipo === 'strappo') {
    // la salita ripida col "%"
    poli(c, [[6, 18], [20, 18], [20, 9]]); c.fillStyle = '#1c1c22'; c.fill();
    c.font = 'bold 5px sans-serif'; c.fillStyle = '#ffffff'; c.fillText('%', 15, 17);
  }
}

// lo striscione dello sprint e del traguardo (120x22)
function striscione(c, scritta, col) {
  rrect(c, 1, 1, 118, 20, 3); c.fillStyle = col; c.fill(); tratto(c, CONT, 1.4);
  if (scritta === 'TRAGUARDO') for (let i = 0; i < 12; i++) for (let j = 0; j < 2; j++) { c.fillStyle = (i + j) % 2 ? '#ffffff' : '#1c1c22'; c.fillRect(2 + i * 9.7, j ? 15 : 2, 9.7, 4); }
  c.font = 'bold 9px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.lineWidth = 2.4; c.strokeStyle = CONT; c.strokeText(scritta, 60, 11.5); c.fillStyle = '#ffffff'; c.fillText(scritta, 60, 11.5);
}

// il pedale per il dito (32x32): la scarpa sul pedale, con la freccia del lato
function pedale(c, lato) {
  ellisse(c, 16, 16, 15, 15); c.fillStyle = 'rgba(31,20,48,0.7)'; c.fill(); tratto(c, '#ffe14a', 1.4);
  rrect(c, 8, 18, 16, 4, 1.5); c.fillStyle = '#c8ccd4'; c.fill(); tratto(c, CONT, 0.8);
  c.save(); c.translate(16, 13); c.scale(lato, 1);
  poli(c, [[-7, -4], [3, -4], [7, 0], [3, 4], [-7, 4]]); c.fillStyle = '#ffe14a'; c.fill(); tratto(c, CONT, 0.8);
  c.restore();
}

export function creaMontagna(scene) {
  tela(scene, 'bgMontagna', 480, 270, sfondoMontagna, 3);
  tela(scene, 'collineMontagna', 960, 110, colline, 3);
  tela(scene, 'cartelloTornante', 26, 32, (c) => cartello(c, 'tornante'), 6);
  tela(scene, 'cartelloStrappo', 26, 32, (c) => cartello(c, 'strappo'), 6);
  tela(scene, 'striscioneSprint', 120, 22, (c) => striscione(c, 'SPRINT!', '#2f6fd8'), 5);
  tela(scene, 'striscioneArrivo', 120, 22, (c) => striscione(c, 'TRAGUARDO', '#d83a3a'), 5);
  tela(scene, 'pedaleSx', 32, 32, (c) => pedale(c, -1), 6);
  tela(scene, 'pedaleDx', 32, 32, (c) => pedale(c, 1), 6);
}
