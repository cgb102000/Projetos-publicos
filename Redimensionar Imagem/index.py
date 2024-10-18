import tkinter as tk
from tkinter import filedialog, messagebox, ttk
from PIL import Image
import os

class RedimensionadorApp:
    def __init__(self, master):
        self.master = master
        self.master.title("Redimensionador de Imagem")
        self.master.geometry("800x600")
        self.master.resizable(False, False)
        self.master.configure(bg="#e6f2ff")

        # Estilo
        self.style = ttk.Style()
        self.style.configure("TButton", font=("Arial", 12), padding=10)
        self.style.configure("TLabel", font=("Arial", 12), background="#e6f2ff")
        self.style.configure("TEntry", font=("Arial", 12), padding=5)

        # Frame principal
        self.frame_principal = ttk.Frame(master, padding=20)
        self.frame_principal.pack(pady=20)

        # Título
        self.label_titulo = ttk.Label(self.frame_principal, text="Redimensionador de Imagem", font=("Arial", 20), foreground="#003366")
        self.label_titulo.grid(row=0, column=0, columnspan=2, pady=(0, 20))

        # Caminho das imagens
        self.label_caminho = ttk.Label(self.frame_principal, text="Caminho das Imagens:")
        self.label_caminho.grid(row=1, column=0, sticky=tk.W)

        self.entry_caminho = ttk.Entry(self.frame_principal, width=50)
        self.entry_caminho.grid(row=1, column=1)

        self.botao_procurar = ttk.Button(self.frame_principal, text="Procurar Imagens", command=self.procurar_imagens)
        self.botao_procurar.grid(row=1, column=2, padx=(10, 0))

        # Novo tamanho
        self.label_tamanho = ttk.Label(self.frame_principal, text="Novo Tamanho (Largura x Altura):")
        self.label_tamanho.grid(row=2, column=0, pady=(20, 5), sticky=tk.W)

        self.entry_largura = ttk.Entry(self.frame_principal, width=10)
        self.entry_largura.grid(row=2, column=1, sticky=tk.W)

        self.label_x = ttk.Label(self.frame_principal, text="x")
        self.label_x.grid(row=2, column=1)

        self.entry_altura = ttk.Entry(self.frame_principal, width=10)
        self.entry_altura.grid(row=2, column=1, columnspan=2)

        # Caminho para salvar
        self.label_salvar = ttk.Label(self.frame_principal, text="Salvar Na Pasta:")
        self.label_salvar.grid(row=3, column=0, pady=(20, 5), sticky=tk.W)

        self.entry_salvar = ttk.Entry(self.frame_principal, width=50)
        self.entry_salvar.grid(row=3, column=1)

        self.botao_procurar_salvar = ttk.Button(self.frame_principal, text="Escolher Pasta", command=self.escolher_pasta_salvar)
        self.botao_procurar_salvar.grid(row=3, column=2, padx=(10, 0))

        # Botão de redimensionar
        self.botao_redimensionar = ttk.Button(self.frame_principal, text="Redimensionar", command=self.redimensionar_imagens)
        self.botao_redimensionar.grid(row=4, column=0, columnspan=3, pady=20)

        # Rodapé
        self.label_rodape = ttk.Label(master, text="Desenvolvido por Caio", font=("Arial", 10), foreground="#666666")
        self.label_rodape.pack(side=tk.BOTTOM, pady=(0, 10))

    def procurar_imagens(self):
        caminhos = filedialog.askopenfilenames(title="Escolha imagens", filetypes=[("Image Files", "*.*")])
        if caminhos:
            self.entry_caminho.delete(0, tk.END)
            self.entry_caminho.insert(0, ', '.join(caminhos))

    def escolher_pasta_salvar(self):
        caminho_salvar = filedialog.askdirectory()
        if caminho_salvar:
            self.entry_salvar.delete(0, tk.END)
            self.entry_salvar.insert(0, caminho_salvar)

    def redimensionar_imagens(self):
        caminhos_imagens = self.entry_caminho.get().split(', ')
        largura = self.entry_largura.get()
        altura = self.entry_altura.get()
        caminho_salvar = self.entry_salvar.get()

        if not largura.isdigit() or not altura.isdigit():
            messagebox.showerror("Erro", "Por favor, insira um tamanho válido.")
            return

        largura = int(largura)
        altura = int(altura)

        if not os.path.exists(caminho_salvar):
            messagebox.showerror("Erro", "Caminho de salvamento não existe.")
            return

        try:
            for caminho_imagem in caminhos_imagens:
                with Image.open(caminho_imagem) as img:
                    img_redimensionada = img.resize((largura, altura))
                    nome_imagem = os.path.basename(caminho_imagem)
                    novo_caminho = os.path.join(caminho_salvar, f"redimensionado_{nome_imagem}")
                    img_redimensionada.save(novo_caminho)
            
            messagebox.showinfo("Sucesso", f"{len(caminhos_imagens)} imagens redimensionadas com sucesso!")
        except Exception as e:
            messagebox.showerror("Erro", str(e))


if __name__ == "__main__":
    root = tk.Tk()
    app = RedimensionadorApp(root)
    root.mainloop()
