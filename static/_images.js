addEventListener('load', () => {
  const inputs = document.querySelectorAll('[data-image]');

  inputs.forEach((ele) =>
    ele.onchange = (ev) => {
      const name = ele.getAttribute('data-image');

      document.querySelectorAll(`[data-image-cb="${name}"]`).forEach((ele) => {
        ele.src = URL.createObjectURL(ev.target.files[0]);
        ele.onload = () => URL.revokeObjectURL(ele.src);
      });
    }
  );
});
