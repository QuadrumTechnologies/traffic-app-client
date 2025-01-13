const generateBaseHTML = function (content) {
  return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>${content.title}</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                    margin: 0;
                    padding: 0;
                    color: #333;
                }
                img {
                    width: 80px;
                    height: 90px;
                }
                .container {
                    background-color: #fff;
                    margin: 50px auto;
                    padding: 20px;
                    border-radius: 10px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                    max-width: 600px;
                }
                .header {
                    text-align: center;
                    border-bottom: 1px solid #ddd;
                    padding-bottom: 20px;
                }
                .header img {
                    max-width: 150px;
                }
                .content {
                    padding: 20px;
                }
                .button {
                    display: inline-block;
                    padding: 15px 25px;
                    margin: 20px 0;
                    background-color: #181a40;
                    color: #fff;
                    text-decoration: none;
                    border-radius: 5px;
                    text-align: center;
                }
                .button:hover {
                    background-color: #181a40;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <img src="https://schooltry-tertiary-2.s3.eu-west-1.amazonaws.com/institutionLogos/Unilorin_6500995e76d79.jpeg" alt="Unilorin">
                </div>
                <div class="content">
                    <h1>${content.heading}</h1>
                    <p>Hello ${content.role ? content.role : ""} ${
    content.firstName
  },</p>
                    <p>${content.body}</p>
                    ${content.table ? content.table : ""}
                    ${
                      content.button
                        ? `<a href="${content.buttonLink}" class="button">${content.buttonText}</a>`
                        : ""
                    }
                    ${content.footer ? `<p>${content.footer}</p>` : ""}
                    <p>Thank you,</p>
                    <p>Attendance System</p>
                </div>
            </div>
        </body>
        </html>
      `;
};

const generateStudentCourseReportHTML = function (
  studentName,
  courseCode,
  attendancePercentage
) {
  let bodyText;

  if (attendancePercentage >= 75) {
    bodyText = `Congratulations! You are able to sit for the exam for this course as you attended ${attendancePercentage}% of the classes for the course ${courseCode}.`;
  } else {
    bodyText = `You attended ${attendancePercentage}% of the classes for the course ${courseCode}. Unfortunately, you need to attend at least 75% of the classes to sit for the exam.`;
  }

  return generateBaseHTML({
    title: `${courseCode} Attendance Report`,
    heading: "Course Report",
    firstName: studentName,
    body: bodyText,
  });
};

const generateLecturerReportHTML = function (
  recipientName,
  role,
  courseCode,
  studentDetails
) {
  const tableRows = studentDetails
    .map(
      (student) =>
        `<tr><td>${student.student.name}</td><td>${student.student.matricNo}</td><td>${student.attendancePercentage}</td></tr>`
    )
    .join("");

  const tableHTML = `
          <table border="1" cellpadding="10" cellspacing="0">
            <thead>
              <tr>
                <th>Name</th>
                <th>Matric No</th>
                <th>Attendance Percentage</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        `;

  const bodyText = `Find attached an Excel sheet comprising of the attendance report of the course.`;

  return generateBaseHTML({
    title: `${courseCode} Attendance Report`,
    heading: "Course Report",
    firstName: recipientName,
    role: role,
    body: bodyText,
    table: tableHTML,
  });
};

export { generateStudentCourseReportHTML, generateLecturerReportHTML };
