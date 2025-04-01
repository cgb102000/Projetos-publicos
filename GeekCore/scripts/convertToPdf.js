const fs = require('fs');
const path = require('path');
const markdown = require('markdown-pdf');

const inputFile = path.join(__dirname, '..', 'README.md');
const outputFile = path.join(__dirname, '..', 'docs', 'GeekCore-Documentacao.pdf');

// Garantir que o diretório docs existe
if (!fs.existsSync(path.join(__dirname, '..', 'docs'))) {
  fs.mkdirSync(path.join(__dirname, '..', 'docs'));
}

// Opções de conversão
const options = {
  cssPath: path.join(__dirname, 'pdf-style.css'),
  paperFormat: 'A4',
  paperBorder: '1cm',
  renderDelay: 1000,
  runningsPath: path.join(__dirname, 'header-footer.js')
};

// Converter markdown para PDF
markdown(options)
  .from(inputFile)
  .to(outputFile, function () {
    console.log('PDF gerado com sucesso:', outputFile);
  });
