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
  page: { backgroundColor: "#FFFFFF", fontFamily: "Archivo", padding: 30, fontSize: 9 },
  name: { fontSize: 22, fontWeight: 900, letterSpacing: -0.5, marginBottom: 4 },
  contactRow: { flexDirection: "row", flexWrap: "wrap", fontSize: 8, color: "#666666", marginBottom: 8 },
  contactItem: { marginRight: 10 },
  summary: { fontSize: 9, lineHeight: 1.4, color: "#444444", marginBottom: 16 },
  twoCol: { flexDirection: "row", gap: 20 },
  left: { flex: 1 },
  right: { width: 160 },
  sectionTitle: { fontSize: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, borderBottomWidth: 0.5, borderBottomColor: "#000000", paddingBottom: 3, marginBottom: 8 },
  expItem: { marginBottom: 14 },
  expRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 2 },
  expPosition: { fontSize: 11, fontWeight: 700 },
  expCompany: { fontSize: 8, color: "#666666", marginBottom: 3 },
  expDate: { fontSize: 7, color: "#999999" },
  expDesc: { fontSize: 8, lineHeight: 1.4, color: "#444444", marginBottom: 4 },
  bulletItem: { flexDirection: "row", marginBottom: 2, paddingLeft: 6 },
  bulletMark: { width: 10, fontSize: 8, color: "#999999" },
  bulletText: { flex: 1, fontSize: 8, lineHeight: 1.4, color: "#444444" },
  skillCat: { marginBottom: 8 },
  skillCatName: { fontSize: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 },
  skillItems: { fontSize: 8, color: "#444444", lineHeight: 1.4 },
  eduItem: { marginBottom: 8 },
  eduDegree: { fontSize: 9, fontWeight: 700 },
  eduDetail: { fontSize: 7, color: "#666666", marginBottom: 1 },
  projName: { fontSize: 10, fontWeight: 700, marginBottom: 2 },
  projTech: { fontSize: 7, color: "#999999", marginBottom: 3 },
});

interface PDFTemplateProps { data: ResumeData; fontFamily?: string }

export function MonoStackPDF({ data, fontFamily }: PDFTemplateProps) {
  const { personalInfo, experience, education, skills, projects } = data;

  const fmtDate = (d: string) => {
    if (!d) return "";
    return new Date(d + "-01").toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };
  const fmtRange = (s: string, e: string, c: boolean) => `${fmtDate(s)} — ${c ? "Present" : fmtDate(e)}`;

  return (
    <Document>
      <Page size="A4" style={{ ...s.page, fontFamily: fontFamily || "Archivo" }}>
        {/* Header */}
        <View style={{ marginBottom: 12 }}>
          <Text style={s.name}>{personalInfo.fullName || "YOUR NAME"}</Text>
          <View style={s.contactRow}>
            {personalInfo.email && <Text style={s.contactItem}>{personalInfo.email}</Text>}
            {personalInfo.phone && <Text style={s.contactItem}>{personalInfo.phone}</Text>}
            {personalInfo.location && <Text style={s.contactItem}>{personalInfo.location}</Text>}
            {personalInfo.website && <Link src={ensureHref(personalInfo.website)} style={{ ...s.contactItem, color: "#666666", textDecoration: "none" }}>Portfolio</Link>}
            {personalInfo.github && <Link src={ensureHref(personalInfo.github)} style={{ ...s.contactItem, color: "#666666", textDecoration: "none" }}>GitHub</Link>}
          </View>
        </View>

        {personalInfo.summary && <Text style={s.summary}>{personalInfo.summary}</Text>}

        <View style={s.twoCol}>
          {/* LEFT */}
          <View style={s.left}>
            {experience.length > 0 && (
              <View style={{ marginBottom: 16 }}>
                <Text style={s.sectionTitle}>Experience</Text>
                {experience.map((exp) => (
                  <View key={exp.id} style={s.expItem}>
                    <View style={s.expRow}>
                      <Text style={s.expPosition}>{exp.position}</Text>
                      <Text style={s.expDate}>{fmtRange(exp.startDate, exp.endDate || "", exp.current)}</Text>
                    </View>
                    <Text style={s.expCompany}>{exp.company}{exp.location ? ` · ${exp.location}` : ""}</Text>
                    {exp.description ? <Text style={s.expDesc}>{exp.description}</Text> : null}
                    {exp.highlights.map((h, i) => (
                      <View key={i} style={s.bulletItem}>
                        <Text style={s.bulletMark}>→</Text>
                        <Text style={s.bulletText}>{h}</Text>
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            )}

            {projects.length > 0 && (
              <View>
                <Text style={s.sectionTitle}>Projects</Text>
                {projects.map((p) => (
                  <View key={p.id} style={s.expItem}>
                    <Text style={s.projName}>{p.name}</Text>
                    {p.technologies.length > 0 && <Text style={s.projTech}>{p.technologies.join(" / ")}</Text>}
                    {p.description ? <Text style={s.expDesc}>{p.description}</Text> : null}
                    {p.highlights.map((h, i) => (
                      <View key={i} style={s.bulletItem}>
                        <Text style={s.bulletMark}>→</Text>
                        <Text style={s.bulletText}>{h}</Text>
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* RIGHT */}
          <View style={s.right}>
            {skills.length > 0 && (
              <View style={{ marginBottom: 16 }}>
                <Text style={s.sectionTitle}>Skills</Text>
                {skills.map((cat) => (
                  <View key={cat.id} style={s.skillCat}>
                    <Text style={s.skillCatName}>{cat.category}</Text>
                    <Text style={s.skillItems}>{cat.items.join(", ")}</Text>
                  </View>
                ))}
              </View>
            )}

            {education.length > 0 && (
              <View>
                <Text style={s.sectionTitle}>Education</Text>
                {education.map((edu) => (
                  <View key={edu.id} style={s.eduItem}>
                    <Text style={s.eduDegree}>{edu.degree}</Text>
                    <Text style={s.eduDetail}>{edu.field}</Text>
                    <Text style={s.eduDetail}>{edu.institution}</Text>
                    <Text style={s.eduDetail}>{fmtRange(edu.startDate, edu.endDate || "", edu.current)}</Text>
                    {edu.gpa ? <Text style={s.eduDetail}>GPA: {edu.gpa}</Text> : null}
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
