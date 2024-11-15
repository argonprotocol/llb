import emitter from '../emitters/basic';

export function showInsight(event: MouseEvent, data: any = {}, isSticky = false) {
  event.stopPropagation();
  event.preventDefault();
  const targetElem = event.currentTarget as HTMLElement;
  if (!targetElem) return;

  const id = targetElem.getAttribute('insightId') || '';
  const targetRect = targetElem.getBoundingClientRect();
  const positionAttr = targetElem.getAttribute('position') || '';
  const alignAttr = targetElem.getAttribute('align') || '';
  
  let x = 0;
  let y = 0;
  let width: number | null = null;
  let positionAt: 'top' | 'bottom' | 'left' | 'right' = 'bottom';
  let alignTo: 'top' | 'bottom' | 'left' | 'right' = 'left';

  let arrowX = 0;
  let arrowY = 0;

  if (alignAttr === 'grandparent') {
    const grandparentElem = targetElem.parentElement?.parentElement;
    if (!grandparentElem) return;
    const grandparentRect = grandparentElem.getBoundingClientRect();
    x = grandparentRect.left;
    width = grandparentRect.width + 3;
    arrowX = (targetRect.left - grandparentRect.left) + (targetRect.width / 2);

  } else if (alignAttr === 'right' || positionAttr === 'right') {
    alignTo = alignAttr === 'right' ? 'right' : alignTo;
    x = targetRect.left + targetRect.width;
    arrowX = targetRect.width / 2;

  } else {
    x = targetRect.left;
    arrowX = targetRect.width / 2;
  }

  if (positionAttr === 'top') {
    positionAt = 'top';
    y = targetRect.top;
  } else if (['left', 'right'].includes(positionAttr)) {
    positionAt = positionAttr as 'left' | 'right';
    y = targetRect.top + (targetRect.height / 2);
    arrowX = 0;
  } else {
    positionAt = 'bottom';
    y = targetRect.top + targetRect.height;
  }
    
  emitter.emit('showInsight', { id, x, y, width, positionAt, arrowX, arrowY, alignTo, data, isSticky });
}

export function hideInsight() {
  emitter.emit('hideInsight');
}