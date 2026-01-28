package com.moneytracker.controller;

import com.moneytracker.service.ExportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/export")
@RequiredArgsConstructor
public class ExportController {

    private final ExportService exportService;

    @GetMapping("/pdf")
    public ResponseEntity<byte[]> exportToPdf(
            @RequestParam(defaultValue = "monthly") String type,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year) {
        try {
            byte[] pdfBytes = exportService.exportToPdf(type, month, year);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment",
                    "money-tracker-report-" + type + ".pdf");

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(pdfBytes);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/csv")
    public ResponseEntity<byte[]> exportToCsv(
            @RequestParam(defaultValue = "monthly") String type,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year) {
        try {
            byte[] csvBytes = exportService.exportToCsv(type, month, year);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("text/csv"));
            headers.setContentDispositionFormData("attachment",
                    "money-tracker-report-" + type + ".csv");

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(csvBytes);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
