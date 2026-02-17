"use client";

import React, { useState, useEffect } from "react";
import { showAlert } from "@/utils/swalFire";
import {
  userBasicProfileUpdate,
  userProfilePicContactUpdate,
  userProfileAditionalUpdate,
  updateUerInfo,
  createUser,
} from "@/services/SuperAdminService";
import { useUser } from "@/hooks/useSession";

/* ---------------- CONSTANTS ---------------- */

const EDUCATION_OPTIONS = [
  "Any",
  "highschool",
  "intermediate",
  "diploma",
  "graduate",
  "postgraduate",
];

type CityOption = {
  label: string;
  value: number;
};

type Role = {
  id: number;
  roleName: string;
};

const HIDDEN_ROLE_IDS = [5, 6];

const getRoleIdFromName = (name?: string, roles: Role[] = []) => {
  const role = roles.find((r) => r.roleName === name);
  return role?.id || null;
};

/* ---------------- COMPONENT ---------------- */

interface UserFormModalProps {
  user: any;
  cityOptions: CityOption[];
  roles: Role[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function AdminFormModal({
  user,
  cityOptions,
  roles,
  onClose,
  onSuccess,
}: UserFormModalProps) {
  const { user_id } = useUser();
  const userId = user?.user_id;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const visibleRoles = Array.isArray(roles)
    ? roles.filter((r) => !HIDDEN_ROLE_IDS.includes(r.id))
    : [];

  /* ---------------- FORM STATE ---------------- */

  const [form, setForm] = useState<any>({
    fullName: user?.user_fullName || "",
    roleId: user?.RoleId || null,   // start null
    gender: user?.user_gender || "Male",

    email: user?.user_email || "",
    mobile: user?.user_mobile || "",

    cityId: null as number | null,
    cityName: user?.user_city || "",
    salary: user?.user_salary || "",
  });

  /* ---------------- ROLE SYNC FIX ---------------- */

  useEffect(() => {
    if (!user || !roles.length) return;

    const roleId =
      user.RoleId || getRoleIdFromName(user.roleName, roles);

    if (roleId) {
      setForm((prev: any) => ({
        ...prev,
        roleId,
      }));
    }
  }, [roles, user]);

  /* ---------------- CITY PREFILL ---------------- */

  useEffect(() => {
    if (!user || form.cityId !== null) return;

    if (user?.user_city && cityOptions.length) {
      const matchedCity = cityOptions.find(
        (c) => c.label === user.user_city
      );

      if (matchedCity) {
        setForm((prev: any) => ({
          ...prev,
          cityId: matchedCity.value,
          cityName: matchedCity.label,
        }));
      }
    }
  }, [cityOptions, user]);

  /* ---------------- VALIDATION ---------------- */

  const validateForm = () => {
    const newErrors: any = {};

    if (!form.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!form.roleId) newErrors.roleId = "Role is required";
    if (!form.gender) newErrors.gender = "Gender is required";

    if (!form.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Invalid email address";
    }

    if (!form.mobile) {
      newErrors.mobile = "Mobile number is required";
    } else if (!/^[0-9]{10}$/.test(form.mobile)) {
      newErrors.mobile = "Mobile must be 10 digits";
    }

    if (!form.cityName) newErrors.city = "City is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [errors, setErrors] = useState<any>({});

  const handleChange = (field: string, value: any) => {
    setForm({ ...form, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = async () => {
    if (!validateForm()) return;

    // extra safety
    if (typeof form.roleId !== "number") {
      showAlert("error", "Please select a valid role");
      return;
    }

    setIsSubmitting(true);

    /* ---------- ADD USER ---------- */
    if (!userId) {
      try {
        const res = await createUser({
          fullName: form.fullName,
          email: form.email,
          mobile: form.mobile,
          RoleId: form.roleId,
          gender: form.gender,
          age: form.age,
          city: form.cityName,
          salary: form.salary,
          createdBy: user_id,
        });

        if (res?.success) {
          showAlert("success", "Admin User created successfully");
          onSuccess();
        } else {
          showAlert("error", res.message || "Failed to create user");
        }
      } catch (err: any) {
        showAlert("error", err?.response?.data?.message || "Error");
      }
      setIsSubmitting(false);
      return;
    }

    /* ---------- UPDATE USER ---------- */
     await updateUerInfo({
          userId,
          fullName: form.fullName,
          email: form.email,
          mobile: form.mobile,
          RoleId: form.roleId,
          gender: form.gender,
          age: form.age,
          city: form.cityName,
          salary: form.salary,
          updatedBy:user_id,
        });
 

    onSuccess();
  };

  /* ---------------- UI ---------------- */

  const ErrorText = ({ field }: any) =>
    errors[field] ? (
      <small className="text-danger">{errors[field]}</small>
    ) : null;

  return (
    <>
      <div className="modal fade show d-block">
        <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content">

            <div className="modal-header">
              <h5>{user ? "Edit Admin User" : "Add Admin User"}</h5>
              <button className="btn-close" onClick={onClose} />
            </div>

            <div className="modal-body">

              {/* BASIC */}
              <h6 className="fw-semibold">Basic Information</h6>
              <div className="row g-3">

                <div className="col-md-6">
                  <label>Full Name</label>
                  <input
                    className="form-control"
                    value={form.fullName}
                    onChange={(e) =>
                      handleChange("fullName", e.target.value)
                    }
                  />
                  <ErrorText field="fullName" />
                </div>

                <div className="col-md-6">
                  <label>Role</label>
                  <select
                    className="form-select"
                    value={form.roleId ?? ""}
                    onChange={(e) =>
                      handleChange("roleId", Number(e.target.value))
                    }
                  >
                    <option value="">Select Role</option>
                    {visibleRoles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {formatRole(r.roleName)}
                      </option>
                    ))}
                  </select>
                  <ErrorText field="roleId" />
                </div>

                <div className="col-md-6">
                  <label>Gender</label>
                  <select
                    className="form-select"
                    value={form.gender}
                    onChange={(e) =>
                      handleChange("gender", e.target.value)
                    }
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label>City</label>
                  <select
                    className="form-select"
                    value={form.cityId ?? ""}
                    onChange={(e) => {
                      const id = Number(e.target.value);
                      const city = cityOptions.find((c) => c.value === id);

                      setForm((prev: any) => ({
                        ...prev,
                        cityId: id,
                        cityName: city?.label || "",
                      }));
                    }}
                  >
                    <option value="">Select City</option>
                    {cityOptions.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                  <ErrorText field="city" />
                </div>

              </div>

              {/* CONTACT */}
              <h6 className="fw-semibold mt-4">Contact Details</h6>
              <div className="row g-3">
                <div className="col-md-6">
                  <label>Email</label>
                  <input
                    className="form-control"
                    value={form.email}
                    onChange={(e) =>
                      handleChange("email", e.target.value)
                    }
                  />
                  <ErrorText field="email" />
                </div>

                <div className="col-md-6">
                  <label>Mobile</label>
                  <input
                    className="form-control"
                    value={form.mobile}
                    onChange={(e) =>
                      handleChange("mobile", e.target.value)
                    }
                  />
                  <ErrorText field="mobile" />
                </div>

                <div className="col-md-6">
                  <label>Salary</label>
                  <input
                    className="form-control"
                    value={form.salary}
                    onChange={(e) =>
                      handleChange("salary", e.target.value)
                    }
                  />
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
                {isSubmitting
                  ? "Processing..."
                  : user
                  ? "Update Admin User"
                  : "Create Admin User"}
              </button>
            </div>

          </div>
        </div>
      </div>

      <div className="modal-backdrop fade show" />
    </>
  );
}

function formatRole(role?: string): string {
  if (!role) return "-";

  return role
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
