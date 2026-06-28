"use client";

import { useResumeStore } from "@/store/resume-store";
import type { ResumeData } from "@/db/schema";
import { MonthInput } from "./month-input";

export function CertificationsForm() {
  const { data, setData } = useResumeStore();
  const { certifications } = data;

  const addCertification = () => {
    const newCert: ResumeData["certifications"][0] = {
      id: crypto.randomUUID(),
      name: "",
      issuer: "",
      date: "",
    };
    setData({ ...data, certifications: [...certifications, newCert] });
  };

  const removeCertification = (id: string) => {
    setData({
      ...data,
      certifications: certifications.filter((c) => c.id !== id),
    });
  };

  const updateCertification = (
    id: string,
    updates: Partial<ResumeData["certifications"][0]>,
  ) => {
    setData({
      ...data,
      certifications: certifications.map((c) =>
        c.id === id ? { ...c, ...updates } : c,
      ),
    });
  };

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <span className="label-mono block mb-4">
          SECTION_06 // CERTIFICATIONS
        </span>
        <h2 className="text-3xl font-black tracking-tight mb-2">
          Certifications
        </h2>
        <p className="text-sm text-gray-600">
          Professional certifications, licenses, and credentials
        </p>
      </div>

      <div className="space-y-8">
        {certifications.map((cert, index) => (
          <div key={cert.id} className="border border-black p-6">
            <div className="flex items-center justify-between mb-6">
              <span className="label-mono">
                CERT_{String(index + 1).padStart(2, "0")}
              </span>
              <button
                onClick={() => removeCertification(cert.id)}
                className="border border-red-600 text-red-600 px-3 py-1 text-xs font-bold uppercase tracking-wider hover:bg-red-600 hover:text-white transition-colors duration-150"
              >
                Remove
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="label-mono block mb-2">CERT_NAME *</label>
                <input
                  type="text"
                  value={cert.name}
                  onChange={(e) =>
                    updateCertification(cert.id, { name: e.target.value })
                  }
                  placeholder="AWS Solutions Architect Professional"
                  className="w-full border border-gray-400 bg-transparent px-3 py-2 focus:border-black transition-all duration-150"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label-mono block mb-2">ISSUER *</label>
                  <input
                    type="text"
                    value={cert.issuer}
                    onChange={(e) =>
                      updateCertification(cert.id, { issuer: e.target.value })
                    }
                    placeholder="Amazon Web Services"
                    className="w-full border border-gray-400 bg-transparent px-3 py-2 focus:border-black transition-all duration-150"
                  />
                </div>
                <div>
                  <label className="label-mono block mb-2">DATE</label>
                  <MonthInput
                    key={`cert-date-${cert.id}-${cert.date || "empty"}`}
                    value={cert.date}
                    onChange={(value) =>
                      updateCertification(cert.id, { date: value })
                    }
                    title="Certification date"
                    className="w-full border border-gray-400 bg-transparent px-3 py-2 focus:border-black transition-all duration-150"
                  />
                </div>
              </div>

              <div>
                <label className="label-mono block mb-2">CREDENTIAL_URL</label>
                <input
                  type="url"
                  value={cert.url || ""}
                  onChange={(e) =>
                    updateCertification(cert.id, { url: e.target.value })
                  }
                  placeholder="https://www.credly.com/badges/..."
                  className="w-full border border-gray-400 bg-transparent px-3 py-2 focus:border-black transition-all duration-150"
                />
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={addCertification}
          className="w-full border-2 border-dashed border-gray-400 px-6 py-4 text-sm font-bold uppercase tracking-wider hover:border-black hover:bg-black hover:text-white transition-all duration-150"
        >
          + Add Certification
        </button>
      </div>
    </div>
  );
}
