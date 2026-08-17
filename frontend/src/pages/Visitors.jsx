import { useEffect, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Html5Qrcode } from "html5-qrcode";
import { useAuth } from "@/context/AuthContext";
import * as visitorService from "@/services/visitorService";
import * as flatService from "@/services/flatService";
import * as userService from "@/services/userService";
import Table from "@/components/ui/Table";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import SelectField from "@/components/ui/SelectField";
import StatusBadge from "@/components/ui/StatusBadge";
import Loader from "@/components/ui/Loader";
import ImageUpload from "@/components/ui/ImageUpload";
import { formatDate } from "@/lib/date";
import { IconPlus, IconQrCode, IconUsers, IconCheck, IconAlertCircle, IconCar, IconShield } from "@/components/ui/icons";

const VISITOR_TYPES = ["Guest", "Delivery", "Cab", "Vendor", "Service"];
const STATUS_LABEL = {
  APPROVED: "Approved",
  CHECKED_IN: "Checked in",
  COMPLETED: "Checked out",
  EXPIRED: "Expired",
  CANCELLED: "Cancelled",
};
const flatLabel = (flat) => (flat ? `${flat.blockName}-${flat.flatNumber}` : "—");

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
  const [passError, setPassError] = useState("");
  const [generatedPass, setGeneratedPass] = useState(null);

  const [scanOpen, setScanOpen] = useState(false);
  const [manualToken, setManualToken] = useState("");
  const [scanResult, setScanResult] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const scannerRef = useRef(null);

  const [walkInOpen, setWalkInOpen] = useState(false);
  const [walkInForm, setWalkInForm] = useState(emptyWalkInForm);
  const [walkInPhoto, setWalkInPhoto] = useState(null);
  const [walkInError, setWalkInError] = useState("");

  const [lookupOpen, setLookupOpen] = useState(false);
  const [lookupQuery, setLookupQuery] = useState("");
  const [lookupResult, setLookupResult] = useState(null);
  const [lookupLoading, setLookupLoading] = useState(false);

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
    setSubmitting(true);
    try {
      const visitor = await visitorService.generateVisitorPass(passForm);
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
      const payload = qrToken.startsWith("VQR-") ? { qrToken } : { passCode: qrToken };
      const result = await visitorService.verifyQrPass(payload);
      setScanResult({ ok: true, message: `Access granted: ${result.visitor.visitorName} → ${flatLabel(result.visitor.targetFlat)}` });
      fetchAll();
    } catch (err) {
      setScanResult({ ok: false, message: err.message || "Verification failed" });
    }
  };

  const startCamera = async () => {
    try {
      const scanner = new Html5Qrcode("qr-reader-region");
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 220 },
        (decodedText) => {
          runVerify(decodedText);
          scanner
            .stop()
            .then(() => setCameraActive(false))
            .catch(() => {});
        },
        () => {},
      );
      setCameraActive(true);
    } catch {
      setScanResult({ ok: false, message: "Camera unavailable — use manual code entry below instead." });
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
      setManualToken("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanOpen]);

  const handleWalkIn = async (e) => {
    e.preventDefault();
    setWalkInError("");
    setSubmitting(true);
    try {
      await visitorService.logWalkIn({ ...walkInForm, photo: walkInPhoto || undefined });
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
    { key: "createdAt", header: "Date", align: "right", render: (r) => formatDate(r.createdAt) },
  ];

  const rowActions =
    role === "Guard" || role === "Admin"
      ? (row) => (row.status === "CHECKED_IN" ? [{ label: "Checkout", icon: IconCheck, onClick: () => handleCheckout(row) }] : [])
      : undefined;

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
              <Button variant="primary" size="md" onClick={() => setScanOpen(true)}>
                <IconQrCode className="h-4 w-4" /> Scan / Verify Pass
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

      {loading ? (
        <div className="flex items-center justify-center rounded-xl border border-line bg-surface py-20">
          <Loader label="Loading visitors..." />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-600 dark:text-red-400">{error}</div>
      ) : (
        <Table
          title="Visitor Log"
          columns={columns}
          data={visitors}
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
            <Button variant="primary" size="sm" className="mt-5 w-full" onClick={() => setPassOpen(false)}>
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleGeneratePass} className="space-y-4">
            {passError && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-sm text-red-600 dark:text-red-400">
                {passError}
              </div>
            )}
            <TextField label="Visitor name" required value={passForm.visitorName} onChange={(e) => setPassForm({ ...passForm, visitorName: e.target.value })} />
            <div className="grid grid-cols-2 gap-4">
              <TextField label="Phone" required value={passForm.phone} onChange={(e) => setPassForm({ ...passForm, phone: e.target.value })} />
              <TextField
                label="Vehicle number"
                value={passForm.vehicleNumber}
                onChange={(e) => setPassForm({ ...passForm, vehicleNumber: e.target.value })}
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
                value={passForm.validUntil}
                onChange={(e) => setPassForm({ ...passForm, validUntil: e.target.value })}
              />
            </div>
            <TextField
              label="Purpose"
              value={passForm.purpose}
              onChange={(e) => setPassForm({ ...passForm, purpose: e.target.value })}
              placeholder="e.g. Family visit"
            />
          </form>
        )}
      </Modal>

      <Modal open={scanOpen} onClose={() => setScanOpen(false)} title="Scan or verify visitor pass" size="sm">
        <div className="space-y-4">
          <div id="qr-reader-region" className="mx-auto w-full overflow-hidden rounded-lg bg-black/80" style={{ minHeight: cameraActive ? 220 : 0 }} />
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

          <TextField
            label="Gate code / QR token"
            value={manualToken}
            onChange={(e) => setManualToken(e.target.value)}
            placeholder="e.g. 482913 or VQR-..."
          />
          <Button type="button" variant="primary" size="sm" className="w-full" disabled={!manualToken.trim()} onClick={() => runVerify(manualToken.trim())}>
            Verify
          </Button>

          {scanResult && (
            <div
              className={`rounded-lg border px-3 py-2.5 text-sm ${
                scanResult.ok
                  ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400"
              }`}
            >
              {scanResult.message}
            </div>
          )}
        </div>
      </Modal>

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
          <TextField label="Visitor name" required value={walkInForm.visitorName} onChange={(e) => setWalkInForm({ ...walkInForm, visitorName: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <TextField label="Phone" required value={walkInForm.phone} onChange={(e) => setWalkInForm({ ...walkInForm, phone: e.target.value })} />
            <TextField
              label="Vehicle number"
              value={walkInForm.vehicleNumber}
              onChange={(e) => setWalkInForm({ ...walkInForm, vehicleNumber: e.target.value })}
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
              value={walkInForm.targetFlatId}
              onChange={(e) => setWalkInForm({ ...walkInForm, targetFlatId: e.target.value })}
              options={[{ label: "Select flat", value: "" }, ...flats.map((f) => ({ label: `${f.blockName}-${f.flatNumber}`, value: f._id }))]}
            />
          </div>
          <TextField
            label="Purpose"
            value={walkInForm.purpose}
            onChange={(e) => setWalkInForm({ ...walkInForm, purpose: e.target.value })}
            placeholder="e.g. Package delivery"
          />
          <ImageUpload label="Visitor photo (optional)" onChange={setWalkInPhoto} />
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
    </div>
  );
}
