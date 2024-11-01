import React, { useState } from 'react';

const Chatbot = () => {
   const [messages, setMessages] = useState([]);  // 사용자 질문 및 GPT 답변 저정
   const [userInput, setUserInput] = useState(''); // 사용자 질문 
   const [loading, setLoading] = useState(false);  // 답변 진행상황 정의

   const apiKey = process.env.REACT_APP_CHATGPT_KEY;  // 사용자 키 입력
   const apiEndpoint = 'https://api.openai.com/v1/chat/completions'; // 기본 url

   // 새로운 질문 및 답변 추가
   const addMessage = (sender, message) => {
      setMessages(prevMessages => [...prevMessages, { sender, message }]);
   };

   // 사용자에게 입력받은 질문을 이용해 챗GPT에게 요청 및 응답
   const handleSendMessage = async () => {
      const message = userInput.trim();  //문자열 좌우에서 공백 제거
      if (message.length === 0) return; // 입력값이 없으면 아무값도 전달하지 않음

      addMessage('user', message); // 사용자 질문 messages 객체에 추가
      setUserInput('');   // 입력란 초기화
      setLoading(true);   // 답변 요청값 변경

      try {
         // 답변 요청
         const response = await fetch(apiEndpoint, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',    // 전송 타입
               'Authorization': `Bearer ${apiKey}`,   // 사용자 키 지정
            },
            // JSON 타입으로 GPT 옵션 지정하기
            body: JSON.stringify({
               model: 'gpt-3.5-turbo',
               messages: [{ role: 'user', content: message }],
               max_tokens: 1024, // 답변 최대 글자 수, 
               top_p: 1, // 다음 단어를 선택할 때 상위 p%의 확률 분포를 사용하는 매개변수, 높을수록 안정된 선택
               temperature: 1, // 답변의 다양성과 창의성, 낮을수록 일관적 (0~2)
               frequency_penalty: 0.5, // 전문적 단어의 빈도, 낮을수록 전문적 (0~1)
               presence_penalty: 0.5, // 반복되는 구문 억제, 낮을수록 억제하지 않음 (0~1)
               stop: ['문장 생성 중단 단어'],
            }),
         });
         
         const data = await response.json();  // 답변 읽어오기
         const aiResponse = data.choices?.[0]?.message?.content || 'No response';
         addMessage('bot', aiResponse); // 챗봇 답변 messages 객체에 추가
      } catch (error) {
         console.error('오류 발생!', error);
         addMessage('오류 발생!');
      } finally {
         setLoading(false);  // 실행 완료후 상태 변경
      }
   };

   // Enter 키로 입력완료
   const handleKeyDown = (event) => {
      if (event.key === 'Enter') {
         handleSendMessage();
      }
   };

   //  결과 화면에 출력
   return (
      <div id='chat-container'>
         <div className='title'>
            <h2>ChatGPT-3.5 챗봇</h2>
         </div>
         <div id='chat-messages'>
            {/* 상태에 따른 내용 출력 결정 */}
            {loading && <span className="messageWait">답변을 기다리고 있습니다</span>}

            {/* 사용자 질문 및 답변 출력 */}
            {messages.map((msg, index) => (
               <div key={index} className={`message ${msg.sender}`}>
                  {/* 사용자 및 챗봇에 따를 메세지 출력 */}
                  {`${msg.sender === 'user' ? '나' : '챗봇'} : ${msg.message}`}
               </div>
            ))}
         </div>
         <div id='user-input'>
            <input
               type='text' placeholder='메시지를 입력하세요'
               value={userInput} onChange={(e) => setUserInput(e.target.value)}
               onKeyDown={handleKeyDown}
            />
            <button onClick={handleSendMessage}>전송</button>
         </div>
      </div>
   );
};

export default Chatbot;