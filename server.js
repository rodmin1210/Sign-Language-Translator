const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

// Persistent Disk 마운트 경로
const DATA_DIR = process.env.DATA_DIR || '/data';

// 정적 파일 제공 (index.html, main.js 등)
app.use(express.static(__dirname));

// JSON 파싱 미들웨어
app.use(express.json());

// 훈련 데이터 저장 엔드포인트
app.post('/save-data', (req, res) => {
  const { gestureName, data } = req.body;
  const filePath = path.join(DATA_DIR, `${gestureName}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data));
  res.status(200).send('Data saved');
});

// 훈련 데이터 불러오기 엔드포인트
app.get('/load-data/:gestureName', (req, res) => {
  const filePath = path.join(DATA_DIR, `${req.params.gestureName}.json`);
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath));
    res.json(data);
  } else {
    res.status(404).send('Not found');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
