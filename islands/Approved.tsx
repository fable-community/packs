import { useSignal } from '@preact/signals';
import IconCheckmark from 'icons/check.tsx';

export const Approved = () => {
  const tooltipVisible = useSignal(false);

  const tooltipPosition = useSignal({ top: 5, left: 25 });

  const showTooltip = () => tooltipVisible.value = true;
  const hideTooltip = () => tooltipVisible.value = false;

  return (
    <div
      className='relative ml-2 p-0.5 bg-white rounded-full'
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
    >
      <IconCheckmark class='w-3 h-3 text-background' />
      {tooltipVisible.value && (
        <div
          className='absolute bg-highlight font-bold text-white text-sm rounded px-2 py-1 z-10'
          style={{
            top: tooltipPosition.value.top,
            left: tooltipPosition.value.left,
          }}
        >
          Official
        </div>
      )}
    </div>
  );
};
