"use client";

import React, { useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { useUser } from "@/hooks/useSession";
import Loader from "../loader/Loader";
import {
  masterDocumentsServiceByRoleId,
  recruiterCompanyDocumentsService,
  recruiterCompanyProfileUpdate,
} from "@/services/RecruiterService";
import { showAlert } from "@/utils/swalFire"; 
import LoaderInner from "../loader/LoaderInner";
interface Props {
  show: boolean;
  onHide: () => void;
  onSuccess?: () => void;
}

const RecruiterDocumentUploadModal: React.FC<Props> = ({
  show,
  onHide,
  onSuccess,
}) => {
  const user = useUser();

  const [loading, setLoading] = useState(false);
  const [masterDocuments, setMasterDocuments] = useState<any[]>([]);
  const [uploaded, setUploaded] = useState<any[]>([]);
  const [files, setFiles] = useState<Record<number, File | null>>({});

  /* ================= LOAD DATA ================= */

  useEffect(() => {
    if (show) {
      loadMasterDocs();
    }
  }, [show]);

  useEffect(() => {
    if (user?.user_id && show) {
      loadUploadedDocs();
    }
  }, [user?.user_id, show]);

  const loadMasterDocs = async () => {
    const res = await masterDocumentsServiceByRoleId(6);
    setMasterDocuments(res?.data?.items || []);
  };

  const loadUploadedDocs = async () => {
    const res = await recruiterCompanyDocumentsService(user?.user_id);
    setUploaded(res?.data?.items || []);
  };

  /* ================= HELPERS ================= */
 const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = [
    "application/pdf", 
    "image/png",
    "image/jpeg",
  ];

  const handleFileChange = (docId: number, file: File | null) => {
    if (!file) {
      setFiles((prev) => ({ ...prev, [docId]: null }));
      return;
    }

    // ✅ Type check
    if (!ALLOWED_TYPES.includes(file.type)) {
      showAlert("error", `Invalid file type: ${file.name}`);
      return;
    }

    // ✅ Size check
    if (file.size > MAX_FILE_SIZE) {
      showAlert("error", `File too large: ${file.name}. Max 5MB allowed`);
      return;
    }

    // ✅ Valid file
    setFiles((prev) => ({ ...prev, [docId]: file }));
  };

  const getUploadedDoc = (docId: number) => {
    return uploaded.find((item: any) => item.document_id === docId);
  };

  /* ================= SUBMIT ================= */

  const onSubmit = async () => {
    setLoading(true);

    try {
      const documents = Object.entries(files)
        .map(([docId, file]) => {
          if (!file) return null;
          return {
            documentId: Number(docId),
            document: file,
          };
        })
        .filter(Boolean);

      // 🔥 agar kuch upload hi nahi kiya to call skip
      if (documents.length === 0) {
        onHide();
        return;
      }

      const payload = {
        userId: user?.user_id,
        documents,
      };

      await recruiterCompanyProfileUpdate(payload);
      await loadUploadedDocs();

      onSuccess?.();
      onHide();
    } catch (err) {
      console.error("DOCUMENT UPLOAD ERROR", err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */

  return (
    <Modal show={show} onHide={onHide} size="lg" backdrop="static" centered>
      <Modal.Header closeButton>
        <Modal.Title>Upload Required Documents</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {loading && <LoaderInner />}

        <div className="row">
          {masterDocuments.map((doc) => {
            const uploadedDoc = getUploadedDoc(doc.id);

            return (
              <div className="col-md-6 mb-3" key={doc.id}>
                <label className="form-label">{doc.name}</label>

                <input
                  type="file"
                  className="form-control"
                  onChange={(e) =>
                    handleFileChange(
                      doc.id,
                      e.target.files?.[0] || null
                    )
                  }
                />

                {uploadedDoc && (
                  <a
                    href={uploadedDoc.document}
                    target="_blank"
                    rel="noopener noreferrer"
                     className="viewbtn"
                  >
                    View
                  </a>
                )}
              </div>
            );
          })}
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>

        <Button
          variant="primary"
          onClick={onSubmit}
          disabled={loading}
        >
          {loading ? "Uploading..." : "Save"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default RecruiterDocumentUploadModal;
