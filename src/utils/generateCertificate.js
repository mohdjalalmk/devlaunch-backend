const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const generateCertificateBuffer = async ({ name, courseTitle }) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        layout: "landscape",
        margin: 50,
      });
      const buffers = [];
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => resolve(Buffer.concat(buffers)));

      // Border
      doc
        .rect(20, 20, doc.page.width - 40, doc.page.height - 40)
        .lineWidth(4)
        .strokeColor("#f59e0b")
        .stroke();

      // Title
      doc.moveDown(2);
      doc
        .fontSize(28)
        .fillColor("#000")
        .font("Helvetica-Bold")
        .text("CERTIFICATE OF COMPLETION", {
          align: "center",
        });

      doc.moveDown(1.2);

      // Subtitle
      doc
        .fontSize(16)
        .font("Helvetica")
        .text("This is to certify that", { align: "center" });

      doc.moveDown(0.7);

      // Name
      doc.fontSize(24).font("Helvetica-Bold").text(name, { align: "center" });

      // Underline (dashed)
      const nameWidth = doc.widthOfString(name) + 10;
      const nameX = (doc.page.width - nameWidth) / 2;
      const nameY = doc.y + 3;

      doc
        .moveTo(nameX, nameY)
        .lineTo(nameX + nameWidth, nameY)
        .dash(4, { space: 2 })
        .strokeColor("#f59e0b")
        .stroke()
        .undash();

      doc.moveDown(1.2);

      // Course info
      doc
        .fontSize(14)
        .font("Helvetica")
        .text("has successfully completed the course", { align: "center" });

      doc.moveDown(0.7);

      doc
        .fontSize(20)
        .font("Helvetica-Bold")
        .text(courseTitle, { align: "center" });

      doc.moveDown(2);

      const logoPath = path.join(__dirname, "../assets/devlaunch.png");
      const logoWidth = 200;
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, (doc.page.width - logoWidth) / 2, doc.y, {
          width: logoWidth,
        });
        doc.moveDown(1.5);
      }

      // Footer: date left, signature image right, powered by center
      const bottomY = doc.page.height - 100;
      const date = new Date().toLocaleDateString();

      // Date text on left
      doc.fontSize(12).font("Helvetica").text(`Date: ${date}`, 60, bottomY);

      // Signature image on right
      const signaturePath = path.join(__dirname, "../assets/sign.png");
      const signatureWidth = 100;
      if (fs.existsSync(signaturePath)) {
        doc.image(
          signaturePath,
          doc.page.width - signatureWidth - 40,
          bottomY - 60,
          { width: signatureWidth }
        );
      } else {
        doc
          .fontSize(12)
          .font("Helvetica")
          .text("Signature", doc.page.width - 140, bottomY);
      }

      doc
        .fontSize(10)
        .fillColor("#666")
        .text("Powered by DevLaunch", 0, bottomY + 30, { align: "center" });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = { generateCertificateBuffer };
