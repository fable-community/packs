window.onload = () => {
  const dialogs = document.querySelectorAll('[data-dialog]');

  // handle buttons that want to show a dialog
  dialogs.forEach((ele) =>
    ele.onmousedown = () => {
      const name = ele.getAttribute('data-dialog');
      document.querySelectorAll(`[data-dialog-cb="${name}"]`).forEach((ele) => {
        ele.style.visibility = 'visible';
      });
    }
  );

  const dialogsCancels = document.querySelectorAll('[data-dialog-cancel]');

  // handle buttons that want to cancel a dialog
  dialogsCancels.forEach((ele) =>
    ele.onmousedown = () => {
      const name = ele.getAttribute('data-dialog-cancel');

      document.querySelectorAll(`[data-dialog-cb="${name}"]`).forEach((ele) => {
        const action = ele.getAttribute('data-dialog-cb-action');

        switch (action) {
          case 'back':
            window.open('/', '_self');
            break;
          case 'hide':
            ele.style.visibility = 'hidden';
            break;
          default:
            break;
        }
      });
    }
  );

  // pressing `esc` will cancel all dialogs
  onkeydown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();

      document.querySelectorAll('[data-dialog-cb]').forEach((ele) => {
        const action = ele.getAttribute('data-dialog-cb-action');

        switch (action) {
          case 'back':
            window.open('/', '_self');
            break;
          case 'hide':
            ele.style.visibility = 'hidden';
            break;
          default:
            break;
        }
      });
    }
  };
};
