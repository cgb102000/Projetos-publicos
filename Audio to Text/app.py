from flask import Flask, render_template, request, jsonify
import whisper
import os

# Configuração do diretório de upload
UPLOAD_FOLDER = os.path.join('static', 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Carrega o modelo Whisper apenas uma vez ao iniciar o servidor
model = whisper.load_model("small", device="cpu")

app = Flask(__name__)

# Página principal
@app.route('/')
def index():
    return render_template('index.html')

# Endpoint para transcrever áudio
@app.route('/transcribe', methods=['POST'])
def transcribe():
    if 'audio' not in request.files:
        return jsonify({"error": "Nenhum arquivo foi enviado"}), 400

    audio_file = request.files['audio']
    
    if audio_file.filename == '':
        return jsonify({"error": "Nome do arquivo inválido"}), 400

    try:
        # Salva o arquivo no diretório de uploads
        file_path = os.path.join(UPLOAD_FOLDER, audio_file.filename)
        audio_file.save(file_path)

        # Faz a transcrição usando o modelo Whisper
        result = model.transcribe(file_path)
        transcription_text = result["text"]

        # Salva a transcrição em um arquivo .txt
        transcription_filename = f"{os.path.splitext(audio_file.filename)[0]}.txt"
        transcription_path = os.path.join(UPLOAD_FOLDER, transcription_filename)

        with open(transcription_path, "w", encoding="utf-8") as transcription_file:
            transcription_file.write(transcription_text)

        # Retorna o link do arquivo .txt para o frontend
        return jsonify({
            "transcription": transcription_text,
            "transcription_url": f"/static/uploads/{transcription_filename}"
        })

    except Exception as e:
        return jsonify({"error": f"Erro na transcrição: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True)
