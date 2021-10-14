import { registerAs } from "@nestjs/config";

export default registerAs('calendar', () => ({
  url: process.env.CALENDAR_URL,
  key: process.env.CALENDAR_KEY,
  employeeId: process.env.CALENDAR_EMPLOYEE_ID,
  studentId: process.env.CALENDAR_STUDENT_ID,
}));