import { useCallback, useMemo, useState } from "react";

const minGraphZoom = 0.5;
const maxGraphZoom = 2;
const zoomStep = 0.1;

export function useUiStore() {
  const [graphZoom, setGraphZoom] = useState(1);
  const [graphPan, setGraphPan] = useState({ x: 0, y: 0 });

  const zoomIn = useCallback(() => {
    setGraphZoom((zoom) => Math.min(maxGraphZoom, roundZoom(zoom + zoomStep)));
  }, []);

  const zoomOut = useCallback(() => {
    setGraphZoom((zoom) => Math.max(minGraphZoom, roundZoom(zoom - zoomStep)));
  }, []);

  const resetGraphView = useCallback(() => {
    setGraphZoom(1);
    setGraphPan({ x: 0, y: 0 });
  }, []);

  const panGraph = useCallback((deltaX: number, deltaY: number) => {
    setGraphPan((pan) => ({
      x: pan.x + deltaX,
      y: pan.y + deltaY,
    }));
  }, []);

  return useMemo(
    () => ({
      graphPan,
      graphZoom,
      panGraph,
      resetGraphView,
      zoomIn,
      zoomOut,
    }),
    [graphPan, graphZoom, panGraph, resetGraphView, zoomIn, zoomOut],
  );
}

function roundZoom(zoom: number) {
  return Math.round(zoom * 10) / 10;
}
