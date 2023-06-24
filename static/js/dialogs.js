export function showDialog(name) {
  document.querySelectorAll(`[data-dialog-cb="${name}"]`).forEach((ele) => {
    ele.style.display = 'inherit';
  });
}

export function hideDialog(name) {
  document.querySelectorAll(`[data-dialog-cb="${name}"]`).forEach((ele) => {
    const action = ele.getAttribute('data-dialog-cb-action');

    switch (action) {
      case 'back':
        open('/', '_self');
        break;
      case 'hide':
        ele.style.display = 'none';
        break;
      default:
        break;
    }
  });
}

addEventListener('load', () => {
  const dialogs = document.querySelectorAll('[data-dialog]');

  // handle buttons that want to show a dialog
  dialogs.forEach((ele) => {
    ele.addEventListener('click', () => {
      const name = ele.getAttribute('data-dialog');
      showDialog(name);
    });
  });

  const dialogsCancels = document.querySelectorAll('[data-dialog-cancel]');

  // handle buttons that want to cancel a dialog

  dialogsCancels.forEach((ele) => {
    ele.addEventListener('click', () => {
      const name = ele.getAttribute('data-dialog-cancel');
      hideDialog(name);
    });
  });

  // press `esc` to close dialogs
  onkeydown = (e) => {
    if (e.key === 'Escape') {
      const elements = [
        ...document.querySelectorAll('[data-dialog-cb="info"]'),
        ...document.querySelectorAll('[data-dialog-cb="media"]'),
        ...document.querySelectorAll('[data-dialog-cb="characters"]'),
        ...document.querySelectorAll('[data-dialog-cb="maintainers"]'),
      ];

      elements.forEach(
        (ele) => {
          e.preventDefault();
          ele.style.display = 'none';
        },
      );
    }
  };
});
