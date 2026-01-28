package com.moneytracker.service;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;
import com.moneytracker.dto.ReportResponse;
import com.moneytracker.dto.TransactionResponse;
import com.opencsv.CSVWriter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.OutputStreamWriter;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExportService {

    private final ReportService reportService;
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    public byte[] exportToPdf(String type, Integer month, Integer year) throws DocumentException {
        ReportResponse report = getReportByType(type, month, year);

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4);
        PdfWriter.getInstance(document, baos);
        document.open();

        // Title
        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, BaseColor.DARK_GRAY);
        Paragraph title = new Paragraph(getReportTitle(type, report), titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        title.setSpacingAfter(20);
        document.add(title);

        // Summary Section
        Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, BaseColor.DARK_GRAY);
        Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 11, BaseColor.BLACK);

        Paragraph summary = new Paragraph();
        summary.add(new Chunk("Report Period: ", headerFont));
        summary.add(new Chunk(report.getStartDate().format(DATE_FORMAT) + " to " +
                report.getEndDate().format(DATE_FORMAT) + "\n", normalFont));
        summary.add(new Chunk("Total Income: ", headerFont));
        summary.add(new Chunk("$" + report.getTotalIncome().toString() + "\n", normalFont));
        summary.add(new Chunk("Total Expense: ", headerFont));
        summary.add(new Chunk("$" + report.getTotalExpense().toString() + "\n", normalFont));
        summary.add(new Chunk("Net Balance: ", headerFont));
        summary.add(new Chunk("$" + report.getNetBalance().toString() + "\n", normalFont));
        summary.add(new Chunk("Transaction Count: ", headerFont));
        summary.add(new Chunk(String.valueOf(report.getTransactionCount()), normalFont));
        summary.setSpacingAfter(20);
        document.add(summary);

        // Transactions Table
        if (!report.getTransactions().isEmpty()) {
            Paragraph tableHeader = new Paragraph("Transactions", headerFont);
            tableHeader.setSpacingAfter(10);
            document.add(tableHeader);

            PdfPTable table = new PdfPTable(5);
            table.setWidthPercentage(100);
            table.setWidths(new float[] { 2, 2, 2, 1.5f, 3 });

            // Table headers
            addTableHeader(table, "Date");
            addTableHeader(table, "Category");
            addTableHeader(table, "Amount");
            addTableHeader(table, "Type");
            addTableHeader(table, "Notes");

            // Table data
            for (TransactionResponse tx : report.getTransactions()) {
                table.addCell(createCell(tx.getTransactionDate().format(DATE_FORMAT)));
                table.addCell(createCell(tx.getCategoryName()));
                table.addCell(createCell("$" + tx.getAmount().toString()));
                table.addCell(createCell(tx.getType().toString()));
                table.addCell(createCell(tx.getNotes() != null ? tx.getNotes() : ""));
            }

            document.add(table);
        }

        document.close();
        return baos.toByteArray();
    }

    public byte[] exportToCsv(String type, Integer month, Integer year) throws Exception {
        ReportResponse report = getReportByType(type, month, year);

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        CSVWriter writer = new CSVWriter(new OutputStreamWriter(baos, StandardCharsets.UTF_8));

        // Header row
        String[] header = { "Date", "Category", "Amount", "Type", "Notes" };
        writer.writeNext(header);

        // Data rows
        for (TransactionResponse tx : report.getTransactions()) {
            String[] row = {
                    tx.getTransactionDate().format(DATE_FORMAT),
                    tx.getCategoryName(),
                    tx.getAmount().toString(),
                    tx.getType().toString(),
                    tx.getNotes() != null ? tx.getNotes() : ""
            };
            writer.writeNext(row);
        }

        // Summary row
        writer.writeNext(new String[] {});
        writer.writeNext(new String[] { "Summary" });
        writer.writeNext(new String[] { "Total Income", report.getTotalIncome().toString() });
        writer.writeNext(new String[] { "Total Expense", report.getTotalExpense().toString() });
        writer.writeNext(new String[] { "Net Balance", report.getNetBalance().toString() });

        writer.close();
        return baos.toByteArray();
    }

    private ReportResponse getReportByType(String type, Integer month, Integer year) {
        return switch (type.toLowerCase()) {
            case "daily" -> reportService.getDailyReport(LocalDate.now());
            case "weekly" -> reportService.getWeeklyReport();
            case "monthly" -> reportService.getMonthlyReport(month, year);
            default -> reportService.getMonthlyReport(month, year);
        };
    }

    private String getReportTitle(String type, ReportResponse report) {
        return switch (type.toLowerCase()) {
            case "daily" -> "Daily Report - " + report.getStartDate().format(DATE_FORMAT);
            case "weekly" -> "Weekly Report";
            case "monthly" -> "Monthly Report - " + report.getStartDate().getMonth().toString() + " "
                    + report.getStartDate().getYear();
            default -> "Financial Report";
        };
    }

    private void addTableHeader(PdfPTable table, String text) {
        PdfPCell cell = new PdfPCell(new Phrase(text,
                FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, BaseColor.WHITE)));
        cell.setBackgroundColor(new BaseColor(66, 133, 244));
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setPadding(8);
        table.addCell(cell);
    }

    private PdfPCell createCell(String text) {
        PdfPCell cell = new PdfPCell(new Phrase(text,
                FontFactory.getFont(FontFactory.HELVETICA, 9, BaseColor.BLACK)));
        cell.setPadding(5);
        return cell;
    }
}
