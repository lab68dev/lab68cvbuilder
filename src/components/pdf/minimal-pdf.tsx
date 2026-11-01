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
    padding: 36,
    fontSize: 9,
    color: "#000000",
  },
  header: {
    borderBottomWidth: 0.75,
    borderBottomColor: "#D4D4D4",
    paddingBottom: 12,
    marginBottom: 14,
  },
  name: { fontSize: 22, fontWeight: 700 },
  contactRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 6,
    fontSize: 8,
    color: "#404040",
  },
  contactItem: { marginRight: 9, marginBottom: 2 },
  contactLink: { color: "#404040" },
  summary: { marginTop: 8, fontSize: 9, lineHeight: 1.5, color: "#404040" },
  section: { marginBottom: 14 },
  sectionTitle: {
    fontSize: 8,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 1.3,
    color: "#737373",
    marginBottom: 6,
  },
  entry: { marginBottom: 8 },
  entryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  entryTitle: { flex: 1, fontSize: 10, fontWeight: 700, paddingRight: 8 },
  entryDate: { fontSize: 7.5, color: "#737373" },
  smallBold: { fontSize: 8.5, fontWeight: 700 },
  body: { fontSize: 8.5, lineHeight: 1.4, color: "#404040" },
  bulletRow: { flexDirection: "row", marginTop: 1.5 },
  bulletMark: { width: 10, fontSize: 8.5, color: "#404040" },
  bulletText: { flex: 1, fontSize: 8.5, lineHeight: 1.4, color: "#404040" },
  line: { fontSize: 8.5, lineHeight: 1.4, color: "#404040", marginBottom: 3 },
  bold: { fontWeight: 700 },
});

interface PDFTemplateProps {
  data: ResumeData;
  fontFamily?: string;
  labels?: PdfLabels;
  dateLocale?: string;
}

export function MinimalPDF({
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
          {personalInfo.summary ? (
            <Text style={s.summary}>{personalInfo.summary}</Text>
          ) : null}
        </View>

        {experience.length > 0 ? (
          <View style={s.section}>
            <Text style={s.sectionTitle} minPresenceAhead={30}>
              {l.experience}
            </Text>
            {experience.map((exp) => (
              <View key={exp.id} style={s.entry}>
                <View style={s.entryRow}>
                  <Text style={s.entryTitle}>
                    {exp.position} - {exp.company}
                  </Text>
                  <Text style={s.entryDate}>
                    {fmtRange(exp.startDate, exp.endDate || "", exp.current)}
                  </Text>
                </View>
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

        {education.length > 0 ? (
          <View style={s.section}>
            <Text style={s.sectionTitle} minPresenceAhead={30}>
              {l.education}
            </Text>
            {education.map((edu) => (
              <View key={edu.id} style={{ marginBottom: 6 }}>
                <View style={s.entryRow}>
                  <Text style={{ ...s.smallBold, flex: 1, paddingRight: 8 }}>
                    {edu.degree} {edu.field ? `in ${edu.field}` : ""}
                  </Text>
                  <Text style={s.entryDate}>
                    {fmtRange(edu.startDate, edu.endDate || "", edu.current)}
                  </Text>
                </View>
                <Text style={s.body}>{edu.institution}</Text>
              </View>
            ))}
          </View>
        ) : null}

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
                <Text style={s.bold}>{lang.language}:</Text> {lang.proficiency}
              </Text>
            ))}
          </View>
        ) : null}
      </Page>
    </Document>
  );
}
