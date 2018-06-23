/* eslint no-plusplus: 0 */
/* eslint comma-dangle: 0 */
/* eslint class-methods-use-this: 0 */
/* eslint consistent-return: 0 */
/* eslint array-callback-return: 0 */

export const Position = {
  left: 0,
  top: 0
};

export const PositionDiff = {
  x: 0,
  y: 0
};

export const MarginOptions = {
  top: 0,
  right: 0,
  bottom: 0,
  left: 0
};

export const DraggableValue = {
  handle: null,
  onPositionChange: () => {},
  resetInitialPos: false,
  stopDragging: false,
  boundingRect: null,
  boundingElement: null,
  boundingRectMargin: MarginOptions,
  initialPosition: null
};

export const DraggableBindings = {
  value: DraggableValue
};

export const DraggableState = {
  initialPosition: null,
  startDragPosition: null,
  currentDragPosition: null,
  initialMousePos: null
};

function extractHandle(handle) {
  return handle && handle.$el;
}

function getPosWithBoundaries(elementRect, boundingRect, left, top, boundingRectMargin = {}) {
  const adjustedPos = { left, top };
  const { height, width } = elementRect;
  const topRect = top;
  const bottomRect = top + height;
  const leftRect = left;
  const rightRect = left + width;
  const marginTop = boundingRectMargin.top || 0;
  const marginBottom = boundingRectMargin.bottom || 0;
  const marginLeft = boundingRectMargin.left || 0;
  const marginRight = boundingRectMargin.right || 0;
  const topBoundary = boundingRect.top + marginTop;
  const bottomBoundary = boundingRect.bottom - marginBottom;
  const leftBoundary = boundingRect.left + marginLeft;
  const rightBoundary = boundingRect.right - marginRight;

  if (topRect < topBoundary) {
    adjustedPos.top = topBoundary;
  } else if (bottomRect > bottomBoundary) {
    adjustedPos.top = bottomBoundary - height;
  }

  if (leftRect < leftBoundary) {
    adjustedPos.left = leftBoundary;
  } else if (rightRect > rightBoundary) {
    adjustedPos.left = rightBoundary - width;
  }

  return adjustedPos;
}

export const Draggable = {
  bind(el, binding) {
    Draggable.update(el, binding);
  },

  update(el, binding) {
    if (binding.value && binding.value.stopDragging) {
      return;
    }

    const handler =
      (binding.value && binding.value.handle && extractHandle(binding.value.handle)) || el;

    function getState() {
      return JSON.parse(handler.getAttribute('draggable-state')) || {};
    }

    function setState(partialState) {
      const prevState = getState();
      const state = {
        ...prevState,
        ...partialState
      };
      handler.setAttribute('draggable-state', JSON.stringify(state));
    }

    function getRectPosition() {
      const clientRect = el.getBoundingClientRect();
      if (!clientRect.height || !clientRect.width) {
        return;
      }
      return { left: clientRect.left, top: clientRect.top };
    }

    function getInitialMousePosition(event) {
      return event && {
        left: event.clientX,
        top: event.clientY
      };
    }

    function updateElementStyle() {
      const state = getState();
      if (!state.currentDragPosition) {
        return;
      }
      el.style.position = 'fixed';
      el.style.left = `${state.currentDragPosition.left}px`;
      el.style.top = `${state.currentDragPosition.top}px`;
    }

    function initializeState(event) {
      const state = getState();
      const initialRectPositionFromBinding =
        binding && binding.value && binding.value.initialPosition;
      const initialRectPositionFromState = state.initialPosition;
      const startingDragPosition = getRectPosition();
      const initialPosition =
        initialRectPositionFromBinding || initialRectPositionFromState || startingDragPosition;

      setState({
        initialPosition,
        startDragPosition: initialPosition,
        currentDragPosition: initialPosition,
        initialMousePos: getInitialMousePosition(event)
      });
      updateElementStyle();
    }

    function handlePositionChanged(event) {
      const state = getState();
      const posDiff = { x: 0, y: 0 };
      if (state.currentDragPosition && state.startDragPosition) {
        posDiff.x = state.currentDragPosition.left - state.startDragPosition.left;
        posDiff.y = state.currentDragPosition.top - state.startDragPosition.top;
      }
      const currentPosition = state.currentDragPosition && { ...state.currentDragPosition };

      if (binding.value && binding.value.onPositionChange && state) {
        binding.value.onPositionChange(posDiff, currentPosition, event);
      }
    }

    function getBoundingRect() {
      if (!binding.value) {
        return;
      }
      return binding.value.boundingRect
        || (binding.value.boundingElement && binding.value.boundingElement.getBoundingClientRect());
    }

    function mouseMove(event) {
      event.preventDefault();
      const stopDragging = binding.value && binding.value.stopDragging;
      if (stopDragging) {
        return;
      }
      let state = getState();
      if (!state.startDragPosition || !state.initialMousePos) {
        initializeState(event);
        state = getState();
      }

      const dx = event.clientX - state.initialMousePos.left;
      const dy = event.clientY - state.initialMousePos.top;

      let currentDragPosition = {
        left: state.startDragPosition.left + dx,
        top: state.startDragPosition.top + dy
      };

      const boundingRect = getBoundingRect();
      const elementRect = el.getBoundingClientRect();

      if (boundingRect && elementRect) {
        currentDragPosition = getPosWithBoundaries(
          elementRect,
          boundingRect,
          currentDragPosition.left,
          currentDragPosition.top,
          binding.value.boundingRectMargin
        );
      }

      setState({ currentDragPosition });
      updateElementStyle();
      handlePositionChanged(event);
    }

    function mouseUp() {
      const currentRectPosition = getRectPosition();
      setState({
        initialMousePos: undefined,
        startDragPosition: currentRectPosition,
        currentDragPosition: currentRectPosition
      });

      document.removeEventListener('mousemove', mouseMove);
      document.removeEventListener('mouseup', mouseUp);
    }

    function mouseDown(event) {
      setState({ initialMousePos: getInitialMousePosition(event) });
      handlePositionChanged(event);
      document.addEventListener('mousemove', mouseMove);
      document.addEventListener('mouseup', mouseUp);
    }

    if (binding && binding.value && binding.value.resetInitialPos) {
      initializeState();
      handlePositionChanged();
    }

    if (!handler.getAttribute('draggable')) {
      el.removeEventListener('mousedown', el.listener);
      handler.setAttribute('draggable', 'true');
      handler.addEventListener('mousedown', mouseDown);
      el.listener = mouseDown;
      initializeState();
      handlePositionChanged();
    }
  }
};
