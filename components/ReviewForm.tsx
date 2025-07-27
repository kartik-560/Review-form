"use client";
import LocationDetector, { Location } from "./LocationDetector";

import { useState, useEffect } from "react";
import OptionalImageUploader from "./MandatoryImageUploader";
export default function SubmitReview() {
  type FormState = {
    name: string;
    phone: string;
    remarks: string;
    images: File[];
  };

  const [form, setForm] = useState<FormState>({
    name: "",
    phone: "",
    remarks: "",
    images: [],
  });
  const [locationCoords, setLocationCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [remarks, setRemarks] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [successMsg, setSuccessMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );
  const [locationRecordId, setLocationRecordId] = useState<string | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocationCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        (err) => {
          console.warn("Geolocation not allowed:", err);
        }
      );
    }
  }, []);

  const handleChange = (e: { target: { name: any; value: any } }) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name.trim() || !phone.trim() || !remarks.trim()) {
      alert("Please fill all required fields");
      return;
    }

    if (!selectedLocation) {
      alert("Location not detected yet.");
      return;
    }

    try {
      setSubmitting(true);

      // If location not yet submitted, submit to backend
      let siteId = locationRecordId;
      if (!siteId) {
        const locRes = await fetch("http://localhost:5000/locations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: selectedLocation.address.split(",")[0],
            address: selectedLocation.address,
            latitude: selectedLocation.latitude,
            longitude: selectedLocation.longitude,
          }),
        });

        const locData = await locRes.json();
        siteId = locData.id;
        setLocationRecordId(siteId);
      }

      const formData = new FormData();
      formData.append("name", name);
      formData.append("phone", phone);
      formData.append("remarks", remarks);
      formData.append("site_id", siteId!);
      images.forEach((img) => formData.append("images", img));

      const res = await fetch("http://localhost:5000/cleaner-reviews", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to submit review");

      setSuccessMsg("Review submitted successfully!");
      setName("");
      setPhone("");
      setRemarks("");
      setImages([]);
      setLocationRecordId(null);

      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      alert("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="bg-white shadow-xl rounded-lg w-full max-w-2xl p-8 space-y-6">
        <h2 className="text-3xl font-bold text-gray-800 text-center">
          Submit Cleanliness Review
        </h2>

        {successMsg && (
          <div className="bg-green-100 text-green-700 px-4 py-3 rounded relative text-sm">
            ✅ {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <LocationDetector
            location={selectedLocation}
            onLocationChange={setSelectedLocation}
          />

          <div>
            <label className="block font-medium text-sm text-gray-700">
              Name *
            </label>
            <input
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-medium text-sm text-gray-700">
              Phone *
            </label>
            <input
              name="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="mt-1 w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-medium text-sm text-gray-700">
              Remarks
            </label>
            <textarea
              name="remarks"
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="mt-1 w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <OptionalImageUploader
            images={images}
            onImagesChange={setImages}
            maxImages={3}
            maxSizeKB={300}
          />

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md shadow-md transition duration-200"
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      </div>
    </div>
  );
}
