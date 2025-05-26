// Express.js 웹서버 프레임워크를 가져옵니다
const express = require('express');
// 파일 경로를 다루기 위한 Node.js 내장 모듈
const path = require('path');
// CORS (Cross-Origin Resource Sharing) - 다른 도메인에서 접근 허용
const cors = require('cors');
// HTTP 요청을 보내기 위한 라이브러리
const axios = require('axios');

// Express 앱을 생성합니다
const app = express();
// 서버가 실행될 포트 번호 (Render에서는 환경변수로 제공됨)
const PORT = process.env.PORT || 3000;

// 라즈베리파이4의 IP 주소와 포트 (환경변수로 설정)
const RASPBERRY_PI_IP = process.env.RASPBERRY_PI_IP || '61.245.277.5';
const RASPBERRY_PI_PORT = process.env.RASPBERRY_PI_PORT || '5000';

// 미들웨어 설정
app.use(cors()); // 모든 도메인에서 접근 허용
app.use(express.json()); // JSON 데이터를 파싱할 수 있게 설정
app.use(express.static('.')); // 현재 폴더의 모든 파일을 정적 파일로 제공

// 메인 페이지 라우트 - 사용자가 웹사이트에 접속했을 때
app.get('/', (req, res) => {
    console.log('사용자가 메인 페이지에 접속했습니다');
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 라즈베리파이4로 텍스트 전송 API
app.post('/api/send-to-pi', async (req, res) => {
    try {
        // 클라이언트에서 보낸 데이터를 받습니다
        const { text, timestamp } = req.body;
        
        console.log(`라즈베리파이로 전송할 텍스트: "${text}"`);
        console.log(`전송 시간: ${timestamp}`);
        
        // 라즈베리파이4의 웹서버로 POST 요청을 보냅니다
        const response = await axios.post(`http://${RASPBERRY_PI_IP}:${RASPBERRY_PI_PORT}/receive-text`, {
            text: text,
            timestamp: timestamp,
            source: 'sign-language-translator'
        }, {
            timeout: 5000 // 5초 타임아웃
        });
        
        console.log('라즈베리파이로 전송 성공!');
        res.json({ 
            success: true, 
            message: 'Text sent successfully',
            piResponse: response.data 
        });
        
    } catch (error) {
        console.error('라즈베리파이 전송 오류:', error.message);
        
        // 에러 종류에 따라 다른 메시지 제공
        let errorMessage = '라즈베리파이 전송 실패';
        if (error.code === 'ECONNREFUSED') {
            errorMessage = '라즈베리파이에 연결할 수 없습니다. IP 주소와 포트를 확인하세요.';
        } else if (error.code === 'ETIMEDOUT') {
            errorMessage = '라즈베리파이 응답 시간이 초과되었습니다.';
        }
        
        res.status(500).json({ 
            success: false, 
            error: errorMessage,
            details: error.message 
        });
    }
});

// 서버 상태 확인 API
app.get('/api/status', (req, res) => {
    res.json({
        status: 'online',
        timestamp: new Date().toISOString(),
        raspberryPiTarget: `${RASPBERRY_PI_IP}:${RASPBERRY_PI_PORT}`
    });
});

// 건강 상태 체크 API (Render 배포용)
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString() 
    });
});

// 서버 시작
app.listen(PORT, () => {
    console.log('=================================');
    console.log(`🚀 서버가 포트 ${PORT}에서 실행 중입니다`);
    console.log(`📱 웹사이트: http://localhost:${PORT}`);
    console.log(`🤖 라즈베리파이 대상: ${RASPBERRY_PI_IP}:${RASPBERRY_PI_PORT}`);
    console.log('=================================');
});

// 에러 핸들링
process.on('uncaughtException', (error) => {
    console.error('예상치 못한 오류:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('처리되지 않은 Promise 거부:', reason);
});
