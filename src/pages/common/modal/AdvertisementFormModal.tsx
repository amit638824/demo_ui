"use client";

import React, { useEffect, useState } from "react";
import {
  createAdvertisement,
  updateAdvertisement,
  recruiterSearchService,
} from "@/services/SuperAdminService";
import { useUser } from "@/hooks/useSession";
import ServerSearchSelect from "@/components/Common/SearchableSelect";

/* ---------------- TYPES ---------------- */

interface Props {
  ad?: any | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface RecruiterApi {
  user_mobile: any;
  user_id: number;
  user_fullName?: string;
  name?: string;
}

interface RecruiterOption {
  user_id: number;
  user_mobile: string;
  user_fullName?: string;
}

interface FormState {
  title: string;
  description: string;
  redirectUrl: string;
  startDate: string;
  endDate: string;
  roleIds: number[];
  recruiter: RecruiterOption | null;
}

/* ---------------- CONSTANTS ---------------- */

const ROLE_OPTIONS = [
  { id: 6, label: "Recruiter" },
  { id: 5, label: "Job Seeker" },
];

/* ---------------- COMPONENT ---------------- */

export default function AdvertisementFormModal({
  ad,
  onClose,
  onSuccess,
}: Props) {
  const { user_id } = useUser();
  const today = new Date().toISOString().split("T")[0];

  /* ---------------- FORM STATE ---------------- */

  const [form, setForm] = useState<FormState>({
    title: ad?.title ?? "",
    description: ad?.description ?? "",
    redirectUrl: ad?.redirectUrl ?? "",
    startDate: ad?.startDate?.substring(0, 10) ?? "",
    endDate: ad?.endDate?.substring(0, 10) ?? "",
    roleIds: ad?.roleIds ?? [],
    recruiter: null,
  });

  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    ad?.imageUrl ?? null
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ---------------- LOAD RECRUITER ON EDIT ---------------- */

useEffect(() => {
  if (!ad || !ad.customerId) return;

  const loadRecruiter = async () => {
    try {
      const response: any = await recruiterSearchService("");

      const list: RecruiterApi[] =
        response?.data?.items ??
        response?.data ??
        response ??
        [];

      const found = list.find(
        (r) => r.user_id === ad.customerId
      );

      if (!found) return;

      // ✅ IMPORTANT: use SAME SHAPE as API option
      setForm((prev) => ({
        ...prev,
        recruiter: found,
      }));
    } catch (err) {
      console.error("Failed to load recruiter", err);
    }
  };

  loadRecruiter();
}, [ad?.customerId]);



  useEffect(() => {
  return () => {
    if (imagePreview && imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }
  };
}, [imagePreview]);


  /* ---------------- HANDLERS ---------------- */

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const toggleRole = (roleId: number) => {
    setForm((prev) => ({
      ...prev,
      roleIds: prev.roleIds.includes(roleId)
        ? prev.roleIds.filter((id) => id !== roleId)
        : [...prev.roleIds, roleId],
    }));
  };

  /* ---------------- VALIDATION ---------------- */

  const validateForm = async () => {
    const newErrors: Record<string, string> = {};

    if (!form.title.trim()) newErrors.title = "Title is required";
    if (!form.redirectUrl.trim())
      newErrors.redirectUrl = "Redirect URL is required";
    if (!form.startDate) newErrors.startDate = "Start date is required";
    if (!form.endDate) newErrors.endDate = "End date is required";
    if (!form.roleIds.length)
      newErrors.roleIds = "Please select at least one role";
    // if (!form.recruiter)
    //   newErrors.recruiter = "Recruiter is required";

    const start = new Date(form.startDate);
    const end = new Date(form.endDate);
    const now = new Date(today);

    if (!ad && start < now)
      newErrors.startDate = "Start date cannot be in the past";

    if (end < now)
      newErrors.endDate = "End date cannot be in the past";

    if (end < start)
      newErrors.endDate = "End date cannot be before start date";

    if (!ad && !image)
      newErrors.image = "Banner image is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = async () => {
    if (!(await validateForm())) return;

    setIsSubmitting(true);

    try {
      const payload = new FormData();

      payload.append("title", form.title);
      payload.append("description", form.description);
      payload.append("redirectUrl", form.redirectUrl);
      payload.append("startDate", form.startDate);
      payload.append("endDate", form.endDate);

      if (form.recruiter?.user_id) {
        payload.append("customerId", String(form.recruiter.user_id));
      }

      form.roleIds.forEach((id) =>
        payload.append("roleIds[]", String(id))
      );

      if (image) payload.append("image", image);

      payload.append("updatedBy", String(user_id));
      if (!ad) payload.append("createdBy", String(user_id));

      ad?.id
        ? await updateAdvertisement(ad.id, payload)
        : await createAdvertisement(payload);

      onSuccess();
    } catch (err) {
      console.error("Save advertisement failed", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---------------- UI ---------------- */

  const ErrorText = ({ field }: { field: string }) =>
    errors[field] ? (
      <small className="text-danger">{errors[field]}</small>
    ) : null;

  return (
    <>
      <div className="modal fade show d-block">
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content border-0 shadow">

            <div className="modal-header">
              <h5>{ad ? "Edit Advertisement" : "Add Advertisement"}</h5>
              <button className="btn-close" onClick={onClose} />
            </div>

            <div className="modal-body">
              <div className="row g-3">

                <div className="col-md-12">
                  <label>Title *</label>
                  <input
                    name="title"
                    className="form-control"
                    value={form.title}
                    onChange={handleChange}
                  />
                  <ErrorText field="title" />
                </div>

                <div className="col-md-12">
                  <label>Description</label>
                  <textarea
                    name="description"
                    className="form-control"
                    rows={3}
                    value={form.description}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-12">
                  <label>Redirect URL *</label>
                  <input
                    name="redirectUrl"
                    className="form-control"
                    value={form.redirectUrl}
                    onChange={handleChange}
                  />
                  <ErrorText field="redirectUrl" />
                </div>

                <div className="col-md-6">
                  <label>Start Date *</label>
                  <input
                    type="date"
                    name="startDate"
                    className="form-control"
                    value={form.startDate}
                    min={today}
                    disabled={!!ad}
                    onChange={handleChange}
                  />
                  <ErrorText field="startDate" />
                </div>

                <div className="col-md-6">
                  <label>End Date *</label>
                  <input
                    type="date"
                    name="endDate"
                    className="form-control"
                    value={form.endDate}
                    min={form.startDate || today}
                    onChange={handleChange}
                  />
                  <ErrorText field="endDate" />
                </div>

                <div className="col-md-6">
                  <label className="d-block mb-2">
                    Select Roles to Display
                  </label>

                  <div className="d-flex gap-4 flex-wrap">
                    {ROLE_OPTIONS.map((r) => (
                      <div className="form-check" key={r.id}>
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={form.roleIds.includes(r.id)}
                          onChange={() => toggleRole(r.id)}
                        />
                        <label className="form-check-label">
                          {r.label}
                        </label>
                      </div>
                    ))}
                  </div>

                  <ErrorText field="roleIds" />
                </div>

                <div className="col-md-6">
                  <label>
                    Recruiter <span className="text-danger">*</span>
                  </label>

                  <ServerSearchSelect
                      placeholder="Search Recruiter"
                      value={form.recruiter}
                      onChange={(value: RecruiterOption) =>
                        setForm((prev) => ({ ...prev, recruiter: value }))
                      }
                      isMulti={false}
                      fetchOptions={(input: string, config: any) =>
                        recruiterSearchService(input, config)
                      }
                      getOptionLabel={(item: any) => {
                      if (item?.user_fullName) {
                        return `${item.user_fullName} (${item.user_mobile})`;
                      }
                      return item?.user_mobile || item?.name || '';
                    }}

                      getOptionValue={(item: any) => item.user_id}
                    />

                  
                  <ErrorText field="recruiter" />
                </div>

                <div className="col-md-12">
                    <label>Banner Image *</label>

                    <input
                      type="file"
                      className="form-control"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0] ?? null;
                        setImage(file);

                        if (file) {
                          const previewUrl = URL.createObjectURL(file);
                          setImagePreview(previewUrl);
                        }
                      }}
                    />

                    <ErrorText field="image" />

                    {/* ✅ IMAGE PREVIEW */}
                  {imagePreview && (
                    <div className="mt-3">
                      <div className="fw-semibold mb-2">Banner Preview</div>

                      <div
                        style={{
                          width: "100%",
                          maxWidth: 600,
                          height: 150,
                          borderRadius: 8,
                          overflow: "hidden",
                          border: "1px solid #ddd",
                          background: "#f8f9fa",
                        }}
                      >
                        <img
                          src={imagePreview}
                          alt="Banner Preview"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover", // 🔥 KEY
                          }}
                        />
                      </div>
                    </div>
                  )}

                  </div>


              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button
                className="btn btn-success"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save"}
              </button>
            </div>

          </div>
        </div>
      </div>

      <div className="modal-backdrop fade show" />
    </>
  );
}
