"use client";

import React, { useState } from "react";
import { resetUserPassword } from "@/services/SuperAdminService";
import { showAlert } from "@/utils/swalFire";
import { useUser } from "@/hooks/useSession";

interface Props {
  userId: number;
  onClose: () => void;
}

export default function ResetPasswordModal({ userId, onClose }: Props) {
      const { user_id } = useUser();
      
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!password || !confirmPassword) {
      showAlert("error", "Both fields are required");
      return false;
    }

    if (password.length < 8) {
      showAlert("error", "Password must be at least 8 characters");
      return false;
    }

    if (password !== confirmPassword) {
      showAlert("error", "Passwords do not match");
      return false;
    }

    return true;
  };

  const handleReset = async () => {
    if (!validate()) return;

    try {
      setLoading(true);

      const updatedBy = user_id;

      const res = await resetUserPassword({
        userId,
        password,
        updatedBy,
      });

      if (res?.success) {
        showAlert("success", res.message || "Password reset successfully");
        onClose();
      } else {
        showAlert("error", res.message || "Failed to reset password");
      }
    } catch (err: any) {
      showAlert(
        "error",
        err?.response?.data?.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="modal fade show d-block">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">

            <div className="modal-header">
              <h5 className="modal-title">Reset Password</h5>
              <button className="btn-close" onClick={onClose} />
            </div>

            <div className="modal-body">
              <div className="mb-3">
                <label>New Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label>Confirm Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button
                className="btn btn-success"
                onClick={handleReset}
                disabled={loading}
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </div>

          </div>
        </div>
      </div>

      <div className="modal-backdrop fade show" />
    </>
  );
}
