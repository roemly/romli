import 'dotenv/config';
import express from 'express';
import { GoogleGenAI } from "@google/genai";

const app = express();
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey });

// **Set your default Gemini model here:**
const GEMINI_MODEL = "gemini-2.5-flash";

app.use(express.json());

// Endpoint untuk memproses prompt teks
app.post("/chat", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Silakan masukkan prompt terlebih dahulu." });
    }

    // System prompt untuk memberikan kepribadian pada AI
    const systemInstruction = `Anda adalah asisten virtual untuk agen travel umroh bernama "Umroh Berkah". 
Tugas Anda adalah melayani pertanyaan pelanggan mengenai paket umroh. Anda harus bersikap ramah, sopan, dan islami. 

Berikut adalah daftar paket umroh yang tersedia:
1. Paket Reguler (9 Hari): Harga Rp 25.000.000. Fasilitas: Hotel Bintang 3 (Makkah & Madinah), Pesawat Ekonomi, Makan 3x sehari.
2. Paket VIP (12 Hari): Harga Rp 35.000.000. Fasilitas: Hotel Bintang 5 (Makkah & Madinah jarak dekat), Pesawat Ekonomi, Makan full board.
3. Paket Plus Turki (15 Hari): Harga Rp 45.000.000. Fasilitas: Hotel Bintang 5, Tour Turki 3 hari, Pesawat Ekonomi Premium.

Jawablah pertanyaan user berdasarkan informasi di atas. Jika user bertanya di luar topik travel/umroh, arahkan agar kembali dengan sopan ke layanan umroh.

Pertanyaan User: ${prompt}`;

    // Menggunakan SDK versi baru (@google/genai)
    const result = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: systemInstruction
    });

    // Sesuaikan cara mengambil teks dari response SDK baru
    const text = result.text;

    res.json({ result: text });
  } catch (error) {
    console.error("Error Detail:", error);
    res.status(500).json({ error: "Terjadi kesalahan: " + error.message });
  }
});

// Halaman utama Website Umroh dengan widget chatbot di pojok kanan bawah
app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="id">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Umroh Berkah - Travel Umroh Terpercaya</title>
        <style>
            body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                margin: 0;
                background-color: #f4f7f6;
                color: #333;
            }
            header {
                background: linear-gradient(135deg, #0ba360 0%, #3cba92 100%);
                color: white;
                padding: 3rem 1rem;
                text-align: center;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            header h1 {
                margin: 0 0 10px 0;
                font-size: 2.5rem;
            }
            header p {
                margin: 0;
                font-size: 1.2rem;
                opacity: 0.9;
            }
            .content {
                padding: 3rem 1rem;
                max-width: 900px;
                margin: auto;
                text-align: center;
            }
            .packages {
                display: flex;
                gap: 1.5rem;
                justify-content: center;
                margin-top: 2rem;
                flex-wrap: wrap;
            }
            .package-card {
                background: white;
                padding: 2rem;
                border-radius: 12px;
                box-shadow: 0 6px 15px rgba(0,0,0,0.05);
                width: 250px;
                transition: transform 0.3s;
                border-top: 4px solid #0ba360;
            }
            .package-card:hover {
                transform: translateY(-5px);
            }
            .package-card h3 {
                color: #0ba360;
                margin-top: 0;
            }
            .package-card .price {
                font-size: 1.5rem;
                font-weight: bold;
                color: #333;
            }
            
            /* Chatbot Widget Styles */
            .chat-widget {
                position: fixed;
                bottom: 25px;
                right: 25px;
                width: 350px;
                background: white;
                border-radius: 16px;
                box-shadow: 0 8px 30px rgba(0,0,0,0.2);
                display: flex;
                flex-direction: column;
                overflow: hidden;
                font-size: 0.95rem;
                z-index: 1000;
                transition: all 0.3s ease;
            }
            .chat-header {
                background: #0ba360;
                color: white;
                padding: 16px;
                font-weight: bold;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .chat-header .close-btn {
                cursor: pointer;
                font-size: 1.2rem;
                opacity: 0.8;
            }
            .chat-header .close-btn:hover {
                opacity: 1;
            }
            .chat-body {
                height: 350px;
                padding: 15px;
                overflow-y: auto;
                display: flex;
                flex-direction: column;
                gap: 12px;
                background: #f9f9f9;
            }
            .chat-message {
                max-width: 85%;
                padding: 12px 16px;
                border-radius: 16px;
                line-height: 1.5;
                word-wrap: break-word;
            }
            .message-bot {
                background: #e8f5e9;
                align-self: flex-start;
                border-bottom-left-radius: 4px;
                color: #1b5e20;
            }
            .message-user {
                background: #0ba360;
                color: white;
                align-self: flex-end;
                border-bottom-right-radius: 4px;
            }
            .chat-footer {
                padding: 12px;
                background: white;
                display: flex;
                border-top: 1px solid #e0e0e0;
            }
            .chat-footer input {
                flex: 1;
                padding: 12px 15px;
                border: 1px solid #ddd;
                border-radius: 25px;
                outline: none;
                transition: border-color 0.3s;
            }
            .chat-footer input:focus {
                border-color: #0ba360;
            }
            .chat-footer button {
                background: #0ba360;
                color: white;
                border: none;
                padding: 0 18px;
                margin-left: 10px;
                border-radius: 25px;
                cursor: pointer;
                font-weight: bold;
                transition: background 0.3s;
            }
            .chat-footer button:hover {
                background: #087f4b;
            }
            .chat-toggle {
                position: fixed;
                bottom: 25px;
                right: 25px;
                background: #0ba360;
                color: white;
                width: 65px;
                height: 65px;
                border-radius: 50%;
                display: flex;
                justify-content: center;
                align-items: center;
                font-size: 28px;
                box-shadow: 0 4px 15px rgba(0,163,96,0.4);
                cursor: pointer;
                z-index: 1001;
                transition: transform 0.3s;
            }
            .chat-toggle:hover {
                transform: scale(1.05);
            }
            
            /* Typing indicator */
            .typing-indicator span {
                display: inline-block;
                width: 6px;
                height: 6px;
                background-color: #0ba360;
                border-radius: 50%;
                margin: 0 2px;
                animation: typing 1s infinite;
            }
            .typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
            .typing-indicator span:nth-child(3) { animation-delay: 0.4s; }
            @keyframes typing {
                0%, 100% { transform: translateY(0); opacity: 0.4; }
                50% { transform: translateY(-4px); opacity: 1; }
            }
        </style>
    </head>
    <body>
        <header>
            <h1>🕋 Umroh Berkah</h1>
            <p>Melayani dengan Sepenuh Hati, Mengantarkan Tamu Allah ke Tanah Suci</p>
        </header>

        <div class="content">
            <h2>Pilihan Paket Umroh Kami</h2>
            <div class="packages">
                <div class="package-card">
                    <h3>Paket Reguler</h3>
                    <p>Perjalanan 9 Hari</p>
                    <p>Fasilitas Hotel Bintang 3</p>
                    <div class="price">Rp 25.000.000</div>
                </div>
                <div class="package-card">
                    <h3>Paket VIP</h3>
                    <p>Perjalanan 12 Hari</p>
                    <p>Fasilitas Hotel Bintang 5</p>
                    <div class="price">Rp 35.000.000</div>
                </div>
                <div class="package-card">
                    <h3>Paket Plus Turki</h3>
                    <p>Perjalanan 15 Hari</p>
                    <p>Fasilitas Hotel Bintang 5 + Tour</p>
                    <div class="price">Rp 45.000.000</div>
                </div>
            </div>
            
            <p style="margin-top: 40px; color: #666; max-width: 600px; margin-left: auto; margin-right: auto;">
                Tanya lebih lanjut? Silakan klik tombol live chat di pojok kanan bawah untuk berkomunikasi dengan Customer Service.
            </p>
        </div>

        <!-- Chat Toggle Button -->
        <div class="chat-toggle" id="chatToggle">
            💬
        </div>

        <!-- Chat Widget -->
        <div class="chat-widget" id="chatWidget" style="display: none;">
            <div class="chat-header">
                <div>
                    <span style="font-size: 1.2rem; margin-right: 8px;">🕋</span> Asisten Umroh
                </div>
                <div class="close-btn" id="closeChat">✖</div>
            </div>
            <div class="chat-body" id="chatBody">
                <div class="chat-message message-bot">
                    Assalamu'alaikum Warahmatullahi Wabarakatuh. 🙏<br><br>
                    Selamat datang di Umroh Berkah. Ada yang bisa saya bantu terkait keberangkatan atau pilihan paket umroh?
                </div>
            </div>
            <div class="chat-footer">
                <input type="text" id="prompt" placeholder="Ketik pesan Anda di sini..." onkeypress="handleKeyPress(event)">
                <button id="sendBtn" onclick="sendMessage()">Kirim</button>
            </div>
        </div>

        <script>
            const chatWidget = document.getElementById('chatWidget');
            const chatToggle = document.getElementById('chatToggle');
            const closeChat = document.getElementById('closeChat');
            const chatBody = document.getElementById('chatBody');
            const promptInput = document.getElementById('prompt');
            const sendBtn = document.getElementById('sendBtn');

            chatToggle.onclick = () => {
                chatWidget.style.display = 'flex';
                chatToggle.style.display = 'none';
                promptInput.focus();
            };

            closeChat.onclick = () => {
                chatWidget.style.display = 'none';
                chatToggle.style.display = 'flex';
            };

            function addMessage(text, sender, isHtml = false) {
                const msgDiv = document.createElement('div');
                msgDiv.className = 'chat-message message-' + sender;
                if (isHtml) {
                    msgDiv.innerHTML = text;
                } else {
                    msgDiv.innerText = text;
                }
                chatBody.appendChild(msgDiv);
                chatBody.scrollTop = chatBody.scrollHeight;
                return msgDiv;
            }

            async function sendMessage() {
                const prompt = promptInput.value;
                if (!prompt.trim()) return;

                addMessage(prompt, 'user');
                promptInput.value = '';
                promptInput.disabled = true;
                sendBtn.disabled = true;
                
                // Add typing indicator
                const typingHtml = '<div class="typing-indicator"><span></span><span></span><span></span></div>';
                const typingDiv = addMessage(typingHtml, 'bot', true);

                try {
                    const res = await fetch('/chat', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ prompt })
                    });
                    const data = await res.json();
                    
                    typingDiv.remove();
                    
                    // Simple formatting for markdown-like text (line breaks and bold text)
                    let formattedText = (data.result || data.error)
                        .replace(/\\n/g, '<br>')
                        .replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>');
                        
                    addMessage(formattedText, 'bot', true);
                } catch (err) {
                    typingDiv.remove();
                    addMessage('Mohon maaf, sistem sedang sibuk: ' + err.message, 'bot');
                } finally {
                    promptInput.disabled = false;
                    sendBtn.disabled = false;
                    promptInput.focus();
                }
            }

            function handleKeyPress(e) {
                if (e.key === 'Enter') {
                    sendMessage();
                }
            }
        </script>
    </body>
    </html>
  `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(\`Server ready on http://localhost:\${PORT}\`));