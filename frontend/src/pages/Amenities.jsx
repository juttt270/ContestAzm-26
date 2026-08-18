import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import * as amenityService from "@/services/amenityService";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import TextareaField from "@/components/ui/TextareaField";
import ImageUpload from "@/components/ui/ImageUpload";
import Badge from "@/components/ui/Badge";
import Loader from "@/components/ui/Loader";
import EmptyState from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/date";
import { formatCurrency } from "@/lib/currency";
import {
  validateRequired,
  validatePositiveNumber,
  validateFutureDate,
  validateTimeSlot,
} from "@/utils/validators";
import { IconPlus, IconCalendar, IconClock, IconUsers, IconCheck } from "@/components/ui/icons";

const emptyCreateForm = { name: "", description: "", capacity: "20", bookingFee: "0" };
const emptyBookForm = { bookingDate: "", startTime: "18:00", endTime: "20:00", guestCount: "2", notes: "" };

const GRADIENTS = [
  "from-blue-500/25 via-blue-500/5 to-transparent",
  "from-violet-500/25 via-violet-500/5 to-transparent",
  "from-emerald-500/25 via-emerald-500/5 to-transparent",
  "from-amber-500/25 via-amber-500/5 to-transparent",
  "from-rose-500/25 via-rose-500/5 to-transparent",
];

export default function Amenities() {
  const { role } = useAuth();
  const [amenities, setAmenities] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState(emptyCreateForm);
  const [createFieldErrors, setCreateFieldErrors] = useState({});
  const [createImage, setCreateImage] = useState(null);
  const [createError, setCreateError] = useState("");

  const [bookTarget, setBookTarget] = useState(null);
  const [bookForm, setBookForm] = useState(emptyBookForm);
  const [bookFieldErrors, setBookFieldErrors] = useState({});
  const [bookError, setBookError] = useState("");
  const [existingBookings, setExistingBookings] = useState([]);

  const fetchAll = async () => {
    setLoading(true);
    setError("");
    try {
      const tasks = [amenityService.getAmenities()];
      if (role === "Resident") tasks.push(amenityService.getMyBookings());
      const [amenitiesData, bookingsData] = await Promise.all(tasks);
      setAmenities(amenitiesData);
      if (bookingsData) setMyBookings(bookingsData);
    } catch (err) {
      setError(err.message || "Failed to load amenities");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreateError("");
    const nameErr = validateRequired(createForm.name, "Amenity name", 2, 60);
    const capErr = validatePositiveNumber(createForm.capacity, "Capacity", 1, 1000);
    const feeErr = validatePositiveNumber(createForm.bookingFee, "Booking fee", 0);

    if (nameErr || capErr || feeErr) {
      setCreateFieldErrors({
        name: nameErr,
        capacity: capErr,
        bookingFee: feeErr,
      });
      return;
    }
    setCreateFieldErrors({});
    setSubmitting(true);
    try {
      await amenityService.createAmenity({
        ...createForm,
        name: createForm.name.trim(),
        capacity: Number(createForm.capacity),
        bookingFee: Number(createForm.bookingFee),
        image: createImage,
      });
      setCreateOpen(false);
      setCreateForm(emptyCreateForm);
      setCreateImage(null);
      fetchAll();
    } catch (err) {
      setCreateError(err.message || "Failed to create amenity");
    } finally {
      setSubmitting(false);
    }
  };

  const openBook = (amenity) => {
    setBookTarget(amenity);
    setBookForm(emptyBookForm);
    setBookFieldErrors({});
    setBookError("");
    setExistingBookings([]);
  };

  const checkDate = async (date) => {
    setBookForm((f) => ({ ...f, bookingDate: date }));
    if (!date || !bookTarget) return;
    try {
      const { existingBookings: bookings } = await amenityService.checkAvailability(bookTarget._id, date);
      setExistingBookings(bookings);
    } catch {
      setExistingBookings([]);
    }
  };

  const handleBook = async (e) => {
    e.preventDefault();
    setBookError("");
    const dateErr = validateFutureDate(bookForm.bookingDate, "Booking date");
    const slotErr = validateTimeSlot(bookForm.startTime, bookForm.endTime);
    const guestErr = validatePositiveNumber(bookForm.guestCount, "Guest count", 1, bookTarget?.capacity || 100);

    if (dateErr || slotErr || guestErr) {
      setBookFieldErrors({
        bookingDate: dateErr,
        timeSlot: slotErr,
        guestCount: guestErr,
      });
      return;
    }
    setBookFieldErrors({});
    setSubmitting(true);
    try {
      await amenityService.bookAmenity(bookTarget._id, bookForm);
      setBookTarget(null);
      fetchAll();
    } catch (err) {
      setBookError(err.message || "Failed to book amenity");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader label="Loading amenities..." />
      </div>
    );
  }

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-faint">Community</p>
          <h1 className="mt-1.5 text-3xl font-semibold tracking-tight text-ink">Amenities</h1>
          <p className="mt-1.5 text-[15px] text-ink-faint">Book shared facilities and community spaces</p>
        </div>
        {role === "Admin" && (
          <Button
            variant="primary"
            size="md"
            onClick={() => {
              setCreateForm(emptyCreateForm);
              setCreateImage(null);
              setCreateError("");
              setCreateOpen(true);
            }}
          >
            <IconPlus className="h-4 w-4" />
            Add Amenity
          </Button>
        )}
      </div>

      {error && <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-600 dark:text-red-400">{error}</div>}

      {amenities.length === 0 ? (
        <div className="rounded-xl border border-line bg-surface">
          <EmptyState icon={IconCalendar} title="No amenities configured yet" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {amenities.map((a, i) => (
            <div
              key={a._id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-all duration-200 hover:-translate-y-1 hover:border-transparent hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/50"
            >
              <div className="relative h-36 shrink-0 overflow-hidden">
                {a.image?.url ? (
                  <img
                    src={a.image.url}
                    alt={a.name}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]} bg-canvas`}>
                    <IconCalendar className="h-9 w-9 text-ink-ghost" />
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/40 to-transparent" />
                <span className="absolute bottom-2.5 left-3.5 text-base font-semibold text-white drop-shadow-sm">{a.name}</span>
                {a.bookingFee > 0 && (
                  <span className="absolute right-3 top-3 rounded-full bg-black/50 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                    {formatCurrency(a.bookingFee)}
                  </span>
                )}
              </div>

              <div className="flex flex-1 flex-col p-5">
                <p className="flex-1 text-sm text-ink-faint">{a.description || "No description provided."}</p>
                <div className="mt-3.5 flex items-center gap-3 text-xs text-ink-faint">
                  <span className="flex items-center gap-1">
                    <IconUsers className="h-3.5 w-3.5" /> {a.capacity} guests
                  </span>
                  {a.bookingFee === 0 && <Badge variant="success">Free</Badge>}
                </div>
                {role === "Resident" && (
                  <Button variant="primary" size="sm" className="mt-4 w-full" onClick={() => openBook(a)}>
                    Book slot
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {role === "Resident" && myBookings.length > 0 && (
        <div className="rounded-xl border border-line bg-surface">
          <div className="border-b border-line-soft px-5 py-4">
            <h2 className="text-base font-semibold text-ink">My Bookings</h2>
          </div>
          <ul className="divide-y divide-line-soft">
            {myBookings.map((b) => (
              <li key={b._id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                <div>
                  <p className="text-[15px] text-ink-dim">{b.amenityId?.name}</p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-ghost">
                    <IconClock className="h-3.5 w-3.5" /> {formatDate(b.bookingDate)} · {b.startTime}–{b.endTime}
                    {b.guestCount ? ` · ${b.guestCount} guests` : ""}
                  </p>
                </div>
                <Badge variant={b.status === "CONFIRMED" ? "success" : "neutral"}>{b.status}</Badge>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Add new amenity"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" disabled={submitting} onClick={handleCreate}>
              {submitting ? "Creating..." : "Create"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreate} className="space-y-4">
          {createError && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-sm text-red-600 dark:text-red-400">
              {createError}
            </div>
          )}
          <ImageUpload label="Cover image" onChange={setCreateImage} />
          <TextField
            label="Name"
            required
            error={createFieldErrors.name}
            value={createForm.name}
            onChange={(e) => {
              setCreateForm({ ...createForm, name: e.target.value });
              if (createFieldErrors.name) setCreateFieldErrors({ ...createFieldErrors, name: "" });
            }}
            placeholder="e.g. Community Clubhouse"
          />
          <TextareaField
            label="Description"
            rows={2}
            value={createForm.description}
            onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
            placeholder="What residents can expect from this space..."
          />
          <div className="grid grid-cols-2 gap-4">
            <TextField
              label="Capacity"
              type="number"
              min="1"
              required
              error={createFieldErrors.capacity}
              value={createForm.capacity}
              onChange={(e) => {
                setCreateForm({ ...createForm, capacity: e.target.value });
                if (createFieldErrors.capacity) setCreateFieldErrors({ ...createFieldErrors, capacity: "" });
              }}
            />
            <TextField
              label="Booking fee (Rs)"
              type="number"
              min="0"
              error={createFieldErrors.bookingFee}
              value={createForm.bookingFee}
              onChange={(e) => {
                setCreateForm({ ...createForm, bookingFee: e.target.value });
                if (createFieldErrors.bookingFee) setCreateFieldErrors({ ...createFieldErrors, bookingFee: "" });
              }}
            />
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(bookTarget)}
        onClose={() => setBookTarget(null)}
        title={bookTarget ? `Book ${bookTarget.name}` : ""}
        description={bookTarget ? `Up to ${bookTarget.capacity} guests · ${bookTarget.bookingFee > 0 ? formatCurrency(bookTarget.bookingFee) + " fee" : "Free"}` : ""}
        size="sm"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setBookTarget(null)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" disabled={submitting} onClick={handleBook}>
              {submitting ? "Booking..." : "Confirm booking"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleBook} className="space-y-4">
          {bookError && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-sm text-red-600 dark:text-red-400">
              {bookError}
            </div>
          )}
          <TextField
            label="Date"
            type="date"
            required
            error={bookFieldErrors.bookingDate}
            value={bookForm.bookingDate}
            onChange={(e) => {
              checkDate(e.target.value);
              if (bookFieldErrors.bookingDate) setBookFieldErrors({ ...bookFieldErrors, bookingDate: "" });
            }}
          />
          {existingBookings.length > 0 && (
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2.5 text-xs text-amber-700 dark:text-amber-400">
              Already booked: {existingBookings.map((b) => `${b.startTime}–${b.endTime}`).join(", ")}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <TextField
              label="Start time"
              type="time"
              required
              error={bookFieldErrors.timeSlot}
              value={bookForm.startTime}
              onChange={(e) => {
                setBookForm({ ...bookForm, startTime: e.target.value });
                if (bookFieldErrors.timeSlot) setBookFieldErrors({ ...bookFieldErrors, timeSlot: "" });
              }}
            />
            <TextField
              label="End time"
              type="time"
              required
              error={bookFieldErrors.timeSlot}
              value={bookForm.endTime}
              onChange={(e) => {
                setBookForm({ ...bookForm, endTime: e.target.value });
                if (bookFieldErrors.timeSlot) setBookFieldErrors({ ...bookFieldErrors, timeSlot: "" });
              }}
            />
          </div>
          <TextField
            label="Number of guests"
            type="number"
            min="1"
            max={bookTarget?.capacity || undefined}
            required
            error={bookFieldErrors.guestCount}
            value={bookForm.guestCount}
            onChange={(e) => {
              setBookForm({ ...bookForm, guestCount: e.target.value });
              if (bookFieldErrors.guestCount) setBookFieldErrors({ ...bookFieldErrors, guestCount: "" });
            }}
          />
          <TextareaField
            label="Notes (optional)"
            rows={2}
            value={bookForm.notes}
            onChange={(e) => setBookForm({ ...bookForm, notes: e.target.value })}
            placeholder="Any special requests for this booking..."
          />
          <div className="flex items-center gap-1.5 text-xs text-ink-ghost">
            <IconCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> Availability is checked automatically for your selected date.
          </div>
        </form>
      </Modal>
    </div>
  );
}
