package demo.booking.hairsalon.controller;

import demo.booking.hairsalon.common.ApiResponse;
import demo.booking.hairsalon.model.dto.request.ServiceRequest;
import demo.booking.hairsalon.model.dto.response.ServiceResponse;
import demo.booking.hairsalon.service.ServiceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/services")
@PreAuthorize("hasRole('ADMIN')")
public class AdminServiceController {

    private final ServiceService serviceService;

    @GetMapping
    public ApiResponse<List<ServiceResponse>> getAllServicesAdmin() {
        return ApiResponse.success(serviceService.getAllServicesAdmin(), "Services retrieved successfully", null);
    }

    @PostMapping
    public ApiResponse<ServiceResponse> createService(@Valid @RequestBody ServiceRequest request) {
        return ApiResponse.success(serviceService.createService(request), "Service created successfully", null);
    }

    @PutMapping("/{id}")
    public ApiResponse<ServiceResponse> updateService(@PathVariable UUID id, @Valid @RequestBody ServiceRequest request) {
        return ApiResponse.success(serviceService.updateService(id, request), "Service updated successfully", null);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteService(@PathVariable UUID id) {
        serviceService.deleteService(id);
        return ApiResponse.success(null, "Service deleted successfully", null);
    }
}
