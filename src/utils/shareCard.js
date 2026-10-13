/**
 * KeyRush Social Performance Card Generator (Canvas 2D)
 * Creates high-resolution 1200x630 shareable graphics for Twitter, Discord, and esports bragging rights.
 */

export function generatePerformanceCard({
  username,
  wpm,
  accuracy,
  consistency,
  rank,
  carName,
  mode,
  date
}) {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 630;
  const ctx = canvas.getContext('2d');

  // Dark Futuristic Background
  const bgGrad = ctx.createLinearGradient(0, 0, 1200, 630);
  bgGrad.addColorStop(0, '#090b12');
  bgGrad.addColorStop(0.5, '#0e1220');
  bgGrad.addColorStop(1, '#05070a');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1200, 630);

  // Neon Cyber Grid Accent Lines
  ctx.strokeStyle = 'rgba(0, 229, 255, 0.08)';
  ctx.lineWidth = 1;
  for (let x = 0; x < 1200; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 630);
    ctx.stroke();
  }
  for (let y = 0; y < 630; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1200, y);
    ctx.stroke();
  }

  // Glowing Outer Border
  ctx.strokeStyle = '#00e5ff';
  ctx.lineWidth = 4;
  ctx.strokeRect(30, 30, 1140, 570);

  ctx.strokeStyle = '#a855f7';
  ctx.lineWidth = 2;
  ctx.strokeRect(36, 36, 1128, 558);

  // Logo / Header
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px Orbitron, sans-serif, system-ui';
  ctx.fillText('KEYRUSH', 70, 95);

  ctx.fillStyle = '#00e5ff';
  ctx.font = '16px Orbitron, sans-serif';
  ctx.fillText('TYPE. RACE. DOMINATE.', 260, 95);

  // Verified Badge
  ctx.fillStyle = '#00f59b';
  ctx.font = 'bold 15px system-ui';
  ctx.fillText('● VERIFIED TELEMETRY RECORD', 880, 95);

  // Player Info
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 44px Orbitron, sans-serif, system-ui';
  ctx.fillText(username || 'Racer', 70, 190);

  ctx.fillStyle = '#a855f7';
  ctx.font = '22px system-ui';
  ctx.fillText(`League: ${rank || 'Silver II'}  •  Vehicle: ${carName || 'Apex Talon'}`, 70, 230);

  // Big Stat Blocks: WPM, Accuracy, Consistency
  const drawStatBox = (x, y, label, val, unit, color) => {
    ctx.fillStyle = 'rgba(20, 26, 42, 0.7)';
    ctx.fillRect(x, y, 320, 180);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, 320, 180);

    ctx.fillStyle = color;
    ctx.font = 'bold 16px Orbitron, sans-serif';
    ctx.fillText(label.toUpperCase(), x + 25, y + 42);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 74px Orbitron, sans-serif';
    ctx.fillText(val, x + 25, y + 125);

    ctx.fillStyle = '#8b9bb4';
    ctx.font = '20px Orbitron, sans-serif';
    ctx.fillText(unit, x + 25 + ctx.measureText(val).width + 12, y + 125);
  };

  drawStatBox(70, 280, 'Top Speed (WPM)', `${wpm}`, 'WPM', '#00e5ff');
  drawStatBox(440, 280, 'Accuracy', `${accuracy}`, '%', '#00f59b');
  drawStatBox(810, 280, 'Consistency', `${consistency}`, '%', '#a855f7');

  // Footer Info
  ctx.fillStyle = '#64748b';
  ctx.font = '16px system-ui';
  const displayDate = date || new Date().toLocaleDateString();
  ctx.fillText(`Mode: ${mode || 'Grand Prix AI Race'}  |  Timestamp: ${displayDate}`, 70, 530);
  ctx.fillText('Compete online & offline at keyrush.app', 820, 530);

  return canvas.toDataURL('image/png');
}

export function downloadPerformanceCard(data) {
  const dataUrl = generatePerformanceCard(data);
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = `KeyRush_${data.username}_${data.wpm}WPM.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
