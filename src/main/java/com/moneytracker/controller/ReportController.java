package com.moneytracker.controller;

import com.moneytracker.dto.CategoryAnalyticsResponse;
import com.moneytracker.dto.ReportResponse;
import com.moneytracker.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/daily")
    public ResponseEntity<ReportResponse> getDailyReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(reportService.getDailyReport(date));
    }

    @GetMapping("/weekly")
    public ResponseEntity<ReportResponse> getWeeklyReport() {
        return ResponseEntity.ok(reportService.getWeeklyReport());
    }

    @GetMapping("/monthly")
    public ResponseEntity<ReportResponse> getMonthlyReport(
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year) {
        return ResponseEntity.ok(reportService.getMonthlyReport(month, year));
    }

    @GetMapping("/category-analysis")
    public ResponseEntity<CategoryAnalyticsResponse> getCategoryAnalysis(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(reportService.getCategoryAnalysis(startDate, endDate));
    }
}
