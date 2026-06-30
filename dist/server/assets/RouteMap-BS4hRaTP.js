import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { forwardRef, useRef, useState, useMemo, useImperativeHandle, useCallback, useEffect, useId, createContext, useContext } from "react";
import { useAction } from "convex/react";
import { Plus, Minus, Loader2, Locate, Maximize, X, RefreshCw, Route, Home, Truck } from "lucide-react";
import { a as api } from "./router-u7K94VBP.js";
import { e as cn, B as Button } from "./card-CmruOdWT.js";
import MapLibreGL from "maplibre-gl";
import { createPortal } from "react-dom";
import "@tanstack/react-router";
import "@tanstack/react-query";
import "@tanstack/react-router-ssr-query";
import "@convex-dev/react-query";
import "../server.js";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "@tanstack/react-router/ssr/server";
import "@tanstack/react-router-devtools";
import "@tanstack/react-query-devtools";
import "@better-auth/core/utils/error-codes";
import "@better-auth/core/env";
import "@better-auth/core/error";
import "@better-auth/core/utils/url";
import "nanostores";
import "defu";
import "@better-fetch/fetch";
import "@better-auth/core/utils/string";
import "convex/server";
import "./auth-server-OeSBPYOe.js";
import "common-tags";
import "convex/browser";
import "@better-auth/utils/base64";
import "@better-auth/utils/binary";
import "@better-auth/utils/hmac";
import "convex-helpers";
import "jose";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
const defaultStyles = {
  dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
  light: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
};
const blankMapStyle = {
  version: 8,
  sources: {},
  layers: [
    {
      id: "background",
      type: "background",
      paint: { "background-color": "rgba(0, 0, 0, 0)" }
    }
  ]
};
function getDocumentTheme() {
  if (typeof document === "undefined") return null;
  if (document.documentElement.classList.contains("dark")) return "dark";
  if (document.documentElement.classList.contains("light")) return "light";
  return null;
}
function getSystemTheme() {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
function useResolvedTheme(themeProp) {
  const [detectedTheme, setDetectedTheme] = useState(
    () => getDocumentTheme() ?? getSystemTheme()
  );
  useEffect(() => {
    if (themeProp) return;
    const observer = new MutationObserver(() => {
      const docTheme = getDocumentTheme();
      if (docTheme) {
        setDetectedTheme(docTheme);
      }
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"]
    });
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemChange = (e) => {
      if (!getDocumentTheme()) {
        setDetectedTheme(e.matches ? "dark" : "light");
      }
    };
    mediaQuery.addEventListener("change", handleSystemChange);
    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener("change", handleSystemChange);
    };
  }, [themeProp]);
  return themeProp ?? detectedTheme;
}
const MapContext = createContext(null);
function useMap() {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error("useMap must be used within a Map component");
  }
  return context;
}
function DefaultLoader() {
  return /* @__PURE__ */ jsx("div", { className: "bg-background/50 absolute inset-0 z-10 flex items-center justify-center backdrop-blur-xs", children: /* @__PURE__ */ jsxs("div", { className: "flex gap-1", children: [
    /* @__PURE__ */ jsx("span", { className: "bg-muted-foreground/60 size-1.5 animate-pulse rounded-full" }),
    /* @__PURE__ */ jsx("span", { className: "bg-muted-foreground/60 size-1.5 animate-pulse rounded-full [animation-delay:150ms]" }),
    /* @__PURE__ */ jsx("span", { className: "bg-muted-foreground/60 size-1.5 animate-pulse rounded-full [animation-delay:300ms]" })
  ] }) });
}
function getViewport(map) {
  const center = map.getCenter();
  return {
    center: [center.lng, center.lat],
    zoom: map.getZoom(),
    bearing: map.getBearing(),
    pitch: map.getPitch()
  };
}
const Map = forwardRef(function Map2({
  children,
  className,
  theme: themeProp,
  styles,
  blank = false,
  projection,
  viewport,
  onViewportChange,
  loading = false,
  ...props
}, ref) {
  const containerRef = useRef(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isStyleLoaded, setIsStyleLoaded] = useState(false);
  const currentStyleRef = useRef(null);
  const styleTimeoutRef = useRef(null);
  const internalUpdateRef = useRef(false);
  const resolvedTheme = useResolvedTheme(themeProp);
  const isControlled = viewport !== void 0 && onViewportChange !== void 0;
  const onViewportChangeRef = useRef(onViewportChange);
  onViewportChangeRef.current = onViewportChange;
  const mapStyles = useMemo(() => {
    if (styles) {
      return {
        dark: styles.dark ?? defaultStyles.dark,
        light: styles.light ?? defaultStyles.light
      };
    }
    if (blank) {
      return { dark: blankMapStyle, light: blankMapStyle };
    }
    return defaultStyles;
  }, [styles, blank]);
  useImperativeHandle(ref, () => mapInstance, [mapInstance]);
  const clearStyleTimeout = useCallback(() => {
    if (styleTimeoutRef.current) {
      clearTimeout(styleTimeoutRef.current);
      styleTimeoutRef.current = null;
    }
  }, []);
  useEffect(() => {
    if (!containerRef.current) return;
    const initialStyle = resolvedTheme === "dark" ? mapStyles.dark : mapStyles.light;
    currentStyleRef.current = initialStyle;
    const map = new MapLibreGL.Map({
      container: containerRef.current,
      style: initialStyle,
      renderWorldCopies: false,
      attributionControl: {
        compact: true
      },
      ...props,
      ...viewport
    });
    const styleDataHandler = () => {
      clearStyleTimeout();
      styleTimeoutRef.current = setTimeout(() => {
        setIsStyleLoaded(true);
        if (projection) {
          map.setProjection(projection);
        }
      }, 100);
    };
    const loadHandler = () => setIsLoaded(true);
    const handleMove = () => {
      if (internalUpdateRef.current) return;
      onViewportChangeRef.current?.(getViewport(map));
    };
    map.on("load", loadHandler);
    map.on("styledata", styleDataHandler);
    map.on("move", handleMove);
    setMapInstance(map);
    return () => {
      clearStyleTimeout();
      map.off("load", loadHandler);
      map.off("styledata", styleDataHandler);
      map.off("move", handleMove);
      map.remove();
      setIsLoaded(false);
      setIsStyleLoaded(false);
      setMapInstance(null);
    };
  }, []);
  useEffect(() => {
    if (!mapInstance || !isControlled || !viewport) return;
    if (mapInstance.isMoving()) return;
    const current = getViewport(mapInstance);
    const next = {
      center: viewport.center ?? current.center,
      zoom: viewport.zoom ?? current.zoom,
      bearing: viewport.bearing ?? current.bearing,
      pitch: viewport.pitch ?? current.pitch
    };
    if (next.center[0] === current.center[0] && next.center[1] === current.center[1] && next.zoom === current.zoom && next.bearing === current.bearing && next.pitch === current.pitch) {
      return;
    }
    internalUpdateRef.current = true;
    mapInstance.jumpTo(next);
    internalUpdateRef.current = false;
  }, [mapInstance, isControlled, viewport]);
  useEffect(() => {
    if (!mapInstance || !resolvedTheme) return;
    const newStyle = resolvedTheme === "dark" ? mapStyles.dark : mapStyles.light;
    if (currentStyleRef.current === newStyle) return;
    clearStyleTimeout();
    currentStyleRef.current = newStyle;
    setIsStyleLoaded(false);
    mapInstance.setStyle(newStyle, { diff: true });
  }, [mapInstance, resolvedTheme, mapStyles, clearStyleTimeout]);
  useEffect(() => {
    if (!mapInstance || !isStyleLoaded || !projection) return;
    mapInstance.setProjection(projection);
  }, [mapInstance, isStyleLoaded, projection]);
  const contextValue = useMemo(
    () => ({
      map: mapInstance,
      isLoaded: isLoaded && isStyleLoaded,
      resolvedTheme
    }),
    [mapInstance, isLoaded, isStyleLoaded, resolvedTheme]
  );
  return /* @__PURE__ */ jsx(MapContext.Provider, { value: contextValue, children: /* @__PURE__ */ jsxs(
    "div",
    {
      ref: containerRef,
      className: cn("relative h-full w-full", className),
      children: [
        (!isLoaded || loading) && /* @__PURE__ */ jsx(DefaultLoader, {}),
        mapInstance && children
      ]
    }
  ) });
});
const MarkerContext = createContext(null);
function useMarkerContext() {
  const context = useContext(MarkerContext);
  if (!context) {
    throw new Error("Marker components must be used within MapMarker");
  }
  return context;
}
function MapMarker({
  longitude,
  latitude,
  children,
  onClick,
  onMouseEnter,
  onMouseLeave,
  onDragStart,
  onDrag,
  onDragEnd,
  draggable = false,
  ...markerOptions
}) {
  const { map } = useMap();
  const callbacksRef = useRef({
    onClick,
    onMouseEnter,
    onMouseLeave,
    onDragStart,
    onDrag,
    onDragEnd
  });
  callbacksRef.current = {
    onClick,
    onMouseEnter,
    onMouseLeave,
    onDragStart,
    onDrag,
    onDragEnd
  };
  const marker = useMemo(() => {
    const markerInstance = new MapLibreGL.Marker({
      ...markerOptions,
      element: document.createElement("div"),
      draggable
    }).setLngLat([longitude, latitude]);
    const handleClick = (e) => callbacksRef.current.onClick?.(e);
    const handleMouseEnter = (e) => callbacksRef.current.onMouseEnter?.(e);
    const handleMouseLeave = (e) => callbacksRef.current.onMouseLeave?.(e);
    markerInstance.getElement()?.addEventListener("click", handleClick);
    markerInstance.getElement()?.addEventListener("mouseenter", handleMouseEnter);
    markerInstance.getElement()?.addEventListener("mouseleave", handleMouseLeave);
    const handleDragStart = () => {
      const lngLat = markerInstance.getLngLat();
      callbacksRef.current.onDragStart?.({ lng: lngLat.lng, lat: lngLat.lat });
    };
    const handleDrag = () => {
      const lngLat = markerInstance.getLngLat();
      callbacksRef.current.onDrag?.({ lng: lngLat.lng, lat: lngLat.lat });
    };
    const handleDragEnd = () => {
      const lngLat = markerInstance.getLngLat();
      callbacksRef.current.onDragEnd?.({ lng: lngLat.lng, lat: lngLat.lat });
    };
    markerInstance.on("dragstart", handleDragStart);
    markerInstance.on("drag", handleDrag);
    markerInstance.on("dragend", handleDragEnd);
    return markerInstance;
  }, []);
  useEffect(() => {
    if (!map) return;
    marker.addTo(map);
    return () => {
      marker.remove();
    };
  }, [map]);
  const { offset, rotation, rotationAlignment, pitchAlignment } = markerOptions;
  useEffect(() => {
    const current = marker.getLngLat();
    if (current.lng !== longitude || current.lat !== latitude) {
      marker.setLngLat([longitude, latitude]);
    }
    if (marker.isDraggable() !== draggable) {
      marker.setDraggable(draggable);
    }
    const currentOffset = marker.getOffset();
    const newOffset = offset ?? [0, 0];
    const [newOffsetX, newOffsetY] = Array.isArray(newOffset) ? newOffset : [newOffset.x, newOffset.y];
    if (currentOffset.x !== newOffsetX || currentOffset.y !== newOffsetY) {
      marker.setOffset(newOffset);
    }
    if (marker.getRotation() !== (rotation ?? 0)) {
      marker.setRotation(rotation ?? 0);
    }
    if (marker.getRotationAlignment() !== (rotationAlignment ?? "auto")) {
      marker.setRotationAlignment(rotationAlignment ?? "auto");
    }
    if (marker.getPitchAlignment() !== (pitchAlignment ?? "auto")) {
      marker.setPitchAlignment(pitchAlignment ?? "auto");
    }
  }, [
    marker,
    longitude,
    latitude,
    draggable,
    offset,
    rotation,
    rotationAlignment,
    pitchAlignment
  ]);
  return /* @__PURE__ */ jsx(MarkerContext.Provider, { value: { marker, map }, children });
}
function MarkerContent({ children, className }) {
  const { marker } = useMarkerContext();
  return createPortal(
    /* @__PURE__ */ jsx("div", { className: cn("relative cursor-pointer", className), children: children || /* @__PURE__ */ jsx(DefaultMarkerIcon, {}) }),
    marker.getElement()
  );
}
function DefaultMarkerIcon() {
  return /* @__PURE__ */ jsx("div", { className: "relative h-4 w-4 rounded-full border-2 border-white bg-blue-500 shadow-lg" });
}
function PopupCloseButton({ onClick }) {
  return /* @__PURE__ */ jsx(
    "button",
    {
      type: "button",
      onClick,
      "aria-label": "Close popup",
      className: "focus-visible:ring-ring hover:bg-muted text-foreground absolute top-1 right-1 z-10 inline-flex size-5 cursor-pointer items-center justify-center rounded-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset",
      children: /* @__PURE__ */ jsx(X, { className: "size-3.5" })
    }
  );
}
function MarkerPopup({
  children,
  className,
  closeButton = false,
  ...popupOptions
}) {
  const { marker, map } = useMarkerContext();
  const container = useMemo(() => document.createElement("div"), []);
  const { offset, maxWidth } = popupOptions;
  const popup = useMemo(() => {
    const popupInstance = new MapLibreGL.Popup({
      offset: 16,
      ...popupOptions,
      closeButton: false
    }).setMaxWidth("none").setDOMContent(container);
    return popupInstance;
  }, []);
  useEffect(() => {
    if (!map) return;
    popup.setDOMContent(container);
    marker.setPopup(popup);
    return () => {
      marker.setPopup(null);
    };
  }, [map]);
  useEffect(() => {
    popup.setOffset(offset ?? 16);
    if (maxWidth) {
      popup.setMaxWidth(maxWidth);
    }
  }, [popup, offset, maxWidth]);
  const handleClose = () => popup.remove();
  return createPortal(
    /* @__PURE__ */ jsxs(
      "div",
      {
        className: cn(
          "bg-popover text-popover-foreground relative max-w-62 rounded-md border p-3 shadow-md",
          "animate-in fade-in-0 zoom-in-95 duration-200 ease-out",
          className
        ),
        children: [
          closeButton && /* @__PURE__ */ jsx(PopupCloseButton, { onClick: handleClose }),
          children
        ]
      }
    ),
    container
  );
}
function MarkerLabel({
  children,
  className,
  position = "top"
}) {
  const positionClasses2 = {
    top: "bottom-full mb-1",
    bottom: "top-full mt-1"
  };
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: cn(
        "absolute left-1/2 -translate-x-1/2 whitespace-nowrap",
        "text-foreground text-[10px] font-medium",
        positionClasses2[position],
        className
      ),
      children
    }
  );
}
const positionClasses = {
  "top-left": "top-2 left-2",
  "top-right": "top-2 right-2",
  "bottom-left": "bottom-2 left-2",
  "bottom-right": "bottom-10 right-2"
};
function ControlGroup({ children }) {
  return /* @__PURE__ */ jsx("div", { className: "border-border bg-background [&>button:not(:last-child)]:border-border flex flex-col overflow-hidden rounded-md border shadow-sm [&>button:not(:last-child)]:border-b", children });
}
function ControlButton({
  onClick,
  label,
  children,
  disabled = false
}) {
  return /* @__PURE__ */ jsx(
    "button",
    {
      onClick,
      "aria-label": label,
      type: "button",
      className: cn(
        "flex size-8 items-center justify-center transition-all",
        "first:rounded-t-md last:rounded-b-md",
        "hover:bg-accent dark:hover:bg-accent/40",
        "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset",
        "disabled:pointer-events-none disabled:opacity-50"
      ),
      disabled,
      children
    }
  );
}
function MapControls({
  position = "bottom-right",
  showZoom = true,
  showCompass = false,
  showLocate = false,
  showFullscreen = false,
  className,
  onLocate
}) {
  const { map } = useMap();
  const [waitingForLocation, setWaitingForLocation] = useState(false);
  const handleZoomIn = useCallback(() => {
    map?.zoomTo(map.getZoom() + 1, { duration: 300 });
  }, [map]);
  const handleZoomOut = useCallback(() => {
    map?.zoomTo(map.getZoom() - 1, { duration: 300 });
  }, [map]);
  const handleResetBearing = useCallback(() => {
    map?.resetNorthPitch({ duration: 300 });
  }, [map]);
  const handleLocate = useCallback(() => {
    setWaitingForLocation(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = {
            longitude: pos.coords.longitude,
            latitude: pos.coords.latitude
          };
          map?.flyTo({
            center: [coords.longitude, coords.latitude],
            zoom: 14,
            duration: 1500
          });
          onLocate?.(coords);
          setWaitingForLocation(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setWaitingForLocation(false);
        }
      );
    }
  }, [map, onLocate]);
  const handleFullscreen = useCallback(() => {
    const container = map?.getContainer();
    if (!container) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      container.requestFullscreen();
    }
  }, [map]);
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: cn(
        "absolute z-10 flex flex-col gap-1.5",
        positionClasses[position],
        className
      ),
      children: [
        showZoom && /* @__PURE__ */ jsxs(ControlGroup, { children: [
          /* @__PURE__ */ jsx(ControlButton, { onClick: handleZoomIn, label: "Zoom in", children: /* @__PURE__ */ jsx(Plus, { className: "size-4" }) }),
          /* @__PURE__ */ jsx(ControlButton, { onClick: handleZoomOut, label: "Zoom out", children: /* @__PURE__ */ jsx(Minus, { className: "size-4" }) })
        ] }),
        showCompass && /* @__PURE__ */ jsx(ControlGroup, { children: /* @__PURE__ */ jsx(CompassButton, { onClick: handleResetBearing }) }),
        showLocate && /* @__PURE__ */ jsx(ControlGroup, { children: /* @__PURE__ */ jsx(
          ControlButton,
          {
            onClick: handleLocate,
            label: "Find my location",
            disabled: waitingForLocation,
            children: waitingForLocation ? /* @__PURE__ */ jsx(Loader2, { className: "size-4 animate-spin" }) : /* @__PURE__ */ jsx(Locate, { className: "size-4" })
          }
        ) }),
        showFullscreen && /* @__PURE__ */ jsx(ControlGroup, { children: /* @__PURE__ */ jsx(ControlButton, { onClick: handleFullscreen, label: "Toggle fullscreen", children: /* @__PURE__ */ jsx(Maximize, { className: "size-4" }) }) })
      ]
    }
  );
}
function CompassButton({ onClick }) {
  const { map } = useMap();
  const compassRef = useRef(null);
  useEffect(() => {
    if (!map || !compassRef.current) return;
    const compass = compassRef.current;
    const updateRotation = () => {
      const bearing = map.getBearing();
      const pitch = map.getPitch();
      compass.style.transform = `rotateX(${pitch}deg) rotateZ(${-bearing}deg)`;
    };
    map.on("rotate", updateRotation);
    map.on("pitch", updateRotation);
    updateRotation();
    return () => {
      map.off("rotate", updateRotation);
      map.off("pitch", updateRotation);
    };
  }, [map]);
  return /* @__PURE__ */ jsx(ControlButton, { onClick, label: "Reset bearing to north", children: /* @__PURE__ */ jsxs(
    "svg",
    {
      ref: compassRef,
      viewBox: "0 0 24 24",
      className: "size-5 transition-transform duration-200",
      style: { transformStyle: "preserve-3d" },
      children: [
        /* @__PURE__ */ jsx("path", { d: "M12 2L16 12H12V2Z", className: "fill-red-500" }),
        /* @__PURE__ */ jsx("path", { d: "M12 2L8 12H12V2Z", className: "fill-red-300" }),
        /* @__PURE__ */ jsx("path", { d: "M12 22L16 12H12V22Z", className: "fill-muted-foreground/60" }),
        /* @__PURE__ */ jsx("path", { d: "M12 22L8 12H12V22Z", className: "fill-muted-foreground/30" })
      ]
    }
  ) });
}
function MapRoute({
  id: propId,
  coordinates,
  color = "#4285F4",
  width = 3,
  opacity = 0.8,
  dashArray,
  onClick,
  onMouseEnter,
  onMouseLeave,
  interactive = true
}) {
  const { map, isLoaded } = useMap();
  const autoId = useId();
  const id = propId ?? autoId;
  const sourceId = `route-source-${id}`;
  const layerId = `route-layer-${id}`;
  useEffect(() => {
    if (!isLoaded || !map) return;
    map.addSource(sourceId, {
      type: "geojson",
      data: {
        type: "Feature",
        properties: {},
        geometry: { type: "LineString", coordinates: [] }
      }
    });
    map.addLayer({
      id: layerId,
      type: "line",
      source: sourceId,
      layout: { "line-join": "round", "line-cap": "round" },
      paint: {
        "line-color": color,
        "line-width": width,
        "line-opacity": opacity,
        ...dashArray && { "line-dasharray": dashArray }
      }
    });
    return () => {
      try {
        if (map.getLayer(layerId)) map.removeLayer(layerId);
        if (map.getSource(sourceId)) map.removeSource(sourceId);
      } catch {
      }
    };
  }, [isLoaded, map]);
  useEffect(() => {
    if (!isLoaded || !map || coordinates.length < 2) return;
    const source = map.getSource(sourceId);
    if (source) {
      source.setData({
        type: "Feature",
        properties: {},
        geometry: { type: "LineString", coordinates }
      });
    }
  }, [isLoaded, map, coordinates, sourceId]);
  useEffect(() => {
    if (!isLoaded || !map || !map.getLayer(layerId)) return;
    map.setPaintProperty(layerId, "line-color", color);
    map.setPaintProperty(layerId, "line-width", width);
    map.setPaintProperty(layerId, "line-opacity", opacity);
    map.setPaintProperty(layerId, "line-dasharray", dashArray);
  }, [isLoaded, map, layerId, color, width, opacity, dashArray]);
  useEffect(() => {
    if (!isLoaded || !map || !interactive) return;
    const handleClick = () => {
      onClick?.();
    };
    const handleMouseEnter = () => {
      map.getCanvas().style.cursor = "pointer";
      onMouseEnter?.();
    };
    const handleMouseLeave = () => {
      map.getCanvas().style.cursor = "";
      onMouseLeave?.();
    };
    map.on("click", layerId, handleClick);
    map.on("mouseenter", layerId, handleMouseEnter);
    map.on("mouseleave", layerId, handleMouseLeave);
    return () => {
      map.off("click", layerId, handleClick);
      map.off("mouseenter", layerId, handleMouseEnter);
      map.off("mouseleave", layerId, handleMouseLeave);
    };
  }, [isLoaded, map, layerId, onClick, onMouseEnter, onMouseLeave, interactive]);
  return null;
}
const stopColor = {
  pending: "bg-neutral-400",
  polling: "bg-amber-500",
  captured: "bg-green-500",
  missed: "bg-red-500"
};
const PLANNED_COLOR = "#6366f1";
const OPTIMIZED_COLOR = "#10b981";
function computeBounds(points) {
  if (points.length === 0) return null;
  let minLng = points[0][0];
  let maxLng = points[0][0];
  let minLat = points[0][1];
  let maxLat = points[0][1];
  for (const [lng, lat] of points) {
    minLng = Math.min(minLng, lng);
    maxLng = Math.max(maxLng, lng);
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
  }
  return [
    [minLng, minLat],
    [maxLng, maxLat]
  ];
}
function RouteMap({
  vehicleRegistration,
  stops,
  mapClassName = "h-[60vh] max-h-[480px]"
}) {
  const getPosition = useAction(api.vehicles.getCurrentPosition);
  const getOptimized = useAction(api.routing.getOptimizedRoute);
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [optimized, setOptimized] = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState(null);
  const sorted = useMemo(
    () => [...stops].sort((a, b) => a.order - b.order),
    [stops]
  );
  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const reading = await getPosition({ vehicleRegistration });
      if (reading) {
        setVehicle(reading);
      } else {
        setError("No live location available for this vehicle");
      }
    } catch (err) {
      console.error(err);
      setError("Could not fetch vehicle location");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void refresh();
  }, [vehicleRegistration]);
  const routeInputs = useMemo(() => {
    const inputs = [];
    if (vehicle) {
      inputs.push({
        kind: "vehicle",
        stopIndex: -1,
        lat: vehicle.lat,
        lng: vehicle.lng
      });
    }
    sorted.forEach(
      (s, idx) => inputs.push({
        kind: "stop",
        stopIndex: idx,
        lat: s.targetLat,
        lng: s.targetLng
      })
    );
    return inputs;
  }, [vehicle, sorted]);
  const inputsKey = useMemo(
    () => routeInputs.map((p) => `${p.lat.toFixed(6)},${p.lng.toFixed(6)}`).join(";"),
    [routeInputs]
  );
  useEffect(() => {
    if (routeInputs.length < 2) {
      setOptimized(null);
      return;
    }
    let cancelled = false;
    setRouteLoading(true);
    setRouteError(null);
    getOptimized({
      coordinates: routeInputs.map(({ lat, lng }) => ({ lat, lng }))
    }).then((r) => {
      if (cancelled) return;
      if (r) setOptimized(r);
      else setRouteError("No optimized route found");
    }).catch((err) => {
      if (cancelled) return;
      console.error(err);
      setRouteError("Could not compute optimized route");
    }).finally(() => {
      if (!cancelled) setRouteLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [inputsKey]);
  const points = useMemo(
    () => routeInputs.map((p) => [p.lng, p.lat]),
    [routeInputs]
  );
  const bounds = useMemo(() => computeBounds(points), [points]);
  const center = bounds ? [(bounds[0][0] + bounds[1][0]) / 2, (bounds[0][1] + bounds[1][1]) / 2] : [77.209, 28.6139];
  const plannedLine = useMemo(
    () => sorted.map((s) => [s.targetLng, s.targetLat]),
    [sorted]
  );
  const optimizedStops = useMemo(() => {
    if (!optimized) return [];
    return optimized.order.map((i) => routeInputs[i]).filter((p) => p && p.kind === "stop").map((p) => sorted[p.stopIndex]).filter(Boolean);
  }, [optimized, routeInputs, sorted]);
  return /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsx("div", { className: "text-muted-foreground text-sm", children: vehicle ? /* @__PURE__ */ jsxs("span", { children: [
        "Vehicle at ",
        vehicle.lat.toFixed(5),
        ", ",
        vehicle.lng.toFixed(5),
        vehicle.speed != null && ` · ${Math.round(vehicle.speed)} km/h`
      ] }) : error ? /* @__PURE__ */ jsx("span", { className: "text-red-500", children: error }) : /* @__PURE__ */ jsx("span", { children: "Locating vehicle…" }) }),
      /* @__PURE__ */ jsxs(
        Button,
        {
          size: "sm",
          variant: "secondary",
          onClick: refresh,
          disabled: loading,
          children: [
            loading ? /* @__PURE__ */ jsx(Loader2, { className: "size-4 animate-spin" }) : /* @__PURE__ */ jsx(RefreshCw, { className: "size-4" }),
            "Refresh"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-muted/40 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-md border px-3 py-2 text-xs", children: [
      /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5 font-medium", children: [
        /* @__PURE__ */ jsx(Route, { className: "size-3.5" }),
        " Optimized route"
      ] }),
      routeLoading ? /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground flex items-center gap-1", children: [
        /* @__PURE__ */ jsx(Loader2, { className: "size-3 animate-spin" }),
        " computing…"
      ] }) : optimized ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs("span", { children: [
          (optimized.distanceMeters / 1e3).toFixed(1),
          " km"
        ] }),
        /* @__PURE__ */ jsxs("span", { children: [
          "~",
          Math.round(optimized.durationSeconds / 60),
          " min"
        ] }),
        optimizedStops.length > 0 && /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground", children: [
          "Order: ",
          optimizedStops.map((s) => s.name).join(" → ")
        ] })
      ] }) : /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: routeError ?? "unavailable" }),
      /* @__PURE__ */ jsxs("span", { className: "ml-auto flex items-center gap-3", children: [
        /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsx(
            "span",
            {
              className: "inline-block h-0.5 w-4",
              style: { backgroundColor: OPTIMIZED_COLOR }
            }
          ),
          "optimized"
        ] }),
        /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
          /* @__PURE__ */ jsx(
            "span",
            {
              className: "inline-block h-0.5 w-4 border-t border-dashed",
              style: { borderColor: PLANNED_COLOR }
            }
          ),
          "planned"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx(
      "div",
      {
        className: cn("w-full overflow-hidden rounded-lg border", mapClassName),
        children: /* @__PURE__ */ jsxs(
          Map,
          {
            center,
            zoom: 12,
            bounds: bounds ?? void 0,
            fitBoundsOptions: { padding: 56, maxZoom: 15 },
            children: [
              /* @__PURE__ */ jsx(MapControls, { showFullscreen: true }),
              plannedLine.length >= 2 && /* @__PURE__ */ jsx(
                MapRoute,
                {
                  coordinates: plannedLine,
                  color: PLANNED_COLOR,
                  width: 2,
                  opacity: 0.5,
                  dashArray: [2, 2]
                }
              ),
              optimized && optimized.geometry.length >= 2 && /* @__PURE__ */ jsx(
                MapRoute,
                {
                  coordinates: optimized.geometry,
                  color: OPTIMIZED_COLOR,
                  width: 4
                }
              ),
              sorted.map((stop) => /* @__PURE__ */ jsxs(
                MapMarker,
                {
                  longitude: stop.targetLng,
                  latitude: stop.targetLat,
                  children: [
                    /* @__PURE__ */ jsx(MarkerContent, { children: /* @__PURE__ */ jsx(
                      "div",
                      {
                        className: cn(
                          "flex size-6 items-center justify-center rounded-full border-2 border-white text-[10px] font-bold text-white shadow",
                          stop.isStart ? "bg-indigo-600" : stopColor[stop.status]
                        ),
                        children: stop.isStart ? /* @__PURE__ */ jsx(Home, { className: "size-3.5" }) : stop.order + 1
                      }
                    ) }),
                    /* @__PURE__ */ jsx(MarkerLabel, { children: stop.isStart ? `${stop.name} (start)` : stop.name }),
                    /* @__PURE__ */ jsx(MarkerPopup, { closeButton: true, children: /* @__PURE__ */ jsxs("div", { className: "space-y-1 text-xs", children: [
                      /* @__PURE__ */ jsxs("div", { className: "text-sm font-medium", children: [
                        stop.name,
                        stop.isStart && " (start)"
                      ] }),
                      /* @__PURE__ */ jsx("div", { className: "text-muted-foreground capitalize", children: stop.status }),
                      stop.odometer != null && /* @__PURE__ */ jsxs("div", { children: [
                        "Odometer: ",
                        stop.odometer.toLocaleString(),
                        " km"
                      ] })
                    ] }) })
                  ]
                },
                stop.order
              )),
              vehicle && /* @__PURE__ */ jsxs(MapMarker, { longitude: vehicle.lng, latitude: vehicle.lat, children: [
                /* @__PURE__ */ jsx(MarkerContent, { children: /* @__PURE__ */ jsx("div", { className: "flex size-7 items-center justify-center rounded-full border-2 border-white bg-blue-600 text-white shadow-lg", children: /* @__PURE__ */ jsx(Truck, { className: "size-4" }) }) }),
                /* @__PURE__ */ jsx(MarkerLabel, { position: "bottom", children: vehicleRegistration }),
                /* @__PURE__ */ jsx(MarkerPopup, { closeButton: true, children: /* @__PURE__ */ jsxs("div", { className: "space-y-1 text-xs", children: [
                  /* @__PURE__ */ jsx("div", { className: "text-sm font-medium", children: vehicleRegistration }),
                  vehicle.odometer != null && /* @__PURE__ */ jsxs("div", { children: [
                    "Odometer: ",
                    vehicle.odometer.toLocaleString(),
                    " km"
                  ] }),
                  vehicle.speed != null && /* @__PURE__ */ jsxs("div", { children: [
                    "Speed: ",
                    Math.round(vehicle.speed),
                    " km/h"
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "text-muted-foreground", children: [
                    "As of ",
                    new Date(vehicle.capturedAt).toLocaleTimeString()
                  ] })
                ] }) })
              ] })
            ]
          }
        )
      }
    )
  ] });
}
export {
  RouteMap
};
