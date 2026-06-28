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
    fontFamily: "Helvetica",
    fontSize: 8,
    paddingHorizontal: 40,
    paddingVertical: 40,
  },
  /* Header — clean centered layout for standard ATS */
  header: {
    alignItems: "center",
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  contactRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    fontSize: 8,
    color: "#444444",
  },
  contactItem: {
    fontSize: 8,
    color: "#444444",
    textDecoration: "none",
  },
  bulletSeparator: {
    color: "#888888",
  },

  /* Section title — standard ATS format */
  sectionTitle: {
    fontSize: 9,
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 10,
    marginBottom: 6,
    borderBottomWidth: 0.75,
    borderBottomColor: "#111111",
    paddingBottom: 2,
  },

  /* Summary */
  summaryText: {
    fontSize: 8,
    lineHeight: 1.4,
    color: "#222222",
  },

  /* Experience & standard item layout */
  itemContainer: {
    marginBottom: 8,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 2,
  },
  boldText: {
    fontSize: 8.5,
    fontWeight: 700,
    color: "#111111",
  },
  italicText: {
    fontSize: 8,
    fontStyle: "italic",
    color: "#444444",
  },
  dateText: {
    fontSize: 8,
    color: "#444444",
  },
  descriptionText: {
    fontSize: 8,
    lineHeight: 1.3,
    color: "#222222",
    marginBottom: 3,
  },
  bulletRow: {
    flexDirection: "row",
    marginBottom: 2,
    paddingLeft: 8,
  },
  bulletDot: {
    width: 8,
    fontSize: 8,
    color: "#111111",
  },
  bulletText: {
    flex: 1,
    fontSize: 8,
    lineHeight: 1.3,
    color: "#222222",
  },

  /* Skills */
  skillsGrid: {
    flexDirection: "column",
    gap: 3,
  },
  skillsRow: {
    flexDirection: "row",
    fontSize: 8,
    lineHeight: 1.3,
  },
  skillCategory: {
    fontWeight: 700,
    width: 100,
    color: "#111111",
  },
  skillList: {
    flex: 1,
    color: "#222222",
  },

  /* Languages */
  languagesList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    fontSize: 8,
  },
});

interface PDFTemplateProps {
  data: ResumeData;
  fontFamily?: string;
  labels?: PdfLabels;
  dateLocale?: string;
}

export function AtsPDF({
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

  const completeEducation = education.filter(
    (edu) =>
      edu.institution.trim() &&
      edu.degree.trim() &&
      edu.field.trim() &&
      edu.startDate.trim(),
  );

  const l = labels ?? getPdfLabels("en");
  const dl = dateLocale ?? getDateLocale("en");

  const fmtDate = (d: string) => {
    if (!d) return "";
    return new Date(d + "-01").toLocaleDateString(dl, {
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });
  };

  const fmtRange = (st: string, en: string, c: boolean) =>
    `${fmtDate(st)} – ${c ? l.present : fmtDate(en)}`;

  return (
    <Document>
      <Page
        size="A4"
        style={{ ...s.page, fontFamily: fontFamily || "Helvetica" }}
      >
        {/* Header */}
        <View style={s.header}>
          <Text style={s.name}>{personalInfo.fullName || l.yourName}</Text>
          <View style={s.contactRow}>
            {personalInfo.email && (
              <Text style={s.contactItem}>{personalInfo.email}</Text>
            )}
            {personalInfo.email && personalInfo.phone && (
              <Text style={s.bulletSeparator}>•</Text>
            )}
            {personalInfo.phone && (
              <Text style={s.contactItem}>{personalInfo.phone}</Text>
            )}
            {personalInfo.phone && personalInfo.location && (
              <Text style={s.bulletSeparator}>•</Text>
            )}
            {personalInfo.location && (
              <Text style={s.contactItem}>{personalInfo.location}</Text>
            )}
            {personalInfo.location && personalInfo.website && (
              <Text style={s.bulletSeparator}>•</Text>
            )}
            {personalInfo.website && (
              <Link
                src={ensureHref(personalInfo.website)}
                style={s.contactItem}
              >
                {l.portfolio}
              </Link>
            )}
            {(personalInfo.website || personalInfo.location) &&
              personalInfo.linkedin && <Text style={s.bulletSeparator}>•</Text>}
            {personalInfo.linkedin && (
              <Link
                src={ensureHref(personalInfo.linkedin)}
                style={s.contactItem}
              >
                LinkedIn
              </Link>
            )}
            {personalInfo.linkedin && personalInfo.github && (
              <Text style={s.bulletSeparator}>•</Text>
            )}
            {personalInfo.github && (
              <Link src={ensureHref(personalInfo.github)} style={s.contactItem}>
                GitHub
              </Link>
            )}
          </View>
        </View>

        {/* Summary */}
        {personalInfo.summary && (
          <View>
            <Text style={s.sectionTitle}>{l.summary}</Text>
            <Text style={s.summaryText}>{personalInfo.summary}</Text>
          </View>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <View>
            <Text style={s.sectionTitle}>{l.skills}</Text>
            <View style={s.skillsGrid}>
              {skills.map((cat) => (
                <View key={cat.id} style={s.skillsRow}>
                  <Text style={s.skillCategory}>{cat.category}:</Text>
                  <Text style={s.skillList}>{cat.items.join(", ")}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <View>
            <Text style={s.sectionTitle}>{l.experience}</Text>
            {experience.map((exp) => (
              <View key={exp.id} style={s.itemContainer}>
                <View style={s.rowBetween}>
                  <Text style={s.boldText}>
                    {exp.position}{" "}
                    <Text style={{ fontWeight: 400, color: "#444444" }}>
                      at {exp.company}
                    </Text>
                  </Text>
                  <Text style={s.dateText}>
                    {fmtRange(exp.startDate, exp.endDate || "", exp.current)}
                  </Text>
                </View>
                {exp.location ? (
                  <View style={{ marginBottom: 2 }}>
                    <Text style={s.italicText}>{exp.location}</Text>
                  </View>
                ) : null}
                {exp.description ? (
                  <Text style={s.descriptionText}>{exp.description}</Text>
                ) : null}
                {exp.highlights.map((h, i) => (
                  <View key={i} style={s.bulletRow}>
                    <Text style={s.bulletDot}>{bulletSymbol}</Text>
                    <Text style={s.bulletText}>{h}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <View>
            <Text style={s.sectionTitle}>{l.projects}</Text>
            {projects.map((p) => (
              <View key={p.id} style={s.itemContainer}>
                <View style={s.rowBetween}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "baseline",
                      gap: 6,
                    }}
                  >
                    <Text style={s.boldText}>{p.name}</Text>
                    {p.technologies.length > 0 && (
                      <Text style={{ fontSize: 7, color: "#666666" }}>
                        [{p.technologies.join(" · ")}]
                      </Text>
                    )}
                  </View>
                  <View style={{ flexDirection: "row", gap: 6 }}>
                    {p.url && (
                      <Link
                        src={p.url}
                        style={{
                          fontSize: 7.5,
                          color: "#666666",
                          textDecoration: "none",
                        }}
                      >
                        {l.project}
                      </Link>
                    )}
                    {p.url && (p.githubUrl || p.websiteUrl) && (
                      <Text style={{ fontSize: 7.5, color: "#999999" }}>|</Text>
                    )}
                    {p.githubUrl && (
                      <Link
                        src={p.githubUrl}
                        style={{
                          fontSize: 7.5,
                          color: "#666666",
                          textDecoration: "none",
                        }}
                      >
                        GitHub
                      </Link>
                    )}
                    {p.githubUrl && p.websiteUrl && (
                      <Text style={{ fontSize: 7.5, color: "#999999" }}>|</Text>
                    )}
                    {p.websiteUrl && (
                      <Link
                        src={p.websiteUrl}
                        style={{
                          fontSize: 7.5,
                          color: "#666666",
                          textDecoration: "none",
                        }}
                      >
                        {l.website}
                      </Link>
                    )}
                  </View>
                </View>
                {p.description ? (
                  <Text style={s.descriptionText}>{p.description}</Text>
                ) : null}
                {p.highlights.map((h, i) => (
                  <View key={i} style={s.bulletRow}>
                    <Text style={s.bulletDot}>{bulletSymbol}</Text>
                    <Text style={s.bulletText}>{h}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}

        {/* Competitions */}
        {competitions.length > 0 && (
          <View>
            <Text style={s.sectionTitle}>{l.competitions}</Text>
            {competitions.map((comp) => (
              <View key={comp.id} style={s.itemContainer}>
                <View style={s.rowBetween}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "baseline",
                      gap: 4,
                    }}
                  >
                    <Text style={s.boldText}>{comp.name}</Text>
                    {comp.role && (
                      <Text style={{ fontSize: 7.5, color: "#555555" }}>
                        — {comp.role}
                      </Text>
                    )}
                  </View>
                  {comp.date && (
                    <Text style={s.dateText}>{fmtDate(comp.date)}</Text>
                  )}
                </View>
                {comp.location && (
                  <Text style={s.italicText}>{comp.location}</Text>
                )}
                {comp.url && (
                  <Link
                    src={ensureHref(comp.url)}
                    style={{
                      fontSize: 7.5,
                      color: "#666666",
                      textDecoration: "none",
                      marginBottom: 2,
                    }}
                  >
                    {l.project}
                  </Link>
                )}
                {comp.description ? (
                  <Text style={s.descriptionText}>{comp.description}</Text>
                ) : null}
                {comp.highlights.map((h, i) => (
                  <View key={i} style={s.bulletRow}>
                    <Text style={s.bulletDot}>{bulletSymbol}</Text>
                    <Text style={s.bulletText}>{h}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}

        {/* Certifications */}
        {certifications.length > 0 && (
          <View>
            <Text style={s.sectionTitle}>{l.certifications}</Text>
            {certifications.map((cert) => (
              <View key={cert.id} style={{ marginBottom: 5 }}>
                <View style={s.rowBetween}>
                  <Text style={s.boldText}>
                    {cert.name}
                    {cert.issuer ? (
                      <Text style={{ fontWeight: 400, color: "#555555" }}>
                        {" "}
                        — {cert.issuer}
                      </Text>
                    ) : null}
                  </Text>
                  {cert.date && (
                    <Text style={s.dateText}>{fmtDate(cert.date)}</Text>
                  )}
                </View>
                {cert.url && (
                  <Link
                    src={ensureHref(cert.url)}
                    style={{
                      fontSize: 7.5,
                      color: "#666666",
                      textDecoration: "none",
                    }}
                  >
                    {l.viewCertificate}
                  </Link>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Education */}
        {completeEducation.length > 0 && (
          <View>
            <Text style={s.sectionTitle}>{l.education}</Text>
            {completeEducation.map((edu) => (
              <View key={edu.id} style={s.itemContainer}>
                <View style={s.rowBetween}>
                  <Text style={s.boldText}>
                    {edu.degree} in {edu.field}{" "}
                    <Text style={{ fontWeight: 400, color: "#444444" }}>
                      — {edu.institution}
                    </Text>
                  </Text>
                  <Text style={s.dateText}>
                    {fmtRange(edu.startDate, edu.endDate || "", edu.current)}
                  </Text>
                </View>
                {edu.gpa && (
                  <Text style={s.italicText}>
                    {l.gpa}: {edu.gpa}
                  </Text>
                )}
                {(edu.coursework ?? []).length > 0 && (
                  <Text
                    style={{ fontSize: 7.5, color: "#555555", marginTop: 2 }}
                  >
                    Relevant Coursework: {(edu.coursework ?? []).join(", ")}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Languages */}
        {languages.length > 0 && (
          <View>
            <Text style={s.sectionTitle}>{l.languages}</Text>
            <View style={s.languagesList}>
              {languages.map((lang) => (
                <Text key={lang.id} style={{ fontSize: 8 }}>
                  <Text style={{ fontWeight: 700 }}>{lang.language}:</Text>{" "}
                  {lang.proficiency.charAt(0).toUpperCase() +
                    lang.proficiency.slice(1)}
                </Text>
              ))}
            </View>
          </View>
        )}
      </Page>
    </Document>
  );
}
