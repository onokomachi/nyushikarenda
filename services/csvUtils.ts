import { School, EventType } from '../types';

// CSV Header
const CSV_HEADER = ['SchoolID', 'SchoolName', 'CourseID', 'CourseName', 'EventID', 'EventType', 'EventName', 'StartDate', 'EndDate'];

export const exportToCSV = (schools: School[]): string => {
  const rows = schools.flatMap(school => 
    school.courses.flatMap(course => 
      course.events.map(event => [
        `"${school.id}"`,
        `"${school.name}"`,
        `"${course.id}"`,
        `"${course.name}"`,
        `"${event.id}"`,
        `"${event.type}"`,
        `"${event.name || ''}"`,
        `"${event.startDate}"`,
        `"${event.endDate}"`
      ].join(','))
    )
  );

  // Add BOM for Excel compatibility (UTF-8 with BOM)
  const bom = '\uFEFF';
  return bom + [CSV_HEADER.join(','), ...rows].join('\n');
};

export const importFromCSV = (csvText: string): School[] => {
  const lines = csvText.split(/\r?\n/);
  const schoolsMap = new Map<string, School>();
  
  // Skip header if present
  const startIndex = lines[0]?.includes('SchoolID') ? 1 : 0;

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Remove quotes and split
    const cols = line.split(',').map(c => c.replace(/^"|"$/g, ''));
    if (cols.length < 9) continue;

    const [sId, sName, cId, cName, eId, eType, eName, sDate, eDate] = cols;

    // Get or Create School
    if (!schoolsMap.has(sId)) {
        schoolsMap.set(sId, { id: sId, name: sName, courses: [] });
    }
    const school = schoolsMap.get(sId)!;

    // Get or Create Course
    let course = school.courses.find(c => c.id === cId);
    if (!course) {
        course = { id: cId, name: cName, events: [] };
        school.courses.push(course);
    }

    // Add Event
    // Validate EventType
    const type = Object.values(EventType).includes(eType as EventType) ? (eType as EventType) : EventType.OTHER;
    
    course.events.push({
        id: eId,
        type: type,
        name: eName,
        startDate: sDate,
        endDate: eDate
    });
  }

  return Array.from(schoolsMap.values());
};
