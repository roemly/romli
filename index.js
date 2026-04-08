import 'dotenv/config';
import express from 'express';
import multer from 'multer';
import { GoogleGenAI } from "@google/genai";

const app = express();
const upload = multer();
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey });

// **Set your default Gemini model here:**
const GEMINI_MODEL = "gemini-2.5-flash"; // Menggunakan 1.5-flash agar stabil, ganti ke 2.5 jika tersedia

app.use(express.json());

// Endpoint untuk memproses prompt teks dan gambar
app.post("/analyze", upload.single("image"), async (req, res) => {
  try {
    const { prompt } = req.body;
    const file = req.file;

    if (!prompt) {
      return res.status(400).json({ error: "Silakan masukkan prompt terlebih dahulu." });
    }

    let contents = [{ parts: [{ text: prompt }] }];

    // Jika ada file gambar, tambahkan ke dalam contents
    if (file) {
      contents[0].parts.push({
        inlineData: {
          mimeType: file.mimetype,
          data: file.buffer.toString("base64")
        }
      });
    }

    // Menggunakan SDK versi baru (@google/genai)
    const result = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: contents
    });

    res.json({ result: result.text });
  } catch (error) {
    console.error("Error Detail:", error);
    res.status(500).json({ error: "Terjadi kesalahan: " + error.message });
  }
});

// Halaman utama dengan textbox, upload image, dan tombol
app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="id">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Gemini AI Vision Practice</title>
        <style>
            body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                display: flex; 
                justify-content: center; 
                align-items: center; 
                min-height: 100vh; 
                margin: 0;
                background: linear-gradient(135deg, #1a2a6c 0%, #b21f1f 50%, #fdbb2d 100%);
            }
            .container { 
                background: white; 
                padding: 2.5rem; 
                border-radius: 15px; 
                box-shadow: 0 10px 25px rgba(0,0,0,0.3); 
                width: 100%;
                max-width: 500px; 
            }
            h2 { color: #333; text-align: center; margin-bottom: 1.5rem; }
            .input-group { margin-bottom: 1.5rem; }
            label { display: block; margin-bottom: 5px; font-weight: bold; color: #555; }
            textarea { 
                width: 100%; 
                height: 80px;
                padding: 12px; 
                border-radius: 8px; 
                border: 2px solid #ddd; 
                box-sizing: border-box; 
                resize: none;
                font-size: 1rem;
            }
            input[type="file"] {
                width: 100%;
                padding: 10px 0;
            }
            button { 
                width: 100%; 
                background: #b21f1f; 
                color: white; 
                border: none; 
                padding: 12px; 
                border-radius: 8px; 
                cursor: pointer; 
                font-weight: bold; 
                font-size: 1rem;
                transition: transform 0.2s, background 0.3s;
            }
            button:hover { background: #961919; transform: translateY(-2px); }
            button:disabled { background: #ccc; cursor: not-allowed; }
            #result-container { 
                margin-top: 25px; 
                padding: 15px;
                background: #f9f9f9;
                border-radius: 8px;
                border: 1px dashed #b21f1f;
                display: none;
            }
            #result { 
                white-space: pre-wrap; 
                font-size: 0.95rem; 
                line-height: 1.6; 
                color: #444;
            }
            .loader {
                border: 3px solid #f3f3f3;
                border-top: 3px solid #b21f1f;
                border-radius: 50%;
                width: 18px;
                height: 18px;
                animation: spin 1s linear infinite;
                display: inline-block;
                margin-right: 10px;
                vertical-align: middle;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h2>Gemini AI Vision</h2>
            
            <div class="input-group">
                <label for="prompt">Prompt Anda:</label>
                <textarea id="prompt" placeholder="Contoh: Apa isi gambar ini?"></textarea>
            </div>

            <div class="input-group">
                <label for="image">Unggah Gambar (Opsional):</label>
                <input type="file" id="image" accept="image/*">
            </div>

            <button id="sendBtn">Analisis</button>
            
            <div id="result-container">
                <strong>Respon AI:</strong>
                <div id="result"></div>
            </div>
        </div>

        <script>
            document.getElementById('sendBtn').onclick = async () => {
                const prompt = document.getElementById('prompt').value;
                const imageFile = document.getElementById('image').files[0];
                const resultContainer = document.getElementById('result-container');
                const resultDiv = document.getElementById('result');
                const btn = document.getElementById('sendBtn');

                if (!prompt.trim()) return alert('Mohon isi prompt!');

                btn.disabled = true;
                btn.innerHTML = '<span class="loader"></span> Sedang Menganalisis...';
                resultContainer.style.display = 'block';
                resultDiv.innerText = 'Tunggu sebentar...';

                const formData = new FormData();
                formData.append('prompt', prompt);
                if (imageFile) {
                    formData.append('image', imageFile);
                }

                try {
                    const res = await fetch('/analyze', {
                        method: 'POST',
                        body: formData
                    });
                    const data = await res.json();
                    resultDiv.innerText = data.result || data.error;
                } catch (err) {
                    resultDiv.innerText = 'Error: ' + err.message;
                } finally {
                    btn.disabled = false;
                    btn.innerHTML = 'Analisis';
                }
            };
        </script>
    </body>
    </html>
  `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server ready on http://localhost:${PORT}`));