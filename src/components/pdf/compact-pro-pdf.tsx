import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Link,
} from "@react-pdf/renderer";
import type { ResumeData } from "@/db/schema";
import { ensureHref } from "@/lib/url-helpers";

Font.register({
  family: "Archivo",
  fonts: [
    { src: "https://fonts.gstatic.com/s/archivo/v19/k3kQo8UDI-1M0wlSV9XAw6lQkqWY8Q82sJaRE-NWIDdgffTTNDJp8B1oJ0vyVQ.ttf", fontWeight: 400 },
    { src: "https://fonts.gstatic.com/s/archivo/v19/k3kQo8UDI-1M0wlSV9XAw6lQkqWY8Q82sJaRE-NWIDdgffTTNXts8B1oJ0vyVQ.ttf", fontWeight: 700 },
    { src: "https://fonts.gstatic.com/s/archivo/v19/k3kQo8UDI-1M0wlSV9XAw6lQkqWY8Q82sJaRE-NWIDdgffTTNUds8B1oJ0vyVQ.ttf", fontWeight: 900 },
  ],
});

const s = StyleSheet.create({
  page: { backgroundColor: "#FFFFFF", fontFamily: "Archivo", fontSize: 8, padding: 28 },
  /* Header — single dense row */
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 2 },
  name: { fontSize: 16, fontWeight: 900, letterSpacing: -0.5 },
  contactRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  contactText: { fontSize: 7, color: "#666666" },
  divider: { height: 0.5, backgroundColor: "#000000", marginVertical: 6 },
  /* Summary — compact */
  summary: { fontSize: 8, lineHeight: 1.4, color: "#555555", marginBottom: 6 },
  /* Two-column layout */
  columns: { flexDirection: "row", gap: 20 },
  mainCol: { flex: 3 },
  sideCol: { flex: 1, borderLeftWidth: 0.5, borderLeftColor: "#DDDDDD", paddingLeft: 14 },
  /* Section */
  sectionTitle: { fontSize: 8, fontWeight: 900, textTransform: "uppercase", letterSpacing: 2, marginBottom: 5, borderBottomWidth: 0.5, borderBottomColor: "#DDDDDD", paddingBottom: 3 },
  /* Experience */
  expItem: { marginBottom: 7 },
  expTopRow: { flexDirection: "row", justifyContent: "space-between" },
  expPosition: { fontSize: 9, fontWeight: 700 },
  expDate: { fontSize: 7, color: "#999999" },
  expCompany: { fontSize: 7, color: "#888888", marginBottom: 2 },
  expDesc: { fontSize: 7.5, lineHeight: 1.4, color: "#555555", marginBottom: 2 },
  bulletRow: { flexDirection: "row", marginBottom: 1 },
  bulletDot: { width: 6, fontSize: 7, color: "#000000" },
  bulletText: { flex: 1, fontSize: 7.5, lineHeight: 1.3, color: "#555555" },
  /* Projects */
  projItem: { marginBottom: 6 },
  projName: { fontSize: 8, fontWeight: 700, marginBottom: 1 },
  projTech: { fontSize: 6.5, color: "#AAAAAA", marginBottom: 2 },
  projDesc: { fontSize: 7.5, lineHeight: 1.3, color: "#555555" },
  /* Side sections */
  skillCat: { marginBottom: 5 },
  skillCatName: { fontSize: 7, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 },
  skillItems: { fontSize: 7, color: "#666666", lineHeight: 1.3 },
  eduItem: { marginBottom: 5 },
  eduDegree: { fontSize: 8, fontWeight: 700, marginBottom: 1 },
  eduSchool: { fontSize: 7, color: "#666666", marginBottom: 1 },
  eduDate: { fontSize: 6.5, color: "#999999" },
  sectionGap: { marginTop: 10 },
});

interface PDFTemplateProps { data: ResumeData; fontFamily?: string }

export function CompactProPDF({ data, fontFamily }: PDFTemplateProps) {
  const { personalInfo, experience, education, skills, projects } = data;

  const fmtDate = (d: string) => {
    if (!d) return "";
    return new Date(d + "-01").toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };
  const fmtRange = (st: string, en: string, c: boolean) => `${fmtDate(st)} – ${c ? "Present" : fmtDate(en)}`;

  return (
    <Document>
      <Page size="A4" style={{ ...s.page, fontFamily: fontFamily || "Archivo" }}>
        {/* Header row */}
        <View style={s.headerRow}>
          <Text style={s.name}>{personalInfo.fullName || "YOUR NAME"}</Text>
          <View style={s.contactRow}>
            {personalInfo.email && <Text style={s.contactText}>{personalInfo.email}</Text>}
            {personalInfo.phone && <Text style={s.contactText}>{personalInfo.phone}</Text>}
            {personalInfo.location && <Text style={s.contactText}>{personalInfo.location}</Text>}
            {personalInfo.website && <Link src={ensureHref(personalInfo.website)} style={{ ...s.contactText, color: "#666666", textDecoration: "none" }}>Portfolio</Link>}
            {personalInfo.linkedin && <Link src={ensureHref(personalInfo.linkedin)} style={{ ...s.contactText, color: "#666666", textDecoration: "none" }}>LinkedIn</Link>}
            {personalInfo.github && <Link src={ensureHref(personalInfo.github)} style={{ ...s.contactText, color: "#666666", textDecoration: "none" }}>GitHub</Link>}
          </View>
        </View>
        <View style={s.divider} />

        {/* Summary */}
        {personalInfo.summary && <Text style={s.summary}>{personalInfo.summary}</Text>}

        {/* Two columns */}
        <View style={s.columns}>
          {/* Main column */}
          <View style={s.mainCol}>
            {/* Experience */}
            {experience.length > 0 && (
              <View>
                <Text style={s.sectionTitle}>Experience</Text>
                {experience.map((exp) => (
                  <View key={exp.id} style={s.expItem}>
                    <View style={s.expTopRow}>
                      <Text style={s.expPosition}>{exp.position}</Text>
                      <Text style={s.expDate}>{fmtRange(exp.startDate, exp.endDate || "", exp.current)}</Text>
                    </View>
                    <Text style={s.expCompany}>{exp.company}{exp.location ? ` · ${exp.location}` : ""}</Text>
                    {exp.description ? <Text style={s.expDesc}>{exp.description}</Text> : null}
                    {exp.highlights.map((h, i) => (
                      <View key={i} style={s.bulletRow}>
                        <Text style={s.bulletDot}>•</Text>
                        <Text style={s.bulletText}>{h}</Text>
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            )}

            {/* Projects */}
            {projects.length > 0 && (
              <View style={s.sectionGap}>
                <Text style={s.sectionTitle}>Projects</Text>
                {projects.map((p) => (
                  <View key={p.id} style={s.projItem}>
                    <Text style={s.projName}>{p.name}</Text>
                    {p.technologies.length > 0 && <Text style={s.projTech}>{p.technologies.join(" · ")}</Text>}
                    {p.description ? <Text style={s.projDesc}>{p.description}</Text> : null}
                    {p.highlights.map((h, i) => (
                      <View key={i} style={s.bulletRow}>
                        <Text style={s.bulletDot}>•</Text>
                        <Text style={s.bulletText}>{h}</Text>
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Sidebar */}
          <View style={s.sideCol}>
            {/* Skills */}
            {skills.length > 0 && (
              <View>
                <Text style={s.sectionTitle}>Skills</Text>
                {skills.map((cat) => (
                  <View key={cat.id} style={s.skillCat}>
                    <Text style={s.skillCatName}>{cat.category}</Text>
                    <Text style={s.skillItems}>{cat.items.join(", ")}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Education */}
            {education.length > 0 && (
              <View style={s.sectionGap}>
                <Text style={s.sectionTitle}>Education</Text>
                {education.map((edu) => (
                  <View key={edu.id} style={s.eduItem}>
                    <Text style={s.eduDegree}>{edu.degree}</Text>
                    <Text style={s.eduSchool}>{edu.field} — {edu.institution}</Text>
                    <Text style={s.eduDate}>{fmtRange(edu.startDate, edu.endDate || "", edu.current)}</Text>
                    {edu.gpa ? <Text style={s.eduDate}>GPA: {edu.gpa}</Text> : null}
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </Page>
    </Document>
  );
}
