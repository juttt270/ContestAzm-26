import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import { IconQrCode, IconX } from "@/components/ui/icons";

/**
 * Optimized QRScanner Component
 * Features high-res camera constraints, expanded scanning box, 20 FPS sampling,
 * laser sweep animation, and duplicate scan debouncing.
 */
export default function QRScanner({ onScan, onError, active = true }) {
  const [cameraActive, setCameraActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const scannerRef = useRef(null);
  const lastScanTimeRef = useRef(0);
  const containerId = "qr-camera-viewport";

  useEffect(() => {
    if (!active) {
      stopCamera();
    }
    return () => {
      stopCamera();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const startCamera = async () => {
    setErrorMsg("");
    try {
      if (scannerRef.current) {
        await stopCamera();
      }

      const scanner = new Html5Qrcode(containerId);
      scannerRef.current = scanner;

      // On decoded callback with 1.5s debounce to prevent duplicate scan spamming
      const onDecoded = (decodedText) => {
        const now = Date.now();
        if (now - lastScanTimeRef.current < 1500) {
          return; // Ignore rapid duplicates
        }
        lastScanTimeRef.current = now;
        if (onScan) {
          onScan(decodedText);
        }
      };

      // High-performance camera & viewfinder configuration
      const config = {
        fps: 20, // 20 FPS for instant responsiveness without CPU overload
        qrbox: (viewfinderWidth, viewfinderHeight) => {
          const minEdgePercentage = 0.75;
          const minEdgeSize = Math.min(viewfinderWidth, viewfinderHeight);
          const qrboxSize = Math.floor(minEdgeSize * minEdgePercentage);
          return {
            width: Math.max(220, Math.min(qrboxSize, 360)),
            height: Math.max(220, Math.min(qrboxSize, 360)),
          };
        },
        aspectRatio: 1.0,
      };

      // Prioritize rear/environment camera with high resolution & continuous focus
      let cameraConstraint = {
        facingMode: "environment",
        width: { ideal: 1280 },
        height: { ideal: 720 },
      };

      try {
        const cameras = await Html5Qrcode.getCameras();
        if (cameras && cameras.length > 0) {
          const rearCamera = cameras.find((c) => /back|rear|environment/i.test(c.label));
          if (rearCamera) {
            cameraConstraint = { deviceId: { exact: rearCamera.id } };
          }
        }
      } catch {
        // Fall back to default facingMode constraint if camera listing is restricted
      }

      try {
        await scanner.start(cameraConstraint, config, onDecoded, () => {});
      } catch {
        // Retry with front camera if rear device was unavailable (e.g. laptop webcam)
        await scanner.start({ facingMode: "user" }, config, onDecoded, () => {});
      }

      setCameraActive(true);
    } catch (err) {
      const msg = "Camera unavailable or permission denied. Use manual token entry.";
      setErrorMsg(msg);
      if (onError) onError(err);
    }
  };

  const stopCamera = async () => {
    if (scannerRef.current && cameraActive) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch {
        // Ignore stop errors if already stopped
      }
      scannerRef.current = null;
    }
    setCameraActive(false);
  };

  return (
    <div className="space-y-3">
      {/* Viewport Box */}
      <div className="relative mx-auto w-full max-w-sm overflow-hidden rounded-xl border border-white/10 bg-slate-950 shadow-inner">
        <div id={containerId} className="w-full" style={{ minHeight: cameraActive ? 260 : 200 }} />

        {/* Laser Sweep Line Overlay when scanning */}
        {cameraActive && (
          <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-4">
            {/* Viewfinder Corner Framing */}
            <div className="relative h-full w-full rounded-lg border-2 border-emerald-400/40">
              <motion.div
                initial={{ top: "0%" }}
                animate={{ top: ["5%", "90%", "5%"] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#34d399]"
              />
            </div>
          </div>
        )}

        {/* Idle Viewport Overlay */}
        {!cameraActive && !errorMsg && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-slate-400 bg-slate-900/80 backdrop-blur-sm">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3">
              <IconQrCode className="h-7 w-7" />
            </div>
            <p className="text-xs font-medium text-slate-300">Camera Scanner Idle</p>
            <p className="text-[11px] text-slate-400 mt-1 max-w-[200px]">
              Tap start to initialize high-speed long-range QR camera engine
            </p>
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-300 text-center">
          {errorMsg}
        </div>
      )}

      {/* Control Buttons */}
      {!cameraActive ? (
        <Button
          type="button"
          variant="primary"
          size="sm"
          className="w-full justify-center font-semibold py-2.5"
          onClick={startCamera}
        >
          <IconQrCode className="h-4 w-4 mr-1.5" /> Start Camera Scanner
        </Button>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full justify-center text-red-400 border-red-500/30 hover:bg-red-500/10"
          onClick={stopCamera}
        >
          <IconX className="h-4 w-4 mr-1.5" /> Stop Camera
        </Button>
      )}
    </div>
  );
}
