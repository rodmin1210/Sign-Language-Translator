const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

// 반드시 절대 경로 사용
const DATA_DIR = '/data'; 

// 정적 파일 제공 (index.html 등)
app.use(express.static(__dirname));

// JSON 파싱 설정
app.use(express.json());

// 데이터 저장 엔드포인트
app.post('/save-data', (req, res) => {
  const { id, data } = req.body;
  const filePath = path.join(DATA_DIR, `${id}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data));
  res.send('저장 성공!');
});

// 데이터 불러오기 엔드포인트
app.get('/load-data/:gestureName', (req, res) => {
  const filePath = path.join(DATA_DIR, `${req.params.id}.json`);
  if(fs.existsSync(filePath)){
    res.json(JSON.parse(fs.readFileSync(filePath)));
  } else {
    res.status(404).send('데이터 없음');
  }
});

// 서버 시작
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`서버 실행 중: ${PORT}`));
