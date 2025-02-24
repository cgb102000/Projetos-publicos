# utils/summarize.py

def generate_summary(transcription):
    # Este é um exemplo simples de resumo.
    sentences = transcription.split(". ")
    summary = ". ".join(sentences[:3])  # Pega as 3 primeiras sentenças como resumo
    return summary
