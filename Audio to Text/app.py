import os
import tempfile

from flask import Flask, jsonify, render_template, request
from werkzeug.utils import secure_filename

EXTENSOES_PERMITIDAS = {".mp3", ".wav", ".ogg", ".m4a", ".webm", ".mp4", ".flac"}
MODELO = os.getenv("WHISPER_MODEL", "small")

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 50 * 1024 * 1024  # 50 MB

_modelo = None


def obter_modelo():
    """Carrega o Whisper só na primeira transcrição (o servidor sobe mais rápido)."""
    global _modelo
    if _modelo is None:
        import whisper

        _modelo = whisper.load_model(MODELO, device="cpu")
    return _modelo


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/transcribe", methods=["POST"])
def transcribe():
    arquivo = request.files.get("audio")
    if arquivo is None or not arquivo.filename:
        return jsonify({"error": "Nenhum arquivo foi enviado"}), 400

    nome = secure_filename(arquivo.filename)
    extensao = os.path.splitext(nome)[1].lower()
    if extensao not in EXTENSOES_PERMITIDAS:
        return jsonify({"error": "Formato não suportado. Use MP3, WAV, OGG, M4A, WEBM, MP4 ou FLAC."}), 400

    idioma = request.form.get("language") or None

    # Salva em um arquivo temporário e apaga logo depois da transcrição
    with tempfile.NamedTemporaryFile(suffix=extensao, delete=False) as temporario:
        arquivo.save(temporario)
        caminho = temporario.name

    try:
        resultado = obter_modelo().transcribe(caminho, language=idioma, fp16=False)
        return jsonify({
            "transcription": resultado["text"].strip(),
            "language": resultado.get("language"),
            "filename": f"{os.path.splitext(nome)[0] or 'transcricao'}.txt",
        })
    except Exception as erro:  # noqa: BLE001 - devolve a mensagem para a interface
        app.logger.exception("Falha na transcrição")
        return jsonify({"error": f"Erro na transcrição: {erro}"}), 500
    finally:
        os.remove(caminho)


@app.errorhandler(413)
def arquivo_grande(_erro):
    return jsonify({"error": "Arquivo muito grande. O limite é 50 MB."}), 413


if __name__ == "__main__":
    app.run(debug=os.getenv("FLASK_DEBUG") == "1", port=int(os.getenv("PORT", "5000")))
