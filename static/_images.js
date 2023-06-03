addEventListener('load', () => {
  const inputs = document.querySelectorAll('[data-image]');

  inputs.forEach((ele) =>
    ele.onchange = (ev) => {
      const name = ele.getAttribute('data-image');

      const target = document.querySelector(`[data-image-cb="${name}"]`);
      const placeholder = document.querySelector(`[data-image-ph="${name}"]`);

      const blob = URL.createObjectURL(ev.target.files[0]);

      target.src = blob;
      target.onload = () => {
        URL.revokeObjectURL(blob);
        placeholder?.remove();
      };
    }
  );
});
