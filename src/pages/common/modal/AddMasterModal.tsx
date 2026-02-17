"use client";

import { useEffect, useState } from "react";
import { MasterConfigType } from "@/constants/masterConfig";
import { showAlert } from "@/utils/swalFire";
import { useUser } from "@/hooks/useSession";
import axiosInstance from "@/services";
import MultiSelectWithServerSearch from "@/components/Common/MultiSelectWithServerSearch";
import { masterCategoryService } from "@/services/SuperAdminMasterData";
import { masterCategorySearchService } from "@/services/SuperAdminService";

/* ---------------- TYPES ---------------- */

type Props = {
  show: boolean;
  master: MasterConfigType | null;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: Record<string, any> | null;
};

/* ---------------- COMPONENT ---------------- */

export default function AddMasterModal({
  show,
  master,
  onClose,
  onSuccess,
  initialData = null,
}: Props) {
  /* ---------------- HOOKS (ALWAYS FIRST) ---------------- */
  const { user_id } = useUser();

  const [form, setForm] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);

  const [stateOptions, setStateOptions] = useState<
    { label: string; value: number }[]
  >([]);

  const [cityOptions, setCityOptions] = useState<
    { label: string; value: number }[]
  >([]);

  const [roleOptions, setRoleOptions] = useState<
    { label: string; value: number }[]
    >([]);
  
  const [categoryReady, setCategoryReady] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});


  /* ---------------- INIT FORM ---------------- */
useEffect(() => {
  if (!show || !master) return;

  const init: Record<string, any> = {};

  master.formFields.forEach((field) => {
    if (field.name === "roleIds" || field.name === "categoryIds") {
      init[field.name] = []; // 👈 always empty initially
    } else {
      init[field.name] =
        initialData?.[field.name] ??
        (field.type === "file" ? null : "");
    }
  });

  setForm(init);
}, [show, master, initialData]);


  /* ---------------- LOAD STATES ---------------- */
  useEffect(() => {
    if (!show || !master) return;

    const needsState = master.formFields.some(
      (f) => f.dependsOn === "state"
    );

    if (!needsState) return;

    const fetchStates = async () => {
      try {
        const res = await axiosInstance.get("/api/master-state?limit=100");
        if (res.data?.success) {
          setStateOptions(
            res.data.data.items.map((s: any) => ({
              label: s.name,
              value: s.id,
            }))
          );
        }
      } catch {
        showAlert("error", "Failed to load states", "Error");
      }
    };

    fetchStates();
  }, [show, master]);

  /* ---------------- LOAD CITIES ---------------- */
  useEffect(() => {
    if (!show || !master) return;

    const needsCity = master.formFields.some(
      (f) => f.dependsOn === "city"
    );

    if (!needsCity) return;

    const fetchCities = async () => {
      try {
        const res = await axiosInstance.get("/api/master-city?limit=1000");
        if (res.data?.success) {
          setCityOptions(
            res.data.data.items.map((c: any) => ({
              label: c.name,
              value: c.id,
            }))
          );
        }
      } catch {
        showAlert("error", "Failed to load cities", "Error");
      }
    };

    fetchCities();
  }, [show, master]);

  useEffect(() => {
  if (!show || !master) return;

  const needsRole = master.formFields.some(
    (f) => f.dependsOn === "role"
  );

  if (!needsRole) return;

  const fetchRoles = async () => {
  try {
    const res = await axiosInstance.get("/api/master-roles");

    if (res.data?.success) {
      setRoleOptions(
        res.data.data.items
          .filter((r: any) => [5, 6].includes(r.id)) // ✅ FILTER
          .map((role: any) => ({
            label: role.roleName,
            value: role.id,
          }))
      );
    }
  } catch {
    showAlert("error", "Failed to load roles", "Error");
  }
};


  fetchRoles();
}, [show, master]);
useEffect(() => {
  if (!show || !master) return;

  if (
    master.key === "skills" ||
    master.key === "jobBenefits" ||
    master.key === "jobTitle"
  ) {
    setCategoryReady(true); // ✅ allow category select on ADD
  }
}, [show, master]);


useEffect(() => {
  if (!show || !master || !initialData) return;

  if (
    (master.key === "skills" || master.key === "jobBenefits" || master.key === "jobTitle") &&
    initialData.categoryIds?.length
  ) {
    (async () => {
      const res = await axiosInstance.get("/api/master-category?limit=1000");
      const allCategories = res.data.data.items;

      const incomingIds = initialData.categoryIds.map((c: any) =>
        typeof c === "object" ? c.value ?? c.id : c
      );

      const mapped = allCategories
        .filter((c: any) => incomingIds.includes(c.id))
        .map((c: any) => ({
          label: c.name,
          value: c.id,
        }));

      setForm((prev) => ({
        ...prev,
        categoryIds: mapped,
      }));

      setCategoryReady(true);
    })();
  } else {
    setCategoryReady(true);
  }
}, [show, master, initialData]);

useEffect(() => {
  if (!show || !master || !initialData) return;

  if (master.key === "document_type" && initialData.roleIds?.length) {
    (async () => {
      const res = await axiosInstance.get("/api/master-roles");
      const allRoles = res.data.data.items;

      const incomingIds = initialData.roleIds.map((r: any) =>
        typeof r === "object" ? r.value ?? r.id : r
      );

      const mapped = allRoles
        .filter((r: any) => incomingIds.includes(r.id))
        .map((r: any) => r.id); // 👈 CHECKBOX expects IDs only

      setForm((prev) => ({
        ...prev,
        roleIds: mapped,
      }));
    })();
  }
}, [show, master, initialData]);



  /* ---------------- EARLY UI EXIT (SAFE) ---------------- */
  if (!show || !master) return null;

  /* ---------------- CHANGE HANDLER ---------------- */
  const handleChange = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));

    // ✅ Clear error when user changes value
    setErrors((prev) => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
  };
  const extractIds = (arr: any[]) =>
  Array.isArray(arr) ? arr.map(i => i.value ?? i.id) : [];


  /* ---------------- SAVE ---------------- */
 const handleSave = async () => {
  try {
    if (!user_id) {
      showAlert("error", "User session not found", "Error");
      return;
    }
    // ✅ REQUIRED FIELD VALIDATION
    // ✅ FIELD VALIDATION
    const newErrors: Record<string, string> = {};

    for (const field of master.formFields) {
      if (field.required) {
        const value = form[field.name];

        const isEmpty =
          value === null ||
          value === undefined ||
          value === "" ||
          (Array.isArray(value) && value.length === 0);

        if (isEmpty) {
          newErrors[field.name] = `${field.label} is required`;
        }
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }



    setSaving(true);

    // ✅ NORMALIZE MULTI SELECT VALUES
    const normalizedForm = {
      ...form,
      categoryIds: extractIds(form.categoryIds),
      roleIds: extractIds(form.roleIds),
    };

    const basePayload = {
      ...normalizedForm,
      updatedBy: user_id,
      ...(initialData ? {} : { createdBy: user_id }),
    };

    const hasFile = master.formFields.some(
      (f) => f.type === "file"
    );

    let payload: any = basePayload;

    if (hasFile) {
      const fd = new FormData();
      Object.entries(basePayload).forEach(([k, v]) => {
        if (v === null || v === undefined) return;
        if (Array.isArray(v)) {
          v.forEach(val => fd.append(`${k}[]`, String(val)));
        } else if (v instanceof File) {
          fd.append(k, v);
        } else {
          fd.append(k, String(v));
        }
      });
      payload = fd;
    }

    const res = initialData
      ? await master.updateService(initialData.id, payload)
      : await master.addService(payload);

    if (res?.code<400) {
      showAlert(
        "success",
        `${master.label} ${initialData ? "updated" : "added"} successfully`,
        "Success"
      );
      onSuccess();
      onClose();
    }else{
      showAlert("error", res?.message, "Error");
    }
  } catch {
    showAlert("error", "Failed to save record", "Error");
  } finally {
    setSaving(false);
  }
};


  /* ---------------- UI ---------------- */
  return (
    <div className="modal fade show d-block" style={{ background: "rgba(0,0,0,.55)" }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content rounded-3">

          <div className="modal-header px-4 py-3">
            <h5 className="modal-title fw-semibold">
              {initialData ? "Edit" : "Add"} {master.label}
            </h5>
            <button className="btn-close" onClick={onClose} />
          </div>

          <div className="modal-body px-4 py-4">
            <div className="row g-4">
              {master.formFields.map((field) => {
                const isWide = field.type === "textarea" || field.type === "file";

                return (
                  <div key={field.name} className="col-12">
                    <label className="form-label fw-medium">
                      {field.label}
                      {field.required && <span className="text-danger ms-1">*</span>}
                    </label>

                    {field.type === "text" && (
                      <input
                        className={`form-control ${errors[field.name] ? "" : ""}`}
                        value={form[field.name] ?? ""}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                      />
                    )}

                    {field.type === "textarea" && (
                      <textarea
                        rows={4}
                        className={`form-control ${errors[field.name] ? "" : ""}`}
                        value={form[field.name] ?? ""}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                      />
                    )}

                    {field.type === "number" && (
                      <input
                        type="number"
                        className={`form-control ${errors[field.name] ? "" : ""}`}
                        value={form[field.name] ?? ""}
                        min={0}
                        step="1"

                        /* 🚫 Block minus, e, E */
                        onKeyDown={(e) => {
                          if (["-", "e", "E"].includes(e.key)) {
                            e.preventDefault();
                          }
                        }}

                        /* 🚫 Prevent mouse wheel changes */
                        onWheel={(e) => (e.target as HTMLInputElement).blur()}

                        /* 🚫 Sanitize typed / pasted values */
                        onChange={(e) => {
                          const val = e.target.value;

                          if (val === "") {
                            handleChange(field.name, "");
                            return;
                          }

                          const num = Number(val);
                          if (isNaN(num) || num < 0) return;

                          handleChange(field.name, num);
                        }}
                      />
                    )}

                    {/* ✅ ROLE CHECKBOXES (MULTI) */}
                      {field.name === "roleIds" && field.dependsOn === "role" && (
                        <div className="border rounded p-3">
                          {roleOptions.map((role) => (
                            <div key={role.value} className="form-check mb-2">
                              <input
                                type="checkbox"
                                className="form-check-input"
                                id={`role-${role.value}`}
                                checked={(form.roleIds ?? []).includes(role.value)}
                                onChange={(e) => {
                                  const checked = e.target.checked;

                                  setForm((prev) => {
                                    const current = prev.roleIds ?? [];

                                    return {
                                      ...prev,
                                      roleIds: checked
                                        ? [...current, role.value]
                                        : current.filter((id: number) => id !== role.value),
                                    };
                                  });
                                }}
                              />
                              <label
                                className="form-check-label"
                                htmlFor={`role-${role.value}`}
                              >
                                {role.label}
                              </label>
                            </div>
                          ))}
                        </div>
                      )}

                    {/* ✅ CATEGORY CHECKBOXES (MULTI) */}
                    {field.name === "categoryIds" &&
                    field.dependsOn === "category" &&
                    categoryReady && (
                      <MultiSelectWithServerSearch
                        id="categories"
                        placeholder="Search Categories"
                        value={form.categoryIds}
                        onChange={(val) => handleChange("categoryIds", val)}
                        fetchOptions={(input, config) =>
                          masterCategorySearchService(input, config)
                        }
                        isMulti
                        isCreatable={false}
                        getOptionLabel={(item) => item.label ?? item.name}
                        getOptionValue={(item) => String(item.value ?? item.id)}
                      />
                    )}


                    {field.type === "select" &&
                      field.name !== "roleIds" && field.name !== "categoryIds" && (
                        <select
                          className={`form-select ${errors[field.name] ? "" : ""}`}
                          value={form[field.name] ?? ""}
                          onChange={(e) =>
                            handleChange(field.name, e.target.value)
                          }
                        >
                          <option value="">Select</option>

                          {field.dependsOn === "state" &&
                            stateOptions.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}

                          {field.dependsOn === "city" &&
                            cityOptions.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                        </select>
                    )}


                    {field.type === "radio" && (
                      <div className="d-flex gap-4 mt-2">
                        {field.options?.map((option) => (
                          <div key={option.value} className="form-check">
                            <input
                              type="radio"
                              className="form-check-input"
                              id={`${field.name}-${option.value}`}
                              name={field.name}
                              value={option.value}
                              checked={form[field.name] === option.value}
                              onChange={(e) =>
                                handleChange(field.name, Number(e.target.value))
                              }
                            />
                            <label
                              className="form-check-label"
                              htmlFor={`${field.name}-${option.value}`}
                            >
                              {option.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                    



                    {field.type === "file" && (
                      <input
                        type="file"
                        className={`form-control ${errors[field.name] ? "" : ""}`}
                        onChange={(e) =>
                          handleChange(field.name, e.target.files?.[0] || null)
                        }
                      />
                    )}

                    {errors[field.name] && (
                    <div className="text-danger mt-1">
                      {errors[field.name]}
                    </div>
                  )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="modal-footer px-4 py-3">
            <button className="btn btn-outline-secondary" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-primary px-4" disabled={saving} onClick={handleSave}>
              {saving ? "Saving..." : "Save"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
