window.components = {
  createWatchButton(href, text = 'Assistir') {
    return `
      <a href="${href}" class="btn-watch">
        ${text}
      </a>
    `;
  }
};
