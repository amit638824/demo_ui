"use client";

import React, { useState, useEffect } from "react";
import axiosInstance from "@/services";
import { showAlert } from "@/utils/swalFire";
import {
  updateUerInfo,
  userProfilePicContactUpdate,
  userProfileAditionalUpdate,
  userLocationUpdate,
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

const ROLE_OPTIONS = [
  { id: 6, label: "Recruiter" },
  { id: 5, label: "Job Seeker" },
];

const getRoleIdFromRoleName = (roleName?: string) => {
  if (!roleName) return "";
  if (roleName === "RECRUITER") return 6;
  if (roleName === "JOB_SEEKER") return 5;
  return "";
};

type CityOption = {
  label: string;
  value: number;
};

/* ---------------- COMPONENT ---------------- */

interface UserFormModalProps {
  user: any;
  cityOptions: CityOption[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function UserFormModal({user,cityOptions,onClose,onSuccess,}: UserFormModalProps) {
  const { user_id } = useUser();
  const userId = user?.user_id;
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ---------------- FORM STATE ---------------- */

const [form, setForm] = useState<any>({
  fullName: "",
  roleId: "",
  age: "",
  gender: "Male",

  email: "",
  mobile: "",
  alternateMobile: "",

  cityId: null,
  cityName: "",
  locality: "",

  salary: "",
  education: "highschool",
  experinced: 0,

  companyName: "",
  companyAddress: "",
  differentInterviewAddress: 0,
});


  /* ---------------- FILE STATE ---------------- */

  const [files, setFiles] = useState<any>({
    profilePic: null,
    resume: null,
    companyLogo: null,
  });

  /* ---------------- ERROR STATE ---------------- */

  const [errors, setErrors] = useState<any>({});

  /* ---------------- FETCH CITIES ---------------- */

 
useEffect(() => {
  if (!user) return;

  setForm({
    fullName: user.user_fullName || "",
    roleId: user.user_RoleId || getRoleIdFromRoleName(user.roletbl_rolename),
    age: user.user_age || "",
    gender: user.user_gender || "Male",

    email: user.user_email || "",
    mobile: user.user_mobile || "",
    alternateMobile: user.user_alternateMobile || "",

    cityId: null,
    cityName: user.user_city || "",
    locality: user.user_locality || "",

    salary: user.user_salary || "",
    education: user.user_education || "highschool",
    experinced: user.user_experinced || 0,

    companyName: user.user_companyName || "",
    companyAddress: user.user_companyAddress || "",
    differentInterviewAddress: user.user_differentInterviewAddress || 0,
  });
}, [user]);
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

    if (
      form.alternateMobile &&
      !/^[0-9]{10}$/.test(form.alternateMobile)
    ) {
      newErrors.alternateMobile = "Alternate mobile must be 10 digits";
    }

    if (form.age && Number(form.age) <= 0) {
      newErrors.age = "Age must be a positive number";
    }

    if (!form.cityName) newErrors.city = "City is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: string, value: any) => {
    setForm({ ...form, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = async () => {
    if (!validateForm()) {
      //showAlert("error", "Please fix validation errors", "Validation Error");
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
            alternateMobile:form.alternateMobile,
            education:form.education,
            companyName: form.companyName,
            companyAddress: form.companyAddress,
            });

            // ✅ SUCCESS CASE
            if (res?.success) {
            showAlert("success", res.message || "User created successfully");
            onSuccess(); // close modal + refresh list
            } 
            // ❌ FAILURE CASE (409, 400, etc.)
            else {
            showAlert("error", res.message || "Failed to create user", "Error");
            // ❗ do NOT close modal
            // ❗ do NOT reset form
            }
        } catch (err: any) {
            setIsSubmitting(false);
            // network / unexpected error
            showAlert(
            "error",
            err?.response?.data?.message || "Something went wrong",
            "Error"
            );
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
      alternateMobile:form.alternateMobile,
      education:form.education,
      companyName: form.companyName,
      companyAddress: form.companyAddress,
      updatedBy:user_id,
    });

    const contactForm = new FormData();
    /*contactForm.append("userId", userId);
    contactForm.append("fullName", form.fullName);
    contactForm.append("mobile", form.mobile);
    contactForm.append("locality", form.locality);
    contactForm.append("updatedBy",user_id);

    if (files.profilePic) contactForm.append("profilePic", files.profilePic);
    if (files.resume) contactForm.append("resume", files.resume);
    if (files.companyLogo)
      contactForm.append("companyLogo", files.companyLogo);

    await userProfilePicContactUpdate(contactForm);

    await userProfileAditionalUpdate({
      userId,
      salary: form.salary,
      email: form.email,
      alternateMobile: form.alternateMobile,
      gender: form.gender,
      age: form.age,
      education: form.education,
      updatedBy:user_id
    });

    await userLocationUpdate({
      userId,
      city: form.cityName,
      locality: form.locality,
      updatedBy:user_id
    });*/

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
              <h5>{user ? "Edit User" : "Add User"}</h5>
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
                    value={form.roleId}
                    onChange={(e) =>
                      handleChange("roleId", Number(e.target.value))
                    }
                  >
                    <option value="">Select Role</option>
                    {ROLE_OPTIONS.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                  <ErrorText field="roleId" />
                </div>

                <div className="col-md-4">
                  <label>Age</label>
                  <input
                    type="number"
                    className="form-control"
                    value={form.age}
                    onChange={(e) =>
                      handleChange("age", e.target.value)
                    }
                  />
                  <ErrorText field="age" />
                </div>

                <div className="col-md-4">
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

                <div className="col-md-4">
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
                  <label>Alternate Mobile</label>
                  <input
                    className="form-control"
                    value={form.alternateMobile}
                    onChange={(e) =>
                      handleChange("alternateMobile", e.target.value)
                    }
                  />
                  <ErrorText field="alternateMobile" />
                </div>
              </div>

              {/* PROFESSIONAL */}
              <h6 className="fw-semibold mt-4">Professional Details</h6>
              <div className="row g-3">
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

                <div className="col-md-6">
                  <label>Education</label>
                  <select
                    className="form-select"
                    value={form.education}
                    onChange={(e) =>
                      handleChange("education", e.target.value)
                    }
                  >
                    {EDUCATION_OPTIONS.map((e) => (
                      <option key={e}>{e}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* COMPANY DETAILS */}
                <h6 className="fw-semibold mt-4">Company Details</h6>
                <div className="row g-3">

                <div className="col-md-6">
                    <label>Company Name</label>
                    <input
                    className="form-control"
                    value={form.companyName}
                    onChange={(e) =>
                        handleChange("companyName", e.target.value)
                    }
                    />
                </div>

                <div className="col-md-6">
                    <label>Company Address</label>
                    <input
                    className="form-control"
                    value={form.companyAddress}
                    onChange={(e) =>
                        handleChange("companyAddress", e.target.value)
                    }
                    />
                </div>

                {/*<div className="col-md-6">
                    <label>Different Interview Address?</label>
                    <select
                    className="form-select"
                    value={form.differentInterviewAddress}
                    onChange={(e) =>
                        handleChange(
                        "differentInterviewAddress",
                        Number(e.target.value)
                        )
                    }
                    >
                    <option value={0}>No</option>
                    <option value={1}>Yes</option>
                    </select>
                </div>

                <div className="col-md-6">
                    <label>Company Logo</label>
                    <input
                    type="file"
                    className="form-control"
                    onChange={(e) =>
                        setFiles({
                        ...files,
                        companyLogo: e.target.files?.[0],
                        })
                    }
                    />
                </div>*/}

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
                {isSubmitting ? (
                    <>
                    Processing...
                    </>
                ) : (
                    user ? "Update User" : "Create User"
                )}
                </button>

            </div>

          </div>
        </div>
      </div>

      <div className="modal-backdrop fade show" />
    </>
  );
}
