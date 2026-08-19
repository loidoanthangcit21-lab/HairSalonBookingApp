package demo.booking.hairsalon.controller;

import demo.booking.hairsalon.common.ApiResponse;
import demo.booking.hairsalon.model.dto.request.ExpertRequest;
import demo.booking.hairsalon.model.dto.response.ExpertResponse;
import demo.booking.hairsalon.service.ExpertService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/experts")
@PreAuthorize("hasRole('ADMIN')")
public class AdminExpertController {

    private final ExpertService expertService;

    @GetMapping
    public ApiResponse<List<ExpertResponse>> getAllExpertsAdmin() {
        return ApiResponse.success(expertService.getAllExpertsAdmin(), "Experts retrieved successfully", null);
    }

    @PostMapping
    public ApiResponse<ExpertResponse> createExpert(@Valid @RequestBody ExpertRequest request) {
        return ApiResponse.success(expertService.createExpert(request), "Expert created successfully", null);
    }

    @PutMapping("/{id}")
    public ApiResponse<ExpertResponse> updateExpert(@PathVariable UUID id, @Valid @RequestBody ExpertRequest request) {
        return ApiResponse.success(expertService.updateExpert(id, request), "Expert updated successfully", null);
    }

    @PatchMapping("/{id}/toggle-active")
    public ApiResponse<ExpertResponse> toggleExpertActive(@PathVariable UUID id) {
        return ApiResponse.success(expertService.toggleExpertActive(id), "Expert status toggled successfully", null);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteExpert(@PathVariable UUID id) {
        expertService.deleteExpert(id);
        return ApiResponse.success(null, "Expert deleted successfully", null);
    }
}
