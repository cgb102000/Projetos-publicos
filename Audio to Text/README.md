# Audio to Text

Transcreve arquivos de áudio para texto usando o [Whisper](https://github.com/openai/whisper), da OpenAI, rodando localmente (sem API paga).

## Versões

- **Web** (`app.py`): página para enviar o áudio, escolher o idioma, copiar ou baixar a transcrição. O áudio é apagado do servidor logo após a transcrição.
- **Desktop** (`indexok.py`): janela simples feita com Tkinter.

## Como rodar

Requer Python 3.9+ e o [FFmpeg](https://ffmpeg.org/download.html) instalado e no PATH.

```bash
pip install -r requirements.txt
python app.py
```

Abra http://localhost:5000.

Variáveis opcionais:

- `WHISPER_MODEL`: `tiny`, `base`, `small` (padrão), `medium` ou `large`. Modelos maiores são mais precisos e mais lentos.
- `FLASK_DEBUG=1`: liga o modo de depuração.

## Deploy

O Whisper precisa de bastante memória (o modelo `small` usa cerca de 2 GB), então não funciona em funções serverless como Vercel ou no GitHub Pages. Use um servidor com Python, como Render, Railway ou uma VPS. O `Procfile` já inicia com o Gunicorn.
