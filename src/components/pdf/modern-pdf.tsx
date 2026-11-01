import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Link,
} from "@react-pdf/renderer";
import type { ResumeData } from "@/db/schema";
import { ensureHref } from "@/lib/url-helpers";
import { type PdfLabels, getPdfLabels, getDateLocale } from "@/lib/pdf-labels";
import { getResumeBulletSymbol } from "@/lib/bullet-symbol";

const s = StyleSheet.create({
  page: {
    backgroundColor: "#FFFFFF",
    padding: 32,
    fontSize: 9,
    color: "#000000",
  },
  header: {
    borderBottomWidth: 0.75,
    borderBottomColor: "#000000",
    paddingBottom: 9,
    marginBottom: 12,
  },
  name: { fontSize: 22, fontWeight: 700 },
  contactRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 6,
    fontSize: 8,
    color: "#404040",
  },
  linkRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 3,
    fontSize: 8,
  },
  contactItem: { marginRight: 9, marginBottom: 2 },
  contactLink: { color: "#525252" },
  columns: { flexDirection: "row" },
  mainColumn: { flex: 1.25, paddingRight: 8 },
  sideColumn: { flex: 0.75, paddingLeft: 8 },
  section: { marginBottom: 12 },
  sectionTitle: {
    fontSize: 8,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 1.3,
    color: "#737373",
    marginBottom: 5,
  },
  body: { fontSize: 8.5, lineHeight: 1.4, color: "#404040" },
  entry: { marginBottom: 7 },
  entryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  entryTitle: { flex: 1, fontSize: 10, fontWeight: 700, paddingRight: 6 },
  entryDate: { fontSize: 7.5, color: "#737373" },
  company: { fontSize: 8.5, color: "#525252" },
  bulletRow: { flexDirection: "row", marginTop: 1.5 },
  bulletMark: { width: 10, fontSize: 8.5, color: "#404040" },
  bulletText: { flex: 1, fontSize: 8.5, lineHeight: 1.4, color: "#404040" },
  line: { fontSize: 8.5, lineHeight: 1.4, color: "#404040", marginBottom: 4 },
  bold: { fontWeight: 700 },
});

interface PDFTemplateProps {
  data: ResumeData;
  fontFamily?: string;
  labels?: PdfLabels;
  dateLocale?: string;
}

export function ModernPDF({
  data,
  fontFamily,
  labels,
  dateLocale,
}: PDFTemplateProps) {
  const {
    personalInfo,
    experience,
    education,
    skills,
    projects,
    certifications,
    competitions = [],
    languages,
  } = data;
  const bulletSymbol = getResumeBulletSymbol(data, "•");
  const l = labels ?? getPdfLabels("en");
  const dl = dateLocale ?? getDateLocale("en");

  const fmtDate = (d: string) => {
    if (!d) return "";
    return new Date(`${d}-01`).toLocaleDateString(dl, {
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });
  };
  const fmtRange = (start: string, end: string, current: boolean) =>
    `${fmtDate(start)} - ${current ? l.present : fmtDate(end)}`;

  return (
    <Document>
      <Page
        size="A4"
        style={{ ...s.page, fontFamily: fontFamily || "Helvetica" }}
      >
        <View style={s.header}>
          <Text style={s.name}>{personalInfo.fullName || l.yourName}</Text>
          <View style={s.contactRow}>
            {personalInfo.email ? (
              <Text style={s.contactItem}>{personalInfo.email}</Text>
            ) : null}
            {personalInfo.phone ? (
              <Text style={s.contactItem}>{personalInfo.phone}</Text>
            ) : null}
            {personalInfo.location ? (
              <Text style={s.contactItem}>{personalInfo.location}</Text>
            ) : null}
          </View>
          <View style={s.linkRow}>
            {personalInfo.website ? (
              <Link
                src={ensureHref(personalInfo.website)}
                style={{ ...s.contactItem, ...s.contactLink }}
              >
                {l.portfolio}
              </Link>
            ) : null}
            {personalInfo.linkedin ? (
              <Link
                src={ensureHref(personalInfo.linkedin)}
                style={{ ...s.contactItem, ...s.contactLink }}
              >
                LinkedIn
              </Link>
            ) : null}
            {personalInfo.github ? (
              <Link
                src={ensureHref(personalInfo.github)}
                style={{ ...s.contactItem, ...s.contactLink }}
              >
                GitHub
              </Link>
            ) : null}
          </View>
        </View>

        <View style={s.columns}>
          <View style={s.mainColumn}>
            {personalInfo.summary ? (
              <View style={s.section}>
                <Text style={s.sectionTitle} minPresenceAhead={30}>
                  {l.professionalSummary}
                </Text>
                <Text style={s.body}>{personalInfo.summary}</Text>
              </View>
            ) : null}

            {experience.length > 0 ? (
              <View style={s.section}>
                <Text style={s.sectionTitle} minPresenceAhead={30}>
                  {l.professionalExperience}
                </Text>
                {experience.map((exp) => (
                  <View key={exp.id} style={s.entry}>
                    <View style={s.entryRow}>
                      <Text style={s.entryTitle}>{exp.position}</Text>
                      <Text style={s.entryDate}>
                        {fmtRange(
                          exp.startDate,
                          exp.endDate || "",
                          exp.current,
                        )}
                      </Text>
                    </View>
                    <Text style={s.company}>{exp.company}</Text>
                    {exp.description ? (
                      <Text style={{ ...s.body, marginTop: 2 }}>
                        {exp.description}
                      </Text>
                    ) : null}
                    {exp.highlights.map((h, i) => (
                      <View key={i} style={s.bulletRow}>
                        <Text style={s.bulletMark}>{bulletSymbol}</Text>
                        <Text style={s.bulletText}>{h}</Text>
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            ) : null}

            {projects.length > 0 ? (
              <View style={s.section}>
                <Text style={s.sectionTitle} minPresenceAhead={30}>
                  {l.projects}
                </Text>
                {projects.map((project) => (
                  <View key={project.id} style={{ marginBottom: 6 }}>
                    <Text style={{ fontSize: 10, fontWeight: 700 }}>
                      {project.name}
                    </Text>
                    {project.description ? (
                      <Text style={s.body}>{project.description}</Text>
                    ) : null}
                  </View>
                ))}
              </View>
            ) : null}
          </View>

          <View style={s.sideColumn}>
            {skills.length > 0 ? (
              <View style={s.section}>
                <Text style={s.sectionTitle} minPresenceAhead={30}>
                  {l.skills}
                </Text>
                {skills.map((cat) => (
                  <Text key={cat.id} style={s.line}>
                    <Text style={s.bold}>{cat.category}:</Text>{" "}
                    {cat.items.join(", ")}
                  </Text>
                ))}
              </View>
            ) : null}

            {education.length > 0 ? (
              <View style={s.section}>
                <Text style={s.sectionTitle} minPresenceAhead={30}>
                  {l.education}
                </Text>
                {education.map((edu) => (
                  <View key={edu.id} style={{ marginBottom: 4 }}>
                    <Text style={{ ...s.body, ...s.bold }}>
                      {edu.degree} {edu.field ? `in ${edu.field}` : ""}
                    </Text>
                    <Text style={s.body}>{edu.institution}</Text>
                  </View>
                ))}
              </View>
            ) : null}

            {certifications.length > 0 ? (
              <View style={s.section}>
                <Text style={s.sectionTitle} minPresenceAhead={30}>
                  {l.certifications}
                </Text>
                {certifications.map((cert) => (
                  <Text key={cert.id} style={s.line}>
                    <Text style={s.bold}>{cert.name}</Text>
                    {cert.issuer ? ` - ${cert.issuer}` : ""}
                  </Text>
                ))}
              </View>
            ) : null}

            {competitions.length > 0 ? (
              <View style={s.section}>
                <Text style={s.sectionTitle} minPresenceAhead={30}>
                  {l.competitions}
                </Text>
                {competitions.map((comp) => (
                  <Text key={comp.id} style={s.line}>
                    <Text style={s.bold}>{comp.name}</Text>
                    {comp.role ? ` - ${comp.role}` : ""}
                  </Text>
                ))}
              </View>
            ) : null}

            {languages.length > 0 ? (
              <View style={s.section}>
                <Text style={s.sectionTitle} minPresenceAhead={30}>
                  {l.languages}
                </Text>
                {languages.map((lang) => (
                  <Text key={lang.id} style={s.line}>
                    <Text style={s.bold}>{lang.language}:</Text>{" "}
                    {lang.proficiency}
                  </Text>
                ))}
              </View>
            ) : null}
          </View>
        </View>
      </Page>
    </Document>
  );
}
