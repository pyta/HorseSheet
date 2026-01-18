import { ref } from 'vue';

export function useConfirm() {
  const show = ref(false);
  const title = ref('');
  const message = ref('');
  const confirmText = ref('Confirm');
  const cancelText = ref('Cancel');
  let resolvePromise: ((value: boolean) => void) | null = null;

  function confirm(
    msg: string,
    options?: { title?: string; confirmText?: string; cancelText?: string }
  ): Promise<boolean> {
    return new Promise((resolve) => {
      message.value = msg;
      title.value = options?.title || 'Confirm';
      confirmText.value = options?.confirmText || 'Confirm';
      cancelText.value = options?.cancelText || 'Cancel';
      show.value = true;
      resolvePromise = resolve;
    });
  }

  function handleConfirm() {
    show.value = false;
    if (resolvePromise) {
      resolvePromise(true);
      resolvePromise = null;
    }
  }

  function handleCancel() {
    show.value = false;
    if (resolvePromise) {
      resolvePromise(false);
      resolvePromise = null;
    }
  }

  return {
    show,
    title,
    message,
    confirmText,
    cancelText,
    confirm,
    handleConfirm,
    handleCancel,
  };
}
