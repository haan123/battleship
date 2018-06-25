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

export const Draggable = {
  bind(el, binding) {
    Draggable.update(el, binding);
  },

  update(el, binding) {
    if (binding.value && binding.value.stopDragging) {
      return;
    }

    let currentDroppable = null;

    const handler =
      (binding.value && binding.value.handle && extractHandle(binding.value.handle)) || el;

    function getContainerRect() {
      const container = document.getElementById(binding.value.container);

      if (!container) return null;

      return container.getBoundingClientRect();
    }

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

    function getRectPosition(elem) {
      elem = elem || el;
      const clientRect = elem.getBoundingClientRect();
      const containerRect = getContainerRect();

      if (!clientRect.height || !clientRect.width) {
        return;
      }

      const { left, top } = clientRect;

      let relLeft;
      let relTop;

      if (containerRect) {
        relLeft = left - containerRect.left;
        relTop = top - containerRect.top;
      }

      return {
        left,
        top,
        relLeft,
        relTop
      };
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
      el.style.position = 'absolute';
      el.style.left = `${state.currentDragPosition.relLeft}px`;
      el.style.top = `${state.currentDragPosition.relTop}px`;
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
        posDiff.x = state.currentDragPosition.relLeft - state.startDragPosition.relLeft;
        posDiff.y = state.currentDragPosition.relTop - state.startDragPosition.relTop;
      }

      const currentPosition = state.currentDragPosition && { ...state.currentDragPosition };

      if (currentPosition) {
        el.hidden = true;
        const elemBelow =
          document.elementFromPoint(currentPosition.left, currentPosition.left);
        el.hidden = false;

        if (!elemBelow) return;

        const droppableBelow = elemBelow.closest('.droppable');

        if (currentDroppable !== droppableBelow) {
          if (currentDroppable) {
            if (binding.value && binding.value.onDragEnter && state) {
              binding.value.onDragEnter(posDiff, currentPosition, event);
            }
          }
          currentDroppable = droppableBelow;
          if (currentDroppable) {
            if (binding.value && binding.value.onDragLeave && state) {
              binding.value.onDragLeave(posDiff, currentPosition, event);
            }
          }
        }
      }

      if (binding.value && binding.value.onPositionChange && state) {
        binding.value.onPositionChange(posDiff, currentPosition, event);
      }
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

      const currentDragPosition = {
        relLeft: state.startDragPosition.relLeft + dx,
        relTop: state.startDragPosition.relTop + dy,
        left: state.startDragPosition.left + dx,
        top: state.startDragPosition.top + dy
      };

      setState({ currentDragPosition });
      updateElementStyle();
      handlePositionChanged(event);
    }

    function mouseUp(event) {
      const currentRectPosition = getRectPosition();
      setState({
        initialMousePos: undefined,
        startDragPosition: currentRectPosition,
        currentDragPosition: currentRectPosition
      });

      if (binding.value && binding.value.onDragEnd) {
        el.hidden = true;
        const elemBelow =
          document.elementFromPoint(currentRectPosition.left, currentRectPosition.top);
        el.hidden = false;

        event.getRectPosition = getRectPosition;
        event.getContainerRect = getContainerRect;
        event.dragElem = el;
        event.setState = setState;

        binding.value.onDragEnd(elemBelow, event);
      }

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
      handler.addEventListener('dragstart', (e) => {
        e.preventDefault();
      });
      el.listener = mouseDown;
      initializeState();
      handlePositionChanged();
    }
  }
};
