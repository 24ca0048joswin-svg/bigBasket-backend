const PDFDocument = require('pdfkit');
const fs = require('fs');

function generateInvoice(invoiceData, outputPath = 'invoice.pdf') {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({
            size: 'A4',
            margin: 50,
        });

        const stream = fs.createWriteStream(outputPath);
        doc.pipe(stream);

        const primaryColor = '#007A8A';
        const secondaryColor = '#333333';

        try {
            doc.image('logo.png', 50, 40, { width: 100, height: 100 });
        } catch (err) {
            console.warn("Logo file not found. Ensure logo.png is in the same directory.");
        }

        doc
            .fillColor(primaryColor)
            .fontSize(32)
            .font('Helvetica-Bold')
            .text('Invoice', 50, 150);


        doc
            .fillColor(secondaryColor)
            .fontSize(14)
            .font('Helvetica')
            .text('Big Basket', 350, 50, { align: 'right' })
            .fontSize(10)
            .text('Near City Center', 350, 70, { align: 'right' })
            .text('Mangalore', 350, 82, { align: 'right' })
            .text('India', 350, 94, { align: 'right' })
            .text('574239', 350, 106, { align: 'right' });


        doc
            .moveTo(50, 200)
            .lineTo(550, 200)
            .lineWidth(1)
            .strokeColor('#CCCCCC')
            .stroke();


        const billingY = 220;

        doc
            .fillColor(secondaryColor)
            .fontSize(9)
            .font('Helvetica-Bold')
            .text('BILL TO:', 50, billingY)
            .fontSize(12)
            .text(invoiceData.client.name, 50, billingY + 15)
            .fontSize(10)
            .font('Helvetica')
            .text(invoiceData.client.address, 50, billingY + 32)
            .text(invoiceData.client.city, 50, billingY + 44)
            .text(invoiceData.client.country, 50, billingY + 56)
            .text(invoiceData.client.postal, 50, billingY + 68);

        const metaX = 400;
        doc
            .fontSize(9)
            .font('Helvetica-Bold')
            .text('INVOICE #', metaX, billingY, { align: 'right' })
            .font('Helvetica')
            .text(invoiceData.invoiceNumber, metaX, billingY + 12, { align: 'right' })

            .font('Helvetica-Bold')
            .text('DATE', metaX, billingY + 32, { align: 'right' })
            .font('Helvetica')
            .text(invoiceData.date, metaX, billingY + 44, { align: 'right' })

            .font('Helvetica-Bold')
            .text('INVOICE DUE DATE', metaX, billingY + 64, { align: 'right' })
            .font('Helvetica')
            .text(invoiceData.dueDate, metaX, billingY + 76, { align: 'right' });


        const lineBeforeTableY = 320;
        doc
            .moveTo(50, lineBeforeTableY)
            .lineTo(550, lineBeforeTableY)
            .lineWidth(1)
            .strokeColor('#CCCCCC')
            .stroke();

        const tableTop = 340;

        doc
            .fillColor(secondaryColor)
            .fontSize(10)
            .font('Helvetica-Bold')
            .text('ITEM NAME', 50, tableTop)
            .text('QTY', 280, tableTop, { width: 50, align: 'right' })
            .text('PRICE', 350, tableTop, { width: 70, align: 'right' })
            .text('TAX', 440, tableTop, { width: 40, align: 'right' })
            .text('AMOUNT', 500, tableTop, { width: 50, align: 'right' });

        let yPosition = tableTop + 25;

        invoiceData.items.forEach((item) => {
            const amount = item.quantity * item.price * (1 + item.tax / 100);

            doc
                .font('Helvetica')
                .fontSize(10)
                .text(item.name, 50, yPosition)
                .text(item.quantity.toString(), 280, yPosition, { width: 50, align: 'right' })
                .text(`${item.price.toFixed(2)}`, 350, yPosition, { width: 70, align: 'right' })
                .text(`${item.tax}`, 440, yPosition, { width: 40, align: 'right' })
                .text(`${amount.toFixed(2)}`, 500, yPosition, { width: 50, align: 'right' });

            yPosition += 25;
        });


        const total = invoiceData.items.reduce((sum, item) => {
            return sum + item.quantity * item.price * (1 + item.tax / 100);
        }, 0);

        doc
            .moveTo(400, yPosition + 10)
            .lineTo(550, yPosition + 10)
            .strokeColor('#CCCCCC')
            .stroke();

        doc
            .font('Helvetica-Bold')
            .fontSize(12)
            .text('TOTAL', 400, yPosition + 25)
            .text(`Rs.${total.toFixed(2)}`, 480, yPosition + 25, { width: 70, align: 'right' });

         doc.end();
        stream.on('finish', () => {
            resolve(outputPath);
        });

        stream.on('error', (err) => {
            reject(err);
        });
    });
}

module.exports = generateInvoice;

