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

// Register fonts (using system fonts as fallback)
Font.register({
  family: "Archivo",
  fonts: [
    { src: "https://fonts.gstatic.com/s/archivo/v19/k3kQo8UDI-1M0wlSV9XAw6lQkqWY8Q82sJaRE-NWIDdgffTTNDJp8B1oJ0vyVQ.ttf", fontWeight: 400 },
    { src: "https://fonts.gstatic.com/s/archivo/v19/k3kQo8UDI-1M0wlSV9XAw6lQkqWY8Q82sJaRE-NWIDdgffTTNXts8B1oJ0vyVQ.ttf", fontWeight: 700 },
    { src: "https://fonts.gstatic.com/s/archivo/v19/k3kQo8UDI-1M0wlSV9XAw6lQkqWY8Q82sJaRE-NWIDdgffTTNUds8B1oJ0vyVQ.ttf", fontWeight: 900 },
  ],
});

const styles = StyleSheet.create({
  page: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    fontFamily: "Archivo",
  },
  sidebar: {
    width: "30%",
    backgroundColor: "#000000",
    color: "#FFFFFF",
    padding: 30,
  },
  mainContent: {
    width: "70%",
    padding: 30,
  },
  name: {
    fontSize: 20,
    fontWeight: 900,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#FFFFFF",
    width: 40,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 8,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 8,
    opacity: 0.6,
  },
  contactText: {
    fontSize: 9,
    marginBottom: 6,
    lineHeight: 1.4,
  },
  skillCategory: {
    marginBottom: 10,
  },
  skillCategoryName: {
    fontSize: 9,
    fontWeight: 700,
    marginBottom: 3,
  },
  skillItems: {
    fontSize: 8,
    lineHeight: 1.5,
    opacity: 0.9,
  },
  educationItem: {
    marginBottom: 12,
  },
  educationDegree: {
    fontSize: 9,
    fontWeight: 700,
    marginBottom: 2,
  },
  educationDetails: {
    fontSize: 8,
    opacity: 0.7,
    marginBottom: 2,
  },
  mainSectionTitle: {
    fontSize: 8,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
    paddingBottom: 4,
    marginBottom: 12,
  },
  experienceItem: {
    marginBottom: 20,
  },
  expHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  expPosition: {
    fontSize: 12,
    fontWeight: 700,
  },
  expCompany: {
    fontSize: 10,
    marginBottom: 2,
  },
  expDate: {
    fontSize: 8,
    opacity: 0.6,
  },
  expLocation: {
    fontSize: 8,
    opacity: 0.6,
    marginBottom: 6,
  },
  expDescription: {
    fontSize: 9,
    lineHeight: 1.5,
    marginBottom: 6,
  },
  bulletList: {
    marginLeft: 10,
  },
  bulletItem: {
    flexDirection: "row",
    marginBottom: 4,
  },
  bullet: {
    width: 10,
    fontSize: 9,
  },
  bulletText: {
    flex: 1,
    fontSize: 9,
    lineHeight: 1.5,
  },
});

interface PDFTemplateProps {
  data: ResumeData;
  fontFamily?: string;
}

export function LabProtocolPDF({ data, fontFamily }: PDFTemplateProps) {
  const { personalInfo, experience, education, skills, projects } = data;

  const formatDate = (dateStr: string, current: boolean) => {
    if (!dateStr) return "";
    const date = new Date(dateStr + "-01");
    const formatted = date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
    return current ? `${formatted} - Present` : formatted;
  };

  const formatDateRange = (start: string, end: string, current: boolean) => {
    return `${formatDate(start, false)} - ${current ? "Present" : formatDate(end, false)}`;
  };

  return (
    <Document>
      <Page size="A4" style={{ ...styles.page, fontFamily: fontFamily || "Archivo" }}>
        {/* Sidebar */}
        <View style={styles.sidebar}>
          <View>
            <Text style={styles.name}>{personalInfo.fullName || "YOUR NAME"}</Text>
            <View style={styles.divider} />
          </View>

          {/* Contact */}
          <View style={{ marginBottom: 20 }}>
            <Text style={styles.sectionTitle}>CONTACT</Text>
            {personalInfo.email && <Text style={styles.contactText}>{personalInfo.email}</Text>}
            {personalInfo.phone && <Text style={styles.contactText}>{personalInfo.phone}</Text>}
            {personalInfo.location && <Text style={styles.contactText}>{personalInfo.location}</Text>}
          </View>

          {/* Links */}
          {(personalInfo.website || personalInfo.linkedin || personalInfo.github) && (
            <View style={{ marginBottom: 20 }}>
              <Text style={styles.sectionTitle}>LINKS</Text>
              {personalInfo.website && (
                <Link src={ensureHref(personalInfo.website)} style={{ ...styles.contactText, color: "#FFFFFF", textDecoration: "none" }}>
                  WEB// Portfolio
                </Link>
              )}
              {personalInfo.linkedin && (
                <Link src={ensureHref(personalInfo.linkedin)} style={{ ...styles.contactText, color: "#FFFFFF", textDecoration: "none" }}>
                  IN// LinkedIn
                </Link>
              )}
              {personalInfo.github && (
                <Link src={ensureHref(personalInfo.github)} style={{ ...styles.contactText, color: "#FFFFFF", textDecoration: "none" }}>
                  GH// GitHub
                </Link>
              )}
            </View>
          )}

          {/* Skills */}
          {skills.length > 0 && (
            <View style={{ marginBottom: 20 }}>
              <Text style={styles.sectionTitle}>TECHNICAL</Text>
              {skills.map((category) => (
                <View key={category.id} style={styles.skillCategory}>
                  <Text style={styles.skillCategoryName}>{category.category}</Text>
                  <Text style={styles.skillItems}>{category.items.join(" • ")}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Education */}
          {education.length > 0 && (
            <View>
              <Text style={styles.sectionTitle}>EDUCATION</Text>
              {education.map((edu) => (
                <View key={edu.id} style={styles.educationItem}>
                  <Text style={styles.educationDegree}>{edu.degree}</Text>
                  <Text style={styles.educationDetails}>{edu.field}</Text>
                  <Text style={styles.educationDetails}>{edu.institution}</Text>
                  <Text style={styles.educationDetails}>
                    {formatDateRange(edu.startDate, edu.endDate || "", edu.current)}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Summary */}
          {personalInfo.summary && (
            <View style={{ marginBottom: 20 }}>
              <Text style={styles.mainSectionTitle}>PROFILE</Text>
              <Text style={styles.expDescription}>{personalInfo.summary}</Text>
            </View>
          )}

          {/* Experience */}
          {experience.length > 0 && (
            <View style={{ marginBottom: 20 }}>
              <Text style={styles.mainSectionTitle}>EXPERIENCE</Text>
              {experience.map((exp) => (
                <View key={exp.id} style={styles.experienceItem}>
                  <View style={styles.expHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.expPosition}>{exp.position}</Text>
                      <Text style={styles.expCompany}>{exp.company}</Text>
                    </View>
                    <Text style={styles.expDate}>
                      {formatDateRange(exp.startDate, exp.endDate || "", exp.current)}
                    </Text>
                  </View>
                  {exp.location && <Text style={styles.expLocation}>{exp.location}</Text>}
                  {exp.description && (
                    <Text style={styles.expDescription}>{exp.description}</Text>
                  )}
                  {exp.highlights.length > 0 && (
                    <View style={styles.bulletList}>
                      {exp.highlights.map((highlight, idx) => (
                        <View key={idx} style={styles.bulletItem}>
                          <Text style={styles.bullet}>▪</Text>
                          <Text style={styles.bulletText}>{highlight}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Projects */}
          {projects.length > 0 && (
            <View>
              <Text style={styles.mainSectionTitle}>PROJECTS</Text>
              {projects.map((project) => (
                <View key={project.id} style={styles.experienceItem}>
                  <Text style={styles.expPosition}>{project.name}</Text>
                  {project.description && (
                    <Text style={styles.expDescription}>{project.description}</Text>
                  )}
                  {project.technologies.length > 0 && (
                    <Text style={{ ...styles.expDate, marginBottom: 6 }}>
                      {project.technologies.join(" • ")}
                    </Text>
                  )}
                  {project.highlights.length > 0 && (
                    <View style={styles.bulletList}>
                      {project.highlights.map((highlight, idx) => (
                        <View key={idx} style={styles.bulletItem}>
                          <Text style={styles.bullet}>▪</Text>
                          <Text style={styles.bulletText}>{highlight}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      </Page>
    </Document>
  );
}
