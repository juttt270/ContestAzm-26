import { useEffect, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Html5Qrcode } from "html5-qrcode";
import { useAuth } from "@/context/AuthContext";
import * as visitorService from "@/services/visitorService";
import * as flatService from "@/services/flatService";
import * as userService from "@/services/userService";
import Table from "@/components/ui/Table";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import SelectField from "@/components/ui/SelectField";
import StatusBadge from "@/components/ui/StatusBadge";
import Loader from "@/components/ui/Loader";
import ImageUpload from "@/components/ui/ImageUpload";
import ScanResultModal from "@/components/ui/ScanResultModal";
import { formatDate } from "@/lib/date";
import { downloadVisitorPassPdf } from "@/lib/generateVisitorPassPdf";
import {
  validateName,
  validatePhone,
  validateVehicleNumber,
  validateRequired,
  validateFutureDate,
} from "@/utils/validators";
import { IconPlus, IconQrCode, IconUsers, IconCheck, IconAlertCircle, IconCar, IconShield, IconDownload, IconX, IconLogOut } from "@/components/ui/icons";

const VISITOR_TYPES = ["Guest", "Delivery", "Cab", "Vendor", "Service"];
const STATUS_LABEL = {
  APPROVED: "Approved",
  CHECKED_IN: "Checked in",
  COMPLETED: "Checked out",
  EXPIRED: "Expired",
  CANCELLED: "Cancelled",
};
const flatLabel = (flat) => (flat ? `${flat.blockName}-${flat.flatNumber}` : "—");
const STATUS_TABS = ["All", "APPROVED", "CHECKED_IN", "COMPLETED", "EXPIRED", "CANCELLED"];

const emptyPassForm = { visitorName: "", phone: "", vehicleNumber: "", purpose: "", visitorType: "Guest", validUntil: "" };
const emptyWalkInForm = { visitorName: "", phone: "", vehicleNumber: "", purpose: "", visitorType: "Vendor", targetFlatId: "" };

function defaultValidUntil() {
  const d = new Date(Date.now() + 4 * 60 * 60 * 1000);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function Visitors() {
  const { role } = useAuth();
  const [visitors, setVisitors] = useState([]);
  const [overstay, setOverstay] = useState([]);
  const [flats, setFlats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [passOpen, setPassOpen] = useState(false);
  const [passForm, setPassForm] = useState(emptyPassForm);
  const [passFieldErrors, setPassFieldErrors] = useState({});
  const [passPhoto, setPassPhoto] = useState(null);
  const [passError, setPassError] = useState("");
  const [generatedPass, setGeneratedPass] = useState(null);

  const [scanOpen, setScanOpen] = useState(false);
  const [scanIntent, setScanIntent] = useState("CHECK_IN");
  const [manualToken, setManualToken] = useState("");
  const [scanResult, setScanResult] = useState(null);
  const [scanModalOpen, setScanModalOpen] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const scannerRef = useRef(null);

  const [walkInOpen, setWalkInOpen] = useState(false);
  const [walkInForm, setWalkInForm] = useState(emptyWalkInForm);
  const [walkInFieldErrors, setWalkInFieldErrors] = useState({});
  const [walkInPhoto, setWalkInPhoto] = useState(null);
  const [walkInError, setWalkInError] = useState("");

  const [lookupOpen, setLookupOpen] = useState(false);
  const [lookupQuery, setLookupQuery] = useState("");
  const [lookupResult, setLookupResult] = useState(null);
  const [lookupLoading, setLookupLoading] = useState(false);

  const [statusTab, setStatusTab] = useState(role === "Guard" ? "CHECKED_IN" : "All");
  const [cancelTarget, setCancelTarget] = useState(null);
  // Bumped on every refetch so the Table remounts and drops back to page 1 —
  // otherwise it keeps whatever page you were on, and a visitor you just
  // checked in/out (now first in the freshly-sorted list) looks "missing"
  // because you're still sitting on page 2/3 of the old pagination.
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchAll = async () => {
    setLoading(true);
    setError("");
    try {
      const tasks = [visitorService.getVisitors()];
      if (role === "Guard" || role === "Admin") tasks.push(visitorService.getOverstayAlerts());
      const [visitorsData, overstayData] = await Promise.all(tasks);
      setVisitors(visitorsData);
      if (overstayData) setOverstay(overstayData);
      if (role === "Guard") setFlats(await flatService.getFlats());
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setError(err.message || "Failed to load visitors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  const handleGeneratePass = async (e) => {
    e.preventDefault();
    setPassError("");
    const nameErr = validateName(passForm.visitorName, "Visitor name");
    const phoneErr = validatePhone(passForm.phone, "Phone number");
    const vehicleErr = validateVehicleNumber(passForm.vehicleNumber);
    const dateErr = validateFutureDate(passForm.validUntil, "Pass validity");
    const purposeErr = validateRequired(passForm.purpose, "Purpose of visit", 2);

    if (nameErr || phoneErr || vehicleErr || dateErr || purposeErr) {
      setPassFieldErrors({
        visitorName: nameErr,
        phone: phoneErr,
        vehicleNumber: vehicleErr,
        validUntil: dateErr,
        purpose: purposeErr,
      });
      return;
    }
    setPassFieldErrors({});
    setSubmitting(true);
    try {
      const visitor = await visitorService.generateVisitorPass({
        ...passForm,
        visitorName: passForm.visitorName.trim(),
        phone: passForm.phone.trim(),
        vehicleNumber: (passForm.vehicleNumber || "").trim().toUpperCase(),
        photo: passPhoto || undefined,
      });
      setGeneratedPass(visitor);
      fetchAll();
    } catch (err) {
      setPassError(err.message || "Failed to generate pass");
    } finally {
      setSubmitting(false);
    }
  };

  const runVerify = async (rawToken) => {
    setScanResult(null);
    let qrToken = rawToken;
    try {
      const parsed = JSON.parse(rawToken);
      if (parsed?.qrToken) qrToken = parsed.qrToken;
    } catch {
      // raw text — treat as-is below
    }
    try {
      const base = qrToken.startsWith("VQR-") ? { qrToken } : { passCode: qrToken };
      const payload = scanIntent === "CHECK_OUT" ? { ...base, intent: "CHECK_OUT" } : base;
      const result = await visitorService.verifyQrPass(payload);
      const isCheckout = result.action === "CHECK_OUT";
      setScanResult({
        ok: true,
        action: result.action,
        visitor: result.visitor,
        message: isCheckout
          ? `${result.visitor.visitorName} → ${flatLabel(result.visitor.targetFlat)}`
          : `${result.visitor.visitorName} → ${flatLabel(result.visitor.targetFlat)}`,
      });
      setScanModalOpen(true);
      fetchAll();
    } catch (err) {
      setScanResult({ ok: false, message: err.message || "Unauthorized — verification failed." });
      setScanModalOpen(true);
    }
  };

  const startCamera = async () => {
    setCameraError("");
    try {
      let scanner = new Html5Qrcode("qr-reader-region");
      scannerRef.current = scanner;

      const onDecoded = (decodedText) => {
        runVerify(decodedText);
        scanner
          .stop()
          .then(() => setCameraActive(false))
          .catch(() => {});
      };
      // Bigger scan box (fills most of the frame) + higher fps + the browser's native
      // BarcodeDetector (when available) means the pass decodes from further away
      // instead of needing to be held right up against the webcam lens.
      const config = {
        fps: 25,
        qrbox: (viewfinderWidth, viewfinderHeight) => {
          const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
          const size = Math.floor(minEdge * 0.85);
          return { width: size, height: size };
        },
        aspectRatio: 1.0,
        experimentalFeatures: { useBarCodeDetectorIfSupported: true },
        // html5-qrcode requires the *first* start() argument to be a single-key
        // camera selector ({facingMode} or {deviceId}) — extra resolution hints
        // go here instead. Requesting an ideal 1280x720 stream (instead of the
        // browser's low-res default) gives the decoder far more pixels to
        // resolve the QR's modules from, which is what lets it read from a bit
        // of distance instead of needing to be held right against the lens.
        videoConstraints: { width: { ideal: 1280 }, height: { ideal: 720 } },
      };

      // Ask the browser directly for the rear camera via facingMode, instead of
      // pre-enumerating devices with getCameras() first — that call opens and
      // closes its own getUserMedia stream to read device labels, and on many
      // Windows webcam drivers that "steals" the camera so the real start() call
      // right after fails with NotReadableError (camera looks completely dead).
      let startErr = null;
      try {
        await scanner.start({ facingMode: "environment" }, config, onDecoded, () => {});
      } catch (err) {
        startErr = err;
        // A failed start() can leave this instance's internal state machine stuck
        // ("Cannot transition to a new state, already under transition") — retrying
        // on a brand-new instance instead of the same one avoids that entirely.
        try {
          scanner.clear();
        } catch {
          // Nothing to clear if it never partially started.
        }
        scanner = new Html5Qrcode("qr-reader-region");
        scannerRef.current = scanner;
        try {
          // No rear camera (e.g. a laptop webcam) — retry front-facing.
          await scanner.start({ facingMode: "user" }, config, onDecoded, () => {});
          startErr = null;
        } catch (err2) {
          startErr = err2;
        }
      }
      if (startErr) throw startErr;

      setCameraActive(true);
    } catch (err) {
      console.error("QR camera start failed:", err);
      const raw = (typeof err === "string" && err) || err?.name || err?.message || String(err ?? "");
      let message = raw ? `Camera unavailable: ${raw}` : "Camera unavailable — use manual code entry below instead.";
      if (/notallowed|permission/i.test(raw)) {
        message = "Camera permission was denied. Allow camera access for this site in your browser settings, then try again.";
      } else if (/notreadable|trackstart|in use/i.test(raw)) {
        message = "The camera is already in use by another app or tab. Close it and try again.";
      } else if (/notfound|devicesnotfound/i.test(raw)) {
        message = "No camera was found on this device. Use manual token entry.";
      }
      setCameraError(message);
    }
  };

  const stopCamera = async () => {
    try {
      if (scannerRef.current && cameraActive) await scannerRef.current.stop();
    } catch {
      // ignore stop errors when camera was never fully started
    }
    setCameraActive(false);
  };

  useEffect(() => {
    if (!scanOpen) {
      stopCamera();
      setScanResult(null);
      setScanModalOpen(false);
      setManualToken("");
      setCameraError("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanOpen]);

  const handleWalkIn = async (e) => {
    e.preventDefault();
    setWalkInError("");
    const nameErr = validateName(walkInForm.visitorName, "Visitor name");
    const phoneErr = validatePhone(walkInForm.phone, "Phone number");
    const flatErr = validateRequired(walkInForm.targetFlatId, "Target flat");
    const vehicleErr = validateVehicleNumber(walkInForm.vehicleNumber);
    const purposeErr = validateRequired(walkInForm.purpose, "Purpose of visit", 2);

    if (nameErr || phoneErr || flatErr || vehicleErr || purposeErr) {
      setWalkInFieldErrors({
        visitorName: nameErr,
        phone: phoneErr,
        targetFlatId: flatErr,
        vehicleNumber: vehicleErr,
        purpose: purposeErr,
      });
      return;
    }
    setWalkInFieldErrors({});
    setSubmitting(true);
    try {
      await visitorService.logWalkIn({
        ...walkInForm,
        visitorName: walkInForm.visitorName.trim(),
        phone: walkInForm.phone.trim(),
        vehicleNumber: (walkInForm.vehicleNumber || "").trim().toUpperCase(),
        photo: walkInPhoto || undefined,
      });
      setWalkInOpen(false);
      setWalkInForm(emptyWalkInForm);
      setWalkInPhoto(null);
      fetchAll();
    } catch (err) {
      setWalkInError(err.message || "Failed to log walk-in visitor");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckout = async (row) => {
    await visitorService.checkoutVisitor(row._id);
    fetchAll();
  };

  const handleCancelPass = async () => {
    await visitorService.cancelVisitorPass(cancelTarget._id);
    fetchAll();
  };

  const handleVehicleLookup = async (e) => {
    e.preventDefault();
    if (!lookupQuery.trim()) return;
    setLookupLoading(true);
    setLookupResult(null);
    try {
      setLookupResult(await userService.lookupVehicle(lookupQuery.trim()));
    } catch (err) {
      setLookupResult({ found: false, error: err.message || "Lookup failed" });
    } finally {
      setLookupLoading(false);
    }
  };

  const startWalkInFromLookup = () => {
    setLookupOpen(false);
    setWalkInForm({ ...emptyWalkInForm, vehicleNumber: lookupQuery.trim().toUpperCase() });
    setWalkInPhoto(null);
    setWalkInError("");
    setWalkInOpen(true);
  };

  const columns = [
    { key: "visitorName", header: "Visitor", className: "font-medium text-ink" },
    { key: "targetFlatId", header: "Flat", render: (r) => flatLabel(r.targetFlatId), searchValue: (r) => flatLabel(r.targetFlatId) },
    { key: "purpose", header: "Purpose" },
    { key: "phone", header: "Phone" },
    {
      key: "status",
      header: "Status",
      render: (r) => <StatusBadge status={r.status}>{STATUS_LABEL[r.status] || r.status}</StatusBadge>,
      exportValue: (r) => STATUS_LABEL[r.status] || r.status,
    },
    {
      key: "checkedInAt",
      header: "Checked in",
      render: (r) => (r.checkedInAt ? formatDate(r.checkedInAt, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"),
    },
    {
      key: "checkedOutAt",
      header: "Checked out",
      render: (r) => (r.checkedOutAt ? formatDate(r.checkedOutAt, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"),
    },
    { key: "createdAt", header: "Date", align: "right", render: (r) => formatDate(r.createdAt) },
  ];

  const rowActions = (row) => [
    ...(row.qrCodeDataUrl ? [{ label: "Download pass", icon: IconDownload, onClick: () => downloadVisitorPassPdf(row) }] : []),
    ...((role === "Guard" || role === "Admin") && row.status === "CHECKED_IN"
      ? [{ label: "Checkout", icon: IconCheck, onClick: () => handleCheckout(row) }]
      : []),
    ...((role === "Resident" || role === "Admin") && row.status === "APPROVED"
      ? [{ label: "Cancel pass", icon: IconX, danger: true, onClick: () => setCancelTarget(row) }]
      : []),
  ];

  const visibleVisitors = statusTab === "All" ? visitors : visitors.filter((v) => v.status === statusTab);

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-faint">Gate Security</p>
          <h1 className="mt-1.5 text-3xl font-semibold tracking-tight text-ink">Visitors</h1>
          <p className="mt-1.5 text-[15px] text-ink-faint">
            {role === "Resident"
              ? "Generate QR passes for your guests"
              : role === "Guard"
                ? "Verify passes and log visitors at the gate"
                : "All visitor activity across the society"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {(role === "Guard" || role === "Admin") && (
            <Button
              variant="outline"
              size="md"
              onClick={() => {
                setLookupQuery("");
                setLookupResult(null);
                setLookupOpen(true);
              }}
            >
              <IconCar className="h-4 w-4" /> Vehicle Lookup
            </Button>
          )}
          {role === "Resident" && (
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                setPassForm({ ...emptyPassForm, validUntil: defaultValidUntil() });
                setPassPhoto(null);
                setGeneratedPass(null);
                setPassError("");
                setPassOpen(true);
              }}
            >
              <IconQrCode className="h-4 w-4" /> Generate Pass
            </Button>
          )}
          {role === "Guard" && (
            <>
              <Button
                variant="outline"
                size="md"
                onClick={() => {
                  setWalkInForm(emptyWalkInForm);
                  setWalkInPhoto(null);
                  setWalkInError("");
                  setWalkInOpen(true);
                }}
              >
                <IconPlus className="h-4 w-4" /> Log Walk-in
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  setScanIntent("CHECK_IN");
                  setScanOpen(true);
                }}
              >
                <IconQrCode className="h-4 w-4" /> Scan / Verify Pass
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={() => {
                  setScanIntent("CHECK_OUT");
                  setScanOpen(true);
                }}
              >
                <IconLogOut className="h-4 w-4" /> Checkout Scan
              </Button>
            </>
          )}
        </div>
      </div>

      {(role === "Guard" || role === "Admin") && overstay.length > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/10 px-5 py-3.5 text-sm text-amber-700 dark:text-amber-400">
          <IconAlertCircle className="h-[18px] w-[18px] shrink-0" />
          {overstay.length} visitor{overstay.length === 1 ? "" : "s"} overstaying their approved time window
        </div>
      )}

      <div className="inline-flex flex-wrap gap-1 rounded-xl border border-line bg-surface p-1">
        {STATUS_TABS.map((tab) => {
          const count = tab === "All" ? visitors.length : visitors.filter((v) => v.status === tab).length;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setStatusTab(tab)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-150 ${
                statusTab === tab ? "bg-ink text-canvas shadow-sm" : "text-ink-faint hover:text-ink"
              }`}
            >
              {tab === "All" ? "All" : STATUS_LABEL[tab]}
              <span
                className={`rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${
                  statusTab === tab ? "bg-canvas/20 text-canvas" : "bg-surface-hover text-ink-dim"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex items-center justify-center rounded-xl border border-line bg-surface py-20">
          <Loader label="Loading visitors..." />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-600 dark:text-red-400">{error}</div>
      ) : (
        <Table
          key={`${statusTab}-${refreshKey}`}
          title="Visitor Log"
          columns={columns}
          data={visibleVisitors}
          pageSize={10}
          searchPlaceholder="Search visitors..."
          exportFileName="visitors"
          emptyIcon={IconUsers}
          emptyTitle="No visitors logged yet"
          rowActions={rowActions}
        />
      )}

      <Modal
        open={passOpen}
        onClose={() => setPassOpen(false)}
        title="Generate visitor pass"
        description="Share the QR code with your guest for gate entry."
        footer={
          !generatedPass && (
            <>
              <Button variant="outline" size="sm" onClick={() => setPassOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" disabled={submitting} onClick={handleGeneratePass}>
                {submitting ? "Generating..." : "Generate pass"}
              </Button>
            </>
          )
        }
      >
        {generatedPass ? (
          <div className="flex flex-col items-center py-2 text-center">
            <div className="rounded-xl border border-line bg-white p-4">
              <QRCodeSVG value={generatedPass.qrToken} size={168} />
            </div>
            <p className="mt-4 text-base font-semibold text-ink">{generatedPass.visitorName}</p>
            <p className="text-sm text-ink-faint">
              Numeric gate code: <span className="font-mono font-semibold text-ink">{generatedPass.passCode}</span>
            </p>
            <p className="mt-1 text-xs text-ink-ghost">
              Valid until {formatDate(generatedPass.validUntil, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
            </p>
            <div className="mt-5 flex w-full gap-2.5">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => downloadVisitorPassPdf(generatedPass)}>
                <IconDownload className="h-4 w-4" /> Download PDF
              </Button>
              <Button variant="primary" size="sm" className="flex-1" onClick={() => setPassOpen(false)}>
                Done
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleGeneratePass} className="space-y-4">
            {passError && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-sm text-red-600 dark:text-red-400">
                {passError}
              </div>
            )}
            <TextField
              label="Visitor name"
              required
              error={passFieldErrors.visitorName}
              value={passForm.visitorName}
              onChange={(e) => {
                setPassForm({ ...passForm, visitorName: e.target.value });
                if (passFieldErrors.visitorName) setPassFieldErrors({ ...passFieldErrors, visitorName: "" });
              }}
            />
            <div className="grid grid-cols-2 gap-4">
              <TextField
                label="Phone"
                required
                error={passFieldErrors.phone}
                value={passForm.phone}
                onChange={(e) => {
                  setPassForm({ ...passForm, phone: e.target.value });
                  if (passFieldErrors.phone) setPassFieldErrors({ ...passFieldErrors, phone: "" });
                }}
              />
              <TextField
                label="Vehicle number"
                error={passFieldErrors.vehicleNumber}
                value={passForm.vehicleNumber}
                onChange={(e) => {
                  setPassForm({ ...passForm, vehicleNumber: e.target.value });
                  if (passFieldErrors.vehicleNumber) setPassFieldErrors({ ...passFieldErrors, vehicleNumber: "" });
                }}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <SelectField
                label="Visitor type"
                value={passForm.visitorType}
                onChange={(e) => setPassForm({ ...passForm, visitorType: e.target.value })}
                options={VISITOR_TYPES.map((t) => ({ label: t, value: t }))}
              />
              <TextField
                label="Valid until"
                type="datetime-local"
                required
                error={passFieldErrors.validUntil}
                value={passForm.validUntil}
                onChange={(e) => {
                  setPassForm({ ...passForm, validUntil: e.target.value });
                  if (passFieldErrors.validUntil) setPassFieldErrors({ ...passFieldErrors, validUntil: "" });
                }}
              />
            </div>
            <TextField
              label="Purpose"
              required
              error={passFieldErrors.purpose}
              value={passForm.purpose}
              onChange={(e) => {
                setPassForm({ ...passForm, purpose: e.target.value });
                if (passFieldErrors.purpose) setPassFieldErrors({ ...passFieldErrors, purpose: "" });
              }}
              placeholder="e.g. Family visit"
            />
            <ImageUpload label="Visitor photo (optional)" onChange={setPassPhoto} allowCapture />
          </form>
        )}
      </Modal>

      <Modal
        open={scanOpen}
        onClose={() => setScanOpen(false)}
        title={scanIntent === "CHECK_OUT" ? "Checkout visitor" : "Scan or verify visitor pass"}
        description={
          scanIntent === "CHECK_OUT"
            ? "Scan the visitor's pass to log their exit. Only checked-in visitors can be checked out here."
            : "Scan the visitor's pass to grant gate entry."
        }
        size="sm"
      >
        <div className="space-y-4">
          <div
            id="qr-reader-region"
            className="relative mx-auto w-full overflow-hidden rounded-lg bg-black/80"
            style={{ minHeight: cameraActive ? 220 : 0 }}
          />
          {!cameraActive ? (
            <Button type="button" variant="outline" size="sm" className="w-full" onClick={startCamera}>
              <IconQrCode className="h-4 w-4" /> Start camera scan
            </Button>
          ) : (
            <Button type="button" variant="outline" size="sm" className="w-full" onClick={stopCamera}>
              Stop camera
            </Button>
          )}

          <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-ink-ghost">
            <span className="h-px flex-1 bg-line-soft" /> or enter manually <span className="h-px flex-1 bg-line-soft" />
          </div>

          {cameraError && (
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2.5 text-sm text-amber-700 dark:text-amber-400">
              {cameraError}
            </div>
          )}

          <TextField
            label="Gate code / QR token"
            value={manualToken}
            onChange={(e) => setManualToken(e.target.value)}
            placeholder="e.g. 482913 or VQR-..."
          />
          <Button type="button" variant="primary" size="sm" className="w-full" disabled={!manualToken.trim()} onClick={() => runVerify(manualToken.trim())}>
            Verify
          </Button>
        </div>
      </Modal>

      <ScanResultModal open={scanModalOpen} result={scanResult} onClose={() => setScanModalOpen(false)} autoDismissTime={4500} />

      <Modal
        open={walkInOpen}
        onClose={() => {
          setWalkInOpen(false);
          setWalkInPhoto(null);
        }}
        title="Log walk-in visitor"
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setWalkInOpen(false);
                setWalkInPhoto(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" size="sm" disabled={submitting} onClick={handleWalkIn}>
              {submitting ? "Logging..." : "Log & check in"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleWalkIn} className="space-y-4">
          {walkInError && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-sm text-red-600 dark:text-red-400">
              {walkInError}
            </div>
          )}
          <TextField
            label="Visitor name"
            required
            error={walkInFieldErrors.visitorName}
            value={walkInForm.visitorName}
            onChange={(e) => {
              setWalkInForm({ ...walkInForm, visitorName: e.target.value });
              if (walkInFieldErrors.visitorName) setWalkInFieldErrors({ ...walkInFieldErrors, visitorName: "" });
            }}
          />
          <div className="grid grid-cols-2 gap-4">
            <TextField
              label="Phone"
              required
              error={walkInFieldErrors.phone}
              value={walkInForm.phone}
              onChange={(e) => {
                setWalkInForm({ ...walkInForm, phone: e.target.value });
                if (walkInFieldErrors.phone) setWalkInFieldErrors({ ...walkInFieldErrors, phone: "" });
              }}
            />
            <TextField
              label="Vehicle number"
              error={walkInFieldErrors.vehicleNumber}
              value={walkInForm.vehicleNumber}
              onChange={(e) => {
                setWalkInForm({ ...walkInForm, vehicleNumber: e.target.value });
                if (walkInFieldErrors.vehicleNumber) setWalkInFieldErrors({ ...walkInFieldErrors, vehicleNumber: "" });
              }}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <SelectField
              label="Visitor type"
              value={walkInForm.visitorType}
              onChange={(e) => setWalkInForm({ ...walkInForm, visitorType: e.target.value })}
              options={VISITOR_TYPES.map((t) => ({ label: t, value: t }))}
            />
            <SelectField
              label="Target flat"
              required
              error={walkInFieldErrors.targetFlatId}
              value={walkInForm.targetFlatId}
              onChange={(e) => {
                setWalkInForm({ ...walkInForm, targetFlatId: e.target.value });
                if (walkInFieldErrors.targetFlatId) setWalkInFieldErrors({ ...walkInFieldErrors, targetFlatId: "" });
              }}
              options={[{ label: "Select flat", value: "" }, ...flats.map((f) => ({ label: `${f.blockName}-${f.flatNumber}`, value: f._id }))]}
            />
          </div>
          <TextField
            label="Purpose"
            required
            error={walkInFieldErrors.purpose}
            value={walkInForm.purpose}
            onChange={(e) => {
              setWalkInForm({ ...walkInForm, purpose: e.target.value });
              if (walkInFieldErrors.purpose) setWalkInFieldErrors({ ...walkInFieldErrors, purpose: "" });
            }}
            placeholder="e.g. Package delivery"
          />
          <ImageUpload label="Visitor photo (optional)" onChange={setWalkInPhoto} allowCapture />
        </form>
      </Modal>

      <Modal open={lookupOpen} onClose={() => setLookupOpen(false)} title="Vehicle lookup" description="Check if a number plate belongs to a registered resident." size="sm">
        <form onSubmit={handleVehicleLookup} className="space-y-4">
          <div className="flex gap-2">
            <TextField
              label="Vehicle number"
              className="flex-1"
              value={lookupQuery}
              onChange={(e) => setLookupQuery(e.target.value)}
              placeholder="e.g. LEC-1234"
            />
          </div>
          <Button type="submit" variant="primary" size="sm" className="w-full" disabled={!lookupQuery.trim() || lookupLoading}>
            {lookupLoading ? "Searching..." : "Search"}
          </Button>

          {lookupResult?.found && (
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                <IconShield className="h-4 w-4" /> Registered resident vehicle
              </div>
              <div className="mt-3 space-y-1.5 text-sm text-ink-dim">
                <p>
                  <span className="text-ink-ghost">Owner:</span> {lookupResult.resident.name} ({lookupResult.resident.role})
                </p>
                <p>
                  <span className="text-ink-ghost">Flat:</span> {flatLabel(lookupResult.flat)}
                </p>
                <p>
                  <span className="text-ink-ghost">Phone:</span> {lookupResult.resident.phone}
                </p>
                <p>
                  <span className="text-ink-ghost">Vehicle:</span> {lookupResult.vehicle.type} · {lookupResult.vehicle.vehicleNumber}
                </p>
              </div>
            </div>
          )}

          {lookupResult && !lookupResult.found && (
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-4">
              <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                {lookupResult.error || "Not a registered resident vehicle."}
              </p>
              {!lookupResult.error && role === "Guard" && (
                <>
                  <p className="mt-1 text-xs text-ink-ghost">Treat as an unregistered visitor and log them at the gate.</p>
                  <Button type="button" variant="outline" size="sm" className="mt-3 w-full" onClick={startWalkInFromLookup}>
                    <IconPlus className="h-4 w-4" /> Log as walk-in visitor
                  </Button>
                </>
              )}
            </div>
          )}
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(cancelTarget)}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancelPass}
        title="Cancel this visitor pass?"
        description={cancelTarget ? `${cancelTarget.visitorName}'s pass will no longer work at the gate.` : ""}
        confirmLabel="Cancel pass"
        variant="danger"
      />
    </div>
  );
}
