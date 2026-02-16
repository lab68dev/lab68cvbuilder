"use client";

import { useResumeStore } from "@/store/resume-store";

export function PersonalInfoForm() {
  const { data, setData } = useResumeStore();
  const { personalInfo } = data;

  const updateField = (field: keyof typeof personalInfo, value: string) => {
    setData({
      ...data,
      personalInfo: {
        ...personalInfo,
        [field]: value,
      },
    });
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <span className="label-mono block mb-4">SECTION_01 // PERSONAL</span>
        <h2 className="text-3xl font-black tracking-tight mb-2">
          Personal Information
        </h2>
        <p className="text-sm text-gray-600">
          Basic contact details and professional links
        </p>
      </div>

      <div className="border-t border-black pt-6 space-y-6">
        {/* Full Name */}
        <div>
          <label className="label-mono block mb-2">FULL_NAME *</label>
          <input
            type="text"
            value={personalInfo.fullName}
            onChange={(e) => updateField("fullName", e.target.value)}
            placeholder="John Doe"
            className="w-full border border-black bg-transparent px-4 py-3 focus:bg-black focus:text-white transition-all duration-150"
          />
        </div>

        {/* Email */}
        <div>
          <label className="label-mono block mb-2">EMAIL *</label>
          <input
            type="email"
            value={personalInfo.email}
            onChange={(e) => updateField("email", e.target.value)}
            placeholder="john@example.com"
            className="w-full border border-black bg-transparent px-4 py-3 focus:bg-black focus:text-white transition-all duration-150"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="label-mono block mb-2">PHONE</label>
          <input
            type="tel"
            value={personalInfo.phone || ""}
            onChange={(e) => updateField("phone", e.target.value)}
            placeholder="+1 (555) 123-4567"
            className="w-full border border-black bg-transparent px-4 py-3 focus:bg-black focus:text-white transition-all duration-150"
          />
        </div>

        {/* Location */}
        <div>
          <label className="label-mono block mb-2">LOCATION</label>
          <input
            type="text"
            value={personalInfo.location || ""}
            onChange={(e) => updateField("location", e.target.value)}
            placeholder="San Francisco, CA"
            className="w-full border border-black bg-transparent px-4 py-3 focus:bg-black focus:text-white transition-all duration-150"
          />
        </div>

        {/* Website */}
        <div>
          <label className="label-mono block mb-2">WEBSITE</label>
          <input
            type="url"
            value={personalInfo.website || ""}
            onChange={(e) => updateField("website", e.target.value)}
            placeholder="https://example.com"
            className="w-full border border-black bg-transparent px-4 py-3 focus:bg-black focus:text-white transition-all duration-150"
          />
        </div>

        {/* LinkedIn */}
        <div>
          <label className="label-mono block mb-2">LINKEDIN</label>
          <input
            type="url"
            value={personalInfo.linkedin || ""}
            onChange={(e) => updateField("linkedin", e.target.value)}
            placeholder="https://linkedin.com/in/johndoe"
            className="w-full border border-black bg-transparent px-4 py-3 focus:bg-black focus:text-white transition-all duration-150"
          />
        </div>

        {/* GitHub */}
        <div>
          <label className="label-mono block mb-2">GITHUB</label>
          <input
            type="url"
            value={personalInfo.github || ""}
            onChange={(e) => updateField("github", e.target.value)}
            placeholder="https://github.com/johndoe"
            className="w-full border border-black bg-transparent px-4 py-3 focus:bg-black focus:text-white transition-all duration-150"
          />
        </div>

        {/* Summary */}
        <div>
          <label className="label-mono block mb-2">PROFESSIONAL_SUMMARY</label>
          <textarea
            value={personalInfo.summary || ""}
            onChange={(e) => updateField("summary", e.target.value)}
            placeholder="A brief professional summary or objective statement..."
            rows={6}
            className="w-full border border-black bg-transparent px-4 py-3 focus:bg-black focus:text-white transition-all duration-150 resize-none"
          />
          <span className="label-mono text-gray-500 text-xs block mt-2">
            {personalInfo.summary?.length || 0} / 500 characters
          </span>
        </div>
      </div>
    </div>
  );
}
