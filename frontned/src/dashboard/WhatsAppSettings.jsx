
import React, { useEffect, useState } from "react";
import { API } from "./config";

export default function WhatsAppSettings() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({
    type: "",
    text: "",
  });

  useEffect(() => {
    let cancelled = false;

    async function loadSettings() {
      try {
        const response = await fetch(
          `${API}/site-settings/whatsapp`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load settings.");
        }

        if (!cancelled) {
          setPhoneNumber(data.phoneNumber || "");
          setMessage(data.message || "");
        }
      } catch (error) {
        if (!cancelled) {
          setStatus({
            type: "error",
            text: error.message || "Unable to load WhatsApp settings.",
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadSettings();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setStatus({ type: "", text: "" });

    try {
      const token = localStorage.getItem("admin_token");

      if (!token) {
        throw new Error("Please log in to the admin panel again.");
      }

      const response = await fetch(
        `${API}/site-settings/whatsapp`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            phoneNumber,
            message,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save settings.");
      }

      setPhoneNumber(data.settings.phoneNumber);
      setMessage(data.settings.message);

      setStatus({
        type: "success",
        text: "WhatsApp settings saved successfully.",
      });
    } catch (error) {
      setStatus({
        type: "error",
        text: error.message || "Something went wrong.",
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6 text-sm text-stone-500">
        Loading WhatsApp settings...
      </div>
    );
  }

  return (
    <section className="mx-auto w-full max-w-3xl p-4 sm:p-6">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-green-700">
          Website Configuration
        </p>

        <h1 className="mt-2 text-2xl font-bold text-stone-900">
          WhatsApp Settings
        </h1>

        <p className="mt-2 text-sm leading-6 text-stone-600">
          Update the WhatsApp number and default message used by
          the website's floating WhatsApp button.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6"
      >
        <div>
          <label
            htmlFor="whatsapp-number"
            className="mb-2 block text-sm font-semibold text-stone-800"
          >
            WhatsApp Number
          </label>

          <input
            id="whatsapp-number"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            value={phoneNumber}
            onChange={(event) => setPhoneNumber(event.target.value)}
            placeholder="919876543210"
            required
            maxLength={20}
            className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
          />

          <p className="mt-2 text-xs leading-5 text-stone-500">
            Include the country code. Example: 91 followed by
            your 10-digit mobile number. Do not enter +, spaces,
            or hyphens.
          </p>
        </div>

        <div>
          <label
            htmlFor="whatsapp-message"
            className="mb-2 block text-sm font-semibold text-stone-800"
          >
            Default WhatsApp Message
          </label>

          <textarea
            id="whatsapp-message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Hello! I need some assistance."
            rows={3}
            maxLength={1000}
            required
            className="w-full resize-y rounded-xl border border-stone-300 px-4 py-3 text-sm leading-6 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
          />
        </div>

        {status.text && (
          <div
            role="status"
            aria-live="polite"
            className={`rounded-xl px-4 py-3 text-sm ${
              status.type === "success"
                ? "bg-green-50 text-green-800"
                : "bg-red-50 text-red-700"
            }`}
          >
            {status.text}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save WhatsApp Settings"}
        </button>
      </form>
    </section>
  );
}
