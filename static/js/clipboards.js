addEventListener('load', () => {
  const clipboards = document.querySelectorAll('[data-clipboard]');

  clipboards.forEach((ele) => {
    ele.addEventListener('click', () => {
      const value = ele.getAttribute('data-clipboard');
      navigator.clipboard.writeText(value);
    });
  });
});
