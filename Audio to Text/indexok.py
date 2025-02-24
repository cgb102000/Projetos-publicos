import tkinter as tk
from tkinter import filedialog, messagebox
import whisper
import threading

def transcribe_audio():
    file_path = filedialog.askopenfilename(filetypes=[("Audio Files", "*.mp3;*.wav;*.ogg;*.m4a")])
    if not file_path:
        return
    
    status_label.config(text="Transcrevendo... Aguarde...")
    transcribe_button.config(state=tk.DISABLED)
    
    def process():
        try:
            model = whisper.load_model("medium")  # Altere para "small" ou "large" conforme necessário
            result = model.transcribe(file_path)
            
            text_output.delete("1.0", tk.END)
            text_output.insert(tk.END, result["text"])
            
            status_label.config(text="Transcrição concluída!")
        except Exception as e:
            messagebox.showerror("Erro", f"Ocorreu um erro: {str(e)}")
            status_label.config(text="Erro na transcrição")
        
        transcribe_button.config(state=tk.NORMAL)
    
    threading.Thread(target=process, daemon=True).start()

# Criando a interface
top = tk.Tk()
top.title("Transcrição de Áudio com Whisper")
top.geometry("500x400")

title_label = tk.Label(top, text="Selecione um arquivo de áudio para transcrição", font=("Arial", 12))
title_label.pack(pady=10)

transcribe_button = tk.Button(top, text="Selecionar e Transcrever", command=transcribe_audio, font=("Arial", 12))
transcribe_button.pack(pady=10)

status_label = tk.Label(top, text="", font=("Arial", 10))
status_label.pack()

text_output = tk.Text(top, wrap=tk.WORD, height=10)
text_output.pack(padx=10, pady=10, fill=tk.BOTH, expand=True)

top.mainloop()
