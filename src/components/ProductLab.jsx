import React, { useEffect, useMemo, useRef, useState } from 'react';

// Simple in-browser ML demo: linear regression with gradient descent on user CSV
function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  const data = lines.map((l) => l.split(',').map((x) => Number(x.trim()))).filter((row) => row.length >= 2 && row.every((n) => Number.isFinite(n)));
  return data;
}

function trainLinearRegression(data, lr = 0.001, epochs = 2000) {
  // Model: y = a*x + b
  let a = 0, b = 0;
  for (let e = 0; e < epochs; e++) {
    let da = 0, db = 0;
    for (const [x, y] of data) {
      const yhat = a * x + b;
      da += (yhat - y) * x;
      db += (yhat - y);
    }
    da /= data.length; db /= data.length;
    a -= lr * da; b -= lr * db;
  }
  const loss = data.reduce((acc, [x, y]) => acc + Math.pow(a * x + b - y, 2), 0) / data.length;
  return { a, b, loss };
}

export default function ProductLab() {
  const [data, setData] = useState([[0,0],[1,1],[2,2],[3,3]]);
  const [model, setModel] = useState(() => trainLinearRegression([[0,0],[1,1],[2,2],[3,3]]));
  const [error, setError] = useState('');

  useEffect(() => {
    setModel(trainLinearRegression(data));
  }, [data]);

  const onUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      if (file.size > 2 * 1024 * 1024) throw new Error('File too large');
      const text = await file.text();
      const parsed = parseCSV(text);
      if (parsed.length < 2) throw new Error('Need at least 2 rows of numeric pairs');
      setData(parsed);
      setError('');
    } catch (err) {
      setError(err.message || 'Upload failed');
    }
  };

  return (
    <section className="bg-neutral-950 text-white py-16">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="text-3xl sm:text-4xl font-bold">Product Lab</h2>
        <p className="text-white/70 mt-2">Run tiny models in your browser. Upload a CSV of x,y pairs to fit a line.</p>

        <div className="mt-6 grid lg:grid-cols-3 gap-6">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <label className="block text-sm mb-2">Upload CSV (x,y)</label>
            <input type="file" accept=".csv,text/csv" onChange={onUpload} className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-fuchsia-500/20 file:text-white hover:file:bg-fuchsia-500/30" />
            {error && <p className="text-red-400 mt-3" role="alert">{error}</p>}
            <div className="mt-4 text-sm text-white/70">Rows: {data.length}</div>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10 col-span-2">
            <h3 className="font-semibold">Model Fit</h3>
            <p className="text-sm text-white/70">y = {model.a.toFixed(3)} x + {model.b.toFixed(3)} (loss {model.loss.toFixed(4)})</p>
            <CanvasChart points={data} a={model.a} b={model.b} />
          </div>
        </div>
      </div>
    </section>
  );
}

function CanvasChart({ points, a, b }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return; const ctx = canvas.getContext('2d');
    const w = canvas.width = canvas.clientWidth * devicePixelRatio; const h = canvas.height = canvas.clientHeight * devicePixelRatio;
    ctx.clearRect(0,0,w,h);
    // axes
    ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(40, h-40); ctx.lineTo(w-10, h-40); ctx.moveTo(40, h-10); ctx.lineTo(40, 10); ctx.stroke();
    // scale
    const xs = points.map(p=>p[0]); const ys = points.map(p=>p[1]);
    const minX = Math.min(...xs, 0); const maxX = Math.max(...xs, 1);
    const minY = Math.min(...ys, 0); const maxY = Math.max(...ys, 1);
    const sx = (x)=> 40 + (x - minX) / (maxX - minX || 1) * (w-80);
    const sy = (y)=> (h-40) - (y - minY) / (maxY - minY || 1) * (h-80);
    // points
    ctx.fillStyle = '#f0abfc';
    for (const [x,y] of points) { ctx.beginPath(); ctx.arc(sx(x), sy(y), 4*devicePixelRatio, 0, Math.PI*2); ctx.fill(); }
    // line
    ctx.strokeStyle = '#a78bfa'; ctx.lineWidth = 2*devicePixelRatio; ctx.beginPath();
    const x1 = minX, y1 = a*minX + b; const x2 = maxX, y2 = a*maxX + b;
    ctx.moveTo(sx(x1), sy(y1)); ctx.lineTo(sx(x2), sy(y2)); ctx.stroke();
  }, [points, a, b]);
  return <div className="mt-4 rounded-lg overflow-hidden ring-1 ring-white/10"><canvas ref={ref} className="w-full h-64" aria-label="Model visualization" role="img" /></div>;
}
